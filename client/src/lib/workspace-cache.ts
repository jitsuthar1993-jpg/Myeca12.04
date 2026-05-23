import type { QueryClient } from "@tanstack/react-query";

export const WORKSPACE_CACHE_KEYS = {
  userDashboard: ["/api/user/dashboard"] as const,
  userServices: ["/api/user-services"] as const,
  documents: ["/api/documents"] as const,
  documentStats: ["/api/documents/stats/summary"] as const,
  notifications: ["/api/notifications"] as const,
  adminCases: ["/api/admin/requests/cases"] as const,
  caCases: ["/api/ca/cases"] as const,
  adminPayments: ["/api/admin/requests/payment-links"] as const,
  reportsHistory: ["/api/reports/history"] as const,
};

function invalidateKeys(queryClient: QueryClient, keys: ReadonlyArray<readonly unknown[]>) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey: [...queryKey] })));
}

export function invalidateWorkspaceCaseCaches(queryClient: QueryClient, serviceId?: string | null) {
  const keys: Array<readonly unknown[]> = [
    WORKSPACE_CACHE_KEYS.userDashboard,
    WORKSPACE_CACHE_KEYS.userServices,
    WORKSPACE_CACHE_KEYS.notifications,
    WORKSPACE_CACHE_KEYS.adminCases,
    WORKSPACE_CACHE_KEYS.caCases,
  ];

  if (serviceId) {
    keys.push(["/api/user-services", serviceId]);
  }

  return invalidateKeys(queryClient, keys);
}

export function invalidateDocumentCaches(queryClient: QueryClient, serviceId?: string | null) {
  const keys: Array<readonly unknown[]> = [
    WORKSPACE_CACHE_KEYS.documents,
    WORKSPACE_CACHE_KEYS.documentStats,
    WORKSPACE_CACHE_KEYS.userDashboard,
    WORKSPACE_CACHE_KEYS.notifications,
    WORKSPACE_CACHE_KEYS.adminCases,
    WORKSPACE_CACHE_KEYS.caCases,
  ];

  if (serviceId) {
    keys.push(["/api/user-services", serviceId]);
  }

  return invalidateKeys(queryClient, keys);
}

export function invalidatePaymentCaches(queryClient: QueryClient) {
  return invalidateKeys(queryClient, [
    WORKSPACE_CACHE_KEYS.userDashboard,
    WORKSPACE_CACHE_KEYS.userServices,
    WORKSPACE_CACHE_KEYS.notifications,
    WORKSPACE_CACHE_KEYS.adminCases,
    WORKSPACE_CACHE_KEYS.caCases,
    WORKSPACE_CACHE_KEYS.adminPayments,
  ]);
}

export function invalidateReportCaches(queryClient: QueryClient) {
  return invalidateKeys(queryClient, [WORKSPACE_CACHE_KEYS.reportsHistory]);
}
