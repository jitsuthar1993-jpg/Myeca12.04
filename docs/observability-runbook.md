# Startup Observability Runbook

## Production Setup

Configure these values in Vercel before enabling the startup stack:

- `VITE_GA_MEASUREMENT_ID`
- `VITE_GOOGLE_SITE_VERIFICATION`
- `VITE_CLARITY_PROJECT_ID`
- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`
- `VITE_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `VITE_CRISP_WEBSITE_ID`

Behavior analytics, replay, Web Vitals, and Crisp load only in production after the user accepts analytics. GA4 uses Consent Mode v2 with `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` denied by default; accepting the current analytics banner grants only `analytics_storage`. Sentry error monitoring initializes separately with `sendDefaultPii: false` and request/body scrubbing.

## Route Policy

Replay and chat are allowed only on public acquisition and low-risk onboarding routes such as `/`, `/services`, `/pricing`, `/trust`, `/help`, `/learn`, `/calculators`, `/itr/form-selector`, `/expert-consultation`, and `/contact`.

Replay and chat are blocked on authenticated, payment, upload, parser, admin, team, CA, and filing routes including `/auth`, `/dashboard`, `/documents`, `/payments`, `/profile`, `/settings`, `/reports`, `/admin`, `/ca`, `/team`, `/business`, `/itr/filing`, `/form16-parser`, `/ais-viewer`, `/capital-gains-import`, `/bank-analyzer`, and `/tax-assistant`.

## Post-Deploy Verification

1. Open a production-like deployment, accept analytics on a public route, then confirm GA4 DebugView receives a `page_view`.
2. Confirm PostHog receives `$pageview`, `lead_submit`, `signup`, `checkout_started`, `payment_link_requested`, or `service_activation_requested` events without sensitive payloads.
3. Confirm Clarity receives traffic only on allowed public routes.
4. Confirm Crisp appears on public support/conversion routes and stays hidden on sensitive flows.
5. Trigger a controlled client and API error in a non-customer test flow, then verify Sentry receives scrubbed events with readable source maps.
6. Submit `https://myeca.in/sitemap.xml` in Google Search Console after the verification meta token is deployed.

## Audit Cadence

- Run Lighthouse or PageSpeed Insights on `/`, `/services`, `/pricing`, and `/itr/form-selector` before major releases.
- Run GTmetrix on the same URLs after deployment to catch CDN, image, and JavaScript regressions.
- Run Screaming Frog SEO Spider against `https://myeca.in` monthly or before major SEO launches. Check broken links, titles, meta descriptions, redirects, canonicals, private-route leakage, and sitemap coverage.
