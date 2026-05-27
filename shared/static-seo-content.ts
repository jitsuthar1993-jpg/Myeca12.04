import { stripHtml } from "./blog";

export type StaticRouteBodyInput = {
  route: string;
  title: string;
  description: string;
  kind: "home" | "homepage" | "service" | "article" | "blog-index" | "blog-post" | "about" | "contact" | "page";
  highlights?: string[];
  sections?: StaticRouteBodySection[];
  links?: StaticRouteBodyLink[];
  bodyHtml?: string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
};

export type StaticRouteBodySection = {
  heading: string;
  body: string;
  items?: string[];
};

export type StaticRouteBodyLink = {
  label: string;
  href: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHighlights(highlights: string[] = []) {
  const items = highlights.filter(Boolean).slice(0, 8);
  if (!items.length) return "";

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderSections(sections: StaticRouteBodySection[] = []) {
  const rendered = sections
    .filter((section) => section.heading.trim() && section.body.trim())
    .map((section) => {
      const items = section.items?.filter(Boolean).slice(0, 6) ?? [];
      return `<section>
    <h2>${escapeHtml(section.heading)}</h2>
    <p>${escapeHtml(section.body)}</p>
    ${items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
  </section>`;
    })
    .join("\n");

  return rendered;
}

function renderLinks(links: StaticRouteBodyLink[] = []) {
  const items = links
    .filter((link) => link.label.trim() && link.href.trim())
    .slice(0, 10);
  if (!items.length) return "";

  return `<nav aria-label="Related tax filing resources">
    <h2>Related tax filing resources</h2>
    <ul>${items
      .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
      .join("")}</ul>
  </nav>`;
}

function labelForKind(kind: StaticRouteBodyInput["kind"]) {
  if (kind === "home" || kind === "homepage") return "CA-led tax-tech platform";
  if (kind === "service") return "Tax filing service";
  if (kind === "article") return "Tax guide";
  if (kind === "blog-index") return "Tax knowledge hub";
  if (kind === "blog-post") return "Tax guide";
  if (kind === "about") return "About myeca.in";
  if (kind === "contact") return "Contact myeca.in";
  return "myeca.in";
}

export function renderStaticRouteBody(input: StaticRouteBodyInput) {
  const description = escapeHtml(stripHtml(input.description));
  const shell = input.route === "/" ? "home" : "route";
  const safeBody = input.bodyHtml?.trim() || "";
  const dateLine =
    input.publishedAt || input.modifiedAt
      ? `<p class="static-seo-meta">Published ${escapeHtml(input.publishedAt || input.modifiedAt || "")}</p>`
      : "";

  return `<main class="static-seo-shell" data-seo-static-shell="${shell}" data-static-route="${escapeHtml(input.route)}">
  <section>
    <p class="static-seo-eyebrow">${escapeHtml(labelForKind(input.kind))}</p>
    <h1>${escapeHtml(input.title)}</h1>
    <p>${description}</p>
    ${dateLine}
  </section>
  ${renderHighlights(input.highlights)}
  ${renderSections(input.sections)}
  ${renderLinks(input.links)}
  ${safeBody ? `<article>${safeBody}</article>` : ""}
</main>`;
}
