export type DashboardDocumentChecklistItem = {
  id?: string;
  title?: string;
  required?: boolean;
};

export type DashboardTaxReturn = {
  id?: string | number;
  status?: string | null;
  reviewStatus?: string | null;
  formData?: string | Record<string, unknown> | null;
  documentChecklist?: DashboardDocumentChecklistItem[] | null;
};

export type DocumentReadiness = {
  required: number;
  linked: number;
  percentage: number;
  label: string;
  href: string;
};

export type FilingTimelineStep = {
  id: 'started' | 'documents' | 'review' | 'filed';
  label: string;
  detail: string;
  state: 'complete' | 'current' | 'attention' | 'upcoming';
};

function parseFormData(formData: DashboardTaxReturn['formData']): Record<string, unknown> {
  if (!formData) return {};
  if (typeof formData === 'object') return formData;

  try {
    const parsed = JSON.parse(formData) as unknown;
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function documentIsLinked(documents: unknown, id: string) {
  return Boolean(documents && typeof documents === 'object' && id in documents);
}

export function buildDocumentReadiness({
  documentsUploaded,
  taxReturn,
}: {
  documentsUploaded: number;
  taxReturn?: DashboardTaxReturn;
}): DocumentReadiness {
  const checklist = taxReturn?.documentChecklist?.filter((item) => item.required && item.id) || [];

  if (!checklist.length) {
    return {
      required: 0,
      linked: 0,
      percentage: documentsUploaded > 0 ? 100 : 0,
      label: documentsUploaded > 0 ? `${documentsUploaded} document${documentsUploaded === 1 ? '' : 's'} in vault` : 'No documents added yet',
      href: '/documents',
    };
  }

  const formData = parseFormData(taxReturn?.formData);
  const documents = formData.documents;
  const linked = checklist.filter((item) => documentIsLinked(documents, item.id as string)).length;
  const percentage = Math.round((linked / checklist.length) * 100);

  return {
    required: checklist.length,
    linked,
    percentage,
    label: `${linked} of ${checklist.length} required documents linked`,
    href: taxReturn?.id ? `/itr/filing/${taxReturn.id}` : '/documents',
  };
}

function normalizedStatus(taxReturn: DashboardTaxReturn) {
  return String(taxReturn.reviewStatus || taxReturn.status || 'draft').toLowerCase();
}

export function buildFilingTimeline(taxReturn: DashboardTaxReturn): FilingTimelineStep[] {
  const status = normalizedStatus(taxReturn);
  const isFiled = ['filed', 'submitted', 'completed', 'acknowledged'].includes(status);
  const needsChanges = ['changes_requested', 'client_response_needed', 'action_required'].includes(status);
  const isReadyForReview = ['ready_for_review', 'in_review', 'under_review', 'review'].includes(status);
  const hasDocuments = Boolean(taxReturn.documentChecklist?.length);

  return [
    {
      id: 'started',
      label: 'Return started',
      detail: 'Your saved filing workspace is ready to continue.',
      state: 'complete',
    },
    {
      id: 'documents',
      label: 'Documents',
      detail: hasDocuments ? 'Review the checklist and link the records requested for this return.' : 'Add your tax documents to build the filing checklist.',
      state: isFiled || isReadyForReview ? 'complete' : hasDocuments ? 'current' : 'upcoming',
    },
    {
      id: 'review',
      label: 'CA review',
      detail: needsChanges ? 'A response or document update is needed from you.' : isReadyForReview ? 'Your return is with the review team.' : 'Complete the return and submit it for review.',
      state: needsChanges ? 'attention' : isFiled ? 'complete' : isReadyForReview ? 'current' : 'upcoming',
    },
    {
      id: 'filed',
      label: 'Filed',
      detail: isFiled ? 'Your filing has been submitted or acknowledged.' : 'Filing confirmation will appear here after submission.',
      state: isFiled ? 'complete' : 'upcoming',
    },
  ];
}
