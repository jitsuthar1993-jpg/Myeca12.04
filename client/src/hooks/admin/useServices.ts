// Admin Services Hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api';
import type { Service, FilterParams } from '@/lib/admin/types';

export function useServices(params?: FilterParams) {
  return useQuery({
    queryKey: ['admin', 'services', params],
    queryFn: async () => {
      // Mock for now - will be implemented when backend endpoint is ready
      return {
        success: true,
        data: {
          services: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        }
      };
    },
    staleTime: 30000,
    retry: 1,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceData: Partial<Service>) => {
      // Mock for now
      return { success: true, data: { service_id: Math.floor(Math.random() * 1000) } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Service> }) => {
      // Mock for now
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'services', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      // Mock for now
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

