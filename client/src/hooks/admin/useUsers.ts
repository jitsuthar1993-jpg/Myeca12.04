// Admin Users Hook - Simple and Clean

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { PaginationParams } from '@/lib/admin/types';

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const result = await adminApi.getUsers(params);
      const fallback = { users: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0, pages: 0 } };
      const data = result.data || fallback;
      return {
        ...data,
        users: data.users.map((user) => ({ ...user, id: user.id ?? '' })),
        pagination: {
          ...data.pagination,
          pages: data.pagination.totalPages ?? (data.pagination as any).pages ?? 0,
        },
      };
    },
    staleTime: 30000,
    retry: 1,
  });
}
