import { PRIORITY_ITR_SEARCH_ROUTES } from "./search-engine-readiness";

export const DEFAULT_CANONICAL_SEO_HOST = "https://myeca.in";
export const DEFAULT_ALIAS_SEO_HOST = "https://myeca12-04.vercel.app";
export const SEO_DEPLOYMENT_PARITY_ROUTES = PRIORITY_ITR_SEARCH_ROUTES;
export const SEO_DEPLOYMENT_PARITY_WORD_TOLERANCE = 20;

export type SeoDeploymentSignature = {
  canonical: string;
  contentFingerprint: string;
  internalLinkCount: number;
  route: string;
  staticShellMarker: string;
  title: string;
  wordCount: number;
};

function findTitle(html: string) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function findCanonicalHref(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  return tag.match(/href=["']([^"']*)["']/i)?.[1] ?? "";
}

function findStaticShellMarker(html: string) {
  return html.match(/data-seo-static-shell=["']([^"']+)["']/i)?.[1] ?? "";
}

function visibleText(html: string) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function internalLinks(html: string, route: string) {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)]
    .map((match) => match[1].split(/[?#]/)[0])
    .filter((href) => href.startsWith("/") && href !== route);
  return [...new Set(links)];
}

function fingerprint(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
}

export function createSeoDeploymentSignature(route: string, html: string): SeoDeploymentSignature {
  const text = visibleText(html);

  return {
    route,
    title: findTitle(html),
    canonical: findCanonicalHref(html),
    staticShellMarker: findStaticShellMarker(html),
    wordCount: wordCount(text),
    internalLinkCount: internalLinks(html, route).length,
    contentFingerprint: fingerprint(text.toLowerCase()),
  };
}

export function compareSeoDeploymentSignatures(
  canonical: SeoDeploymentSignature,
  alias: SeoDeploymentSignature,
) {
  const issues: string[] = [];
  const wordDifference = Math.abs(canonical.wordCount - alias.wordCount);

  if (canonical.title !== alias.title) {
    issues.push(`title differs: canonical "${canonical.title}" vs alias "${alias.title}"`);
  }
  if (canonical.canonical !== alias.canonical) {
    issues.push(`canonical differs: canonical ${canonical.canonical || "(missing)"} vs alias ${alias.canonical || "(missing)"}`);
  }
  if (canonical.staticShellMarker !== alias.staticShellMarker) {
    issues.push(`static shell marker differs: canonical ${canonical.staticShellMarker || "(missing)"} vs alias ${alias.staticShellMarker || "(missing)"}`);
  }
  if (wordDifference > SEO_DEPLOYMENT_PARITY_WORD_TOLERANCE) {
    issues.push(`word count differs by ${wordDifference} words`);
  }
  if (canonical.internalLinkCount !== alias.internalLinkCount) {
    issues.push(`internal link count differs: canonical ${canonical.internalLinkCount} vs alias ${alias.internalLinkCount}`);
  }
  if (canonical.contentFingerprint !== alias.contentFingerprint) {
    issues.push("visible text fingerprint differs");
  }

  return issues;
}
