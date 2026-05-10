# MyeCA Local Site Audit

Audit date: 2026-05-06  
Target: local workspace at `C:\Users\jitsu\OneDrive\Desktop\Websites\Myeca.in\Myeca12.04`  
Scope: visual/UI, backend/API, user flows, broken pages/links, sitemap, assets, and speed.  
Auth scope: structural only, no real credentials used.

## Executive Summary

The local site is not currently shippable because both TypeScript and production build fail. Browser testing was still possible against the existing listener on `127.0.0.1:5000`, and it confirmed one runtime-crashing route, one broken service URL, disabled frontend route guards, CSP failures on every sampled route, sitemap drift, missing public assets, and mobile overflow on key pages.

Top risks:

1. Fix the compile/build blockers in `dashboard.page.tsx` and `integrations.page.tsx`.
2. Restore real frontend auth and role guards before any production release.
3. Fix CSP so configured Supabase, Vercel Analytics, Speed Insights, and allowed inline/bootstrap behavior do not fail at runtime.
4. Repair `/integrations`, which crashes from a failed lazy import.
5. Add or redirect `/services/itr-for-salaried`, which currently shows Page Not Found.
6. Rebuild sitemap generation from the actual route/source-of-truth and exclude private routes.
7. Restore missing public assets, especially `manifest.json`, favicon PNGs, hero images, expert images, and tutorial images.
8. Add page-specific SEO metadata for default-title pages.
9. Fix mobile overflow on `/services/gst-registration` and admin views.
10. Add pagination/limits and OpenAPI coverage for backend endpoints.

## Evidence Collected

- `npm.cmd run check` failed with TypeScript parse errors.
- `npm.cmd run build` failed with Vite/esbuild parse errors.
- A local dev start attempt failed because port `5000` was already in use by a Node process.
- Browser crawl ran with Playwright Chromium against the existing `http://127.0.0.1:5000` listener.
- API checks were run with `Invoke-WebRequest` for `/api/health`, `/api/public/blogs`, `/api/admin/users`, `/openapi.json`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt`.
- Static route inventory found 151 client routes, 145 static routes, 137 lazy imports, and no missing lazy import files.
- Static sitemap inventory found 76 URLs in `client/public/sitemap.xml`; 67 public static client routes are not represented there.
- Static asset inventory found 38 referenced public assets that are not present under `client/public`.

## P0 Findings

### P0-1: TypeScript check fails

Area: build health  
Evidence: `npm.cmd run check` fails.

Errors include:

- `client/src/pages/dashboard.page.tsx(312,3): error TS1128: Declaration or statement expected.`
- `client/src/pages/dashboard.page.tsx(313,1): error TS1128: Declaration or statement expected.`
- `client/src/pages/integrations.page.tsx(22,13): error TS1005: ';' expected.`
- `client/src/pages/integrations.page.tsx(331,7): error TS17002: Expected corresponding JSX closing tag for 'Layout'.`

Impact: type safety, CI, production confidence, and any reliable automated audit are blocked.

Recommended fix: remove the duplicate closing `); }` in `dashboard.page.tsx`, reconstruct the missing top of the integrations data object, and close the `Layout` wrapper correctly in `integrations.page.tsx`.

### P0-2: Production build fails

Area: release blocker  
Evidence: `npm.cmd run build` fails in Vite/esbuild.

Primary error:

`client/src/pages/integrations.page.tsx:22:12: ERROR: Expected ";" but found ":"`

Impact: no production build can be produced from the current local repo.

Recommended fix: treat the integrations syntax repair as the first release task, then rerun `npm.cmd run build`.

### P0-3: `/integrations` crashes at runtime

Area: broken page, workflow  
Evidence: Playwright desktop and mobile crawl of `/integrations` showed:

- Page body starts with `JavaScript Error`.
- Page error: `Failed to fetch dynamically imported module: http://127.0.0.1:5000/src/pages/integrations.page.tsx`.
- No H1, no links, and horizontal overflow on mobile.

Impact: the integrations page is unusable and creates a visible app-shell error for users.

Recommended fix: repair `client/src/pages/integrations.page.tsx`, add a smoke test for the route, and verify it lazy-loads without console errors.

### P0-4: Frontend auth and role guards are disabled

Area: auth flow, access control  
Evidence:

- `client/src/components/auth/RequireAuth.tsx` returns `children` directly.
- `client/src/components/auth/RequireRole.tsx` returns `children` directly.
- `client/src/components/AuthProvider.tsx` is a mock local provider.
- Browser crawl showed `/dashboard`, `/admin`, and `/documents` rendering protected UI without a login redirect.

Impact: if this code path ships, private dashboard/admin/CA surfaces can render to unauthenticated users. Backend API calls still return `401`, but the UI itself is exposed and confusing.

Recommended fix: make mock auth explicitly development-only behind an environment flag, restore redirect/loading/forbidden behavior in guards, and add smoke tests for anonymous access to protected routes.

## P1 Findings

### P1-1: Salaried ITR service URL is broken

Area: broken page/link architecture  
Evidence: Playwright crawl of `/services/itr-for-salaried` returned the app shell with title `Page Not Found | MyeCA.in`, zero H1 elements, and Page Not Found body text. The route table registers the page at `/salary`, while the file is `client/src/pages/services/itr-for-salaried.page.tsx`.

Impact: a high-intent service landing page has no canonical service URL, which hurts SEO, ads, and user trust.

Recommended fix: add `<Route path="/services/itr-for-salaried" component={ITRForSalariedPage} />`; keep `/salary` only as a redirect/alias if it is needed.

### P1-2: CSP blocks first-party product integrations on every sampled route

Area: backend headers, auth, analytics  
Evidence: every browser-sampled route logged CSP failures for:

- `https://vedumlohmacaghuebduy.supabase.co/npm/@supabase/supabase-js@5/dist/supabase.browser.js`
- `https://va.vercel-scripts.com/v1/script.debug.js`
- `https://va.vercel-scripts.com/v1/speed-insights/script.debug.js`

Root header currently includes `script-src 'self' 'unsafe-inline'` and `connect-src 'self' https://api.myeca.in`, but does not allow Supabase or Vercel script/connect origins. The inline font `onload` and fallback `onclick` handler also conflict with `script-src-attr 'none'`.

Impact: auth bootstrapping, analytics, Speed Insights, and some inline fallback behavior fail noisily.

Recommended fix: decide whether those scripts are required in each environment. If yes, add explicit `script-src`, `script-src-elem`, and `connect-src` entries. If not, do not render those scripts until keys/origins are configured. Replace inline `onload` and `onclick` attributes with safe JS modules or nonce/hash policy.

### P1-3: Private application pages are reachable as routes

Area: user flow, access control  
Evidence: route table exposes application surfaces such as `/reports`, `/workflows`, `/teams`, and `/referrals` without a `RequireAuth` wrapper. Guarded routes like `/dashboard`, `/admin`, and `/documents` are also effectively public because guards are disabled locally.

Impact: users can enter app workflows in an unauthenticated or half-authenticated state and hit 401 API failures after UI render.

Recommended fix: classify all routes as public marketing, auth-only user app, team/admin, or CA. Wrap each non-public route at the route table level and verify anonymous redirects.

### P1-4: Sitemap is incomplete and includes private routes

Area: SEO, discovery  
Evidence:

- Static inventory found 151 client routes and 145 static client routes.
- `client/public/sitemap.xml` contains 76 URLs.
- 67 public static routes are missing from the static sitemap, including `/pricing`, `/learn`, `/help`, `/legal/privacy-policy`, `/legal/terms-of-service`, `/legal/refund-policy`, `/services/tax-planning`, and `/features/fastest-itr-filing`.
- The static sitemap includes `/dashboard`, which should not be a public SEO target.

Impact: search engines receive an incomplete and partially private route map.

Recommended fix: make one sitemap source of truth, preferably the server generator, and feed it an explicit public-route allowlist plus blog slugs. Exclude dashboards, admin, CA, account, documents, and authenticated app routes.

### P1-5: Missing public assets cause 404s and weak visual surfaces

Area: assets, PWA, visual quality  
Evidence: static inventory found 38 referenced assets missing from `client/public`, including:

- `/manifest.json`
- `/favicon-16x16.png`, `/favicon-32x32.png`, `/favicon-96x96.png`
- `/assets/hero-bg.webp`, `/assets/hero-bg.jpg`
- `/assets/images/hero-tax-filing.webp`, `/assets/images/hero-tax-filing.jpg`
- `/images/experts/*.jpg`
- `/images/tutorials/*.jpg`
- `/images/dashboard-illustration.svg`, `/images/calculator-illustration.svg`, `/images/reports-illustration.svg`

Browser crawl also logged recurring 404 resource failures.

Impact: PWA install metadata, SEO icons, prefetching, learning pages, expert cards, and visual polish are degraded.

Recommended fix: either add the assets, replace references with existing assets, or route them to `placeholder-image.svg` intentionally with alt text and no prefetch.

### P1-6: OpenAPI document does not match the backend surface

Area: backend API auditability  
Evidence: `/openapi.json` returns only `/api/health`, while route inventory found 119 route handlers across `server/routes/*`.

Impact: integration users and maintainers cannot rely on the published API spec.

Recommended fix: document at least public and authenticated endpoint groups, request/response schemas, auth requirements, and error codes. Generate this from route metadata if possible.

## P2 Findings

### P2-1: Production speed cannot be measured until build passes

Area: performance  
Evidence: production build fails before bundle artifacts are generated.

Dev-server timing is still useful as a warning signal:

| Route | Resources | Transfer | JS/source resources |
| --- | ---: | ---: | ---: |
| `/` | 158 | 2315 KB | 139 |
| `/services` | 133 | 1327 KB | 127 |
| `/blog` | 130 | 1231 KB | 117 |
| `/calculators/income-tax` | 130 | 1262 KB | 124 |

Impact: the app may be over-fetching code/resources during development, but production impact needs a successful build.

Recommended fix: after build repair, run Lighthouse or Playwright trace against `npm.cmd run start`, inspect chunk sizes, and confirm homepage LCP/CLS.

### P2-2: Several public pages use default SEO title

Area: SEO/content  
Evidence: browser crawl found the default title `MyeCA.in - Expert Income Tax Filing | ITR e-Filing in India` on `/itr/form-selector`, `/itr/filing`, `/learn`, `/pricing`, `/dashboard`, `/admin`, and `/integrations`.

Impact: important pages lack specific search snippets and browser titles.

Recommended fix: add route-specific SEO config and ensure each page renders `MetaSEO` or the canonical SEO component.

### P2-3: Mobile horizontal overflow exists

Area: visual/mobile UX  
Evidence: Playwright mobile viewport `390x844` found horizontal overflow on:

- `/services/gst-registration`
- `/admin`
- `/integrations`

Impact: mobile users can experience clipped content or sideways scrolling.

Recommended fix: audit fixed-width grids/tables/buttons on those pages, add `overflow-x-auto` to real tables, and avoid full-width children exceeding viewport padding.

### P2-4: React duplicate key warnings appear in key workflows

Area: runtime quality  
Evidence: browser console showed duplicate key warnings on `/pricing`, `/dashboard`, `/admin`, and `/documents`.

Known source example: `client/src/pages/pricing.page.tsx` uses `key={`${row[0]}-${cell}`}`, which duplicates when row cells repeat, such as `Included`.

Impact: React reconciliation may duplicate or omit children in affected lists.

Recommended fix: use stable unique IDs or include the index where values can repeat.

### P2-5: Placeholder and unfinished content is widespread

Area: content/workflow polish  
Evidence: static scan found placeholder-like markers in 126 files. Highest counts include:

- `client/src/features/itr/pages/step-by-step-guide.page.tsx`
- `client/src/pages/admin/blog.page.tsx`
- `client/src/features/itr/pages/compact-filing-guide.page.tsx`
- `client/src/components/documents/ResumeForm.tsx`
- `client/src/pages/documents/generators/invoice.tsx`

Impact: users may encounter incomplete states in production-looking flows.

Recommended fix: separate intentional "coming soon" product states from development placeholders, and remove `/api/placeholder` references.

### P2-6: Backend has duplicated and unmounted route modules

Area: backend maintainability  
Evidence: route inventory found 119 handlers, but several route files are not imported from `server/routes.ts`, including `2fa.ts`, `advanced-features.ts`, `ai-optimizer.ts`, `chat.ts`, `email.ts`, `feedback.ts`, and `two-factor.ts`.

Impact: dead or duplicated route modules make audit coverage and security review harder.

Recommended fix: remove unused modules or mount them intentionally with auth/rate-limit decisions documented.

### P2-7: Some backend queries are unbounded

Area: backend speed, scalability  
Evidence: examples include `server/routes/admin.ts` stats loading entire collections with `.get()` and `server/routes/audit.ts` loading all audit logs ordered by date.

Impact: admin dashboards and audit downloads may slow down or fail as data grows.

Recommended fix: add pagination, date ranges, aggregation/count endpoints, and export jobs for large audit downloads.

### P2-8: Error logging writes to a repo-root debug file

Area: backend hygiene, privacy  
Evidence: `/api/errors/log` in `server/routes.ts` appends client error payloads to `debug-ac3226.log` in the project root.

Impact: local debug artifacts can grow indefinitely and may collect sensitive client context.

Recommended fix: replace with environment-gated structured logging, scrub PII, and write outside the repo or into a real logging sink.

### P2-9: README references audit docs that are missing

Area: documentation  
Evidence: `README.md` links to `docs/WEBSITE_AUDIT.md` and `docs/WebsiteOptimization.md`, but neither file exists.

Impact: onboarding and maintenance docs point to dead files.

Recommended fix: update README to reference this audit report, or recreate those docs intentionally.

## Backend Health Notes

Positive signals:

- `/api/health` returns `200`.
- `/api/admin/users` returns `401` without credentials.
- `/api/public/blogs` returns `200` with public cache headers.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/openapi.json` are served.
- Helmet, CORS, compression, rate limits, and cache-control middleware exist.

Risks to resolve:

- Frontend route guards currently do not match backend auth behavior.
- CSP is too strict for scripts the client attempts to load.
- The local in-memory general API rate limiter is per-process and not durable across instances.
- OpenAPI is incomplete.
- DB-backed routes rely on environment variables; local warnings showed missing `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAILS`, `PII_ENCRYPTION_KEY`, and `SESSION_SECRET`.

## Visual And Flow Notes

Sampled public pages generally render an H1 and meaningful CTAs, but the audit found these flow problems:

- `/integrations` is a hard crash.
- `/services/itr-for-salaried` is a not-found page.
- `/dashboard`, `/admin`, and `/documents` render app UI without a login redirect in local mode.
- `/services/gst-registration` overflows horizontally on mobile.
- Repeated CSP console failures obscure real client errors.
- Missing assets weaken expert/tutorial/hero experiences and create 404 noise.

## Verification Commands

Use these commands after fixes:

```powershell
npm.cmd run check
npm.cmd run build
```

Then run a production-style local verification:

```powershell
$env:NODE_ENV='production'; npm.cmd run start
```

Recommended browser smoke set:

- `/`
- `/services`
- `/all-services`
- `/services/itr-for-salaried`
- `/calculators/income-tax`
- `/calculators/regime-comparator`
- `/itr/form-selector`
- `/itr/filing`
- `/blog`
- `/learn`
- `/help`
- `/pricing`
- `/contact`
- `/legal/privacy-policy`
- `/integrations`
- `/dashboard`
- `/admin`
- `/documents`
