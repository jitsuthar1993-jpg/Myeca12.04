import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  analyzeTypographySource,
  filterTypographyIssues,
  type TypographyAllowlistEntry,
  type TypographyIssue,
} from "../client/src/lib/typography-audit.ts";

const routeSourcePath = "client/src/Routes.tsx";

const sharedUserTargets = [
  "client/src/components/auth/AuthPageShell.tsx",
  "client/src/components/admin/Layout.tsx",
  "client/src/components/mobile/index.tsx",
  "client/src/components/platform/compliance-ui.tsx",
  "client/src/components/ComparisonTable.tsx",
  "client/src/components/DailyUpdatesBanner.tsx",
  "client/src/components/EverythingSection.tsx",
  "client/src/components/HeroSection.tsx",
  "client/src/components/OtherServicesSection.tsx",
  "client/src/components/PenaltyCalculator.tsx",
  "client/src/components/ProfessionalServicesSection.tsx",
  "client/src/components/TaxRegimeComparison.tsx",
  "client/src/components/auth/SessionWarningModal.tsx",
  "client/src/components/blog/BlogArticle.tsx",
  "client/src/components/blog/BlogCard.tsx",
  "client/src/components/charts/lightweight-recharts.tsx",
  "client/src/components/chat/TaxChatbot.tsx",
  "client/src/components/dashboard/CompanyRegServiceCard.tsx",
  "client/src/components/dashboard/GSTServiceCard.tsx",
  "client/src/components/dashboard/ITRServiceCard.tsx",
  "client/src/components/layout/Footer.tsx",
  "client/src/components/layout/Header.tsx",
  "client/src/components/layout/SearchModal.tsx",
  "client/src/components/pricing/StandardPricingSection.tsx",
  "client/src/components/seo/FeaturedResources.tsx",
  "client/src/components/seo/FinancialGlossary.tsx",
  "client/src/components/tax/SectionReferenceBadge.tsx",
  "client/src/components/ui/brand-lockup.tsx",
  "client/src/components/ui/section-header.tsx",
  "client/src/features/calculators/components/CalcGlassSidebar.tsx",
  "client/src/features/calculators/components/CalcHero.tsx",
  "client/src/features/calculators/components/CalcInputCard.tsx",
  "client/src/features/calculators/components/CalcLayout.tsx",
  "client/src/features/calculators/components/SimpleFinancialCalculatorPage.tsx",
  "client/src/features/calculators/components/TaxStepIndicator.tsx",
  "client/src/features/calculators/components/TaxStickySidebar.tsx",
] as const;

const excludedRoutePatterns = [
  /^\/admin(?:\/|$)/,
  /^\/ca(?:\/|$)/,
  /^\/team(?:\/|$)/,
  /^\/analytics$/,
  /^\/analytics-dashboard$/,
] as const;

function toSourcePath(importPath: string) {
  return `client/src/${importPath.endsWith(".tsx") ? importPath : `${importPath}.tsx`}`;
}

function collectRouteTargets() {
  const routesSource = readFileSync(path.resolve(process.cwd(), routeSourcePath), "utf8");
  const componentToPath = new Map<string, string>();

  for (const match of routesSource.matchAll(
    /const\s+(\w+)\s*=\s*lazyWithRetry\(\(\) => import\(["']@\/(.*?)["']\)/g,
  )) {
    componentToPath.set(match[1], toSourcePath(match[2]));
  }

  for (const match of routesSource.matchAll(/import\s+(\w+)\s+from\s+["']@\/(.*?)["']/g)) {
    componentToPath.set(match[1], toSourcePath(match[2]));
  }

  const targets = new Set<string>();
  for (const match of routesSource.matchAll(
    /<Route\s+path=["']([^"']+)["'][\s\S]*?(?=<Route|<\/Switch>)/g,
  )) {
    const routePath = match[1];
    const routeBlock = match[0];

    if (excludedRoutePatterns.some((pattern) => pattern.test(routePath))) {
      continue;
    }

    for (const [componentName, target] of componentToPath) {
      if (new RegExp(`\\b${componentName}\\b`).test(routeBlock)) {
        targets.add(target);
      }
    }
  }

  targets.add("client/src/pages/not-found.tsx");
  return [...targets];
}

const auditTargets = [...new Set([...sharedUserTargets, ...collectRouteTargets()])]
  .filter((target) => existsSync(path.resolve(process.cwd(), target)))
  .sort();

// Add retained exceptions here with the narrowest path, rule, and class fragment.
const allowlist: TypographyAllowlistEntry[] = [];

function describeIssue(issue: TypographyIssue) {
  const ruleDescription = {
    "arbitrary-pixel": "Use a semantic type role or a standard Tailwind size.",
    "oversized-title": "Use type-page-title or document an approved type-hero-title exception.",
    "sub-12px": "User-page meta text should not drop below 12px without an allowlist entry.",
  }[issue.rule];

  return `${issue.path}:${issue.line} ${issue.rule} (${issue.classFragment}) ${ruleDescription}`;
}

const issues = auditTargets.flatMap((target) => {
  const absolutePath = path.resolve(process.cwd(), target);
  return analyzeTypographySource(target, readFileSync(absolutePath, "utf8"));
});

const failingIssues = filterTypographyIssues(issues, allowlist);

if (failingIssues.length > 0) {
  console.error("Typography audit found user-page outliers:");
  failingIssues.forEach((issue) => console.error(`- ${describeIssue(issue)}`));
  process.exitCode = 1;
} else {
  console.log(`Typography audit passed for ${auditTargets.length} migrated user-page files.`);
}

const retainedIssues = issues.length - failingIssues.length;
if (retainedIssues > 0) {
  console.log(`Typography audit retained ${retainedIssues} allowlisted exception(s).`);
}
