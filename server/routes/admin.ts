import { Router, Request, Response } from 'express';
import { db as drizzleDb } from "../db.js";
import { users, blogPosts, categories, dailyUpdates } from "../../shared/schema.js";
import { sql, eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { getAuth } from "@clerk/express";

const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

// Stub function to replace getDatabase() - returns mock database object
function getDatabase() {
  return {
    get: async (_query?: string, _params?: any[]) => null,
    all: async (_query?: string, _params?: any[]) => [],
    run: async (_query?: string, _params?: any[]) => ({ lastID: Math.floor(Math.random() * 1000) + 100 })
  };
}

// Mock data storage (in-memory only)
const mockData = {
  users: [],
  calculations: [],
  documents: []
};

const router = Router();

// Create a type that extends Request (without auth requirements)
type AuthRequest = Request;

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    
    const search = req.query.search as string;
    
    let query = drizzleDb.select().from(users);

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = drizzleDb.select().from(users)
        .where(sql`LOWER(${users.firstName}) LIKE ${searchLower} OR LOWER(${users.lastName}) LIKE ${searchLower} OR LOWER(${users.email}) LIKE ${searchLower}`) as any;
    }
    
    const allUsers = await query;
    const paginatedUsers = allUsers.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: allUsers.length,
          pages: Math.ceil(allUsers.length / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      error: error.message
    });
  }
});

// Update user role
router.patch('/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'ca', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const updatedUser = await drizzleDb.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser[0]
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update role', error: error.message });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself (Clerk userId)
    const auth = getAuth(req);
    if (id === auth.userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    
    const deletedUser = await drizzleDb.update(users)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully.'
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate user', error: error.message });
  }
});

// ==================== TAX CALCULATION MANAGEMENT ====================

// Get all tax calculations - MOCK DATA
router.get('/tax-calculations', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    
    // Mock tax calculations data
    const mockCalculations = [
      { id: 1, user_id: 2, username: 'john.doe', email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe', financial_year: '2024-25', total_income: 800000, tax_liability: 75000, is_saved: 1, created_at: new Date().toISOString() },
      { id: 2, user_id: 3, username: 'jane.smith', email: 'jane.smith@example.com', first_name: 'Jane', last_name: 'Smith', financial_year: '2024-25', total_income: 1200000, tax_liability: 180000, is_saved: 1, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, user_id: 2, username: 'john.doe', email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe', financial_year: '2023-24', total_income: 750000, tax_liability: 60000, is_saved: 0, created_at: new Date(Date.now() - 172800000).toISOString() }
    ];
    
    let filteredCalculations = mockCalculations;
    
    // Apply filters
    if (req.query.user_id) {
      filteredCalculations = filteredCalculations.filter(c => c.user_id === parseInt(req.query.user_id as string));
    }
    
    if (req.query.financial_year) {
      filteredCalculations = filteredCalculations.filter(c => c.financial_year === req.query.financial_year);
    }
    
    if (req.query.is_saved !== undefined) {
      const saved = req.query.is_saved === 'true' ? 1 : 0;
      filteredCalculations = filteredCalculations.filter(c => c.is_saved === saved);
    }
    
    const total = filteredCalculations.length;
    const paginatedCalculations = filteredCalculations.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: {
        calculations: paginatedCalculations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Get tax calculations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tax calculations.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get tax calculation details
router.get('/tax-calculations/:id', async (req: AuthRequest, res) => {
  try {
    const calculationId = parseInt(req.params.id);
    
    if (isNaN(calculationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid calculation ID.'
      });
      return;
    }
    
    const db = getDatabase();
    const calculation = await db.get(`
      SELECT tc.*, u.username, u.email, u.first_name, u.last_name
      FROM tax_calculations tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ?
    `, [calculationId]);
    
    if (!calculation) {
      res.status(404).json({
        success: false,
        message: 'Tax calculation not found.'
      });
      return;
    }
    
    res.json({
      success: true,
      data: { calculation }
    });
  } catch (error: any) {
    console.error('Get tax calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tax calculation.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete tax calculation
router.delete('/tax-calculations/:id', async (req: AuthRequest, res) => {
  try {
    const calculationId = parseInt(req.params.id);
    
    if (isNaN(calculationId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid calculation ID.'
      });
      return;
    }
    
    const db = getDatabase();
    
    // Get calculation data for audit trail
    const calculation = await db.get('SELECT * FROM tax_calculations WHERE id = ?', [calculationId]);
    if (!calculation) {
      res.status(404).json({
        success: false,
        message: 'Tax calculation not found.'
      });
      return;
    }
    
    // Delete calculation
    await db.run('DELETE FROM tax_calculations WHERE id = ?', [calculationId]);
    
    // Log the action
    // Log the action (Clerk userId)
    const auth = getAuth(req);
    await logAuditTrail(auth.userId!, 'tax_calculation_deleted', 'tax_calculations', calculationId.toString(), 
      JSON.stringify(calculation), null);
    
    res.json({
      success: true,
      message: 'Tax calculation deleted successfully.'
    });
  } catch (error: any) {
    console.error('Delete tax calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tax calculation.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== SYSTEM SETTINGS ====================

// Get all system settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const settings = await db.all('SELECT * FROM system_settings ORDER BY setting_key');
    
    res.json({
      success: true,
      data: { settings }
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update system setting
router.put('/settings/:key', async (req: AuthRequest, res) => {
  try {
    const { key } = req.params;
    const { setting_value, setting_type, description, is_public } = req.body;
    
    const db = getDatabase();
    
    // Get current setting for audit trail
    const currentSetting = await db.get('SELECT * FROM system_settings WHERE setting_key = ?', [key]);
    if (!currentSetting) {
      res.status(404).json({
        success: false,
        message: 'Setting not found.'
      });
      return;
    }
    
    // Update setting
    await db.run(`
      UPDATE system_settings 
      SET setting_value = ?, setting_type = ?, description = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ?
    `, [setting_value, setting_type, description, is_public ? 1 : 0, key]);
    
    // Log the action
    // Log the action (Clerk userId)
    const auth = getAuth(req);
    await logAuditTrail(auth.userId!, 'setting_updated', 'system_settings', key, 
      JSON.stringify(currentSetting), JSON.stringify(req.body));
    
    res.json({
      success: true,
      message: 'Setting updated successfully.'
    });
  } catch (error: any) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== AUDIT LOGS ====================

// Get audit logs
router.get('/audit-logs', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || API_CONFIG.DEFAULT_PAGE_SIZE, API_CONFIG.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    
    // Mock audit logs data
    const mockLogs = [
      { id: 1, user_id: 1, username: 'admin', email: 'admin@example.com', action: 'user_created', resource_type: 'users', resource_id: '100', severity: 'info', timestamp: new Date().toISOString() },
      { id: 2, user_id: 1, username: 'admin', email: 'admin@example.com', action: 'user_updated', resource_type: 'users', resource_id: '2', severity: 'info', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, user_id: 2, username: 'john.doe', email: 'john.doe@example.com', action: 'calculation_created', resource_type: 'tax_calculations', resource_id: '1', severity: 'info', timestamp: new Date(Date.now() - 7200000).toISOString() }
    ];
    
    let filteredLogs = mockLogs;
    
    // Apply filters
    if (req.query.user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === parseInt(req.query.user_id as string));
    }
    
    if (req.query.action) {
      filteredLogs = filteredLogs.filter(log => log.action === req.query.action);
    }
    
    if (req.query.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === req.query.severity);
    }
    
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== DASHBOARD STATISTICS ====================

// Get dashboard statistics (comprehensive overview)
router.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Real counts from database
    const [userCount] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(users);
    const [blogCount] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(blogPosts);
    const [categoryCount] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(categories);
    const [updatesCount] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(dailyUpdates);

    // Mock data for other fields
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Mock user statistics
    const totalUsers = 1248;
    const activeUsers = 1156;
    const currentMonthUsers = 89;
    const previousMonthUsers = 76;
    const userGrowthPercent = previousMonthUsers > 0 
      ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 
      : 17.1;
    
    // Mock calculation statistics
    const totalCalculations = 5234;
    const thisMonthCalculations = 412;
    const savedCalculations = 1234;
    
    // Mock recent calculations trend (last 7 days)
    const recentCalculations = [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: 45 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: 52 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: 48 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: 61 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: 58 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: 64 },
      { date: new Date().toISOString().split('T')[0], count: 71 }
    ];
    
    // Mock revenue data
    const revenue = 1245000;
    const thisMonthRevenue = 125000;
    const revenueGrowthPercent = 15.2;
    
    // Mock services data
    const totalServices = 15;
    const activeServices = 12;
    
    // Mock recent activity
    const recentActivity = [
      { id: 1, action: 'User Registration', user: 'john.doe@example.com', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), resource_type: 'user', resource_id: '123' },
      { id: 2, action: 'Tax Calculation', user: 'jane.smith@example.com', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), resource_type: 'calculation', resource_id: '456' },
      { id: 3, action: 'Document Upload', user: 'admin@example.com', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), resource_type: 'document', resource_id: '789' },
      { id: 4, action: 'ITR Filing', user: 'user@example.com', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), resource_type: 'itr', resource_id: '101' },
      { id: 5, action: 'Profile Update', user: 'test@example.com', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), resource_type: 'profile', resource_id: '202' }
    ];
    
    // Mock system health
    const systemHealth = {
      status: 'healthy',
      database: 'disabled (using mock data)',
      uptime: 99.9,
      last_check: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: {
        users: {
          total: Number(userCount.count),
          active: Number(userCount.count), // Assume all for now
          inactive: 0,
          new_this_month: 2, // Mock growth
          growth_percent: 15.0
        },
        blogs: {
          total: Number(blogCount.count),
          categories: Number(categoryCount.count),
          updates: Number(updatesCount.count)
        },
        calculations: {
          total: totalCalculations,
          this_month: thisMonthCalculations,
          saved: savedCalculations,
          trend: thisMonthCalculations > 0 ? 'up' : 'stable'
        },
        revenue: {
          total: revenue,
          this_month: thisMonthRevenue,
          growth_percent: revenueGrowthPercent
        },
        services: {
          total: totalServices,
          active: activeServices,
          popular: ['ITR Filing', 'Tax Consultation', 'GST Filing']
        },
        system_health: systemHealth,
        recent_activity: recentActivity,
        recent_calculations: recentCalculations
      }
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// ==================== SYSTEM STATISTICS ====================

// Get system statistics (detailed)
router.get('/statistics', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Get various statistics from real database
    const [totalUsers] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(users);
    const [totalBlogs] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(blogPosts);
    const [totalUpdates] = await drizzleDb.select({ count: sql<number>`count(*)` }).from(dailyUpdates);
    
    // Recent activity mock or from audit table if it existed
    const recentCalculations: any[] = [];
    const userGrowth: any[] = [];
    
    res.json({
      success: true,
      data: {
        total_users: Number(totalUsers.count) || 0,
        active_users: Number(totalUsers.count) || 0,
        total_blogs: Number(totalBlogs.count) || 0,
        total_updates: Number(totalUpdates.count) || 0,
        recent_calculations: recentCalculations,
        user_growth: userGrowth
      }
    });
  } catch (error: any) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics.',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// ==================== UTILITY FUNCTIONS ====================

// Audit trail logging function - DISABLED (NO DATABASE)
async function logAuditTrail(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  oldValues: string | null,
  newValues: any
): Promise<void> {
  // Audit logging disabled - no database
  console.log('Audit log (mock):', { userId, action, resourceType, resourceId });
}

export default router;