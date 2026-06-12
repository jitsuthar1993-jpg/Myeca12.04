import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ITRHubPage from "./hub.page";

const apiRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/queryClient", () => ({
  apiRequest: apiRequestMock,
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock("@/components/admin/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => React.createElement("div", {}, children),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { firstName: "Jit", lastName: "Suthar", assignedCaName: "CA Meera Shah" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/telemetry/browser", () => ({
  captureTelemetryEvent: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...rest }, children),
}));

function jsonResponse(data: unknown) {
  return { json: async () => data } as Response;
}

function setupApi({ taxReturns = [], documents = [] }: { taxReturns?: unknown[]; documents?: unknown[] }) {
  apiRequestMock.mockImplementation(async (url: string) => {
    if (url === "/api/tax-returns") return jsonResponse({ taxReturns });
    if (url === "/api/documents") return jsonResponse({ documents });
    return jsonResponse({});
  });
}

function renderHub() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(QueryClientProvider, { client }, React.createElement(ITRHubPage)),
  );
}

describe("MY ITR hub", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    localStorage.clear();
  });

  it("shows New filing and Previous ITR documents as the top actions", async () => {
    setupApi({});

    renderHub();

    expect(await screen.findByText("New filing")).toBeInTheDocument();
    expect(screen.getAllByText("Previous ITR documents").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("New filing").closest("a")).toHaveAttribute("href", "/itr/filing/new");
    expect(screen.getByText("CA-assisted filing")).toBeInTheDocument();
    expect(screen.getByText(/CA Meera Shah/)).toBeInTheDocument();
  });

  it("shows an empty previous-documents state with a start action", async () => {
    setupApi({});

    renderHub();

    expect(await screen.findByText("No ITR records yet")).toBeInTheDocument();
    expect(screen.getByText("Start a new filing")).toBeInTheDocument();
  });

  it("offers Continue for open drafts and View status for submitted returns", async () => {
    setupApi({
      taxReturns: [
        {
          id: "draft_1",
          profileId: null,
          assessmentYear: "2026-27",
          itrType: "ITR-1",
          status: "draft",
          formData: { filingOwner: { mode: "self" }, taxpayer: { firstName: "Jit", lastName: "Suthar" } },
        },
        {
          id: "filed_1",
          profileId: "profile_1",
          assessmentYear: "2025-26",
          itrType: "ITR-2",
          status: "filed",
          acknowledgmentNumber: "123456789012345",
          formData: { filingOwner: { mode: "other", displayName: "Asha Suthar" } },
        },
      ],
      documents: [
        { id: "doc_1", name: "ITR-V.pdf", taxReturnId: "filed_1" },
      ],
    });

    renderHub();

    expect(await screen.findByText("Continue filing")).toBeInTheDocument();
    const continueLinks = screen.getAllByText("Continue").map((node) => node.closest("a"));
    expect(continueLinks.some((link) => link?.getAttribute("href") === "/itr/filing/draft_1")).toBe(true);
    expect(screen.getByText("View status").closest("a")).toHaveAttribute("href", "/itr/filing/filed_1");
    expect(screen.getByText(/Ack 123456789012345/)).toBeInTheDocument();
    expect(screen.getByText("AY 2026-27")).toBeInTheDocument();
    expect(screen.getByText("AY 2025-26")).toBeInTheDocument();
    expect(screen.getByText("1 linked document")).toBeInTheDocument();
  });
});
