# Bing And IndexNow Readiness

Use this checklist for `myeca.in` after all-engine SEO changes. It complements the Google Search Console runbook and covers Bing Webmaster Tools, IndexNow, and Copilot/Bing grounding eligibility signals.

Official references:

- Bing Webmaster Guidelines: <https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a>
- Bing sitemap help: <https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed>
- Bing URL submission and IndexNow guidance: <https://www.bing.com/webmasters/help/URL-Submission-62f2860b>
- IndexNow protocol: <https://www.indexnow.org/documentation>

## Automated Checks

Run:

```bash
npm run check:search-engines
npm run check:itr-season-seo-content
npm run check:priority-structured-data
npm run check:seo-deployment-parity
npm run check:bing-indexing-evidence
npm run check:search-goal-readiness
npm run check:indexnow-key
npm run indexnow:submit
```

`check:search-engines` validates the live public site for:

- `robots.txt` and `sitemap.xml` availability.
- No global crawler block.
- Googlebot and Bingbot public crawl access.
- Priority ITR-season URL coverage in the sitemap.
- Public route `200`, indexable robots metadata, canonical URL, unique Googlebot title, and pre-hydration static shell content.
- Private workspace route exclusion from sitemap plus `noindex` handling.

`check:itr-season-seo-content` validates the generated `dist/public` shells for the priority ITR queue. Pass a host, for example `npm run check:itr-season-seo-content -- https://myeca.in`, to validate deployed HTML after production release. It fails if a priority shell is missing enough visible content, JSON-LD, canonical metadata, internal links, a filing conversion path, or route-specific AY 2026-27 terms.

Current deployment note: the May 27 deployment `dpl_FbBhano3NzZDECwtMn2P6aiJQpws` passes this gate on `https://myeca12-04.vercel.app`. `INDEXNOW_KEY` is set in the accessible Vercel Production project and the redacted key-file check passes on the Vercel alias. The custom domain `myeca.in` passes the priority structured-data gate and resolves through Vercel DNS (`64.29.17.65`, `216.198.79.65`, SOA `ns1.vercel-dns.com`), but `npx vercel domains inspect myeca.in --scope enon3101s-projects` still fails with no access. The domain-owner Vercel account must alias `myeca.in` to the same deployment before the content-depth, IndexNow canonical-key, and parity gates can pass on the canonical host.

`check:priority-structured-data` validates generated priority ITR JSON-LD for required route-specific schema types, unique schema `@id` values, absolute URL fields, and `en-IN` Article language.

`check:seo-deployment-parity` compares `https://myeca.in` and `https://myeca12-04.vercel.app` for the priority ITR queue. It fails when titles, canonicals, static shell markers, visible text depth, internal link counts, or visible text fingerprints diverge between the canonical host and the deployed alias.

`check:bing-indexing-evidence` validates that `docs/bing-search-console-evidence-log.csv` has required owner-side evidence rows and keeps pending external work explicit.

`check:search-goal-readiness` combines the latest Google and Bing evidence rows, re-validates the ITR outreach tracker, and fails while any required evidence item is missing or any item remains `pending_external`; use it as the final "do not claim complete yet" gate. It also rejects repo-only statuses for owner-side milestones such as Bing Webmaster Tools verification, sitemap submission, URL Inspection, IndexNow key proof, real IndexNow submission, IndexNow reports, and search-performance baselines. Use `recorded` or `live_verified` only after the account-side proof is available.

When Bing or IndexNow proof arrives on the same date as an older pending row, add a new row for the same item with `recorded` or `live_verified` and concrete evidence. The final readiness gate treats the same-day proof row as superseding stale pending evidence, while still rejecting placeholder evidence and repo-only owner statuses.

`indexnow:submit` is dry-run by default. Dry-run output redacts the key and key-file URL even when `INDEXNOW_KEY` is set, so the output can be attached to the evidence log. A real submission requires `--submit` plus `--priority` or one or more `--url` / `--changed` values.

`check:indexnow-key` verifies the live key-file URL without printing the secret key. Run it only in an environment where `INDEXNOW_KEY` is set, for example `npm run check:indexnow-key -- https://myeca.in`.

## IndexNow Setup

Set this environment variable in the production deployment:

```text
INDEXNOW_KEY=<8-128 letters numbers or dashes>
```

The server serves the key at:

```text
https://myeca.in/<INDEXNOW_KEY>.txt
```

Dry-run the priority queue:

```bash
npm run indexnow:submit -- --priority
```

Verify the key file after deployment without logging the key:

```bash
npm run check:indexnow-key -- https://myeca.in
```

Submit the ITR-season priority queue only after the key file is live:

```bash
npm run indexnow:submit -- --submit --priority
```

Submit changed URLs explicitly after content edits:

```bash
npm run indexnow:submit -- --submit --changed /itr-season-2026,/form16-parser
```

Do not commit the key value. Record only redacted proof in the evidence log; the dry-run command prints `<INDEXNOW_KEY>` instead of the real key.

## Bing Webmaster Tools Session

During the shared account session:

1. Add or open the Bing Webmaster Tools site for `https://myeca.in`.
2. Verify ownership through Bing's supported flow or import from Google Search Console if available.
3. Submit `https://myeca.in/sitemap.xml`.
4. Confirm Bing sees the sitemap and discovered URL count.
5. Inspect the priority URL queue below.
6. Confirm the rendered HTML/content is visible and the canonical is `https://myeca.in`.
7. Check the IndexNow report after submission.
8. Record every result in `docs/bing-search-console-evidence-log.csv`.

## Priority URL Queue

Inspect these in Bing Webmaster Tools URL Inspection:

```text
https://myeca.in/
https://myeca.in/blog
https://myeca.in/blog/when-will-itr-filing-start-ay-2026-27
https://myeca.in/services/itr-for-salaried
https://myeca.in/calculators/income-tax
https://myeca.in/itr/form-selector
https://myeca.in/form16-parser
https://myeca.in/itr-season-2026
https://myeca.in/learn/guide/salary-tax-calculator-guide-ay-2026-27
```

## Completion Gate

Do not call Bing/IndexNow complete until the evidence log proves:

- `https://myeca.in` is on the same deployment as `https://myeca12-04.vercel.app` and passes `npm run check:seo-deployment-parity`.
- Bing Webmaster Tools property is verified.
- `https://myeca.in/sitemap.xml` is submitted and accepted.
- IndexNow key file is live.
- Priority dry run and real submission are recorded.
- Priority URL Inspection rows have crawl/index/canonical evidence.
- Bing IndexNow report shows received URLs or a documented pending state.
- Bing search performance baseline is recorded.
- `npm run check:search-goal-readiness` passes with no latest Google or Bing evidence item still marked `pending_external`.
