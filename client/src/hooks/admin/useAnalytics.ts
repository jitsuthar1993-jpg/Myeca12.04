// Admin Analytics Hook

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { AnalyticsDateRange, FilterParams } from '@/lib/admin/types';

export function useAnalytics(params?: FilterParams & { range?: AnalyticsDateRange }) {
  return useQuery({
    queryKey: ['admin', 'analytics', params],
    queryFn: async () => {
      const result = await adminApi.getAnalyticsOverview({ range: params?.range });
      return result;
    },
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}
