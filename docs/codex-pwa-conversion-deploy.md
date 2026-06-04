# Deploy Checklist — `codex/production-pwa-conversion`

This branch ships 18+ commits of performance, security, and observability work.
Read this end-to-end before merging. The three boxed items at the top are
behavior changes that you must verify in staging before the prod merge.

---

## ⚠️ Three things to verify before merge

These are not optional — they change behavior that touches real users.

### 1. Auth status enforcement (security fix)

`requireAuth` and `requireRole` now block any user whose `status` is `inactive`,
`suspended`, or `rejected`. Before this branch, those users could keep using
their existing Bearer token even after an admin "soft-deleted" them.

**Before merging, run this query against production data:**

```sql
SELECT data->>'status' AS status, COUNT(*)
FROM users
GROUP BY data->>'status';
```

If anyone currently sitting at `status='inactive'` is actually expected to keep
working, the merge will lock them out. Decide policy before deploying. The
back-compat path is intact: users with no status field are treated as `active`.

Files touched:
- `server/middleware/auth.ts`
- `server/middleware/auth.test.ts` (14 cases including blocked-status rejection)

### 2. `/user/dashboard` rewrite

The dashboard endpoint now uses Drizzle `count()` aggregates and bounded
fetches instead of loading every record for the caller. The shape of the JSON
response is unchanged.

**Before merging, log in as a real user with mixed services + returns and
verify the numbers match what production was returning before this branch:**

- `stats.totalReturns` matches `SELECT COUNT(*) FROM tax_returns WHERE data->>'userId' = ?`
- `stats.documentsUploaded` matches the active document count
- `stats.pendingTasks` matches the sum of pending returns + pending services
- `activeServices` is still capped at 50 (was unlimited)
- `taxReturns` is still the top 5 by `updatedAt desc`

Files touched:
- `server/routes/user.ts`
- `server/db/queries.ts` (new — Drizzle helper module)
- `client/src/lib/user-routes.test.ts` (mock extended for the new helpers)

### 3. API-request telemetry

Every `apiRequest` and `getQueryFn` call now emits an `api_request` event with
`api_path`, `method`, `status`, `duration_ms`, `ok`. The event ships to GA and
PostHog via the existing `captureTelemetryEvent` plumbing.

**Within an hour of deploy:**
- Confirm the event is appearing in PostHog
- Sanity-check volume — for a busy admin user this can be ~50 events/minute.
  If you're on the PostHog free tier, add a sampler in `reportApiTiming` to
  send 1 in N events. The path normaliser already collapses high-cardinality
  IDs so cardinality isn't a problem.

Files touched:
- `client/src/lib/queryClient.ts`
- `client/src/lib/queryClient-telemetry.test.ts`

---

## Manual smoke test (10 minutes in staging)

After deploying to staging, hit each URL as a logged-in admin and read the
browser DevTools Network panel:

| URL | What to see | Why |
|-----|-------------|-----|
| `/admin/dashboard` | `/api/admin/stats` returns `X-Cache: MISS` the first time, `X-Cache: HIT` on a second load within 60s | Confirms the new server-side cache is working |
| `/admin/requests` | A table-shaped skeleton (5 placeholder rows) renders during the initial fetch, not a centered spinner | Confirms the skeleton wiring is correct |
| Any logged-out URL with `WhatsApp/2.x` UA via curl | HTML response includes a real `<title>` matching `seo.config.ts`, no `<meta name="robots" content="noindex">` | Confirms the crawler regex + noindex bug fix |
| Temporarily add `throw new Error('test')` to a route component | The header, footer, and global chrome stay alive; only the content area shows the in-content error card | Confirms the per-route error boundary is wired |
| Network tab during any page load | At least one `posthog.com/capture` or `google-analytics.com` request carrying `event=api_request` with `api_path` and `duration_ms` properties | Confirms telemetry is shipping |

---

## CDN / infra follow-ups (not in this PR)

These items were in the original optimization plan but aren't code changes:

- **Brotli compression** — verify it's enabled in Vercel/Cloudflare. The Express
  middleware does gzip only; the CDN should compress to Brotli in transit.
- **Long-cache headers on hashed assets** — `server/vite.ts` already sets
  `Cache-Control: public, max-age=31536000, immutable` for hashed assets in
  self-hosted mode. Confirm the same is true on the CDN.

---

## What landed (summary)

### Performance
- `/admin/user-services`, `/admin/requests/consultations`, `/admin/requests/payment-links`, `/cms/posts` — `WHERE / ORDER BY / LIMIT` pushed to SQL
- `/admin/stats` — 60s shared cache with `X-Cache` headers
- `/analytics/overview` — 14 parallel `count()` aggregates replacing 5 full collection scans
- `/user/dashboard` — `count()` totals + bounded fetches; pending counts via Drizzle helper
- Admin sidebar — hover-preload wired
- React Query — new `adminList` cache tier (2 min stale / 15 min gc)
- 8 unused npm packages removed (~341 lockfile lines)

### Security
- Auth boundary blocks `inactive`, `suspended`, `rejected` users (was missing)
- `optionalAuth` no longer swallows resolution errors silently — logs and continues

### SEO
- `SEO.tsx` consolidated into a thin shim over `MetaSEO`; 253 lines of duplication deleted
- `RouteSeo` helper wires `seo.config.ts` to any page in one line
- 6 high-traffic service pages instrumented with per-page meta
- Bot-detection regex covers WhatsApp, Facebook, Discord, Pinterest, AI assistants
- **Bug fix:** every non-blog page was sending `noindex` to crawlers; respects config now
- 4 more service routes added to `SEO_CONFIG`

### Reliability
- `RouteErrorBoundary` contains render errors to the page content area; auto-resets on navigation
- 38 new unit tests across `client/`, `server/`, `shared/` (was 0 server-side)
- `vitest.config.ts` now runs server + shared specs alongside client tests
- `npm run check:dead-code` ready for periodic audits (`ts-prune`)

### Observability
- API latency events flowing to GA + PostHog
- Crawler regex extracted and tested in isolation
- `/admin/stats` cache emits `X-Cache: HIT|MISS` for hit-rate observation

### Cleanup
- 9.6 MB freed from stale `.claude/worktrees/` checkout
- `.claude/worktrees/` ignored going forward
- `server/storage.ts` (dead code, zero callers) deleted

---

## Files NOT included

There are two unrelated working-tree changes that pre-existed this session and
are not part of this branch's commits:

- `client/src/features/itr/pages/filing.test.ts` — modified
- `client/src/lib/vercel-tax-return-api.test.ts` — new, untracked

These look like work in progress from another effort. They aren't blocking the
merge of this branch but should be reviewed and either committed or discarded
separately.
