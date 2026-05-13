// Admin Services Hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Service, FilterParams } from '@/lib/admin/types';

const isDevelopment = import.meta.env.DEV;
const servicesEndpointUnavailable = 'Admin services API is not configured yet';

export function useServices(params?: FilterParams) {
  return useQuery({
    queryKey: ['admin', 'services', params],
    queryFn: async () => {
      if (!isDevelopment) {
        return {
          success: false,
          error: servicesEndpointUnavailable,
          data: {
            services: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 }
          }
        };
      }

      // Development-only empty state until the backend endpoint is implemented.
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
      if (!isDevelopment) {
        throw new Error(servicesEndpointUnavailable);
      }

      return { success: true, data: { service_id: Date.now() } };
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
      if (!isDevelopment) {
        throw new Error(servicesEndpointUnavailable);
      }

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
      if (!isDevelopment) {
        throw new Error(servicesEndpointUnavailable);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
