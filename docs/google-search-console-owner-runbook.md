# Google Search Console Owner Runbook

Use this runbook in the Google account that owns `myeca.in`. The repo-side checks prove the public pages are technically ready; this file covers the account-side evidence needed before the Google indexing remediation can be called complete.

Official references:

- Google ownership verification: <https://support.google.com/webmasters/answer/9008080?hl=en>
- Sitemaps report: <https://support.google.com/webmasters/answer/7451001?hl=en>
- URL Inspection tool: <https://support.google.com/webmasters/answer/9012289?hl=en>
- Rendered source in URL Inspection: <https://support.google.com/webmasters/answer/11626894?hl=en-EN>
- Core Web Vitals report: <https://support.google.com/webmasters/answer/9205520?hl=en>
- Ask Google to recrawl: <https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl>

## Owner Session Quick Path

Use this order when the owner has one focused Search Console session:

1. Add or open the Domain property for `myeca.in`.
2. Add the Google DNS TXT value in the DNS account that owns `myeca.in`.
3. Keep the TXT record in DNS after verification so ownership remains durable.
4. Verify the Domain property in Search Console.
5. Submit `https://myeca.in/sitemap.xml` in the Sitemaps report.
6. Inspect the priority URL queue below, run `Test live URL`, open `View tested page`, confirm rendered content is visible, and request indexing only for URLs that are live-indexable.
7. Record each result in `docs/google-search-console-evidence-log.csv`.
8. Re-run `npm.cmd run check:google-indexing` from the repo after DNS propagation.

Google's live URL test proves Google can access and parse a page at test time; it does not guarantee the page will be indexed or ranked. For many new or updated pages, sitemap submission is the safer bulk recrawl signal, while request indexing is best reserved for the priority queue.

## Property And Verification

Preferred property:

```text
Domain property: myeca.in
Canonical production URL: https://myeca.in
Sitemap URL: https://myeca.in/sitemap.xml
```

Preferred verification method:

1. Open Google Search Console.
2. Add or open the Domain property for `myeca.in`.
3. Copy the DNS TXT verification value.
4. Add the TXT record in the DNS account that owns `myeca.in`.
5. Wait for propagation.
6. Verify in Search Console.
7. Run `npm.cmd run check:google-indexing` from this repo.

Evidence to record in `docs/google-search-console-evidence-log.csv`:

```text
Domain property: verified
DNS TXT verification: verified
Live checker: passes with zero required failures
```

Use `recorded` or `live_verified` for owner-side milestones that are proven in Search Console, CrUX, Vercel Speed Insights, or an external placement URL. Keep `pending_external` until the evidence exists. Do not use `repo_updated` for sitemap submission, URL Inspection, rendered page view, Page indexing report, field INP, or outreach completion rows; the final `npm.cmd run check:search-goal-readiness` gate rejects repo-only statuses for those milestones.

If proof is recorded on the same date as an earlier `pending_external` row, add a new row for the same item with `recorded` or `live_verified` and concrete evidence. The final readiness gate treats that same-day proof as superseding the stale pending row, but it still rejects placeholder evidence and repo-only owner statuses.

Alternative verification:

Use HTML-tag verification only if DNS TXT access is not available. Set `VITE_GOOGLE_SITE_VERIFICATION` in the owning Vercel Production project, redeploy, then confirm the homepage source has a non-empty `google-site-verification` meta tag.

Do not paste the full private verification token into public docs. Record a redacted note such as `google-site-verification token visible in GSC and DNS`.

## Sitemap Submission

1. Open Search Console > Indexing > Sitemaps.
2. Submit:

```text
https://myeca.in/sitemap.xml
```

3. Wait until Search Console shows a submitted sitemap row.
4. Record the submitted date, status, discovered URL count, and any parsing errors.

Search Console requires owner permissions on the property to submit a sitemap from the Sitemaps report. If the owner does not see the submit field, fix property ownership first instead of changing the repository.

Expected current repo evidence:

```text
Live sitemap URL: 200
Live sitemap URL count: 171
Robots sitemap pointer: https://myeca.in/sitemap.xml
Private routes excluded: /itr/filing, /dashboard, /documents, /reports, /admin
```

## URL Inspection Queue

Inspect these URLs in this order. For each URL, click `Test live URL`, open the rendered-page view, then request indexing only if the live test reports that indexing is allowed.

In `View tested page`, check both the screenshot and HTML/resource details when available. The rendered page should show real MyeCA content, not only a loading shell. If the rendered page is empty but the live repo check passes, capture the Search Console screenshot/details before changing code so the failure reason is evidence-backed.

| Priority | URL | Why It Matters | Evidence To Record |
| --- | --- | --- | --- |
| 1 | `https://myeca.in/` | Homepage and stale-snippet replacement | Live test result, indexing allowed, Google-selected canonical, rendered page visible, request indexing status |
| 2 | `https://myeca.in/blog` | Blog hub coverage | Live test result, indexing allowed, canonical, rendered blog content, request indexing status |
| 3 | `https://myeca.in/blog/when-will-itr-filing-start-ay-2026-27` | Priority article from the original inspection list | Live test result, indexing allowed, canonical, rendered article content, request indexing status |
| 4 | `https://myeca.in/services/itr-for-salaried` | Main service conversion page | Live test result, indexing allowed, canonical, rendered service content, request indexing status |
| 5 | `https://myeca.in/calculators/income-tax` | High-intent calculator page | Live test result, indexing allowed, canonical, rendered calculator content, request indexing status |
| 6 | `https://myeca.in/itr/form-selector` | Public filing entry point replacing private `/itr/filing` | Live test result, indexing allowed, canonical, rendered form selector content, request indexing status |
| 7 | `https://myeca.in/form16-parser` | Form 16 campaign asset and HR outreach target | Live test result, indexing allowed, canonical, rendered parser content, request indexing status |
| 8 | `https://myeca.in/itr-season-2026` | Seasonal content hub | Live test result, indexing allowed, canonical, rendered hub content, request indexing status |
| 9 | `https://myeca.in/learn/guide/salary-tax-calculator-guide-ay-2026-27` | New topical-authority guide | Live test result, indexing allowed, canonical, rendered guide content, request indexing status |

Record each inspected URL as its own evidence row. Do not mark a URL done from repo tests alone; the proof must come from the Search Console UI.

## Page Indexing Report Follow-Up

Check this after Google has had time to recrawl. Record counts and examples for:

- Indexed pages from submitted sitemap.
- Crawled currently not indexed.
- Discovered currently not indexed.
- Duplicate without user-selected canonical.
- Alternate page with proper canonical.
- Blocked by robots.txt.
- Excluded by noindex.

If a public priority URL appears in an exclusion bucket, record the exact reason in the evidence log before changing code. If a private route appears indexed or indexable, treat it as a route-policy regression and re-check `shared/seo-public.ts`.

## Core Web Vitals Field Evidence

The repo lab check covers LCP and CLS and attempts synthetic INP. Field INP still needs account-side evidence.

In Search Console > Experience > Core Web Vitals, record:

```text
Device: mobile and desktop if available
URL group:
Status: Good / Needs improvement / Poor / No data
LCP:
INP:
CLS:
Date range:
Source: Search Console Core Web Vitals report
```

If Search Console has no data yet, use CrUX or Vercel Speed Insights and record the source. A `No data` Search Console state is evidence, but it does not prove field INP is good.

## Outreach And Backlink Evidence

The repo contains:

- `docs/marketing/itr-season-2026-outreach-tracker.csv`
- `docs/marketing/itr-season-2026-outreach-kit.md`
- `docs/marketing/itr-season-2026-owner-publishing-pack.md`

Before claiming the backlink item complete, record at least the first executed batch:

```text
date
channel
live source URL or outreach target
target MyeCA URL
anchor text
rel attribute
status
reply or placement evidence
unsafe placement rejected if applicable
```

Queued prospects and draft posts are not earned links. Count only live owner-channel posts, community answers, replies, or third-party placements that can be verified from an external URL or email/thread evidence.

## Completion Gate

Do not mark the Google indexing remediation complete until the evidence log proves:

- Domain property for `myeca.in` is verified.
- `https://myeca.in/sitemap.xml` is submitted and accepted.
- The priority URL Inspection queue has live-test and rendered-page evidence.
- Request indexing has been submitted for priority URLs that pass live inspection.
- Page indexing report findings are reviewed after recrawl.
- Field INP evidence is recorded or explicitly documented as unavailable.
- The first outreach/publishing batch is executed and logged.
