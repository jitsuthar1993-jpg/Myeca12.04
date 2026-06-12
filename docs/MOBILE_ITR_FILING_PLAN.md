# Mobile ITR Filing Plan — "Thumb-First Filing"

> **Status (2026-06-11):** the pane architecture, smart inputs, document capture, and navigation described here are implemented (commits `3482c83`, `b5b080b` — `PaneRenderer`, `panes.ts`, `CurrencyInput`, `selectedTypes`, pane deep-links are live in `client/src/features/itr/`). **Next stage:** deep income capture per type (salary employers, presumptive business, house property, capital gains, other sources) — see `docs/ITR_INCOME_MODULES_CODEX_PLAN.md`.

> Goal: make `/itr/filing` the fastest way to self-prep an ITR on a phone, using the **existing design system unchanged** (slate + blue, Plus Jakarta Sans, `MyeCard`/`StatusBadge`/`type-*` tokens), with a **minimalistic one-decision-per-screen** rhythm optimized for the mobile filer.
>
> Scope: AY 2026-27 guided filing flow (`client/src/features/itr/`), shared rules engine (`shared/itr-filing.ts`), workspace shell (`client/src/components/admin/Layout.tsx`, `client/src/components/mobile/index.tsx`). No backend schema changes required for Phases 0–2.

---

## 1. Product principles

1. **One decision per viewport.** A mobile filer should never see more than one question group per screen. Today the Income step stacks ~31 controls in a single scroll.
2. **Same design, fewer pixels.** Reuse existing tokens and components (`MyeCard`, `StatusBadge`, `ChoiceButton`, `ToggleRow`, blue-600 CTA, emerald success, amber warning). Nothing visually new — only re-sequenced and condensed for ≤ 420 px viewports.
3. **Show money early and always.** Refund/payable is the motivation loop. Keep a live liability chip visible from the Income step onward.
4. **Never lose a keystroke.** Autosave already exists (700 ms debounce PATCH). Add flush-on-background and a local mirror so a phone-call interruption costs nothing.
5. **Trust signals over decoration.** Masked Aadhaar/account previews, "Saved" state, CA-review framing — these already exist; surface them in the mobile chrome instead of burying them in the header card.
6. **The thumb owns the bottom 25%.** All primary actions live in the existing fixed action bar; nothing tappable hides under the keyboard.

---

## 2. Current state audit (what exists, what hurts on a phone)

### What exists (reuse, don't rebuild)

| Asset | Location | Notes |
|---|---|---|
| 7-step guided flow (Owner → Identity → Income → Documents → Verify → Compute → Review) | `client/src/features/itr/pages/filing.page.tsx` | Single ~1,100-line component, all steps inline |
| Rules engine (form recommendation, liability, verification, checklist, review packet) | `shared/itr-filing.ts` | Pure functions, fully reusable on mobile |
| Guided UI primitives (`GuidedStepNav`, `ChoiceButton`, `TextInput`, `NumberInput`, `ToggleRow`, `FilingSummaryStrip`, `IssueList`) | `client/src/features/itr/components/filing/guided-filing-ui.tsx` | Touch-sized (h-11 inputs) but not keyboard-optimized |
| Public pre-filing selector with handoff | `client/src/features/itr/pages/start.page.tsx` + `lib/start-selector.ts` | Already mobile-friendly question-per-card pattern — the model to copy |
| Workspace shell with mobile bottom nav (6 items, "MY ITR" tab) | `client/src/components/admin/Layout.tsx` + `client/src/components/mobile/index.tsx` | `MobileBottomNav`, `MobileMoreSheet`, safe-area handling done |
| Autosave w/ debounce, save-state pill, retry | `filing.page.tsx` (`pendingSave` effect) | No flush on `pagehide`, no offline mirror |
| Fixed mobile action bar above bottom nav | `filing.page.tsx` (`bottom-[calc(5.75rem+env(safe-area-inset-bottom))]`) | Contract documented in `ITR_FILING_LAYOUT` and asserted by `filing.test.ts` |
| Document helpers (Form 16 parser, AIS viewer, CG import, vault) | `client/src/pages/form16-parser.page.tsx` etc. | Linked from Documents step as plain buttons |
| Telemetry route masking for `/itr/filing` | `client/src/telemetry/privacy.ts` | Safe to add funnel events |
| PWA service worker, `/itr/filing` on `navigateFallbackDenylist` | `vite.config.ts` | Authed page intentionally network-only — offline strategy must be data-level, not SW-level |

### Mobile pain points (ranked by filer impact)

1. **Income step overload.** All 15 `NumberInput`s render regardless of which income toggles are selected, plus 6 choice cards plus 10 toggle rows — one ~4,000 px scroll on a 390 px phone.
2. **Identity step overload.** 7 personal fields + 6 bank fields in one scroll; account number confirm is far from its sibling.
3. **Generic keyboards.** Every amount uses `type="number"` without `inputMode`; PAN/IFSC don't auto-cap on mobile keyboards; no `autoComplete`/`enterKeyHint` anywhere — every field costs extra taps.
4. **No live money feedback.** `FilingSummaryStrip` sits at the card bottom; on mobile the filer never sees refund/payable while typing income.
5. **Heavy page header.** The "Self-prep with CA review" `MyeCard` (~200 px) + handoff banner + step nav push the first input below the fold.
6. **Step nav is desktop-shaped.** 7 × 164 px horizontally scrolling pills; on mobile it's a swipe-hunt. A dots/progress pattern fits better.
7. **No per-step gating.** "Continue" is always enabled; errors surface only at Verify, forcing back-tracking — expensive on mobile.
8. **Documents step friction.** Select-from-vault dropdowns + free-text reference per item; no camera capture; helper tools are four equal buttons with no hierarchy.
9. **Interruption fragility.** Debounced save can lose the last keystrokes if the OS kills the tab/app (calls, app switching) before the 700 ms PATCH fires.
10. **Compute step layout.** Two regime panels stack to ~1,200 px; comparison (the decision) requires scrolling between them.

---

## 3. Target mobile UX architecture

### 3.1 Route & layout strategy

- **One route, responsive behavior.** Keep `/itr/filing` as the single implementation. Mobile (< 768 px) gets *micro-step sequencing*; desktop keeps the current multi-column step pages. No `/m/` fork, no duplicated state.
- Keep `ITR_FILING_LAYOUT` contract (`usesAuthenticatedWorkspaceShell: true`, `mobileActionBarOffset: "above-user-bottom-nav"`) — the shell, bottom nav, and action bar offsets are already correct and tested.
- The 7 macro steps stay the canonical model (deep links, resume, telemetry). Each macro step is subdivided into **panes** — at most one question group per pane — and mobile shows one pane at a time while desktop shows all panes of a step at once. The pane list is data, not JSX, so both layouts render from the same definition.

### 3.2 Pane map (macro step → mobile panes)

| Macro step | Mobile panes (1 viewport each) | Gate to continue |
|---|---|---|
| 1. Owner | a) Self vs. other (2 `ChoiceButton`s) · b) *only if other:* person picker + label | none (default self) |
| 2. Identity | a) Name + DOB · b) PAN + Aadhaar · c) Contact (mobile, email) · d) Refund bank (holder, bank, IFSC) · e) Account number + confirm + type | per-pane format checks from `validateItrIdentity` (PAN regex, Aadhaar length, IFSC format, account match) |
| 3. Income | a) Income-type picker (6 `ChoiceButton`s, multi-select) · b–g) **one pane per selected type** with only its amount fields · h) Regime preference + *collapsed* "Special situations" (risk flags behind a disclosure, count badge) | amounts ≥ 0; at least one income type or explicit "no income" confirm |
| 4. Documents | a) Checklist overview (required count, done count) · b) one card per required doc: attach via **camera/file capture**, vault picker, or "I'll provide later" · helpers (Form 16 parser, AIS) as inline links on the relevant doc card, not a button wall | required docs attached *or* explicitly deferred |
| 5. Verify | single pane: `IssueList` + check lines, each issue links back to its source pane | no critical issues |
| 6. Compute | a) Regime comparison: segmented control (New ⇄ Old) over one `RegimePanel` + delta line ("Old regime saves ₹X") · b) liability metrics 2×2 grid | computation status `computed` |
| 7. Review | single pane: packet summary lines + masked identity recap + Submit CTA | submit enabled when verify passed |

Net effect: a salaried filer with Form 16 sees **~9 panes** (Owner→a, Identity a–e, Income a+salary pane, flags collapsed) instead of scrolling ~60 controls.

### 3.3 Mobile screen anatomy (every pane, same skeleton)

```
┌─────────────────────────────┐
│ ◌◌●◌◌◌◌  Income · 3 of 7    │ ← compact sticky header (40px):
│ ─────────━━━━──────────     │   step dots + label + thin progress bar
├─────────────────────────────┤
│  Salary income              │ ← pane title (type-card-title)
│  Enter totals from Form 16  │ ← one-line helper (type-support)
│                             │
│  Gross salary               │
│  ┌───────────────────────┐  │ ← CurrencyInput: ₹ prefix,
│  │ ₹  9,00,000           │  │   en-IN grouping, numeric pad
│  └───────────────────────┘  │
│  Pension                    │
│  ┌───────────────────────┐  │
│  │ ₹  0                  │  │
│  └───────────────────────┘  │
│                             │
│  ⓘ Tip: use the Form 16     │ ← optional inline helper link
│    parser to read these     │
├─────────────────────────────┤
│ Refund so far  ₹12,400  ▲   │ ← live liability chip (tap = summary sheet)
│ ┌────┐  ┌────────────────┐  │
│ │ ←  │  │   Continue  →  │  │ ← existing fixed action bar, refined
│ └────┘  └────────────────┘  │
├─────────────────────────────┤
│  Home  MY ITR  Services …   │ ← existing MobileBottomNav (unchanged)
└─────────────────────────────┘
```

Chrome rules:

- **Sticky progress header** replaces the 200 px hero `MyeCard` on mobile (hero remains on ≥ md). Shows: step dots, "Income · 3 of 7", save state as a tiny icon (cloud-check / spinner / alert), and the form recommendation badge collapsed to e.g. "ITR-1".
- **Action bar** (existing fixed bar): Back (icon), Continue (primary, full-flex). "Save draft" button is removed on mobile — autosave + visible save state make it redundant (keep on desktop).
- **Liability chip** sits on top of the action bar from Income onward: `Refund ₹X` (emerald) / `Payable ₹X` (amber) / `—` before computable. Tapping opens a bottom sheet rendering `FilingSummaryStrip` content + regime line. Uses existing `Sheet` component (`side="bottom"`), same as `MobileMoreSheet`.
- **Keyboard-open behavior:** action bar hides while an input has focus (visualViewport listener) so the keyboard never covers Continue *and* the field; `scroll-margin-bottom` on inputs keeps the focused field above the keyboard. `enterKeyHint="next"` advances focus; on the last field of a pane, `enterKeyHint="done"` triggers Continue.

### 3.4 Navigation & validation behavior

- Continue advances pane-by-pane; Back likewise. Step dots jump only to *visited* macro steps (preserves current free-jump on desktop).
- **Soft gating:** invalid pane → Continue stays enabled but triggers inline field errors (gentle fade-in per §3.6 — never a shake); a filer can still jump forward via dots — Verify remains the hard gate, as today (`verificationReport`).
- Each `ItrVerificationIssue` gets a `paneId` so Verify issues deep-link to the exact pane (`onStepChange` + pane index), replacing today's "go find it yourself".
- Browser back button: push a history entry per macro step (not per pane) via wouter — back exits panes within a step first (in-memory), then steps. Prevents accidental exit-to-dashboard, a top mobile abandonment cause.

### 3.5 Same-design mapping (no new visual language)

| Need | Use (existing) | Forbidden |
|---|---|---|
| Pane container | `MyeCard` p-4 (mobile) / p-5 (desktop) | new card styles |
| Titles/eyebrows | `type-card-title`, `type-meta` uppercase blue-700 | new font sizes |
| Primary CTA | `bg-blue-600 hover:bg-blue-700` Button h-11+ | gradients, new colors |
| Selection | `ChoiceButton` (already 88 px min, aria-pressed) | custom radios |
| Status | `StatusBadge` semantic tones | new badge variants |
| Money | `formatInr` everywhere | raw numbers |
| Sheets | `Sheet side="bottom"` rounded-t-2xl pattern from `MobileMoreSheet` | new modal styles |
| Success/warn/error | emerald-/amber-/red- 50/200/700 triads as in `IssueList` | — |

### 3.6 Motion design (subtle, state-communicating)

Motion is allowed — but only motion that **communicates state** (direction of travel, progress, save status, validity, money changing). Decoration-only animation stays out.

**Principles**

1. **Subtle by spec:** 150–300 ms, ease-out, distances ≤ 16 px, `transform`/`opacity` only (GPU-composited; protects the INP ≤ 200 ms budget). No bounces, no springs with overshoot, no parallax, no looping/idle animation.
2. **Zero new cost:** framer-motion is already loaded app-wide via `LazyMotion` + `domAnimation` (`client/src/App.tsx`) — use `m.div` features within that subset; CSS transitions for everything simpler. No new dependencies.
3. **Reduced motion is automatic + explicit:** the global `prefers-reduced-motion` kill switch in `client/src/styles/design-tokens.css:128` already zeroes CSS animation/transition durations. JS-driven animations (framer-motion tweens, count-up) must additionally check `useReducedMotion()` and render the final state instantly.
4. **Never animate against the typist:** nothing moves while an input has focus and the user is typing. Value-driven animations (liability count-up) wait for ~500 ms of input idle (piggyback the existing 700 ms autosave debounce signal).
5. **User-liking is verified, not assumed:** motion ships with the same `?mobileV2=1` flag; the rollout week explicitly collects feedback on feel, and any animation that tests poorly is demoted to a plain state swap (each entry below degrades to instant without layout change).

**Motion spec**

| Element | Trigger | Animation | Duration / easing |
|---|---|---|---|
| Pane change (forward) | Continue | incoming pane: opacity 0→1 + translateX 16px→0; outgoing: simple fade | 200 ms ease-out |
| Pane change (back) | Back / browser back | mirrored (from −16 px) — direction tells the filer where they went | 200 ms ease-out |
| Progress bar (header) | pane/step advance | width transition | 300 ms ease-in-out |
| Step dot completes | macro step done | dot fills emerald + scale 1→1.15→1 once | 250 ms ease-out |
| Liability chip amount | computed value changes (input idle) | count-up tween old→new + one background tint pulse (emerald/amber 50) | 400 ms ease-out |
| Validity tick (PAN/IFSC/account match) | format check passes | check icon opacity 0→1 + scale 0.8→1 | 150 ms ease-out |
| Inline field error | Continue on invalid pane | error line opacity 0→1 + translateY −4px→0; field border tints red | 150 ms ease-out — **no shake** |
| Save state icon | saving ⇄ saved ⇄ error | crossfade between spinner / cloud-check / alert | 150 ms linear |
| Liability sheet, More sheet | open/close | existing `Sheet` slide-up (Radix) — keep as-is | as-is |
| `CollapsibleFlags` accordion | expand/collapse | `grid-template-rows 0fr→1fr` + chevron rotate 180° | 200 ms ease-out |
| Primary button press | touch | `active:scale-[0.98]` (existing house pattern in `BottomNav`) + optional light haptic via existing `mobile-touch-feedback.ts` | instant |
| Submit success (Review) | review submitted | one-time: check draws in + status card fades up 8 px | 400 ms ease-out, plays once |

**Implementation notes**

- Pane transition lives in one place — `PaneRenderer` — so the spec is enforced by construction, not by convention. Focus moves to the incoming pane's heading at animation *start* (not end) so keyboard/screen-reader users never wait on motion.
- Count-up uses a single rAF tween on the rendered string (no per-frame React re-render of the page).
- Haptics: only on pane completion and submit success, via the existing `MobileTouchFeedback` utility (`light` intensity), and only where `navigator.vibrate` exists — silent no-op elsewhere. Off when reduced motion is on.

---

## 4. Component plan

### New components — `client/src/features/itr/components/filing/`

| Component | Purpose | Key props / behavior |
|---|---|---|
| `FilingProgressHeader` | Sticky mobile header: dots, step label, save state, form badge | `steps`, `currentStep`, `currentPane`, `saveState`, `recommendation`; hidden ≥ md |
| `PaneRenderer` + `panes.ts` | Data-driven pane definitions per macro step; mobile = one pane, desktop = all panes stacked; owns the §3.6 pane enter/exit transition + focus handoff | `getPanesForStep(draft) => Pane[]` — pure, unit-testable; income panes derived from selected toggles |
| `LiabilityChip` + `LiabilitySheet` | Live refund/payable chip; bottom-sheet detail (reuses `FilingSummaryStrip` internals) | `liability: ItrTaxLiabilitySummary`; emerald/amber tone |
| `CurrencyInput` | ₹-prefixed amount field: `inputMode="numeric"`, en-IN digit grouping as-you-type, strips to integer on change, no spinners | replaces `NumberInput` for amounts (keep `NumberInput` for counts like house properties) |
| `PanInput` | Auto-uppercase, `maxLength 10`, char-class enforcement (AAAAA9999A), `autoCapitalize="characters"`, live valid tick from `validateItrIdentity` | one purpose: zero-retry PAN entry |
| `AadhaarInput` | `inputMode="numeric"`, 4-4-4 visual grouping, masked by default with existing eye toggle, `maxLength 14` (with spaces) | stores digits only |
| `IfscInput` | Auto-uppercase, `maxLength 11`, format hint | — |
| `RegimeComparator` | Segmented control New/Old above a single `RegimePanel`, plus delta sentence; side-by-side ≥ lg (current layout) | wraps existing `RegimePanel` |
| `DocumentCaptureCard` | Per-checklist-item card: `<input type="file" accept="image/*,application/pdf" capture="environment">` → uploads to vault → auto-links; fallback to vault picker + manual ref (current behavior); "Provide later" defer toggle | uses existing `/api/documents` upload + `linkDocumentMutation` |
| `CollapsibleFlags` | "Special situations" disclosure wrapping the 9 `RISK_FLAGS` `ToggleRow`s, with active-count badge | collapsed by default on mobile |

### Modified components

| File | Change |
|---|---|
| `guided-filing-ui.tsx` → `GuidedStepNav` | `< md`: render dots + label variant (consumed by `FilingProgressHeader`); `≥ md`: unchanged pills |
| `guided-filing-ui.tsx` → `TextInput` | pass-through `inputMode`, `autoComplete`, `enterKeyHint`, `maxLength`, `error?: string` (inline error line, red-700 text-xs) |
| `filing.page.tsx` | split: extract per-step JSX into `components/filing/steps/*.tsx` (one file per macro step, rendering from pane defs); page keeps state/queries/mutations only (~350 lines). Add `paneIndex` state, visualViewport hook, history integration, autosave flush |
| `shared/itr-filing.ts` | add optional `paneId` to `ItrVerificationIssue`; add `validateItrPane(draft, paneId)` thin helpers reusing existing validators (no rule changes) |

### Explicit non-goals (minimalism guardrails)

- Motion only per the §3.6 spec — state-communicating, 150–300 ms, transform/opacity, reduced-motion honored. No decorative/looping animation, no spring overshoot, no parallax.
- No new dependencies (no form libs, no carousel libs, no animation libs — framer-motion `LazyMotion` is already loaded; segmented control and sheets exist).
- No dark mode, no theming work.
- No native Capacitor plugins in this plan (camera via web `capture` attribute works in WebView); native camera/biometrics are a follow-up.

---

## 5. Field-level input optimization spec

| Field | type / inputMode | autoComplete | Other |
|---|---|---|---|
| First/Last name | text | `given-name` / `family-name` | `autoCapitalize="words"`, `enterKeyHint="next"` |
| DOB | date | `bday` | `max` = today |
| PAN | text / `latin` | off | auto-upper, maxLength 10, pattern feedback tick |
| Aadhaar | text / `numeric` | off | masked, 4-4-4 grouping, paste-strips-spaces |
| Mobile | tel / `tel` | `tel-national` | maxLength 10 |
| Email | email / `email` | `email` | — |
| IFSC | text | off | auto-upper, maxLength 11 |
| Account / confirm | password-toggle / `numeric` | off | paste allowed; match check on confirm blur |
| All amounts (salary, 80C, TDS…) | text / `numeric` | off | `CurrencyInput`: en-IN grouping, ₹ prefix, empty = 0 |
| House property count | text / `numeric` | off | integer clamp ≥ 0 (existing logic) |

Global: every input `h-11`+ (44 px), `scroll-margin-bottom: 96px`, labels always visible (no placeholder-as-label), error text never replaces helper text (stacked, `aria-describedby` both).

---

## 6. Performance & resilience

### Budgets (mobile, mid-range Android, Lighthouse mobile preset)

| Metric | Target |
|---|---|
| `/itr/filing` route chunk (gz) | ≤ 90 KB (measure baseline first via `ANALYZE_BUNDLE=1`) |
| LCP (warm shell, post-auth) | ≤ 2.5 s |
| INP | ≤ 200 ms (watch `CurrencyInput` formatting — format on rAF, not per keystroke re-render of whole page) |
| CLS | ≤ 0.05 (reserve header/action-bar heights; skeletons for queries) |

Tactics:

- **State locality:** pane components own field focus state; page-level `draft` updates stay as-is (already immutable patches). Memoize step components on `(draft slice, paneIndex)` so typing in one field doesn't re-render all panes — biggest INP win after splitting `filing.page.tsx`.
- **Query gating:** `documentsQuery` currently fires as soon as a return exists — gate it on reaching the Documents step (`enabled: Boolean(activeReturn) && currentStep >= 3`).
- **Defer below-the-fold:** `LiabilitySheet`, `RegimeComparator`, and Documents step content behind `React.lazy` within the route (they're not needed for first paint of pane 1).

### Interruption-proof drafts (mobile reality: calls, app switches, OS kills)

1. Keep 700 ms debounced PATCH (server remains source of truth).
2. **Flush on `visibilitychange`/`pagehide`:** if `pendingSave`, fire `navigator.sendBeacon`-compatible save (or `fetch` with `keepalive: true`) immediately.
3. **Local mirror:** persist `{returnId, draft, updatedAt}` to `localStorage` on every debounce tick (same pattern as `compact-filing-guide.page.tsx` already uses). On load, if mirror is newer than server `updatedAt`, offer one-tap "Restore unsaved changes" banner (existing handoff-banner visual pattern).
4. **Offline:** `/itr/filing` stays on the SW denylist (correct for an authed page). In-page: listen to `online/offline`; offline → save-state shows "Offline — changes kept on this phone", autosave pauses, mirror keeps recording; reconnect → flush. No service-worker changes.

---

## 7. Trust, privacy, accessibility

- Sensitive masking (Aadhaar, account) and eye toggles: keep; ensure masked previews (not raw values) are what's visible by default after pane re-entry.
- `/itr/filing` is already in `MASKED_TELEMETRY_ROUTES` (`client/src/telemetry/privacy.ts`) — all new funnel events must carry **only** step/pane ids, counts, and booleans; never amounts or identity fields.
- A11y: `aria-current="step"` on dots; panes announce via `aria-live="polite"` heading focus on pane change; 44 px min targets (already house style); contrast unchanged (existing palette passes); full flow operable with keyboard + TalkBack/VoiceOver pass in QA.
- Reduced motion: CSS side is already global (`design-tokens.css` media query); every JS-driven animation (pane tween, count-up, haptics) checks `useReducedMotion()` and degrades to instant state swap — verified in the QA matrix with the OS toggle on.
- Content tone: keep existing professional copy style; pane helpers ≤ 1 line; no exclamation marks.

---

## 8. Telemetry & success metrics

New events (via existing `captureTelemetryEvent`):

- `itr_filing_pane_viewed` `{step, pane, viewport: "mobile"|"desktop"}`
- `itr_filing_pane_completed` `{step, pane, msOnPane}`
- `itr_filing_validation_blocked` `{step, pane, rule}`
- `itr_filing_draft_restored` `{source: "mirror"|"server"}`
- `itr_filing_review_submitted` `{stepsVisited, totalMs, viewport}`

Success criteria (compare 4 weeks pre/post on mobile sessions):

| Metric | Baseline | Target |
|---|---|---|
| Income-step completion rate (mobile) | measure | +25 % relative |
| Median time Owner → Review submit (mobile) | measure | −40 % |
| Drafts abandoned at Identity (mobile) | measure | −30 % |
| Save-failure data loss reports | n/a | 0 |
| Lighthouse mobile perf score on route | measure | ≥ 85 |

---

## 9. Phased roadmap

### Phase 0 — Quick wins + instrumentation (1–2 days, ship immediately)
1. Add `inputMode`/`autoComplete`/`enterKeyHint`/auto-uppercase to existing inputs (extend `TextInput`, touch `filing.page.tsx` call sites).
2. Income step: render amount fields **only for selected income types** (pure conditional, desktop benefits too).
3. Collapse risk flags behind `CollapsibleFlags`.
4. Gate `documentsQuery` to the Documents step.
5. Add pane-less versions of the telemetry events (step-level) to capture the baseline funnel.

### Phase 1 — Pane architecture (3–4 days)
1. Extract step JSX from `filing.page.tsx` into `steps/*.tsx`; introduce `panes.ts` definitions + `PaneRenderer`.
2. `FilingProgressHeader` (mobile) + `GuidedStepNav` dots variant; hide hero card on `< md`.
3. Action bar refinement: remove mobile Save button, Back-icon + flex Continue, keyboard-aware hide, history integration.
4. Pane enter/exit transitions + progress-bar/dot motion per §3.6 (built into `PaneRenderer`/header from day one, including `useReducedMotion` fallback).
5. Unit tests for `getPanesForStep` (income-type permutations) and pane gating.

### Phase 2 — Smart inputs + live money (2–3 days)
1. `CurrencyInput`, `PanInput`, `AadhaarInput`, `IfscInput` + swap into Identity/Income panes.
2. `LiabilityChip` + `LiabilitySheet` (bottom sheet); count-up + tint pulse on idle value change (§3.6).
3. Inline per-pane validation surfacing `validateItrIdentity` results; `paneId` on verification issues + deep links from Verify.
4. Micro-feedback: validity ticks, inline-error fade, save-state crossfade, light haptic on pane completion.

### Phase 3 — Documents capture + resilience (3–4 days)
1. `DocumentCaptureCard` with camera/file capture → vault upload → auto-link; "provide later" defer state.
2. Helper tools as contextual links on relevant doc cards.
3. Autosave flush on `pagehide`, localStorage mirror + restore banner, offline save-state.

### Phase 4 — Compute/Review polish + rollout (2–3 days)
1. `RegimeComparator` segmented control + delta sentence.
2. Review pane condensation (masked recap + submit); one-time submit-success moment (§3.6) + success haptic.
3. Motion QA: reduced-motion sweep, mid-range-Android jank check (DevTools 4× CPU throttle — pane transition must hold 60 fps), feel-feedback from the internal week; demote any animation that tests poorly to instant state swap.
4. QA matrix + Lighthouse + a11y pass; fix; ship behind `?mobileV2=1` flag for 1 week of internal use, then default-on (flag kept for one release as kill switch).

Total: ~11–16 dev-days, each phase independently shippable.

---

## 10. Test plan

| Layer | Coverage |
|---|---|
| Vitest (new) | `panes.ts` permutations; `CurrencyInput` formatting/parsing (en-IN, paste, empty→0); `PanInput`/`AadhaarInput` normalization; mirror restore logic (newer/older/equal timestamps) |
| Vitest (existing) | keep `filing.test.ts` layout-contract assertions green (`ITR_FILING_LAYOUT`, steps export); extend with pane count per step |
| Playwright | new mobile project (Pixel 7 viewport, touch): full salaried-filer happy path Owner→Submit; keyboard-overlap check (focused input visible); back-button stays in flow; offline mid-income then reconnect → draft intact |
| Manual matrix | Android Chrome, iOS Safari (visualViewport quirks), installed PWA standalone, Capacitor WebView (`mye-ca-android`); small viewport 360×640; TalkBack + VoiceOver smoke; OS reduced-motion ON pass (all panes swap instantly, no count-up, no haptics) |
| Perf | `ANALYZE_BUNDLE=1` before/after; Lighthouse mobile CI snapshot on `/itr/filing` (authed via test login) |

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Splitting the 1,100-line `filing.page.tsx` regresses autosave/handoff edge cases | Phase 1 is a pure extraction (no behavior change) with the existing tests green before pane logic lands |
| Pane gating frustrates power users | soft gates only; dots allow jumping to visited steps; Verify stays the single hard gate (today's behavior) |
| visualViewport behavior differs iOS vs Android | feature-detect; fallback = action bar stays visible (today's behavior); Playwright + manual matrix covers both |
| Camera capture in Capacitor WebView quirks | `capture` attribute degrades to file picker automatically; native plugin deferred |
| en-IN formatting fights IME/paste | format on blur + light grouping on input via rAF; raw digits stored; unit-tested paste cases |
| Animations feel laggy on low-end Androids or annoy users | transform/opacity-only spec + 4× CPU-throttle jank gate in Phase 4; every animation degrades to an instant state swap (flagged rollout collects feel feedback; demotion is a one-line change per entry) |
| Funnel claims unverifiable | Phase 0 ships baseline telemetry *before* any UX change |

---

## 12. File-by-file change map (quick reference)

```
client/src/features/itr/
  pages/filing.page.tsx              M  slim to state+queries+shell; pane index, history, flush
  components/filing/
    guided-filing-ui.tsx             M  TextInput props; GuidedStepNav dots variant
    panes.ts                         A  pane definitions + getPanesForStep + gates
    PaneRenderer.tsx                 A
    FilingProgressHeader.tsx         A
    LiabilityChip.tsx                A  (+ sheet)
    CurrencyInput.tsx                A
    identity-inputs.tsx              A  PanInput, AadhaarInput, IfscInput
    RegimeComparator.tsx             A
    DocumentCaptureCard.tsx          A
    CollapsibleFlags.tsx             A
    steps/owner.tsx … review.tsx     A  extracted step renderers (7 files)
shared/itr-filing.ts                 M  paneId on issues; validateItrPane helpers
client/src/features/itr/pages/filing.test.ts        M  extend contracts
tests/ (playwright)                  A  mobile filing flow spec
docs/MOBILE_ITR_FILING_PLAN.md       A  this plan
```
