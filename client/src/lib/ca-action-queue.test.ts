import { describe, expect, it } from 'vitest';
import { buildCaActionQueue } from './ca-action-queue';

describe('CA action queue', () => {
  it('prioritizes urgent reminders and response-needed cases', () => {
    const actions = buildCaActionQueue({
      cases: [
        {
          id: 'case-1',
          userId: 'client-1',
          clientName: 'Aarav Mehta',
          serviceTitle: 'ITR filing',
          status: 'client_response_needed',
        },
        {
          id: 'case-2',
          userId: 'client-2',
          clientName: 'Diya Shah',
          serviceTitle: 'GST return',
          status: 'in_progress',
          documentCount: 2,
        },
      ],
      reminders: [
        {
          id: 'reminder-1',
          caseId: 'case-2',
          title: 'Missing bank statement',
          message: 'Request the latest statement.',
          priority: 'urgent',
          status: 'pending',
        },
      ],
    });

    expect(actions.map((action) => action.id)).toEqual(['reminder-1', 'case-1']);
    expect(actions[0]).toMatchObject({ tone: 'urgent', href: '/ca/clients/client-2/documents' });
    expect(actions[1]).toMatchObject({ tone: 'attention', href: '/ca/clients/client-1/documents' });
  });

  it('does not surface completed cases or resolved reminders', () => {
    const actions = buildCaActionQueue({
      cases: [{ id: 'case-1', status: 'completed', userId: 'client-1' }],
      reminders: [{ id: 'reminder-1', status: 'completed', title: 'Done' }],
    });

    expect(actions).toEqual([]);
  });
});
