import { describe, expect, it } from "vitest";
import {
  ITR_AY_2026_27_SCHEMA_EXPORTS,
  buildItrDraftJsonExport,
  buildItrReviewPacket,
  buildItrVerificationReport,
  computeItrTaxLiability,
  getItrDocumentChecklist,
  normalizeItrDraft,
  validateItrIdentity,
  validateItrPane,
  recommendItrForm,
  type ItrFilingDraft,
} from "@shared/itr-filing";
import {
  incomeTaxFormDownloads,
  incomeTaxFormsAssessmentYear,
} from "@/data/income-tax-forms";

const baseDraft: ItrFilingDraft = {
  assessmentYear: "2026-27",
  taxpayer: {
    type: "individual",
    residentialStatus: "resident",
    pan: "ABCDE1234F",
    firstName: "Asha",
    lastName: "Rao",
    aadhaar: "123412341234",
    bankName: "HDFC Bank",
    bankAccount: "123456789012",
    bankAccountConfirm: "123456789012",
    ifsc: "HDFC0001234",
  },
  filing: {
    returnKind: "original",
    wantsOldRegime: false,
  },
  income: {
    selectedTypes: ["salary", "otherSources"],
    salary: 900000,
    pension: 0,
    houseProperties: 0,
    otherSources: 40000,
    agriculturalIncome: 0,
    shortTermCapitalGains: 0,
    section112aLtcg: 0,
    otherCapitalGains: 0,
    businessIncome: 0,
    professionalIncome: 0,
    presumptiveScheme: "none",
    foreignIncome: 0,
    winningsOrSpecialRateIncome: 0,
  },
  deductions: {
    section80C: 120000,
    section80D: 25000,
    otherChapterVia: 0,
  },
  taxPaid: {
    tds: 65000,
    tcs: 0,
    advanceTax: 0,
    selfAssessmentTax: 0,
  },
  flags: {
    directorInCompany: false,
    heldUnlistedEquity: false,
    hasForeignAssets: false,
    hasForeignSigningAuthority: false,
    hasDeferredEsopTax: false,
    hasBroughtForwardLoss: false,
    hasCarryForwardLoss: false,
    section194NCashWithdrawal: false,
    governedByPortugueseCivilCode: false,
  },
  documents: {},
};

const draft = (overrides: Partial<ItrFilingDraft>): ItrFilingDraft => ({
  ...baseDraft,
  ...overrides,
  taxpayer: { ...baseDraft.taxpayer, ...overrides.taxpayer },
  filing: { ...baseDraft.filing, ...overrides.filing },
  income: { ...baseDraft.income, ...overrides.income },
  deductions: { ...baseDraft.deductions, ...overrides.deductions },
  taxPaid: { ...baseDraft.taxPaid, ...overrides.taxPaid },
  flags: { ...baseDraft.flags, ...overrides.flags },
  documents: { ...baseDraft.documents, ...overrides.documents },
});

describe("ITR filing form selection", () => {
  it("selects ITR-1 for resident individual salary cases within AY 2026-27 limits", () => {
    const recommendation = recommendItrForm(baseDraft);

    expect(recommendation.form).toBe("ITR-1");
    expect(recommendation.exportAvailable).toBe(true);
    expect(recommendation.caReviewRequired).toBe(false);
    expect(recommendation.requiredSchedules).toEqual(["Schedule Salary", "Schedule Other Sources", "Schedule Tax Paid"]);
  });

  it("keeps ITR-1 available for two house properties and 112A LTCG up to Rs 1.25 lakh", () => {
    const recommendation = recommendItrForm(draft({
      income: {
        houseProperties: 2,
        section112aLtcg: 125000,
      },
    }));

    expect(recommendation.form).toBe("ITR-1");
    expect(recommendation.reasons).toContain("Section 112A LTCG is within the Rs 1.25 lakh ITR-1/ITR-4 limit.");
    expect(recommendation.requiredSchedules).toContain("Schedule 112A summary");
  });

  it("moves non-business complexity from ITR-1 to ITR-2 with reasoned blockers", () => {
    const recommendation = recommendItrForm(draft({
      income: {
        shortTermCapitalGains: 50000,
        section112aLtcg: 175000,
      },
      flags: {
        hasForeignAssets: true,
      },
    }));

    expect(recommendation.form).toBe("ITR-2");
    expect(recommendation.blockers).toEqual(expect.arrayContaining([
      "ITR-1 cannot be used for short-term capital gains.",
      "ITR-1 cannot be used when Section 112A LTCG exceeds Rs 1.25 lakh.",
      "ITR-1 cannot be used for foreign assets, foreign signing authority, or foreign income.",
    ]));
    expect(recommendation.caReviewRequired).toBe(true);
    expect(recommendation.requiredSchedules).toEqual(expect.arrayContaining(["Schedule Capital Gains", "Schedule FA"]));
  });

  it("selects ITR-4 for eligible presumptive business or profession cases", () => {
    const recommendation = recommendItrForm(draft({
      income: {
        salary: 300000,
        businessIncome: 900000,
        presumptiveScheme: "44AD",
      },
    }));

    expect(recommendation.form).toBe("ITR-4");
    expect(recommendation.reasons).toContain("Business/profession income is declared under presumptive taxation.");
    expect(recommendation.requiredSchedules).toContain("Schedule 44AD");
  });

  it("selects ITR-3 when business income is not eligible for ITR-4", () => {
    const recommendation = recommendItrForm(draft({
      taxpayer: { type: "huf" },
      income: {
        businessIncome: 1500000,
        presumptiveScheme: "none",
      },
    }));

    expect(recommendation.form).toBe("ITR-3");
    expect(recommendation.exportAvailable).toBe(false);
    expect(recommendation.exportStatus.reason).toContain("ITR-3 AY 2026-27 schema is not synced");
    expect(recommendation.blockers).toContain("ITR-4 requires eligible presumptive business or profession income.");
  });

  it("routes unsupported ITR-5 to ITR-7 taxpayers to CA scope review", () => {
    const recommendation = recommendItrForm(draft({
      taxpayer: { type: "llp" },
      income: {
        businessIncome: 2000000,
        presumptiveScheme: "44AD",
      },
    }));

    expect(recommendation.form).toBe("CA_SCOPE_REVIEW");
    expect(recommendation.caReviewRequired).toBe(true);
    expect(recommendation.blockers).toContain("V1 supports ITR-1 to ITR-4 only; this taxpayer type needs CA scope review.");
  });
});

describe("ITR filing review helpers", () => {
  it("derives selected income types for legacy drafts while preserving an explicit empty selection", () => {
    const legacyDraft = normalizeItrDraft({
      income: {
        salary: 900000,
        housePropertyIncome: -120000,
        shortTermCapitalGains: -50000,
        professionalIncome: 250000,
      },
      flags: {
        hasForeignAssets: true,
      },
    });
    const explicitEmptyDraft = normalizeItrDraft({
      income: {
        selectedTypes: [],
        salary: 900000,
      },
    });

    expect(legacyDraft.income.selectedTypes).toEqual([
      "salary",
      "houseProperty",
      "capitalGains",
      "business",
      "foreign",
    ]);
    expect(explicitEmptyDraft.income.selectedTypes).toEqual([]);
  });

  it("normalizes filing owner and validates identity fields without claiming API verification", () => {
    const validation = validateItrIdentity(draft({
      filingOwner: {
        mode: "other",
        personId: "profile_parent",
        relationship: "parent",
        displayName: "Parent return",
      },
    }));

    expect(validation.panFormatValid).toBe(true);
    expect(validation.panVerificationMode).toBe("format_only");
    expect(validation.aadhaarFormatValid).toBe(true);
    expect(validation.ifscFormatValid).toBe(true);
    expect(validation.bankAccountConfirmed).toBe(true);
    expect(validation.missingRequiredFields).toEqual([]);
  });

  it("builds critical verification issues for invalid identity and bank confirmation", () => {
    const invalidDraft = draft({
      taxpayer: {
        pan: "abc",
        aadhaar: "111",
        firstName: "",
        lastName: "",
        bankAccount: "123456789012",
        bankAccountConfirm: "999999999999",
        ifsc: "bad-ifsc",
      },
    });
    const report = buildItrVerificationReport(invalidDraft);

    expect(report.status).toBe("blocked");
    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "pan-format", severity: "critical", paneId: "identity-pan-aadhaar", fieldId: "pan" }),
      expect.objectContaining({ id: "aadhaar-format", severity: "critical", paneId: "identity-pan-aadhaar", fieldId: "aadhaar" }),
      expect.objectContaining({ id: "bank-account-confirm", severity: "critical", paneId: "identity-account", fieldId: "bankAccountConfirm" }),
      expect.objectContaining({ id: "ifsc-format", severity: "critical", paneId: "identity-bank", fieldId: "ifsc" }),
    ]));
    expect(validateItrPane(invalidDraft, "identity-pan-aadhaar").map((issue) => issue.id)).toEqual([
      "pan-format",
      "aadhaar-format",
    ]);
  });

  it("persists document deferrals without treating them as linked evidence", () => {
    const deferredDraft = normalizeItrDraft({
      ...baseDraft,
      documentDeferrals: { form16: true },
    });
    const report = buildItrVerificationReport(deferredDraft);

    expect(deferredDraft.documentDeferrals).toEqual({ form16: true });
    expect(deferredDraft.documents.form16).toBeUndefined();
    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "document-form16", paneId: "document-form16" }),
    ]));
  });

  it("requires explicit confirmation when no income type is selected", () => {
    const unconfirmed = normalizeItrDraft({
      ...baseDraft,
      income: { selectedTypes: [], noIncomeConfirmed: false },
    });
    const confirmed = normalizeItrDraft({
      ...baseDraft,
      income: { selectedTypes: [], noIncomeConfirmed: true },
    });

    expect(validateItrPane(unconfirmed, "income-types")).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "income-none-unconfirmed", severity: "critical", paneId: "income-types" }),
    ]));
    expect(validateItrPane(confirmed, "income-types")).toEqual([]);
  });

  it("maps verification warnings to their source panes", () => {
    const report = buildItrVerificationReport(draft({
      filingOwner: {
        mode: "other",
      },
      income: {
        shortTermCapitalGains: 50000,
      },
    }));

    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "owner-other-person", paneId: "owner-person" }),
      expect.objectContaining({ id: "document-capital-gains", paneId: "document-capital-gains" }),
      expect.objectContaining({ id: "computation-gated", paneId: "compute-regimes" }),
    ]));
    expect(report.issues.find((issue) => issue.id.startsWith("form-blocker-"))?.paneId).toBe("income-capital-gains");
  });

  it("builds a document checklist from selected income sources and risk flags", () => {
    const checklist = getItrDocumentChecklist(draft({
      income: {
        shortTermCapitalGains: 50000,
        businessIncome: 100000,
        presumptiveScheme: "44ADA",
      },
      flags: {
        hasForeignAssets: true,
      },
    }));

    expect(checklist.map((item) => item.id)).toEqual(expect.arrayContaining([
      "form16",
      "ais",
      "form26as",
      "bank",
      "capital-gains",
      "business-receipts",
      "foreign-assets",
    ]));
  });

  it("computes ITR-1-grade AY 2026-27 tax liability and refund from the draft", () => {
    const liability = computeItrTaxLiability(baseDraft);

    expect(liability.status).toBe("computed");
    expect(liability.recommendedRegime).toBe("new");
    expect(liability.activeRegime).toBe("new");
    expect(liability.newRegime.grossTaxLiability).toBe(0);
    expect(liability.oldRegime.grossTaxLiability).toBe(63960);
    expect(liability.totalTaxPaid).toBe(65000);
    expect(liability.refundDue).toBe(65000);
    expect(liability.taxPayable).toBe(0);
    expect(liability.unsupportedReasons).toEqual([]);
  });

  it("gates non-ITR-1 computation into CA review for the phased build", () => {
    const liability = computeItrTaxLiability(draft({
      income: {
        shortTermCapitalGains: 50000,
      },
    }));

    expect(liability.status).toBe("review_required");
    expect(liability.unsupportedReasons).toContain("ITR-2 computation is gated for CA review in this phased release.");
  });

  it("creates a CA review packet with recommendation and tax summary", () => {
    const packet = buildItrReviewPacket(baseDraft, "return_1");

    expect(packet.taxReturnId).toBe("return_1");
    expect(packet.recommendation.form).toBe("ITR-1");
    expect(packet.summary.totalIncome).toBe(940000);
    expect(packet.summary.totalTaxPaid).toBe(65000);
    expect(packet.summary.taxLiability.status).toBe("computed");
    expect(packet.summary.taxLiability.refundDue).toBe(65000);
    expect(packet.status).toBe("ready_for_review");
  });

  it("exports ITR-1, ITR-2, and ITR-4 drafts with synced AY 2026-27 schema sources", () => {
    const itr1Export = buildItrDraftJsonExport(baseDraft, "return_1");
    const itr2Export = buildItrDraftJsonExport(draft({
      income: { shortTermCapitalGains: 1000 },
    }), "return_2");
    const itr4Export = buildItrDraftJsonExport(draft({
      income: {
        businessIncome: 800000,
        presumptiveScheme: "44ADA",
      },
    }), "return_4");

    expect(itr1Export).toMatchObject({
      available: true,
      form: "ITR-1",
      officialSchema: expect.objectContaining({ schemaUrl: expect.stringContaining("ITR-1_2026_Main") }),
    });
    expect(itr2Export).toMatchObject({
      available: true,
      form: "ITR-2",
      officialSchema: expect.objectContaining({ schemaUrl: expect.stringContaining("ITR-2_2026_Main") }),
    });
    expect(itr4Export).toMatchObject({
      available: true,
      form: "ITR-4",
      officialSchema: expect.objectContaining({ schemaUrl: expect.stringContaining("ITR-4_2026_Main") }),
    });
  });

  it("keeps export availability aligned with synced official AY 2026-27 schema metadata", () => {
    expect(incomeTaxFormsAssessmentYear).toBe("2026-27");

    for (const form of ["ITR-1", "ITR-2", "ITR-4"] as const) {
      const officialTitlePrefix = form.replace("-", " ");
      const syncedSchema = incomeTaxFormDownloads.find((download) =>
        download.fileType === "schema" &&
        download.title.startsWith(officialTitlePrefix),
      );

      expect(syncedSchema?.officialUrl).toBe(ITR_AY_2026_27_SCHEMA_EXPORTS[form]?.schemaUrl);
    }

    expect(incomeTaxFormDownloads.some((download) =>
      download.fileType === "schema" &&
      download.title.startsWith("ITR 3"),
    )).toBe(false);
  });
});

// Pins the verified AY 2026-27 (FY 2025-26) tax parameters so any drift in the
// slabs, rebate, standard deduction, special rates, or age-based exemptions is
// caught. See docs/ITR_AY2026-27_DETAILS_AUDIT_AND_PLAN.md (Part 5).
describe("AY 2026-27 verified parameters", () => {
  const salaryDraft = (salary: number, otherSources = 0) =>
    draft({ income: { salary, otherSources, section112aLtcg: 0, shortTermCapitalGains: 0, otherCapitalGains: 0 } });

  it("makes ₹12.75L salary tax-free under the new regime via the ₹60k rebate", () => {
    const liability = computeItrTaxLiability(salaryDraft(1_275_000));

    expect(liability.status).toBe("computed");
    expect(liability.newRegime.standardDeduction).toBe(75_000);
    expect(liability.newRegime.rebate87A).toBe(60_000);
    expect(liability.newRegime.grossTaxLiability).toBe(0);
  });

  it("applies new-regime marginal relief just above the ₹12L taxable ceiling", () => {
    // Salary 12.85L − 75k std = 12.10L taxable; slab tax 61,500 capped to ₹10k excess.
    const liability = computeItrTaxLiability(salaryDraft(1_285_000));

    expect(liability.newRegime.rebate87A).toBe(0);
    expect(liability.newRegime.marginalRelief).toBe(51_500);
    expect(liability.newRegime.grossTaxLiability).toBe(10_400);
  });

  it("taxes §112A LTCG above ₹1.25L at 12.5% (no rebate) and routes to CA review", () => {
    const liability = computeItrTaxLiability(
      draft({ income: { salary: 0, pension: 0, otherSources: 0, section112aLtcg: 325_000 } }),
    );

    // 325k − 125k exemption = 200k taxed at 12.5% = 25,000; +4% cess = 26,000.
    expect(liability.newRegime.specialRateTax).toBe(25_000);
    expect(liability.newRegime.grossTaxLiability).toBe(26_000);
    expect(liability.newRegime.rebate87A).toBe(0);
    expect(liability.status).toBe("review_required");
    expect(liability.unsupportedReasons.join(" ")).toMatch(/gated for CA review/i);
  });

  it("honours the old-regime senior-citizen ₹3L basic exemption", () => {
    const seniorOld = computeItrTaxLiability(draft({
      taxpayer: { dateOfBirth: "1960-01-01" },
      filing: { wantsOldRegime: true },
      income: { salary: 800_000, otherSources: 0 },
      deductions: { section80C: 0, section80D: 0, otherChapterVia: 0 },
    }));
    const regularOld = computeItrTaxLiability(draft({
      taxpayer: { dateOfBirth: "1990-01-01" },
      filing: { wantsOldRegime: true },
      income: { salary: 800_000, otherSources: 0 },
      deductions: { section80C: 0, section80D: 0, otherChapterVia: 0 },
    }));

    expect(seniorOld.oldRegime.grossTaxLiability).toBe(62_400);
    expect(regularOld.oldRegime.grossTaxLiability).toBe(65_000);
  });
});

// Phases 1–4 of docs/ITR_AY2026-27_DETAILS_AUDIT_AND_PLAN.md: capital-gains
// detail, surcharge, VDA, and presumptive computation. Advanced forms stay
// gated to CA review (status "review_required") while the estimate is computed.
describe("AY 2026-27 advanced computation (Phases 1-4)", () => {
  it("Phase 2 — applies 10% surcharge above ₹50L with no marginal relief when well clear", () => {
    const liability = computeItrTaxLiability(draft({ income: { salary: 6_000_000, otherSources: 0 } }));

    expect(liability.newRegime.surcharge).toBe(135_750);
    expect(liability.newRegime.grossTaxLiability).toBe(1_552_980);
    expect(liability.status).toBe("review_required");
  });

  it("Phase 2 — caps tax+surcharge via marginal relief just above ₹50L", () => {
    const liability = computeItrTaxLiability(draft({ income: { salary: 5_100_000, otherSources: 0 } }));

    // Without relief surcharge would be 108,750; relief trims it to 17,500.
    expect(liability.newRegime.surcharge).toBe(17_500);
    expect(liability.newRegime.grossTaxLiability).toBe(1_149_200);
  });

  it("Phase 3 — taxes VDA/crypto at a flat 30% with no rebate and routes to CA review", () => {
    const liability = computeItrTaxLiability(
      draft({ income: { salary: 0, otherSources: 0, vdaIncome: 100_000 } }),
    );

    expect(liability.newRegime.specialRateTax).toBe(30_000);
    expect(liability.newRegime.grossTaxLiability).toBe(31_200);
    expect(liability.status).toBe("review_required");
    expect(liability.unsupportedReasons.join(" ")).toMatch(/gated for CA review/i);
  });

  it("Phase 4 — computes §44ADA presumptive income at 50% of professional receipts", () => {
    const liability = computeItrTaxLiability(draft({
      income: { salary: 0, otherSources: 0, professionalIncome: 1_000_000, presumptiveScheme: "44ADA" },
    }));

    expect(liability.newRegime.taxableIncome).toBe(500_000);
    expect(liability.newRegime.normalSlabTax).toBe(5_000);
    expect(liability.status).toBe("review_required");
  });

  it("Phase 4 — uses 6% §44AD for digital turnover and 8% for cash-heavy turnover", () => {
    const digital = computeItrTaxLiability(draft({
      income: { salary: 0, otherSources: 0, businessIncome: 2_000_000, presumptiveScheme: "44AD", cashReceiptsWithinFivePercent: true },
    }));
    const cashHeavy = computeItrTaxLiability(draft({
      income: { salary: 0, otherSources: 0, businessIncome: 2_000_000, presumptiveScheme: "44AD", cashReceiptsWithinFivePercent: false },
    }));

    expect(digital.newRegime.taxableIncome).toBe(120_000);
    expect(cashHeavy.newRegime.taxableIncome).toBe(160_000);
  });

  it("Phase 1 — applies §112A grandfathering and the ₹1.25L exemption to listed-equity LTCG", () => {
    const liability = computeItrTaxLiability(draft({
      income: {
        salary: 0,
        otherSources: 0,
        capitalGainsEntries: [{
          assetClass: "listed_equity",
          acquisitionDate: "2017-01-01",
          saleDate: "2025-06-01",
          cost: 100_000,
          proceeds: 500_000,
          expenses: 0,
          fmv31Jan2018: 300_000,
        }],
      },
    }));

    // Grandfathered cost 300k → gain 200k; minus ₹1.25L = 75k @ 12.5% = 9,375 (+cess).
    expect(liability.newRegime.specialRateTax).toBe(9_375);
    expect(liability.newRegime.grossTaxLiability).toBe(9_750);
    expect(liability.status).toBe("review_required");
  });

  it("Phase 1 — picks the lower of 12.5% unindexed vs 20% indexed (CII 376) for pre-July-2024 property", () => {
    const liability = computeItrTaxLiability(draft({
      income: {
        salary: 0,
        otherSources: 0,
        capitalGainsEntries: [{
          assetClass: "immovable",
          acquisitionDate: "2014-08-01",
          saleDate: "2025-06-01",
          cost: 1_000_000,
          proceeds: 2_000_000,
          expenses: 0,
          fmv31Jan2018: 0,
        }],
      },
    }));

    // Unindexed: 1,000,000 @ 12.5% = 125,000. Indexed (376/240): gain 433,333 @ 20% = 86,667 → lower wins.
    expect(liability.newRegime.specialRateTax).toBe(86_667);
    expect(liability.newRegime.grossTaxLiability).toBe(90_133);
  });

  it("Phase 1 — treats post-April-2023 debt funds as slab-rate short-term gains (§50AA)", () => {
    const liability = computeItrTaxLiability(draft({
      income: {
        salary: 0,
        otherSources: 0,
        capitalGainsEntries: [{
          assetClass: "debt",
          acquisitionDate: "2023-06-01",
          saleDate: "2025-06-01",
          cost: 100_000,
          proceeds: 150_000,
          expenses: 0,
          fmv31Jan2018: 0,
        }],
      },
    }));

    // 50k gain taxed at slab → flows into normal taxable income, not the special block.
    expect(liability.newRegime.taxableIncome).toBe(50_000);
    expect(liability.newRegime.specialRateTax).toBe(0);
    expect(liability.status).toBe("review_required");
  });
});
