# Speed and Visual Consistency Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the broken semantic color pipeline, converge the app on one light-theme visual system, reduce avoidable critical-path and deployment weight, and add regression gates that preserve the result.

**Architecture:** Keep `client/src/index.css` as the runtime owner of raw-HSL semantic colors consumed by Tailwind, while `client/src/styles/design-tokens.css` retains only non-duplicated foundation tokens and named utilities that are still used. Normalize shared UI primitives before performing mechanical page-level migrations. Measure performance using both deployment artifact budgets and actual anonymous-route network payloads, because total lazy-route JavaScript is not the same as first-load cost.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, Radix UI, class-variance-authority, Vite 6, Express, Vitest, Playwright, Sharp, Vite PWA.

---

## Contract And Verified Baseline

Treat `docs/codex-speed-visual-overhaul.md` as the design/audit contract. This implementation plan refines its execution details based on the current checkout.

Verified on June 11, 2026, branch `codex/production-pwa-conversion`, commit `3482c83`:

| Check | Current result |
| --- | --- |
| `npm.cmd run check` | PASS |
| `npm.cmd run test:unit` | PASS, 125 files and 736 tests |
| `npm.cmd run build` | PASS, 381 public shells and 26 noindex shells |
| `npm.cmd run check:typography` | PASS, 173 files |
| `npm.cmd run check:size` | FAIL, `dist/public` 10.80 MB across 1030 files |
| Total JavaScript gzip | 1.28 MB across 365 lazy/shared files |
| Main entry | 323.74 KB raw, 91.26 KB gzip |
| Main CSS | 313,320 bytes raw, 43.86 KB gzip |
| Bare raw-HSL semantic declarations in built CSS | 85 |
| `content-context.json` | 592,157 bytes in `dist/public` |
| `og-default.png` | 338,118 bytes, 1200x630 |
| `dark:` variants | 193 occurrences across 25 TS/TSX files |
| Semantic utility usages | 258 occurrences in TSX |

Fresh anonymous contexts currently load these decoded JavaScript totals:

| Route | Decoded JS | Script requests | Supabase chunk |
| --- | ---: | ---: | --- |
| `/` | 1,117,443 bytes | 65 | Absent |
| `/services` | 1,118,298 bytes | 59 | Absent |
| `/pricing` | 992,173 bytes | 47 | Absent |
| `/blog` | 1,086,119 bytes | 49 | Absent |
| `/calculators/tax-regime` | 980,795 bytes | 48 | Absent |

The `forms` chunk is approximately 89 KB raw and currently loads on every sampled public route. Trace that shared edge during the performance slice instead of assuming all current shared chunks are necessary.

The working tree is already dirty. Preserve all unrelated edits, especially the existing Safari 14.1 target work in `vite.config.ts`.

## Corrections To The Source Brief

1. **Use exact primary HSL.** `hsl(227 96% 59%)` rounds to approximately `#325efb`, not exact `#315efb`. Use `--primary: 226.63 96.19% 58.82%` and the same value for `--ring`.
2. **Use a targeted built-CSS guard.** A blanket ban on `color:var(--...)` is wrong because Tailwind Typography and full-value CSS variables legitimately use bare `var()`. Reject bare use only for the known raw-HSL semantic token allowlist.
3. **Do not treat total lazy-route JS as a first-load hard budget.** Keep total JS gzip as a trend warning. Add actual anonymous-route network budgets and a hard assertion that public pages do not fetch `supabase-*.js`.
4. **Move, do not simply delete, `content-context.json`.** `scripts/check-content-quality.ts` and `scripts/generate-public-content-review-queue.ts` consume it. All producers and consumers must share one non-public artifact path.
5. **Self-hosted fonts add deployment bytes.** Prefer one Inter variable latin WOFF2 covering weights 400-700. Measure its LCP and size impact after removing `content-context.json` and compressing the OG image.
6. **Remove runtime font preconnects too.** `client/src/utils/performance-hints.ts` re-adds Google Fonts preconnects after startup. Updating only `client/index.html` is incomplete.
7. **Delete unused header variables instead of syncing them.** The `--header-*` and `--page-top-padding*` variables currently have no consumers. `App.tsx` and `Header.tsx` are the real owners of the 60px/74px initial geometry.
8. **Remove dormant `dark:` variants as a mechanical migration.** Deleting only the `.dark` block leaves Tailwind-generated dark CSS in the bundle. Light-only completion means zero `dark:` variants in client TS/TSX.
9. **Do not chase prerendered HTML size without evidence.** The current generator already externalizes `static-seo-shell.css`. Revisit shell weight only if the primary artifact fixes do not create enough budget headroom.

## Canonical Visual Decisions

### Brand Scale

Use this monotonic Tailwind scale. `brand-600` is the primary action color and has 5.09:1 contrast against white.

| Token | Value |
| --- | --- |
| `brand-50` | `#f0f3ff` |
| `brand-100` | `#e0e7ff` |
| `brand-200` | `#bdcbff` |
| `brand-300` | `#8fa7ff` |
| `brand-400` | `#5c7fff` |
| `brand-500` | `#3d67ff` |
| `brand-600` | `#315efb` |
| `brand-700` | `#1f48db` |
| `brand-800` | `#203da7` |
| `brand-900` | `#1d327c` |
| `brand-950` | `#142252` |

Remove Tailwind aliases `navy`, `cta-primary`, and `primary-hover`. Keep `brand.DEFAULT` equal to `brand-600` for normal Tailwind ergonomics.

### Semantic HSL Matrix

`client/src/index.css` owns these raw-HSL values. Tailwind must wrap every consumer with `hsl(var(--token) / <alpha-value>)`.

| Semantic token | Value | Purpose |
| --- | --- | --- |
| `--background` | `0 0% 100%` | Main canvas |
| `--foreground` | `222.2 47.4% 11.2%` | Slate-900 body text |
| `--card`, `--popover` | `0 0% 100%` | Elevated surfaces |
| `--card-foreground`, `--popover-foreground` | `222.2 47.4% 11.2%` | Surface text |
| `--primary`, `--ring` | `226.63 96.19% 58.82%` | Exact `#315efb` |
| `--primary-foreground` | `0 0% 100%` | White on primary |
| `--secondary`, `--muted` | `210 40% 96.1%` | Slate-100 surface |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | Slate-900 |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Slate-500 |
| `--accent` | `224 100% 97%` | Light brand-blue hover/selection surface |
| `--accent-foreground` | `226.63 96.19% 40%` | Dark brand-blue accent text |
| `--border`, `--input` | `214.3 31.8% 91.4%` | Slate-200 |
| `--destructive` | `0 72.2% 50.6%` | Red-600 |
| `--destructive-foreground` | `0 0% 100%` | White on destructive |

Green remains semantic success/trust, amber remains warning/deadline, and red remains destructive/error. Teal is not a second general-purpose accent.

### Radius And Motion

| Role | Class |
| --- | --- |
| Inputs and buttons | `rounded-lg` |
| Cards and popovers | `rounded-xl` |
| Dialogs and hero panels | `rounded-2xl` |
| Pills and circular controls | `rounded-full` |

Static primitives do not lift on hover. Hover translation is opt-in for genuinely interactive cards and the explicitly marketing-oriented button variant.

### Focus

Use one global `:focus-visible` outline: 2px `hsl(var(--ring))`, offset 2px. Remove competing global `:focus`, component ring, and `!important` form-focus treatments that would create double focus indicators.

## File Ownership Map

### Create

- `client/src/lib/design-system-token-contract.test.ts`: source-level token, docs, alias, and light-only contract.
- `client/src/components/ui/button.test.tsx`: shared Button visual contract.
- `client/src/components/ui/card.test.tsx`: shared Card static/interactive contract.
- `scripts/check-built-semantic-colors.ts`: post-build raw-HSL semantic declaration guard.
- `scripts/check-design-class-usage.ts`: source guard for gray classes, dark variants, brand aliases, and hardcoded primary hex.
- `scripts/lib/build-artifact-paths.ts`: shared `dist/public` and `dist/meta` paths.
- `scripts/optimize-public-assets.ts`: reproducible OG image optimization.
- `tests/e2e/design-system-visual-sweep.spec.ts`: artifact screenshots and visual behavior checks.
- `tests/e2e/public-network-budget.spec.ts`: anonymous-route script budget and no-Supabase assertion.
- `client/public/fonts/inter-latin-variable.woff2`: self-hosted Inter variable latin font.
- `client/public/fonts/OFL.txt`: Inter license.

### Modify Directly

- `tailwind.config.ts`
- `client/src/index.css`
- `client/src/styles/design-tokens.css`
- `client/src/styles/typography.css`
- `client/src/components/ui/button.tsx`
- `client/src/components/ui/card.tsx`
- `client/src/components/ui/badge.tsx`
- `client/src/components/ui/input.tsx`
- `client/src/components/ui/select.tsx`
- `client/src/components/ui/command.tsx`
- `client/src/components/ui/dialog.tsx`
- `client/src/components/ui/popover.tsx`
- `client/src/components/ui/tooltip.tsx`
- `client/src/components/ui/toast.tsx`
- `client/src/components/ui/tabs.tsx`
- `client/src/components/ui/sheet.tsx`
- `client/src/App.tsx`
- `client/src/components/layout/Header.tsx`
- `client/index.html`
- `client/src/utils/performance-hints.ts`
- `client/src/utils/performance-monitor.ts`
- `client/src/utils/performance-utils.ts`
- `scripts/generate-seo-assets.ts`
- `scripts/check-content-quality.ts`
- `scripts/generate-public-content-review-queue.ts`
- `scripts/check-size-budget.ts`
- `package.json`
- `docs/DESIGN_SYSTEM.md`
- `docs/THEMING_GUIDE.md`
- `README.md`

### Mechanical Migration Set

Use `rg` to generate the exact changed-file list at execution time. The mechanical slice may touch `client/src/**/*.{ts,tsx,css}` only for:

- `text|bg|border|divide|ring-gray-*` to the same `slate-*` shade.
- `dark:*` removal while retaining the light class.
- `#315efb`, `#2040d8`, and `#0646b2` conversion to `brand-*`.
- `navy-*`, `cta-primary`, and `primary-hover` conversion to `brand-*`.

Do not mix logic, copy, routes, SEO metadata, or component API changes into the mechanical migration commit.

## Gate For Every Slice

Run these after each slice:

```powershell
npm.cmd run check
npm.cmd run test:unit
npm.cmd run build
npm.cmd run check:size
npm.cmd run check:typography
npm.cmd run check:static-seo
git diff --check
```

`check:size` is expected to remain red until the artifact-hygiene slice. Record its exact delta after every build rather than hiding the known failure. Run `check:built-semantic-colors` after Task 1, `test:design-system` after Task 3, and the combined `check:design-system` after Task 4 introduces it.

---

### Task 1: Repair Semantic Colors And Add The Regression Contract

**PR slice:** 1
**Risk:** Low, correctness-first
**Files:**
- Create: `client/src/lib/design-system-token-contract.test.ts`
- Create: `scripts/check-built-semantic-colors.ts`
- Modify: `tailwind.config.ts`
- Modify: `client/src/index.css`
- Modify: `scripts/build-production.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing source contract**

The test must import `tailwind.config.ts` and assert that every raw-HSL semantic color is wrapped with the alpha-capable Tailwind form.

```ts
const semantic = {
  background: "hsl(var(--background) / <alpha-value>)",
  foreground: "hsl(var(--foreground) / <alpha-value>)",
  border: "hsl(var(--border) / <alpha-value>)",
  input: "hsl(var(--input) / <alpha-value>)",
  ring: "hsl(var(--ring) / <alpha-value>)",
};

for (const [name, expected] of Object.entries(semantic)) {
  expect(colors[name], name).toBe(expected);
}

expect(indexCss).toContain("--primary: 226.63 96.19% 58.82%;");
expect(indexCss).toContain("--ring: 226.63 96.19% 58.82%;");
```

- [ ] **Step 2: Run the focused test and confirm RED**

```powershell
npm.cmd run test:unit -- client/src/lib/design-system-token-contract.test.ts
```

Expected: failure showing current values such as `var(--background)` and `--primary: 219 100% 26%`.

- [ ] **Step 3: Wrap every semantic Tailwind color**

Use the same pattern for:

- background and foreground
- card and card foreground
- popover and popover foreground
- primary and primary foreground
- secondary and secondary foreground
- muted and muted foreground
- accent and accent foreground
- destructive and destructive foreground
- border, input, and ring
- chart 1-5
- all sidebar semantic colors

Example:

```ts
background: "hsl(var(--background) / <alpha-value>)",
primary: {
  DEFAULT: "hsl(var(--primary) / <alpha-value>)",
  foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
},
```

- [ ] **Step 4: Correct exact primary and ring values**

Change `client/src/index.css` to the exact raw-HSL values from the semantic matrix. Correct the stale comments.

- [ ] **Step 5: Add the targeted built-CSS guard**

`scripts/check-built-semantic-colors.ts` must:

1. Load all `dist/public/assets/*.css`.
2. Check only the raw-HSL semantic token allowlist.
3. Fail if any color property uses a bare declaration such as `background-color:var(--primary)`.
4. Permit full-value variables such as `--tw-prose-body` and `--color-*`.

The raw-HSL allowlist is:

```ts
[
  "background", "foreground", "card", "card-foreground",
  "popover", "popover-foreground", "primary", "primary-foreground",
  "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "destructive-foreground",
  "border", "input", "ring", "chart-1", "chart-2", "chart-3", "chart-4",
  "chart-5", "sidebar-background", "sidebar-foreground", "sidebar-primary",
  "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground",
  "sidebar-border", "sidebar-ring",
]
```

- [ ] **Step 6: Wire the guard**

Add:

```json
"check:built-semantic-colors": "tsx scripts/check-built-semantic-colors.ts"
```

Run it from `scripts/build-production.ts` after Vite emits CSS and before SEO shell generation.

- [ ] **Step 7: Verify GREEN and built output**

```powershell
npm.cmd run test:unit -- client/src/lib/design-system-token-contract.test.ts
npm.cmd run build
npm.cmd run check:built-semantic-colors
```

Expected:

- Focused unit test passes.
- Build passes.
- Targeted bare semantic declaration count falls from 85 to 0.
- Command palette, Badge, Toast, Tabs, and Select semantic classes resolve to real colors.

- [ ] **Step 8: Commit the slice**

```powershell
git add tailwind.config.ts client/src/index.css client/src/lib/design-system-token-contract.test.ts scripts/check-built-semantic-colors.ts scripts/build-production.ts package.json
git commit -m "fix: repair semantic color pipeline"
```

---

### Task 2: Establish One Light-Theme Token Source

**PR slice:** 2
**Risk:** Medium-low, global CSS ownership
**Files:**
- Modify: `client/src/lib/design-system-token-contract.test.ts`
- Modify: `client/src/index.css`
- Modify: `client/src/styles/design-tokens.css`
- Modify: `client/src/styles/typography.css`
- Modify: `tailwind.config.ts`
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/layout/Header.tsx`
- Modify: `docs/DESIGN_SYSTEM.md`
- Modify: `docs/THEMING_GUIDE.md`
- Modify: `README.md`

- [ ] **Step 1: Extend the failing contract**

Add assertions that fail while the current duplicate system remains:

```ts
expect(tailwindSource).toContain('600: "#315efb"');
expect(tailwindSource).toContain('700: "#1f48db"');
expect(designTokensCss).not.toMatch(/\.dark\b/);
expect((designTokensCss.match(/prefers-reduced-motion:\s*reduce/g) ?? [])).toHaveLength(1);
expect(indexCss).not.toContain("--header-main-height");
expect(indexCss).not.toContain("button:focus,");
```

Also assert that the temporary Tailwind aliases point to canonical brand values during the migration window, `docs/DESIGN_SYSTEM.md` names `client/src/index.css` as the semantic color owner, and `docs/THEMING_GUIDE.md` is only a compatibility pointer to the canonical design system.

- [ ] **Step 2: Run the focused test and confirm RED**

```powershell
npm.cmd run test:unit -- client/src/lib/design-system-token-contract.test.ts
```

- [ ] **Step 3: Replace the brand scale and deprecate aliases**

Apply the canonical brand scale. Keep `navy`, `cta-primary`, and `primary-hover` as temporary compatibility aliases pointing to canonical brand values so this slice does not silently remove styles from existing consumers.

Do not migrate all consumers in this slice. The complete source migration and alias removal belong to Task 4.

- [ ] **Step 4: Make `index.css` the semantic runtime owner**

In `client/src/index.css`:

- Apply the semantic HSL matrix.
- Remove the duplicated header comment.
- Delete unused `--header-*` and `--page-top-padding*` variables.
- Remove global `button { transition: all ... }`.
- Replace `button:focus, a:focus` with one global `:focus-visible` outline.
- Remove the global `!important` form color/focus overrides that bypass primitives.
- Keep only shared base rules and named utilities that have real consumers.

Use:

```css
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

- [ ] **Step 5: Reduce `design-tokens.css` to foundation responsibilities**

Keep:

- font, type, spacing, radius, shadow, transition, and z-index scales that are consumed
- named utilities with confirmed consumers
- one reduced-motion block
- print and mobile-safe-area utilities that remain used

Remove:

- the `.dark` token and utility blocks
- duplicate reduced-motion block
- duplicate focus rules
- unused parallel color scales with no remaining consumers
- hover translation from generic `.card-base` and `.card-elevated`

Keep any still-referenced legacy color variable until its consumer is migrated in Task 4, then remove it in the same mechanical commit.

- [ ] **Step 6: Align header geometry ownership**

Keep initial header geometry at 60px mobile and 74px desktop in `App.tsx` and `Header.tsx`. Add or update a source contract in `client/src/App.test.ts` that asserts the loading shell and spacer use the same two heights.

Do not introduce CSS variables for these heights unless both components consume them in the same slice.

- [ ] **Step 7: Converge the docs**

- Rewrite `docs/DESIGN_SYSTEM.md` around the canonical brand, semantic HSL pipeline, slate neutral ramp, radius roles, motion rules, focus rule, and light-only policy.
- Replace `docs/THEMING_GUIDE.md` with a short compatibility pointer to `docs/DESIGN_SYSTEM.md`.
- Update the README docs table so Design System is canonical and Theming Guide is a pointer.
- State that dark mode is not enabled and new `dark:` variants are forbidden.

- [ ] **Step 8: Verify CSS ownership**

```powershell
npm.cmd run test:unit -- client/src/lib/design-system-token-contract.test.ts client/src/App.test.ts
npm.cmd run build
npm.cmd run check:size
```

Expected:

- No `.dark` rules remain in `design-tokens.css`.
- Exactly one reduced-motion block remains in `design-tokens.css`.
- Header shell/spacer source contract passes.
- CSS raw size decreases from the 313,320-byte baseline.

- [ ] **Step 9: Commit the slice**

```powershell
git add tailwind.config.ts client/src/index.css client/src/styles/design-tokens.css client/src/styles/typography.css client/src/App.tsx client/src/components/layout/Header.tsx client/src/App.test.ts client/src/lib/design-system-token-contract.test.ts docs/DESIGN_SYSTEM.md docs/THEMING_GUIDE.md README.md
git commit -m "refactor: establish canonical light theme tokens"
```

---

### Task 3: Normalize Shared UI Primitives

**PR slice:** 3
**Risk:** Medium, shared behavior
**Files:**
- Create: `client/src/components/ui/button.test.tsx`
- Create: `client/src/components/ui/card.test.tsx`
- Modify: `client/src/components/ui/button.tsx`
- Modify: `client/src/components/ui/card.tsx`
- Modify: `client/src/components/ui/badge.tsx`
- Modify: `client/src/components/ui/input.tsx`
- Modify: `client/src/components/ui/select.tsx`
- Modify: `client/src/components/ui/command.tsx`
- Modify: `client/src/components/ui/dialog.tsx`
- Modify: `client/src/components/ui/popover.tsx`
- Modify: `client/src/components/ui/tooltip.tsx`
- Modify: `client/src/components/ui/toast.tsx`
- Modify: `client/src/components/ui/tabs.tsx`
- Modify: `client/src/components/ui/sheet.tsx`

- [ ] **Step 1: Write failing Button tests**

Cover these contracts:

```ts
expect(defaultButton.className).toContain("bg-primary");
expect(defaultButton.className).not.toContain("translate-y");
expect(outlineButton.className).toContain("border-slate-300");
expect(brandButton.className).toContain("hover:-translate-y-0.5");
expect(primaryAliasButton.className).toEqual(defaultButton.className);
```

Preserve the `primary` variant as a temporary compatibility alias that produces the same classes as `default`. New code must use `default`.

- [ ] **Step 2: Write failing Card tests**

Add an `interactive?: boolean` prop to Card-family primitives. Test:

```ts
expect(staticCard.className).toContain("rounded-xl");
expect(staticCard.className).not.toContain("translate-y");
expect(interactiveCard.className).toContain("hover:-translate-y-1");
```

Apply the same opt-in interaction rule to `CardPremium`, `CardGlass`, and `CardPopular`.

- [ ] **Step 3: Run focused tests and confirm RED**

```powershell
npm.cmd run test:unit -- client/src/components/ui/button.test.tsx client/src/components/ui/card.test.tsx
```

- [ ] **Step 4: Normalize Button**

- Use semantic/brand tokens only.
- Remove duplicate transition strings.
- Use slate neutrals throughout.
- Remove hover lift from default, destructive, outline, secondary, ghost, success, and warning.
- Keep hover lift only on the explicit `brand` marketing variant.
- Remove local focus-ring classes because the global `:focus-visible` rule owns the indicator.
- Keep `primary` as a class-equivalent compatibility alias, then audit and migrate its consumers in Task 4.

- [ ] **Step 5: Normalize Card**

- Default Card: `rounded-xl border border-slate-200 bg-card text-card-foreground shadow-sm`.
- `interactive` adds cursor, hover shadow, and `hover:-translate-y-1`.
- Premium/Glass/Popular use semantic and `brand-*` tokens only.
- Remove all `gray-*` and arbitrary primary hex.
- Keep existing named exports to avoid unrelated consumer rewrites.

- [ ] **Step 6: Normalize remaining primitives**

For Badge, Input, Select, Command, Dialog, Popover, Tooltip, Toast, Tabs, and Sheet:

- Replace `gray-*` with `slate-*`.
- Replace hardcoded brand hex with semantic or `brand-*`.
- Use semantic surface/text tokens where the component is shadcn-style.
- Remove local focus styles that conflict with the global indicator.
- Use the radius role table.
- Ensure surfaces are opaque unless the component is explicitly a glass variant.

- [ ] **Step 7: Verify shared primitive behavior**

```powershell
npm.cmd run test:unit -- client/src/components/ui/button.test.tsx client/src/components/ui/card.test.tsx client/src/lib/design-system-token-contract.test.ts
npm.cmd run build
npm.cmd run check:built-semantic-colors
```

Expected:

- Tests pass.
- Built semantic guard passes.
- Default cards and buttons no longer move on hover.
- Command, Toast, Tabs, and Select have valid opaque surfaces and muted text.

- [ ] **Step 8: Commit the slice**

```powershell
git add client/src/components/ui client/src/lib/design-system-token-contract.test.ts
git commit -m "refactor: normalize shared UI primitives"
```

---

### Task 4: Perform The Mechanical Source Migration

**PR slice:** 4
**Risk:** Medium-wide, shallow and reviewable
**Files:**
- Create: `scripts/check-design-class-usage.ts`
- Modify: `package.json`
- Modify: `tailwind.config.ts`
- Modify: `client/src/lib/design-system-token-contract.test.ts`
- Modify: the exact `client/src/**/*.{ts,tsx,css}` files returned by the audit commands

- [ ] **Step 1: Write the failing source guard**

`scripts/check-design-class-usage.ts` must scan client TS, TSX, and CSS sources and fail on:

```ts
[
  /\b(?:text|bg|border|divide|ring)-gray-/,
  /\bdark:/,
  /\b(?:navy|cta-primary|primary-hover)(?:-|\b)/,
  /#315efb/i,
  /#2040d8/i,
  /#0646b2/i,
]
```

Permit hardcoded colors only in `client/public` assets, which are outside this scan. Do not add broad allowlists.

- [ ] **Step 2: Wire and run the guard to confirm RED**

Add:

```json
"test:design-system": "vitest run client/src/lib/design-system-token-contract.test.ts client/src/components/ui/button.test.tsx client/src/components/ui/card.test.tsx",
"check:design-classes": "tsx scripts/check-design-class-usage.ts",
"check:design-system": "npm.cmd run test:design-system && npm.cmd run check:design-classes && npm.cmd run check:built-semantic-colors"
```

Run:

```powershell
npm.cmd run check:design-classes
```

Expected: failure showing current gray classes, dark variants, aliases, and primary hex.

- [ ] **Step 3: Generate the migration inventory**

```powershell
rg -l "\b(text|bg|border|divide|ring)-gray-|\bdark:|#315efb|#2040d8|#0646b2|\b(navy|cta-primary|primary-hover)" client/src --glob "*.{ts,tsx,css}"
```

Save the command output in the PR description, not in a new repo file.

- [ ] **Step 4: Perform only mechanical replacements**

- Map each Tailwind gray shade to the same slate shade.
- Delete `dark:*` variants while preserving the light class.
- Convert exact primary/hover/dark blue values to `brand-600`, `brand-700`, and `brand-800` as appropriate.
- Convert alias classes to `brand-*`.
- Migrate `variant="primary"` Button uses to the default variant where the change is purely syntactic.
- Add `interactive` only to cards that are links, buttons, or have click/keyboard handlers.
- Remove the now-unused `navy`, `cta-primary`, and `primary-hover` definitions from `tailwind.config.ts` after all source consumers are migrated.
- Replace the temporary-alias assertions in `design-system-token-contract.test.ts` with assertions that the three Tailwind alias definitions are absent.

Do not globally replace radius or container classes. Those require visual judgment in Task 6.

- [ ] **Step 5: Review the mechanical diff**

```powershell
git diff --word-diff -- client/src
git diff --check
npm.cmd run check:design-classes
```

Expected:

- No logic, copy, route, or metadata changes.
- Source guard passes.
- No `dark:` variant remains in client TS/TSX.
- No gray Tailwind neutral remains in client TS/TSX/CSS.
- No exact legacy brand hex or alias remains in client source.

- [ ] **Step 6: Run full regression gates**

```powershell
npm.cmd run check
npm.cmd run test:unit
npm.cmd run build
npm.cmd run check:design-system
npm.cmd run check:typography
npm.cmd run check:static-seo
```

- [ ] **Step 7: Commit the slice**

```powershell
git add scripts/check-design-class-usage.ts package.json tailwind.config.ts client/src
git commit -m "refactor: migrate client styles to canonical tokens"
```

---

### Task 5: Improve Critical Path And Deployment Artifact Hygiene

**PR slice:** 5
**Risk:** Medium, build and network behavior
**Files:**
- Create: `scripts/lib/build-artifact-paths.ts`
- Create: `scripts/optimize-public-assets.ts`
- Create: `tests/e2e/public-network-budget.spec.ts`
- Create: `client/public/fonts/inter-latin-variable.woff2`
- Create: `client/public/fonts/OFL.txt`
- Modify: `client/src/lib/design-system-token-contract.test.ts`
- Modify: `scripts/generate-seo-assets.ts`
- Modify: `scripts/check-content-quality.ts`
- Modify: `scripts/generate-public-content-review-queue.ts`
- Modify: `client/index.html`
- Modify: `client/src/index.css`
- Modify: `client/src/utils/performance-hints.ts`
- Modify: `client/src/utils/performance-monitor.ts`
- Modify: `client/src/utils/performance-utils.ts`
- Modify: `vite.config.ts`
- Modify: `scripts/check-size-budget.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing build-artifact contract**

Extend `client/src/lib/design-system-token-contract.test.ts` or create a focused node-environment test that asserts:

- `content-context.json` is written under `dist/meta`.
- Producer and consumers import one shared path helper.
- No source still references `dist/public/content-context.json`.
- Google Fonts domains are absent from `client/index.html` and `performance-hints.ts`.

- [ ] **Step 2: Run the focused test and confirm RED**

```powershell
npm.cmd run test:unit -- client/src/lib/design-system-token-contract.test.ts
```

- [ ] **Step 3: Move private build metadata out of the publish directory**

Create `scripts/lib/build-artifact-paths.ts` exporting:

```ts
export const rootDir = process.cwd();
export const distPublicDir = path.join(rootDir, "dist", "public");
export const distMetaDir = path.join(rootDir, "dist", "meta");
export const contentContextPath = path.join(distMetaDir, "content-context.json");
```

Update the generator and both consumers to use `contentContextPath`. Ensure `dist/meta` exists before writing.

Expected artifact reduction before any other work: 592,157 bytes removed from `dist/public`.

- [ ] **Step 4: Add reproducible OG image optimization**

`scripts/optimize-public-assets.ts` must use Sharp to:

- preserve 1200x630 dimensions
- preserve PNG output for `/og-default.png`
- use palette/maximum compression settings
- write through a temporary sibling file, then replace the source only after successful metadata validation
- fail if output exceeds 100 KB

Add:

```json
"optimize:public-assets": "tsx scripts/optimize-public-assets.ts"
```

Run it once and commit the optimized image.

- [ ] **Step 5: Self-host Inter with one variable latin WOFF2**

- Add `inter-latin-variable.woff2` and `OFL.txt`.
- Define one `@font-face` with `font-weight: 400 700`, `font-style: normal`, and `font-display: swap`.
- Preload the one variable font in `client/index.html`.
- Remove Google Fonts stylesheet, noscript stylesheet, and font-domain preconnects.
- Remove Google Fonts domains from `performance-hints.ts`.
- Update or remove stale nonexistent font paths in `performance-monitor.ts` and `performance-utils.ts`.

Do not preload four separate static weights unless a measured comparison proves the variable file performs worse.

- [ ] **Step 6: Add anonymous public-route network assertions**

In `tests/e2e/public-network-budget.spec.ts`, create fresh contexts for:

- `/`
- `/services`
- `/pricing`
- `/blog`
- `/calculators/tax-regime`

For every route:

- collect JavaScript response URLs and decoded body sizes
- assert no URL matches `/supabase-.*\.js/`
- assert no request goes to `fonts.googleapis.com` or `fonts.gstatic.com`
- report total route JavaScript bytes

Start with these hard ceilings, approximately 10% above the verified baseline:

| Route | Initial hard decoded-JS ceiling |
| --- | ---: |
| `/` | 1,230,000 bytes |
| `/services` | 1,230,000 bytes |
| `/pricing` | 1,100,000 bytes |
| `/blog` | 1,200,000 bytes |
| `/calculators/tax-regime` | 1,080,000 bytes |

Use the bundle treemap/import graph to trace why the approximately 89 KB `forms` chunk and other widget chunks load on every sampled public route. Remove an eager edge only when the owning feature remains available through a lazy import and focused E2E coverage proves it.

- [ ] **Step 7: Run the module-preload experiment**

Preserve the existing unrelated Safari target changes in `vite.config.ts`.

Compare:

1. Current `resolveDependencies: () => []`.
2. A narrow allowlist for the entry's static shared chunks only.

For each configuration, run three cold mobile samples on `/` and `/services`. Keep the narrow allowlist only if:

- median LCP improves by at least 100 ms on either route without regressing the other by more than 100 ms
- entry raw size remains at or below 330 KB
- public route JavaScript payload does not increase by more than 5%

Otherwise retain `resolveDependencies: () => []`.

- [ ] **Step 8: Extend size reporting**

Update `scripts/check-size-budget.ts` to print:

- total CSS raw bytes
- largest CSS raw bytes
- HTML total bytes
- top five largest public artifacts

Keep total JS gzip as a warning. Do not hard-fail the sum of all lazy-route JS.

- [ ] **Step 9: Verify the performance slice**

```powershell
npm.cmd run optimize:public-assets
npm.cmd run build
npm.cmd run check:size
npm.cmd run test:e2e -- tests/e2e/public-network-budget.spec.ts
```

Then use two terminals for the local Core Web Vitals sample:

```powershell
# Terminal A
npm.cmd run start

# Terminal B
npm.cmd run check:core-web-vitals -- http://127.0.0.1:5000
```

Stop the production server after the samples complete.

Expected:

- `content-context.json` exists in `dist/meta`, not `dist/public`.
- `og-default.png` is below 100 KB and remains 1200x630.
- No Google Fonts request occurs.
- No anonymous public route fetches the Supabase chunk.
- `dist/public` is below 10 MB even after adding the self-hosted variable font.

- [ ] **Step 10: Commit the slice**

```powershell
git add scripts client/index.html client/src/index.css client/src/utils/performance-hints.ts client/src/utils/performance-monitor.ts client/src/utils/performance-utils.ts client/public/fonts client/public/og-default.png tests/e2e/public-network-budget.spec.ts vite.config.ts package.json
git commit -m "perf: reduce public critical path and artifact weight"
```

---

### Task 6: Run The Visual Error Sweep And Fix Route-Level Drift

**PR slice:** 6
**Risk:** Medium, route-level visual changes
**Files:**
- Create: `tests/e2e/design-system-visual-sweep.spec.ts`
- Modify: only route/component files where the visual sweep proves a defect
- Modify: `docs/DESIGN_SYSTEM.md` only if a page-archetype rule is clarified

- [ ] **Step 1: Add the visual-sweep artifact spec**

The spec must run under existing desktop and mobile Playwright projects and save screenshots with `testInfo.outputPath(...)`, not commit snapshots.

Public route set:

```ts
[
  "/",
  "/services",
  "/pricing",
  "/calculators",
  "/calculators/tax-regime",
  "/blog",
  "/blog/when-will-itr-filing-start-ay-2026-27",
  "/which-itr-form-to-file",
  "/auth/login",
  "/documents/generator",
  "/expert-consultation",
]
```

Authenticated `/dashboard` screenshots run only when live test credentials are available, matching `tests/e2e/live-role-smoke.spec.ts`. Missing credentials must skip, not fail.

- [ ] **Step 2: Add deterministic semantic-surface checks**

- On `/`, open the global search with `Control+K`; assert the command surface background is not transparent and screenshot it.
- On `/calculators/tax-regime`, open the assessment-year Select; assert the content surface background is not transparent and screenshot it.
- On `/calculators/tax-regime`, trigger the existing invalid-input destructive toast; assert the toast has a non-transparent background and screenshot it.
- Tab through visible header, first CTA, and footer link; assert the focused element has the canonical 2px outline and 2px offset.

- [ ] **Step 3: Add layout invariants**

For every route and viewport:

- no horizontal overflow beyond 2px
- no ordinary control/card child radius greater than its immediate visible card/dialog parent; exclude pills, badges, and circular icon controls
- no static Card transform on hover
- no transparent popover/dialog/select/command/toast surface
- no route-load app error

Reuse helpers from `tests/e2e/release-smoke.spec.ts` instead of duplicating them. Extract shared helpers into `tests/e2e/helpers/layout.ts` only if both specs consume them in the same slice.

- [ ] **Step 4: Review route archetypes before changing widths**

Use:

- `max-w-7xl` for broad marketing/service grids
- `max-w-5xl` or `max-w-4xl` for reading-heavy article/legal content
- form/workspace widths owned by their existing shells

Fix only proven sibling-page jumps. Do not replace every `max-w-*` class globally.

- [ ] **Step 5: Review radii and gradients**

- Reserve `rounded-3xl` for true marketing hero panels.
- Keep `rounded-2xl` for dialogs/hero panels, `rounded-xl` for cards, and `rounded-lg` for controls.
- Flatten decorative gradients only where the visual sweep shows inconsistency or weak readability.
- Preserve purposeful hero/CTA gradients and all copy.

- [ ] **Step 6: Run visual and functional verification**

```powershell
npm.cmd run build
npm.cmd run test:e2e -- tests/e2e/design-system-visual-sweep.spec.ts
npm.cmd run test:e2e -- tests/e2e/release-smoke.spec.ts tests/e2e/route-transition-overlay.spec.ts
npm.cmd run check:typography
npm.cmd run check:static-seo
```

Expected:

- Artifact screenshots exist under Playwright test output for every public route/project.
- Command, Select, and Toast surfaces are opaque.
- Focus treatment is consistent.
- No static card lifts.
- Route transition overlay behavior remains intact.

- [ ] **Step 7: Commit the slice**

```powershell
git add tests/e2e client/src docs/DESIGN_SYSTEM.md
git commit -m "fix: resolve visual consistency sweep findings"
```

---

### Task 7: Ratchet Budgets And Close Documentation

**PR slice:** 7
**Risk:** Low, guardrails
**Files:**
- Modify: `scripts/check-size-budget.ts`
- Modify: `scripts/check-design-class-usage.ts`
- Modify: `package.json`
- Modify: `docs/DESIGN_SYSTEM.md`
- Modify: `docs/codex-speed-visual-overhaul.md`

- [ ] **Step 1: Record final measured baselines**

After Task 6, record:

- `dist/public` total
- total and largest CSS raw
- main entry raw/gzip
- total JavaScript gzip trend
- per-route public JavaScript payload
- LCP, CLS, and synthetic INP for the selected public routes

- [ ] **Step 2: Add hard budgets only with headroom**

Use these final requirements:

- `dist/public` hard limit: 10 MB
- largest JS raw hard limit: 350 KB
- no PDFs in `dist/public`
- `content-context.json` forbidden in `dist/public`
- `og-default.png` hard limit: 100 KB
- CSS target: 250 KB raw
- CSS hard limit: the achieved post-cleanup value plus 10 KB, never above 280 KB
- total JS gzip remains a warning/trend metric
- per-route anonymous JavaScript budgets are hard limits from Task 5

- [ ] **Step 3: Make the design-system gate complete**

`npm.cmd run check:design-system` must run:

1. source class/token guard
2. built semantic color guard
3. focused design-system unit tests

- [ ] **Step 4: Update the audit contract with outcomes**

Append an implementation-results section to `docs/codex-speed-visual-overhaul.md` containing:

- completed slice/commit list
- baseline and final metrics
- retained exceptions with reasons
- module-preload experiment decision and numbers
- any route-level issue deliberately left unchanged

Do not rewrite or erase the original audit findings.

- [ ] **Step 5: Run the final verification matrix**

```powershell
npm.cmd run check
npm.cmd run test:unit
npm.cmd run build
npm.cmd run check:design-system
npm.cmd run check:size
npm.cmd run check:typography
npm.cmd run check:static-seo
npm.cmd run test:e2e -- tests/e2e/public-network-budget.spec.ts tests/e2e/design-system-visual-sweep.spec.ts tests/e2e/release-smoke.spec.ts tests/e2e/route-transition-overlay.spec.ts
git diff --check
```

Expected:

- Every command passes.
- `dist/public` is below 10 MB.
- Built raw-HSL semantic declaration count is zero.
- Client source contains no gray neutral classes, dark variants, legacy brand aliases, or exact legacy primary hex.
- Public routes do not fetch Google Fonts or Supabase.
- Static SEO remains unchanged semantically.

- [ ] **Step 6: Run code and security review before final save**

Review specifically for:

- unintended copy/route/SEO changes
- missing `rel`, CSP, or font licensing issues
- unsafe temporary-file handling in the image optimizer
- accidental edits to unrelated dirty files
- widened public deployment contents

- [ ] **Step 7: Commit the final guardrail slice**

```powershell
git add scripts package.json docs/DESIGN_SYSTEM.md docs/codex-speed-visual-overhaul.md
git commit -m "chore: ratchet design and performance budgets"
```

## Rollback Rules

- If semantic token repair creates unreadable surfaces, fix the semantic value or primitive in the same slice; do not restore invalid bare `var()` declarations.
- If the gray-to-slate migration changes behavior or copy, revert only the affected mechanical hunk and reapply a class-only change.
- If self-hosting Inter regresses median LCP by more than 100 ms, verify preload/cache behavior first; restore external loading only with recorded evidence.
- If module-preload allowlisting fails the Task 5 thresholds, retain the current empty dependency list.
- If a budget can only be met by removing used features, stop and report the measured blocker instead of deleting functionality.
- If a visual fix requires route, copy, or SEO metadata changes, leave it out of this overhaul and record it as a follow-up.

## Completion Definition

This overhaul is complete only when:

1. The semantic Tailwind pipeline emits valid alpha-capable colors.
2. One documented light-theme token system owns colors, focus, radius, and motion.
3. Shared primitives enforce the system without default hover lift.
4. Client source no longer carries the competing gray ramp, dark variants, legacy aliases, or exact primary hex.
5. `dist/public` passes the 10 MB budget after fonts are self-hosted.
6. Public-route network tests prove Google Fonts and Supabase are absent.
7. Visual sweep artifacts and layout assertions pass on mobile and desktop.
8. TypeScript, unit, build, typography, static SEO, size, design-system, and focused E2E gates all pass.
