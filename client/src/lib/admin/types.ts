// Admin Dashboard TypeScript Types - Simple and Clean

import type {
  User as SharedUser,
  ChatSession,
  ChatMessage,
  BlogPost,
  BlogCategory,
  BlogTag,
  TaxReturn,
  Document
} from '@shared/schema';

// Re-export shared user shape with the required id expected by admin tables.
export type User = Omit<SharedUser, 'id'> & {
  id: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string | Date;
};

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
  role?: string;
  date_from?: string;
  date_to?: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  isPopular?: boolean;
  isActive?: boolean;
  features?: string;
  estimatedDuration?: string;
  requirements?: string;
  bookingsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: number | string;
  action: string;
  user?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  timestamp: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsOverview {
  userStats?: {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    admins: number;
    caProfessionals: number;
  };
  profileStats?: {
    totalProfiles: number;
  };
  returnStats?: {
    totalReturns: number;
    filedReturns: number;
    draftReturns: number;
    pendingReturns: number;
  };
  docStats?: {
    totalDocuments: number;
  };
  contentStats?: {
    totalPosts: number;
    publishedPosts: number;
  };
  googleAnalytics?: GoogleAnalyticsReport;
  [key: string]: unknown;
}

export type AnalyticsDateRange = '7d' | '30d' | '90d';

export interface GoogleAnalyticsSummary {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  eventCount: number;
  keyEvents: number;
  engagementRate: number;
  averageSessionDuration: number;
}

export interface GoogleAnalyticsReport {
  status: 'not_configured' | 'ready' | 'error';
  dateRange: {
    range: AnalyticsDateRange;
    startDate: string;
    endDate: 'today';
  };
  summary: GoogleAnalyticsSummary;
  topPages: Array<{
    path: string;
    title: string;
    pageViews: number;
    activeUsers: number;
    engagementRate: number;
  }>;
  trafficSources: Array<{
    channel: string;
    sourceMedium: string;
    sessions: number;
    activeUsers: number;
    keyEvents: number;
  }>;
  devices: Array<{
    category: string;
    browser: string;
    activeUsers: number;
    sessions: number;
  }>;
  locations: Array<{
    country: string;
    city: string;
    activeUsers: number;
    sessions: number;
  }>;
  events: Array<{
    eventName: string;
    eventCount: number;
    activeUsers: number;
    keyEvents: number;
  }>;
  keyEvents: Array<{
    eventName: string;
    keyEvents: number;
    eventCount: number;
    activeUsers: number;
  }>;
  lastFetchedAt: string | null;
  error?: string;
}

export type PaginationParams = FilterParams;

export interface SupabaseUserDirectorySync {
  status: 'synced' | 'not_configured' | 'error';
  supabaseUsers: number;
  created: number;
  updated: number;
  skipped: number;
  lastSyncedAt: string | null;
  error?: string;
}

export interface Column<T> {
  key?: keyof T | string;
  label?: string;
  id?: string;
  header?: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DashboardStats {
  users: {
    total: number;
    caCount?: number;
    adminCount?: number;
    regularCount?: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    growthPercent: number;
  };
  calculations: {
    total: number;
    thisMonth: number;
    saved: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenue: {
    total: number;
    pending?: number;
    thisMonth: number;
    growthPercent: number;
  };
  services: {
    total: number;
    active: number;
    popular: Array<{
      name: string;
      count: number;
    }>;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    database: string;
    uptime: number;
    lastCheck: string;
  };
  workList?: WorkItem[];
  recentActivity: Activity[];
  recentCalculations?: CalculationTrend[];
}

export interface WorkItem {
  id: string;
  type: 'service' | 'tax_return';
  title: string;
  userId: string;
  userName: string;
  assignedCaId?: string;
  assignedCaName?: string;
  status: string;
  price: number;
  createdAt: string;
}

export interface CalculationTrend {
  date: string;
  count: number;
}

export interface Activity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  resourceType: string;
  resourceId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
