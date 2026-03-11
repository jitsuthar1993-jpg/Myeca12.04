// Admin Dashboard TypeScript Types - Simple and Clean

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    new_this_month: number;
    growth_percent: number;
  };
  calculations: {
    total: number;
    this_month: number;
    saved: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenue: {
    total: number;
    this_month: number;
    growth_percent: number;
  };
  services: {
    total: number;
    active: number;
    popular: string[];
  };
  system_health: {
    status: 'healthy' | 'warning' | 'critical';
    database: string;
    uptime: number;
    last_check: string;
  };
  recent_activity: Activity[];
  recent_calculations?: CalculationTrend[];
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
  resource_type: string;
  resource_id: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_admin: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
