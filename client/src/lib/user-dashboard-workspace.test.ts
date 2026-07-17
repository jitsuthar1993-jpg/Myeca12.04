import { describe, expect, it } from 'vitest';
import { buildDocumentReadiness, buildFilingTimeline } from './user-dashboard-workspace';

describe('user dashboard workspace helpers', () => {
  it('calculates document readiness from the latest return checklist', () => {
    const result = buildDocumentReadiness({
      documentsUploaded: 4,
      taxReturn: {
        id: 'return-1',
        documentChecklist: [
          { id: 'form16', title: 'Form 16', required: true },
          { id: 'ais', title: 'AIS', required: true },
          { id: 'deductions', title: 'Deduction proofs', required: false },
        ],
        formData: JSON.stringify({ documents: { form16: { name: 'form16.pdf' } } }),
      },
    });

    expect(result.required).toBe(2);
    expect(result.linked).toBe(1);
    expect(result.percentage).toBe(50);
    expect(result.href).toBe('/itr/filing/return-1');
  });

  it('falls back to the document vault when no checklist is available', () => {
    const result = buildDocumentReadiness({ documentsUploaded: 0 });

    expect(result.required).toBe(0);
    expect(result.linked).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.href).toBe('/documents');
  });

  it('maps a return status into a client-facing filing timeline', () => {
    const timeline = buildFilingTimeline({ status: 'changes_requested', reviewStatus: 'changes_requested' });

    expect(timeline.find((step) => step.id === 'review')).toMatchObject({ state: 'attention' });
    expect(timeline.find((step) => step.id === 'filed')).toMatchObject({ state: 'upcoming' });
  });
});
