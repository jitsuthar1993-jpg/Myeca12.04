import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recommendItrForm } from "@shared/itr-filing";
import {
  DEFAULT_ITR_START_SELECTOR_ANSWERS,
  ITR_START_HANDOFF_TTL_MS,
  ITR_START_SELECTOR_STORAGE_KEY,
  buildItrStartDraft,
  clearItrStartHandoff,
  readItrStartHandoff,
  writeItrStartHandoff,
  type ItrStartSelectorAnswers,
} from "./start-selector";

function recommendationFor(overrides: Partial<ItrStartSelectorAnswers>) {
  return recommendItrForm(buildItrStartDraft({
    ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
    ...overrides,
  }));
}

describe("ITR start form selector mapper", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps the default public selector answers to ITR-1", () => {
    const recommendation = recommendationFor({});

    expect(recommendation.form).toBe("ITR-1");
    expect(recommendation.caReviewRequired).toBe(false);
    expect(recommendation.requiredSchedules).toContain("Schedule Salary");
  });

  it("maps non-business capital gains complexity to ITR-2", () => {
    const recommendation = recommendationFor({
      capitalGains: "short-term",
    });

    expect(recommendation.form).toBe("ITR-2");
    expect(recommendation.blockers).toContain("ITR-1 cannot be used for short-term capital gains.");
  });

  it("maps non-presumptive business cases to ITR-3", () => {
    const recommendation = recommendationFor({
      businessOrProfession: "business",
      presumptiveScheme: "none",
    });

    expect(recommendation.form).toBe("ITR-3");
    expect(recommendation.exportAvailable).toBe(false);
  });

  it("maps eligible presumptive profession cases to ITR-4", () => {
    const recommendation = recommendationFor({
      salaryOrPension: false,
      businessOrProfession: "profession",
      presumptiveScheme: "44ADA",
    });

    expect(recommendation.form).toBe("ITR-4");
    expect(recommendation.requiredSchedules).toContain("Schedule 44ADA");
  });

  it("keeps the public selector scoped to individual taxpayers", () => {
    const draft = buildItrStartDraft({
      ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
      taxpayerType: "llp",
    } as any);

    expect(draft.taxpayer.type).toBe("individual");
  });

  it("stores and reads a normalized selector handoff payload", () => {
    const now = Date.UTC(2026, 5, 1, 10, 0, 0);

    const written = writeItrStartHandoff({
      answers: {
        ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
        capitalGains: "short-term",
      },
      source: "unit_test",
      attribution: {
        source: "paid_search",
        utmCampaign: "itr-season-2026",
        partnerCode: "CA-DELHI-01",
        firstTouchAt: "2026-06-01T10:00:00.000Z",
      },
      now,
    });

    const stored = readItrStartHandoff({ now });

    expect(stored).toMatchObject({
      version: 1,
      flowId: written.flowId,
      source: "unit_test",
      attribution: {
        source: "paid_search",
        utmCampaign: "itr-season-2026",
        partnerCode: "CA-DELHI-01",
      },
      answers: { capitalGains: "short-term" },
      recommendation: { form: "ITR-2" },
    });
    expect(stored?.draft.taxpayer.type).toBe("individual");
    expect(stored?.draft.income.shortTermCapitalGains).toBeGreaterThan(0);
  });

  it("expires stale selector handoff payloads", () => {
    const now = Date.UTC(2026, 5, 1, 10, 0, 0);

    writeItrStartHandoff({
      answers: DEFAULT_ITR_START_SELECTOR_ANSWERS,
      source: "unit_test",
      now,
    });

    expect(readItrStartHandoff({ now: now + ITR_START_HANDOFF_TTL_MS + 1 })).toBeNull();
    expect(readItrStartHandoff({ now })).toBeNull();
  });

  it("falls back to sessionStorage when localStorage is unavailable", () => {
    const now = Date.UTC(2026, 5, 1, 10, 0, 0);
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("localStorage blocked");
    });

    const written = writeItrStartHandoff({
      answers: DEFAULT_ITR_START_SELECTOR_ANSWERS,
      source: "unit_test",
      now,
    });

    expect(sessionStorage.getItem(ITR_START_SELECTOR_STORAGE_KEY)).toContain(written.flowId);
    expect(readItrStartHandoff({ now })?.flowId).toBe(written.flowId);
  });

  it("clears corrupt selector handoff payloads", () => {
    localStorage.setItem("myeca:itr-start-form-selector", "{not-json");

    expect(readItrStartHandoff()).toBeNull();
    expect(localStorage.getItem("myeca:itr-start-form-selector")).toBeNull();
  });

  it("normalizes handoff answers before rebuilding the draft", () => {
    const payload = writeItrStartHandoff({
      answers: {
        ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
        businessOrProfession: "none",
        presumptiveScheme: "44ADA",
      },
      source: "unit_test",
      now: Date.UTC(2026, 5, 1, 10, 0, 0),
    });

    expect(payload.answers.presumptiveScheme).toBe("none");
    expect(payload.draft.income.presumptiveScheme).toBe("none");

    clearItrStartHandoff();
    expect(readItrStartHandoff()).toBeNull();
  });
});
