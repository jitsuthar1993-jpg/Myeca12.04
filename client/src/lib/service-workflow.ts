import type { Service } from '@/data/all-services';

export type ServiceRequestPayload = {
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  paymentAmount?: number | string | null;
  metadata: {
    requestDescription: string;
    source: string;
    requestedAt: string;
    originalServicePath: string | null;
  };
};

export function buildDashboardServiceRequestPayload(
  selectedServiceId: string,
  service: Service | undefined,
  requestDescription: string,
  requestedAt = new Date().toISOString(),
): ServiceRequestPayload {
  const isCustom = selectedServiceId === 'custom';
  return {
    serviceId: isCustom ? 'custom-request' : selectedServiceId,
    serviceTitle: isCustom ? 'Bespoke Consultation' : service?.title || 'Service request',
    serviceCategory: isCustom ? 'Custom Service' : service?.category || 'General service',
    paymentAmount: service?.price || null,
    metadata: {
      requestDescription: requestDescription.trim(),
      source: 'dashboard_services',
      requestedAt,
      originalServicePath: service?.path || null,
    },
  };
}

export function serviceNeedsPayment(paymentStatus?: string | null) {
  return !['paid', 'not_required', 'link_requested', 'link_sent'].includes(paymentStatus || 'pending');
}

export function buildPaymentLinkRequestPayload(userServiceId: string) {
  return { userServiceId };
}
