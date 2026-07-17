export type WhatsAppCaseTemplate = 'changes_requested' | 'filing_completed';

export function whatsappTemplateForCaseStatus(status?: string | null): WhatsAppCaseTemplate | null {
  switch (String(status || '').toLowerCase()) {
    case 'client_response_needed':
    case 'action_required':
    case 'changes_requested':
      return 'changes_requested';
    case 'completed':
      return 'filing_completed';
    default:
      return null;
  }
}
