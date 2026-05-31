import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("public performance cache policy", () => {
  it("keeps Vercel assets cacheable without long-lived fallback poisoning", () => {
    const vercel = JSON.parse(read("vercel.json")) as {
      headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };
    const textCoverHeaders = vercel.headers.find((entry) => entry.source === "/assets/blog/text-covers/(.*)")?.headers ?? [];
    const assetHeaders = vercel.headers.find((entry) => entry.source === "/assets/(.*)")?.headers ?? [];
    const bootstrapHeaders = vercel.headers.find((entry) => entry.source === "/app-bootstrap.js")?.headers ?? [];

    expect(textCoverHeaders).toContainEqual({
      key: "Cache-Control",
      value: "no-cache",
    });
    expect(assetHeaders).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=86400, stale-while-revalidate=604800",
    });
    expect(bootstrapHeaders).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=3600, stale-while-revalidate=86400",
    });
  });

  it("keeps crawlable static shell styles available before React hydration", () => {
    const html = read("client/index.html");
    const staticSeoCss = read("client/public/static-seo-shell.css");

    expect(html).toContain(".static-seo-shell{");
    expect(html).toContain(".static-seo-shell h1{");
    expect(staticSeoCss).toContain(".static-seo-shell{");
    expect(staticSeoCss).toContain(".static-seo-shell h1{");
  });

  it("keeps font and splash-image hints lean for first paint", () => {
    const html = read("client/index.html");
    const app = read("client/src/App.tsx");
    const main = read("client/src/main.tsx");
    const errorBoundary = read("client/src/components/ErrorBoundary.tsx");

    expect(html).toContain("Inter:wght@400;500;600;700&display=swap");
    expect(html).not.toContain("Inter:wght@400;500;600;700;800;900&display=swap");
    expect(html).toContain('<link rel="preload" as="image" href="/icons/icon-192.png"');
    expect(html).toContain('content="https://myeca.in/og-image.jpg"');
    expect(app).toContain("import('@/components/pwa/PwaInstallBanner')");
    expect(app).not.toContain("import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner'");
    expect(main).not.toContain('import { initClientSentry } from "./telemetry/sentry.client"');
    expect(main).toContain('import("./telemetry/sentry.client")');
    expect(errorBoundary).not.toContain("import { captureClientException } from '@/telemetry/sentry.client'");
    expect(errorBoundary).toContain("import('@/telemetry/sentry.client')");
  });

  it("keeps Workbox cache bounds tight for generated public assets", () => {
    const viteConfig = read("vite.config.ts");

    expect(viteConfig).toContain("maximumFileSizeToCacheInBytes: 2 * 1024 * 1024");
    expect(viteConfig).toContain('globPatterns: ["index.html", "**/*.{js,css,png,svg,webp,json,woff2}"]');
    expect(viteConfig).toContain('globIgnores: ["assets/logos/*"]');
    expect(viteConfig).not.toContain('globPatterns: ["**/*.{js,css,html,png,svg,webp,json,woff2}"]');
    expect(viteConfig).toContain("publicDocumentRoutePattern");
    expect(viteConfig).toContain("publicDocumentUrlPattern");
    expect(viteConfig).toContain("^https?:\\\\/\\\\/[^/?#]+");
    expect(viteConfig).toContain('cacheName: "myeca-public-documents"');
    expect(viteConfig).toContain('handler: "NetworkFirst"');
    expect(viteConfig).toContain('url.pathname.startsWith("/assets/blog/text-covers/")');
    expect(viteConfig).toContain('cacheName: "myeca-blog-text-covers"');
    expect(viteConfig).toContain("maxEntries: 80");
    expect(viteConfig).toContain("maxAgeSeconds: 60 * 60");
    expect(viteConfig).not.toContain('id.includes("node_modules/d3-")');
    expect(viteConfig).not.toContain('id.includes("node_modules/lodash")');
  });

  it("marks deferred public sections with layout containment", () => {
    const homePage = read("client/src/pages/home.page.tsx");
    const blogPage = read("client/src/pages/blog.page.tsx");
    const quickAnswersIndex = blogPage.indexOf("Quick answers");
    const blogFaqSectionStart = blogPage.lastIndexOf("<section", quickAnswersIndex);
    const blogFaqSection = blogPage.slice(blogFaqSectionStart, quickAnswersIndex);

    expect(homePage).toContain("contentVisibility: 'auto', contain: 'content'");
    expect(homePage).toContain('breadcrumbs={[');
    expect(homePage).toContain('{ name: "Home", url: "/" }');
    expect(blogFaqSection).toContain("contentVisibility: 'auto'");
    expect(blogFaqSection).toContain("contain: 'content'");
  });
});
