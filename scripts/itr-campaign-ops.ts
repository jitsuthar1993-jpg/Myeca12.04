const allowedUtmMediums = new Set(["pr", "community", "partner", "newsletter", "outreach"]);
const allowedCalendarStatuses = new Set(["ready_to_draft", "ready_to_refresh", "published_asset"]);

const requiredCalendarColumns = [
  "week",
  "day",
  "content_type",
  "working_title",
  "intent_cluster",
  "primary_url",
  "tool_link",
  "conversion_link",
  "supporting_internal_link",
  "source_guardrail",
  "status",
];

const requiredProspectColumns = [
  "segment",
  "quota",
  "best_asset_to_pitch",
  "primary_pitch_angle",
  "sample_utm_url",
  "qualification_notes",
  "reject_if",
];

type CampaignOpsInput = {
  calendarCsv: string;
  prospectsCsv: string;
};

type CsvRow = Record<string, string>;

function parseCsvLineAware(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

export function parseCsv(text: string): CsvRow[] {
  const parsedRows = parseCsvLineAware(text.trim().replace(/^\uFEFF/, ""));
  const [headers, ...rows] = parsedRows;
  if (!headers) return [];

  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), row[index]?.trim() ?? ""])),
  );
}

function missingColumns(rows: CsvRow[], columns: string[]) {
  const availableColumns = new Set(Object.keys(rows[0] ?? {}));
  return columns.filter((column) => !availableColumns.has(column));
}

function isInternalRoute(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export function validateCampaignOps(input: CampaignOpsInput) {
  const errors: string[] = [];
  const calendarRows = parseCsv(input.calendarCsv);
  const prospectRows = parseCsv(input.prospectsCsv);

  if (calendarRows.length === 0) {
    errors.push("content calendar must have at least one row");
  }

  if (prospectRows.length === 0) {
    errors.push("prospect segment plan must have at least one row");
  }

  for (const column of missingColumns(calendarRows, requiredCalendarColumns)) {
    errors.push(`content calendar is missing required column ${column}`);
  }

  for (const column of missingColumns(prospectRows, requiredProspectColumns)) {
    errors.push(`prospect segment plan is missing required column ${column}`);
  }

  calendarRows.forEach((row, index) => {
    const rowNumber = index + 1;
    for (const column of ["primary_url", "tool_link", "conversion_link", "supporting_internal_link"]) {
      if (!isInternalRoute(row[column] ?? "")) {
        errors.push(`content calendar row ${rowNumber} ${column} must be an internal route`);
      }
    }
    if (!allowedCalendarStatuses.has(row.status)) {
      errors.push(`content calendar row ${rowNumber} status is unsupported: ${row.status}`);
    }
    if (!row.source_guardrail) {
      errors.push(`content calendar row ${rowNumber} source_guardrail is required`);
    }
  });

  let quotaTotal = 0;
  prospectRows.forEach((row, index) => {
    const rowNumber = index + 1;
    const quota = Number(row.quota);
    if (!Number.isFinite(quota) || quota <= 0) {
      errors.push(`prospect row ${rowNumber} quota must be a positive number`);
    } else {
      quotaTotal += quota;
    }

    try {
      const url = new URL(row.sample_utm_url);
      const medium = url.searchParams.get("utm_medium") ?? "";
      if (url.hostname !== "myeca.in") {
        errors.push(`prospect row ${rowNumber} sample_utm_url must use myeca.in`);
      }
      if (url.searchParams.get("utm_campaign") !== "itr-season-2026") {
        errors.push(`prospect row ${rowNumber} sample_utm_url must use utm_campaign=itr-season-2026`);
      }
      if (!allowedUtmMediums.has(medium)) {
        errors.push(`prospect row ${rowNumber} sample_utm_url has unsupported utm_medium ${medium}`);
      }
      if (!url.searchParams.get("utm_content")) {
        errors.push(`prospect row ${rowNumber} sample_utm_url must include utm_content`);
      }
    } catch {
      errors.push(`prospect row ${rowNumber} sample_utm_url must be a valid URL`);
    }

    if (!row.reject_if) {
      errors.push(`prospect row ${rowNumber} reject_if is required`);
    }
  });

  if (quotaTotal !== 900) {
    errors.push(`prospect quotas must sum to 900, got ${quotaTotal}`);
  }

  return errors;
}

export function summarizeCampaignOps(input: CampaignOpsInput) {
  const calendarRows = parseCsv(input.calendarCsv);
  const prospectRows = parseCsv(input.prospectsCsv);
  const quotaTotal = prospectRows.reduce((sum, row) => sum + Number(row.quota || 0), 0);
  return {
    calendarRows: calendarRows.length,
    prospectRows: prospectRows.length,
    quotaTotal,
  };
}
