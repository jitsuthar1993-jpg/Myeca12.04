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
let isMobile = false;

vi.mock("@/lib/queryClient", () => ({
  apiRequest: apiRequestMock,
  queryClient: {
    invalidateQueries: invalidateQueriesMock,
  },
}));

vi.mock("@/components/admin/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => React.createElement("div", {}, children),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => isMobile,
}));

vi.mock("@/telemetry/browser", () => ({
  captureTelemetryEvent: vi.fn(),
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

function validDraft() {
  return {
    assessmentYear: "2026-27",
    filingOwner: { mode: "self" },
    taxpayer: {
      type: "individual",
      residentialStatus: "resident",
      firstName: "Mobile",
      lastName: "Filer",
      dateOfBirth: "1990-01-01",
      pan: "ABCDE1234F",
      aadhaar: "123412341234",
      mobile: "9876543210",
      email: "mobile@example.com",
      bankAccountHolder: "Mobile Filer",
      bankName: "Example Bank",
      ifsc: "HDFC0001234",
      bankAccount: "123456789012",
      bankAccountConfirm: "123456789012",
      bankAccountType: "savings",
    },
    income: { selectedTypes: ["salary"], salary: 900000 },
    taxPaid: { tds: 65000 },
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
    isMobile = false;
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    localStorage.clear();
    sessionStorage.clear();
  });

  it("follows the signed-in draft-to-CA-review filing sequence", () => {
    expect(ITR_FILING_STEPS.map((step) => step.id)).toEqual([
      "owner",
      "identity",
      "income",
      "documents",
      "verify",
      "compute",
      "review",
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

  it("renders the simplified guided owner step without false verification claims", async () => {
    setupApi([taxReturn({
      formData: {
        assessmentYear: "2026-27",
        filingOwner: { mode: "self" },
        taxpayer: {
          type: "individual",
          residentialStatus: "resident",
          pan: "ABCDE1234F",
          aadhaar: "123412341234",
          bankAccount: "123456789012",
          bankAccountConfirm: "123456789012",
          ifsc: "HDFC0001234",
        },
        income: { salary: 900000, otherSources: 40000 },
        taxPaid: { tds: 65000 },
      },
    })]);

    renderFilingPage();

    expect(await screen.findByText("Self-prep with CA review")).toBeInTheDocument();
    expect(screen.getByText("My own ITR")).toBeInTheDocument();
    expect(screen.getByText("Another person")).toBeInTheDocument();
    expect(screen.getByText("Tax liability")).toBeInTheDocument();
    expect(screen.queryByText(/API verified/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/UIDAI verified/i)).not.toBeInTheDocument();
  });

  it("shows a retryable error when filing drafts fail to load", async () => {
    apiRequestMock.mockRejectedValueOnce(new Error("404: API route not found"));

    renderFilingPage();

    expect(await screen.findByText("We couldn't load your ITR drafts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Start from scratch/i })).not.toBeInTheDocument();
  });

  it("recovers the start action when draft creation fails", async () => {
    apiRequestMock.mockImplementation(async (url: string, options?: { method?: string }) => {
      if (url === "/api/tax-returns" && options?.method === "POST") {
        throw new Error("405: Method not allowed");
      }

      if (url === "/api/tax-returns") {
        return jsonResponse({ taxReturns: [] });
      }

      return jsonResponse({});
    });

    renderFilingPage();
    await userEvent.click(await screen.findByRole("button", { name: /Start from scratch/i }));

    expect(await screen.findByText("We couldn't start your ITR draft")).toBeInTheDocument();
    expect(screen.getByText(/Method not allowed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start from scratch/i })).toBeEnabled();
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

  it("shows one focused pane at a time on mobile", async () => {
    isMobile = true;
    setupApi([taxReturn({ formData: validDraft() })]);

    renderFilingPage();

    expect(await screen.findByText("My own ITR")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(await screen.findByLabelText("First name")).toBeInTheDocument();
    expect(screen.queryByLabelText("PAN")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(await screen.findByLabelText("PAN")).toBeInTheDocument();

    window.dispatchEvent(new PopStateEvent("popstate", {
      state: { myecaItrPane: { step: 1, pane: 0 } },
    }));
    expect(await screen.findByLabelText("First name")).toBeInTheDocument();
    expect(screen.queryByLabelText("PAN")).not.toBeInTheDocument();
  });

  it("keeps a mobile filer on an invalid identity pane and shows inline errors", async () => {
    isMobile = true;
    setupApi([taxReturn({
      formData: {
        ...validDraft(),
        taxpayer: {
          ...validDraft().taxpayer,
          pan: "",
          aadhaar: "",
        },
      },
    })]);
    renderFilingPage();

    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(await screen.findByLabelText("PAN")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(screen.getByLabelText("PAN")).toBeInTheDocument();
    expect(screen.getByText(/PAN format needs correction/i)).toBeInTheDocument();
    expect(screen.getByText(/Aadhaar format needs correction/i)).toBeInTheDocument();
  });

  it("hides Save draft on mobile and persists Provide later as a deferral", async () => {
    isMobile = true;
    setupApi([taxReturn({ formData: validDraft() })]);
    renderFilingPage();

    expect(await screen.findByRole("button", { name: /Continue/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Save draft/i })).not.toBeInTheDocument();

    while (screen.queryAllByText("Document checklist", { exact: true }).length === 0) {
      await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    }
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await userEvent.click(await screen.findByRole("button", { name: /Provide later/i }));

    await waitFor(() => {
      const patchCall = apiRequestMock.mock.calls.filter(([url, options]) =>
        url === "/api/tax-returns/return_1" && options?.method === "PATCH"
      ).at(-1);
      expect(JSON.parse(patchCall?.[1]?.body || "{}").draft.documentDeferrals.form16).toBe(true);
    });
  }, 10_000);

  it("shows only masked identity values in the review recap", async () => {
    setupApi([taxReturn({ formData: validDraft() })]);
    renderFilingPage();

    const reviewStep = (await screen.findAllByText("Review")).find((node) => node.closest("button"));
    await userEvent.click(reviewStep!.closest("button") as HTMLButtonElement);

    expect(screen.getByText("ABCDE••••F")).toBeInTheDocument();
    expect(screen.getByText("•••• •••• 1234")).toBeInTheDocument();
    expect(screen.getByText("••••••••9012")).toBeInTheDocument();
    expect(screen.queryByText("ABCDE1234F")).not.toBeInTheDocument();
    expect(screen.queryByText("123412341234")).not.toBeInTheDocument();
    expect(screen.queryByText("123456789012")).not.toBeInTheDocument();
  });

  it("remasks sensitive account fields after leaving the mobile account pane", async () => {
    isMobile = true;
    setupApi([taxReturn({ formData: validDraft() })]);
    renderFilingPage();

    for (let index = 0; index < 5; index += 1) {
      await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    }
    const accountInput = await screen.findByLabelText("Account number");
    expect(accountInput).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("switch", { name: "Show account numbers" }));
    expect(accountInput).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Previous pane" }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(await screen.findByLabelText("Account number")).toHaveAttribute("type", "password");
  });

  it("moves through mobile fields with Enter and completes the pane from the final field", async () => {
    isMobile = true;
    setupApi([taxReturn({ formData: validDraft() })]);
    renderFilingPage();

    await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    const firstName = await screen.findByLabelText("First name");
    firstName.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByLabelText("Last name")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByLabelText("Date of birth")).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByLabelText("PAN")).toBeInTheDocument();
  });

  it("requires explicit no-income confirmation before leaving an empty income pane", async () => {
    isMobile = true;
    setupApi([taxReturn({
      formData: {
        ...validDraft(),
        income: { selectedTypes: [], noIncomeConfirmed: false },
      },
    })]);
    renderFilingPage();

    for (let index = 0; index < 6; index += 1) {
      await userEvent.click(await screen.findByRole("button", { name: /Continue/i }));
    }
    expect(await screen.findByText("No income to report")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(screen.getByText("Confirm that no income type applies")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /No income to report/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(await screen.findByLabelText("80C")).toBeInTheDocument();
  });

  it("truthfully explains that offline edits require the page to stay open", async () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    setupApi([taxReturn({ formData: validDraft() })]);
    renderFilingPage();

    expect(await screen.findByText("Offline. Keep this page open; changes will save after reconnecting.")).toBeInTheDocument();
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  });

  it("selects income types without inserting fake amounts", async () => {
    setupApi([taxReturn({
      formData: {
        assessmentYear: "2026-27",
        filingOwner: { mode: "self" },
        taxpayer: { type: "individual", residentialStatus: "resident" },
        income: { selectedTypes: [] },
      },
    })]);

    renderFilingPage();
    await userEvent.click((await screen.findByText("Income")).closest("button") as HTMLButtonElement);
    await userEvent.click(screen.getByRole("button", { name: /Capital gains/i }));

    await waitFor(() => {
      const patchCall = apiRequestMock.mock.calls.find(([url, options]) =>
        url === "/api/tax-returns/return_1" && options?.method === "PATCH"
      );
      expect(patchCall).toBeTruthy();
      const body = JSON.parse(patchCall?.[1]?.body || "{}");
      expect(body.draft.income.selectedTypes).toContain("capitalGains");
      expect(body.draft.income.shortTermCapitalGains).toBe(0);
      expect(body.draft.income.section112aLtcg).toBe(0);
    });
  });

  it("does not mirror authenticated filing edits into browser storage", async () => {
    setupApi([taxReturn()]);
    const localStorageSpy = vi.spyOn(Storage.prototype, "setItem");

    renderFilingPage();
    await userEvent.click(await screen.findByRole("button", { name: /Identity/i }));
    await userEvent.type(screen.getByLabelText("First name"), "A");

    expect(localStorageSpy).not.toHaveBeenCalled();
  });

  it("flushes the latest revision with keepalive when the page is hidden", async () => {
    setupApi([taxReturn()]);
    renderFilingPage();
    const identityStep = (await screen.findAllByText("Identity")).find((node) => node.closest("button"));
    await userEvent.click(identityStep!.closest("button") as HTMLButtonElement);
    await userEvent.type(screen.getByLabelText("First name"), "A");

    window.dispatchEvent(new PageTransitionEvent("pagehide"));

    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith(
        "/api/tax-returns/return_1",
        expect.objectContaining({ method: "PATCH", keepalive: true }),
      );
    });
  });

  it("keeps offline edits pending and saves them after reconnect", async () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    setupApi([taxReturn()]);
    renderFilingPage();
    const identityStep = (await screen.findAllByText("Identity")).find((node) => node.closest("button"));
    await userEvent.click(identityStep!.closest("button") as HTMLButtonElement);
    await userEvent.type(screen.getByLabelText("First name"), "A");

    expect(screen.getByText("Changes not saved")).toBeInTheDocument();
    expect(apiRequestMock.mock.calls.some(([url, options]) =>
      url === "/api/tax-returns/return_1" && options?.method === "PATCH"
    )).toBe(false);

    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    window.dispatchEvent(new Event("online"));

    await waitFor(() => {
      expect(apiRequestMock.mock.calls.some(([url, options]) =>
        url === "/api/tax-returns/return_1" && options?.method === "PATCH"
      )).toBe(true);
    });
  });

  it("queues edits made while an autosave request is in flight", async () => {
    let resolveFirstSave: (() => void) | undefined;
    let patchCount = 0;
    apiRequestMock.mockImplementation(async (url: string, options?: { method?: string; body?: string }) => {
      if (url === "/api/tax-returns") return jsonResponse({ taxReturns: [taxReturn()] });
      if (url === "/api/documents") return jsonResponse({ documents: [] });
      if (url === "/api/tax-returns/return_1" && options?.method === "PATCH") {
        patchCount += 1;
        if (patchCount === 1) {
          await new Promise<void>((resolve) => {
            resolveFirstSave = resolve;
          });
        }
        return jsonResponse({ taxReturn: taxReturn({ formData: JSON.parse(options.body || "{}").draft }) });
      }
      return jsonResponse({});
    });

    renderFilingPage();
    const identityStep = (await screen.findAllByText("Identity")).find((node) => node.closest("button"));
    await userEvent.click(identityStep!.closest("button") as HTMLButtonElement);
    const firstName = screen.getByLabelText("First name");
    await userEvent.type(firstName, "A");

    await waitFor(() => expect(patchCount).toBe(1), { timeout: 2000 });
    await userEvent.type(firstName, "B");
    resolveFirstSave?.();

    await waitFor(() => expect(patchCount).toBe(2), { timeout: 2500 });
    const lastPatch = apiRequestMock.mock.calls.filter(([url, options]) =>
      url === "/api/tax-returns/return_1" && options?.method === "PATCH"
    ).at(-1);
    expect(JSON.parse(lastPatch?.[1]?.body || "{}").draft.taxpayer.firstName).toBe("AB");
  });

  it("shows a failed save without immediately retrying in a loop", async () => {
    let patchCount = 0;
    apiRequestMock.mockImplementation(async (url: string, options?: { method?: string }) => {
      if (url === "/api/tax-returns") return jsonResponse({ taxReturns: [taxReturn()] });
      if (url === "/api/documents") return jsonResponse({ documents: [] });
      if (url === "/api/tax-returns/return_1" && options?.method === "PATCH") {
        patchCount += 1;
        throw new Error("Save unavailable");
      }
      return jsonResponse({});
    });

    renderFilingPage();
    const identityStep = (await screen.findAllByText("Identity")).find((node) => node.closest("button"));
    await userEvent.click(identityStep!.closest("button") as HTMLButtonElement);
    await userEvent.type(screen.getByLabelText("First name"), "A");

    expect(await screen.findByText("We couldn't save your latest draft changes")).toBeInTheDocument();
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    expect(patchCount).toBe(1);
  });

  it("shows vault-link failures and clears them after a successful retry", async () => {
    Object.defineProperties(HTMLElement.prototype, {
      hasPointerCapture: { configurable: true, value: () => false },
      setPointerCapture: { configurable: true, value: () => undefined },
      releasePointerCapture: { configurable: true, value: () => undefined },
      scrollIntoView: { configurable: true, value: () => undefined },
    });
    let linkAttempts = 0;
    apiRequestMock.mockImplementation(async (url: string, options?: { method?: string }) => {
      if (url === "/api/tax-returns") {
        return jsonResponse({ taxReturns: [taxReturn({ formData: validDraft() })] });
      }
      if (url === "/api/documents") {
        return jsonResponse({ documents: [{ id: "doc_form16", name: "Form 16.pdf", category: "form16" }] });
      }
      if (url === "/api/tax-returns/return_1/documents" && options?.method === "POST") {
        linkAttempts += 1;
        if (linkAttempts === 1) throw new Error("Link unavailable");
        return jsonResponse({
          taxReturn: taxReturn({
            formData: { ...validDraft(), documents: { form16: "doc_form16" } },
          }),
        });
      }
      return jsonResponse({});
    });

    renderFilingPage();
    const documentsStep = (await screen.findAllByText("Documents")).find((node) => node.closest("button"));
    await userEvent.click(documentsStep!.closest("button") as HTMLButtonElement);
    const vaultPicker = (await screen.findAllByRole("combobox"))[0];
    await userEvent.click(vaultPicker);
    await userEvent.click(await screen.findByRole("option", { name: "Form 16.pdf" }));

    expect(await screen.findByText(/Could not link document/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry upload" }));

    await waitFor(() => expect(screen.queryByText(/Could not link document/)).not.toBeInTheDocument());
    expect(screen.getAllByText("Form 16.pdf").length).toBeGreaterThan(0);
  });

  it("flushes pending edits before submitting for CA review", async () => {
    const mutationOrder: string[] = [];
    apiRequestMock.mockImplementation(async (url: string, options?: { method?: string; body?: string }) => {
      if (url === "/api/tax-returns") {
        return jsonResponse({ taxReturns: [taxReturn({ formData: validDraft() })] });
      }
      if (url === "/api/documents") return jsonResponse({ documents: [] });
      if (url === "/api/tax-returns/return_1" && options?.method === "PATCH") {
        mutationOrder.push("patch");
        return jsonResponse({ taxReturn: taxReturn({ formData: JSON.parse(options.body || "{}").draft }) });
      }
      if (url === "/api/tax-returns/return_1/submit-review" && options?.method === "POST") {
        mutationOrder.push("submit");
        return jsonResponse({ success: true });
      }
      return jsonResponse({});
    });

    renderFilingPage();
    const identityStep = (await screen.findAllByText("Identity")).find((node) => node.closest("button"));
    await userEvent.click(identityStep!.closest("button") as HTMLButtonElement);
    await userEvent.type(screen.getByLabelText("First name"), "A");
    const reviewStep = screen.getAllByText("Review").find((node) => node.closest("button"));
    await userEvent.click(reviewStep!.closest("button") as HTMLButtonElement);
    await userEvent.click(screen.getByRole("button", { name: "Submit for CA review" }));

    await waitFor(() => expect(mutationOrder).toEqual(["patch", "submit"]));
  });
});
