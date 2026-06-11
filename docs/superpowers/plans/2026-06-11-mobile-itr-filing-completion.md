# Mobile ITR Filing Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish and harden the thumb-first `/itr/filing` experience so mobile users get reliable pane validation, keyboard-friendly navigation, durable document deferrals, privacy-safe resilience, and measurable performance without changing the existing desktop flow or `MobileBottomNav`.

**Architecture:** Keep one authenticated `/itr/filing` route and the existing seven macro steps. Preserve the already-landed responsive pane definitions and mobile primitives, then extract the 1,484-line page into focused orchestration hooks and per-step renderers before adding the remaining behavior. The server remains the source of truth; authenticated tax drafts must not be mirrored into `localStorage` or `sessionStorage`.

**Tech Stack:** React 18, TypeScript, Wouter, TanStack Query, Zod, Express, Vitest, Testing Library, Playwright, Vite, existing MyeCA UI primitives.

---

## 1. Current Baseline

The attached product plan is partly implemented already in local commit `3482c83` (`feat: add thumb-first mobile ITR filing flow`).

Already present:

- Data-driven pane definitions in `client/src/features/itr/components/filing/panes.ts`.
- One-pane-at-a-time mobile rendering and all-panes desktop rendering.
- Mobile `FilingProgressHeader`, visited step dots, liability chip/sheet, smart identity inputs, `CurrencyInput`, `CollapsibleFlags`, `RegimeComparator`, and `DocumentCaptureCard`.
- Query gating for documents, `visualViewport` keyboard detection, keepalive save on `pagehide`, offline pending-save handling, issue-to-pane navigation, and a mobile Playwright happy path.
- Server-side encryption at rest for PAN, Aadhaar, and bank account fields.
- An explicit regression test that authenticated filing edits are not copied into browser storage.

Verified before writing this plan:

- `npm.cmd exec -- vitest run client/src/features/itr/pages/filing.test.ts client/src/features/itr/components/filing/panes.test.ts client/src/features/itr/components/filing/smart-inputs.test.tsx client/src/features/itr/components/filing/filing-primitives.test.tsx client/src/features/itr/components/filing/guided-filing-ui.test.tsx client/src/lib/itr-filing.test.ts client/src/lib/tax-return-routes.test.ts`
- Result: `7` files passed, `66` tests passed.
- `npm.cmd run check`
- Result: TypeScript passed.

Remaining target gaps:

- `filing.page.tsx` is still 1,484 lines and owns rendering, autosave, history, upload orchestration, validation, and telemetry.
- `validateItrPane(...)` exists but Continue does not use it; inline field errors are not wired.
- Mobile inputs do not consistently use `enterKeyHint`, next-field focus, or done-to-Continue behavior.
- The mobile action bar still displays `Save draft`.
- Browser history currently pushes an entry for every pane, not one entry per macro step with in-memory pane backtracking.
- "Provide later" advances without persisting a deferral decision.
- Document helper tools remain a button wall instead of contextual links.
- Telemetry uses step events carrying pane IDs rather than the requested typed pane funnel.
- Accessibility does not yet focus or announce the new pane heading.

## 2. Locked Decisions

1. **Keep the existing route and shell.** Do not create `/m/itr/filing`, change `MobileBottomNav`, or alter workspace route ownership.
2. **Preserve desktop behavior.** Desktop keeps free macro-step navigation and stacked panes.
3. **Use soft gating.** Continue remains enabled. Critical issues in the active pane display inline errors and keep the user on that pane. Warnings do not block. A visited macro-step dot may still bypass a blocked pane.
4. **Do not store authenticated drafts in browser storage.** Full drafts contain PAN, Aadhaar, bank account, income, and document references. Preserve the existing no-browser-mirror test. Offline copy must truthfully say that changes remain in memory and require the page to stay open.
5. **Keep keepalive fetch, not `sendBeacon`.** The authenticated save requires authorization headers, which `sendBeacon` cannot set.
6. **Persist document deferrals inside the existing server-side draft JSON.** Add a small `documentDeferrals` record to the existing draft schema; no database migration is required. Existing sensitive taxpayer fields remain encrypted at rest.
7. **Do not force lazy loading without evidence.** Measure a fresh build first. Only split more code if the filing route chunk exceeds the 90 KB gzip budget or measured interaction performance misses target.
8. **No new dependencies.** Reuse existing UI, test, telemetry, and build tooling.

## 3. File Structure

### New files

- `client/src/features/itr/hooks/use-filing-autosave.ts`
  - Owns revisions, debounce, keepalive flush, online/offline state, and retry.
- `client/src/features/itr/hooks/use-filing-autosave.test.tsx`
  - Isolated autosave race, pagehide, failure, and reconnect tests.
- `client/src/features/itr/hooks/use-filing-navigation.ts`
  - Owns macro-step history, pane movement, visited steps, and issue deep links.
- `client/src/features/itr/hooks/use-filing-navigation.test.tsx`
  - Tests one-history-entry-per-step and in-memory pane backtracking.
- `client/src/features/itr/hooks/use-mobile-keyboard.ts`
  - Owns feature-detected `visualViewport` keyboard state.
- `client/src/features/itr/components/filing/PaneRenderer.tsx`
  - Renders one active pane on mobile, all panes on desktop, and announces/focuses pane changes.
- `client/src/features/itr/components/filing/PaneRenderer.test.tsx`
  - Tests responsive rendering, heading focus, and `aria-live`.
- `client/src/features/itr/components/filing/steps/step-types.ts`
  - Shared narrow prop types for step renderers.
- `client/src/features/itr/components/filing/steps/OwnerStep.tsx`
- `client/src/features/itr/components/filing/steps/IdentityStep.tsx`
- `client/src/features/itr/components/filing/steps/IncomeStep.tsx`
- `client/src/features/itr/components/filing/steps/DocumentsStep.tsx`
- `client/src/features/itr/components/filing/steps/VerifyStep.tsx`
- `client/src/features/itr/components/filing/steps/ComputeStep.tsx`
- `client/src/features/itr/components/filing/steps/ReviewStep.tsx`
  - Each owns only the JSX and field wiring for one macro step.
- `client/src/features/itr/lib/filing-telemetry.ts`
  - Typed, privacy-safe wrapper for the ITR filing funnel.
- `client/src/features/itr/lib/filing-telemetry.test.ts`
  - Ensures event properties cannot include identity or money fields.

### Modified files

- `client/src/features/itr/pages/filing.page.tsx`
  - Reduced to queries, mutations, derived filing state, and shell composition.
- `client/src/features/itr/pages/filing.test.ts`
  - Adds end-to-end component contracts for validation, action bar, deferral, history, and offline copy.
- `client/src/features/itr/components/filing/guided-filing-ui.tsx`
  - Adds stable filing-field markers and field-error plumbing.
- `client/src/features/itr/components/filing/guided-filing-ui.test.tsx`
- `client/src/features/itr/components/filing/CurrencyInput.tsx`
- `client/src/features/itr/components/filing/identity-inputs.tsx`
- `client/src/features/itr/components/filing/smart-inputs.test.tsx`
  - Adds keyboard hints, field markers, and legally valid negative-value behavior.
- `client/src/features/itr/components/filing/DocumentCaptureCard.tsx`
- `client/src/features/itr/components/filing/filing-primitives.test.tsx`
  - Adds durable deferred status and contextual helper links.
- `client/src/features/itr/components/filing/LiabilityChip.tsx`
  - Uses a neutral pending state before liability is computable.
- `client/src/features/itr/components/filing/panes.ts`
- `client/src/features/itr/components/filing/panes.test.ts`
  - Keeps pane IDs and validation mapping stable.
- `shared/itr-filing.ts`
  - Adds `fieldId`, `documentDeferrals`, pane validation details, and deferral-aware verification.
- `client/src/lib/itr-filing.test.ts`
  - Tests normalization, pane errors, explicit no-income confirmation, and document deferrals.
- `server/routes/tax-returns.ts`
  - Clears deferral state when a document is linked.
- `client/src/lib/tax-return-routes.test.ts`
  - Tests deferral persistence and link-clears-deferral behavior.
- `tests/e2e/itr-filing-mobile.spec.ts`
  - Extends the mobile journey with validation, keyboard, history, deferral, issue deep link, and reconnect checks.
- `scripts/check-size-budget.ts`
  - Adds a filing-route chunk gzip budget.

## 4. Task Plan

### Task 1: Reconfirm the Green Baseline and Save Boundary

**Files:**

- Inspect only: current worktree and existing filing tests

- [ ] **Step 1: Run the focused baseline**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/pages/filing.test.ts client/src/lib/itr-filing.test.ts client/src/features/itr/components/filing/filing-primitives.test.tsx
```

Expected: PASS before any implementation edit.

- [ ] **Step 2: Reconfirm TypeScript**

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 3: Record the focused save boundary**

```powershell
git status --short
git diff --stat
```

Do not modify, stage, or revert the existing unrelated dirty files. Each later task writes its own failing test immediately before its implementation and commits only after returning to green.

### Task 2: Extract Autosave and Keyboard State Without Changing Behavior

**Files:**

- Create: `client/src/features/itr/hooks/use-filing-autosave.ts`
- Create: `client/src/features/itr/hooks/use-filing-autosave.test.tsx`
- Create: `client/src/features/itr/hooks/use-mobile-keyboard.ts`
- Modify: `client/src/features/itr/pages/filing.page.tsx`

- [ ] **Step 1: Write isolated autosave tests**

Cover:

- A 700 ms debounce saves the latest revision.
- A second edit during an in-flight save queues one later save.
- `pagehide` and hidden `visibilitychange` use `keepalive: true`.
- Offline edits remain pending and flush on reconnect.
- A failed save stops retry looping until explicit retry or a new edit.
- No call to `localStorage.setItem` or `sessionStorage.setItem`.

- [ ] **Step 2: Run the hook test and verify RED**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/hooks/use-filing-autosave.test.tsx
```

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement the hook with a narrow API**

Use this public shape:

```ts
type FilingSaveState = "saved" | "saving" | "error" | "offline";

type UseFilingAutosaveResult = {
  pendingSave: boolean;
  saveState: FilingSaveState;
  saveError: unknown;
  lastSavedAt: Date | null;
  markChanged(nextDraft: ItrFilingDraft): void;
  persistLatestDraft(options?: { keepalive?: boolean }): Promise<boolean>;
  flushLatestDraft(): Promise<boolean>;
};
```

The hook receives `returnId`, `initialDraft`, and an async `saveDraft` callback. Keep mutable revisions in refs and expose only immutable public state.

- [ ] **Step 4: Extract keyboard detection**

`use-mobile-keyboard.ts` must:

- Feature-detect `window.visualViewport`.
- Listen to both `resize` and `scroll`.
- Return `false` when unsupported.
- Clean up listeners on unmount.

- [ ] **Step 5: Replace page-local save and keyboard effects**

Keep the existing API payload and save behavior unchanged. Preserve `flushLatestDraft()` before submit-review.

- [ ] **Step 6: Run focused and page tests**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/hooks/use-filing-autosave.test.tsx client/src/features/itr/pages/filing.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add client/src/features/itr/hooks client/src/features/itr/pages/filing.page.tsx client/src/features/itr/pages/filing.test.ts
git commit -m "refactor: isolate ITR autosave and keyboard state"
```

### Task 3: Extract Navigation, Pane Renderer, and Step Components

**Files:**

- Create: `client/src/features/itr/hooks/use-filing-navigation.ts`
- Create: `client/src/features/itr/hooks/use-filing-navigation.test.tsx`
- Create: `client/src/features/itr/components/filing/PaneRenderer.tsx`
- Create: `client/src/features/itr/components/filing/PaneRenderer.test.tsx`
- Create: `client/src/features/itr/components/filing/steps/step-types.ts`
- Create: `client/src/features/itr/components/filing/steps/OwnerStep.tsx`
- Create: `client/src/features/itr/components/filing/steps/IdentityStep.tsx`
- Create: `client/src/features/itr/components/filing/steps/IncomeStep.tsx`
- Create: `client/src/features/itr/components/filing/steps/DocumentsStep.tsx`
- Create: `client/src/features/itr/components/filing/steps/VerifyStep.tsx`
- Create: `client/src/features/itr/components/filing/steps/ComputeStep.tsx`
- Create: `client/src/features/itr/components/filing/steps/ReviewStep.tsx`
- Modify: `client/src/features/itr/pages/filing.page.tsx`

- [ ] **Step 1: Write navigation tests**

Required contracts:

```ts
it("pushes browser history only when the macro step changes");
it("moves to the previous pane in memory before leaving the step");
it("keeps future unvisited step dots disabled on mobile");
it("deep-links an issue to its exact pane");
```

- [ ] **Step 2: Write PaneRenderer tests**

Required contracts:

- Mobile renders exactly one active pane.
- Desktop renders every pane in the active macro step.
- Pane changes focus the pane heading with `tabIndex={-1}`.
- The heading is inside an `aria-live="polite"` region.

- [ ] **Step 3: Run new tests and verify RED**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/hooks/use-filing-navigation.test.tsx client/src/features/itr/components/filing/PaneRenderer.test.tsx
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement macro-step history behavior**

The navigation hook must expose:

```ts
type FilingNavigation = {
  currentStep: number;
  currentPane: number;
  visitedSteps: readonly number[];
  navigateToStep(step: number, pane?: number): void;
  navigateToNextPane(): void;
  navigateBack(): void;
  navigateToIssue(issue: ItrVerificationIssue): void;
};
```

Push a history entry only when `nextStep !== currentStep`. Replace the current macro-step marker when its pane changes. On browser back while `currentPane > 0`, use a guarded forward restoration to stay on the current macro-step history entry, decrement the pane in memory, and replace that entry with the new pane index. Allow the browser to move to the previous macro-step entry only when the current pane is already zero.

- [ ] **Step 5: Implement PaneRenderer**

Keep layout classes in the step component, but centralize responsive visibility and pane announcement:

```tsx
<PaneRenderer
  panes={currentPanes}
  activePaneId={activePane?.id}
  isMobile={isMobile}
  renderPane={(pane) => renderPaneById(pane.id)}
/>
```

- [ ] **Step 6: Move each macro step into its own file**

Pass narrow slices and callbacks. Do not pass the full page controller object into every step. Preserve page exports:

```ts
export { ITR_FILING_STEPS, ITR_FILING_LAYOUT, WORKSPACE_ITR_REVIEW_STATUSES };
```

Target: reduce `filing.page.tsx` below 650 lines without changing visible behavior.

- [ ] **Step 7: Run existing filing suites**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/pages/filing.test.ts client/src/features/itr/components/filing
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add client/src/features/itr/hooks/use-filing-navigation.ts client/src/features/itr/hooks/use-filing-navigation.test.tsx client/src/features/itr/components/filing/PaneRenderer.tsx client/src/features/itr/components/filing/PaneRenderer.test.tsx client/src/features/itr/components/filing/steps client/src/features/itr/pages/filing.page.tsx
git commit -m "refactor: split mobile ITR pane orchestration"
```

### Task 4: Wire Pane Validation and Inline Errors

**Files:**

- Modify: `shared/itr-filing.ts`
- Modify: `client/src/lib/itr-filing.test.ts`
- Modify: `client/src/features/itr/pages/filing.page.tsx`
- Modify: `client/src/features/itr/components/filing/steps/OwnerStep.tsx`
- Modify: `client/src/features/itr/components/filing/steps/IdentityStep.tsx`
- Modify: `client/src/features/itr/components/filing/steps/IncomeStep.tsx`
- Modify: `client/src/features/itr/components/filing/guided-filing-ui.tsx`

- [ ] **Step 1: Write failing pane-validation tests**

Add tests proving:

```ts
expect(validateItrPane(invalidDraft, "identity-pan-aadhaar")).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ id: "pan-format", fieldId: "pan" }),
    expect.objectContaining({ id: "aadhaar-format", fieldId: "aadhaar" }),
  ]),
);
```

At the page level, prove that an invalid mobile pane stays visible with inline errors, while a warning-only pane may advance and visited dots remain usable.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
npm.cmd exec -- vitest run client/src/lib/itr-filing.test.ts client/src/features/itr/pages/filing.test.ts
```

Expected: FAIL on missing `fieldId` and missing Continue gating.

- [ ] **Step 3: Extend verification issues with field identity**

Add:

```ts
export type ItrVerificationIssue = {
  id: string;
  severity: ItrVerificationSeverity;
  area: "owner" | "identity" | "income" | "documents" | "computation" | "review";
  paneId?: string;
  fieldId?: string;
  title: string;
  detail: string;
  action: string;
};
```

Map identity issues to stable fields:

- `pan-format` -> `pan`
- `aadhaar-format` -> `aadhaar`
- `ifsc-format` -> `ifsc`
- `bank-account-confirm` -> `bankAccountConfirm`
- `identity-required-${field}` -> the actual field name
- `owner-other-person` -> `displayName`

- [ ] **Step 4: Add explicit no-income confirmation**

Add `noIncomeConfirmed: z.boolean().default(false)` to `itrIncomeSchema`.

Rules:

- Selecting an income type sets `noIncomeConfirmed` to `false`.
- An empty income selection requires explicit confirmation.
- The issue belongs to `income-types` and is critical for Continue.
- Do not forbid legally valid losses. Pass `allowNegative` for house-property income and capital-gain fields.

- [ ] **Step 5: Add attempted-pane state**

When Continue is pressed:

```ts
const issues = validateItrPane(draft, activePane.id);
const criticalIssues = issues.filter((issue) => issue.severity === "critical");

if (criticalIssues.length > 0) {
  setAttemptedPaneIds((ids) => new Set([...ids, activePane.id]));
  captureItrFilingEvent("itr_filing_validation_blocked", {
    step: currentStepId,
    pane: activePane.id,
    rule: criticalIssues[0].id,
  });
  return;
}
```

Warnings remain visible at Verify but do not prevent pane advancement.

- [ ] **Step 6: Render field and pane errors**

Build an immutable `Record<string, string>` from active-pane issues. Pass `error` into `TextInput`, `PanInput`, `AadhaarInput`, and `IfscInput`. Render a compact red pane-level alert for issues without `fieldId`.

- [ ] **Step 7: Run focused tests**

```powershell
npm.cmd exec -- vitest run client/src/lib/itr-filing.test.ts client/src/features/itr/pages/filing.test.ts client/src/features/itr/components/filing/guided-filing-ui.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add shared/itr-filing.ts client/src/lib/itr-filing.test.ts client/src/features/itr/pages/filing.page.tsx client/src/features/itr/components/filing
git commit -m "feat: add pane-level ITR validation"
```

### Task 5: Finish Mobile Input and Action-Bar Ergonomics

**Files:**

- Modify: `client/src/features/itr/components/filing/PaneRenderer.tsx`
- Modify: `client/src/features/itr/components/filing/guided-filing-ui.tsx`
- Modify: `client/src/features/itr/components/filing/CurrencyInput.tsx`
- Modify: `client/src/features/itr/components/filing/identity-inputs.tsx`
- Modify: `client/src/features/itr/components/filing/steps/IdentityStep.tsx`
- Modify: `client/src/features/itr/components/filing/steps/IncomeStep.tsx`
- Modify: `client/src/features/itr/components/filing/steps/ReviewStep.tsx`
- Modify: `client/src/features/itr/components/filing/LiabilityChip.tsx`
- Modify: `client/src/features/itr/components/filing/filing-primitives.test.tsx`
- Modify: `client/src/features/itr/pages/filing.page.tsx`
- Modify: related component tests

- [ ] **Step 1: Add failing keyboard contracts**

Test:

- Intermediate text inputs expose `enterKeyHint="next"`.
- The last text input in a pane exposes `enterKeyHint="done"`.
- Enter on an intermediate field focuses the next enabled filing field.
- Enter on the final field calls Continue only when not composing IME text.
- DOB has `max` set to the current local date.
- Mobile phone uses `inputMode="tel"` and `autoComplete="tel-national"`.
- Mobile hides `Save draft` while desktop retains it.
- Sensitive bank-account fields remask after leaving and re-entering the pane.
- Liability displays a neutral `\u2014` before the result is computable.
- Review shows a masked identity recap and never renders raw PAN, Aadhaar, or account values.

- [ ] **Step 2: Add a stable filing-field marker**

Spread `data-filing-field` through `TextInput`, `CurrencyInput`, `PanInput`, `AadhaarInput`, and `IfscInput`.

In `PaneRenderer`, handle Enter at the pane boundary:

```ts
if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
const fields = Array.from(
  paneElement.querySelectorAll<HTMLElement>("[data-filing-field]:not([disabled])"),
);
```

Focus the next field or call `onPaneDone`.

- [ ] **Step 3: Refine the fixed action bar**

- Mobile Back is icon-only with an accessible name.
- Hide `Save draft` below `md`; keep it on desktop.
- Make Continue `h-11 flex-1` on mobile.
- Keep the existing bottom offset above `MobileBottomNav`.
- Hide the action bar while the keyboard is open.
- Show truthful offline copy: `Offline. Keep this page open; changes will save after reconnecting.`
- Reset `showSensitive` to `false` whenever the active pane changes.
- Use a neutral liability-chip state until computation is available.
- Pass only masked identity strings into `ReviewStep`.

- [ ] **Step 4: Run focused tests**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/components/filing client/src/features/itr/pages/filing.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add client/src/features/itr/components/filing client/src/features/itr/pages/filing.page.tsx client/src/features/itr/pages/filing.test.ts
git commit -m "feat: finish mobile ITR input ergonomics"
```

### Task 6: Persist Document Deferrals and Contextual Helpers

**Files:**

- Modify: `shared/itr-filing.ts`
- Modify: `client/src/lib/itr-filing.test.ts`
- Modify: `server/routes/tax-returns.ts`
- Modify: `client/src/lib/tax-return-routes.test.ts`
- Modify: `client/src/features/itr/components/filing/DocumentCaptureCard.tsx`
- Modify: `client/src/features/itr/components/filing/filing-primitives.test.tsx`
- Modify: `client/src/features/itr/components/filing/steps/DocumentsStep.tsx`

- [ ] **Step 1: Add failing shared and route tests**

Required behavior:

```ts
expect(normalizeItrDraft({ documentDeferrals: { form16: true } }).documentDeferrals)
  .toEqual({ form16: true });

// Linking form16 clears documentDeferrals.form16.
// A deferred required document remains a Verify warning, not a linked document.
```

- [ ] **Step 2: Extend the draft schema**

Add:

```ts
export const itrDocumentDeferralSchema = z.record(z.string(), z.boolean()).default({});
```

and `documentDeferrals` to `itrFilingDraftSchema`.

- [ ] **Step 3: Implement defer and clear behavior**

- `Provide later` sets `documentDeferrals[id] = true`, clears any empty manual reference, and advances.
- Upload, vault link, or meaningful manual reference clears `documentDeferrals[id]`.
- The link-document server route clears the matching deferral.
- `DocumentCaptureStatus` adds `"deferred"` and displays a neutral `Provide later` badge.

- [ ] **Step 4: Replace the helper button wall**

Map helpers to relevant cards:

- Form 16 -> `/form16-parser`
- AIS / TIS -> `/ais-viewer`
- Capital gains -> `/capital-gains-import`
- General fallback -> `/documents`

Render these as compact contextual links inside the card. Remove the four-button `documents-overview` wall, but keep the overview pane for progress counts.

- [ ] **Step 5: Run focused tests**

```powershell
npm.cmd exec -- vitest run client/src/lib/itr-filing.test.ts client/src/lib/tax-return-routes.test.ts client/src/features/itr/components/filing/filing-primitives.test.tsx client/src/features/itr/pages/filing.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add shared/itr-filing.ts server/routes/tax-returns.ts client/src/lib/itr-filing.test.ts client/src/lib/tax-return-routes.test.ts client/src/features/itr/components/filing client/src/features/itr/pages/filing.test.ts
git commit -m "feat: persist ITR document deferrals"
```

### Task 7: Add Privacy-Safe Pane Telemetry

**Files:**

- Create: `client/src/features/itr/lib/filing-telemetry.ts`
- Create: `client/src/features/itr/lib/filing-telemetry.test.ts`
- Modify: `client/src/features/itr/pages/filing.page.tsx`
- Modify: `client/src/features/itr/hooks/use-filing-navigation.ts`

- [ ] **Step 1: Write telemetry allowlist tests**

Allowed fields:

- Step ID
- Pane ID
- Rule ID
- Viewport category
- Counts
- Durations
- Booleans

Rejected or omitted fields:

- Draft objects
- PAN, Aadhaar, account, IFSC, email, mobile
- Income, deductions, tax paid, refund, payable, or any amount
- Document IDs or names

- [ ] **Step 2: Implement a typed wrapper**

Expose only:

```ts
captureItrFilingEvent("itr_filing_pane_viewed", { step, pane, viewport });
captureItrFilingEvent("itr_filing_pane_completed", { step, pane, msOnPane });
captureItrFilingEvent("itr_filing_validation_blocked", { step, pane, rule });
captureItrFilingEvent("itr_filing_review_submitted", { stepsVisited, totalMs, viewport });
```

Do not add `itr_filing_draft_restored`; secure browser restoration is intentionally out of scope.

- [ ] **Step 3: Wire pane timing**

Use refs with `performance.now()` so timing does not cause renders. Fire completion only when a pane advances or review submits.

- [ ] **Step 4: Run tests**

```powershell
npm.cmd exec -- vitest run client/src/features/itr/lib/filing-telemetry.test.ts client/src/features/itr/pages/filing.test.ts client/src/telemetry
```

Expected: PASS with no sensitive telemetry properties.

- [ ] **Step 5: Commit**

```powershell
git add client/src/features/itr/lib/filing-telemetry.ts client/src/features/itr/lib/filing-telemetry.test.ts client/src/features/itr/pages/filing.page.tsx client/src/features/itr/hooks/use-filing-navigation.ts
git commit -m "feat: add privacy-safe ITR pane telemetry"
```

### Task 8: Enforce Performance Budgets Based on a Fresh Build

**Files:**

- Modify: `scripts/check-size-budget.ts`
- Modify only if measured necessary: `client/src/features/itr/pages/filing.page.tsx`
- Modify only if measured necessary: filing step/component imports

- [ ] **Step 1: Build and capture the fresh baseline**

```powershell
npm.cmd run build
npm.cmd run check:size
```

Record:

- `filing.page-*.js` raw and gzip size.
- Total route dependency chunks loaded on first `/itr/filing` paint.
- Whether the route stays below 90 KB gzip.

- [ ] **Step 2: Add a route-specific size budget**

Extend `scripts/check-size-budget.ts` to find `assets/filing.page-*.js` and fail when gzip size exceeds `90 * 1024`.

Expected report line:

```text
ITR filing route chunk: <size> gzip (budget 90.00 KB)
```

- [ ] **Step 3: Measure before adding lazy imports**

Only add `React.lazy` for Documents, RegimeComparator, or LiabilitySheet when a fresh build or browser trace shows the route misses the budget or first-interaction target. Do not add loading boundaries solely because the original brief suggested them.

- [ ] **Step 4: Verify interaction targets**

In a production build on a mobile viewport:

- LCP <= 2.5 s for the warm authenticated shell.
- INP <= 200 ms while typing currency.
- CLS <= 0.05.
- No visible action-bar jump when the keyboard state changes.

- [ ] **Step 5: Commit**

```powershell
git add scripts/check-size-budget.ts
git commit -m "perf: enforce ITR filing route budget"
```

### Task 9: Extend Mobile E2E and Accessibility Coverage

**Files:**

- Modify: `tests/e2e/itr-filing-mobile.spec.ts`
- Modify: `client/src/features/itr/pages/filing.test.ts`
- Modify: `client/src/features/itr/components/filing/PaneRenderer.test.tsx`

- [ ] **Step 1: Extend the Playwright mobile flow**

Add scenarios:

1. Invalid PAN/Aadhaar keeps Continue on the same pane and shows errors.
2. Correcting fields advances and focuses/announces the next pane.
3. Browser back walks panes before leaving the macro step.
4. A Verify issue deep-links to the exact source pane.
5. Provide later persists after a page reload.
6. Offline edit stays pending; reconnect flushes; no claim says it survives page closure.
7. Mobile Save is absent; desktop Save remains present.

- [ ] **Step 2: Add small-viewport assertions**

Use viewport `360x640` for one flow and assert:

- No horizontal overflow.
- Fixed action bar remains above bottom nav.
- Liability chip remains above the action bar.
- Focused input has `scroll-margin-bottom`.

- [ ] **Step 3: Run mobile E2E**

```powershell
npm.cmd exec -- playwright test tests/e2e/itr-filing-mobile.spec.ts --project=mobile
```

Expected: PASS.

- [ ] **Step 4: Manual accessibility matrix**

Verify:

- Keyboard-only navigation.
- TalkBack on Android Chrome.
- VoiceOver on iOS Safari.
- `aria-current="step"` on active progress dot.
- Pane heading announced once per pane change.
- Error text and helper text both referenced by `aria-describedby`.
- Sensitive fields remask after pane re-entry.

- [ ] **Step 5: Commit**

```powershell
git add tests/e2e/itr-filing-mobile.spec.ts client/src/features/itr/pages/filing.test.ts client/src/features/itr/components/filing/PaneRenderer.test.tsx
git commit -m "test: cover completed mobile ITR journey"
```

### Task 10: Final Review, Verification, and Rollout

**Files:**

- Review all changed files.
- Update: `docs/MOBILE_ITR_FILING_PLAN.md` only if the owner wants the product brief marked with implementation status.

- [ ] **Step 1: Run focused filing tests**

```powershell
npm.cmd exec -- vitest run client/src/features/itr client/src/lib/itr-filing.test.ts client/src/lib/tax-return-routes.test.ts
```

- [ ] **Step 2: Run full project gates**

```powershell
npm.cmd run check
npm.cmd run test:unit
npm.cmd run build
npm.cmd run check:size
npm.cmd audit --omit=dev
git diff --check
```

Expected: all pass. Restore generated `client/public/sitemap.xml` churn if build changes it without an intentional sitemap change.

- [ ] **Step 3: Run mobile E2E**

```powershell
npm.cmd exec -- playwright test tests/e2e/itr-filing-mobile.spec.ts --project=mobile
```

- [ ] **Step 4: Run a security review**

Confirm:

- No draft data is written to browser storage.
- No new telemetry property accepts sensitive data or money.
- Existing authorization and ownership checks remain intact.
- Linked documents must belong to the tax-return owner.
- Sensitive taxpayer fields remain encrypted at rest.
- Error messages do not expose stored values.

- [ ] **Step 5: Run responsive visual verification**

Check `/itr/filing` at:

```text
320, 360, 390, 430, 540, 768, 1024, 1440 px
```

Confirm the existing bottom nav stays unchanged below `768px`, desktop step pills remain unchanged at and above `768px`, and the action bar/liability chip never overlap content.

- [ ] **Step 6: Review the final diff before any push**

```powershell
git status --short
git diff --stat
git diff --check
git show --name-status HEAD
```

Keep unrelated dirty workspace files outside the implementation commit.

## 5. Rollout Strategy

Because the thumb-first flow already exists in local commit `3482c83`, do not retrofit a query-string feature flag that would duplicate the old and new UI paths.

Use this rollout:

1. Complete Tasks 1-9 on the current feature branch.
2. Deploy a preview from the exact validated commit.
3. Run the mobile E2E flow and manual device matrix against the preview.
4. Compare privacy-safe pane completion and validation-block metrics for internal/test users.
5. Promote the validated commit.
6. Keep the previous production deployment available for rollback for one release cycle.

## 6. Explicit Non-Goals

- No `MobileBottomNav` redesign.
- No `/m/itr/filing` route.
- No full-draft `localStorage`, `sessionStorage`, or IndexedDB mirror.
- No claim that offline edits survive tab/app termination.
- No native camera or secure-storage Capacitor plugin.
- No tax-rule expansion beyond the existing AY 2026-27 rules, except allowing legally valid loss-capable inputs.
- No new visual language, gradients, color tokens, form library, carousel, or modal system.
- No public marketing or SEO copy changes.

## 7. Completion Definition

The work is complete when:

- Mobile shows one pane at a time; desktop remains unchanged.
- Critical pane errors render inline and prevent Continue without disabling it.
- Warnings and visited-dot jumps remain soft.
- Keyboard next/done behavior works without covering fields or actions.
- Mobile Save is removed; autosave state is clear and truthful.
- Browser back walks panes, then macro steps, without accidental dashboard exit.
- Document deferrals persist and clear when evidence is linked.
- Verify issues deep-link to exact panes.
- Telemetry is pane-level and privacy-safe.
- No authenticated draft data is written to browser storage.
- The filing route stays within the 90 KB gzip budget.
- Focused tests, full unit tests, TypeScript, build, size budget, mobile E2E, security review, and responsive checks all pass.
