# ITR Income Modules — Codex Execution Plan

> **Mission:** extend the mobile ITR filing flow (`/itr/filing`) with deep, guided capture for **Salary**, **Business/Profession**, **House property**, **Capital gains**, and **Other sources** income — replacing today's single-total fields with itemized entry (multiple employers, presumptive schemes, per-property and per-asset detail) while keeping the existing quick-total path, the existing design system, and full backward compatibility with saved drafts.
>
> **Audience:** this document is written for an autonomous coding agent (Codex) executing without conversation context. Every work package lists exact files, contracts, acceptance criteria, and verification commands. Read §1 and §2 before writing any code.
>
> **Builds on:** `docs/MOBILE_ITR_FILING_PLAN.md` (pane architecture — already implemented and committed: `3482c83`, `b5b080b`). Do not re-implement anything from that plan.

---

## 0. Context primer (verify before starting)

- **Stack:** React 18 + Vite + TypeScript, wouter routing, TanStack Query, Tailwind + shadcn/ui, Zod. Tests: Vitest (`npm run test:unit`), typecheck (`npm run check`). No new dependencies allowed.
- **The flow:** `client/src/features/itr/pages/filing.page.tsx` renders 7 macro steps (owner → identity → income → documents → verify → compute → review). On mobile (< md) each step shows one *pane* at a time via `PaneRenderer`; pane definitions live in `client/src/features/itr/components/filing/panes.ts` (`getPanesForStep`). Desktop shows all panes of a step stacked.
- **The engine:** `shared/itr-filing.ts` is the single source of truth — Zod draft schema, `normalizeItrDraft`, `recommendItrForm` (ITR-1/2/3/4 + `CA_SCOPE_REVIEW`), `computeItrTaxLiability` (old/new regime, AY 2026-27 slabs, 87A rebate + marginal relief, special-rate buckets), `buildItrVerificationReport` (issues carry `paneId`/`fieldId` for deep links), `getItrDocumentChecklist`, `buildItrReviewPacket`.
- **Existing special-rate buckets** in `computeRegimeTax`: STCG @ 20% (111A), 112A LTCG above ₹1,25,000 @ 12.5%, `otherCapitalGains` @ 12.5%, `winningsOrSpecialRateIncome` @ 30%. Cess 4%. Standard deduction ₹75k (new) / ₹50k (old).
- **Income pane state today:** `income.selectedTypes` (array of `"salary" | "otherSources" | "houseProperty" | "capitalGains" | "business" | "foreign"`) drives which per-type panes render; each pane has 1–3 `CurrencyInput` totals only. `presumptiveScheme` exists in the schema (`none|44AD|44ADA|44AE`) but has **no UI**.
- **Existing guided UI kit** (`client/src/features/itr/components/filing/guided-filing-ui.tsx` + siblings): `CurrencyInput` (en-IN, `allowNegative`), `TextInput` (inputMode/autoComplete/error props), `ChoiceButton`, `ToggleRow`, `CollapsibleFlags`, `PaneRenderer`, `DocumentCaptureCard`, bottom sheets via `@/components/ui/sheet`.
- **Persistence:** drafts are a JSON blob (`formData`) on `/api/tax-returns` — `PATCH {draft}` with 700 ms debounce + localStorage mirror. **No server/DB migration is needed for new draft fields** (the blob is schema-validated client/shared-side by `normalizeItrDraft`).
- **Legacy components** `client/src/features/itr/components/{IncomeDetailsForm,BusinessIncomeForm,CapitalGainsForm,PersonalDetailsForm,DeductionsForm,TaxCalculationForm,ReviewAndSubmit,TaxSummaryDashboard}.tsx are **unused** (no importers). Do not extend them; do not delete them in these WPs.
- **Helper pages that feed this flow:** `/form16-parser` (`client/src/pages/form16-parser.page.tsx`, has `exportForm16ForITR`), `/capital-gains-import`, `/ais-viewer`. Handoff pattern to copy: `client/src/features/itr/lib/start-selector.ts` (`writeItrStartHandoff`/`readItrStartHandoff`/`clearItrStartHandoff`, sessionStorage + versioned payload).

**Sanity check before WP1:** run `npm run check && npm run test:unit` — must be green at baseline. Key test files that must stay green throughout: `client/src/features/itr/pages/filing.test.ts`, `client/src/features/itr/components/filing/panes.test.ts`, `client/src/features/itr/components/filing/PaneRenderer.test.tsx`, `client/src/lib/itr-filing.test.ts`, `shared`-level tests, `client/src/features/itr/lib/start-selector.test.ts`.

---

## 1. Non-negotiable invariants

1. **Additive schema only.** Every new field is optional-with-default in Zod. A draft saved before this work must pass `normalizeItrDraft` unchanged (same scalars in → same scalars out). Add a regression test that feeds a pre-change draft fixture and asserts deep equality of all pre-existing fields.
2. **Scalars stay the engine's interface.** `recommendItrForm`, `computeRegimeTax`, blockers, and the review packet keep consuming `income.salary`, `income.businessIncome`, etc. Detail objects roll up into those scalars inside `normalizeItrDraft`. Never make the engine read detail objects directly (exceptions explicitly listed in §3).
3. **Quick path survives.** Each module has `mode: "quick" | "itemized"`, default `"quick"`. Quick = today's behavior, scalar editable. Itemized = scalar becomes read-only rollup. Switching modes never destroys data (see §4.2).
4. **Estimates, not assessments.** All computed figures remain estimates pending CA review. Copy style: "Estimated", "applied during CA review". Never "final tax", never filing/assessment claims. Approximations must be surfaced via verification issues (severity `info`) or `unsupportedReasons` — listed per module in §3.
5. **Design system unchanged.** Reuse `MyeCard` regions, `ChoiceButton`, `ToggleRow`, `CurrencyInput`, `TextInput`, `StatusBadge`, `formatInr`, `Sheet side="bottom"` with `rounded-t-2xl`, blue-600 primary / emerald success / amber warning / red error, `type-meta` uppercase eyebrows, h-11 inputs, 44 px targets. No new colors, fonts, radii, or animation outside the motion spec in `docs/MOBILE_ITR_FILING_PLAN.md` §3.6.
6. **One decision per mobile pane.** New detail UI lives *inside* the existing per-income-type panes using entity cards + bottom-sheet editors. Do not add macro steps; do not add panes except where §4 says so.
7. **Telemetry without PII.** Events may carry module names, modes, entity counts, issue ids — never amounts, names, PANs. `/itr/filing` is already in `MASKED_TELEMETRY_ROUTES` (`client/src/telemetry/privacy.ts`); keep it that way.
8. **Tests-first contracts.** Each WP lists fixtures with exact expected numbers — implement them as Vitest cases verbatim. `npm run check && npm run test:unit` green is the merge gate for every WP. Do not modify unrelated failing files; if baseline is red, stop and report.
9. **Money math:** integers in rupees, `Math.max(0, Number(value) || 0)` guard (`amount()` helper), `roundAmount` for outputs, `formatInr` for display. Follow existing patterns in `shared/itr-filing.ts`.
10. **Conventional commits**, one WP per commit/PR: e.g. `feat(itr): add itemized salary capture with employer entries`.

---

## 2. Data model (single source: `shared/itr-filing.ts`)

### 2.1 New scalars on existing schemas

```ts
// itrIncomeSchema — add:
vdaGains: z.number().default(0),            // crypto/VDA gains, 115BBH bucket
familyPension: z.number().default(0),       // moved out of otherSources for per-regime 57(iia)
professionalTaxPaid: z.number().default(0), // 16(iii), old-regime salary deduction

// itrDeductionsSchema — add:
section80TTA: z.number().default(0),
section80TTB: z.number().default(0),
```

### 2.2 New `income.detail` object (all optional, all defaulted)

```ts
const itrSalaryEmployerSchema = z.object({
  id: z.string().trim().default(""),
  employerName: z.string().trim().default(""),
  employerCategory: z.enum(["private", "government", "psu", "other"]).default("private"),
  grossSalary: z.number().default(0),          // 17(1)+(2)+(3) total per Form 16 Part B
  exemptAllowances: z.number().default(0),     // HRA/LTA/other exempt under sec 10
  professionalTax: z.number().default(0),
  tdsDeducted: z.number().default(0),
});

const itrHousePropertySchema = z.object({
  id: z.string().trim().default(""),
  label: z.string().trim().default(""),
  usage: z.enum(["self-occupied", "let-out"]).default("self-occupied"),
  annualRent: z.number().default(0),
  municipalTaxes: z.number().default(0),
  homeLoanInterest: z.number().default(0),
});

const itrCapitalGainEntrySchema = z.object({
  id: z.string().trim().default(""),
  assetClass: z.enum(["listed-equity", "equity-mf", "property", "gold", "debt-mf", "vda", "other"]).default("listed-equity"),
  holding: z.enum(["short", "long"]).default("long"),
  saleValue: z.number().default(0),
  costBasis: z.number().default(0),
  expenses: z.number().default(0),
});

const itrBusinessDetailSchema = z.object({
  path: z.enum(["none", "44AD", "44ADA", "44AE", "books"]).default("none"),
  grossTurnover: z.number().default(0),        // 44AD
  digitalReceipts: z.number().default(0),      // 44AD split
  declaredProfit: z.number().default(0),       // 44AD/44ADA
  grossReceipts: z.number().default(0),        // 44ADA
  digitalShareConfirmed: z.boolean().default(false), // 44ADA above ₹50L / 44AD above ₹2cr condition
  vehicles: z.array(z.object({
    id: z.string().trim().default(""),
    heavy: z.boolean().default(false),         // > 12MT gross vehicle weight
    tonnage: z.number().default(0),            // heavy only
    months: z.number().int().min(0).max(12).default(12),
  })).default([]),                              // 44AE
  booksTurnover: z.number().default(0),        // books path summary
  booksNetProfit: z.number().default(0),
  gstin: z.string().trim().toUpperCase().default(""),
});

const itrOtherSourcesDetailSchema = z.object({
  savingsInterest: z.number().default(0),
  fdRdInterest: z.number().default(0),
  dividends: z.number().default(0),
  winnings: z.number().default(0),             // lottery/online gaming → winningsOrSpecialRateIncome
  giftsTaxable: z.number().default(0),
  others: z.number().default(0),
});

const itrIncomeDetailSchema = z.object({
  salaryMode: z.enum(["quick", "itemized"]).default("quick"),
  housePropertyMode: z.enum(["quick", "itemized"]).default("quick"),
  capitalGainsMode: z.enum(["quick", "itemized"]).default("quick"),
  businessMode: z.enum(["quick", "itemized"]).default("quick"),
  otherSourcesMode: z.enum(["quick", "itemized"]).default("quick"),
  employers: z.array(itrSalaryEmployerSchema).default([]),
  properties: z.array(itrHousePropertySchema).default([]),
  capitalGainEntries: z.array(itrCapitalGainEntrySchema).default([]),
  business: itrBusinessDetailSchema.default({}),
  otherSources: itrOtherSourcesDetailSchema.default({}),
});

// itrIncomeSchema — add:
detail: itrIncomeDetailSchema.default({}),
```

Export the inferred types (`ItrSalaryEmployer`, `ItrHousePropertyEntry`, `ItrCapitalGainEntry`, `ItrBusinessDetail`, `ItrOtherSourcesDetail`, `ItrIncomeDetail`).

Entity `id`s: generate with the existing id approach used in the codebase (search for `crypto.randomUUID` usage; if absent, use `crypto.randomUUID()` with a `Date.now()` fallback helper in the UI layer — ids are opaque strings to the engine).

---

## 3. Engine spec (rollups, validation, computation)

### 3.1 Rollups (inside `normalizeItrDraft`, after Zod parse)

Implement as pure exported function `applyItrIncomeRollups(draft: ItrFilingDraft): ItrFilingDraft` called by `normalizeItrDraft`; unit-test it directly.

| Module (when mode = `itemized`) | Rollup written to scalars |
|---|---|
| Salary | `income.salary = Σ max(0, grossSalary − exemptAllowances)` per employer; `income.professionalTaxPaid = Σ professionalTax`. (`income.pension` untouched — stays a quick scalar.) |
| House property | per property: let-out → `NAV = max(0, annualRent − municipalTaxes)`; `propIncome = NAV − 0.30·NAV − homeLoanInterest`. self-occupied → `propIncome = −min(homeLoanInterest, 200000)`. `income.housePropertyIncome = max(Σ propIncome, −200000)` (aggregate set-off cap); `income.houseProperties = properties.length`. |
| Capital gains | per entry `gain = saleValue − costBasis − expenses`. Buckets: `listed-equity/equity-mf + long` → `section112aLtcg` (Σ gains, clamp bucket ≥ 0); `listed-equity/equity-mf + short` → `shortTermCapitalGains` (clamp ≥ 0); `vda` (any holding) → `vdaGains` (clamp **each entry** ≥ 0 — no VDA loss set-off); everything else → `otherCapitalGains` (clamp bucket ≥ 0). |
| Business | path `44AD`: `businessIncome = declaredProfit`, `professionalIncome = 0`, `presumptiveScheme = "44AD"`. `44ADA`: `professionalIncome = declaredProfit`, `presumptiveScheme = "44ADA"`. `44AE`: `businessIncome = Σ (heavy ? tonnage·1000·months : 7500·months)`, `presumptiveScheme = "44AE"`. `books`: `businessIncome = max(0, booksNetProfit)`, `presumptiveScheme = "none"`. `none`: leave scalars as user-entered. |
| Other sources | `income.otherSources = savingsInterest + fdRdInterest + dividends + giftsTaxable + others`; `income.winningsOrSpecialRateIncome = winnings`. (`familyPension` is its own scalar with direct UI — not under detail.) |

Negative bucket clamps that discard a net loss must be paired with a verification issue (§3.3) — silent clamping is not acceptable.

### 3.2 `computeRegimeTax` changes

1. **VDA:** add `amount(draft.income.vdaGains)` to `specialRateTax` at `0.30` and to `specialRateTaxableIncome` (mirror the winnings lines).
2. **Family pension:** include `amount(draft.income.familyPension)` in `normalGrossIncome`, minus deduction `min(familyPension / 3, regime === "new" ? 25000 : 15000)` (floor at 0).
3. **Professional tax:** in **old regime only**, subtract `amount(draft.income.professionalTaxPaid)` alongside the standard deduction (cap at salary+pension combined with the standard deduction so salary income can't go negative).
4. `calculateItrTotalDeductions`: include `section80TTA` and `section80TTB` (verify the function sums schema fields explicitly; extend the same way).
5. `calculateItrTotalIncome`: include `vdaGains` and `familyPension`.

### 3.3 New verification issues (`buildItrVerificationReport` / module validators)

Create `validateItrIncomeModules(draft): ItrVerificationIssue[]`, merged into the report. All issues carry `area: "income"` and the listed `paneId`.

| id | severity | paneId | Condition → message gist |
|---|---|---|---|
| `salary-employer-empty` | warning | `income-salary` | itemized + an employer with `grossSalary <= 0` → complete or remove the employer |
| `salary-exempt-exceeds-gross` | critical | `income-salary` | any employer `exemptAllowances > grossSalary` |
| `hp-loss-setoff-capped` | info | `income-house-property` | aggregate property loss < −2,00,000 → excess ₹X is carry-forward; CA review applies it |
| `hp-rent-missing` | warning | `income-house-property` | let-out property with `annualRent <= 0` |
| `cg-loss-clamped` | info | `income-capital-gains` | any bucket net loss clamped to 0 → loss set-off/carry-forward needs CA review (suggest the existing `hasCarryForwardLoss` flag) |
| `cg-vda-loss-ignored` | info | `income-capital-gains` | any VDA entry with gain < 0 → VDA losses cannot be set off (115BBH) |
| `biz-44ad-turnover-limit` | critical | `income-business` | 44AD turnover > 3,00,00,000, or > 2,00,00,000 with cash share > 5% (`cash = grossTurnover − digitalReceipts`) |
| `biz-44ad-profit-below-deemed` | critical | `income-business` | declaredProfit < deemed (6% digital + 8% cash) → presumptive not available; switch to books path (CA review) |
| `biz-44ada-receipts-limit` | critical | `income-business` | 44ADA receipts > 75,00,000, or > 50,00,000 without `digitalShareConfirmed` |
| `biz-44ada-profit-below-deemed` | critical | `income-business` | declaredProfit < 50% of receipts |
| `biz-44ae-vehicle-limit` | critical | `income-business` | more than 10 vehicles |
| `biz-books-needs-review` | info | `income-business` | books path selected → ITR-3 + CA review prepares the P&L schedules |
| `biz-digital-exceeds-turnover` | critical | `income-business` | digitalReceipts > grossTurnover |

### 3.4 Recommendation/blockers

- `getCommonBlockers`: add `vdaGains > 0` → "…for virtual digital asset income." (keeps VDA out of ITR-1/4, consistent with existing capital-gains blockers).
- `getItr4Blockers`: when `detail.businessMode === "itemized"`, the critical `biz-*` limit conditions above also append matching blockers (reuse one shared predicate module so issue and blocker logic cannot drift).
- `paneIdForFormBlocker`: already maps business/capital-gains text → panes; extend regexes if new blocker strings don't match (`virtual digital asset` → `income-capital-gains`).
- `requiredSchedulesFor`: `vdaGains > 0` → add "Schedule VDA"; itemized house property → "Schedule House Property" already covered; 44AE → covered by existing presumptive schedule line.

### 3.5 Document checklist (`getItrDocumentChecklist`)

Read the current implementation first (item shape: `{id, title, reason, required}`). Add, following existing id style:

| Condition | id | title (required) |
|---|---|---|
| itemized salary with ≥ 2 employers | `form16-additional` | Form 16 from each employer |
| any `homeLoanInterest > 0` (detail or `deductions.homeLoanInterest`) | `home-loan-certificate` | Home loan interest certificate |
| any let-out property | `rent-receipts` | Rent receipts or rental agreement |
| capital gain entries present | (extend existing `capital-gains` item reason) | broker/registrar statements |
| `vdaGains > 0` | `vda-statement` | VDA/crypto exchange statement |
| business path ≠ none | `business-bank-statements` | Business bank statements / turnover proof |
| `gstin` non-empty | `gst-returns` | GST returns summary (GSTR-3B/1) |

---

## 4. UI spec

### 4.1 Shared scaffolding (new files in `client/src/features/itr/components/filing/`)

1. **`ModeSwitch.tsx`** — segmented two-option control (`Quick total` / `Itemized`), rendered at the top of each module pane. Visual: same pattern as the regime segmented control in the compute step (check `filing.page.tsx` compute pane; if it uses a one-off, extract/copy the style — `bg-slate-100` track, white active pill with `border-blue-200 text-blue-700`). 44 px height. `aria-pressed` semantics.
2. **`EntityList.tsx`** — generic list of entity summary cards + "Add" button.
   - Card: `rounded-lg border border-slate-200 bg-white p-4`, title (`text-sm font-black text-slate-950`), one-line summary (`text-sm font-semibold text-slate-600`, money via `formatInr`), right-aligned amount, edit affordance (whole card is a button, `aria-label="Edit <title>"`), small remove icon-button (`aria-label="Remove <title>"`, `text-slate-400 hover:text-red-600`).
   - Add button: `variant="outline"` full-width h-11, `border-blue-100 bg-blue-50 text-blue-700` (house pattern), label per module ("Add employer", "Add property", "Add sale", "Add vehicle").
   - Props: `items: Array<{id, title, summary, amount?}>`, `onEdit(id)`, `onRemove(id)`, `addLabel`, `onAdd`, `emptyHint`.
3. **`EntityEditorSheet.tsx`** — `Sheet side="bottom"` (`rounded-t-2xl`, `pb-[calc(1rem+env(safe-area-inset-bottom))]`, `md:max-w-lg md:mx-auto` — match `MobileMoreSheet` styling) hosting a module-provided form body + sticky footer with `Cancel` (outline) and `Save` (blue-600) buttons. Editing is **draft-local**: the sheet edits a local copy and commits to the draft only on Save (so autosave doesn't fire per keystroke inside the sheet). Focus-trap and `aria-labelledby` come free from the existing Sheet.
4. **`SuggestionChip.tsx`** — dismissible inline chip row: `rounded-lg border border-blue-200 bg-blue-50 p-3`, text (`text-sm font-semibold text-slate-700`) + `Apply` button (h-9, blue-600) + `Dismiss` ghost. Used for: "Apply ₹57,000 TDS from employers", "Apply 80TTA ₹10,000", "Apply Form 16 values". Applying writes the target field via the normal `updateX` helpers; dismissal is component-local state (re-shows next visit — acceptable).
5. **Read-only rollup line** — in itemized mode, replace the scalar `CurrencyInput` with a `SummaryLine`-style row (exists in `filing.page.tsx`): label + `formatInr(value)` + caption "Calculated from your entries".

### 4.2 Mode-switch data rules (implement in `filing.page.tsx` update helpers)

- quick → itemized with a nonzero scalar and zero entities: seed one entity from the scalar (salary → one employer `{employerName: "Employer 1", grossSalary: scalar}`; house property → one let-out property with `annualRent` left 0 and an info hint; capital gains/business/other sources → no seeding, empty list with `emptyHint`).
- itemized → quick: keep the rolled-up scalar values (they're already in the draft), set mode to quick, leave detail arrays intact (data preserved for switching back).
- Deleting the last entity in itemized mode keeps itemized mode with the empty-state hint.

### 4.3 Per-module pane content (mobile = these are the existing panes; desktop unchanged grid behavior)

**Salary (`income-salary`)** — `ModeSwitch`; quick: today's Salary + Pension `CurrencyInput`s. Itemized: `EntityList` of employers (title = employerName or "Employer N", summary = category label, amount = net `gross − exempt`), Pension stays a `CurrencyInput` below the list. Editor sheet fields: employer name (`TextInput`, autoCapitalize words), category (`Select`: Private / Government / PSU / Other), gross salary (`CurrencyInput`), exempt allowances (`CurrencyInput`, helper "HRA, LTA, and other Section 10 exemptions"), professional tax (`CurrencyInput`), TDS deducted (`CurrencyInput`). After save, if `Σ tdsDeducted > 0` and ≠ `taxPaid.tds`, show `SuggestionChip` "Apply ₹X as TDS in Taxes paid". Form 16 banner: see §4.5.

**Business (`income-business`)** — `ModeSwitch`; quick: today's two `CurrencyInput`s. Itemized: path selector as 4 `ChoiceButton`s (44AD business · 44ADA profession · 44AE goods carriage · Books/other) then path-specific fields inline (not in a sheet — single group, no entity list except 44AE):
- 44AD: gross turnover, digital receipts (`CurrencyInput` ×2; cash derived and displayed as `SummaryLine`), deemed profit `SummaryLine` ("6% of digital + 8% of cash = ₹X"), declared profit `CurrencyInput` (error state when below deemed).
- 44ADA: gross receipts, deemed 50% `SummaryLine`, declared profit; when receipts > ₹50L show `ToggleRow` "95%+ receipts are digital" (`digitalShareConfirmed`).
- 44AE: `EntityList` of vehicles (summary "Heavy · 16t · 9 months", amount = computed entry income); editor sheet: heavy `ToggleRow`, tonnage (`TextInput` numeric, visible when heavy), months (`TextInput` numeric 0–12). Deemed income `SummaryLine` below list.
- Books: turnover + net profit `CurrencyInput`s, GSTIN `TextInput` (auto-uppercase, maxLength 15), info card (amber-50 pattern) "Detailed P&L and balance sheet schedules are prepared during CA review (ITR-3 path)."

**House property (`income-house-property`)** — `ModeSwitch`; quick: today's count + net income. Itemized: `EntityList` of properties (title = label or "Property N", summary = "Let-out · rent ₹3,60,000" / "Self-occupied", amount = computed `propIncome`, negative in amber); editor sheet: label (`TextInput`), usage (2 `ChoiceButton`s), then let-out → annual rent, municipal taxes, home loan interest; self-occupied → home loan interest only with helper "Interest is capped at ₹2,00,000 for self-occupied property". Below list: `SummaryLine` net income with cap note when clamped.

**Capital gains (`income-capital-gains`)** — `ModeSwitch`; quick: today's three `CurrencyInput`s. Itemized: `EntityList` of sale entries (title = asset-class label, summary = "Long term · sold ₹2,50,000", amount = gain, losses shown amber); editor sheet: asset class (`Select` with the 7 classes), holding (2 `ChoiceButton`s Short/Long; hidden for VDA — always special rate), sale value / cost basis / transfer expenses (`CurrencyInput` ×3), computed gain `SummaryLine`. Bucket totals strip under the list (4 `Metric`-style tiles: 112A LTCG, STCG, Other, VDA). Inline link to `/capital-gains-import` ("Import from broker statement") above the list.

**Other sources (`income-other-sources`)** — `ModeSwitch`; quick: today's single total. Itemized: six labeled `CurrencyInput`s stacked (savings interest, FD/RD interest, dividends, winnings & online gaming, taxable gifts, others) — no entity list needed. Below: `familyPension` `CurrencyInput` (always visible in both modes, since it's now a dedicated scalar) with helper "Family pension deduction is applied per regime automatically". Suggestion chips: 80TTA (age < 60 from `taxpayer.dateOfBirth`, `min(savingsInterest, 10000)`) or 80TTB (age ≥ 60, `min(savingsInterest + fdRdInterest, 50000)`) when the corresponding deduction field is lower than the suggestion; winnings > 0 → info note "taxed at 30% flat".

**Deductions pane (`income-deductions`)** — add the schema-supported fields missing from UI: 80G, 80E, NPS (80CCD-1B), home loan interest (24b, helper "if not captured under house property"), 80TTA, 80TTB, other Chapter VI-A. Keep 2-col md grid. Guard: when itemized house property has per-property interest AND `deductions.homeLoanInterest > 0`, raise warning issue `dedup-home-loan-interest` (paneId `income-deductions`) about double counting.

**Taxes paid pane (`income-taxes-paid`)** — add `selfAssessmentTax` `CurrencyInput` (schema-supported, missing in UI).

### 4.4 panes.ts changes

Pane *list* is unchanged (invariant 6) except descriptions: update the per-type `INCOME_PANES` descriptions to mention itemizing (e.g., salary: "Add employers from Form 16 or enter totals."). Update `panes.test.ts` accordingly. `FilingPaneDraft` type may need `detail` passthrough — keep it permissive (`[key: string]: unknown` already covers it).

### 4.5 Form 16 → salary handoff

New `client/src/features/itr/lib/form16-handoff.ts` mirroring `start-selector.ts`: versioned sessionStorage payload `{version: 1, parsedAt, employer: {employerName, grossSalary, exemptAllowances, professionalTax, tdsDeducted}}` + `write/read/clear`. In `form16-parser.page.tsx`, where parsed results render (near the existing "Start ITR filing" link), add "Send to ITR draft" button → write payload → navigate `/itr/filing`. In the salary pane, when a payload exists: blue-50 banner (same visual as the existing selector-handoff banner in `filing.page.tsx`) with "Apply Form 16 values" → switches `salaryMode` to itemized, appends the employer entry, offers the TDS chip, clears payload; "Dismiss" → clears payload. Map fields from the parser's existing parsed-data shape (read `exportForm16ForITR` to find gross/exemptions/professional tax/TDS keys; map best-effort, leave unmappable fields 0).

---

## 5. Work packages

> Order is dependency order. Each WP = one commit/PR, merge-gated on `npm run check && npm run test:unit` plus the listed acceptance criteria. UI work must be verified at 390 px width and ≥ 768 px (browser devtools is sufficient; Playwright optional per WP8).

### WP0 — Surface already-supported fields (no schema change)
**Files:** `filing.page.tsx`, `filing.test.ts` (if it asserts pane field counts).
1. Deductions pane: add 80G, 80E, NPS, home loan interest, other Chapter VI-A `CurrencyInput`s bound to existing `deductions.*` fields.
2. Taxes-paid pane: add self-assessment tax.
3. Other-sources pane: add agricultural income (existing scalar, helper "Above ₹5,000 moves the case beyond ITR-1") and winnings/special-rate income (existing scalar).
**Accept:** fields persist through autosave round-trip (PATCH payload contains them); blockers fire (agricultural > 5,000 → ITR-1 blocker appears in Verify); existing tests green.

### WP1 — Schema, rollups, engine extensions
**Files:** `shared/itr-filing.ts`, new `shared/itr-filing-rollups.test.ts` (or extend existing shared test file co-located with current engine tests — match repo convention by checking where `itr-filing` tests live: `client/src/lib/itr-filing.test.ts`).
1. Add §2 schemas/scalars/types; export `applyItrIncomeRollups`; wire into `normalizeItrDraft`.
2. §3.2 computation changes (VDA 30%, family pension per-regime deduction, professional tax old-regime, 80TTA/80TTB in totals, total-income additions).
3. §3.3 `validateItrIncomeModules` + merge into `buildItrVerificationReport`; §3.4 blocker/schedule additions.
**Accept (fixtures — implement as tests verbatim):**
- *Back-compat:* a draft JSON without `detail` normalizes with all pre-existing scalars unchanged and `detail` defaulted (`salaryMode === "quick"` etc.).
- *Salary rollup:* employers [{gross 840000, exempt 60000, profTax 2400, tds 45000}, {gross 400000, tds 12000}], mode itemized → `salary = 1180000`, `professionalTaxPaid = 2400`.
- *44AD:* turnover 9000000, digital 8000000 → deemed = 0.06·8000000 + 0.08·1000000 = **560000**; declared 600000 → `businessIncome 600000`, scheme 44AD, no `biz-*` critical issues; declared 500000 → issue `biz-44ad-profit-below-deemed` (critical) and matching ITR-4 blocker.
- *44ADA:* receipts 6000000, declared 3000000, digitalShareConfirmed true → `professionalIncome 3000000`, no issue; digitalShareConfirmed false → `biz-44ada-receipts-limit`.
- *44AE:* vehicles [heavy 16t × 9 mo, light × 12 mo] → `businessIncome = 16·1000·9 + 7500·12 = 234000`.
- *House property:* [let-out rent 360000, municipal 10000, interest 120000] → propIncome = 350000 − 105000 − 120000 = **125000**; adding SOP with interest 260000 → SOP propIncome −200000, aggregate −75000 → `housePropertyIncome = −75000`, `houseProperties = 2`, no cap issue; SOP alone with interest 260000 plus let-out income 0 → capped at −200000 with `hp-loss-setoff-capped` only when raw Σ < −200000.
- *Capital gains:* entries [listed-equity long: sale 450000 cost 250000 → +200000], [listed-equity short: sale 150000 cost 100000 → +50000], [property long: sale 3000000 cost 2600000 → +400000], [vda: sale 80000 cost 50000 → +30000] → `section112aLtcg 200000`, `shortTermCapitalGains 50000`, `otherCapitalGains 400000`, `vdaGains 30000`. New-regime liability for vda-only draft (salary 0): specialRateTax includes 30000·0.30 = 9000.
- *Family pension:* `familyPension 120000`, old regime deducts 15000, new deducts 25000 (assert via `computeRegimeTax` taxableIncome difference).
- *Other sources rollup:* {savings 12000, fdRd 48000, dividends 6000, winnings 25000} itemized → `otherSources 66000`, `winningsOrSpecialRateIncome 25000`.
- *VDA blocker:* `vdaGains > 0` → ITR-1 blocked, ITR-2 recommended for salary+vda individual.

### WP2 — Shared UI scaffolding
**Files:** new `ModeSwitch.tsx`, `EntityList.tsx`, `EntityEditorSheet.tsx`, `SuggestionChip.tsx` (+ colocated `.test.tsx` for ModeSwitch and EntityList rendering/callbacks).
**Accept:** components render per §4.1 design rules; EntityEditorSheet commits only on Save (callback spy: zero commits while typing); keyboard/AT basics (sheet labelled, list buttons labelled); no console errors in vitest jsdom.

### WP3 — Salary module + Form 16 handoff
**Files:** `filing.page.tsx` (salary pane), `form16-handoff.ts` (+ test), `form16-parser.page.tsx`, `panes.ts` descriptions, `panes.test.ts`.
**Accept:** mode toggle seeds employer from scalar per §4.2; add/edit/remove employers updates the read-only rollup line live (rollup runs via `normalizeItrDraft` in `updateDraft` — verify it does; if `updateDraft` normalizes already, rollups are automatic); TDS chip applies Σ tds to `taxPaid.tds`; Form 16 round-trip works (write on parser page → banner on filing → apply → employer appended, payload cleared); autosave persists `detail.employers`; back-compat test from WP1 still green.

### WP4 — Business module
**Files:** `filing.page.tsx` (business pane), reuse WP2 components.
**Accept:** path selector renders 4 choices; per-path fields per §4.3; deemed-profit summary lines compute the WP1 fixture numbers in the UI; declared-below-deemed shows inline error on the field *and* the Verify step lists `biz-44ad-profit-below-deemed` deep-linking back to the business pane; ITR-4 recommendation appears for valid 44AD fixture (badge in header), CA_SCOPE/ITR-3 for books path.

### WP5 — House property module
**Files:** `filing.page.tsx` (house property pane + deductions dedup warning).
**Accept:** WP1 fixture properties produce the same numbers in card amounts and the net `SummaryLine`; usage switch hides/shows rent fields; loss shows amber; `dedup-home-loan-interest` warning fires when both per-property interest and `deductions.homeLoanInterest` are set; >2 properties still raises the existing ITR-1/4 blocker (now reachable via entity count).

### WP6 — Capital gains module
**Files:** `filing.page.tsx` (capital gains pane).
**Accept:** entry editor computes gain live; bucket tiles match WP1 fixture; VDA entry hides holding selector and routes to the VDA bucket; loss entry turns amber and net-negative bucket shows the `cg-loss-clamped` info issue in Verify; import link routes to `/capital-gains-import`.

### WP7 — Other sources module + deduction chips
**Files:** `filing.page.tsx` (other sources + deductions panes).
**Accept:** itemized fields roll up per fixture; family pension input visible in both modes and engine difference (15k/25k) reflected in compute step regime cards; 80TTA chip appears for non-senior with savings 12000 and `section80TTA = 0`, applying sets 10000; 80TTB variant for senior DOB; winnings note visible when winnings > 0.

### WP8 — Cross-cutting polish, telemetry, docs checklist, e2e
**Files:** `getItrDocumentChecklist` in `shared/itr-filing.ts` (§3.5 — if not already done in WP1, do it here with its tests), telemetry calls in `filing.page.tsx`, Playwright spec (extend the existing mobile filing spec if present — search `tests/` for the filing flow spec; create `tests/itr-income-modules.spec.ts` otherwise), `docs/MOBILE_ITR_FILING_PLAN.md` status note.
1. Telemetry: `itr_income_mode_changed {module, mode}`, `itr_income_entity_saved {module, entityCount}`, `itr_income_suggestion_applied {kind}` — counts/enums only.
2. Document checklist additions + tests.
3. Playwright (mobile viewport): salaried 2-employer itemized happy path → Verify clean → Compute shows numbers → Review submit enabled; 44AD invalid-profit path → Verify issue deep-links back to business pane.
4. Review packet sanity: `buildItrReviewPacket` already serializes the whole draft — verify `detail` appears in the packet draft and the packet summary totals match rollups (add one assertion to the existing packet test).
**Accept:** all listed tests green; `npm run check` clean; manual 390 px sweep of all five module panes (sheet editors usable above keyboard, no horizontal scroll).

---

## 6. Out of scope (do not build)

- Foreign income detail capture (stays a single total + flags → CA review path).
- Lot-level capital gains import parsing (the import page handles that separately; only the navigation link is in scope).
- HRA exemption calculator inside the employer sheet (link text may point to existing calculators; computation stays "exempt allowances" as entered).
- Property indexation choice for pre-23-Jul-2024 acquisitions (covered by `otherCapitalGains` 12.5% estimate + existing CA-review gating via `unsupportedReasons`).
- Depreciation schedules, balance sheet, audit flows for books path (ITR-3 stays CA-review gated; `exportStatusFor` already reports the ITR-3 schema as not synced).
- AIS reconciliation, server-side schema changes, payment of self-assessment tax.

## 7. Risks & guardrails for the agent

| Risk | Guardrail |
|---|---|
| Drift between issue conditions and ITR-4 blockers | single shared predicate per rule (§3.4), used by both |
| Rollup double-normalization loops | `applyItrIncomeRollups` must be idempotent — add test `normalize(normalize(d)) === normalize(d)` |
| Sheet editing spams autosave | editor commits on Save only (WP2 acceptance) |
| `filing.page.tsx` keeps growing (already ~1,500 lines) | put module pane bodies in new files under `components/filing/income/` (`SalaryPane.tsx`, `BusinessPane.tsx`, `HousePropertyPane.tsx`, `CapitalGainsPane.tsx`, `OtherSourcesPane.tsx`) receiving `draft` + update callbacks as props — page stays orchestration-only |
| Regime-dependent law nuances (new-regime SOP interest, indexation) | estimate conservatively + info issue / `unsupportedReasons`; never silently compute a lower tax |
| Stored drafts created mid-rollout | every WP keeps the WP1 back-compat fixture test green |
| OneDrive-synced working tree may contain unrelated edits | touch only files listed in the WP; never run broad formatters |

## 8. Definition of done (whole plan)

- [ ] All WP acceptance criteria met; `npm run check` and `npm run test:unit` green.
- [ ] A pre-existing draft (fixture from WP1) loads, edits, autosaves, and submits for review with zero behavior change when all modes are quick.
- [ ] Salaried filer with two employers, one let-out property, equity LTCG, savings interest completes Owner → Review on a 390 px viewport using only itemized modes, with Verify clean and Compute showing regime comparison.
- [ ] Every approximation surfaced as an info issue or `unsupportedReasons` line (none silent).
- [ ] No new dependencies; no design-token deviations; telemetry events contain no amounts/PII.
