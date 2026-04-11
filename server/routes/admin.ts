import { Router, Response } from 'express';
import { z } from "zod";
import { adminDb } from "../neon-admin";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";
import { convertTimestamp } from "../utils/timestamps";
import { validateRequest } from "../middleware/security";
import { safeError } from "../utils/error-response";
import { syncRoleClaims } from "../services/user-accounts";
import { invalidateCachedUser } from "../utils/user-cache";

const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

const router = Router();
const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'ca', 'team_member']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended', 'rejected']).optional(),
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
router.get('/users', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE);
    const search = req.query.search as string;

    let allUsers: any[];

    if (search) {
      // Full-text search requires fetching all docs; apply a reasonable cap to protect memory
      const snapshot = await (adminDb.collection("users") as any).limit(1000).get();
      const searchLower = search.toLowerCase();
      allUsers = snapshot.docs
        .map((doc: any) => {
          const data = doc.data();
          return { id: doc.id, ...data, createdAt: convertTimestamp(data.createdAt), updatedAt: convertTimestamp(data.updatedAt) };
        })
        .filter((u: any) =>
          u.firstName?.toLowerCase().includes(searchLower) ||
          u.lastName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
        );
    } else {
      // No search here to avoid loading the entire collection.
      const offset = (page - 1) * limit;
      const countSnapshot = await (adminDb.collection("users") as any).count().get();
      const total = countSnapshot.data().count;

      const snapshot = await (adminDb.collection("users") as any)
        .orderBy('createdAt', 'desc')
        .offset(offset)
        .limit(limit)
        .get();

      const paginatedUsers = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return { id: doc.id, ...data, createdAt: convertTimestamp(data.createdAt), updatedAt: convertTimestamp(data.updatedAt) };
      });

      return res.json({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        }
      });
    }

    const total = allUsers.length;
    const offset = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    return safeError(res, error, 'Failed to retrieve users.');
  }
});

// Update user role
router.patch('/users/:id/role', requireAuth, requireAdmin, validateRequest(updateUserRoleSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const userRef = adminDb.collection("users").doc(id);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates: any = { updatedAt: new Date() };
    if (role) updates.role = role;
    if (status) updates.status = status;

    await userRef.update(updates);
    if (role) {
      await syncRoleClaims(id, role);
    }
    invalidateCachedUser(id);

    res.json({
      success: true,
      message: role ? `User role updated to ${role}` : 'User updated successfully',
      user: { id, ...doc.data(), ...updates }
    });
  } catch (error) {
    return safeError(res, error, 'Failed to update role');
  }
});

// Assign a CA to a user
router.patch('/users/:id/assign-ca', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { caId } = req.body; // caId can be null to unassign

    if (caId) {
      const caDoc = await adminDb.collection("users").doc(caId).get();
      if (!caDoc.exists || (caDoc.data()?.role !== 'ca' && caDoc.data()?.role !== 'admin')) {
        return res.status(400).json({ success: false, message: 'Invalid CA. The specified user is not a CA.' });
      }
    }

    const userRef = adminDb.collection("users").doc(id);
    await userRef.update({ assignedCaId: caId || null, updatedAt: new Date() });
    invalidateCachedUser(id);
    const updatedUser = await userRef.get();

    res.json({
      success: true,
      message: caId ? 'CA assigned successfully' : 'CA unassigned successfully',
      user: { id, ...updatedUser.data() }
    });
  } catch (error) {
    return safeError(res, error, 'Failed to assign CA');
  }
});

// Delete user (soft delete)
router.delete('/users/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const auth = req.auth;
    
    if (id === auth?.userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    
    const userRef = adminDb.collection("users").doc(id);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await userRef.update({ status: 'inactive', updatedAt: new Date() });
    invalidateCachedUser(id);

    res.json({
      success: true,
      message: 'User deactivated successfully.'
    });
  } catch (error) {
    return safeError(res, error, 'Failed to deactivate user');
  }
});

// ==================== DASHBOARD STATISTICS ====================

router.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all collections in parallel instead of sequentially
    const [
      usersSnapshot,
      blogSnapshot,
      categorySnapshot,
      updatesSnapshot,
      userServicesSnapshot,
      taxReturnsSnapshot,
    ] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("blog_posts").get(),
      adminDb.collection("categories").get(),
      adminDb.collection("daily_updates").get(),
      adminDb.collection("user_services").get(),
      adminDb.collection("tax_returns").get(),
    ]);

    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    // Build O(1) lookup map — avoids repeated O(n) .find() calls below
    const userMap = new Map<string, any>(allUsers.map(u => [u.id, u]));

    const totalUsers = allUsers.length;
    const caUsers = allUsers.filter(u => u.role === 'ca');
    const adminUsers = allUsers.filter(u => u.role === 'admin');
    const regularUsers = allUsers.filter(u => u.role === 'user' || !u.role);

    // Calculate Pending Work and Revenue
    const pendingServices = userServicesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .filter(s => s.status !== 'completed' && s.status !== 'cancelled');

    const pendingTaxReturns = taxReturnsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .filter(r => r.status !== 'filed' && r.status !== 'completed');

    const pendingWorkList = [
      ...pendingServices.map(s => ({
        id: s.id,
        type: 'service',
        title: s.serviceName || 'Custom Service',
        userId: s.userId,
        userName: userMap.get(s.userId)?.firstName || 'Unknown',
        assignedCaId: s.assignedCaId,
        assignedCaName: userMap.get(s.assignedCaId)?.firstName || 'Unassigned',
        status: s.status,
        price: parseFloat(s.price) || 0,
        createdAt: s.createdAt?.toDate?.() || s.createdAt
      })),
      ...pendingTaxReturns.map(r => {
        const owner = userMap.get(r.userId);
        return {
          id: r.id,
          type: 'tax_return',
          title: `ITR Filing (${r.filingType || 'General'})`,
          userId: r.userId,
          userName: owner?.firstName || 'Unknown',
          assignedCaId: owner?.assignedCaId,
          assignedCaName: userMap.get(owner?.assignedCaId)?.firstName || 'Unassigned',
          status: r.status,
          price: 1499, // Default CA Expert price for revenue projection
          createdAt: r.createdAt?.toDate?.() || r.createdAt
        };
      })
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pendingRevenue = pendingWorkList.reduce((sum, item) => sum + item.price, 0);

    // Mock trend for now
    const recentActivity = allUsers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        action: `User registered: ${u.email}`,
        user: `${u.firstName || 'New'} ${u.lastName || 'User'}`,
        timestamp: u.createdAt
      }));

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          caCount: caUsers.length,
          adminCount: adminUsers.length,
          regularCount: regularUsers.length,
          growthPercent: 15.0
        },
        blogs: {
          total: blogSnapshot.size,
          categories: categorySnapshot.size,
          updates: updatesSnapshot.size
        },
        revenue: {
          total: 125400,
          pending: pendingRevenue,
          growthPercent: 12.5
        },
        services: {
          total: userServicesSnapshot.size,
          active: pendingWorkList.length,
          popular: ['ITR Filing', 'GST Registration', 'CA Consultation']
        },
        workList: pendingWorkList.slice(0, 20),
        recentActivity: recentActivity,
        recentCalculations: []
      }
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
      error: error.message
    });
  }
});

export default router;
