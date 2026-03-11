// Admin Dashboard Statistics Hook

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { DashboardStats } from '@/lib/admin/types';
import { ADMIN_CONFIG } from '@/lib/admin/constants';

const defaultStats: DashboardStats = {
  users: { total: 0, active: 0, inactive: 0, new_this_month: 0, growth_percent: 0 },
  calculations: { total: 0, this_month: 0, saved: 0, trend: 'stable' },
  revenue: { total: 0, this_month: 0, growth_percent: 0 },
  services: { total: 0, active: 0, popular: [] },
  system_health: { status: 'healthy', database: 'unknown', uptime: 0, last_check: new Date().toISOString() },
  recent_activity: [],
  recent_calculations: [],
};

export function useAdminStats() {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const result = await adminApi.getStats();
        clearTimeout(timeoutId);
        
        return result;
      } catch (error: any) {
        console.warn('Error fetching admin stats:', error.message);
        return { success: true, data: defaultStats };
      }
    },
    refetchInterval: ADMIN_CONFIG.REFETCH_INTERVAL,
    retry: 1,
    retryDelay: 500,
    staleTime: ADMIN_CONFIG.CACHE_TIME,
    gcTime: ADMIN_CONFIG.CACHE_TIME * 2,
    placeholderData: { success: true, data: defaultStats },
    initialData: { success: true, data: defaultStats },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  const stats = response?.data || defaultStats;

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}

