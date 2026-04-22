# MyeCA.in Dev Handoff

## API and Engineering Handoff

## 1. Purpose
This document is the engineering handoff version of the product blueprint. It is focused on:
- the currently mounted API surface,
- auth and role expectations,
- request and response contracts that exist today,
- modules that are real vs mock-backed,
- and the recommended next implementation sequence.

This is based on the live code structure in:
- `server/app.ts`
- `server/routes.ts`
- `server/routes/*.ts`
- `server/middleware/auth.ts`

## 2. Runtime Overview

### App shape
- Frontend: React + Vite SPA
- Backend: Express app mounted under `/api`
- Hosting model: Vercel static assets + Vercel Node.js function
- Primary auth pattern: Clerk bearer-token auth via `@clerk/express`
- Primary data layer: Neon Postgres, accessed through `adminDb.collection(...)` compatibility adapter
- File storage: Vercel Blob

### Base URL conventions
- Public site routes: `/`
- API base path: `/api`
- Versioned auth namespace: `/api/v1/auth`

### Cache behavior
- `GET /api/public/*` and `GET /api/cms/*` receive public cache headers in `server/app.ts`
- Other `GET /api/*` requests default to private/no-cache
- Non-GET API requests default to `no-store`

## 3. Authentication and Authorization

### Auth middleware in use
- `requireAuth` / `authenticateToken`: requires a valid Clerk-authenticated request
- `requireAnyAuth`: requires auth plus one of `superadmin | admin | team_member | ca | user`
- `requireAdmin`: `admin`
- `requireCA`: `admin | ca`
- `requireTeamMember`: `admin | team_member`

### Auth source of truth
- Clerk session is the identity source
- App role comes from the `users` collection in Neon
- `findOrCreateUserProfile()` is used inside role-based middleware to hydrate app user records

### Current request auth contract
Protected endpoints expect:

```http
Authorization: Bearer <clerk_token>
```

### Important implementation note
There are still some frontend/local-dev patterns that simulate auth behavior, but the backend contract is Clerk-first. Backend development should treat Clerk + role-backed user records as canonical.

## 4. Mounted Route Map

These are the routes actually mounted in `server/routes.ts`.

### Platform and technical routes
- `GET /sitemap.xml`
- `GET /openapi.json`
- `GET /llms.txt`
- `GET /robots.txt`
- `GET /api/health`
- `POST /api/errors/log`

### Mounted API modules
- `/api/v1/auth`
- `/api/documents`
- `/api/referrals`
- `/api/notifications`
- `/api/teams`
- `/api/workflows`
- `/api/reports`
- `/api/cms`
- `/api/analytics`
- `/api/system`
- `/api/audit`
- `/api`
- `/api/profiles`
- `/api/public`
- `/api/admin`
- `/api/ca`

## 5. Active API Surface

## 5.1 Platform and Utility Endpoints

### `GET /api/health`
- Auth: none
- Purpose: liveness check
- Response:

```json
{ "status": "ok" }
```

### `POST /api/errors/log`
- Auth: rate-limited, no user auth requirement
- Purpose: client-side error ingestion
- Body: raw text or JSON payload
- Behavior: appends to `debug-ac3226.log`
- Response:

```json
{ "status": "logged" }
```

### `GET /openapi.json`
- Auth: none
- Purpose: extremely minimal public API descriptor
- Status: placeholder only, not a full spec

## 5.2 Auth API

Base path: `/api/v1/auth`

### `GET /me`
- Auth: `requireAuth`
- Purpose: return current app user and resolved assigned CA details
- Response:

```json
{
  "user": {
    "id": "clerk_user_id",
    "email": "user@example.com",
    "role": "user",
    "assignedCaId": "ca_user_id",
    "assignedCaName": "CA Name",
    "assignedCaEmail": "ca@example.com"
  }
}
```

### `POST /sync`
- Auth: `requireAuth`
- Purpose: create or update current user profile in app database and sync role claims
- Body:

```json
{
  "email": "user@example.com",
  "firstName": "Aman",
  "lastName": "Sharma",
  "phoneNumber": "9876543210"
}
```

- Notes:
  - Role can be inferred from provisioned email or bootstrap config.
  - Creates a new user record if one does not exist.

### `POST /logout-event`
- Auth: `requireAuth`
- Purpose: persist auth-related audit event
- Body:

```json
{
  "reason": "manual"
}
```

Allowed values:
- `manual`
- `timeout`
- `session_expired`

## 5.3 Public Content API

Base path: `/api/public`

### `GET /updates/active`
- Auth: none
- Purpose: fetch active daily updates for banners/notices
- Backing: Neon `daily_updates`

### `GET /blogs?page=1&limit=12&category=&search=&audience=`
- Auth: none
- Purpose: paginated public blog listing
- Backing: Neon `blog_posts` via blog service helpers
- Response shape:

```json
{
  "success": true,
  "posts": [],
  "total": 0,
  "page": 1,
  "hasMore": false
}
```

### `GET /blogs/:slug`
- Auth: none
- Purpose: fetch public blog detail

### `GET /blogs/:slug/related`
- Auth: none
- Purpose: fetch related posts

### `GET /categories`
- Auth: none
- Purpose: fetch public blog categories

## 5.4 User Core API

Base path: `/api`

### `GET /user/dashboard`
- Auth: `requireAnyAuth`
- Purpose: dashboard summary for signed-in user
- Current backing:
  - `tax_returns`
  - `documents`
  - `user_services`
- Response:

```json
{
  "success": true,
  "stats": {
    "totalReturns": 0,
    "documentsUploaded": 0,
    "pendingTasks": 1,
    "savedAmount": 0
  },
  "activeServices": [],
  "recentActivity": [],
  "taxReturns": []
}
```

### `GET /profile`
- Auth: `requireAnyAuth`
- Purpose: return safe current user profile from request context

### `PUT /profile`
- Auth: `requireAnyAuth`
- Purpose: update current user basic profile
- Body:

```json
{
  "firstName": "Aman",
  "lastName": "Sharma"
}
```

### `GET /user-services`
- Auth: `requireAnyAuth`
- Purpose: fetch current user’s activated services

### `POST /user-services`
- Auth: `requireAnyAuth`
- Purpose: create a service activation / work item
- Body:

```json
{
  "serviceId": "itr-filing",
  "serviceTitle": "Income Tax Return",
  "serviceCategory": "individual",
  "paymentAmount": 999,
  "paymentStatus": "pending",
  "status": "pending",
  "metadata": {
    "source": "service_selection_page"
  }
}
```

## 5.5 Profile API

Base path: `/api/profiles`

### `GET /`
- Auth: `authenticateToken`
- Purpose: fetch all profiles for current user
- Notes:
  - PAN and Aadhaar are decrypted then masked before response

### `POST /`
- Auth: `authenticateToken`
- Purpose: create dependent/self profile
- Body:

```json
{
  "name": "Aman Sharma",
  "relation": "self",
  "pan": "ABCDE1234F",
  "aadhaar": "123412341234",
  "dateOfBirth": "1995-01-01",
  "address": "Mumbai, Maharashtra",
  "isActive": true
}
```

### `PATCH /:id`
- Auth: `authenticateToken`
- Purpose: update an existing profile owned by current user

## 5.6 Documents API

Base path: `/api/documents`

### `POST /upload`
- Auth: `authenticateToken`
- Purpose: upload private user document to Vercel Blob and persist metadata
- Request: `multipart/form-data`
- Fields:
  - `file`
  - `name`
  - `category`
  - `tags`
  - `description`
  - `year`
- Allowed file types:
  - PDF
  - JPEG/PNG/JPG
  - Word
  - Excel
- Max size: 10 MB

### `POST /register`
- Auth: `authenticateToken`
- Purpose: register an externally created Vercel Blob document into vault metadata
- Body:

```json
{
  "name": "Rent Receipt",
  "url": "https://...vercel-storage.com/...",
  "category": "rent_receipt",
  "year": "2025-26",
  "description": "Generated document",
  "storagePath": "documents/...",
  "size": 12345,
  "mimeType": "application/pdf"
}
```

### `GET /`
- Auth: `authenticateToken`
- Purpose: list active documents for current user
- Query params:
  - `category`
  - `year`
  - `search`

### `GET /stats/summary`
- Auth: `authenticateToken`
- Purpose: summarize doc count, sizes, category split, year split

### `GET /:id/download`
- Auth: `authenticateToken`
- Purpose: owner-checked private download proxy from Vercel Blob

### `GET /:id`
- Auth: `authenticateToken`
- Purpose: fetch one document metadata record

### `PATCH /:id`
- Auth: `authenticateToken`
- Purpose: update document metadata

### `DELETE /:id`
- Auth: `authenticateToken`
- Purpose: soft-delete metadata and attempt blob deletion

## 5.7 Admin API

Base path: `/api/admin`

### `POST /invitations`
- Auth: `requireAdmin`
- Purpose: invite or promote admin/team/CA users
- Body:

```json
{
  "email": "ca@example.com",
  "firstName": "Riya",
  "lastName": "Gupta",
  "role": "ca"
}
```

### `GET /users?page=1&limit=10&search=`
- Auth: `requireAdmin`
- Purpose: paginated user management

### `PATCH /users/:id/role`
- Auth: `requireAdmin`
- Purpose: update user role and/or status
- Body:

```json
{
  "role": "team_member",
  "status": "active"
}
```

### `PATCH /users/:id/assign-ca`
- Auth: `requireAdmin`
- Purpose: assign or unassign a CA
- Body:

```json
{
  "caId": "user_ca_123"
}
```

### `DELETE /users/:id`
- Auth: `requireAdmin`
- Purpose: soft-deactivate user

### `GET /stats`
- Auth: `requireAdmin`
- Purpose: operational dashboard stats
- Current behavior:
  - aggregates users
  - aggregates blog/categories/updates
  - builds pending worklist from `user_services` and `tax_returns`

## 5.8 CA API

Base path: `/api/ca`

### `GET /clients`
- Auth: `requireCA`
- Purpose: fetch clients assigned to logged-in CA
- Notes:
  - loops through client profiles and tax returns
  - currently N+1 style and should be optimized later

### `GET /clients/:userId/documents`
- Auth: `requireCA`
- Purpose: fetch assigned client’s documents

### `GET /clients/:userId/filings`
- Auth: `requireCA`
- Purpose: fetch assigned client’s filings across profiles

### `GET /stats`
- Auth: `requireCA`
- Purpose: CA dashboard metrics

## 5.9 CMS API

Base path: `/api/cms`

All routes require `requireTeamMember` unless stated otherwise.

### Blog posts
- `GET /posts`
- `GET /posts/:id`
- `POST /posts`
- `PUT /posts/:id`
- `DELETE /posts/:id`

Post create/update is built around the shared blog editor schema. Core fields include:
- `title`
- `slug`
- `excerpt`
- `content`
- `status`
- `categoryId`
- `coverImage`
- `authorId`
- `seoTitle`
- `seoDescription`
- `tags`
- `faqItems`
- `keyHighlights`

### Media
- `POST /upload`
- `GET /media`

Media upload notes:
- image only
- 5 MB max
- converts to WebP
- writes both main image and thumbnail to Vercel Blob

### Categories
- `GET /categories`
- `POST /categories`

Category body:

```json
{
  "name": "Income Tax",
  "slug": "income-tax"
}
```

### Daily updates
- `GET /updates`
- `POST /updates`
- `PUT /updates/:id`
- `DELETE /updates/:id`

Update body:

```json
{
  "title": "ITR filing deadline reminder",
  "description": "File before the due date.",
  "priority": "HIGH",
  "isActive": true,
  "expiresAt": "2026-07-31T00:00:00.000Z"
}
```

## 5.10 Audit API

Base path: `/api/audit`

### `POST /logs`
- Auth: `requireAuth`
- Purpose: create audit event from app modules
- Body:

```json
{
  "action": "document_uploaded",
  "category": "documents",
  "status": "success",
  "metadata": {
    "documentId": "abc123"
  }
}
```

### `GET /logs?limit=100&offset=0&q=`
- Auth: `requireAdmin`
- Purpose: paginated/searchable audit log view

### `GET /download`
- Auth: `requireAdmin`
- Purpose: download JSONL export of audit logs

## 5.11 System API

Base path: `/api/system`

### `GET /config`
- Auth: `requireAdmin`
- Purpose: read system config from `config/system.json`

### `PUT /config`
- Auth: `requireAdmin`
- Purpose: overwrite system config file
- Body:

```json
{
  "siteName": "MyeCA.in",
  "allowRegistrations": true,
  "maintenanceMode": false,
  "supportEmail": "support@myeca.in",
  "security": {
    "passwordMinLen": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumber": true,
    "requireSpecial": true
  }
}
```

## 5.12 Analytics API

Base path: `/api/analytics`

### `GET /overview`
- Auth: none
- Purpose: dashboard stats payload
- Current state: mock data only
- Action: should be treated as placeholder, not source of truth

## 5.13 Notifications API

Base path: `/api/notifications`

### Endpoints
- `GET /`
- `PATCH /:id/read`
- `PATCH /read-all`
- `DELETE /:id`
- `POST /test`

Current state:
- mock in-memory notification store
- not database-backed

## 5.14 Teams API

Base path: `/api/teams`

### Endpoints
- `GET /`
- `POST /`
- `GET /:teamId`
- `POST /:teamId/invite`
- `POST /:teamId/tasks`
- `GET /:teamId/tasks`
- `PATCH /:teamId/tasks/:taskId`
- `POST /:teamId/notes`
- `GET /:teamId/notes`
- `GET /:teamId/activity`

Current state:
- mock in-memory team, member, task, and note storage

Key request bodies:

#### Create team
```json
{
  "name": "Tax Experts Team",
  "description": "Main tax filing team",
  "type": "tax_filing"
}
```

#### Invite member
```json
{
  "email": "member@example.com",
  "role": "member",
  "message": "Join the team"
}
```

#### Create task
```json
{
  "title": "Review Form 16",
  "description": "Check salary breakup",
  "priority": "high",
  "type": "document_review"
}
```

## 5.15 Workflows API

Base path: `/api/workflows`

### Endpoints
- `GET /templates`
- `POST /`
- `GET /`
- `GET /:id`
- `PATCH /:id`
- `POST /:id/toggle`
- `DELETE /:id`
- `GET /:id/history`

Current state:
- mock in-memory workflow store

Create/update body:

```json
{
  "name": "Tax Filing Reminder",
  "description": "Remind user monthly",
  "trigger": {
    "type": "schedule",
    "config": {
      "frequency": "monthly",
      "date": 25
    }
  },
  "actions": [
    {
      "type": "email",
      "config": {
        "template": "tax_reminder"
      }
    }
  ],
  "enabled": true
}
```

## 5.16 Reports API

Base path: `/api/reports`

### Endpoints
- `POST /generate`
- `GET /templates`
- `GET /history`

Current state:
- request validation is real
- report payloads are mock/generated in memory

Generate report body:

```json
{
  "type": "tax_summary",
  "startDate": "2025-04-01",
  "endDate": "2026-03-31",
  "format": "pdf",
  "filters": {}
}
```

Allowed `type` values:
- `tax_summary`
- `refund_status`
- `compliance`
- `business_overview`
- `client_activity`

## 5.17 Referrals API

Base path: `/api/referrals`

### Endpoints
- `GET /overview`
- `GET /stats`
- `GET /`
- `POST /`
- `GET /rewards`
- `POST /rewards/:rewardId/redeem`
- `POST /generate-link`
- `GET /leaderboard`
- `GET /analytics`
- `POST /bulk-import`
- `POST /link-service`
- `POST /:referralId/send-reminder`

Current state:
- mostly mock in-memory referral storage
- includes email and QR-code related logic
- file upload for CSV import exists
- endpoint duplication exists for `/analytics` in the route file and should be cleaned up

Core create referral body:

```json
{
  "refereeEmail": "friend@example.com",
  "refereeName": "Friend Name",
  "message": "Use my code",
  "serviceType": "itr_filing"
}
```

## 6. Mounted vs Unmounted Route Files

These route files exist in `server/routes/` but are not mounted in `server/routes.ts` right now, so frontend or integration work should not depend on them unless they are explicitly registered:

- `2fa.ts`
- `two-factor.ts`
- `chat.ts`
- `email.ts`
- `advanced-features.ts`
- `ai-optimizer.ts`
- `feedback.ts`

This matters because some frontend routes/pages appear to assume these capabilities exist, but the backend currently does not expose them through the mounted app router.

## 7. Current Module Status

### Production-backed / closer to real
- Auth
- User profile core
- Profiles
- Documents
- Admin user management
- CA assignment and CA views
- Public blogs/categories/updates
- CMS content operations
- Audit logging
- System config

### Mixed / partially real
- User dashboard
- Admin stats

These use real collections but still contain placeholder values or simplistic aggregation logic.

### Mock or demo-backed
- Analytics overview
- Notifications
- Teams
- Workflows
- Reports
- Referrals

## 8. Recommended Next API Work

### Priority 1
- Normalize `tax_returns` into first-class server APIs.
- Add service request detail endpoints instead of only `user-services` list/create.
- Remove frontend reliance on hardcoded dashboard data.
- Register or delete dead backend route files so the surface is unambiguous.

### Priority 2
- Add structured task/comment/milestone APIs for filings and services.
- Replace mock notifications with database-backed notifications.
- Replace mock workflows with real scheduled workflow records.

### Priority 3
- Build report generation on top of real entities.
- Normalize referrals into persisted storage.
- Add expert case timelines and internal notes.

## 9. Suggested Target REST Surface

These are the missing API groups that would make the product operationally complete:

### Tax returns
- `GET /api/tax-returns`
- `POST /api/tax-returns`
- `GET /api/tax-returns/:id`
- `PATCH /api/tax-returns/:id`
- `POST /api/tax-returns/:id/submit`
- `POST /api/tax-returns/:id/comments`
- `POST /api/tax-returns/:id/tasks`

### Service requests
- `GET /api/service-requests`
- `POST /api/service-requests`
- `GET /api/service-requests/:id`
- `PATCH /api/service-requests/:id`
- `POST /api/service-requests/:id/milestones`
- `POST /api/service-requests/:id/comments`

### Notifications
- move current mock API to persisted `notifications` collection/table

### Cases / unified workbench
- optional future abstraction if filings and service requests converge

## 10. Final Engineering Notes
- The backend is already close to a solid multi-role platform, but the API surface is uneven.
- The biggest source of engineering confusion right now is not missing pages. It is the mismatch between:
  - mounted routes,
  - route files on disk,
  - real data-backed modules,
  - and mock/demo modules.
- The fastest way to reduce product risk is to make filings, service requests, and internal fulfillment APIs first-class and consistent.
