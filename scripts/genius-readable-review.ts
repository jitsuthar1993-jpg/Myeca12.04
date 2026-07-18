import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const PARSER_VERSION = "officeparser@7.3.0";

const REVIEW_TAGS = [
  "div", "p", "span", "strong", "b", "em", "i", "u", "br", "hr",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "ol", "ul", "li", "h1", "h2", "h3", "h4", "h5", "h6",
  "sup", "sub", "blockquote", "pre", "code",
];

const REVIEW_ATTRIBUTES = [
  "class", "colspan", "rowspan", "headers", "scope", "title", "dir", "lang",
];

export type ReadableSourceFormat = "rtf" | "html";

export interface ReadableCatalogEntry {
  id: string;
  title: string;
  sourceFormat: ReadableSourceFormat | "encrypted";
  sourceRelativePath: string;
  sourceReadable: boolean;
  sourceByteLength: number;
  sourceSha256: string;
}

interface ConversionResultLike {
  value: unknown;
  messages: unknown[];
}

interface GenerateBundleOptions {
  repositoryRoot: string;
  sourceRoot: string;
  outputRoot: string;
  sourceCatalog: readonly ReadableCatalogEntry[];
  convertReadableSource: (
    sourceBytes: Buffer,
    sourceFormat: ReadableSourceFormat,
  ) => Promise<ConversionResultLike>;
}

interface BuildArtifactInput {
  id: string;
  title: string;
  sourceRelativePath: string;
  sourceFormat: ReadableSourceFormat;
  sourceBytes: Buffer;
  convertedHtml: string;
  parserMessages: unknown[];
}

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function countTextCharacters(html: string): number {
  const window = new JSDOM(html).window;
  const text = window.document.body.textContent?.replace(/\s+/g, "").trim() ?? "";
  window.close();
  return text.length;
}

export function sanitizeReadableReviewHtml(dirty: string): string {
  const window = new JSDOM("").window;
  const purifier = createDOMPurify(window);
  const sanitized = purifier.sanitize(dirty, {
    ALLOWED_TAGS: REVIEW_TAGS,
    ALLOWED_ATTR: REVIEW_ATTRIBUTES,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["style"],
  });
  window.close();
  return sanitized.trim();
}

export function buildReadableReviewArtifact(input: BuildArtifactInput) {
  const html = sanitizeReadableReviewHtml(input.convertedHtml);
  const structure = Object.freeze({
    tables: countMatches(html, /<table\b/gi),
    rows: countMatches(html, /<tr\b/gi),
    paragraphs: countMatches(html, /<p\b/gi),
    placeholders: countMatches(html, /\$#\$/g),
    textCharacters: countTextCharacters(html),
  });
  const conversionStatus = structure.textCharacters > 0
    ? "converted" as const
    : "source_content_missing" as const;

  return Object.freeze({
    id: input.id,
    title: input.title,
    sourceRelativePath: input.sourceRelativePath,
    sourceFormat: input.sourceFormat,
    sourceByteLength: input.sourceBytes.byteLength,
    sourceSha256: sha256(input.sourceBytes),
    outputByteLength: Buffer.byteLength(html, "utf8"),
    outputSha256: sha256(html),
    parser: PARSER_VERSION,
    parserMessageCount: input.parserMessages.length,
    structure,
    conversionStatus,
    reviewStatus: conversionStatus === "converted"
      ? "legal_review_required" as const
      : "source_recovery_required" as const,
    publicationAllowed: false as const,
    html,
  });
}

function assertSafeOutputRoot(repositoryRoot: string, outputRoot: string): void {
  const localRoot = resolve(repositoryRoot, ".local");
  const relativeOutput = relative(localRoot, outputRoot);
  if (!relativeOutput || relativeOutput.startsWith(`..${sep}`) || relativeOutput === "..") {
    throw new Error("Review artifacts must be written below the repository .local directory");
  }
}

export function parserFileTypeForSource(sourceFormat: ReadableSourceFormat) {
  return sourceFormat;
}

export async function generateReadableReviewBundle(options: GenerateBundleOptions) {
  const repositoryRoot = resolve(options.repositoryRoot);
  const sourceRoot = resolve(options.sourceRoot);
  const outputRoot = resolve(options.outputRoot);
  assertSafeOutputRoot(repositoryRoot, outputRoot);

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const runRoot = resolve(outputRoot, `review-run-${runId}`);
  const templatesRoot = resolve(runRoot, "templates");
  await mkdir(templatesRoot, { recursive: true });

  const readableEntries = options.sourceCatalog.filter(
    (entry): entry is ReadableCatalogEntry & { sourceFormat: ReadableSourceFormat } =>
      entry.sourceReadable && entry.sourceFormat !== "encrypted",
  );
  const manifestEntries = [];

  for (const entry of readableEntries) {
    const sourcePath = resolve(sourceRoot, entry.sourceRelativePath);
    const sourceBytes = await readFile(sourcePath);
    if (sourceBytes.byteLength !== entry.sourceByteLength || sha256(sourceBytes) !== entry.sourceSha256) {
      throw new Error(`Source integrity mismatch: ${entry.sourceRelativePath}`);
    }

    const conversion = await options.convertReadableSource(sourceBytes, entry.sourceFormat);
    const artifact = buildReadableReviewArtifact({
      ...entry,
      sourceBytes,
      convertedHtml: String(conversion.value),
      parserMessages: conversion.messages,
    });
    const outputRelativePath = `templates/${entry.id}.html`;
    await writeFile(resolve(runRoot, outputRelativePath), `${artifact.html}\n`, "utf8");
    const { html: _html, ...manifestEntry } = artifact;
    manifestEntries.push(Object.freeze({ ...manifestEntry, outputRelativePath }));
  }

  const manifest = Object.freeze({
    generatedAt: new Date().toISOString(),
    parser: PARSER_VERSION,
    reviewStatus: "mixed_review_required",
    publicationAllowed: false,
    readableSourceCount: manifestEntries.length,
    convertedSourceCount: manifestEntries.filter(
      (entry) => entry.conversionStatus === "converted",
    ).length,
    sourceContentMissingCount: manifestEntries.filter(
      (entry) => entry.conversionStatus === "source_content_missing",
    ).length,
    entries: manifestEntries,
  });
  const manifestPath = resolve(runRoot, "manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return Object.freeze({ runRoot, manifestPath, manifest });
}
