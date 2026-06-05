import type { Service as LegacyDashboardService } from '@/data/all-services';

export type DashboardServiceRequestOption = {
  id: string;
  title: string;
  categoryLabel: string;
  paymentAmount?: number | string | null;
  originalServicePath?: string | null;
};

type DashboardServiceRequestSource = LegacyDashboardService | DashboardServiceRequestOption;

export type ServiceRequestPayload = {
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  paymentAmount?: number | string | null;
  metadata: {
    requestDescription: string;
    source: string;
    formId: string;
    serviceIntent: string;
    requestedAt: string;
    originalServicePath: string | null;
  };
};

function normalizeDashboardServiceRequestOption(
  service: DashboardServiceRequestSource | undefined,
): DashboardServiceRequestOption | undefined {
  if (!service) return undefined;
  if ('categoryLabel' in service) return service;

  return {
    id: service.id,
    title: service.title,
    categoryLabel: service.category,
    paymentAmount: service.price ?? null,
    originalServicePath: service.path ?? null,
  };
}

export function buildDashboardServiceRequestPayload(
  selectedServiceId: string,
  service: DashboardServiceRequestSource | undefined,
  requestDescription: string,
  requestedAt = new Date().toISOString(),
): ServiceRequestPayload {
  const isCustom = selectedServiceId === 'custom';
  const normalizedService = normalizeDashboardServiceRequestOption(service);
  return {
    serviceId: isCustom ? 'custom-request' : selectedServiceId,
    serviceTitle: isCustom ? 'Bespoke Consultation' : normalizedService?.title || 'Service request',
    serviceCategory: isCustom ? 'Custom Service' : normalizedService?.categoryLabel || 'General service',
    paymentAmount: normalizedService?.paymentAmount ?? null,
    metadata: {
      requestDescription: requestDescription.trim(),
      source: 'dashboard_services',
      formId: 'dashboard-service-modal',
      serviceIntent: isCustom ? 'custom-request' : selectedServiceId,
      requestedAt,
      originalServicePath: normalizedService?.originalServicePath ?? null,
    },
  };
}

export function serviceNeedsPayment(paymentStatus?: string | null) {
  return !['paid', 'not_required', 'link_requested', 'link_sent'].includes(paymentStatus || 'pending');
}

export function buildPaymentLinkRequestPayload(userServiceId: string) {
  return { userServiceId };
}
