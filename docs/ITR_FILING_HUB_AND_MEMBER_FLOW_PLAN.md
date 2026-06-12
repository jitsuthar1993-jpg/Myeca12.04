# MY ITR Hub & Member-Selection Flow Plan

> **Status (2026-06-13):** core implemented (P0–P3). `/itr/filing` is the hub, `/itr/filing/new` is the owner-selection screen (`hub.page.tsx`, `new-filing.page.tsx`, `hub-selectors.ts`, `CaAssistStrip.tsx`), the wizard lives at `/itr/filing/:returnId` with the Owner step removed and an owner chip, and `POST /api/tax-returns` does server-side prefill + open-draft resume. Remaining from this plan: filed-copy upload affordance on the hub (`itr-filed-return` category UI), `profileId` on document uploads, Playwright funnel coverage, and the §11 deferred decisions.
>
> Goal: when a user taps **MY ITR** in the dashboard, `/itr/filing` should land on a **hub** whose top section offers **Previous ITR documents** and **New filing**. Tapping **New filing** opens a **"who are we filing for?"** screen (Self + saved members with PAN). After selection, the user enters the existing **one-pane-at-a-time guided wizard** (mobile-first), with **CA-assist branding** and **document upload** throughout.
>
> Builds on `docs/MOBILE_ITR_FILING_PLAN.md` (pane architecture — implemented) and `docs/ITR_INCOME_MODULES_CODEX_PLAN.md`. Design system unchanged (slate + blue, `MyeCard`/`StatusBadge`/`type-*` tokens).

---

## 0. Requirement → plan mapping

| # | Requirement (user) | Plan section |
|---|---|---|
| 1 | After selecting MY ITR in user dashboard, the top section shall have **Previous ITR documents** and **New filing** | §3.1 MY ITR hub |
| 2 | After clicking New filing, show a screen for **Self or Members** (member list **with PAN** if any) | §3.2 Owner selection screen |
| 3 | Based on the selection, **mobile-style one-by-one data entry**, **CA-assist branding**, **document upload** | §3.3 Wizard changes (panes already exist; add prefill, owner context, CA branding) |

---

## 1. Current state audit

### What exists (reuse, don't rebuild)

| Asset | Location | Notes |
|---|---|---|
| MY ITR nav entry (sidebar + mobile bottom nav) → `/itr/filing` | `client/src/lib/role-workspace.ts:93`, `client/src/components/admin/Layout.tsx` | Href stays the same; hub becomes the landing view |
| 7-step guided wizard (Owner → Identity → Income → Documents → Verify → Compute → Review) | `client/src/features/itr/pages/filing.page.tsx` (~1,520 lines) | Auto-selects most recent return and drops straight into the wizard — no hub |
| One-pane-at-a-time mobile system | `features/itr/components/filing/panes.ts`, `PaneRenderer.tsx`, `FilingProgressHeader.tsx`, `use-mobile-keyboard.ts` | Requirement 3's "one by one data entry" is already live for wizard steps |
| Autosave (debounce + flush + offline banner) | `features/itr/hooks/use-filing-autosave.ts` | Keep as-is |
| Document capture (upload, camera, vault link, defer) | `features/itr/components/filing/DocumentCaptureCard.tsx` + Documents step | Requirement 3's upload exists inside the wizard |
| Members ("profiles") with PAN | Firestore `profiles`; API `server/routes/profiles.ts` (GET/POST/PATCH); UI `client/src/pages/profiles.page.tsx` (`/profiles`) | `name`, `relation`, `pan` (encrypted at rest, **served masked**), `aadhaar` (masked), `dateOfBirth`, `address` |
| Tax returns API | `server/routes/tax-returns.ts` | `profileId` (validated owner link), `acknowledgmentNumber`, `filedAt`, `refundAmount`, `reviewStatus` + history, review packet, `export-json` |
| Document vault | `server/routes/documents.ts`, `/documents` page | `GET /api/documents?category=&year=&search=`, multipart upload accepts `taxReturnId`, `category`, `year`; download endpoint |
| Public selector handoff | `features/itr/lib/start-selector.ts` | localStorage handoff auto-creates a draft on `/itr/filing` — must keep working |
| CA review machinery | `submit-review` creates a `user_services` case "CA ITR Filing Review"; `user.assignedCaName/Email` on the user schema | Raw material for CA-assist branding |
| Filing telemetry | `features/itr/lib/filing-telemetry.ts`, `client/src/telemetry/privacy.ts` | `/itr/filing` is masked for privacy; extend matcher to sub-routes |

### Gaps vs the three requirements

1. **No hub.** `/itr/filing` jumps straight into the wizard (or an empty "Start from scratch" card). Previous returns/documents are only reachable via the generic `/documents` vault.
2. **Owner step is wrong-sourced and buried.** The "Another person" dropdown lists *previous tax returns* (`savedTaxpayerLabel`), not the `profiles` collection; no PAN shown; no "add member"; no identity prefill; and the choice lives *inside* the wizard instead of before it.
3. **CA-assist branding is thin.** "Self-prep with CA review" heading (desktop only) and the Review step copy; nothing persistent on mobile panes, the documents step, or the entry screens.

---

## 2. Target information architecture

### 2.1 Routes

| Route | View | Auth | Notes |
|---|---|---|---|
| `/itr/filing` | **MY ITR hub** (Previous ITR documents + New filing + Continue drafts) | RequireAuth | Sidebar/bottom-nav href unchanged |
| `/itr/filing/new` | **Owner selection** (Self / members with PAN / add member) | RequireAuth | Creates or resumes a draft, then redirects |
| `/itr/filing/:returnId` | **Guided wizard** (existing panes, minus Owner step) | RequireAuth | Deep-linkable, resumable per draft |

Implementation notes:

- Register all three in `client/src/routes/registry/workspace-routes.ts` and `client/src/Routes.tsx` (wouter; order `:returnId` after `new`, or guard `new` inside the param route — prefer explicit `<Route path="/itr/filing/new">` *before* `<Route path="/itr/filing/:returnId">`).
- `filing.page.tsx` `readFilingHistoryPosition()` and `features/itr/hooks/use-filing-navigation.ts` `readPosition()` both check `window.location.pathname !== "/itr/filing"` — change to a prefix/regex match (`/^\/itr\/filing\/[^/]+$/`) so per-draft pane history keeps working. Consolidate the page's inline copy of this logic onto the `use-filing-navigation` hook while touching it (it currently duplicates the hook).
- Legacy links:
  - `/itr/filing?source=...` with a selector handoff in localStorage → hub detects the handoff and forwards to `/itr/filing/new?source=...` (handoff banner + auto-create preserved there).
  - Existing bookmarks to `/itr/filing` simply land on the hub; their draft appears as a "Continue" card (one extra tap — acceptable and explicitly requested).
- `client/src/telemetry/privacy.ts`: extend the `/itr/filing` route-masking rule to the new sub-routes (mask `:returnId`).
- PWA: add the new paths alongside `/itr/filing` in the service-worker `navigateFallbackDenylist` (`vite.config.ts`) — authed, network-only.

### 2.2 Flow

```
Dashboard ──"MY ITR"──▶ /itr/filing  (HUB)
                          │
        ┌─────────────────┼───────────────────────┐
        ▼                 ▼                       ▼
  Previous ITR        New filing            Continue draft
  documents           (primary CTA)         (per open draft)
        │                 │                       │
        ▼                 ▼                       │
  AY-grouped list   /itr/filing/new               │
  · status/ack      "Who are we filing for?"      │
  · linked docs       ├─ Self (prefilled)         │
  · download/export   ├─ Member cards (PAN ●●●)   │
  · filed-copy upload ├─ + Add member (sheet)     │
                      └─ [Continue]               │
                          │  POST /api/tax-returns│
                          │  (server prefill,     │
                          │   resume if open)     │
                          ▼                       ▼
                    /itr/filing/:returnId  (WIZARD — existing panes)
                    Identity → Income → Documents → Verify → Compute → Review
                    · owner context chip ("Filing for Mom · PAN ●●●●")
                    · CA-assist strip · doc upload · LiabilityChip · autosave
```

---

## 3. Screen-by-screen specification

### 3.1 MY ITR hub — `/itr/filing`

New file: `client/src/features/itr/pages/hub.page.tsx` (wraps in `Layout title="MY ITR"`; the wizard page stops rendering hub concerns).

Layout, top to bottom (mobile-first, single column; desktop two-column where noted):

1. **Header card** (compact, ≤120px on mobile)
   - Eyebrow `MY ITR`, H1 "Income tax filing", subline "AY 2026-27 · due 15 Sep 2026".
   - **`CaAssistStrip`** (new, §3.4): ShieldCheck + "CA-assisted — every filing is reviewed by a chartered accountant" (+ assigned CA name when `user.assignedCaName` exists).

2. **Top action section** — the two requirement-1 entries as side-by-side tappable cards (`grid-cols-2`, 44px+ touch targets):
   - **New filing** (primary, blue-600 fill): FilePlus icon, "New filing", "Start AY 2026-27 for yourself or a family member" → `/itr/filing/new`.
   - **Previous ITR documents** (outline): FolderOpen icon, "Previous ITR documents", count badge (`N returns · M documents`) → scrolls to / expands section 4 (mobile: navigates focus; desktop: anchors).

3. **Continue filing** (conditional) — one card per *open* draft (`status` in `draft`/`changes_requested`), most recent first:
   - Owner label (profile name or "Self"), AY, recommended form chip, progress hint (`StatusBadge`), last-saved time.
   - CTA "Continue" → `/itr/filing/:returnId`. Submitted/under-review returns render here too but with status badge (`ready_for_review`, `ca_review`…) and CTA "View status" (read-only wizard, §3.3.5).

4. **Previous ITR documents** section:
   - Source: existing `GET /api/tax-returns` (already returns `acknowledgmentNumber`, `filedAt`, `refundAmount`, `itrType`, `reviewStatus`) grouped by `assessmentYear` desc; plus `GET /api/documents` filtered by `taxReturnId` for linked files.
   - Per return row (reuse compact-table styling from the admin Operational Log work): AY, owner label, form (`ITR-1`…), `StatusBadge`, ack number when filed, refund amount when present.
   - Row expand (mobile: full-width sheet) → linked documents list with **Download** (existing `/api/documents/:id/download`), **Export JSON** (existing endpoint, respects export gating), **Review packet** link.
   - **Upload filed copy**: per filed return, an upload affordance (reuses `DocumentCaptureCard` in "compact" mode) posting to `/api/documents/upload` with `taxReturnId` + new category `itr-filed-return` (covers ITR-V/acknowledgment PDFs users bring from the portal era before MyeCA).
   - Empty state: "Your filed returns, acknowledgments and documents will appear here." with secondary link to `/documents` (vault).

5. **Footer links**: Document vault (`/documents`), Members (`/profiles`), ITR status tracker (`/itr/status-tracker`).

Selector/helper logic in a new pure module `client/src/features/itr/lib/hub-selectors.ts` (`groupReturnsByYear`, `isOpenDraft`, `ownerLabel`) so it's unit-testable like `start-selector.ts`.

### 3.2 Owner selection screen — `/itr/filing/new`

New file: `client/src/features/itr/pages/new-filing.page.tsx`. Mobile-first, one decision per viewport, same chrome as the public selector (`start.page.tsx` is the visual model: sticky header, card list, fixed bottom CTA bar).

**Pane 1 — "Who are we filing for?"**

- **Self card** (always first, preselected): user's name (`firstName lastName`), email, masked PAN from the self profile when one exists (`relation === "self"`), else "PAN — add during filing". Badge "Your account".
- **Member cards** from `GET /api/profiles` (excluding `relation === "self"` which feeds the Self card): name, relation badge (Spouse/Parent/Child/…), **PAN masked as served** (`ABCDE•••••F` via existing `maskPan`) or "PAN not added" chip, inactive profiles hidden.
- Per-card "Draft in progress" pill when an open draft exists for that `profileId` + AY (computed client-side from the tax-returns query) — selecting it routes to **resume**, not duplicate.
- **Add member** card (dashed outline, PlusCircle): opens a bottom sheet (mobile) / dialog (desktop) with the same form schema as `profiles.page.tsx` (`name`, `relation`, optional `pan`, optional `dateOfBirth`; PAN regex `^[A-Z]{5}[0-9]{4}[A-Z]$` reused) → `POST /api/profiles` → optimistic insert + auto-select. Extract the form into `client/src/features/itr/components/MemberQuickAdd.tsx` so `/profiles` and this screen share validation.
- Assessment-year selector (small segmented control, default `2026-27`) — mirrors `start.page.tsx` options.
- `CaAssistStrip` compact variant under the list: "A MyeCA chartered accountant reviews every filing before submission."

**Fixed bottom bar**: Back (→ hub) + **Continue** (disabled until a card is selected).

**Continue behavior** (mutation, with full-screen pending state):
1. If an open draft exists for the selection (self → `profileId === selfProfileId || null` + `filingOwner.mode === "self"`; member → matching `profileId`) → navigate to `/itr/filing/:existingId` with toast "Resumed your saved draft".
2. Else `POST /api/tax-returns` with `{ assessmentYear, profileId? , owner: "self" | "member" }` (§4.1) — server prefills identity — then navigate to `/itr/filing/:newId`.
3. Selector-handoff present (`?source=` + localStorage): show the existing "Apply saved answers" banner here; on Continue, merge `handoff.draft` into the create payload (current auto-create logic moves from `filing.page.tsx` to this screen).

**Error states**: profiles 503 (PII key unconfigured) → inline alert with retry; create failure → red alert card (copy pattern from current page's `createDraftMutation.isError` block).

### 3.3 Guided wizard — `/itr/filing/:returnId`

Existing `filing.page.tsx`, refactored — the pane system, autosave, validation, liability chip, document upload, and action bar all stay. Changes:

1. **Remove the Owner step** from `ITR_FILING_STEPS` (and the `owner` branch in `panes.ts` / step renderers). The wizard becomes 6 steps: Identity → Income → Documents → Verify → Compute → Review. Owner choice now happens at `/itr/filing/new`; `draft.filingOwner` is set at creation:
   - self → `{ mode: "self" }`
   - member → `{ mode: "other", personId: <profileId>, relationship: <profile.relation>, displayName: <profile.name> }`
   - Keep `itrFilingOwnerSchema` unchanged (no shared-schema migration; old drafts with `mode: "other"` and no `personId` stay valid). The verification rule `owner-other-person` keeps working.
2. **Owner context chip** (new `FilingOwnerChip`): shown in `FilingProgressHeader` (mobile) and the desktop header card — "Filing for **Asha Suthar** · Mother · PAN ●●●●F" with a "Change" link → back to `/itr/filing/new` (allowed only while `status === "draft"`; confirm dialog warns identity fields reset if a different person is chosen — implemented as: changing person never mutates this draft, it creates/resumes the other person's draft).
3. **Load by route param**: replace `activeReturnId = taxReturns[0]` auto-selection with the `:returnId` param + `GET /api/tax-returns/:id`; unknown/foreign id → friendly 404 card with "Back to MY ITR".
4. **Identity prefill UX**: panes unchanged, but fields arrive prefilled from the server (§4.1). Prefilled panes show helper "Prefilled from your saved member — please verify." On mobile, prefilled-and-valid identity panes still render (verification matters for PAN), but `enterKeyHint`/focus order makes confirm-and-continue one tap.
5. **Read-only mode** once `status >= ready_for_review`: inputs disabled, action bar replaced with status strip + "Track review" (today `reviewSubmitted` only disables the submit button — extend to full draft lock to match CA-side expectations).
6. **Documents step** keeps `DocumentCaptureCard` upload + vault linking; upload payload additionally sends the draft's `profileId` so vault items are member-attributable (`/api/documents/upload` already persists arbitrary fields server-side — add `profileId` explicitly, §4.3).
7. **CA-assist branding** (§3.4) on: mobile progress header (compact pill), Documents step intro ("Your CA verifies each document"), Verify step, Review step (already present), success/submitted state.

### 3.4 CA-assist branding system

New `client/src/features/itr/components/CaAssistStrip.tsx`, design-system-native (no new colors/fonts):

| Variant | Where | Content |
|---|---|---|
| `banner` | Hub header, owner screen footer | ShieldCheck in blue-50 tile + "CA-assisted filing" + one line: assigned CA name (`useAuth().user.assignedCaName`) or generic copy + optional "How review works" link → `/services/itr-for-salaried#process` |
| `pill` | `FilingProgressHeader` (mobile), desktop wizard header | `BadgeCheck` + "CA-assisted" (replaces nothing; sits next to the form-recommendation pill) |
| `inline` | Documents/Verify step intros, submit confirmation | One sentence, slate-600 semibold, no card |

Copy rules: factual ("reviewed by a chartered accountant before filing"), no portal-filing claims (consistent with `success.page.tsx` disclaimers), no self-referential site copy (see memory: avoid "visitors/homepage" meta-copy).

---

## 4. Backend & data changes

### 4.1 `POST /api/tax-returns` — server-side identity prefill (the only substantial API change)

Extend `createTaxReturnSchema` with optional `owner: z.enum(["self","member"]).optional()` (member implies `profileId` required). Behavior in `server/routes/tax-returns.ts`:

1. Validate `profileId` ownership (existing `assertProfileCanBeLinked`).
2. **Prefill draft.taxpayer before storage** (new helper `buildPrefilledDraft` colocated with the route):
   - member: decrypt profile PII server-side (`decryptPII`) → `pan`, `aadhaar`, `dateOfBirth`, name split into `firstName`/`lastName`; set `filingOwner` as §3.3.1; copy `relation`.
   - self: from `users` record → `firstName`, `lastName`, `email`, `mobile` (`phoneNumber` digits); plus PAN/Aadhaar/DOB from the self profile when present; `filingOwner.mode = "self"`.
   - Merge order: client-sent `draft` (selector handoff) ← prefill ← defaults, then existing `normalizeItrDraft` + `secureDraftForStorage` (PII re-encrypted at rest — **no new plaintext anywhere**; the wizard already receives decrypted taxpayer fields for its own drafts, so no new exposure class).
3. **Duplicate guard / resume**: before creating, query `tax_returns` for same `userId` + `assessmentYear` + same owner key (`profileId`, or `filingOwner.mode === "self"` when `profileId` null) with `status` in (`draft`, `changes_requested`); if found, return it with `resumed: true` instead of inserting. (Keeps the hub's "Continue" and the owner screen's double-tap idempotent.)

### 4.2 `GET /api/documents` — `taxReturnId` filter

Add `taxReturnId` to the accepted query params (one `where` clause; same pattern as `category`/`year`). Check/create the Firestore composite index (`userId + status + taxReturnId`) — note in `docs/DatabaseManagement.md`. Until the index ships, the hub can filter client-side from the unfiltered list (acceptable: users have few documents).

### 4.3 Documents upload — member attribution + filed-copy category

- Accept/persist `profileId` on `/api/documents/upload` (validate ownership via `recordBelongsToUser("profiles", …)` like tax-returns does).
- Add `itr-filed-return` to the documents-page category list (`client/src/pages/documents.page.tsx` `documentCategories`) and treat it in the hub as "Filed copy".

### 4.4 Explicitly **no** schema migrations

`profiles`, `tax_returns`, `documents` already carry every field needed (`profileId`, `acknowledgmentNumber`, `relation`, encrypted PAN). `shared/itr-filing.ts` schemas unchanged except optional helper exports. Zero Firestore data backfill.

---

## 5. PII & security rules (binding for implementation)

1. Member PAN/Aadhaar render **only masked** on hub/owner screens (already enforced by `serializeProfile` — never add an unmasked profiles endpoint).
2. Prefill happens **server-side only** (§4.1); the client never round-trips decrypted member PII outside its own draft (existing pattern).
3. Telemetry payloads carry booleans/counts only (`hasPan: true`), never PAN fragments or names; extend `privacy.ts` masking to `/itr/filing/:returnId`.
4. Read-only lock after submission (§3.3.5) prevents post-review tampering with the packet the CA sees.
5. Access control reuse: `getUserOwnedRecords`, `assertProfileCanBeLinked`, document-owner checks — no new authz surface.

---

## 6. Navigation, history & state details

- **Hub → owner screen → wizard** are real route transitions (wouter `navigate`), so Android/browser back naturally walks wizard → owner → hub → dashboard.
- Within the wizard, the existing history-marker pane navigation continues to work once the pathname checks accept `/itr/filing/:returnId` (§2.1). Pane state stays keyed per draft: include `returnId` in the marker object so switching drafts never restores a stale pane index.
- Wizard queries change from list-based (`/api/tax-returns` → `[0]`) to detail-based (`/api/tax-returns/:id`) with `queryKey: ["/api/tax-returns", returnId]`; hub keeps the list query; both share the cache via `queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] })` (prefix match) — autosave invalidation already does this.
- Scroll restoration: hub remembers scroll position on back from wizard (default browser behavior is fine since hub is a separate route).

---

## 7. Telemetry (extend `captureItrFilingEvent`)

| Event | Props | Fires |
|---|---|---|
| `itr_hub_viewed` | `openDrafts`, `filedReturns`, `viewport` | Hub mount |
| `itr_hub_previous_docs_opened` | `returns` | Section expand/nav |
| `itr_hub_new_filing_clicked` | — | Top CTA |
| `itr_owner_screen_viewed` | `memberCount`, `membersWithPan` | Owner screen mount |
| `itr_owner_selected` | `mode: self\|member`, `hasPan`, `resumed` | Continue |
| `itr_member_added` | `hasPan` | Quick-add success |
| `itr_draft_created` / `itr_draft_resumed` | `ownerMode`, `source` | Mutation success |

Existing pane/validation/review events unchanged → funnel becomes: `itr_hub_viewed → itr_owner_selected → itr_filing_pane_viewed … → itr_filing_review_submitted`.

---

## 8. Edge cases & error states

| Case | Behavior |
|---|---|
| No previous returns | Hub previous-docs card shows empty state; New filing is visually primary |
| No members saved | Owner screen: Self card + Add member only ("member list with PAN **if any**") |
| Member without PAN | Selectable; "PAN not added" chip; identity pane collects it (PAN is required later by `validateItrIdentity`, not at selection) |
| Open draft for selected person+AY | Resume (server §4.1 + client pill §3.2) — never silent duplicates |
| Return already submitted | Hub: "View status" card; wizard read-only (§3.3.5) |
| Profiles API 503 (PII key missing) | Owner screen inline alert + retry; Self path still works (user-record prefill doesn't need profile decryption) |
| Selector handoff present | Forwarded to owner screen; merged into create payload; banner preserved |
| Offline | Hub/owner screens require network (queries show retry states); wizard keeps existing offline autosave banner |
| Direct link to someone else's `:returnId` | 404 card (existing ownership check on `GET /:id`) |
| Legacy `/itr/filing` deep links incl. PWA start URLs | Land on hub; one tap to continue |

---

## 9. Test plan

**Unit (vitest, colocated like existing `*.test.ts`)**
- `hub-selectors.test.ts`: AY grouping, open-draft detection, owner labels.
- `new-filing.page.test.tsx`: self preselect, member cards masked-PAN rendering, "PAN not added", resume pill, quick-add validation (PAN regex), continue-disabled logic.
- `panes.test.ts` / `PaneRenderer.test.tsx` / `filing.test.ts` updates: owner step removed, 6-step contract, `ITR_FILING_LAYOUT` untouched, history markers include `returnId`.
- `use-filing-navigation.test.tsx`: pathname prefix matching for `/itr/filing/:id`.

**Server (jest, `server/routes/*.test.ts` pattern)**
- create-with-`profileId`: prefill fields present + encrypted at rest, ownership rejection (foreign profile → 400), duplicate → `resumed: true`.
- self create: user-record prefill.
- documents `taxReturnId` filter + `profileId` ownership on upload.

**E2E (playwright, existing config)**
- Mobile viewport: dashboard → MY ITR → hub renders both top entries → New filing → select member with PAN → wizard Identity pane prefilled → upload a document on Documents pane → back-button walks panes → hub.
- Previous docs: filed return row → expand → download link present.

**Regression checklist**: selector handoff auto-create, autosave flush, LiabilityChip offsets, bottom-nav overlap (`mobileActionBarOffset` contract), `/itr/filing` SEO/indexing exclusions (`seo-indexing-policy.test.ts`, `public-link-audit.test.ts` already list it as disallowed — add sub-routes).

---

## 10. Delivery phases (PR-sized)

| Phase | Scope | Files (primary) | Acceptance |
|---|---|---|---|
| **P0 — Routing scaffold** | Add `/itr/filing/new` + `/itr/filing/:returnId`; wizard loads by param; `/itr/filing` temporarily redirects to most-recent draft (behavior-neutral); history/pathname fixes; privacy + SW denylist | `Routes.tsx`, `workspace-routes.ts`, `filing.page.tsx`, `use-filing-navigation.ts`, `privacy.ts`, `vite.config.ts` | All existing tests green; deep link to a draft works |
| **P1 — Hub** | `hub.page.tsx` + `hub-selectors.ts`; top section (Previous ITR documents + New filing); continue cards; previous-returns list with linked docs, download/export; filed-copy upload + `itr-filed-return` category; documents `taxReturnId` filter | new pages/lib, `documents.ts` (server), `documents.page.tsx` | Requirement 1 demoable on mobile + desktop |
| **P2 — Owner selection + prefill** | `new-filing.page.tsx`, `MemberQuickAdd.tsx`; profiles integration; server prefill + resume (`tax-returns.ts`); remove Owner step from wizard; `FilingOwnerChip`; handoff migration | owner screen, `panes.ts`, `filing.page.tsx`, `tax-returns.ts`, `shared/itr-filing.ts` (helper only) | Requirement 2 demoable; member draft opens with PAN prefilled; no duplicate drafts |
| **P3 — CA-assist branding + telemetry** | `CaAssistStrip` (3 variants) across hub/owner/wizard; documents-step copy; telemetry events; read-only submitted mode | `CaAssistStrip.tsx`, `FilingProgressHeader.tsx`, step renderers | Requirement 3 branding visible on every screen of the funnel |
| **P4 — Hardening** | E2E suite, server tests, docs update (`MOBILE_ITR_FILING_PLAN.md` status note, `DatabaseManagement.md` index), `profileId` on uploads, copy/QA pass | tests, docs | Playwright funnel green on mobile viewport |

Sequencing rationale: P0 unblocks everything without UX change; P1 and P2 are independently shippable after P0; P3 is cosmetic-only; P4 locks it in. Each phase keeps `main` releasable.

---

## 11. Open decisions (defaults chosen, flag if you disagree)

1. **Hub always lands first** — even with exactly one open draft (one extra tap vs today's auto-resume). *Default: yes, per requirement 1; "Continue" card is the first thing under the top section.*
2. **Multiple drafts per person per AY** — *Default: disallowed (resume instead); a "Start over" affordance can archive-and-recreate later.*
3. **DOB on member cards** — *Default: no (PII minimalism); name + relation + masked PAN only.*
4. **Self profile auto-creation** — when a user files for self and has no `relation: "self"` profile, should submit-time create one for future reuse? *Default: defer to a later phase; user-record prefill suffices.*
5. **CA assignment surfacing** — show assigned CA's name pre-submission? *Default: yes when present (`assignedCaName`), generic copy otherwise.*
