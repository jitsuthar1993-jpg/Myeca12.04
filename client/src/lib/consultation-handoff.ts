export const CONSULTATION_SERVICE_KEYS = [
  "general",
  "tax-consultation",
  "gst-returns",
  "business-tax-review",
] as const;

export type ConsultationServiceKey = (typeof CONSULTATION_SERVICE_KEYS)[number];

type ConsultationHandoffContext = {
  source?: string;
  team?: string;
  type?: string;
  date?: Date | string;
  time?: string;
  serviceArea?: string;
  city?: string;
};

const CONSULTATION_PREFILL_FIELDS = [
  ["team", "service team"],
  ["type", "topic"],
  ["date", "preferred date"],
  ["time", "preferred time"],
  ["serviceArea", "service area"],
  ["city", "city"],
] as const;

function normalizePrefillValue(key: string, value: string) {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  if (!normalized || (key === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(normalized))) {
    return "";
  }

  return ["team", "type", "serviceArea", "city"].includes(key)
    ? normalized.replace(/[-_]+/g, " ")
    : normalized;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function buildConsultationHref(
  service: ConsultationServiceKey,
  context: ConsultationHandoffContext = {},
) {
  const params = new URLSearchParams({ service });
  const safeContext = {
    source: context.source,
    team: context.team,
    type: context.type,
    date: context.date instanceof Date ? formatLocalDate(context.date) : context.date,
    time: context.time,
    serviceArea: context.serviceArea,
    city: context.city,
  };

  Object.entries(safeContext).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value);
  });

  return `/expert-consultation?${params.toString()}`;
}

export function buildConsultationPrefillMessage(baseMessage: string, search: string) {
  const params = new URLSearchParams(search);
  const contextParts = CONSULTATION_PREFILL_FIELDS.flatMap(([key, label]) => {
    const value = normalizePrefillValue(key, params.get(key) ?? "");
    return value ? [`${label} ${value}`] : [];
  });

  const normalizedBase = baseMessage.trim();
  return contextParts.length
    ? `${normalizedBase}\n\nRequest context: ${contextParts.join("; ")}.`
    : normalizedBase;
}
