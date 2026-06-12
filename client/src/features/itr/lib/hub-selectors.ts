export type HubFilingOwner = {
  mode?: "self" | "other";
  personId?: string;
  relationship?: string;
  displayName?: string;
};

export type HubTaxReturn = {
  id: string;
  profileId?: string | null;
  assessmentYear: string;
  itrType?: string;
  status?: string;
  reviewStatus?: string;
  acknowledgmentNumber?: string | null;
  refundAmount?: number | null;
  filedAt?: string | null;
  updatedAt?: string | null;
  formData?: {
    filingOwner?: HubFilingOwner;
    taxpayer?: { firstName?: string; lastName?: string };
  };
};

export type HubOwnerSelection =
  | { mode: "self" }
  | { mode: "member"; profileId: string };

export const OPEN_DRAFT_STATUSES = ["draft", "changes_requested"] as const;

export function isOpenDraft(status?: string | null) {
  return (OPEN_DRAFT_STATUSES as readonly string[]).includes(String(status ?? "draft"));
}

export function ownerLabel(record: Pick<HubTaxReturn, "formData">) {
  const owner = record.formData?.filingOwner;
  if (owner?.mode === "other") {
    return owner.displayName?.trim() || "Family member";
  }
  return "Self";
}

export function taxpayerLabel(record: Pick<HubTaxReturn, "formData">) {
  const taxpayer = record.formData?.taxpayer;
  const name = `${taxpayer?.firstName ?? ""} ${taxpayer?.lastName ?? ""}`.trim();
  return name || ownerLabel(record);
}

export function groupReturnsByYear(returns: readonly HubTaxReturn[]) {
  const groups = new Map<string, HubTaxReturn[]>();
  for (const record of returns) {
    const year = record.assessmentYear || "Unknown";
    groups.set(year, [...(groups.get(year) ?? []), record]);
  }
  return Array.from(groups.entries())
    .map(([assessmentYear, records]) => ({ assessmentYear, returns: records }))
    .sort((a, b) => b.assessmentYear.localeCompare(a.assessmentYear));
}

const REVIEW_STATUS_BADGES: Record<string, { tone: string; label: string }> = {
  draft: { tone: "in_progress", label: "Draft" },
  ready_for_review: { tone: "submitted", label: "Submitted for review" },
  ca_review: { tone: "ca_review", label: "CA review" },
  changes_requested: { tone: "action_required", label: "Changes requested" },
  approved_for_filing: { tone: "submitted", label: "Approved for filing" },
  filed: { tone: "filed", label: "Filed" },
  e_verified: { tone: "filed", label: "e-Verified" },
  refund_or_demand_tracking: { tone: "refund_processed", label: "Refund / demand tracking" },
};

export function reviewStatusBadge(status?: string | null) {
  return REVIEW_STATUS_BADGES[String(status ?? "draft")] ?? { tone: "not_started", label: String(status ?? "Draft") };
}

export function findOpenDraftFor(
  returns: readonly HubTaxReturn[],
  selection: HubOwnerSelection,
  assessmentYear: string,
) {
  return returns.find((record) => {
    if (record.assessmentYear !== assessmentYear || !isOpenDraft(record.status)) return false;
    if (selection.mode === "member") return record.profileId === selection.profileId;
    return !record.profileId && record.formData?.filingOwner?.mode !== "other";
  }) ?? null;
}
