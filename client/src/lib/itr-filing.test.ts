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
      expect.objectContaining({ id: "pan-format", severity: "critical", paneId: "identity-pan-aadhaar" }),
      expect.objectContaining({ id: "aadhaar-format", severity: "critical", paneId: "identity-pan-aadhaar" }),
      expect.objectContaining({ id: "bank-account-confirm", severity: "critical", paneId: "identity-account" }),
      expect.objectContaining({ id: "ifsc-format", severity: "critical", paneId: "identity-bank" }),
    ]));
    expect(validateItrPane(invalidDraft, "identity-pan-aadhaar").map((issue) => issue.id)).toEqual([
      "pan-format",
      "aadhaar-format",
    ]);
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
