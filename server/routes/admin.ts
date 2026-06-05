import { Router, Response } from 'express';
import { z } from "zod";
import { adminDb } from "../data-admin.js";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth.js";
import { convertTimestamp } from "../utils/timestamps.js";
import { validateRequest } from "../middleware/security.js";
import { safeError } from "../utils/error-response.js";
import { provisionPrivilegedUser, syncRoleClaims } from "../services/user-accounts.js";
import { syncSupabaseUserDirectory } from "../services/supabase-user-directory.js";
import { invalidateCachedUser } from "../utils/user-cache.js";
import { APP_ROLES, PRIVILEGED_APP_ROLES } from "../../shared/app-roles.js";
import { isAdminCatalogService, serializeAdminCatalogService } from "../../shared/admin-service-catalog.js";
import { allServices } from "../../client/src/data/all-services.js";

const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonth(date: Date | null, reference: Date) {
  return !!date && date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function previousMonth(reference: Date) {
  return new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
}

function growthPercent(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function amountFromRecord(record: Record<string, any>) {
  const value = record.price ?? record.paymentAmount ?? record.amount ?? record.totalAmount ?? 0;
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

const router = Router();
const optionalName = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(100).optional(),
);

const updateUserRoleSchema = z.object({
  role: z.enum(APP_ROLES).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended', 'rejected']).optional(),
});

const invitePrivilegedUserSchema = z.object({
  email: z.string().email("A valid email address is required."),
  firstName: optionalName,
  lastName: optionalName,
  role: z.enum(PRIVILEGED_APP_ROLES),
});

const optionalAdminNote = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional(),
);

const updateConsultationRequestSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "closed"]).optional(),
  internalNote: optionalAdminNote,
});

const updatePaymentLinkRequestSchema = z.object({
  status: z.enum(["requested", "link_sent", "paid", "cancelled"]).optional(),
  adminNote: optionalAdminNote,
  paymentLink: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().url().max(1000).optional(),
  ),
});

function normalizeRequestRecord(doc: any): Record<string, any> & { id: string; createdAt: unknown; updatedAt: unknown } {
  const data = doc.data() as Record<string, any>;
  return {
    id: doc.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
}

async function listRequestRecords(
  collection: "consultation_requests" | "payment_link_requests",
  status?: string,
  limit = 100,
) {
  let query = adminDb.collection(collection) as any;
  if (status) query = query.where("status", "==", status);
  query = query.orderBy("createdAt", "desc").limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map(normalizeRequestRecord);
}

export function parseRequestLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 50;
  return Math.min(API_CONFIG.MAX_PAGE_SIZE, Math.max(1, Math.floor(parsed)));
}

async function appendAdminAudit(req: AuthRequest, action: string, metadata: Record<string, any>) {
  await adminDb.collection("audit_logs").doc().set({
    userId: req.auth?.userId ?? null,
    action,
    category: "admin",
    status: "success",
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

router.get("/services", requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const requests = await adminDb.collection("user_services").limit(1000).get();
    const bookings = new Map<string, number>();
    requests.docs.forEach((doc: any) => {
      const serviceId = String(doc.data()?.serviceId || "");
      if (serviceId) bookings.set(serviceId, (bookings.get(serviceId) || 0) + 1);
    });

    res.json(
      allServices
        .filter(isAdminCatalogService)
        .map((service) => serializeAdminCatalogService(service, bookings.get(service.id) || 0)),
    );
  } catch (error) {
    return safeError(res, error, "Failed to load service catalog");
  }
});

// ==================== USER MANAGEMENT ====================

router.get("/requests/consultations", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" && req.query.status !== "all" ? req.query.status : undefined;
    const limit = parseRequestLimit(req.query.limit);
    const requests = await listRequestRecords("consultation_requests", status, limit);

    res.json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    return safeError(res, error, "Failed to load consultation requests");
  }
});

router.patch(
  "/requests/consultations/:id",
  requireAuth,
  requireAdmin,
  validateRequest(updateConsultationRequestSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const ref = adminDb.collection("consultation_requests").doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) {
        return res.status(404).json({ success: false, message: "Consultation request not found" });
      }

      const updates = updateConsultationRequestSchema.parse(req.body);
      const payload = {
        ...updates,
        updatedAt: new Date(),
        updatedBy: req.auth?.userId ?? null,
      };

      await ref.update(payload);
      await appendAdminAudit(req, "consultation_request_updated", {
        requestId: req.params.id,
        status: updates.status ?? null,
      });

      res.json({ success: true, request: normalizeRequestRecord(await ref.get()) });
    } catch (error) {
      return safeError(res, error, "Failed to update consultation request");
    }
  },
);

router.get("/requests/payment-links", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" && req.query.status !== "all" ? req.query.status : undefined;
    const limit = parseRequestLimit(req.query.limit);
    const requests = await listRequestRecords("payment_link_requests", status, limit);

    res.json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    return safeError(res, error, "Failed to load payment link requests");
  }
});

router.patch(
  "/requests/payment-links/:id",
  requireAuth,
  requireAdmin,
  validateRequest(updatePaymentLinkRequestSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const ref = adminDb.collection("payment_link_requests").doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) {
        return res.status(404).json({ success: false, message: "Payment link request not found" });
      }

      const current = doc.data() as Record<string, any>;
      const updates = updatePaymentLinkRequestSchema.parse(req.body);
      const payload = {
        ...updates,
        updatedAt: new Date(),
        updatedBy: req.auth?.userId ?? null,
      };

      await ref.update(payload);

      if (current.userServiceId) {
        const serviceRef = adminDb.collection("user_services").doc(current.userServiceId);
        const serviceDoc = await serviceRef.get();
        if (serviceDoc.exists) {
          const service = serviceDoc.data() as Record<string, any>;
          const metadata = {
            ...(service.metadata || {}),
            ...(updates.adminNote ? { paymentAdminNote: updates.adminNote } : {}),
            ...(updates.paymentLink ? { paymentLink: updates.paymentLink, paymentLinkSharedAt: new Date() } : {}),
          };
          const serviceUpdates: Record<string, any> = { metadata, updatedAt: new Date() };
          if (updates.status === "link_sent") serviceUpdates.paymentStatus = "link_sent";
          if (updates.status === "paid") serviceUpdates.paymentStatus = "paid";
          if (
            updates.status === "cancelled" &&
            ["link_requested", "link_sent"].includes(service.paymentStatus)
          ) {
            serviceUpdates.paymentStatus = "pending";
          }
          await serviceRef.update(serviceUpdates);
        }
      }

      await appendAdminAudit(req, "payment_link_request_updated", {
        requestId: req.params.id,
        userServiceId: current.userServiceId ?? null,
        status: updates.status ?? null,
      });

      res.json({ success: true, request: normalizeRequestRecord(await ref.get()) });
    } catch (error) {
      return safeError(res, error, "Failed to update payment link request");
    }
  },
);

// ==================== USER SERVICE CASES ====================

router.get("/user-services", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" && req.query.status !== "all" ? req.query.status : undefined;
    const limit = parseRequestLimit(req.query.limit ?? "100");

    let query = adminDb.collection("user_services") as any;
    if (status) query = query.where("status", "==", status);
    query = query.orderBy("createdAt", "desc").limit(limit);
    const snapshot = await query.get();

    // Batch-fetch only the users referenced by the limited result set in parallel.
    const userIds = Array.from(new Set(
      snapshot.docs.map((doc: any) => (doc.data() as any).userId).filter((id: any): id is string => !!id),
    )) as string[];
    const userMap = new Map<string, any>();
    if (userIds.length) {
      const userDocs = await Promise.all(
        userIds.map(id => adminDb.collection("users").doc(id).get()),
      );
      userDocs.forEach(doc => doc.exists && userMap.set(doc.id, doc.data()));
    }

    const cases = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
        userName: userMap.get(data.userId)?.firstName || "Customer",
        userEmail: userMap.get(data.userId)?.email || null,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });

    res.json({ success: true, cases, total: cases.length });
  } catch (error) {
    return safeError(res, error, "Failed to load user service cases");
  }
});

const updateUserServiceCaseSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  assignedCaId: z.string().trim().max(128).nullable().optional(),
  adminNote: z.string().trim().max(2000).optional(),
});

router.patch(
  "/user-services/:id",
  requireAuth,
  requireAdmin,
  validateRequest(updateUserServiceCaseSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const ref = adminDb.collection("user_services").doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ success: false, message: "Service case not found" });

      const updates = updateUserServiceCaseSchema.parse(req.body);
      const payload: Record<string, any> = { ...updates, updatedAt: new Date() };
      if (updates.adminNote !== undefined) {
        const existing = (doc.data() as any).metadata || {};
        payload.metadata = { ...existing, adminNote: updates.adminNote };
        delete payload.adminNote;
      }

      await ref.update(payload);
      await appendAdminAudit(req, "user_service_case_updated", { caseId: req.params.id, status: updates.status ?? null });
      res.json({ success: true });
    } catch (error) {
      return safeError(res, error, "Failed to update service case");
    }
  },
);

router.post(
  "/invitations",
  requireAuth,
  requireAdmin,
  validateRequest(invitePrivilegedUserSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await provisionPrivilegedUser({
        ...req.body,
        invitedBy: req.auth?.userId,
      });

      if (result.mode === "promoted" && result.supabaseUserId) {
        invalidateCachedUser(result.supabaseUserId);
      }

      await adminDb.collection("audit_logs").doc().set({
        userId: req.auth?.userId ?? null,
        action: result.mode === "promoted" ? "admin_user_promoted" : "admin_invitation_sent",
        category: "admin",
        status: "success",
        metadata: {
          email: req.body.email,
          role: req.body.role,
          mode: result.mode,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(result.mode === "promoted" ? 200 : 201).json({
        success: true,
        message:
          result.mode === "promoted"
            ? "Existing Supabase user promoted successfully."
            : "Supabase invitation sent successfully.",
        data: result,
      });
    } catch (error) {
      return safeError(res, error, "Failed to provision admin access.");
    }
  },
);

// Get all users with pagination and filtering
router.get('/users', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE);
    const search = req.query.search as string;
    const sync = await syncSupabaseUserDirectory();

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
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
          sync,
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
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        sync,
      }
    });
  } catch (error) {
    return safeError(res, error, 'Failed to retrieve users.');
  }
});

router.post('/users/sync', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const sync = await syncSupabaseUserDirectory();
  res.json({
    success: sync.status !== "error",
    data: { sync },
    message:
      sync.status === "synced"
        ? "User directory synced with Supabase Auth."
        : sync.status === "not_configured"
          ? "Supabase user directory sync is not configured."
          : "Supabase user directory sync failed.",
  });
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

// Process-local cache for the admin dashboard payload. /stats scans six full collections
// and computes monthly aggregates, so the cost is identical for every admin viewer. A short
// TTL means data still feels live (manual Refresh button or normal navigation triggers a
// fresh fetch after 60s) while collapsing the hot-path read load.
const STATS_CACHE_TTL_MS = 60_000;
let cachedStatsPayload: { generatedAt: number; payload: Record<string, any> } | null = null;

function invalidateStatsCache() {
  cachedStatsPayload = null;
}

router.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.query.refresh === "1") invalidateStatsCache();
    if (cachedStatsPayload && Date.now() - cachedStatsPayload.generatedAt < STATS_CACHE_TTL_MS) {
      res.set("X-Cache", "HIT");
      return res.json(cachedStatsPayload.payload);
    }

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
    // Build O(1) lookup map to avoid repeated O(n) .find() calls below.
    const userMap = new Map<string, any>(allUsers.map(u => [u.id, u]));

    const now = new Date();
    const lastMonth = previousMonth(now);
    const totalUsers = allUsers.length;
    const caUsers = allUsers.filter(u => u.role === 'ca');
    const adminUsers = allUsers.filter(u => u.role === 'admin');
    const regularUsers = allUsers.filter(u => u.role === 'user' || !u.role);
    const activeUsers = allUsers.filter(u => String(u.status || "active").toLowerCase() === "active");
    const inactiveUsers = allUsers.filter(u => String(u.status || "").toLowerCase() === "inactive");
    const newUsersThisMonth = allUsers.filter(u => isSameMonth(toDate(u.createdAt), now)).length;
    const newUsersPreviousMonth = allUsers.filter(u => isSameMonth(toDate(u.createdAt), lastMonth)).length;
    const userGrowthPercent = growthPercent(newUsersThisMonth, newUsersPreviousMonth);

    // Calculate Pending Work and Revenue
    const allServices = userServicesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }));
    const pendingServices = allServices
      .filter(s => s.status !== 'completed' && s.status !== 'cancelled');

    const pendingTaxReturns = taxReturnsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .filter(r => r.status !== 'filed' && r.status !== 'completed');

    const pendingWorkList = [
      ...pendingServices.map(s => ({
        id: s.id,
        type: 'service',
        title: s.serviceTitle || s.serviceName || 'Custom Service',
        userId: s.userId,
        userName: userMap.get(s.userId)?.firstName || 'Unknown',
        assignedCaId: s.assignedCaId,
        assignedCaName: userMap.get(s.assignedCaId)?.firstName || 'Unassigned',
        status: s.status,
        price: amountFromRecord(s),
        createdAt: toDate(s.createdAt)?.toISOString() || s.createdAt
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
          price: amountFromRecord(r),
          createdAt: toDate(r.createdAt)?.toISOString() || r.createdAt
        };
      })
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pendingRevenue = pendingWorkList.reduce((sum, item) => sum + item.price, 0);
    const revenueTotal = allServices.reduce((sum, service) => sum + amountFromRecord(service), 0);
    const revenueThisMonth = allServices
      .filter((service) => isSameMonth(toDate(service.createdAt), now))
      .reduce((sum, service) => sum + amountFromRecord(service), 0);
    const revenuePreviousMonth = allServices
      .filter((service) => isSameMonth(toDate(service.createdAt), lastMonth))
      .reduce((sum, service) => sum + amountFromRecord(service), 0);
    const serviceFrequency = new Map<string, number>();
    allServices.forEach((service) => {
      const name = service.serviceTitle || service.serviceName || service.type || "Custom Service";
      serviceFrequency.set(name, (serviceFrequency.get(name) || 0) + 1);
    });
    const popularServices = Array.from(serviceFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const recentActivity = allUsers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        action: `User registered: ${u.email}`,
        user: `${u.firstName || 'New'} ${u.lastName || 'User'}`,
        timestamp: u.createdAt
      }));

    const payload = {
      success: true,
      data: {
        users: {
          total: totalUsers,
          caCount: caUsers.length,
          adminCount: adminUsers.length,
          regularCount: regularUsers.length,
          active: activeUsers.length,
          inactive: inactiveUsers.length,
          newThisMonth: newUsersThisMonth,
          growthPercent: userGrowthPercent
        },
        calculations: {
          total: taxReturnsSnapshot.size,
          thisMonth: pendingTaxReturns.filter((item) => isSameMonth(toDate(item.createdAt), now)).length,
          saved: pendingTaxReturns.filter((item) => String(item.status || "").toLowerCase() === "draft").length,
          trend: "stable"
        },
        blogs: {
          total: blogSnapshot.size,
          categories: categorySnapshot.size,
          updates: updatesSnapshot.size
        },
        revenue: {
          total: revenueTotal,
          pending: pendingRevenue,
          thisMonth: revenueThisMonth,
          growthPercent: growthPercent(revenueThisMonth, revenuePreviousMonth)
        },
        services: {
          total: userServicesSnapshot.size,
          active: pendingWorkList.length,
          popular: popularServices
        },
        systemHealth: {
          status: "healthy",
          database: "connected",
          uptime: 100,
          lastCheck: new Date().toISOString()
        },
        workList: pendingWorkList.slice(0, 20),
        recentActivity: recentActivity,
        recentCalculations: []
      }
    };
    cachedStatsPayload = { generatedAt: Date.now(), payload };
    res.set("X-Cache", "MISS");
    res.json(payload);
  } catch (error) {
    return safeError(res, error, "Failed to retrieve dashboard statistics.");
  }
});

export default router;
