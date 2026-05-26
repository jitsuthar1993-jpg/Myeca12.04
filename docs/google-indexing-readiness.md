# Google Indexing Readiness

Use this checklist after any SEO, Vercel, or Search Console change for `myeca.in`.

For the latest risk-by-risk status, update `docs/google-indexing-remediation-status.md` alongside the evidence log. Use `docs/google-search-console-owner-runbook.md` for the account-owner Search Console session.

## Automated Check

Run:

```bash
npm run check:google-indexing
npm run check:core-web-vitals
```

The command checks the live site for:

- `robots.txt` availability and no global `Disallow: /`.
- `/itr/filing/` disallow in `robots.txt`.
- `sitemap.xml` availability and substantial public URL coverage.
- Required public URLs in the sitemap, including ITR season campaign pages, `/itr/form-selector`, `/form16-parser`, `/capital-gains-import`, `/expert-consultation`, `/services/pan-card`, `/calculators/regime-comparator`, `/calculators/vda-tax`, and `/startup/planning`.
- Required public URLs return `200`, are indexable, have the expected production canonical URL, and do not reuse another required page's title.
- Private URLs excluded from the sitemap, including `/itr/filing`, `/dashboard`, `/documents`, `/reports`, and `/admin`.
- Homepage `index, follow`.
- `/itr/filing` and `/dashboard` `noindex`.
- Google Search Console verification through either DNS TXT or a non-empty `google-site-verification` HTML meta tag.

The Core Web Vitals command runs a mobile Chromium lab pass against priority public URLs and checks:

- LCP <= 2500ms.
- CLS <= 0.100.
- Synthetic INP <= 200ms when Chromium exposes event timing for the route.

If the synthetic INP result is unavailable, record the field INP value from CrUX, Vercel Speed Insights, or Search Console Core Web Vitals before calling performance verification complete.

Run the command against `https://myeca.in` for the final launch gate. Temporary Vercel aliases may fail sitemap and canonical checks because the production SEO shell intentionally points crawlers to `https://myeca.in`.

## Vercel And Search Console Steps

Preferred setup:

1. In Google Search Console, add a Domain property for `myeca.in`.
2. Copy the Search Console DNS TXT record.
3. In the Vercel account that owns `myeca.in`, add the TXT record to the domain DNS settings.
4. Wait for DNS propagation, then rerun `npm run check:google-indexing`.
5. Submit `https://myeca.in/sitemap.xml` in Search Console.
6. Inspect and request indexing for `/`, `/blog`, `/services/itr-for-salaried`, `/calculators/income-tax`, and `/itr/form-selector`.

Alternative HTML-tag setup:

1. Set `VITE_GOOGLE_SITE_VERIFICATION` in the owning Vercel project for Production.
2. Redeploy production.
3. Confirm the homepage has a non-empty `google-site-verification` meta tag.
4. Submit `https://myeca.in/sitemap.xml` and inspect priority URLs in Search Console.

## Search Console Evidence Log

Keep a dated evidence row whenever Search Console work is performed. The goal is to separate repo defects from account/DNS/operator tasks.

```text
date,owner,property_type,verification_method,evidence_link_or_note,status,next_action
```

Use `docs/google-search-console-evidence-log.csv` as the fillable tracker for the account-owner work. Keep `pending_external` rows until the Search Console owner adds evidence from the Google UI, DNS provider, Vercel project, CrUX, or Vercel Speed Insights. Use `docs/google-search-console-owner-runbook.md` for the exact per-URL inspection queue and evidence fields.

Required evidence before calling Search Console setup done:

- Domain property exists for `myeca.in`.
- DNS TXT verification is visible in Search Console, or the production homepage has a valid non-empty HTML verification token.
- `https://myeca.in/sitemap.xml` is submitted and Search Console shows the sitemap submitted successfully.
- URL Inspection live test passes for `/`, `/blog`, `/blog/when-will-itr-filing-start-ay-2026-27`, `/services/itr-for-salaried`, `/calculators/income-tax`, and `/itr/form-selector`.
- URL Inspection rendered page view shows page content, not only an app-loading skeleton.
- Page indexing report is checked after Google recrawls the sitemap; record excluded/duplicate/crawled-not-indexed reasons separately.
- Request indexing is used for the priority URLs that pass live inspection.
- Core Web Vitals evidence includes LCP, INP, and CLS for priority public pages, with INP sourced from field data when the lab audit cannot observe a synthetic interaction.

If `npm run check:google-indexing` only fails on the verification token, treat that as an account/DNS dependency until the property owner completes the DNS TXT or HTML verification step.

## Known Access Boundary

The active `myeca.in` deployment has previously been under the Vercel scope `jitsuthar1993-gmailcoms-projects`. If the local Vercel token only has access to another team, the DNS TXT record and production env var cannot be set from this workspace.
