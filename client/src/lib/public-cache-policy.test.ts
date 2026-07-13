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
    const fontHeaders = vercel.headers.find((entry) => entry.source === "/fonts/(.*)")?.headers ?? [];

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
    expect(fontHeaders).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
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

    expect(html).toContain("/fonts/inter-latin-variable.woff2");
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).not.toContain("fonts.gstatic.com");
    expect(html).toContain('<link rel="preload" as="image" href="/icons/icon-192.png"');
    expect(html).toContain('content="https://myeca.in/og-default.png"');
    expect(app).toContain("import('@/components/pwa/PwaInstallBanner')");
    expect(app).not.toContain("import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner'");
    expect(main).not.toContain('import { initClientSentry } from "./telemetry/sentry.client"');
    expect(main).toContain('import("./telemetry/sentry.client")');
    expect(errorBoundary).not.toContain("import { captureClientException } from '@/telemetry/sentry.client'");
    expect(errorBoundary).toContain("import('@/telemetry/sentry.client')");
  });

  it("sets Google Consent Mode defaults before loading Tag Manager", () => {
    const html = read("client/index.html");
    const bootstrap = read("client/public/gtm-consent-bootstrap.js");
    const browserTelemetry = read("client/src/telemetry/browser.ts");
    const envExample = read(".env.example");
    const serverSecurity = read("server/middleware/security.ts");
    const viteConfig = read("vite.config.ts");
    const vercel = JSON.parse(read("vercel.json")) as {
      headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };
    const vercelCsp = vercel.headers
      .find((entry) => entry.source === "/(.*)")
      ?.headers.find((header) => header.key === "Content-Security-Policy")
      ?.value ?? "";
    const consentIndex = bootstrap.indexOf('"consent", "default"');
    const gtmIndex = bootstrap.indexOf("googletagmanager.com/gtm.js");

    expect(html).toContain('<script defer src="/gtm-consent-bootstrap.js" data-gtm-id="%VITE_GTM_ID%"></script>');
    expect(html).not.toContain('<script src="/gtm-consent-bootstrap.js" data-gtm-id="%VITE_GTM_ID%"></script>');
    expect(html).toMatch(/<body>\s*<!-- Google Tag Manager \(noscript\) -->/);
    expect(html).toContain("googletagmanager.com/ns.html?id=%VITE_GTM_ID%");
    expect(html).not.toContain("GTM-5H5QSCJC");
    expect(consentIndex).toBeGreaterThan(-1);
    expect(gtmIndex).toBeGreaterThan(-1);
    expect(consentIndex).toBeLessThan(gtmIndex);
    expect(bootstrap).toContain('ad_user_data: "denied"');
    expect(bootstrap).toContain('ad_personalization: "denied"');
    expect(bootstrap).toContain("document.currentScript");
    expect(bootstrap).not.toContain("GTM-5H5QSCJC");
    expect(envExample).toContain("VITE_GTM_ID=");
    expect(viteConfig).toContain('process.env.VITE_GTM_ID ??= "";');
    expect(browserTelemetry).toContain("config.gtmId || config.gaMeasurementId");
    expect(serverSecurity).toMatch(/frameSrc: \[[^\]]*"https:\/\/www\.googletagmanager\.com"/);
    expect(vercelCsp).toMatch(/frame-src[^;]*https:\/\/www\.googletagmanager\.com/);
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
