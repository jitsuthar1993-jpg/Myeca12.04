# ITR Selector Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long public ITR selector form with a responsive, one-section-at-a-time journey that uses calm game-like progress and a fixed bottom action bar.

**Architecture:** Keep `start-selector.ts` and the existing recommendation/handoff contracts unchanged. Refactor the public start page into six client-side stages on the same route, and make `App.tsx` yield global chrome so the page can render a compact brand header and no footer.

**Tech Stack:** React 18, TypeScript, Wouter, Framer Motion, Tailwind CSS, Radix UI, Vitest, Testing Library, Playwright.

---

### Task 1: Lock journey behavior with tests

**Files:**
- Modify: `client/src/features/itr/pages/start.page.test.tsx`
- Modify: `client/src/App.test.ts`
- Modify: `client/src/lib/public-growth-roadmap.test.ts`

- [ ] Add tests for first-step isolation, Back/Next navigation, final-only recommendation, expandable details, and preserved auth handoff.
- [ ] Add a route-shell source contract requiring focused public-flow chrome.
- [ ] Run the focused tests and confirm they fail because the journey UI is not implemented.

### Task 2: Build the focused selector journey

**Files:**
- Modify: `client/src/features/itr/pages/start.page.tsx`
- Modify: `client/src/App.tsx`

- [ ] Keep all existing answer mapping, recommendation, telemetry, attribution, resume, and continuation logic.
- [ ] Render five answer stages and one result stage with a progress indicator, compact brand header, and fixed safe-area-aware action bar.
- [ ] Use directional Framer Motion transitions, selection feedback, and reduced-motion-compatible behavior.
- [ ] Show the recommendation only on the final stage, with top reasons visible and technical details collapsible.
- [ ] Hide the global public header/footer for only `/which-itr-form-to-file`.

### Task 3: Verify behavior and responsive quality

**Files:**
- Test: `client/src/features/itr/pages/start.page.test.tsx`
- Test: `client/src/App.test.ts`
- Test: `client/src/lib/public-growth-roadmap.test.ts`
- Test: `tests/e2e/design-system-visual-sweep.spec.ts`

- [ ] Run focused Vitest tests, `npm.cmd run check`, `npm.cmd run build`, and `git diff --check`.
- [ ] Verify the route in the in-app browser at `390x844` and a desktop viewport.
- [ ] Confirm no horizontal overflow, bottom actions remain visible, Back/Next works, the result is final-only, and Continue preserves the existing destination behavior.
