# Google Indexing Remediation Status

Last live technical check: May 27, 2026 against `https://myeca.in` with `npm.cmd run check:google-indexing`. The live checker now passes all required technical checks and detects a Google Search Console DNS TXT token for `myeca.in`. The current May 27 production deployment (`dpl_FbBhano3NzZDECwtMn2P6aiJQpws`) passes the ITR content-depth gate on `https://myeca12-04.vercel.app`, while the custom domain still needs the domain-owner account to point `myeca.in` at that deployment.

This ledger maps the original Google Search and Search Console risk list to the current repo and live-deployment evidence. Keep `docs/google-search-console-evidence-log.csv` as the fillable owner log for account-side proof, and use `docs/google-search-console-owner-runbook.md` for the exact owner-side Search Console session.

## Current Summary

Repo-side technical remediation is in place for sitemap coverage, robots policy, public/private indexability, pre-hydration SEO shells with article highlights, internal linking, ITR-season content assets, backlink planning, Vercel cache-header hardening, lab Core Web Vitals checks, the local `check:itr-season-seo-content` gate for priority ITR content depth, `check:priority-structured-data` for clean route JSON-LD, `check:seo-deployment-parity` for canonical-domain versus Vercel-alias drift, `check:seo-outreach-readiness` for tracker quality, and `check:search-goal-readiness` as the final evidence gate across Google/Bing logs plus the live outreach tracker.

The remaining blockers are account-side and evidence-side:

- Search Console DNS TXT verification is now technically detectable by the live checker, but the owner-side Search Console property state still needs UI evidence in `docs/google-search-console-evidence-log.csv`.
- Sitemap submission, URL Inspection, rendered-page confirmation, request-indexing clicks, and Page indexing report review must be completed in the Google Search Console UI.
- `docs/google-search-console-owner-runbook.md` now defines the required owner-side verification, sitemap, URL Inspection, rendered-page, field INP, and outreach evidence fields.
- `npm run check:google-indexing-evidence` validates the owner evidence log structure and confirms remaining `pending_external` blockers stay explicit.
- Field INP must be recorded from CrUX, Vercel Speed Insights, or Search Console because synthetic Chromium may not expose route interaction timing.
- Real backlink placements still need owner/operator outreach; the repo has the backlink outreach tracker and ready-to-send pitch kit, not earned external links.
- This workspace can deploy `enon3101s-projects/myeca12-04`, and the Vercel alias `https://myeca12-04.vercel.app` serves the latest deployed static SEO shell from `dpl_FbBhano3NzZDECwtMn2P6aiJQpws`. The custom domain `myeca.in` is not available under this Vercel scope; a fresh May 27 `npx vercel domains inspect myeca.in --scope enon3101s-projects` attempt failed with a no-access error. DNS currently resolves `myeca.in` to `64.29.17.65` and `216.198.79.65`, with Vercel DNS authority `ns1.vercel-dns.com`, so the remaining step is account ownership/aliasing rather than local DNS generation. The Search Console UI, sitemap submission, URL Inspection, field INP, outreach proof, and custom-domain alias update remain owner/session actions.
- `npm run check:seo-deployment-parity` now detects this exact stale-domain condition by comparing the canonical host with the Vercel alias for priority ITR pages.
- `npm run check:search-goal-readiness` must pass before the broader all-engine ranking objective can be called complete; it fails while required Google or Bing evidence rows are missing, latest evidence rows still contain `pending_external`, the ITR outreach tracker stops passing `npm run check:seo-outreach-readiness`, or owner-side milestones use repo-only statuses such as `repo_updated` instead of `recorded` or `live_verified`.

## Ten-Risk Status

### 1. Pages not indexed

Status: pending_external.

Technical evidence:

- Priority public URLs return `200`, are indexable, have canonical metadata, and include static SEO shell content before hydration.
- Priority structured data now passes on both `https://myeca.in` and `https://myeca12-04.vercel.app`; the remaining custom-domain drift is content depth and internal-link parity, not JSON-LD validity.
- The latest content-depth deployment is live on `https://myeca12-04.vercel.app`, but `https://myeca.in` still serves the older thinner shell for several priority non-article pages until the domain owner updates the alias.
- DNS TXT now includes `google-site-verification=nlJQF2THZYrleJu76byKuLUS9CHmOTcP1xv09pTA7CE`; owner-side Search Console UI proof is still required before sitemap submission and URL Inspection evidence can be treated as complete.
- The live sitemap check on May 27, 2026 found 171 URL entries.
- Manual `site:myeca.in` search checks on May 25 and May 26, 2026 showed limited visible Google coverage: the homepage appears, while exact checks for priority deep URLs such as `/blog/when-will-itr-filing-start-ay-2026-27`, `/itr/form-selector`, `/services/itr-for-salaried`, and `/calculators/income-tax` did not surface those URLs in the checked results. The visible homepage snippet also reflects an older crawl snapshot, while the live HTML no longer serves the old public ERI/self-filing copy.
- A refreshed May 27, 2026 web search check after deployment `dpl_FbBhano3NzZDECwtMn2P6aiJQpws` still surfaced the homepage for priority `site:myeca.in` queries, with no visible priority deep-route results in the checked search result set.

Remaining owner action:

- Point `myeca.in` at the May 27 deployment or give this Vercel scope access to the domain, then rerun `npm run check:itr-season-seo-content -- https://myeca.in`.
- Rerun `npm run check:seo-deployment-parity`; it must pass before claiming the canonical domain is on the latest SEO artifact.
- Use Search Console URL Inspection and the Page indexing report to confirm Google coverage for `/`, `/blog`, `/blog/when-will-itr-filing-start-ay-2026-27`, `/services/itr-for-salaried`, `/calculators/income-tax`, and `/itr/form-selector`.
- After Search Console verification, request recrawl/indexing for priority deep URLs that pass live inspection so Google replaces stale snippets with the current static SEO shell.

### 2. Missing sitemap.xml

Status: repo_resolved, pending_external submission proof.

Technical evidence:

- `https://myeca.in/sitemap.xml` returns `200`.
- The sitemap includes generated public service, calculator, startup, guide, blog, compare, and ITR-season routes.
- The sitemap excludes authenticated/private routes such as `/itr/filing`, `/dashboard`, `/documents`, `/reports`, and `/admin`.

Remaining owner action:

- Submit `https://myeca.in/sitemap.xml` in Search Console and update `docs/google-search-console-evidence-log.csv`.

### 3. robots.txt blocking Google

Status: repo_resolved.

Technical evidence:

- `https://myeca.in/robots.txt` returns `200`.
- No global `Disallow: /` line is present.
- Authenticated and private app sections are disallowed, including `/itr/filing/`, `/dashboard/`, `/documents/`, `/reports/`, and `/admin/`.

Remaining owner action:

- Re-run `npm run check:google-indexing` after each deployment that changes routing or public assets.

### 4. Meta noindex tag

Status: repo_resolved.

Technical evidence:

- Public priority routes return `index, follow`.
- `/itr/filing` and `/dashboard` return `noindex, nofollow`.
- `/itr/form-selector` remains the indexable public filing entry point.

Remaining owner action:

- Confirm Search Console live inspection reports "Indexing allowed" for public priority URLs.

### 5. SPA rendering issue

Status: mitigated, pending_external rendered-page proof.

Technical evidence:

- Public priority URLs include pre-hydration SEO shells, so Google can see titles, descriptions, body copy, JSON-LD, and crawlable links before the React app finishes loading.
- Blog, Learn guide, and ITR-season asset shells now expose article highlights plus official sources and next-step links before hydration, reducing reliance on JavaScript rendering for deeper content signals.
- `npm run check:itr-season-seo-content` validates generated priority shells for content depth, internal links, filing conversion paths, canonical metadata, JSON-LD, and route-specific AY 2026-27 terms; pass `https://myeca.in` after deploy to validate the live host.
- `npm run check:priority-structured-data` validates priority route JSON-LD for required schema types, unique schema identities, absolute URL fields, and Article `en-IN` language.
- `npm run check:seo-deployment-parity` compares the live canonical host and Vercel alias so stale custom-domain deployments are caught before Search Console/Bing recrawl work.
- The current Vite/React stack is preserved; a Next.js migration is not required unless URL Inspection shows Google cannot render meaningful content.

Remaining owner action:

- In URL Inspection, open the rendered page view for priority URLs and confirm the page content is visible, not only an app-loading shell.

### 6. Weak backlinks

Status: planned, pending_external execution.

Technical evidence:

- `docs/marketing/itr-season-2026-content-growth-campaign.md` defines the backlink policy, UTM convention, target channels, and weekly reporting.
- `docs/marketing/itr-season-2026-outreach-tracker.csv` is the backlink outreach tracker for CA blogs, StartupIndia listings, Medium articles, LinkedIn, guest posts, and finance forums.
- `docs/marketing/itr-season-2026-outreach-kit.md` contains channel-specific pitch copy and quality rules.
- `docs/marketing/itr-season-2026-owner-publishing-pack.md` contains ready-to-publish owner-channel drafts for Medium, LinkedIn, and community answers with tracked canonical links.
- On May 26, 2026 the outreach tracker was expanded with researched prospect batches covering CAclubindia, TaxGuru, TaxCrux, SuperLaunch, StartupBaaz, RevenueFast, KaroStartup, Udharaa, UpForge, ViksitHub, DesiSalary, Priyanka Personal Finance, HROne, Razorpay Payroll, sumHR, People Matters, FirstReports, Reddit r/IndiaTax, Reddit r/IncomeTax_India, and Reddit r/personalfinanceindia. These are queued prospects only; no external placement is claimed until the owner records outreach and earned links.
- `npm run check:seo-outreach-readiness` now validates that active outreach rows are concrete, campaign UTMs are present, required channels are covered, and generic seed rows are marked as non-counted templates. It currently passes with 22 active planned/prospect/queued rows across CA blogs, StartupIndia listings, Medium articles, LinkedIn, guest posts, finance forums, and HR/payroll.

Remaining owner action:

- Qualify prospects, send personalized outreach, record every pitch/reply/earned mention, and reject unsafe paid dofollow, exact-match, or unrelated placements.

### 7. Thin content

Status: repo_mitigated, ongoing content campaign.

Technical evidence:

- High-intent guides exist for ITR-1, salary tax calculator use, Section 80C, AIS, and GST notice handling.
- The objective's example coverage is test-enforced in `client/src/lib/public-link-audit.test.ts`: `itr-1-filing-guide-ay-2026-27`, `salary-tax-calculator-guide-ay-2026-27`, `section-80c-deductions-ay-2026-27`, `ais-explained-ay-2026-27`, and `gst-notice-handling-guide` must remain in `TAX_GUIDES`, must appear in the generated sitemap, and must link into calculator, service or expert, pricing, and filing paths.
- The salary tax calculator guide is live at `/learn/guide/salary-tax-calculator-guide-ay-2026-27` with a `200` response, indexable robots, canonical `https://myeca.in/learn/guide/salary-tax-calculator-guide-ay-2026-27`, and a pre-hydration static SEO shell.
- The ITR-season hub and four campaign assets target AY 2026-27 filing intent.
- Comparison and campaign pages have unique titles and sitemap entries.
- Static article shells surface key highlights and source links from the existing content inventory, and priority non-article ITR shells now include route-specific sections plus internal links before hydration.
- `npm run check:itr-season-seo-content` currently requires at least 120 visible words and at least two internal links on every priority ITR shell.
- `npm run check:priority-structured-data` now guards against duplicated Organization/WebSite/AccountingService JSON-LD identities in generated shells.
- `npm run check:itr-season-seo-content -- https://myeca12-04.vercel.app` passes for the May 27 deployment; `https://myeca.in` remains pending until the domain-owner account aliases the custom domain to the same deployment.
- `npm run check:seo-deployment-parity` currently fails for the same reason and lists the stale canonical routes whose word counts/internal links differ from the Vercel alias.

Remaining owner action:

- Continue the 90-day publishing cadence and refresh topics from Search Console query data after impressions arrive.

### 8. Poor internal linking

Status: repo_resolved for current inventory.

Technical evidence:

- Tests enforce that high-intent guides, fallback default blog articles, and the static MDX blog inventory link into calculators, service/expert routes, pricing, and filing paths.
- ITR-season assets link to tools, conversion routes, related blog content, and Learn guides.
- Priority generated shells now fail the local content gate unless they include a filing conversion path such as the ITR form selector, salaried ITR service, income-tax calculator, or Form 16 parser.

Remaining owner action:

- Keep the same internal-link matrix for every new article and campaign page.

### 9. Core Web Vitals failing

Status: lab_recorded, pending_external field INP.

Technical evidence:

- `npm run check:core-web-vitals` audits priority public routes for mobile LCP and CLS, and checks synthetic INP when available.
- The audit uses median finite samples for lab retries so single cold-load spikes do not create false failures.
- A refreshed May 26, 2026 lab run passed priority public routes, including `/learn/guide/salary-tax-calculator-guide-ay-2026-27`, with mobile LCP at or below `1340ms` and CLS at `0.000`; the new salary guide measured `688ms` median LCP and `0.000` median CLS, synthetic INP was unavailable, and a PageSpeed Insights probe from this workspace returned HTTP `429`.
- A follow-up May 26, 2026 canonical lab run after `f307276` passed `/` with `808ms` median LCP and `0.000` CLS, and `/blog` with `532ms` LCP and `0.000` CLS. Synthetic INP was still unavailable and must be confirmed from field data.

Remaining owner action:

- Record field INP from CrUX, Vercel Speed Insights, or Search Console Core Web Vitals and update the evidence log.

### 10. Search Console not configured correctly

Status: repo_resolved for live DNS TXT detection, pending_external for Search Console UI evidence.

Technical evidence:

- `npm run check:google-indexing` passes the live robots, sitemap, public route, canonical, static shell, private sitemap-exclusion, noindex, and Search Console verification-token checks.
- On May 27, 2026 the live checker reported `PASS Search Console verification token present: DNS TXT token found for myeca.in`.
- HTML verification remains optional because the DNS TXT path is now detected.
- A refreshed Vercel access check on May 25, 2026 shows this token only has `enon3101s-projects`, `vercel domains ls --scope enon3101s-projects` returns `0 Domains`, and the local repo/search scan found no saved Google verification token beyond empty examples.
- The currently inspectable Vercel production alias is ready at deployment `dpl_BDUt3zcPRb9anhHwrXGWq7LsbGjN`; the accessible Vercel scope still cannot manage the canonical `myeca.in` DNS/domain ownership needed for Search Console Domain-property verification.

Remaining owner action:

- Confirm the `myeca.in` Domain property shows verified in Search Console using the DNS TXT method.
- Submit `https://myeca.in/sitemap.xml`, inspect the priority URL queue, request indexing for live-indexable URLs, and update `docs/google-search-console-evidence-log.csv`.

## Cannot Call Complete Until

- Search Console property is verified for `myeca.in`.
- `myeca.in` is pointed at the latest production deployment and passes `npm run check:seo-deployment-parity`.
- `https://myeca.in/sitemap.xml` is submitted and accepted in Search Console.
- URL Inspection live tests and rendered-page views pass for the priority URL set.
- Request indexing is submitted for passing priority URLs.
- Page indexing report findings are reviewed after Google recrawls.
- Field INP evidence is recorded.
- At least the first backlink outreach batch is executed and logged.
