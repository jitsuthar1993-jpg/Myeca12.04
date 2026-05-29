# MyeCA.in — SEO Engineering Plan (Detailed, Implementation-Ready)

> Status: v2 — 2026-05-29 (supersedes v1; corrects the rendering assessment)
> Audience: Engineers. Every workstream below names the exact files to touch,
> the change to make, and an acceptance test.
> Stack: Vite 6 SPA (React 18, wouter, react-helmet-async) + Express/Vercel,
> build-time static prerendering, Supabase-backed blog, vite-plugin-pwa.

---

## 0. Architecture reality (read this first)

A v1 of this doc claimed the site ships a "blank-shell SPA." **That was wrong.**
The build already does build-time static prerendering. Confirmed in code:

- `package.json` → `"build": "tsx scripts/build-production.ts"`.
- `scripts/build-production.ts` runs `vite build` **then** `tsx scripts/generate-seo-assets.ts`.
- `scripts/generate-seo-assets.ts` writes a real `dist/public/<route>/index.html` for:
  - every `SEO_CONFIG` route that is not `noindex`,
  - every `getGeneratedPublicRoutes()` route,
  - every **static** blog post (`loadStaticBlogPosts()`),
  - every tax guide (`TAX_GUIDES`),
  - every `PRIVATE_NOINDEX_ROUTES` route (with `noindex` head).
- Each generated file gets, injected into the HTML **source** (not client-side):
  - `<title>`, `meta description`, `keywords`, `robots` + `googlebot`
    (`max-snippet:-1, max-image-preview:large`), self-referential `canonical`,
    full OG + Twitter tags, AI/LLM meta (`ai-agent-instructions`,
    `llm-content-summary`, `content-version`, `freshness-signal`,
    `expert-verification`), and JSON-LD (`renderSeoHead`, lines 505–537).
  - A semantic body injected into `#root` via `injectStaticBody` /
    `renderStaticRouteBody` (`shared/static-seo-content.ts`): real `<h1>/<h2>/<ul>`
    and a crawlable `<nav>` of `<a href>` links. Blog/guide pages inject the full
    article HTML (`bodyHtml`).
- `dist/public/sitemap.xml` + `robots.txt` are generated here too (and mirrored to
  `client/public/`). `vercel.json` `/(.*) → /index.html` is only the **fallback**
  for routes without a generated file.

**Implication:** the foundation is strong. The remaining work is about *coverage,
correctness, and depth* of what already exists — not a rewrite. Priorities reorder
accordingly.

### What's genuinely missing (the real gaps)
| # | Gap | Evidence | Tier |
|---|-----|----------|------|
| G1 | **DB-only blog posts are never prerendered.** Prerender reads only `loadStaticBlogPosts()` (static source). Posts authored via Supabase/admin that aren't synced to static content fall through to the SPA fallback shell. | `generate-seo-assets.ts:636`, `static-blog-content.ts:208` | P0 |
| G2 | **Validation covers only 7 routes.** `validate-static-seo.ts` asserts 6 pages + 1 blog post. The other ~140 prerendered routes are unchecked for title/description length, duplicates, canonical, or schema. | `validate-static-seo.ts:130–138` | P1 |
| G3 | **No per-page OG image.** All non-blog routes use `SHARED_DEFAULT_OG_IMAGE`; blog uses cover only if it's an absolute URL, else default. | `generate-seo-assets.ts:191, 238, 275, 466` | P1 |
| G4 | **Calculator pages have no `FAQPage` schema.** Only `SoftwareApplication`. FAQ rich results are a big win for calculator queries. | `schemaForConfig()` lines 170–225 | P1 |
| G5 | **Thin generic-route bodies.** Non-priority routes fall back to title + description + keyword "highlights" + boilerplate links. Fine for utility pages, weak for competitive ones. | `routeMeta()` lines 452–457 | P2 |
| G6 | **Internal linking is templated, not topical.** `staticLinks` default to the same 3–4 links; no cluster graph. | `renderStaticRootFallback` 329–335 | P2 |
| G7 | **E-E-A-T thin.** `reviewedBy` hardcoded to "Team myeca.in" Organization; no `Person`/CA credentials. | `generate-seo-assets.ts:241` | P2 |
| G8 | **PWA fallback can mask prerendered HTML.** `navigateFallback: "/index.html"` may serve the generic shell for a route that has its own prerendered file if the SW intercepts the navigation. | `vite.config.ts:31–53` | P0 |

---

## Tier P0 — Coverage & correctness of the existing prerender

### P0.1 — Prerender DB-authored blog posts (gap G1)
**Problem:** `scripts/generate-seo-assets.ts:636` calls `loadStaticBlogPosts()` — a
synchronous static source. Posts created through the Supabase admin CRUD that are not
mirrored into static content get no `dist/public/blog/<slug>/index.html`, so they serve
the SPA fallback (`/index.html`) with the generic home `<title>` until JS hydrates.

**Pick one fix:**

- **Option A — Sync DB → static at build (lowest risk, keeps prerender fully static).**
  Add a build step before `generate-seo-assets.ts` that pulls all published posts from
  Supabase and writes them into the static-content source consumed by
  `loadStaticBlogPosts()`. Wire into `build-production.ts`:
  ```ts
  // scripts/build-production.ts
  run("vite", ["build"]);
  run("tsx", ["scripts/sync-published-blogs-to-static.ts"]); // NEW: DB -> static
  run("tsx", ["scripts/generate-seo-assets.ts"]);
  ```
  The new script: `listPublishedBlogPosts()` (server/services/blog.ts) → normalize to
  the `StaticMdxBlogPost` shape → write. Must run with prod Supabase env on Vercel.
  Guard: if Supabase is unreachable, **fail the build** (don't silently ship missing pages).

- **Option B — On-publish revalidation.** Keep prerender static for the catalog, but make
  `/blog/:slug` an SSR/ISR function so newly published posts render server-side
  immediately. Heavier; only worth it if publish-to-live latency must be < a deploy cycle.
  The existing `blog-webhooks.ts` + `indexnow:submit` already implies an on-publish hook —
  extend it to trigger a redeploy (Option A) rather than standing up SSR.

**Recommendation:** Option A + webhook-triggered redeploy. It preserves the all-static
model the rest of the pipeline assumes.

**Acceptance test:**
1. Publish a post via admin only (not in static source).
2. `npm run build`.
3. Assert `dist/public/blog/<slug>/index.html` exists and
   `grep -i "<title>" dist/public/blog/<slug>/index.html` shows the post title.

### P0.2 — Prevent the PWA fallback from masking prerendered routes (gap G8)
`navigateFallback: "/index.html"` (`vite.config.ts:31`) makes Workbox serve the generic
shell for navigations it handles. For routes that have their own prerendered HTML, this can
shadow the route-specific HTML on repeat/offline visits, and — more importantly — we must
ensure crawlers never receive the SW-served shell.

**Actions:**
- Add the indexable content routes to `navigateFallbackDenylist` **or** switch to a
  `navigateFallbackAllowlist` limited to truly app-only routes. Today the denylist only
  covers private areas (`/admin`, `/dashboard`, …) — public content routes that have their
  own prerendered file should also bypass the SPA fallback so the SW doesn't serve the
  generic shell over them.
- Confirm the SW never precaches a route's prerendered `index.html` under the `/index.html`
  key (it shouldn't, since `globPatterns` caches each file at its own path — verify with the
  generated `service-worker.js` precache manifest).
- Crawlers don't run the SW, so first-crawl HTML is safe; this protects returning users and
  Lighthouse/field data. Keep `service-worker.js` `Cache-Control: no-cache` (already set,
  `vercel.json:11`).

**Acceptance test:** In a browser, hard-navigate to `/calculators/income-tax`, then reload
offline → the income-tax page renders, not the home shell.

### P0.3 — Canonical & redirect hygiene (verify, likely already correct)
Generated canonicals are self-referential absolute URLs via `toAbsoluteUrl` (good). Verify:
- No trailing-slash drift between `routeOutputPath` (writes `<route>/index.html`),
  the canonical, and the sitemap `<loc>`. Pick one form and assert all three agree
  (extend the P1 audit script to check).
- `www → non-www` 301 exists (`vercel.json:158`). Confirm HTTP→HTTPS and no chains.

---

## Tier P1 — Per-page metadata & schema (highest ROI after coverage)

### P1.1 — Whole-site metadata audit script (gap G2) — **build this**
`validate-static-seo.ts` only checks 7 routes. Add a script that validates **every**
generated HTML file. This is the single most useful new piece of tooling.

**New file:** `scripts/audit-seo-metadata.ts`
**New script:** `"check:seo-metadata": "tsx scripts/audit-seo-metadata.ts"`
Run it in `build-production.ts` after `generate-seo-assets.ts`, and in CI.

It should walk `dist/public/**/index.html` (reuse the HTML helpers already written in
`validate-static-seo.ts:27–60` — `findTitle`, `findMeta`, `findCanonical`, `visibleText`,
`parseJsonLd`, `flattenSchemaTypes`) and assert, per route:

```
- <title> present, 30–65 chars, and GLOBALLY UNIQUE across all routes
- meta description present, 120–160 chars, and GLOBALLY UNIQUE
- canonical present, absolute, == toAbsoluteUrl(route), trailing-slash consistent
- exactly one canonical, one <title>
- robots == "index, follow…" for public; "noindex" for PRIVATE_NOINDEX_ROUTES
- >= 1 JSON-LD block, all parse as valid JSON
- og:title / og:description / og:image / twitter:card all present
- visibleText length > 250 (no thin shells)  [already enforced for 7 routes]
- no relative URLs in schema url/@id/image fields (reuse assertAbsoluteSchemaUrls)
- every <a href> in body is non-empty and not "#"
```

Collect **all** failures and print a table (route → list of issues), exit non-zero if any.
Also emit a summary: duplicate-title clusters, duplicate-description clusters, longest/
shortest titles. This directly catches the kind of drift that accumulates across 150 routes
in `seo.config.ts`.

**Acceptance test:** Running it on the current build prints a report; intentionally
duplicating two titles in `seo.config.ts` makes it exit non-zero naming both routes.

### P1.2 — Add `FAQPage` schema + visible FAQs to calculators (gap G4)
`schemaForConfig()` (lines 170–225) gives calculators only `SoftwareApplication`. Add FAQs:
- Extend `SEOConfigItem` (in `client/src/config/seo.config.ts`) with an optional
  `faqItems?: { q: string; a: string }[]`.
- In `routeMeta()` / `schemaForConfig()`, when `config.faqItems?.length`, push a
  `buildFaqPageSchema(config.faqItems)` block (the builder already exists in
  `shared/seo-schema.ts`, used by blogs).
- Render those FAQs into the static body too (add an `faqItems` path to
  `renderStaticRouteBody`) so the schema is backed by visible content (Google requires
  the FAQ text to be present on-page).
- Seed 3–6 FAQs for the top ~15 calculators (income-tax, HRA, regime, GST, capital-gains,
  SIP, NPS, PPF, FD, TDS, gratuity, EMI). Target "is X taxable", "how is X calculated",
  "AY 2026-27" intents.

**Acceptance test:** `dist/public/calculators/income-tax/index.html` contains a `FAQPage`
JSON-LD block whose questions also appear as visible `<h3>/<p>` text; passes Google Rich
Results Test.

### P1.3 — Per-page / per-category OG images (gap G3)
All non-blog OG images are the default. Improvements, cheapest first:
- **Category defaults:** map `config.type` (calculator/service/article) → a branded OG image
  in `renderSeoHead` instead of one global default.
- **Per-page generation (better):** you already generate blog covers
  (`generate-blog-text-covers.ts`, uses `sharp`). Add a build step that renders an OG card
  (1200×630) per indexable route using the page title + category, writes to
  `dist/public/og/<route>.png`, and sets `meta.image` to it in the generator.
- Keep `og:image:width/height` 1200×630 (already emitted, lines 522–523).

**Acceptance test:** OG image URL differs per route; LinkedIn/Facebook debuggers show the
right card.

### P1.4 — Sitemap precision (mostly done; tighten)
`writeTextAssets()` already builds the sitemap with real `lastmod` for blog/guides and
`routePriority`/`routeChangefreq`. Verify in the P1.1 audit:
- No `noindex` or redirected URL appears in the sitemap.
- `lastmod` for blog/guides reflects content date, not build date (it does — `dynamicDateMap`).
- Once URL count grows past ~few hundred, split into a sitemap index (pages/blog/guides).
- IndexNow (`indexnow:submit`) fires on deploy/publish.

---

## Tier P2 — Content depth, internal linking, E-E-A-T (ongoing)

### P2.1 — Enrich thin generic-route bodies (gap G5)
`routeMeta()` falls back to keyword "highlights" + boilerplate for routes without
`PRIORITY_ITR_ROUTE_CONTENT`. The mechanism for rich content already exists — extend the
data, not the code:
- `shared/priority-itr-seo-content.ts` (`PRIORITY_ITR_ROUTE_CONTENT`) provides `highlights`,
  `sections`, and `links` per route, rendered into the static body. **Expand this map** to
  cover the top ~30 commercial routes (each calculator, each core service, each `/compare/*`
  page) with 2–4 real `sections` (150–300 words each), genuine highlights, and topical links.
- Comparison pages (`/compare/*alternative`) must contain a real feature/pricing table and
  honest pros/cons in `sections` — not boilerplate (thin templated comparison pages are a
  spam-policy risk and rank poorly).

**Acceptance test:** `visibleText` for each enriched route > 800 chars with multiple `<h2>`
sections; audit script (P1.1) confirms.

### P2.2 — Topical cluster + internal-link graph (gap G6)
Replace the fixed `staticLinks` defaults with a real cluster map.
- Add a `client/src/data/internal-links.ts` defining pillar→supporting relationships:
  - **ITR filing**: form-selector ↔ ITR-1/2/3/4 guides ↔ regime calculator ↔ ITR services.
  - **Deductions**: 80C/80D/HRA/NPS/home-loan calculators ↔ matching guides ↔ blogs.
  - **Capital gains**, **GST**, **TDS**, **startup/MSME** clusters likewise.
- Feed the relevant cluster links into each route's `staticLinks`/`body.links` in
  `generate-seo-assets.ts` so every calculator links to its explainer guide + service, and
  back. Goal: every important page reachable ≤ 3 clicks from `/`; no orphans.
- Audit: extend P1.1 to flag any indexable route with < 3 internal links or that is not
  linked **from** any other route (orphan detection).

### P2.3 — E-E-A-T for YMYL (gap G7)
Tax content is "Your Money or Your Life" — Google holds it to a high bar.
- Replace the hardcoded `reviewedBy: { Organization "Team myeca.in" }`
  (`generate-seo-assets.ts:241`) with a real `Person` reviewer carrying
  `hasCredential` (CA membership no.), where a named CA actually reviewed the post. Add an
  `author`/`reviewer` field to the blog/guide data model and thread it through
  `buildArticleSchema`.
- Render a visible "Written by … / Reviewed by CA …, M.No. …" byline + publish and
  last-updated dates into the article body.
- Strengthen `/about`, `/contact`, `/experts` with real entity details (registration,
  address, team) — reinforces the `Organization`/`AccountingService` schema already emitted.
- Add genuine `Review`/`AggregateRating` only where real and policy-compliant.
  `verifiedRating()` (lines 136–147) already guards against fake/zero ratings — keep that.

### P2.4 — Content freshness & AI discoverability (you're ahead here)
- `content-version` (`AY-2026-27-FY-2025-26`) and `freshness-signal` meta are emitted on
  every page — keep these current each filing season; stale tax rates are actively harmful.
- `llms.txt` / `llms-full.txt` are served and AI bots allowed in robots — keep
  `llms-full.txt` populated with canonical answers to top tax questions (drives ChatGPT/
  Perplexity citations and AI Overviews). Structure content as question `<h2>` + concise
  answer, reinforced by FAQ schema (P1.2).

---

## Tier P3 — Performance & monitoring (ongoing)

### P3.1 — Core Web Vitals
Code-splitting is in place (`vite.config.ts:179–207`: react-vendor/app-vendor/supabase/
icons/forms) and `web-vitals` is wired (`client/src/telemetry/browser.ts`,
`check:core-web-vitals`). After P0.2 (PWA) re-baseline on mobile:
- **LCP:** prerendered HTML already paints content pre-hydration — ensure the hero image/
  font is `preload`ed and not blocked by hydration.
- **INP:** lazy-load heavy calculator logic + any chart libs below the fold.
- **CLS:** reserve dimensions on `LazyImage`; PWA install prompt must not shift content.
- Make `check:core-web-vitals` thresholds a CI gate.

### P3.2 — Image SEO
Audit `alt` on all `LazyImage`/`<img>`; serve WebP/AVIF; explicit width/height; descriptive
filenames for generated OG/blog covers.

### P3.3 — Search Console / Bing ops
- Populate `VITE_GOOGLE_SITE_VERIFICATION` in prod (the generator strips invalid tokens via
  `stripInvalidGoogleVerificationMeta` — so an empty/placeholder token yields no tag).
- Submit sitemap; watch Coverage weekly; mirror in Bing Webmaster Tools. Existing
  `check:google-indexing`, `check:bing-indexing-evidence`, `check:search-engines`,
  `check:seo-deployment-parity` scripts already support this loop — run them in CI/post-deploy.

### P3.4 — Off-page
Digital PR + guest posts on Indian finance/startup publications; directory citations;
leverage the comparison-keyword angle. Prioritize with `check:seo-outreach-readiness`.

---

## Execution order & ownership

| Order | Item | Why first | Verify with |
|-------|------|-----------|-------------|
| 1 | **P0.1** DB-blog prerender sync | Missing pages = lost indexing on the freshest content | build asserts `<slug>/index.html` exists |
| 2 | **P0.2** PWA fallback denylist | Prevents shell masking content for users/field data | offline reload renders right page |
| 3 | **P1.1** whole-site metadata audit | Turns 150 unchecked routes into a CI gate; surfaces all other defects | `npm run check:seo-metadata` green |
| 4 | **P1.2** calculator FAQ schema | High-volume calculator queries → FAQ rich results | Rich Results Test |
| 5 | **P1.3** per-page OG images | CTR on social/SERP | LinkedIn/FB debugger |
| 6 | **P2.1–2.3** content depth, links, E-E-A-T | Compounding authority for YMYL niche | audit thresholds + GSC |
| 7 | **P3** CWV gate, image audit, GSC ops | Continuous | CI + Search Console |

## CI wiring (target end state)
```jsonc
// package.json scripts to run in CI after build:
"check:seo-metadata"          // NEW (P1.1) — all routes
"check:static-seo"            // existing — deep checks on 7 anchor routes
"check:priority-structured-data"
"check:core-web-vitals"
"check:seo-deployment-parity"
```
`build-production.ts` should run `generate-seo-assets.ts` → `check:seo-metadata` →
`validate-static-seo.ts` and fail the build on any error.

## Success metrics
- **Leading:** every published blog/guide has a prerendered file (0 SPA-fallback content
  pages); `check:seo-metadata` green; FAQ/Article/Service rich-result eligibility in GSC.
- **Lagging:** organic clicks/impressions, rankings for ITR filing / capital gains / GST
  registration / "[tool] alternative", rich-result appearances, AI-citation share.

---

## Appendix — key files
| Concern | File |
|---------|------|
| Build orchestration | `scripts/build-production.ts` |
| Prerender generator | `scripts/generate-seo-assets.ts` |
| Static body renderer | `shared/static-seo-content.ts` |
| Schema builders | `shared/seo-schema.ts` |
| Sitemap/robots/route helpers | `shared/seo-public.ts` |
| Priority route content | `shared/priority-itr-seo-content.ts` |
| Per-route SEO config (~150) | `client/src/config/seo.config.ts` |
| Generated routes | `client/src/data/missing-pages.ts` |
| Tax guides data | `client/src/data/tax-guides.ts` |
| Static blog source (prerender input) | `server/data/static-blog-content.ts` |
| DB blog service | `server/services/blog.ts` |
| Existing 7-route validator | `scripts/validate-static-seo.ts` |
| PWA / SW config | `vite.config.ts` (VitePWA) |
| Hosting routes/headers | `vercel.json` |
