// Admin Dashboard Stats Hook - Simple and Clean

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { DashboardStats } from '@/lib/admin/types';

const defaultStats: DashboardStats = {
  users: { total: 0, active: 0, inactive: 0, new_this_month: 0, growth_percent: 0 },
  calculations: { total: 0, this_month: 0, saved: 0, trend: 'stable' },
  revenue: { total: 0, this_month: 0, growth_percent: 0 },
  services: { total: 0, active: 0, popular: [] },
  system_health: { status: 'healthy', database: 'unknown', uptime: 0, last_check: new Date().toISOString() },
  recent_activity: [],
};

export function useStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const result = await adminApi.getStats();
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

