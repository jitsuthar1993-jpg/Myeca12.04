export const OUTREACH_REQUIRED_CHANNELS = [
  "CA blogs",
  "StartupIndia listings",
  "Medium articles",
  "LinkedIn",
  "Guest posts",
  "Finance forums",
  "HR/payroll",
] as const;

export const OUTREACH_TRACKER_HEADERS = [
  "date",
  "channel",
  "segment",
  "prospect_name",
  "site_or_org",
  "url",
  "contact_name",
  "contact_email",
  "social_url",
  "asset_to_pitch",
  "target_url",
  "utm_url",
  "anchor_text",
  "rel_attribute",
  "status",
  "owner",
  "last_contacted",
  "next_follow_up",
  "notes",
] as const;

type OutreachField = (typeof OUTREACH_TRACKER_HEADERS)[number];

export type SeoOutreachReadinessOptions = {
  minimumQualifiedProspects: number;
  requiredChannels: readonly string[];
};

export type SeoOutreachReadiness = {
  channelCoverage: string[];
  issues: string[];
  ok: boolean;
  qualifiedProspectCount: number;
  templateRowCount: number;
  totalRows: number;
};

const ACTIVE_STATUSES = new Set(["prospect", "queued", "planned", "sent", "replied", "placed", "rejected"]);
const ALLOWED_STATUSES = new Set([...ACTIVE_STATUSES, "template"]);
const ALLOWED_REL_ATTRIBUTES = new Set(["editorial", "nofollow", "sponsored", "unknown"]);
const PLACEHOLDER_TEXT = new Set(["", "tbd", "todo"]);
const REQUIRED_ACTIVE_FIELDS = [
  "channel",
  "segment",
  "prospect_name",
  "site_or_org",
  "url",
  "asset_to_pitch",
  "target_url",
  "utm_url",
  "anchor_text",
  "rel_attribute",
  "status",
  "notes",
] satisfies OutreachField[];

function parseCsvLine(line: string) {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields.map((field) => field.trim());
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_TEXT.has(value.trim().toLowerCase());
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function recordFromFields(fields: string[]) {
  return Object.fromEntries(
    OUTREACH_TRACKER_HEADERS.map((header, index) => [header, fields[index] ?? ""]),
  ) as Record<OutreachField, string>;
}

export function evaluateSeoOutreachReadiness(
  csv: string,
  options: SeoOutreachReadinessOptions,
): SeoOutreachReadiness {
  const issues: string[] = [];
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const [headerLine, ...rowLines] = lines;
  const headers = parseCsvLine(headerLine ?? "");
  const headerMatches =
    headers.length === OUTREACH_TRACKER_HEADERS.length
    && OUTREACH_TRACKER_HEADERS.every((header, index) => headers[index] === header);

  if (!headerMatches) {
    issues.push(`outreach tracker headers are ${headers.join(",") || "(missing)"}; expected ${OUTREACH_TRACKER_HEADERS.join(",")}`);
  }

  const channelCoverage = new Set<string>();
  let qualifiedProspectCount = 0;
  let templateRowCount = 0;

  rowLines.forEach((line, index) => {
    const lineNumber = index + 2;
    const fields = parseCsvLine(line);
    if (fields.length !== OUTREACH_TRACKER_HEADERS.length) {
      issues.push(`line ${lineNumber} has ${fields.length} CSV field(s); expected ${OUTREACH_TRACKER_HEADERS.length}`);
      return;
    }

    const row = recordFromFields(fields);
    const status = row.status.toLowerCase();

    if (!ALLOWED_STATUSES.has(status)) {
      issues.push(`line ${lineNumber} has unknown status ${row.status || "(empty)"}`);
      return;
    }

    if (status === "template") {
      templateRowCount += 1;
      return;
    }

    REQUIRED_ACTIVE_FIELDS.forEach((field) => {
      if (isPlaceholder(row[field])) {
        issues.push(`line ${lineNumber} ${field} is placeholder for active prospect`);
      }
    });

    if (!ALLOWED_REL_ATTRIBUTES.has(row.rel_attribute.toLowerCase())) {
      issues.push(`line ${lineNumber} rel_attribute must be editorial, nofollow, sponsored, or unknown`);
    }

    if (!isPlaceholder(row.url) && !isHttpUrl(row.url)) {
      issues.push(`line ${lineNumber} url must be an HTTP or HTTPS URL`);
    }
    if (!isPlaceholder(row.target_url) && !isHttpUrl(row.target_url)) {
      issues.push(`line ${lineNumber} target_url must be an HTTP or HTTPS URL`);
    }
    if (!isPlaceholder(row.utm_url)) {
      if (!isHttpUrl(row.utm_url)) {
        issues.push(`line ${lineNumber} utm_url must be an HTTP or HTTPS URL`);
      } else {
        const utm = new URL(row.utm_url);
        if (utm.searchParams.get("utm_campaign") !== "itr-season-2026") {
          issues.push(`line ${lineNumber} utm_url must include utm_campaign=itr-season-2026`);
        }
        if (!utm.searchParams.get("utm_medium")) {
          issues.push(`line ${lineNumber} utm_url must include utm_medium`);
        }
        if (!utm.searchParams.get("utm_content")) {
          issues.push(`line ${lineNumber} utm_url must include utm_content`);
        }
      }
    }

    if (status === "placed" && row.rel_attribute.toLowerCase() === "unknown") {
      issues.push(`line ${lineNumber} placed outreach cannot use unknown rel_attribute`);
    }

    qualifiedProspectCount += 1;
    channelCoverage.add(row.channel);
  });

  if (qualifiedProspectCount < options.minimumQualifiedProspects) {
    issues.push(`qualified outreach prospects ${qualifiedProspectCount}; expected at least ${options.minimumQualifiedProspects}`);
  }

  options.requiredChannels.forEach((channel) => {
    if (!channelCoverage.has(channel)) {
      issues.push(`missing outreach channel coverage: ${channel}`);
    }
  });

  return {
    channelCoverage: [...channelCoverage].sort((a, b) => options.requiredChannels.indexOf(a) - options.requiredChannels.indexOf(b)),
    issues,
    ok: issues.length === 0,
    qualifiedProspectCount,
    templateRowCount,
    totalRows: rowLines.length,
  };
}

export function formatSeoOutreachReadinessIssues(readiness: SeoOutreachReadiness) {
  return readiness.issues.map((issue) => `SEO outreach readiness: ${issue}`);
}
