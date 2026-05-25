# Google Indexing Remediation Status

Last live technical check: May 25, 2026 against `https://myeca.in` after `main` commit `05a50a6` and Vercel deployment `dpl_4udZHEaYyArrUvtvaADvSwsAbPKZ`.

This ledger maps the original Google Search and Search Console risk list to the current repo and live-deployment evidence. Keep `docs/google-search-console-evidence-log.csv` as the fillable owner log for account-side proof.

## Current Summary

Repo-side technical remediation is in place for sitemap coverage, robots policy, public/private indexability, pre-hydration SEO shells with article highlights, internal linking, ITR-season content assets, backlink planning, and lab Core Web Vitals checks.

The remaining blockers are external:

- Search Console Domain property verification is still pending because the live check reports a missing valid DNS TXT token and no non-empty HTML verification meta value.
- Sitemap submission, URL Inspection, rendered-page confirmation, request-indexing clicks, and Page indexing report review must be completed in the Google Search Console UI.
- Field INP must be recorded from CrUX, Vercel Speed Insights, or Search Console because synthetic Chromium may not expose route interaction timing.
- Real backlink placements still need owner/operator outreach; the repo has the backlink outreach tracker and ready-to-send pitch kit, not earned external links.
- This workspace can deploy `enon3101s-projects/myeca12-04`, and `https://myeca.in` now serves the deployed static SEO shell. The same Vercel token still cannot inspect or manage the `myeca.in` domain, DNS TXT records, or Search Console ownership, so verification remains an account-owner action.

## Ten-Risk Status

### 1. Pages not indexed

Status: pending_external.

Technical evidence:

- Priority public URLs return `200`, are indexable, have canonical metadata, and include static SEO shell content before hydration.
- The live sitemap check on May 25, 2026 found 170 URL entries.
- Manual `site:myeca.in` search checks on May 25, 2026 showed limited visible Google coverage: the homepage appears, while exact checks for priority deep URLs such as `/blog/when-will-itr-filing-start-ay-2026-27`, `/itr/form-selector`, `/services/itr-for-salaried`, and `/calculators/income-tax` did not surface those URLs in the checked results. The visible homepage snippet also reflects an older crawl snapshot, while the live HTML no longer serves the old public ERI/self-filing copy.

Remaining owner action:

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

- Public priority URLs include pre-hydration SEO shells, so Google can see titles, descriptions, body copy, and crawlable links before the React app finishes loading.
- Blog, Learn guide, and ITR-season asset shells now expose article highlights plus official sources and next-step links before hydration, reducing reliance on JavaScript rendering for deeper content signals.
- The current Vite/React stack is preserved; a Next.js migration is not required unless URL Inspection shows Google cannot render meaningful content.

Remaining owner action:

- In URL Inspection, open the rendered page view for priority URLs and confirm the page content is visible, not only an app-loading shell.

### 6. Weak backlinks

Status: planned, pending_external execution.

Technical evidence:

- `docs/marketing/itr-season-2026-content-growth-campaign.md` defines the backlink policy, UTM convention, target channels, and weekly reporting.
- `docs/marketing/itr-season-2026-outreach-tracker.csv` is the backlink outreach tracker for CA blogs, StartupIndia listings, Medium articles, LinkedIn, guest posts, and finance forums.
- `docs/marketing/itr-season-2026-outreach-kit.md` contains channel-specific pitch copy and quality rules.

Remaining owner action:

- Qualify prospects, send personalized outreach, record every pitch/reply/earned mention, and reject unsafe paid dofollow, exact-match, or unrelated placements.

### 7. Thin content

Status: repo_mitigated, ongoing content campaign.

Technical evidence:

- High-intent guides exist for ITR-1, Section 80C, AIS, and GST notice handling.
- The ITR-season hub and four campaign assets target AY 2026-27 filing intent.
- Comparison and campaign pages have unique titles and sitemap entries.
- Static article shells surface key highlights and source links from the existing content inventory, so thin pre-rendered bodies are no longer limited to a single summary paragraph.

Remaining owner action:

- Continue the 90-day publishing cadence and refresh topics from Search Console query data after impressions arrive.

### 8. Poor internal linking

Status: repo_resolved for current inventory.

Technical evidence:

- Tests enforce that high-intent guides and default blog articles link into calculators, service/expert routes, pricing, and filing paths.
- ITR-season assets link to tools, conversion routes, related blog content, and Learn guides.

Remaining owner action:

- Keep the same internal-link matrix for every new article and campaign page.

### 9. Core Web Vitals failing

Status: lab_recorded, pending_external field INP.

Technical evidence:

- `npm run check:core-web-vitals` audits priority public routes for mobile LCP and CLS, and checks synthetic INP when available.
- The audit uses median finite samples for lab retries so single cold-load spikes do not create false failures.

Remaining owner action:

- Record field INP from CrUX, Vercel Speed Insights, or Search Console Core Web Vitals and update the evidence log.

### 10. Search Console not configured correctly

Status: pending_external.

Technical evidence:

- `npm run check:google-indexing` passes the live robots, sitemap, public route, canonical, static shell, private sitemap-exclusion, and noindex checks.
- The only current required failure is Search Console verification: missing valid DNS TXT token and missing non-empty HTML verification meta value.
- The accessible Vercel production env list does not include `VITE_GOOGLE_SITE_VERIFICATION`, live DNS TXT lookup for `myeca.in` has no Google verification token, and `vercel domains inspect myeca.in` under the accessible scope reports no domain access.

Remaining owner action:

- Preferred: create or confirm a Search Console Domain property for `myeca.in`, add the DNS TXT record in the owning DNS/Vercel account, wait for propagation, then rerun `npm run check:google-indexing`.
- Alternative: set `VITE_GOOGLE_SITE_VERIFICATION` in the owning Vercel Production project, redeploy, and verify the homepage has a non-empty `google-site-verification` meta tag.

## Cannot Call Complete Until

- Search Console property is verified for `myeca.in`.
- `https://myeca.in/sitemap.xml` is submitted and accepted in Search Console.
- URL Inspection live tests and rendered-page views pass for the priority URL set.
- Request indexing is submitted for passing priority URLs.
- Page indexing report findings are reviewed after Google recrawls.
- Field INP evidence is recorded.
- At least the first backlink outreach batch is executed and logged.
