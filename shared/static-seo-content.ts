import { stripHtml } from "./blog";

export type StaticRouteBodyInput = {
  route: string;
  title: string;
  description: string;
  kind: "home" | "homepage" | "service" | "article" | "blog-index" | "blog-post" | "about" | "contact" | "page";
  highlights?: string[];
  sections?: StaticRouteBodySection[];
  links?: StaticRouteBodyLink[];
  faqItems?: StaticRouteBodyFaqItem[];
  bodyHtml?: string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewerCredentialName?: string | null;
  reviewerCredentialId?: string | null;
};

export type StaticRouteBodySection = {
  heading: string;
  body: string;
  items?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
};

export type StaticRouteBodyLink = {
  label: string;
  href: string;
};

export type StaticRouteBodyFaqItem = {
  question: string;
  answer: string;
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
      const table = section.table && section.table.headers.length && section.table.rows.length
        ? `<table>
      <thead><tr>${section.table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${section.table.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody>
    </table>`
        : "";
      return `<section>
    <h2>${escapeHtml(section.heading)}</h2>
    <p>${escapeHtml(section.body)}</p>
    ${table}
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

function renderFaqs(faqItems: StaticRouteBodyFaqItem[] = []) {
  const items = faqItems
    .filter((faq) => faq.question.trim() && faq.answer.trim())
    .slice(0, 8);
  if (!items.length) return "";

  return `<section>
    <h2>Frequently asked questions</h2>
    ${items
      .map((faq) => `<article>
      <h3>${escapeHtml(faq.question)}</h3>
      <p>${escapeHtml(faq.answer)}</p>
    </article>`)
      .join("")}
  </section>`;
}

function renderByline(input: StaticRouteBodyInput) {
  const lines: string[] = [];
  if (input.authorName?.trim()) {
    lines.push(`Written by ${input.authorName.trim()}${input.authorRole?.trim() ? `, ${input.authorRole.trim()}` : ""}`);
  }
  if (input.reviewedBy?.trim()) {
    const credential =
      input.reviewerCredentialName?.trim() && input.reviewerCredentialId?.trim()
        ? `, ${input.reviewerCredentialName.trim()} ${input.reviewerCredentialId.trim()}`
        : "";
    const reviewedDate = input.reviewedAt?.trim() ? ` on ${input.reviewedAt.trim().split("T")[0]}` : "";
    lines.push(`Reviewed by ${input.reviewedBy.trim()}${credential}${reviewedDate}`);
  }
  if (!lines.length) return "";

  return `<p class="static-seo-byline">${lines.map(escapeHtml).join(" | ")}</p>`;
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
    ${renderByline(input)}
    ${dateLine}
  </section>
  ${renderHighlights(input.highlights)}
  ${renderSections(input.sections)}
  ${renderFaqs(input.faqItems)}
  ${renderLinks(input.links)}
  ${safeBody ? `<article>${safeBody}</article>` : ""}
</main>`;
}
