export type JsonThing = Record<string, any>;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function findTitle(html: string) {
  return decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
}

export function countTitleTags(html: string) {
  return [...html.matchAll(/<title>[\s\S]*?<\/title>/gi)].length;
}

export function findMeta(html: string, nameOrProperty: string) {
  const tag = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]*>`, "i"))?.[0] ?? "";
  return decodeHtml(tag.match(/content=(["'])([\s\S]*?)\1/i)?.[2] ?? "");
}

export function findCanonical(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  return decodeHtml(tag.match(/href=(["'])([\s\S]*?)\1/i)?.[2] ?? "");
}

export function countCanonicals(html: string) {
  return [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)].length;
}

export function visibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseJsonLd(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]) as JsonThing);
}

export function flattenSchemaTypes(blocks: JsonThing[]) {
  return blocks.flatMap((block) => {
    const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [];
    return [block, ...graph].map((item) => item?.["@type"]).filter(Boolean);
  });
}

export function walkStrings(value: unknown, visitor: (value: string, key: string) => void, key = "") {
  if (typeof value === "string") {
    visitor(value, key);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visitor, `${key}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => walkStrings(childValue, visitor, childKey));
  }
}

export function relativeSchemaUrlIssues(blocks: JsonThing[]) {
  const issues: string[] = [];
  blocks.forEach((block) => {
    walkStrings(block, (value, key) => {
      if (!/url|@id|item|target|image|logo/i.test(key)) return;
      if (value.startsWith("/")) issues.push(`${key}: ${value}`);
    });
  });
  return issues;
}

export function bodyAnchors(html: string) {
  const body = html.match(/<body[\s\S]*?<\/body>/i)?.[0] ?? html;
  return [...body.matchAll(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: match[1].trim(),
      text: visibleText(match[2]),
    }));
}
