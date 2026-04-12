// Admin API Client - Simple and Clean

import type { AnalyticsOverview, ApiResponse, AuditLog, DashboardStats, FilterParams, User } from './types';

const API_BASE = '/api/admin';

/**
 * Simple API client with error handling
 */
class AdminApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  // Dashboard Statistics
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/stats');
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    
    return this.request<{ users: User[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/users${query.toString() ? `?${query}` : ''}`
    );
  }

  async getAnalyticsOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    return this.request<AnalyticsOverview>('/analytics/overview');
  }

  async getAuditLogs(params?: FilterParams): Promise<ApiResponse<{ logs: AuditLog[]; pagination?: { total: number; page: number; limit: number; totalPages?: number } }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.role) query.append('role', params.role);
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);

    return this.request<{ logs: AuditLog[]; pagination?: { total: number; page: number; limit: number; totalPages?: number } }>(
      `/audit-logs${query.toString() ? `?${query}` : ''}`
    );
  }
}

// Export singleton instance
export const adminApi = new AdminApi();
