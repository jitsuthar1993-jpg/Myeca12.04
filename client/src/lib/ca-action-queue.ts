type CaCase = {
  id: string;
  userId?: string | null;
  clientName?: string | null;
  serviceTitle?: string | null;
  status?: string | null;
  documentCount?: number | null;
};

type CaReminder = {
  id: string;
  caseId?: string | null;
  title?: string | null;
  message?: string | null;
  priority?: string | null;
  status?: string | null;
};

export type CaAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: 'urgent' | 'attention' | 'routine';
  kind: 'reminder' | 'case' | 'documents';
};

const terminalStatuses = new Set(['completed', 'closed', 'cancelled']);

function clientDocumentsHref(userId?: string | null) {
  return userId ? '/ca/clients/' + userId + '/documents' : '/ca/dashboard';
}

function priorityScore(priority?: string | null) {
  return priority === 'urgent' ? 0 : priority === 'high' ? 1 : priority === 'medium' ? 2 : 3;
}

function reminderAction(reminder: CaReminder, relatedCase?: CaCase): CaAction {
  const priority = reminder.priority || 'medium';
  return {
    id: reminder.id,
    title: reminder.title || 'Workflow reminder',
    detail: reminder.message || 'Review this follow-up before the next client step.',
    href: clientDocumentsHref(relatedCase?.userId),
    tone: priority === 'urgent' || priority === 'high' ? 'urgent' : 'routine',
    kind: 'reminder',
  };
}

export function buildCaActionQueue({
  cases,
  reminders,
}: {
  cases: CaCase[];
  reminders: CaReminder[];
}): CaAction[] {
  const caseById = new Map(cases.map((serviceCase) => [serviceCase.id, serviceCase]));
  const pendingReminders = reminders
    .filter((reminder) => !['completed', 'dismissed', 'resolved'].includes(String(reminder.status || 'pending').toLowerCase()))
    .sort((a, b) => priorityScore(a.priority) - priorityScore(b.priority));

  const reminderActions = pendingReminders.map((reminder) => reminderAction(reminder, reminder.caseId ? caseById.get(reminder.caseId) : undefined));
  const caseActions = cases
    .filter((serviceCase) => !terminalStatuses.has(String(serviceCase.status || '').toLowerCase()))
    .flatMap((serviceCase): CaAction[] => {
      const clientName = serviceCase.clientName || 'Client';
      const href = clientDocumentsHref(serviceCase.userId);
      const status = String(serviceCase.status || '').toLowerCase();

      if (['client_response_needed', 'action_required', 'changes_requested'].includes(status)) {
        return [{
          id: serviceCase.id,
          title: 'Client response needed',
          detail: clientName + ' needs a reply or document update for ' + (serviceCase.serviceTitle || 'this case') + '.',
          href,
          tone: 'attention',
          kind: 'case',
        }];
      }

      if (!serviceCase.documentCount) {
        return [{
          id: 'documents-' + serviceCase.id,
          title: 'Review case documents',
          detail: clientName + ' has no linked documents on ' + (serviceCase.serviceTitle || 'this case') + '.',
          href,
          tone: 'routine',
          kind: 'documents',
        }];
      }

      return [];
    });

  return [...reminderActions, ...caseActions].slice(0, 8);
}
