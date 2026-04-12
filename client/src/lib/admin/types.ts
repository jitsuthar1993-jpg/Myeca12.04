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
  totalUsers?: number;
  totalRevenue?: number;
  totalServices?: number;
  totalBookings?: number;
  [key: string]: unknown;
}

export type PaginationParams = FilterParams;

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
    popular: string[];
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
