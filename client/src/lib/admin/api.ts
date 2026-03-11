// Admin API Client - Simple and Clean

import type { ApiResponse, DashboardStats } from './types';

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
    
    return this.request(`/users${query.toString() ? `?${query}` : ''}`);
  }
}

// Export singleton instance
export const adminApi = new AdminApi();
