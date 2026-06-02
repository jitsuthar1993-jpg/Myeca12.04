import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ITR_START_SELECTOR_ANSWERS, readItrStartHandoff, writeItrStartHandoff } from "@/features/itr/lib/start-selector";
import { apiRequest } from "@/lib/queryClient";
import { ITR_FILING_LAYOUT, ITR_FILING_STEPS, WORKSPACE_ITR_REVIEW_STATUSES } from "./filing.page";
import ITRFilingPage from "./filing.page";

const apiRequestMock = vi.hoisted(() => vi.fn());
const invalidateQueriesMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/queryClient", () => ({
  apiRequest: apiRequestMock,
  queryClient: {
    invalidateQueries: invalidateQueriesMock,
  },
}));

vi.mock("@/components/admin/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => React.createElement("div", {}, children),
}));

vi.mock("wouter", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href }, children),
}));

function jsonResponse(data: unknown) {
  return {
    json: async () => data,
  } as Response;
}

function renderFilingPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(ITRFilingPage),
    ),
  );
}

function taxReturn(overrides: Record<string, unknown> = {}) {
  return {
    id: "return_1",
    profileId: null,
    assessmentYear: "2026-27",
    itrType: "ITR-1",
    status: "draft",
    reviewStatus: "draft",
    formData: {
      assessmentYear: "2026-27",
      taxpayer: { type: "individual", residentialStatus: "resident" },
      income: { salary: 900000, otherSources: 40000 },
    },
    ...overrides,
  };
}

function setupApi(taxReturns: unknown[]) {
  apiRequestMock.mockImplementation(async (url: string, options?: { method?: string; body?: string }) => {
    if (url === "/api/tax-returns" && options?.method === "POST") {
      const body = JSON.parse(options.body || "{}");
      return jsonResponse({
        taxReturn: taxReturn({
          id: "return_from_handoff",
          assessmentYear: body.assessmentYear,
          formData: body.draft,
        }),
      });
    }

    if (url === "/api/tax-returns/return_1" && options?.method === "PATCH") {
      const body = JSON.parse(options.body || "{}");
      return jsonResponse({
        taxReturn: taxReturn({
          formData: body.draft,
        }),
      });
    }

    if (url === "/api/tax-returns") {
      return jsonResponse({ taxReturns });
    }

    if (url === "/api/documents") {
      return jsonResponse({ documents: [] });
    }

    return jsonResponse({});
  });
}

describe("ITR filing workspace", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    invalidateQueriesMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("follows the signed-in draft-to-CA-review filing sequence", () => {
    expect(ITR_FILING_STEPS.map((step) => step.id)).toEqual([
      "profile",
      "income-sources",
      "documents",
      "income-details",
      "deductions",
      "tax-paid",
      "form-selection",
      "ca-review",
      "e-verify",
    ]);
  });

  it("surfaces the full CA review status lifecycle", () => {
    expect(WORKSPACE_ITR_REVIEW_STATUSES).toEqual([
      "draft",
      "ready_for_review",
      "ca_review",
      "changes_requested",
      "approved_for_filing",
      "filed",
      "e_verified",
      "refund_or_demand_tracking",
    ]);
  });

  it("keeps filing progress in the main workspace instead of a separate left rail", () => {
    expect(ITR_FILING_LAYOUT).toEqual({
      usesDedicatedLeftRail: false,
      usesAuthenticatedWorkspaceShell: true,
      mobileActionBarOffset: "above-user-bottom-nav",
      tone: "professional",
    });
  });

  it("auto-creates the first tax return from a valid selector handoff", async () => {
    setupApi([]);
    writeItrStartHandoff({
      answers: {
        ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
        capitalGains: "short-term",
      },
      source: "homepage_hero",
    });

    renderFilingPage();

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith("/api/tax-returns", expect.objectContaining({ method: "POST" }));
    });

    const createCall = apiRequestMock.mock.calls.find(([url, options]) =>
      url === "/api/tax-returns" && options?.method === "POST"
    );
    const body = JSON.parse(createCall?.[1]?.body || "{}");
    expect(body.draft.income.shortTermCapitalGains).toBeGreaterThan(0);
    expect(body.draft.taxpayer.type).toBe("individual");
    expect(readItrStartHandoff()).toBeNull();
  });

  it("offers to resume a selector handoff without overwriting an existing draft", async () => {
    setupApi([taxReturn()]);
    writeItrStartHandoff({
      answers: {
        ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
        capitalGains: "short-term",
      },
      source: "pricing_plan_card",
    });

    renderFilingPage();

    expect(await screen.findByText("Resume your ITR plan")).toBeInTheDocument();
    expect(apiRequestMock.mock.calls.some(([url, options]) => url === "/api/tax-returns" && options?.method === "POST")).toBe(false);
    expect(apiRequestMock.mock.calls.some(([url, options]) => String(url).includes("/return_1") && options?.method === "PATCH")).toBe(false);
  });

  it("applies a selector handoff to the active draft only when the user chooses it", async () => {
    setupApi([taxReturn()]);
    writeItrStartHandoff({
      answers: {
        ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
        capitalGains: "short-term",
      },
      source: "pricing_plan_card",
    });

    renderFilingPage();
    await userEvent.click(await screen.findByRole("button", { name: /Apply plan/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith("/api/tax-returns/return_1", expect.objectContaining({ method: "PATCH" }));
    });

    const patchCall = apiRequestMock.mock.calls.find(([url, options]) =>
      url === "/api/tax-returns/return_1" && options?.method === "PATCH"
    );
    const body = JSON.parse(patchCall?.[1]?.body || "{}");
    expect(body.draft.income.shortTermCapitalGains).toBeGreaterThan(0);
    expect(readItrStartHandoff()).toBeNull();
  });

  it("dismisses a selector handoff without changing the active draft", async () => {
    setupApi([taxReturn()]);
    writeItrStartHandoff({
      answers: DEFAULT_ITR_START_SELECTOR_ANSWERS,
      source: "pricing_plan_card",
    });

    renderFilingPage();
    await userEvent.click(await screen.findByRole("button", { name: /Dismiss plan/i }));

    expect(readItrStartHandoff()).toBeNull();
    expect(apiRequestMock.mock.calls.some(([url, options]) => String(url).includes("/return_1") && options?.method === "PATCH")).toBe(false);
  });
});
