# Google Indexing Readiness

Use this checklist after any SEO, Vercel, or Search Console change for `myeca.in`.

## Automated Check

Run:

```bash
npm run check:google-indexing
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

## Known Access Boundary

The active `myeca.in` deployment has previously been under the Vercel scope `jitsuthar1993-gmailcoms-projects`. If the local Vercel token only has access to another team, the DNS TXT record and production env var cannot be set from this workspace.
