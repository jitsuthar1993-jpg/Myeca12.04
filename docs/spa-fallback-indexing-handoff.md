# SPA Fallback Indexing Handoff

Use this handoff when spam-like or malformed public URLs, such as
`/face-serum-gxrcld` or `/about/face-serum-gxrcld`, show the public app shell
with indexable robots signals.

## Required Behavior

- Unknown public-looking routes must return `404`.
- Unknown public-looking routes must send `X-Robots-Tag: noindex, nofollow`.
- Unknown public-looking routes must not be listed in `sitemap.xml`.
- App-only deep links that must stay reachable may return `200`, but must remain
  `noindex, nofollow`.
- Real public marketing, calculator, service, and blog routes must stay
  indexable.

## Current Host Boundary

As of May 30, 2026, the accessible Vercel alias is safe:

```powershell
$env:MYECA_FALLBACK_SUMMARY_ONLY='1'
$env:MYECA_FALLBACK_SUMMARY_FAILURE_LIMIT='2'
$env:MYECA_FALLBACK_REQUEST_DELAY_MS='10'
$env:MYECA_FALLBACK_PROBE_SLUGS='face-serum-gxrcld,random-product-gxrcld'
$env:MYECA_FALLBACK_FETCH_ATTEMPTS='3'
$env:MYECA_FALLBACK_RETRY_DELAY_MS='750'
$env:MYECA_FALLBACK_REQUEST_TIMEOUT_MS='30000'
$env:MYECA_FALLBACK_REPORT_PATH='docs/spa-fallback-audit-alias-report.json'
npm.cmd run check:spa-fallback-indexing -- https://myeca12-04.vercel.app
```

Expected result on the alias: `failures=0`.

The canonical domain is still the live blocker:

```powershell
npm.cmd run check:spa-fallback-indexing -- https://myeca.in
```

Current result on `myeca.in`: bogus routes still return `200 OK` with
`X-Robots-Tag: index, follow`.

## Owner-Side Fix

The Vercel project available from this workspace serves the corrected deployment
at `https://myeca12-04.vercel.app`. The domain-owner Vercel account or team must
attach `myeca.in` and `www.myeca.in` to that same deployment/project.

From this workspace, these write attempts fail because the current Vercel team
does not own the domain:

```powershell
npx --yes vercel@latest alias set myeca12-04.vercel.app myeca.in --scope enon3101s-projects
npx --yes vercel@latest alias set myeca12-04.vercel.app www.myeca.in --scope enon3101s-projects
```

Expected current error here:

```text
Error: You don't have access to the domain myeca.in under enon3101s-projects.
Error: You don't have access to the domain www.myeca.in under enon3101s-projects.
```

Run the same alias/domain assignment from the Vercel account or team that owns
`myeca.in`, or transfer/add the domains into the `enon3101s-projects` team before
running the commands again.

Before claiming completion, verify all of these:

```powershell
curl.exe -I https://myeca.in/about/face-serum-gxrcld
curl.exe -I https://myeca.in/services/activate/partnership-deed
$env:MYECA_FALLBACK_REPORT_PATH='docs/spa-fallback-audit-canonical-report.json'
npm.cmd run check:spa-fallback-indexing -- https://myeca.in
npm.cmd run check:seo-deployment-parity
```

Completion evidence:

- `/about/face-serum-gxrcld` returns `404` and `X-Robots-Tag: noindex, nofollow`.
- `/services/activate/partnership-deed` returns `200` and
  `X-Robots-Tag: noindex, nofollow`.
- `check:spa-fallback-indexing -- https://myeca.in` reports `failures=0`.
- `docs/spa-fallback-audit-canonical-report.json` records `summary.failures: 0`.
- `check:seo-deployment-parity` passes, proving `myeca.in` and
  `myeca12-04.vercel.app` are serving the same SEO artifact.
