import { describe, expect, it } from 'vitest';
import { buildClientActionPlan } from './client-action-plan';

describe('client action plan', () => {
  it('prioritizes client responses, missing documents, and payment actions', () => {
    const plan = buildClientActionPlan({
      latestReturn: { id: 'return-1', status: 'changes_requested', assessmentYear: '2026-27' },
      documentReadiness: { percentage: 50 },
      activeServices: [{ id: 'service-1', serviceTitle: 'ITR filing', paymentStatus: 'pending', status: 'in_progress' }],
    });

    expect(plan.map((item) => item.id)).toEqual(['review-response', 'documents', 'payment-service-1']);
    expect(plan[0]).toMatchObject({ tone: 'urgent', href: '/itr/filing/return-1' });
  });
  it('uses the review status when it is the current workflow state', () => {
    const plan = buildClientActionPlan({
      latestReturn: { id: 'return-1', status: 'draft', reviewStatus: 'changes_requested' },
      documentReadiness: { percentage: 100 },
      activeServices: [],
    });

    expect(plan[0]).toMatchObject({ id: 'review-response', tone: 'urgent' });
  });


  it('suggests starting a filing when the workspace has no return', () => {
    const plan = buildClientActionPlan({ documentReadiness: { percentage: 0 }, activeServices: [] });

    expect(plan[0]).toMatchObject({
      id: 'start-filing',
      title: 'Start your ITR workspace',
      href: '/itr/filing/new',
    });
  });

  it('shows filing status after a completed return', () => {
    const plan = buildClientActionPlan({
      latestReturn: { id: 'return-1', status: 'filed', assessmentYear: '2026-27' },
      documentReadiness: { percentage: 100 },
      activeServices: [],
    });

    expect(plan[0]).toMatchObject({ id: 'filing-status', href: '/itr/status-tracker' });
  });
});
