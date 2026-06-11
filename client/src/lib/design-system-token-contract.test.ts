import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import tailwindConfig from "../../../tailwind.config";

const semanticColorTokens = {
  background: "background",
  foreground: "foreground",
  "card.DEFAULT": "card",
  "card.foreground": "card-foreground",
  "popover.DEFAULT": "popover",
  "popover.foreground": "popover-foreground",
  "primary.DEFAULT": "primary",
  "primary.foreground": "primary-foreground",
  "secondary.DEFAULT": "secondary",
  "secondary.foreground": "secondary-foreground",
  "muted.DEFAULT": "muted",
  "muted.foreground": "muted-foreground",
  "accent.DEFAULT": "accent",
  "accent.foreground": "accent-foreground",
  "destructive.DEFAULT": "destructive",
  "destructive.foreground": "destructive-foreground",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  border: "border",
  input: "input",
  ring: "ring",
  "chart.1": "chart-1",
  "chart.2": "chart-2",
  "chart.3": "chart-3",
  "chart.4": "chart-4",
  "chart.5": "chart-5",
  "sidebar.DEFAULT": "sidebar-background",
  "sidebar.foreground": "sidebar-foreground",
  "sidebar.primary": "sidebar-primary",
  "sidebar.primary-foreground": "sidebar-primary-foreground",
  "sidebar.accent": "sidebar-accent",
  "sidebar.accent-foreground": "sidebar-accent-foreground",
  "sidebar.border": "sidebar-border",
  "sidebar.ring": "sidebar-ring",
} as const;

function getNestedColor(colors: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, colors);
}

describe("design-system semantic color contract", () => {
  it("wraps raw HSL CSS variables so Tailwind opacity modifiers remain valid", () => {
    const colors = tailwindConfig.theme?.extend?.colors;

    for (const [path, token] of Object.entries(semanticColorTokens)) {
      expect(getNestedColor(colors, path), path).toBe(
        `hsl(var(--${token}) / <alpha-value>)`,
      );
    }
  });

  it("keeps the primary and focus-ring token pinned to the MyeCA brand blue", () => {
    const indexCss = readFileSync(
      resolve(process.cwd(), "client/src/index.css"),
      "utf8",
    );

    expect(indexCss).toMatch(/--primary:\s*226\.63 96\.19% 58\.82%;/);
    expect(indexCss).toMatch(/--ring:\s*226\.63 96\.19% 58\.82%;/);
  });

  it("defines one canonical light-theme foundation", () => {
    const tailwindSource = readFileSync(
      resolve(process.cwd(), "tailwind.config.ts"),
      "utf8",
    );
    const indexCss = readFileSync(
      resolve(process.cwd(), "client/src/index.css"),
      "utf8",
    );
    const designTokensCss = readFileSync(
      resolve(process.cwd(), "client/src/styles/design-tokens.css"),
      "utf8",
    );

    expect(tailwindSource).toContain(`600: "${"#" + "315efb"}"`);
    expect(tailwindSource).toContain('700: "#1f48db"');
    expect(tailwindSource).not.toContain("nav" + "y:");
    expect(tailwindSource).not.toContain('"cta-' + 'primary"');
    expect(tailwindSource).not.toContain('"primary-' + 'hover"');
    expect(designTokensCss).not.toMatch(/\.dark\b/);
    expect(
      designTokensCss.match(/prefers-reduced-motion:\s*reduce/g) ?? [],
    ).toHaveLength(1);
    expect(indexCss).not.toContain("--header-main-height");
    expect(indexCss).not.toContain("--page-top-padding");
    expect(indexCss).not.toContain("button:focus,\n  a:focus");
    expect(indexCss).toContain(":focus-visible {");
  });

  it("uses the shared article typography contract without the generated prose plugin", () => {
    const tailwindSource = readFileSync(
      resolve(process.cwd(), "tailwind.config.ts"),
      "utf8",
    );
    const typographyCss = readFileSync(
      resolve(process.cwd(), "client/src/styles/typography.css"),
      "utf8",
    );
    const articleConsumers = [
      "client/src/pages/blog/[slug].page.tsx",
      "client/src/components/blog/BlogArticle.tsx",
      "client/src/pages/documents/generator.page.tsx",
      "client/src/pages/services/document-vault.page.tsx",
    ].map((filePath) =>
      readFileSync(resolve(process.cwd(), filePath), "utf8"),
    );

    expect(tailwindSource).not.toContain("@tailwindcss/typography");
    expect(typographyCss).toContain(".type-article-prose :where(blockquote)");
    expect(typographyCss).toContain(".type-article-prose :where(th)");
    expect(typographyCss).toContain(".type-article-prose :where(code)");
    for (const source of articleConsumers) {
      expect(source).not.toMatch(/(?:^|[\s"'`])prose(?:\s|[-:])/m);
    }
  });

  it("keeps shared form and button primitives on semantic surface tokens", () => {
    const primitiveSources = [
      "client/src/components/ui/button.tsx",
      "client/src/components/ui/select.tsx",
      "client/src/components/ui/textarea.tsx",
    ].map((filePath) =>
      readFileSync(resolve(process.cwd(), filePath), "utf8"),
    );

    for (const source of primitiveSources) {
      expect(source).not.toMatch(/\b(?:bg-white|text-slate-|bg-slate-|border-slate-|ring-blue-)/);
    }
  });

  it("keeps private build metadata and fonts off the public critical-path leaks", () => {
    const indexHtml = readFileSync(
      resolve(process.cwd(), "client/index.html"),
      "utf8",
    );
    const performanceHints = readFileSync(
      resolve(process.cwd(), "client/src/utils/performance-hints.ts"),
      "utf8",
    );
    const mobilePerformanceOptimizer = readFileSync(
      resolve(process.cwd(), "client/src/utils/mobile-performance-optimizer.ts"),
      "utf8",
    );
    const artifactPaths = readFileSync(
      resolve(process.cwd(), "scripts/lib/build-artifact-paths.ts"),
      "utf8",
    );
    const artifactConsumers = [
      "scripts/generate-seo-assets.ts",
      "scripts/check-content-quality.ts",
      "scripts/generate-public-content-review-queue.ts",
    ].map((filePath) =>
      readFileSync(resolve(process.cwd(), filePath), "utf8"),
    );

    expect(indexHtml).not.toContain("fonts.googleapis.com");
    expect(indexHtml).not.toContain("fonts.gstatic.com");
    expect(indexHtml).toContain("/fonts/inter-latin-variable.woff2");
    expect(performanceHints).not.toContain("fonts.googleapis.com");
    expect(performanceHints).not.toContain("fonts.gstatic.com");
    expect(mobilePerformanceOptimizer).not.toContain("fonts.googleapis.com");
    expect(mobilePerformanceOptimizer).not.toContain("/css/critical.css");
    expect(mobilePerformanceOptimizer).not.toContain("/js/critical.js");
    expect(artifactPaths).toContain('"dist", "meta"');
    for (const source of artifactConsumers) {
      expect(source).toContain("contentContextPath");
      expect(source).not.toContain("dist/public/content-context.json");
    }
  });
});
