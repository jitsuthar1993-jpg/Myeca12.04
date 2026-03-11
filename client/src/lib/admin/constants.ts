// Admin Dashboard Constants

export const ADMIN_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  REFETCH_INTERVAL: 60000, // 60 seconds
  CACHE_TIME: 300000, // 5 minutes
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  SERVICES: '/admin/services',
  ANALYTICS: '/admin/analytics',
  BLOG: '/admin/blog',
  SETTINGS: '/admin/settings',
  AUDIT_LOGS: '/admin/audit-logs',
  SYSTEM_HEALTH: '/admin/health',
} as const;

export const WIDGET_TYPES = {
  REVENUE: 'revenue',
  USERS: 'users',
  SERVICES: 'services',
  ACTIVITY: 'activity',
  HEALTH: 'health',
  CHARTS: 'charts',
} as const;

export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  CA: 'ca',
} as const;

export const SERVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
} as const;

export const SYSTEM_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

