import { describe, expect, it } from 'vitest';
import {
  buildDashboardServiceRequestPayload,
  buildPaymentLinkRequestPayload,
  serviceNeedsPayment,
  type DashboardServiceRequestOption,
} from './service-workflow';

describe('service workflow helpers', () => {
  it('builds a dashboard service request payload from a normalized catalog service', () => {
    const payload = buildDashboardServiceRequestPayload(
      'gst-registration',
      {
        id: 'gst-registration',
        title: 'GST Registration',
        categoryLabel: 'GST Services',
        paymentAmount: 1499,
        originalServicePath: '/services/gst-registration',
      },
      ' Need GST for a new firm ',
      '2026-05-15T10:00:00.000Z',
    );

    expect(payload).toMatchObject({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      serviceCategory: 'GST Services',
      paymentAmount: 1499,
      metadata: {
        requestDescription: 'Need GST for a new firm',
        source: 'dashboard_services',
        formId: 'dashboard-service-modal',
        serviceIntent: 'gst-registration',
        requestedAt: '2026-05-15T10:00:00.000Z',
        originalServicePath: '/services/gst-registration',
      },
    });
  });

  it('builds a real dashboard service request payload with metadata', () => {
    const payload = buildDashboardServiceRequestPayload(
      'gst-registration',
      {
        id: 'gst-registration',
        title: 'GST Registration',
        description: 'Quick GST registration online',
        category: 'Tax & Filing Services',
        section: 'Services',
        icon: 'Receipt',
        path: '/services/gst-registration',
        price: 'Rs 999',
      },
      ' Need GST for a new firm ',
      '2026-05-15T10:00:00.000Z',
    );

    expect(payload).toMatchObject({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      serviceCategory: 'Tax & Filing Services',
      paymentAmount: 'Rs 999',
      metadata: {
        requestDescription: 'Need GST for a new firm',
        source: 'dashboard_services',
        formId: 'dashboard-service-modal',
        serviceIntent: 'gst-registration',
        requestedAt: '2026-05-15T10:00:00.000Z',
        originalServicePath: '/services/gst-registration',
      },
    });
  });

  it('builds a custom service request without requiring a catalogue service', () => {
    const payload = buildDashboardServiceRequestPayload('custom', undefined, 'Need a special filing');

    expect(payload.serviceId).toBe('custom-request');
    expect(payload.serviceTitle).toBe('Bespoke Consultation');
    expect(payload.serviceCategory).toBe('Custom Service');
    expect(payload).not.toHaveProperty('paymentStatus');
    expect(payload).not.toHaveProperty('status');
  });

  it('normalizes richer dashboard service options into request metadata', () => {
    const service: DashboardServiceRequestOption = {
      id: 'gst-registration',
      title: 'GST Registration',
      categoryLabel: 'GST Services',
      paymentAmount: 999,
      originalServicePath: '/services/gst-registration',
    };

    const payload = buildDashboardServiceRequestPayload(
      'gst-registration',
      service,
      ' Need GST for a new firm ',
      '2026-05-15T10:00:00.000Z',
    );

    expect(payload).toMatchObject({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      serviceCategory: 'GST Services',
      paymentAmount: 999,
      metadata: {
        requestDescription: 'Need GST for a new firm',
        source: 'dashboard_services',
        requestedAt: '2026-05-15T10:00:00.000Z',
        originalServicePath: '/services/gst-registration',
      },
    });
    expect(payload.metadata).not.toHaveProperty('formId');
    expect(payload.metadata).not.toHaveProperty('serviceIntent');
  });

  it('identifies payment states that still need action', () => {
    expect(serviceNeedsPayment('pending')).toBe(true);
    expect(serviceNeedsPayment('link_requested')).toBe(false);
    expect(serviceNeedsPayment('link_sent')).toBe(false);
    expect(serviceNeedsPayment('paid')).toBe(false);
    expect(serviceNeedsPayment('not_required')).toBe(false);
  });

  it('builds a payment link request payload', () => {
    expect(buildPaymentLinkRequestPayload('service-123')).toEqual({ userServiceId: 'service-123' });
  });
});
