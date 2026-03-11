// Admin Users Hook - Simple and Clean

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { PaginationParams } from '@/lib/admin/types';

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const result = await adminApi.getUsers(params);
      return result;
    },
    staleTime: 30000,
    retry: 1,
  });
}
