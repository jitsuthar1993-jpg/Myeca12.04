type ActionPlanReturn = {
  id?: string | number;
  status?: string | null;
  reviewStatus?: string | null;
  assessmentYear?: string | null;
};

type ActionPlanService = {
  id: string;
  serviceTitle?: string | null;
  paymentStatus?: string | null;
  status?: string | null;
};

export type ClientActionPlanItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: 'urgent' | 'next' | 'later';
};

function isPendingPayment(service: ActionPlanService) {
  const status = String(service.paymentStatus || 'pending').toLowerCase();
  return !['paid', 'not_required', 'not required', 'waived', 'completed'].includes(status)
    && !['completed', 'closed', 'cancelled'].includes(String(service.status || '').toLowerCase());
}

export function buildClientActionPlan({
  latestReturn,
  documentReadiness,
  activeServices,
}: {
  latestReturn?: ActionPlanReturn;
  documentReadiness: { percentage: number };
  activeServices: ActionPlanService[];
}): ClientActionPlanItem[] {
  const plan: ClientActionPlanItem[] = [];
  const status = String(latestReturn?.reviewStatus || latestReturn?.status || '').toLowerCase();
  const returnHref = latestReturn?.id ? '/itr/filing/' + latestReturn.id : '/itr/filing/new';

  if (!latestReturn) {
    plan.push({
      id: 'start-filing',
      title: 'Start your ITR workspace',
      detail: 'Answer a few guided questions and save your filing context for the next step.',
      href: '/itr/filing/new',
      tone: 'next',
    });
  } else if (['changes_requested', 'client_response_needed', 'action_required'].includes(status)) {
    plan.push({
      id: 'review-response',
      title: 'Respond to the review request',
      detail: 'Open your return and review the CA note or requested information.',
      href: returnHref,
      tone: 'urgent',
    });
  } else if (['filed', 'submitted', 'completed', 'acknowledged'].includes(status)) {
    plan.push({
      id: 'filing-status',
      title: 'Track your filing status',
      detail: 'Keep your acknowledgement details handy and check the next official status step.',
      href: '/itr/status-tracker',
      tone: 'later',
    });
  } else {
    plan.push({
      id: 'continue-filing',
      title: 'Continue your ITR workspace',
      detail: 'Resume the saved return and complete the next guided filing step.',
      href: returnHref,
      tone: 'next',
    });
  }

  if (latestReturn && documentReadiness.percentage < 100) {
    plan.push({
      id: 'documents',
      title: 'Complete your document checklist',
      detail: 'Link or upload the records requested for this return before review.',
      href: returnHref,
      tone: status === 'changes_requested' ? 'urgent' : 'next',
    });
  }

  activeServices.filter(isPendingPayment).slice(0, 1).forEach((service) => {
    plan.push({
      id: 'payment-' + service.id,
      title: 'Complete the pending payment',
      detail: (service.serviceTitle || 'Your service case') + ' is waiting for payment before the next fulfilment step.',
      href: '/payments',
      tone: 'urgent',
    });
  });

  activeServices
    .filter((service) => !isPendingPayment(service) && !['completed', 'closed', 'cancelled'].includes(String(service.status || '').toLowerCase()))
    .slice(0, 1)
    .forEach((service) => {
      plan.push({
        id: 'service-' + service.id,
        title: 'Track your active service',
        detail: (service.serviceTitle || 'Your service case') + ' has an active workflow update to review.',
        href: '/dashboard/services/' + service.id,
        tone: 'later',
      });
    });

  return plan.slice(0, 4);
}
