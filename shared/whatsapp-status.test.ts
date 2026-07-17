import { describe, expect, it } from 'vitest';
import { whatsappTemplateForCaseStatus } from './whatsapp-status';

describe('WhatsApp case status templates', () => {
  it('maps client action and completion statuses to approved workflow templates', () => {
    expect(whatsappTemplateForCaseStatus('client_response_needed')).toBe('changes_requested');
    expect(whatsappTemplateForCaseStatus('completed')).toBe('filing_completed');
  });

  it('does not message clients for internal progress changes', () => {
    expect(whatsappTemplateForCaseStatus('in_progress')).toBeNull();
    expect(whatsappTemplateForCaseStatus(undefined)).toBeNull();
  });
});
