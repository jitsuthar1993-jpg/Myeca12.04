import fs from "node:fs";
import path from "node:path";
import {
  GOOGLE_SEARCH_REQUIRED_EVIDENCE_ITEMS,
  evaluateSearchGoalReadiness,
} from "../shared/search-goal-readiness.js";

type EvidenceRow = {
  date: string;
  evidence: string;
  item: string;
  next_action: string;
  status: string;
};

type Check = {
  detail: string;
  label: string;
  ok: boolean;
};

const evidenceLogPath = path.resolve("docs/google-search-console-evidence-log.csv");

const expectedHeaders = ["date", "item", "status", "evidence", "next_action"] as const;

const knownStatuses = new Set([
  "live_verified",
  "pending_external",
  "recorded",
  "repo_resolved",
  "repo_updated",
]);

const requiredItems = GOOGLE_SEARCH_REQUIRED_EVIDENCE_ITEMS;

const urlInspectionExpectations = new Map([
  ["URL Inspection homepage", "https://myeca.in/"],
  ["URL Inspection blog hub", "https://myeca.in/blog"],
  ["URL Inspection priority blog article", "https://myeca.in/blog/when-will-itr-filing-start-ay-2026-27"],
  ["URL Inspection salaried service", "https://myeca.in/services/itr-for-salaried"],
  ["URL Inspection income tax calculator", "https://myeca.in/calculators/income-tax"],
  ["URL Inspection form selector", "https://myeca.in/itr/form-selector"],
  ["URL Inspection Form 16 parser", "https://myeca.in/form16-parser"],
  ["URL Inspection ITR season hub", "https://myeca.in/itr-season-2026"],
  ["URL Inspection salary guide", "https://myeca.in/learn/guide/salary-tax-calculator-guide-ay-2026-27"],
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

function parseEvidenceLog(csv: string) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const [headerLine, ...rowLines] = lines;
  const headers = parseCsvLine(headerLine ?? "");

  const rows = rowLines.map((line, lineIndex) => {
    const fields = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, fields[index] ?? ""]));
    return {
      line: lineIndex + 2,
      row: row as EvidenceRow,
      width: fields.length,
    };
  });

  return { headers, rows };
}

function latestRowsByItem(rows: EvidenceRow[]) {
  const byItem = new Map<string, EvidenceRow[]>();

  for (const row of rows) {
    const existing = byItem.get(row.item) ?? [];
    existing.push(row);
    byItem.set(row.item, existing);
  }

  return byItem;
}

function printCheck(check: Check) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

function main() {
  const checks: Check[] = [];

  if (!fs.existsSync(evidenceLogPath)) {
    checks.push({
      label: "evidence log exists",
      ok: false,
      detail: `missing ${path.relative(process.cwd(), evidenceLogPath)}`,
    });
    checks.forEach(printCheck);
    process.exit(1);
  }

  const csv = fs.readFileSync(evidenceLogPath, "utf8");
  const { headers, rows: parsedRows } = parseEvidenceLog(csv);
  const rows = parsedRows.map(({ row }) => row);
  const byItem = latestRowsByItem(rows);

  checks.push({
    label: "evidence log headers",
    ok: expectedHeaders.every((header, index) => headers[index] === header) && headers.length === expectedHeaders.length,
    detail: headers.join(","),
  });

  checks.push({
    label: "evidence log has rows",
    ok: rows.length > 0,
    detail: `${rows.length} row(s)`,
  });

  const malformedLines = parsedRows
    .filter(({ width }) => width !== expectedHeaders.length)
    .map(({ line }) => line);
  checks.push({
    label: "evidence log CSV width",
    ok: malformedLines.length === 0,
    detail: malformedLines.length === 0 ? "all rows match header width" : `bad line(s): ${malformedLines.join(", ")}`,
  });

  const unknownStatuses = rows
    .filter((row) => !knownStatuses.has(row.status))
    .map((row) => `${row.item}:${row.status || "(empty)"}`);
  checks.push({
    label: "evidence log statuses",
    ok: unknownStatuses.length === 0,
    detail: unknownStatuses.length === 0 ? "all statuses known" : unknownStatuses.join("; "),
  });

  const missingItems = requiredItems.filter((item) => !byItem.has(item));
  checks.push({
    label: "required evidence items",
    ok: missingItems.length === 0,
    detail: missingItems.length === 0 ? `${requiredItems.length} required item(s) present` : missingItems.join("; "),
  });

  const emptyFields = rows
    .flatMap((row) =>
      expectedHeaders
        .filter((header) => !row[header]?.trim())
        .map((header) => `${row.item || "(missing item)"}.${header}`),
    );
  checks.push({
    label: "evidence log required fields",
    ok: emptyFields.length === 0,
    detail: emptyFields.length === 0 ? "all required fields filled" : emptyFields.join("; "),
  });

  const readiness = evaluateSearchGoalReadiness([{ name: "Google", csv, requiredItems }]);
  const latestPendingRows = readiness.pendingExternalEvidence;
  const completionClaims = rows.filter((row) => row.status !== "pending_external" && /TBD|awaiting/i.test(row.evidence));
  checks.push({
    label: "resolved evidence is concrete",
    ok: completionClaims.length === 0,
    detail: completionClaims.length === 0 ? "no resolved row uses TBD/awaiting evidence" : completionClaims.map((row) => row.item).join("; "),
  });

  const urlInspectionProblems = [...urlInspectionExpectations.entries()].filter(([item, url]) => {
    const itemRows = byItem.get(item) ?? [];
    return !itemRows.some((row) => row.evidence.includes(url));
  });
  checks.push({
    label: "URL Inspection queue URLs",
    ok: urlInspectionProblems.length === 0,
    detail: urlInspectionProblems.length === 0
      ? `${urlInspectionExpectations.size} URL inspection row(s) include target URLs`
      : urlInspectionProblems.map(([item, url]) => `${item} missing ${url}`).join("; "),
  });

  checks.push({
    label: "pending external evidence remains explicit",
    ok: true,
    detail: `${latestPendingRows.length} latest pending_external item(s) remain before completion can be claimed`,
  });
  checks.push({
    label: "latest evidence readiness policy",
    ok: readiness.issues.length === 0,
    detail: readiness.issues.length === 0 ? "latest rows satisfy completion status and placeholder policy" : readiness.issues.join("; "),
  });

  checks.forEach(printCheck);

  if (checks.some((check) => !check.ok)) {
    console.error("\nGoogle indexing evidence log check failed.");
    process.exit(1);
  }

  console.log("\nGoogle indexing evidence log is structurally ready.");
}

main();
