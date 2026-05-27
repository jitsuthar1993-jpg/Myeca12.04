export type SearchEvidenceLogInput = {
  csv: string;
  name: string;
  requiredItems?: readonly string[];
};

export type SearchEvidenceRow = {
  date: string;
  engine: string;
  evidence: string;
  item: string;
  line: number;
  nextAction: string;
  status: string;
};

export type SearchGoalReadiness = {
  issues: string[];
  ok: boolean;
  pendingExternalEvidence: SearchEvidenceRow[];
  totalLatestRows: number;
};

const EXPECTED_HEADERS = ["date", "item", "status", "evidence", "next_action"] as const;
const KNOWN_STATUSES = new Set([
  "live_verified",
  "pending_external",
  "recorded",
  "repo_resolved",
  "repo_updated",
]);
const PLACEHOLDER_TEXT = new Set(["", "tbd", "todo"]);
const OWNER_RECORDED_STATUSES = ["live_verified", "recorded"] as const;
const LIVE_VERIFIED_STATUSES = ["live_verified"] as const;
export const GOOGLE_SEARCH_REQUIRED_EVIDENCE_ITEMS = [
  "Search Console owner runbook",
  "Live technical indexing check",
  "Google visible coverage",
  "Search Console verification access",
  "Domain property",
  "DNS TXT verification",
  "HTML verification token",
  "Vercel domain access",
  "Sitemap submitted",
  "URL Inspection homepage",
  "URL Inspection blog hub",
  "URL Inspection priority blog article",
  "URL Inspection salaried service",
  "URL Inspection income tax calculator",
  "URL Inspection form selector",
  "URL Inspection Form 16 parser",
  "URL Inspection ITR season hub",
  "URL Inspection salary guide",
  "Rendered page view",
  "Page indexing report",
  "Field INP evidence",
  "Core Web Vitals lab",
  "SEO outreach readiness gate",
  "First outreach/publishing batch",
] as const;
export const BING_SEARCH_REQUIRED_EVIDENCE_ITEMS = [
  "SEO outreach readiness gate",
  "Bing indexing runbook",
  "Bing Webmaster Tools property",
  "Bing sitemap submitted",
  "IndexNow key configured",
  "IndexNow priority dry run",
  "IndexNow priority submission",
  "Bing URL Inspection homepage",
  "Bing URL Inspection blog hub",
  "Bing URL Inspection priority blog article",
  "Bing URL Inspection salaried service",
  "Bing URL Inspection income tax calculator",
  "Bing URL Inspection form selector",
  "Bing URL Inspection Form 16 parser",
  "Bing URL Inspection ITR season hub",
  "Bing URL Inspection salary guide",
  "Bing IndexNow report",
  "Bing search performance baseline",
] as const;
const COMPLETION_STATUS_REQUIREMENTS = new Map<string, readonly string[]>([
  ["SEO deployment parity live result", LIVE_VERIFIED_STATUSES],
  ["Custom domain ITR content depth", LIVE_VERIFIED_STATUSES],
  ["Live technical indexing check", LIVE_VERIFIED_STATUSES],
  ["Priority structured data live hosts", LIVE_VERIFIED_STATUSES],
  ["Vercel alias ITR content depth", LIVE_VERIFIED_STATUSES],
  ["Vercel domain access", OWNER_RECORDED_STATUSES],
  ["Domain property", OWNER_RECORDED_STATUSES],
  ["Sitemap submitted", OWNER_RECORDED_STATUSES],
  ["URL Inspection homepage", OWNER_RECORDED_STATUSES],
  ["URL Inspection blog hub", OWNER_RECORDED_STATUSES],
  ["URL Inspection priority blog article", OWNER_RECORDED_STATUSES],
  ["URL Inspection salaried service", OWNER_RECORDED_STATUSES],
  ["URL Inspection income tax calculator", OWNER_RECORDED_STATUSES],
  ["URL Inspection form selector", OWNER_RECORDED_STATUSES],
  ["URL Inspection Form 16 parser", OWNER_RECORDED_STATUSES],
  ["URL Inspection ITR season hub", OWNER_RECORDED_STATUSES],
  ["URL Inspection salary guide", OWNER_RECORDED_STATUSES],
  ["Google visible coverage", OWNER_RECORDED_STATUSES],
  ["Google visible coverage recheck", OWNER_RECORDED_STATUSES],
  ["Rendered page view", OWNER_RECORDED_STATUSES],
  ["Page indexing report", OWNER_RECORDED_STATUSES],
  ["Field INP evidence", OWNER_RECORDED_STATUSES],
  ["First outreach/publishing batch", OWNER_RECORDED_STATUSES],
  ["Bing Webmaster Tools property", OWNER_RECORDED_STATUSES],
  ["Bing sitemap submitted", OWNER_RECORDED_STATUSES],
  ["IndexNow key configured", OWNER_RECORDED_STATUSES],
  ["IndexNow priority dry run", ["recorded"]],
  ["IndexNow priority submission", OWNER_RECORDED_STATUSES],
  ["Bing IndexNow report", OWNER_RECORDED_STATUSES],
  ["Bing search performance baseline", OWNER_RECORDED_STATUSES],
]);

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

function latestRowsByItem(rows: SearchEvidenceRow[]) {
  const latestRows = new Map<string, SearchEvidenceRow>();
  rows.forEach((row) => {
    const existing = latestRows.get(row.item);
    if (!existing || row.date > existing.date || sameDayRowSupersedes(row, existing)) {
      latestRows.set(row.item, row);
    }
  });
  return [...latestRows.values()];
}

function sameDayRowSupersedes(row: SearchEvidenceRow, existing: SearchEvidenceRow) {
  return row.date === existing.date
    && row.status !== "pending_external"
    && existing.status === "pending_external";
}

function isValidIsoDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function isPlaceholderText(value: string) {
  return PLACEHOLDER_TEXT.has(value.trim().toLowerCase());
}

function formatStatusList(statuses: readonly string[]) {
  if (statuses.length <= 1) return statuses[0] ?? "(none)";
  return `${statuses.slice(0, -1).join(", ")} or ${statuses.at(-1)}`;
}

export function evaluateSearchGoalReadiness(logs: SearchEvidenceLogInput[]): SearchGoalReadiness {
  const issues: string[] = [];
  const latestRows: SearchEvidenceRow[] = [];
  const malformedRows = new Set<string>();

  logs.forEach((log) => {
    const lines = log.csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const [headerLine, ...rowLines] = lines;
    const headers = parseCsvLine(headerLine ?? "");

    const headerMatches =
      headers.length === EXPECTED_HEADERS.length
      && EXPECTED_HEADERS.every((header, index) => headers[index] === header);

    if (!headerMatches) {
      issues.push(`${log.name} evidence headers are ${headers.join(",") || "(missing)"}; expected ${EXPECTED_HEADERS.join(",")}`);
    }

    const rows = rowLines.map((line, index) => {
      const fields = parseCsvLine(line);
      const lineNumber = index + 2;

      if (fields.length !== EXPECTED_HEADERS.length) {
        issues.push(`${log.name} line ${lineNumber} has ${fields.length} CSV field(s); expected ${EXPECTED_HEADERS.length}`);
        malformedRows.add(`${log.name}:${lineNumber}`);
      }

      const [date = "", item = "", status = "", evidence = "", nextAction = ""] = fields;
      return {
        date,
        engine: log.name,
        evidence,
        item,
        line: lineNumber,
        nextAction,
        status,
      };
    });

    rows.forEach((row) => {
      if (!row.item) {
        issues.push(`${log.name} line ${row.line} is missing an item`);
      }
      if (!isValidIsoDate(row.date)) {
        issues.push(`${log.name} ${row.item || `line ${row.line}`} has invalid date ${row.date || "(empty)"}; expected YYYY-MM-DD`);
      }
      if (!KNOWN_STATUSES.has(row.status)) {
        issues.push(`${log.name} ${row.item || `line ${row.line}`} has unknown status ${row.status || "(empty)"}`);
      }
    });

    const rowItems = new Set(rows.map((row) => row.item));
    log.requiredItems?.forEach((item) => {
      if (!rowItems.has(item)) {
        issues.push(`${log.name} required evidence item is missing: ${item}`);
      }
    });

    latestRows.push(...latestRowsByItem(rows));
  });

  latestRows.forEach((row) => {
    if (row.status !== "pending_external" || malformedRows.has(`${row.engine}:${row.line}`)) {
      return;
    }

    if (isPlaceholderText(row.evidence)) {
      issues.push(`${row.engine} ${row.item || `line ${row.line}`} has placeholder evidence text: ${row.evidence || "(empty)"}`);
    }

    if (isPlaceholderText(row.nextAction)) {
      issues.push(`${row.engine} ${row.item || `line ${row.line}`} has placeholder next action text: ${row.nextAction || "(empty)"}`);
    }
  });

  latestRows.forEach((row) => {
    if (row.status === "pending_external" || malformedRows.has(`${row.engine}:${row.line}`)) {
      return;
    }

    const expectedStatuses = COMPLETION_STATUS_REQUIREMENTS.get(row.item);
    if (expectedStatuses && !expectedStatuses.includes(row.status)) {
      issues.push(`${row.engine} ${row.item} has status ${row.status || "(empty)"}; expected ${formatStatusList(expectedStatuses)}`);
    }
  });

  const pendingExternalEvidence = latestRows.filter((row) => row.status === "pending_external");

  return {
    issues,
    ok: issues.length === 0 && pendingExternalEvidence.length === 0,
    pendingExternalEvidence,
    totalLatestRows: latestRows.length,
  };
}

export function formatSearchGoalReadinessReport(readiness: SearchGoalReadiness, extraIssues: string[] = []) {
  const issues = [...extraIssues, ...readiness.issues];
  const lines = [`Search goal readiness checked ${readiness.totalLatestRows} latest evidence item(s).`];

  if (issues.length > 0) {
    lines.push("", "Evidence log issue(s):");
    issues.forEach((issue) => lines.push(`FAIL ${issue}`));
  }

  if (readiness.pendingExternalEvidence.length > 0) {
    lines.push("", "Pending owner/account evidence:");
    readiness.pendingExternalEvidence.forEach((row) => {
      lines.push(`FAIL ${row.engine} ${row.item}: ${row.evidence}`);
      lines.push(`     next: ${row.nextAction}`);
    });
  }

  lines.push("", issues.length || readiness.pendingExternalEvidence.length
    ? "Search goal readiness is not complete yet."
    : "Search goal readiness evidence is complete.");

  return lines.join("\n");
}
