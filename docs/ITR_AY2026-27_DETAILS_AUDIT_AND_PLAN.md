# ITR Details — AY 2026-27 Audit & Implementation Plan

> **Status (2026-06-13):** Phases 1–4 **computation implemented** in [`shared/itr-filing.ts`](../shared/itr-filing.ts) (capital-gains detail with CII 376 indexation + §112A grandfathering + §50AA, surcharge with marginal relief + 15% special cap, VDA 30%, §44AD/§44ADA presumptive), pinned by tests in [`client/src/lib/itr-filing.test.ts`](../client/src/lib/itr-filing.test.ts). **The CA-review gate is kept** — advanced forms still return `status: "review_required"`; the computed figures are estimates. Minimal wizard UI added (VDA field, presumptive scheme + cash toggle). **Still pending:** the per-transaction capital-gains entry UI (the engine accepts `capitalGainsEntries` but the wizard currently exposes aggregate CG inputs), the FVC=0 Category-A validation, and Phase 5 (needs official CBDT schema files). This document (a) audits the supplied statutory blueprint against independently verified facts, (b) audits the rules engine against those facts, and (c) specifies the phased implementation.
>
> **Verification note:** tax facts below were cross-checked online (June 2026) against ClearTax, Business-Standard, RSM India, and TaxGuru. The supplied blueprint is **mostly accurate** but contains at least one concrete error (CII) and one unconfirmed provision (§234I). Do **not** encode tax rules from prose — encode only from verified facts or the official CBDT schema/validation JSON.

---

## Part 1 — Source-of-truth audit (blueprint vs verified)

### 1.1 Confirmed (safe to rely on)

| Area | Verified rule for AY 2026-27 (FY 2025-26) |
|---|---|
| New-regime slabs | Nil ≤₹4L · 5% ₹4–8L · 10% ₹8–12L · 15% ₹12–16L · 20% ₹16–20L · 25% ₹20–24L · 30% >₹24L |
| §87A rebate (new) | Up to **₹60,000**, taxable-income ceiling **₹12,00,000**; marginal relief above |
| Standard deduction | New **₹75,000** / Old **₹50,000** → salaried tax-free ≈ **₹12.75L** (new) |
| Old-regime exemption | ₹2.5L regular · ₹3L senior (60–80) · ₹5L super-senior (80+); §87A ₹12,500 up to ₹5L |
| House property in ITR-1/4 | Up to **2 properties** (new from AY 2025-26, continues) |
| LTCG §112A in ITR-1/4 | Up to **₹1.25L**, only if **no brought/carried-forward losses** |
| STCG §111A | **20%** (from 23 Jul 2024) |
| LTCG §112A | **12.5%** above ₹1.25L (from 23 Jul 2024) |
| Other LTCG / property | 12.5% without indexation, **or** 20% with indexation for immovable property acquired **before 23 Jul 2024** → lower-of |
| Debt funds (post 1 Apr 2023) | Always STCG at slab (§50AA) |
| Cess | 4% health & education |
| ITR-U | 48-month window (FA 2025); additional tax **25 / 50 / 60 / 70%**; AY 2026-27 open to **31 Mar 2031** |
| Deadlines | ITR-1/2 non-audit **31 Jul 2026** · ITR-3/4 non-audit **31 Aug 2026** · audit **31 Oct 2026** · belated **31 Dec 2026** · revised **31 Mar 2027** |

### 1.2 Corrected (blueprint is wrong)

- **Cost Inflation Index for FY 2025-26 is `376`, not `363`.** The blueprint's `363` is the FY 2024-25 value. Any indexation math for AY 2026-27 must use **376**. (Source: RSM India / ClearTax CII table.) The current code does **not** hardcode a CII, so no live bug — but the future indexation feature (Phase 1) must use 376.

### 1.3 Unconfirmed — do NOT encode from this blueprint

- **"§234I late fee for revised returns" (₹1,000/₹5,000 between 31 Dec and 31 Mar, "Finance Act 2026").** Could not be confirmed from an authoritative reading; the ClearTax due-date page references §234I only inside a 1961-vs-2025 Act mapping table with no revised-return fee detail. Treat as **unverified** until confirmed against the bare Act text or a CBDT notification. Do not levy it in code yet.
- **Granular schema specifics** — "Rule 129/130", JSON field "E21", "utilities released 15 May 2026", "§89A removed from ITR-1/4", §80G/§80GGC mandatory sub-fields, Category A/B rule IDs. These may be real, but prose is not a reliable source. They must come from the **official CBDT JSON schema + validation-rules files** per form. See Phase 5.

---

## Part 2 — Engine audit (`shared/itr-filing.ts`)

### 2.1 Constants vs verified facts — all correct ✅

| Constant (code) | Value | Verified? |
|---|---|---|
| `NEW_REGIME_SLABS` | 0/4/8/12/16/20/24L at 0/5/10/15/20/25/30% | ✅ exact |
| `NEW_REGIME_REBATE_LIMIT` / `NEW_REGIME_MAX_REBATE` | ₹12,00,000 / ₹60,000 | ✅ |
| `OLD_REGIME_REBATE_LIMIT` / `OLD_REGIME_MAX_REBATE` | ₹5,00,000 / ₹12,500 | ✅ |
| `OLD_REGIME_SLABS` (regular/senior/superSenior) | ₹2.5L / ₹3L / ₹5L exemption, 5%/20%/30% | ✅ |
| `STANDARD_DEDUCTION` | old ₹50,000 / new ₹75,000 | ✅ |
| `HEALTH_AND_EDUCATION_CESS_RATE` | 0.04 | ✅ |
| `ITR_112A_SIMPLE_LIMIT` | ₹1,25,000 | ✅ |
| STCG rate | `shortTermCapitalGains * 0.2` | ✅ (20%) |
| LTCG §112A rate | `taxable112a * 0.125` | ✅ (12.5% above ₹1.25L) |
| Other LTCG rate | `otherCapitalGains * 0.125` | ✅ flat-rate (see gap G2) |
| Winnings/special | `* 0.3` | ✅ |
| New-regime marginal relief | implemented (lines ~791–797) | ✅ |
| §87A not applied to special-rate income | rebate computed on `normalSlabTax` only | ✅ correct |

**Verdict:** the engine is accurate for its current scope. The blueprint's CII error is not present in code (no CII used yet).

### 2.2 Intentional scope gate

`computeItrTaxLiability` returns `status: "review_required"` whenever the recommended form is not a clean **ITR-1** (or any blocker exists), with the message *"… computation is gated for CA review in this phased release."* Both regimes are still computed and returned; only the `status` flips. This means today's **computed** path is strictly: resident individual, ITR-1-eligible, ≤₹50L, no STCG/other CG, §112A ≤ ₹1.25L.

### 2.3 Gaps (all currently behind the CA-review gate, so no live bug)

| ID | Gap | Affected forms | Currently |
|---|---|---|---|
| G1 | **STCG/LTCG transaction detail** — holding-period classification, scrip-wise Schedule 112A, grandfathering (FMV on 31 Jan 2018) | ITR-2/3 | Aggregate fields, gated to CA review |
| G2 | **Indexation / CII (376)** for pre-23-Jul-2024 immovable property (lower-of 12.5% vs 20%+index) | ITR-2/3 | `otherCapitalGains` flat 12.5%, gated |
| G3 | **Surcharge** (10/15/25/37%; 15% cap on CG & dividend; marginal relief) | >₹50L (ITR-2/3) | Not computed; irrelevant to ITR-1 (≤₹50L) |
| G4 | **VDA / crypto** — §115BBH 30%, no loss set-off, §194S 1% TDS reconcile | ITR-2/3 | No data field; gated |
| G5 | **Business / presumptive computation** — §44AD (6%/8%, ₹2cr→₹3cr), §44ADA (50%, ₹75L), F&O absolute turnover | ITR-3/4 | Income captured, computation gated |
| G6 | **Per-form Category A/B validations** to CPC parity | All | Partial (identity, 112A boundary, form routing) |

Because G1–G5 sit behind the gate, **they are roadmap items, not defects.** The safe sequencing is: build + test a path fully, then "ungate" it (let `computeItrTaxLiability` return `computed` for it).

---

## Part 3 — Implementation plan for ITR details (phased)

Each phase adds: **(a)** schema fields in `itrIncomeSchema`/`itrFilingDraftSchema`, **(b)** computation in `computeRegimeTax`, **(c)** wizard panes in `panes.ts` + `filing.page.tsx`, **(d)** validations in `validateItrPane`, **(e)** tests, **(f)** an explicit ungate in `computeItrTaxLiability`. Dual-API note: any new persisted fields flow through `secureDraftForStorage`/`normalizeItrDraft` automatically (no API change), but new **server validations** must land in both `server/routes/tax-returns.ts` and `api/index.ts` (see `[[dual-api-implementations]]`).

### Phase 1 — Capital-gains detail (G1 + G2): ungate ITR-2 CG
- **Data model:** replace flat `otherCapitalGains` with a typed list: `{ assetClass: "listed_equity"|"immovable"|"unlisted"|"debt"|"other", acquisitionDate, saleDate, costOfAcquisition, fullValueOfConsideration, expenses }`. Keep the aggregate fields as derived for backward compatibility.
- **Computation:** holding-period classification → STCG vs LTCG; CII table (FY 2025-26 = **376**) for pre-23-Jul-2024 immovable property with lower-of(12.5% no-index, 20% with-index); §50AA debt-fund-as-STCG; §112A scrip aggregation + ₹1.25L exemption + grandfathering FMV(31 Jan 2018).
- **Validation (CPC parity):** if `fullValueOfConsideration === 0`, prohibit cost/expense claims (blueprint Category A rule — this one is a sound, well-known rule).
- **Ungate:** allow `computed` for ITR-2 capital-gains-only cases once tests pass.

### Phase 2 — Surcharge (G3)
- Surcharge slabs on tax (not income): 10% >₹50L, 15% >₹1cr, 25% >₹2cr, 37% >₹5cr; **15% cap** on the portion attributable to §111A/§112A gains and dividends; surcharge **marginal relief** at each threshold; then cess on (tax + surcharge). Required before any >₹50L path can be `computed`.

### Phase 3 — VDA / crypto (G4)
- New `vda: { proceeds, costOfAcquisition }[]`; tax = 30% on net of each transfer with **no inter-transfer or cross-head set-off** (§115BBH); reconcile 1% §194S TDS into tax-paid. Schedule VDA.

### Phase 4 — Business & presumptive (G5): ITR-3 / ITR-4
- §44AD (6% digital / 8% cash, turnover ₹2cr, ₹3cr if cash ≤5%), §44ADA (50%, ₹75L), §44AE; sub-threshold-profit → force audit → migrate ITR-4→ITR-3 (already routed). F&O **absolute turnover** = Σ|profit|+|loss|. Form 10-IEA acknowledgement capture when opting old regime with business income (mandatory field, blocks generation otherwise).

### Phase 5 — CPC Category-A validation parity (G6)
- Source the **official CBDT JSON schema + validation-rules** files per form (ITR-1..4) and generate validators from them. Do not transcribe rule numbers from prose. This is the gate-keeper that protects against defective-return notices and is prerequisite to any real JSON-payload generation.

---

## Part 4 — Scope & legal caveat (read before Phase 5)

The blueprint describes a **CPC e-filing transmitter** (build JSON payloads → transmit to the portal → Category-A defect parity). myeca.in today is **self-prep + CA review**: per `client/src/features/itr/pages/success.page.tsx` and `ReviewAndSubmit.tsx`, *"a valid acknowledgment is issued only after the return is filed on the Income Tax portal… official portal filing remains a separate authorized workflow."* Becoming an actual transmitter requires **ERI (e-Return Intermediary) registration** with the Income Tax Department, schema licensing, and security audits — a business/legal decision, not just engineering. Phases 1–4 improve the **self-prep computation** within the current product framing; Phase 5 only makes sense if ERI registration is pursued.

---

## Part 5 — Verified constants reference (single source of truth)

These are pinned by regression tests in `client/src/lib/itr-filing.test.ts` ("AY 2026-27 verified parameters"). Update both together.

```
New regime slabs:     0 | 4L:5% | 8L:10% | 12L:15% | 16L:20% | 20L:25% | 24L:30%
New rebate (87A):     ≤ ₹12,00,000 taxable → up to ₹60,000 (then marginal relief)
Standard deduction:   new ₹75,000 · old ₹50,000
Old exemption:        ₹2.5L / ₹3L (senior) / ₹5L (super-senior); 87A ₹12,500 ≤ ₹5L
112A LTCG:            12.5% above ₹1,25,000 (rebate not applicable to it)
STCG 111A:            20%
Cess:                 4%
CII (FY 2025-26):     376   ← (not 363; for Phase 1)
```

Sources: ClearTax (slabs, due dates, CII), Business-Standard (LTCG ₹1.25L in ITR-1), BusinessToday (two house properties), RSM India (CII 376), TaxGuru (ITR-U §139(8A)).
