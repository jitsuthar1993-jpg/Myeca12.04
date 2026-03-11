// Admin Audit Logs Hook

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { FilterParams } from '@/lib/admin/types';

export function useAuditLogs(params?: FilterParams) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const result = await adminApi.getAuditLogs(params);
      return result;
    },
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

