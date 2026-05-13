// Admin Dashboard Stats Hook - Simple and Clean

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { DashboardStats } from '@/lib/admin/types';

const defaultStats: DashboardStats = {
  users: { total: 0, active: 0, inactive: 0, newThisMonth: 0, growthPercent: 0 },
  calculations: { total: 0, thisMonth: 0, saved: 0, trend: 'stable' },
  revenue: { total: 0, thisMonth: 0, growthPercent: 0 },
  services: { total: 0, active: 0, popular: [] },
  systemHealth: { status: 'healthy', database: 'unknown', uptime: 0, lastCheck: new Date().toISOString() },
  recentActivity: [],
};

export function useStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const result = await adminApi.getStats();
      if (!result.success) {
        throw new Error(result.error || 'Unable to load admin statistics');
      }

      return result.data || defaultStats;
    },
    staleTime: 30000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    stats: data || defaultStats,
    isLoading,
    error,
    refetch,
  };
}
