// Admin Analytics Hook

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { FilterParams } from '@/lib/admin/types';

export function useAnalytics(params?: FilterParams) {
  return useQuery({
    queryKey: ['admin', 'analytics', params],
    queryFn: async () => {
      const result = await adminApi.getAnalyticsOverview();
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

