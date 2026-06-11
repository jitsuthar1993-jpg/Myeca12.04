# MyeCA.in — Speed & Visual Consistency Overhaul (Plan + Codex Prompt)

> Audit date: 2026-06-11 · Branch baseline: `codex/production-pwa-conversion`
> Companion docs: `docs/DESIGN_SYSTEM.md`, `docs/THEMING_GUIDE.md`, `docs/SITE_AUDIT.md`
> Ready-to-paste agent prompt: see **Section 9** at the bottom of this file.

---

## 1. Why this plan exists

The app is architecturally healthy (157 lazy routes, manual vendor chunks, PWA precache,
framer-motion-lite alias, console stripping) but it has accumulated **three competing design
systems**, a **silently broken token pipeline**, and a **failing size budget**. The result is a
site that mostly looks fine but is inconsistent page-to-page, carries dead CSS weight, and has a
class of subtle visual bugs (transparent surfaces, wrong text colors, invisible fills) that are
invisible in code review because the CSS fails silently.

The baseline and final measurements below were captured from their respective `dist/` build
outputs; file paths and numbers are real, not estimates.

---

## 2. Measured baseline (2026-06-11)

| Metric | Current | Source |
|---|---|---|
| `dist/public` total | **10.80 MB / 1030 files — FAILS 10 MB budget** | `npm run check:size` |
| Total JS (gzip) | **1.28 MB across 365 files — over 1.10 MB target** (hard fail at 1.5 MB) | `npm run check:size` |
| Entry chunk `index-*.js` | 324 KB raw / 91.5 KB gz (budget: largest chunk < 350 KB raw) | dist inspection |
| `supabase-*.js` | 199 KB raw / 51 KB gz | dist inspection |
| `react-vendor-*.js` | 140 KB raw / 44.8 KB gz | dist inspection |
| Single CSS bundle | **306 KB raw / 43.8 KB gz — every route pays it, render-blocking** | dist inspection |
| `icons-*.js` (lucide) | 88 KB raw / 15.9 KB gz | dist inspection |
| Prerendered SEO HTML | 407 files in dist | dist inspection |
| `content-context.json` | **580 KB shipped in dist — only consumed by build scripts** | grep: only `scripts/*` read it |
| `og-default.png` | 332 KB (social card only, uncompressed) | `client/public/` |
| Webfont loading | Render-blocking Google Fonts CSS (2 cross-origin round trips on the critical path) | `client/index.html:60-67` |
| Typography audit | Passes for 173 migrated files (remainder allowlisted, not covered) | `npm run check:typography` |

### Consistency baseline (grep counts across `client/src`)

| Signal | Count | Meaning |
|---|---|---|
| Files using `text-gray-*` | 121 | Two neutral ramps used interchangeably — |
| Files using `text-slate-*` | 156 | gray vs slate differ in hue temperature, visible side-by-side |
| Files using `text-muted-foreground` | 19 | Third (semantic) system — currently **broken**, see §3.1 |
| `rounded-lg` / `rounded-xl` / `rounded-2xl` / `rounded-3xl` / `rounded-card` | 755 / 304 / 321 / 53 / 8 | No radius hierarchy; `rounded-card` (24px) is documented as "the standard" but has 8 usages |
| `bg-gradient-to-*` in pages | 143 | Gradient sprawl on a brand that `design-tokens.css` itself says should be "solid navy for trust" |
| `max-w-7xl` / `max-w-6xl` / `max-w-5xl` | 163 / 24 / 29 | Container width drift between sibling pages |
| Hardcoded `#315efb` in pages | 81 | Brand color as arbitrary value instead of token |

---

## 3. Findings (ranked)

### 3.1 — P0 · The semantic token pipeline is silently broken (~234 usages no-op)

`tailwind.config.ts` maps every shadcn-style color **without the `hsl()` wrapper**:

```ts
// tailwind.config.ts (current — broken)
background: "var(--background)",
primary: { DEFAULT: "var(--primary)", ... },
muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
```

…while `client/src/index.css:60-121` defines those variables as **raw HSL triples**:

```css
--primary: 219 100% 26%;   /* not a valid CSS color value by itself */
--popover: 0 0% 100%;
```

The compiled output proves it (`dist/public/assets/index-*.css`):

```css
.bg-popover{background-color:var(--popover)}        /* resolves to "0 0% 100%" → invalid → dropped */
.bg-primary{background-color:var(--primary)}        /* same */
.text-muted-foreground{color:var(--muted-foreground)}
```

Every `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-accent`, `bg-primary`,
`text-foreground`, `text-muted-foreground`, `border-border`, etc. **silently does nothing**
(~234 usages in `.tsx` files). The app survives only because most `components/ui/*` primitives
were hand-patched to `bg-white` / `border-slate-200`. Real symptoms still in the wild:

- `components/ui/command.tsx` uses `bg-popover text-popover-foreground` → the **Ctrl+K global
  search palette renders on a transparent surface**.
- ~15 `bg-primary` + ~10 `bg-primary/...` usages → invisible fills/tints wherever they appear.
- `text-muted-foreground` (19 files) inherits the parent color instead of muting.
- Opacity-modifier forms (`bg-primary/10`, `border-primary/20`) can never work with an
  unparseable color.

**Fix direction:** wrap every semantic color in `tailwind.config.ts` as
`hsl(var(--X) / <alpha-value>)`. Do **not** instead rewrite the CSS vars to hex — the
`<alpha-value>` form keeps `/opacity` modifiers working and is the standard shadcn contract.

### 3.2 — P0 · Four competing definitions of the primary brand color

| Where | Value | Actual color |
|---|---|---|
| `tailwind.config.ts` `brand.DEFAULT`, `cta-primary`; `button.tsx` hardcoded | `#315efb` | Bright blue (the real brand) |
| `client/src/index.css:79` `--primary` | `219 100% 26%` (comment claims `#315efb`) | **≈ `#003585` dark navy — the comment is wrong** |
| `docs/THEMING_GUIDE.md` | `#3B82F6`, `--primary: 217 91% 60%` | Tailwind blue-500 |
| `tailwind.config.ts` `brand.500` | `#0646b2` | Darker than `brand.600` (`#315efb`) — **the scale is non-monotonic** |

Also: `--accent: 217 91% 60%` (blue-500) vs `--color-accent-teal: #0F766E` (teal) in
`design-tokens.css` — "accent" means two unrelated colors depending on which file you read.

**Fix direction:** declare `#315efb` (= `hsl(227 96% 59%)`) the single primary. Fix
`--primary` in `index.css`, rebuild the `brand` scale monotonically around it, update both
docs, and delete the `navy`/`cta-primary`/`primary-hover` aliases in favor of `brand-*`.

### 3.3 — P1 · Two parallel token systems + dead dark mode shipped to every visitor

- `client/src/styles/design-tokens.css` (hex `--color-*` system, v3.0) **and**
  `client/src/index.css` `:root` (shadcn HSL system) both claim to be the source of truth;
  `docs/DESIGN_SYSTEM.md` points to the former, the Tailwind config consumes the latter.
- `index.css:123` says "Dark mode removed — light theme only", yet `design-tokens.css:197-257`
  ships a full `.dark` block (~100 lines), `tailwind.config.ts` keeps `darkMode: ["class"]`,
  and `.dark .glass` etc. ride along in every page load. Dead weight + contradictory intent.
- Duplicated blocks: two identical `@media (prefers-reduced-motion: reduce)` rules
  (`design-tokens.css:300` and `:679`), duplicated "Header Layout Variables" comment block
  (`index.css:49-50`), and **three different focus-ring treatments** (`index.css:41-45`
  2px blue outline, `design-tokens.css:283-285` 3px `rgba(0,48,135,.55)` outline,
  `button.tsx` `focus-visible:ring-2 ring-brand-500`).
- Header geometry drift: `--header-main-height: 64px/72px` in `index.css` vs the real header
  `h-[60px] md:h-[74px]` in `App.tsx:44/137` — the CSS vars lie to anyone who uses them.

### 3.4 — P1 · Core primitives bypass the system they anchor

`components/ui/button.tsx`: `default` and `primary` variants are duplicates using arbitrary
`bg-[#315efb] hover:bg-[#2040d8]`; `outline`/`glass` use **slate** neutrals while
`secondary`/`ghost` use **gray** neutrals in the same file; every variant applies
`hover:-translate-y-0.5`, so all buttons everywhere bounce.

`components/ui/card.tsx`: default Card ships `hover:shadow-xl hover:-translate-y-1` — every
card lifts, including static informational ones; premium variant hardcodes
`border-[#315efb]/20 shadow-[#315efb]/10`; radius is `rounded-card` (24px) while the app's
dominant radius is `rounded-lg` (755 usages).

**Fix direction:** primitives consume tokens only (`bg-brand-600`/`bg-primary` once tokens
work); motion becomes opt-in (`interactive` prop or variant), not default; one neutral ramp.

### 3.5 — P1 · Render-blocking webfont chain (LCP tax on every cold visit)

`client/index.html:66` loads `fonts.googleapis.com/css2?family=Inter...` as a blocking
stylesheet: DNS+TLS to `fonts.googleapis.com`, then DNS+TLS to `fonts.gstatic.com`, before
first render on cold visits. Self-hosting Inter (woff2, latin subset, weights 400/500/600/700,
`font-display: swap`, `<link rel="preload">` for the 400/600 cuts) removes two cross-origin
round trips from the critical path and makes font caching owned by the SW (`myeca-fonts`
runtime cache already exists in `vite.config.ts`).

### 3.6 — P2 · Bundle/budget violations

- `check:size` currently **fails** (10.80 MB > 10 MB) and warns on JS (1.28 MB gz > 1.10 MB).
- Quick wins: stop emitting `content-context.json` (580 KB, build-script-only) into
  `dist/public`; compress `og-default.png` (332 KB → ~60-80 KB); audit the 407 prerendered
  HTML shells for shared inline-CSS duplication.
- The 306 KB raw CSS bundle is inflated by arbitrary-value classes (81× `#315efb` variants,
  `shadow-[...]`, `tracking-[0.16em]`, per-page one-offs). Token consolidation shrinks it
  naturally; target ≤ 250 KB raw without dropping any used styles.
- Entry chunk 324 KB raw is within budget but close (350 KB); after the gray→slate sweep and
  token work, re-check; do not let it regress.
- Verify (network tab) that the 199 KB supabase chunk is **not** fetched for anonymous
  visitors on public pages — `lib/authToken.ts:47` imports it dynamically, which is correct,
  but confirm no other startup path pulls it eagerly.

### 3.7 — P2 · Page-level visual error hunt list

Concrete, checkable defects to sweep for (these are the "visual errors we are looking for"):

1. **Transparent surfaces** — any popover/dropdown/sheet content where text floats over the
   page (search for remaining `bg-popover`, `bg-card`, `bg-background` consumers; fixed
   automatically by §3.1 but must be visually confirmed: command palette, select menus,
   date pickers, tooltips, toasts).
2. **Invisible/wrong fills** — `bg-primary`, `bg-primary/10` badges, progress bars, avatars.
3. **Muted text not muted** — `text-muted-foreground` blocks rendering full-contrast.
4. **Focus rings** — tab through header → hero CTA → footer on 3 key pages; ring must be one
   consistent style (color, width, offset) after §3.3.
5. **Header spacer mismatch** — `App.tsx` spacer `h-[60px] md:h-[74px]` must exactly match the
   rendered `Header` height in both breakpoints (no 1-14px jump when the lazy Header swaps in
   over `HeaderLoadingShell`).
6. **Hover motion noise** — static info cards lifting/bouncing (post §3.4, motion only on
   genuinely clickable cards).
7. **Neutral mismatch seams** — sections where `gray-50` panels sit next to `slate-50` panels
   (subtly different temperature), most likely on `home`, `services`, `pricing`, `calculators`.
8. **Container width jumps** — navigating between sibling marketing pages shifts the content
   column (`max-w-7xl` vs `max-w-6xl`); standardize per page archetype, not per page.
9. **Radius clashes** — 24px-radius cards containing 8px-radius inputs/buttons inside 12px
   parents; after the radius scale lands, inner radius ≤ outer radius everywhere.
10. **CLS during route transitions** — `RouteProgressOverlay` + `PageSkeleton` swap; skeletons
    must reserve the same vertical space as the loaded content's above-the-fold block.
11. **Gradient sprawl** — 143 gradients in pages; keep hero/CTA gradients, flatten decorative
    ones per the design system's own "solid navy for trust" rule.
12. **Scrollbar double-styling** — global `::-webkit-scrollbar` (8px, gray) vs any per-page
    overrides; `overflow-x: clip` on both `html` and `body` should be verified to not clip
    sticky positioning anywhere.

---

## 4. Target state

1. **One token pipeline**: Tailwind semantic classes compile to valid `hsl(var(--X) / α)`
   colors; built CSS contains zero `background-color:var(--popover)`-style invalid declarations.
2. **One brand system**: `#315efb` primary everywhere; monotonic `brand-50…900`; one neutral
   ramp (**slate**, since it dominates 156:121 and suits a financial brand); semantic
   success/warning/error/info; teal demoted or formally adopted as the single accent.
3. **One radius scale**: `lg` (inputs/buttons) · `xl` (cards) · `2xl` (modals/heroes) ·
   `full` (pills). `rounded-card` redefined to match the chosen card radius, `rounded-3xl`
   reserved for marketing heroes.
4. **Primitives enforce the system**: Button/Card/Badge/Input variants are token-only; no
   arbitrary hex in `components/ui/*`; motion opt-in.
5. **Budgets pass and tighten**: dist ≤ 10 MB pass, JS gz ≤ 1.10 MB (then ratchet to 1.0),
   CSS ≤ 250 KB raw, entry < 320 KB raw, fonts self-hosted, no supabase fetch for anonymous
   public visits.
6. **Docs converge**: `DESIGN_SYSTEM.md` + `THEMING_GUIDE.md` updated to describe the single
   real system (or THEMING_GUIDE merged into DESIGN_SYSTEM and deleted).

Lab targets (use `npm run check:core-web-vitals` + Lighthouse on built preview, mobile
throttling): LCP ≤ 2.5 s, CLS ≤ 0.05, INP ≤ 200 ms, TBT ≤ 200 ms on `/`, `/services`,
`/pricing`, one blog article, one calculator.

---

## 5. Workstreams

### WS-A · Token pipeline repair (P0 — do first, smallest diff, biggest correctness win)
1. In `tailwind.config.ts`, wrap all semantic colors: `"hsl(var(--background) / <alpha-value>)"`
   etc. (background, foreground, card, popover, primary, secondary, muted, accent,
   destructive, border, input, ring, chart-1…5, sidebar-*).
2. Fix `--primary: 227 96% 59%` (true `#315efb`) and correct the stale comments in
   `index.css`; align `--ring` with it.
3. Verify in built CSS: `grep "var(--popover)" dist/public/assets/*.css` must only appear
   wrapped in `hsl(`.
4. Visually verify the command palette (Ctrl+K), selects, tooltips, toasts — before/after
   screenshots.

### WS-B · Single source of truth (P0/P1)
1. Decide: `index.css :root` HSL block is the runtime source of truth (it's what Tailwind
   consumes). `design-tokens.css` keeps only tokens actually referenced by CSS/utilities;
   delete the `.dark` block, duplicate reduced-motion block, and unused scales; set
   `darkMode` strategy consciously (keep `["class"]` but document "not enabled").
4. Collapse the three focus-ring styles into one (recommend: 2px ring `brand-600`, offset 2,
   via Tailwind `ring` token) applied through `:focus-visible` only.
5. Rebuild `brand` scale monotonic around `#315efb`; remove `navy`, `cta-primary`,
   `primary-hover` aliases (migrate usages).
6. Sync `--header-*` CSS vars with the real `h-[60px] md:h-[74px]` header (or migrate header
   heights to consume the vars — one owner).
7. Update `docs/DESIGN_SYSTEM.md` + `docs/THEMING_GUIDE.md` to match reality; one doc wins.

### WS-C · Primitive normalization (P1)
1. `button.tsx`: merge `default`+`primary` into one token-driven variant
   (`bg-brand-600 hover:bg-brand-700`); all neutrals → slate; `hover:-translate-y-0.5`
   removed from base variants (keep on explicitly marketing-flavored variants only);
   focus ring per WS-B.
2. `card.tsx`: default = static (`shadow-sm`, `border-slate-200`, radius `xl`); add
   `interactive` variant carrying hover lift; premium variant uses `brand-*` tokens.
3. `badge`, `input`, `select`, `tabs`, `dialog`: sweep for gray↔slate mixing and arbitrary hex.
4. Codemod sweep in `client/src` (pages + components): `text-gray-X` → `text-slate-X`,
   `bg-gray-X` → `bg-slate-X`, `border-gray-X` → `border-slate-X` (mechanical 1:1 shade map),
   except places intentionally using `--color-gray-*` CSS vars. Run visual spot-checks —
   slate is slightly cooler; headings `text-gray-900` → `text-slate-900` is safe.
5. Replace the 81 page-level `#315efb` arbitrary values with `brand-600` classes.

### WS-D · Speed: critical path (P1)
1. Self-host Inter per §3.5 (download woff2 latin subsets into `client/public/fonts/`,
   `@font-face` in `index.css` or a tiny `fonts.css`, preload 400+600, delete the two
   Google Fonts `<link>`s and the `preconnect`s; keep `font-display: swap`).
2. Remove `content-context.json` from the publish output (move to `dist/meta/` or exclude in
   the build script `scripts/build-production.ts`); recompress `og-default.png` (sharp is
   already a dependency).
3. Confirm anonymous public pages never fetch `supabase-*.js`; if they do, trace and break the
   eager edge (only `auth/callback`, `dashboard/account`, `settings/account` import it
   statically today — keep it that way).
4. Re-examine `modulePreload.resolveDependencies: () => []` — instead of "none", allow
   preloads for the entry's own static imports (react-vendor, app-vendor, icons) so the
   browser doesn't discover them in waterfall; measure before/after on a cold throttled load.
5. After WS-C, re-run CSS size; chase remaining arbitrary-value hot spots
   (`grep -oE "\\[(#|0\\.|[0-9])" -r client/src --include="*.tsx"` style sweep).

### WS-E · Visual error sweep + regression harness (P1, continuous)
1. Walk the §3.7 hunt list on: `/`, `/services`, `/pricing`, `/calculators` (hub + one
   calculator), `/blog` (hub + one article), `/which-itr-form-to-file`, `/login`,
   `/dashboard` (authed), `/documents/generator`, `/expert-consultation` — at 390 px and
   1440 px, plus one mid 768 px pass.
2. Add a Playwright visual-sweep spec (screenshots into `test-results/visual-sweep/`) for
   those routes; not pixel-diff CI (flaky), but artifact screenshots reviewed per PR.
3. Re-run `npm run check:typography` and extend coverage by migrating files off the allowlist
   in `scripts/check-typography.ts` as pages are touched.

### WS-F · Budget ratchet + guardrails (P2, last)
1. Make `npm run check:size` pass; then tighten: `jsGzipTargetBytes` 1.0 MB,
   add `cssRawBytes ≤ 250 KB` and `largestCssRawBytes` to `scripts/check-size-budget.ts`.
2. Add a tiny CI/grep check that fails if built CSS contains `:var(--` color declarations
   outside `hsl(`/`calc(` (prevents §3.1 from regressing).
3. Optional: add a `check:tokens` script forbidding new `#315efb`-style hex literals in
   `client/src/**/*.tsx` outside `components/ui/`.

---

## 6. Sequencing & PR slicing

| PR | Content | Risk | Gate |
|---|---|---|---|
| 1 | WS-A (token pipeline) + `--primary` fix | Low — additive correctness | build + built-CSS grep + screenshots of palette/selects/toasts |
| 2 | WS-B (source of truth, dead dark-mode removal, focus ring, docs) | Low | build + `check:size` delta + tab-through focus screenshots |
| 3 | WS-C steps 1–3 (primitives) | Medium — touches every button/card | screenshot sweep of 12 key routes, both breakpoints |
| 4 | WS-C steps 4–5 (gray→slate codemod + hex sweep) | Medium-wide/shallow | mechanical diff review + visual sweep |
| 5 | WS-D (fonts, dist hygiene, preload tuning) | Low | Lighthouse before/after, `check:size` PASS, network-tab proof for supabase |
| 6 | WS-E harness + remaining §3.7 fixes | Low | Playwright artifacts |
| 7 | WS-F ratchet | Low | CI green |

Rules: never mix the codemod PR with hand-edited logic changes; every PR runs
`npm run check` (tsc), `npm run test:unit`, `npm run build`, `npm run check:size`,
`npm run check:typography`; no copy/content changes anywhere in this effort (SEO-sensitive);
do not touch the 407 prerendered SEO shells' markup semantics (`scripts/validate-static-seo.ts`
must keep passing — `npm run check:static-seo`).

---

## 7. Verification command reference

```bash
npm run dev                  # local dev (Express on :3001 + Vite; Windows-style env scripts)
npm run build                # production build via scripts/build-production.ts
npm run check                # tsc
npm run test:unit            # vitest
npm run test:e2e             # builds + playwright
npm run check:size           # size budgets (currently FAILING — must pass by PR 5)
npm run check:typography     # typography audit (must stay green, expand coverage)
npm run check:static-seo     # prerendered SEO shells intact
npm run check:core-web-vitals
npm run analyze              # ANALYZE_BUNDLE=1 build → dist/bundle-stats.html treemap
```

Built-CSS regression grep (must return nothing):

```bash
grep -oE "(color|background-color|border-color|fill|stroke):var\(--" dist/public/assets/*.css
```

---

## 8. Explicit non-goals

- No dark mode implementation (delete dead dark CSS; keep the Tailwind `class` strategy dormant).
- No copy, content, route, or SEO metadata changes.
- No framework or dependency swaps (no Tailwind v4 migration, no router change) in this effort.
- No redesign — this is convergence and repair, not a new visual language.

---

## 9. Codex prompt (copy-paste from the next line to the end of the code block)

```text
You are working in the MyeCA.in repository (Vite + React 18 + TypeScript + Tailwind 3 +
Radix/shadcn-style UI, wouter routing, Express server, Vercel deploy, Windows dev machines —
npm scripts use `set X=…&&` syntax; do not "fix" them to bash syntax).

MISSION
Execute the performance + visual-consistency overhaul specified in
docs/codex-speed-visual-overhaul.md. Read that file first and treat it as the contract: it
contains the measured baseline, ranked findings with exact file/line references, workstreams
WS-A…WS-F, PR slicing, and verification gates. Work strictly in that order. Deliver each PR
slice as an isolated, reviewable change set with its gate evidence.

THE HEADLINE BUG (fix first, everything else builds on it)
tailwind.config.ts maps semantic colors as plain `var(--primary)` etc., while
client/src/index.css defines those variables as raw HSL triples (`--primary: 219 100% 26%`).
The compiled CSS therefore emits invalid declarations like
`.bg-popover{background-color:var(--popover)}` and ~234 semantic utility usages
(bg-card, bg-popover, bg-primary, text-muted-foreground, border-border, …) silently no-op.
Fix by wrapping every semantic color in tailwind.config.ts as
`hsl(var(--X) / <alpha-value>)`, and correct `--primary` to `227 96% 59%` (the true #315efb —
the current value renders ≈#003585 and its comment is wrong). Prove the fix by grepping the
built CSS: `(color|background-color|border-color):var\(--` must have zero matches, and by
screenshotting the Ctrl+K command palette, a Select dropdown, a tooltip, and a toast.

CANONICAL DESIGN DECISIONS (already made — do not re-litigate)
- Primary brand: #315efb everywhere. Rebuild the Tailwind `brand` scale monotonic around it
  (brand-500 is currently #0646b2, darker than brand-600 — broken). Remove `navy`,
  `cta-primary`, `primary-hover` aliases and migrate their usages.
- One neutral ramp: slate. Codemod gray-→slate- (text/bg/border/divide/ring, 1:1 shade map)
  across client/src pages and components; components/ui/button.tsx and card.tsx must end up
  token-only (no bg-[#315efb] arbitrary values anywhere in components/ui).
- Radius scale: lg = inputs/buttons, xl = cards, 2xl = modals/heroes, full = pills.
  Redefine `rounded-card` in tailwind.config.ts to the card radius (xl) instead of 24px.
- Motion: hover lift (-translate-y) is opt-in. Strip it from Button base variants and from
  the default Card; add an `interactive` Card variant that carries it.
- Focus: exactly one focus-visible treatment app-wide (2px brand-600 ring, offset 2).
  Today there are three competing styles (index.css:41, design-tokens.css:283, button.tsx cva).
- Light theme only: delete the `.dark` token block in design-tokens.css (~100 dead lines),
  the duplicate prefers-reduced-motion block, and reconcile the duplicated :root sections.
  index.css :root is the single runtime token source; design-tokens.css keeps only what is
  actually referenced; update docs/DESIGN_SYSTEM.md and docs/THEMING_GUIDE.md to match
  reality (today they contradict each other AND the code: #3B82F6 vs #315efb).

PERFORMANCE TASKS (after the visual-correctness PRs)
1. Self-host Inter: woff2 latin subsets, weights 400/500/600/700, @font-face with
   font-display swap, preload 400+600, then remove the render-blocking Google Fonts
   stylesheet and both font preconnects from client/index.html. The SW already has a
   `myeca-fonts` CacheFirst route — keep filenames stable.
2. Stop shipping content-context.json (580 KB, only build scripts read it) inside
   dist/public; adjust scripts/build-production.ts and any script paths that consume it.
   Recompress og-default.png (332 KB → well under 100 KB; sharp is already a dependency).
3. npm run check:size currently FAILS (dist/public 10.80 MB > 10 MB budget) and warns on JS
   (1.28 MB gz > 1.10 MB target). It must PASS by the end of the perf slice. The 306 KB raw
   single CSS bundle should fall to ≤ 250 KB naturally from the token/codemod work — verify,
   and chase remaining arbitrary-value hot spots if not.
4. Verify with the network panel that anonymous visits to public pages never download the
   199 KB supabase chunk (lib/authToken.ts imports it dynamically — keep that lazy edge).
5. Reconsider modulePreload.resolveDependencies (currently returns [] for everything):
   allow preloading only the entry's static imports (react-vendor, app-vendor, icons) and
   measure a cold throttled load before/after; keep whichever is faster and note the numbers.

VISUAL ERROR HUNT (sweep these routes at 390 px and 1440 px: /, /services, /pricing,
/calculators + one calculator, /blog + one article, /which-itr-form-to-file, /login,
/dashboard authed, /documents/generator, /expert-consultation)
Look specifically for: transparent popover/command/select surfaces; invisible bg-primary
fills and bg-primary/10 tints; text-muted-foreground rendering at full contrast; focus-ring
inconsistencies while tabbing; the lazy Header swapping in at a different height than the
h-[60px] md:h-[74px] spacer in App.tsx (also sync the stale --header-* vars in index.css);
static cards that lift on hover; gray-vs-slate seams between adjacent sections; container
width jumps between sibling pages (max-w-7xl vs 6xl); child radius exceeding parent radius;
skeleton/content height mismatch causing CLS on route transitions; decorative gradient
overuse (143 gradient usages — keep hero/CTA, flatten the rest per the design system's own
"solid navy for trust" rule). Fix what you find; screenshot before/after into
test-results/visual-sweep/.

HARD CONSTRAINTS
- No copy/content/route/SEO-metadata changes. npm run check:static-seo must stay green.
- Do not modify the 407 prerendered SEO HTML shells' semantics.
- No new dependencies beyond font files; no Tailwind 4 migration; no dark mode build-out.
- Keep changes sliced exactly as PR 1–7 in the plan doc; never mix the mechanical codemod
  with hand-edited logic in one commit.
- This codebase ships to production tax-filing users: when unsure whether a color/spacing
  change is "convergence" vs "redesign", choose the smaller change.

GATES FOR EVERY SLICE
npm run check && npm run test:unit && npm run build && npm run check:size &&
npm run check:typography && npm run check:static-seo
Plus per-slice evidence listed in section 6 of the plan doc (screenshots, built-CSS grep,
Lighthouse before/after for the perf slice, bundle treemap via npm run analyze when chunk
sizes change). Report each slice with: what changed, gate output, before/after numbers, and
any finding you chose NOT to fix (with reason).
```

---

## 10. Implementation results (2026-06-11)

The overhaul was implemented against the existing Vite/React/Tailwind stack without changing
public routes, copy, SEO metadata, or the prerendered shell semantics.

### Delivered

- Repaired the semantic color pipeline so Tailwind emits valid HSL colors with alpha support;
  the production build now audits every generated CSS asset for invalid direct `var(--token)`
  color declarations.
- Converged the app on the canonical light theme: `#315efb` primary, a monotonic brand scale,
  slate neutrals, one focus-visible treatment, shared radius rules, and opt-in hover lift.
- Normalized the shared button, card, badge, form, command, dialog, popover, tooltip, toast,
  tabs, and sheet primitives. Added focused primitive and token-contract tests.
- Migrated legacy gray/dark/alias classes and added a source audit to prevent their return.
- Removed the unused Tailwind Typography plugin and migrated article typography to the local
  semantic article style.
- Self-hosted Inter, removed Google Fonts and phantom preloads, compressed the default Open
  Graph image, and moved the build-only content context outside the public deployment.
- Added desktop/mobile public-route visual sweeps and anonymous-route network budgets,
  including opaque command/select/toast surfaces, canonical desktop keyboard focus, and a
  guard that public routes do not load Google Fonts or the lazy Supabase chunk.
- Split the homepage SEO record from the full route catalogue, removed automatic
  related-route background warming, and deferred the route-preload registry until actual
  hover/touch intent.

### Before and after

| Measure | Baseline | Final |
|---|---:|---:|
| `dist/public` | 10.80 MB | 9.92 MB |
| Total raw CSS | about 306 KB | 265.37 KB |
| Largest CSS asset | about 301.94 KB | 264.21 KB |
| Main entry | 323.74 KB | 200.60 KB raw / 64.09 KB gzip |
| `og-default.png` | 338,118 bytes | 89,245 bytes |
| Public `content-context.json` | 592,157 bytes | absent; generated under `dist/meta` |
| Self-hosted Inter variable font | none | 48,256 bytes |
| Total JavaScript gzip | 1.28 MB | 1.28 MB |

### Measured experiments

- Excluded test and spec sources from Tailwind content scanning, then removed production CSS
  rules and token definitions with no runtime consumers. This reduced raw CSS by another
  6.39 KB after the first overhaul pass without deleting used styling.
- Removing the shared Lucide `icons` chunk was rejected: total JavaScript gzip increased from
  1.28 MB to 1.34 MB, the main entry grew beyond its ceiling, and the build emitted hundreds
  of tiny icon chunks.
- Added `npm.cmd run benchmark:module-preload` for repeatable three-sample cold mobile
  comparisons under a throttled network and 4x CPU slowdown. The narrow entry-vendor
  allowlist improved median LCP from 1360 ms to 1320 ms on `/` and from 1332 ms to 1308 ms
  on `/services`, but neither improvement met the required 100 ms threshold. Production
  therefore continues to default to no module-preload dependencies.
- Splitting homepage SEO data reduced the main entry by 120.79 KB raw and 26.95 KB gzip.
  Removing app-wide related-route warming and deferring the route-preload registry reduced
  its cold bootstrap from 49.87 KB to 0.49 KB. Cold desktop decoded JavaScript measured
  797,345 bytes on `/`, 781,119 on `/services`, 786,420 on `/pricing`, 859,691 on `/blog`,
  and 880,560 on `/calculators/tax-regime`; route ceilings were tightened with headroom.

### Final verification

- `npm.cmd run check`: passed.
- `npm.cmd run test:unit`: passed, 134 files and 773 tests.
- `npm.cmd run check:design-system`: passed, including 10 focused tests, class audit,
  production build, and semantic-color audit across two generated CSS assets.
- `npm.cmd run check:size`: passed.
- `npm.cmd run check:typography`: passed for 173 migrated user-page files.
- `npm.cmd run check:static-seo`: passed for 7 routes and 230 MDX blog posts.
- Focused Playwright visual/network sweep passed with 45 passed and 3 skipped, including a
  deterministic mocked authenticated dashboard artifact at desktop and mobile sizes; the
  optional live-credential dashboard check remains available when credentials are supplied.
- `git diff --check`: passed; only existing Windows line-ending warnings were reported.

### Remaining measured gaps

- Raw CSS is below the new 275 KB hard ceiling but remains above the 250 KB stretch target.
- Total JavaScript gzip remains above the 1.10 MB warning target because the complete lazy
  route catalogue is counted. Cold public-route downloads are lower, route-level network
  budgets pass, and anonymous public routes do not fetch the lazy Supabase chunk.
- Live authenticated dashboard screenshots still require optional credentials, but deterministic
  mocked authenticated dashboard artifacts now run at both breakpoints. The mobile keyboard-focus
  assertion remains skipped because touch emulation does not produce reliable `:focus-visible`
  behavior; the desktop keyboard contract passes.
- The narrow module-preload allowlist did not meet the 100 ms median LCP improvement threshold,
  so the production default remains the empty dependency list.
