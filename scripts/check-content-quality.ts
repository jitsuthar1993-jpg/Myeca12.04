import fs from "node:fs";
import path from "node:path";
import { loadStaticMdxBlogPosts } from "../server/data/static-blog-content.js";
import {
  evaluateDuplicateParagraphs,
  evaluateNearDuplicateContent,
  evaluateRepeatedHeadingLabels,
  evaluateRepeatedHeadingPrefixes,
  evaluateRepeatedHeadingSequences,
  evaluateRepeatedBoilerplate,
  evaluateRepeatedListOpenings,
  evaluateRepeatedLongBlocks,
  evaluateRepeatedProseOpenings,
  evaluateRepeatedSentences,
  evaluateRepeatedStructuredFragments,
  evaluateRepeatedTableRows,
  evaluatePublicContent,
  markDraftQualityIssuesAsWarnings,
  type ContentQualityIssue,
  type PublicContentContext,
} from "../shared/public-content-quality.js";

type Baseline = {
  needsRevision: number;
  issues?: Record<string, number>;
};

const rootDir = process.cwd();
const LEGAL_SHARED_COPY_ALLOWLIST = [
  "This estimate is for general information only and does not replace a filing-position review using your complete records and the applicable law.",
];
const ALLOWED_SHARED_HEADINGS = [
  "Frequently asked questions",
  "Official sources",
  "Official references",
  "Related services and preparation guides",
  "Related calculators and filing guides",
  "Related filing and record guides",
  "Related trust and support pages",
  "Related tax and compliance resources",
];
const ALLOWED_SHARED_HEADING_PREFIXES = [
  "Frequently asked questions",
  "Official sources",
  "Official references",
  "Related services and",
  "Related calculators and",
  "Related filing and",
  "Related tax and",
];
const PUBLIC_SOURCE_SLOP_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "hassle-free", pattern: /\bhassle[- ]free\b/i },
  { label: "seamless", pattern: /\bseamless(?:ly)?\b/i },
  { label: "unlock", pattern: /\bunlock\b/i },
  { label: "peace of mind", pattern: /\bpeace of mind\b/i },
  { label: "one-stop", pattern: /\bone-stop\b/i },
  { label: "game changer", pattern: /\bgame[- ]changer\b/i },
  { label: "revolutionize", pattern: /\brevolutioni[sz]e\b/i },
  { label: "cutting-edge", pattern: /\bcutting-edge\b/i },
  { label: "effortlessly", pattern: /\beffortlessly\b/i },
  { label: "designed to help", pattern: /\bdesigned to help\b/i },
  { label: "ever-evolving", pattern: /\bever-evolving\b/i },
  { label: "comprehensive solution", pattern: /\bcomprehensive solution\b/i },
  { label: "modern approaches", pattern: /\bmodern approaches\b/i },
  { label: "ultimate guide", pattern: /\bultimate guide\b/i },
  { label: "all-in-one", pattern: /\ball-in-one\b/i },
  { label: "end-to-end", pattern: /\bend-to-end\b/i },
  { label: "unsupported CA verification", pattern: /\bca[- ]verified\b/i },
  { label: "unsupported quality assurance", pattern: /\bquality assured\b/i },
  { label: "generic expert CA promotion", pattern: /\bexpert ca (?:support|assistance|team)\b/i },
  { label: "unsupported savings outcome", pattern: /\bsave lakhs\b/i },
  { label: "unsupported optimal-choice claim", pattern: /\bchoose the optimal\b/i },
  { label: "fear-based tax CTA", pattern: /\bdon't leave your taxes to chance\b/i },
  { label: "unsupported overpayment CTA", pattern: /\bstop overpaying taxes\b/i },
  { label: "generic CA booking CTA", pattern: /\bbook a ca now\b/i },
  { label: "vague comprehensive claim", pattern: /\bcomprehensive\b/i },
  { label: "generic expert guidance", pattern: /\bexpert guidance\b/i },
  { label: "generic holistic claim", pattern: /\bholistic\b/i },
  { label: "generic journey language", pattern: /\b(?:your|startup|filing|funding) journey\b/i },
  { label: "generic robust-support claim", pattern: /\brobust support\b/i },
  { label: "generic tailored-advice claim", pattern: /\btailored advice\b/i },
  { label: "blanket turnover claim", pattern: /\bmust register regardless of turnover\b/i },
  { label: "blanket ecommerce registration claim", pattern: /\bmandatory for all e-commerce operators\b/i },
  { label: "blanket input-credit claim", pattern: /\bavailable on all purchases\b/i },
  { label: "generic mastery heading", pattern: /\bexpert guide:\s*mastering\b/i },
  { label: "generic expert-guide heading", pattern: /\bexpert guide:\s*navigating\b/i },
  { label: "unsupported easy-filing claim", pattern: /\bitr filing made easy\b/i },
  { label: "unsupported easy-funding claim", pattern: /\beasy fund raising\b/i },
  { label: "unsupported speed claim", pattern: /\bget recognition fast\b/i },
  { label: "unsupported document-free claim", pattern: /\bfast,\s*document-free process\b/i },
  { label: "unsupported expedited outcome", pattern: /\bwe help expedite\b/i },
  { label: "unsupported payment coverage", pattern: /\ball major payment methods\b/i },
  { label: "unsupported fast-track processing", pattern: /\bfast-track processing\b/i },
  { label: "unsupported local CA expertise", pattern: /\blocal ca expertise\b/i },
  { label: "unsupported deadline guarantee", pattern: /\bnever miss (?:a )?(?:regulatory |compliance )?deadline(?:s)?\b/i },
  { label: "generic complete-guide claim", pattern: /\bcomplete guide\b/i },
  { label: "generic maximize-your claim", pattern: /\bmaximize your\b/i },
  { label: "generic expert-assistance claim", pattern: /\bexpert assistance\b/i },
  { label: "unsupported easy-ITR claim", pattern: /\beasy itr filing\b/i },
  { label: "unsupported fixed launch discount", pattern: /\bsave up to ₹?\s*500 on eligible plans\b/i },
  { label: "unstated current-rate assumption", pattern: /\b(?:at|based on) current rates\b/i },
  { label: "blanket employee-document claim", pattern: /\bmandatory for all employees\b/i },
  { label: "unsupported blanket CA-review promise", pattern: /\ba ca will review\b/i },
  { label: "unsupported universal CA-review promise", pattern: /\bca review is included in every plan\b/i },
  { label: "unsupported unscoped CA-review promise", pattern: /\ba ca reviews before filing\b/i },
  { label: "unsupported generic professional-review promise", pattern: /\bdocuments are reviewed by professionals\b/i },
  { label: "unsupported CA-guide attribution", pattern: /\bca tax guides\b/i },
  { label: "unsupported easy self-certification claim", pattern: /\beasy self-certification\b/i },
];
const PUBLIC_ROUTE_REGISTRY_FILES = [
  "public-routes.ts",
  "service-routes.ts",
  "calculator-routes.ts",
  "content-routes.ts",
];
const SHARED_PUBLIC_SOURCE_FILES = [
  "client/src/components/Header.tsx",
  "client/src/components/Onboarding.tsx",
  "client/src/components/CalculatorsSection.tsx",
  "client/src/components/EverythingSection.tsx",
  "client/src/components/FeaturesSection.tsx",
  "client/src/components/HeroSection.tsx",
  "client/src/components/HeroWithOptimizedImages.tsx",
  "client/src/components/ReadyToFileSection.tsx",
  "client/src/components/ServicesSummary.tsx",
  "client/src/components/TrustedBySection.tsx",
  "client/src/components/layout/Footer.tsx",
  "client/src/components/search/GlobalSearch.tsx",
  "client/src/components/seo/LeadMagnet.tsx",
  "client/src/pages/blog/[slug].page.tsx",
  "client/src/components/templates/ServicePageTemplate.tsx",
  "client/src/components/ui/engagement-tooltip.tsx",
];
const strict = process.argv.includes("--strict");
const checkBuilt = process.argv.includes("--built");
const checkDrafts = process.argv.includes("--drafts");
const verbose = process.argv.includes("--verbose");
function thresholdArgument(prefix: string, fallback: number) {
  const raw = process.argv.find((argument) => argument.startsWith(prefix))?.split("=")[1];
  const parsed = raw === undefined ? fallback : Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) {
    throw new Error(`${prefix}<number> must be greater than 0 and no greater than 1.`);
  }
  return parsed;
}
const nearDuplicateJaccard = thresholdArgument("--near-jaccard=", 0.2);
const nearDuplicateContainment = thresholdArgument("--near-containment=", 0.3);
const baseline = JSON.parse(
  fs.readFileSync(path.join(rootDir, "scripts", "content-quality-baseline.json"), "utf8"),
) as Baseline;

function resolvePublicSourceImport(fromSourcePath: string, specifier: string) {
  if (!specifier.startsWith("./") && !specifier.startsWith("../") && !specifier.startsWith("@/")) {
    return null;
  }

  const clientSourceDir = path.join(rootDir, "client", "src");
  const absoluteBase = specifier.startsWith("@/")
    ? path.join(clientSourceDir, specifier.slice(2))
    : path.resolve(path.dirname(path.join(rootDir, fromSourcePath)), specifier);
  const relativeToClient = path.relative(clientSourceDir, absoluteBase);
  if (relativeToClient.startsWith("..") || path.isAbsolute(relativeToClient)) return null;

  const candidates = path.extname(absoluteBase)
    ? [absoluteBase]
    : [
        ...[".ts", ".tsx", ".js", ".jsx"].map((extension) => `${absoluteBase}${extension}`),
        ...[".ts", ".tsx", ".js", ".jsx"].map((extension) => path.join(absoluteBase, `index${extension}`)),
      ];
  const match = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  return match ? path.relative(rootDir, match).replaceAll("\\", "/") : null;
}

function expandPublicSourceGraph(routeSources: Map<string, string[]>) {
  const queue = [...routeSources.keys()];

  while (queue.length) {
    const sourcePath = queue.shift()!;
    const absolutePath = path.join(rootDir, sourcePath);
    if (!fs.existsSync(absolutePath)) continue;
    const source = fs.readFileSync(absolutePath, "utf8");
    const specifiers = new Set<string>();

    for (const match of source.matchAll(/\b(?:import|export)\s+(?:type\s+)?(?:[^"'`;]*?\s+from\s+)?["']([^"']+)["']/g)) {
      specifiers.add(match[1]);
    }
    for (const match of source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
      specifiers.add(match[1]);
    }

    for (const specifier of specifiers) {
      const importedSourcePath = resolvePublicSourceImport(sourcePath, specifier);
      if (!importedSourcePath) continue;
      const inheritedRoutes = routeSources.get(sourcePath) ?? [];
      const existingRoutes = routeSources.get(importedSourcePath);
      if (!existingRoutes) {
        routeSources.set(importedSourcePath, [...inheritedRoutes]);
        queue.push(importedSourcePath);
        continue;
      }

      const nextRoutes = [...new Set([...existingRoutes, ...inheritedRoutes])];
      if (nextRoutes.length !== existingRoutes.length) {
        routeSources.set(importedSourcePath, nextRoutes);
        queue.push(importedSourcePath);
      }
    }
  }
}

function internalLinks(content: string) {
  return [...content.matchAll(/(?:href=["']|\]\()(\/[^"' )#?]+)/gi)].map((match) => match[1]);
}

function reviewerFor(post: ReturnType<typeof loadStaticMdxBlogPosts>[number]) {
  if (!post.reviewerName || !post.reviewerCredentialName || !post.reviewerCredentialId) return null;
  return {
    name: post.reviewerName,
    credentialName: post.reviewerCredentialName,
    credentialId: post.reviewerCredentialId,
    credentialAuthority: post.reviewerCredentialAuthority ?? null,
  };
}

function contextFor(post: ReturnType<typeof loadStaticMdxBlogPosts>[number]): PublicContentContext {
  return {
    route: `/blog/${post.slug}`,
    pageType: "blog",
    audience: post.targetAudience ? [post.targetAudience] : [post.audience ?? "both"],
    primaryKeyword: post.primaryKeyword,
    secondaryKeywords: post.secondaryKeywords,
    userIntent: post.userIntent ?? "informational",
    keyTopics: post.keyTopics?.length ? post.keyTopics : post.keyHighlights,
    officialSources: (post.sourceLinks ?? []).map((source) => ({
      label: source.label,
      url: source.url,
      checkedAt: source.checkedAt ?? null,
    })),
    author: { name: post.authorName, role: post.authorRole },
    reviewer: reviewerFor(post),
    editorialApproval:
      post.editorialApprovedBy && post.editorialApprovedAt
        ? { approvedBy: post.editorialApprovedBy, approvedAt: post.editorialApprovedAt }
        : null,
    qualityStatus: post.qualityStatus ?? "needs_revision",
  };
}

function publicSourceCopyIssues(): ContentQualityIssue[] {
  const routeSources = new Map<string, string[]>();
  const registryDir = path.join(rootDir, "client", "src", "routes", "registry");

  for (const registryName of PUBLIC_ROUTE_REGISTRY_FILES) {
    const registryPath = path.join(registryDir, registryName);
    const source = fs.readFileSync(registryPath, "utf8");
    for (const match of source.matchAll(/route\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g)) {
      const [, route, , sourcePath] = match;
      const routes = routeSources.get(sourcePath) ?? [];
      if (!routes.includes(route)) routes.push(route);
      routeSources.set(sourcePath, routes);
    }
  }
  for (const sourcePath of SHARED_PUBLIC_SOURCE_FILES) {
    if (!routeSources.has(sourcePath)) routeSources.set(sourcePath, []);
  }
  expandPublicSourceGraph(routeSources);

  const issues: ContentQualityIssue[] = [];
  for (const [sourcePath, routes] of routeSources) {
    const absolutePath = path.join(rootDir, sourcePath);
    if (!fs.existsSync(absolutePath)) continue;
    const source = fs.readFileSync(absolutePath, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
    for (const candidate of PUBLIC_SOURCE_SLOP_PATTERNS) {
      const match = source.match(candidate.pattern)?.[0];
      if (!match) continue;
      issues.push({
        code: "public_source_ai_slop",
        severity: "error",
        ...(routes.length ? { routes: routes.sort() } : { route: `source:${sourcePath}` }),
        message: `Replace "${match}" in ${sourcePath} with specific scope, evidence, or limitation copy.`,
      });
    }
  }
  return issues;
}

function sourceIssues() {
  const posts = loadStaticMdxBlogPosts(
    checkDrafts ? path.join(rootDir, "content", "blog-drafts") : undefined,
  );
  const issues: ContentQualityIssue[] = [];

  for (const post of posts) {
    const context = contextFor(post);
    issues.push(...evaluatePublicContent({
      context,
      title: post.title,
      description: post.description ?? post.seoDescription ?? post.excerpt,
      content: post.content,
      schemaSteps: post.steps,
      internalLinks: internalLinks(post.content),
    }));

    if ((post.reviewedBy || post.reviewedAt) && !context.reviewer) {
      issues.push({
        code: "unsupported_reviewer_attribution",
        severity: "error",
        route: context.route,
        message: "Generic reviewedBy/reviewedAt attribution is not supported by a verified named reviewer.",
      });
    }
    if (strict && !checkBuilt && context.qualityStatus !== "approved") {
      issues.push({
        code: "strict_unapproved_route",
        severity: "error",
        route: context.route,
        message: "Strict mode requires approved quality status and recorded human approval.",
      });
    }
  }

  issues.push(...evaluateDuplicateParagraphs(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
  ));
  issues.push(...evaluateNearDuplicateContent(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    nearDuplicateJaccard,
    nearDuplicateContainment,
  ));
  issues.push(...evaluateRepeatedBoilerplate(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
  ));
  issues.push(...evaluateRepeatedSentences(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    LEGAL_SHARED_COPY_ALLOWLIST,
  ));
  issues.push(...evaluateRepeatedStructuredFragments(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
  ));
  issues.push(...evaluateRepeatedLongBlocks(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    LEGAL_SHARED_COPY_ALLOWLIST,
  ));
  issues.push(...evaluateRepeatedListOpenings(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    [],
    8,
    6,
  ));
  issues.push(...evaluateRepeatedProseOpenings(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    [],
    8,
    6,
  ));
  issues.push(...evaluateRepeatedHeadingLabels(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    ALLOWED_SHARED_HEADINGS,
  ));
  issues.push(...evaluateRepeatedHeadingPrefixes(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
    ALLOWED_SHARED_HEADING_PREFIXES,
  ));
  issues.push(...evaluateRepeatedHeadingSequences(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
  ));
  issues.push(...evaluateRepeatedTableRows(
    posts.map((post) => ({ route: `/blog/${post.slug}`, content: post.content })),
  ));
  issues.push(...publicSourceCopyIssues());

  const needsRevision = posts.filter((post) => (post.qualityStatus ?? "needs_revision") === "needs_revision").length;
  return { posts, issues, needsRevision };
}

function findFiles(dir: string, name: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findFiles(entryPath, name);
    return entry.name === name ? [entryPath] : [];
  });
}

function visibleText(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function visibleTextByElement(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
}

function duplicateMetadataIssues(records: Array<{ route: string; title: string; description: string }>) {
  const issues: ContentQualityIssue[] = [];
  for (const field of ["title", "description"] as const) {
    const values = new Map<string, string[]>();
    for (const record of records) {
      const value = record[field].replace(/\s+/g, " ").trim().toLowerCase();
      if (!value) continue;
      const routes = values.get(value) ?? [];
      routes.push(record.route);
      values.set(value, routes);
    }
    for (const routes of values.values()) {
      if (routes.length < 2) continue;
      issues.push({
        code: `duplicate_${field}`,
        severity: "error",
        routes: routes.sort(),
        message: `Indexable routes must not share the same ${field}.`,
      });
    }
  }
  return issues;
}

function builtIssues(): { issues: ContentQualityIssue[]; count: number; needsRevision: number } {
  const distDir = path.join(rootDir, "dist", "public");
  if (!fs.existsSync(distDir)) {
    return {
      count: 0,
      needsRevision: 0,
      issues: [{
        code: "missing_built_routes",
        severity: "error",
        message: "Run the production build before checking built route content.",
      }],
    };
  }

  const issues: ContentQualityIssue[] = [];
  const records: Array<{ route: string; content: string; html: string }> = [];
  const metadataRecords: Array<{ route: string; title: string; description: string }> = [];
  let count = 0;
  for (const filePath of findFiles(distDir, "index.html")) {
    const html = fs.readFileSync(filePath, "utf8");
    if (!/<meta\s+name=["']robots["'][^>]+content=["']index,\s*follow(?:,|["'])/i.test(html)) continue;
    count += 1;
    const route = html.match(/data-static-route=["']([^"']+)/i)?.[1]
      ?? `/${path.relative(distDir, path.dirname(filePath)).replace(/\\/g, "/")}`.replace(/\/\.$/, "/");
    const shell = html.match(/<main class=["']static-seo-shell["'][\s\S]*?<\/main>/i)?.[0] ?? "";
    records.push({ route, content: shell, html });
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const description = html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ?? "";
    metadataRecords.push({ route, title, description });
    const publicCopy = `${title}\n${description}\n${visibleTextByElement(shell)}`;
    for (const candidate of PUBLIC_SOURCE_SLOP_PATTERNS) {
      const match = publicCopy.match(candidate.pattern)?.[0];
      if (!match) continue;
      issues.push({
        code: "built_public_ai_slop",
        severity: "error",
        route,
        message: `Replace "${match}" in crawler-visible content with specific scope, evidence, or limitation copy.`,
      });
    }
    const wordCount = visibleText(shell).split(/\s+/).filter(Boolean).length;
    if (!shell || wordCount < 100) {
      issues.push({
        code: "thin_crawler_visible_body",
        severity: "error",
        route,
        message: `Indexable static body has ${wordCount} visible words; expected at least 100.`,
      });
    }
    if (/CA MyeCA Review Desk|CA-reviewed guide|Official source baseline|Related MyeCA guide/i.test(shell)) {
      issues.push({
        code: "generic_or_unsupported_static_copy",
        severity: "error",
        route,
        message: "Crawler-visible content contains generic generated wording or unsupported review attribution.",
      });
    }
    const h1Count = (shell.match(/<h1\b/gi) ?? []).length;
    if (h1Count !== 1) {
      issues.push({
        code: "invalid_h1_count",
        severity: "error",
        route,
        message: `Indexable static body must contain exactly one H1; found ${h1Count}.`,
      });
    }
    const images = shell.match(/<img\b[^>]*>/gi) ?? [];
    if (images.some((image) => !/\balt=["'][^"']+["']/i.test(image))) {
      issues.push({
        code: "missing_image_alt",
        severity: "error",
        route,
        message: "Every crawler-visible image needs descriptive alternative text.",
      });
    }
  }
  issues.push(...evaluateDuplicateParagraphs(records));
  issues.push(...evaluateNearDuplicateContent(
    records,
    nearDuplicateJaccard,
    nearDuplicateContainment,
  ));
  issues.push(...evaluateRepeatedBoilerplate(records));
  issues.push(...evaluateRepeatedSentences(records, LEGAL_SHARED_COPY_ALLOWLIST));
  issues.push(...evaluateRepeatedStructuredFragments(records));
  issues.push(...evaluateRepeatedLongBlocks(records, LEGAL_SHARED_COPY_ALLOWLIST));
  issues.push(...evaluateRepeatedListOpenings(records));
  issues.push(...evaluateRepeatedProseOpenings(records));
  issues.push(...evaluateRepeatedHeadingLabels(records, ALLOWED_SHARED_HEADINGS));
  issues.push(...evaluateRepeatedHeadingPrefixes(records, ALLOWED_SHARED_HEADING_PREFIXES));
  issues.push(...evaluateRepeatedHeadingSequences(records));
  issues.push(...evaluateRepeatedTableRows(records));
  issues.push(...duplicateMetadataIssues(metadataRecords));

  const contextPath = path.join(distDir, "content-context.json");
  let needsRevision = 0;
  if (!fs.existsSync(contextPath)) {
    issues.push({
      code: "missing_content_context_manifest",
      severity: "error",
      message: "Static SEO generation must emit content-context.json for every indexable route.",
    });
  } else {
    const contexts = JSON.parse(fs.readFileSync(contextPath, "utf8")) as PublicContentContext[];
    const contextsByRoute = new Map(contexts.map((context) => [context.route, context]));
    needsRevision = contexts.filter((context) => context.qualityStatus === "needs_revision").length;
    if (contexts.length !== count) {
      issues.push({
        code: "incomplete_content_context_manifest",
        severity: "error",
        message: `Content context manifest has ${contexts.length} entries for ${count} indexable routes.`,
      });
    }
    for (const context of contexts) {
      if (
        !context.route ||
        !context.pageType ||
        !context.audience?.length ||
        !context.primaryKeyword ||
        !context.secondaryKeywords?.length ||
        !context.keyTopics?.length ||
        !context.author?.name ||
        !context.qualityStatus
      ) {
        issues.push({
          code: "incomplete_public_content_context",
          severity: "error",
          route: context.route,
          message: "Indexable route is missing required public content context fields.",
        });
      }
      if (context.officialSources?.some((source) => !source.label || !source.url || !source.checkedAt)) {
        issues.push({
          code: "incomplete_context_source",
          severity: "error",
          route: context.route,
          message: "Official source references require labels, URLs, and last-checked dates.",
        });
      }
      for (const source of context.officialSources ?? []) {
        try {
          const sourceUrl = new URL(source.url);
          const sourceHost = sourceUrl.hostname.toLowerCase().replace(/^www\./, "");
          const sourceRoute = sourceUrl.pathname.replace(/\/+$/, "") || "/";
          if (sourceHost === "myeca.in" && !contextsByRoute.has(sourceRoute)) {
            issues.push({
              code: "broken_first_party_source",
              severity: "error",
              route: context.route,
              message: `First-party source ${source.url} is not an indexable MyeCA route.`,
            });
          }
        } catch {
          // The evaluator reports malformed source URLs separately.
        }
      }
      if (context.qualityStatus === "hold") {
        issues.push({
          code: "indexed_hold_route",
          severity: "error",
          route: context.route,
          message: "Hold routes must not appear in the indexable context manifest.",
        });
      }
      if (strict && (context.qualityStatus !== "approved" || !context.editorialApproval)) {
        issues.push({
          code: "strict_unapproved_route",
          severity: "error",
          route: context.route,
          message: "Strict mode requires approved quality status and recorded human approval.",
        });
      }
    }
    for (const record of records) {
      const context = contextsByRoute.get(record.route);
      if (!context) {
        issues.push({
          code: "missing_route_content_context",
          severity: "error",
          route: record.route,
          message: "Indexable route is missing its public content context.",
        });
        continue;
      }
      const title = record.html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
      const description = record.html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ?? "";
      const links = [...record.content.matchAll(/<a\b[^>]+href=["'](\/[^"'#? ]+)/gi)].map((match) => match[1]);
      const imageAlts = [...record.content.matchAll(/<img\b[^>]*\balt=["']([^"']*)/gi)].map((match) => match[1]);
      const schemaTypes = [...record.html.matchAll(/"@type"\s*:\s*"([^"]+)"/gi)].map((match) => match[1]);
      issues.push(...evaluatePublicContent({
        context,
        title,
        description,
        content: record.content,
        internalLinks: links,
        imageAlts,
        schemaTypes,
      }));
    }
  }
  return { issues, count, needsRevision };
}

const rawSource = sourceIssues();
const source = checkDrafts && !strict
  ? { ...rawSource, issues: markDraftQualityIssuesAsWarnings(rawSource.issues) }
  : rawSource;
const built = checkBuilt ? builtIssues() : { issues: [], count: 0, needsRevision: 0 };
const allIssues = [...source.issues, ...built.issues];
const needsRevision = checkBuilt ? built.needsRevision : source.needsRevision;
const unresolvedErrors = allIssues.filter((item) => item.severity === "error");
const warnings = allIssues.filter((item) => item.severity === "warning");
const issueCounts = allIssues.reduce((counts, item) => {
  counts.set(item.code, (counts.get(item.code) ?? 0) + 1);
  return counts;
}, new Map<string, number>());
const blockingIssues: ContentQualityIssue[] = strict ? [...unresolvedErrors] : [];

if (!strict && !checkDrafts && needsRevision > baseline.needsRevision) {
  blockingIssues.push({
    code: "migration_baseline_regression",
    severity: "error",
    message: `needs_revision increased from baseline ${baseline.needsRevision} to ${needsRevision}.`,
  });
}
if (!strict && !checkDrafts) {
  for (const [code, count] of issueCounts) {
    const baselineCount = baseline.issues?.[code] ?? 0;
    if (count <= baselineCount) continue;
    blockingIssues.push({
      code: "migration_issue_regression",
      severity: "error",
      message: `${code} increased from baseline ${baselineCount} to ${count}.`,
    });
  }
}

console.log(
  `Content quality: ${source.posts.length} ${checkDrafts ? "draft blogs" : "blogs"}, ${checkBuilt ? built.count : "not requested"} built routes, ${needsRevision} needs_revision, ${unresolvedErrors.length} unresolved errors, ${warnings.length} warnings, ${blockingIssues.length} blocking regressions.`,
);
if (allIssues.length) {
  const issueSummary = [...issueCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([code, count]) => `${code}=${count}`)
    .join(", ");
  console.log(`Unresolved issue counts: ${issueSummary}`);
}
blockingIssues.slice(0, 40).forEach((item) => {
  console.error(`- [${item.code}] ${item.route ?? item.routes?.join(", ") ?? "catalog"}: ${item.message}`);
});
if (blockingIssues.length > 40) console.error(`- ...and ${blockingIssues.length - 40} more blocking regressions.`);
if (verbose) {
  unresolvedErrors.slice(0, 80).forEach((item) => {
    console.error(`- [unresolved:${item.code}] ${item.route ?? item.routes?.join(", ") ?? "catalog"}: ${item.message}`);
  });
  if (unresolvedErrors.length > 80) console.error(`- ...and ${unresolvedErrors.length - 80} more unresolved errors.`);
}
warnings.slice(0, 40).forEach((item) => {
  console.warn(`- [warning:${item.code}] ${item.route ?? item.routes?.join(", ") ?? "catalog"}: ${item.message}`);
});
if (warnings.length > 40) console.warn(`- ...and ${warnings.length - 40} more warnings.`);

if (blockingIssues.length) process.exit(1);
