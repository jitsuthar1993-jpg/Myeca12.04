import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ITRNewFilingPage from "./new-filing.page";

const apiRequestMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/queryClient", () => ({
  apiRequest: apiRequestMock,
  queryClient: { invalidateQueries: vi.fn() },
}));

vi.mock("@/components/admin/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => React.createElement("div", {}, children),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { firstName: "Jit", lastName: "Suthar", email: "jit@example.com" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/telemetry/browser", () => ({
  captureTelemetryEvent: vi.fn(),
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...rest }, children),
  useLocation: () => ["/itr/filing/new", navigateMock],
}));

function jsonResponse(data: unknown) {
  return { json: async () => data } as Response;
}

const MEMBERS = [
  { id: "profile_1", name: "Asha Suthar", relation: "mother", pan: "ABCDE••••F", isActive: true },
  { id: "profile_2", name: "Ravi Suthar", relation: "brother", pan: "", isActive: true },
];

function setupApi({
  profiles = MEMBERS,
  taxReturns = [],
}: {
  profiles?: unknown[];
  taxReturns?: unknown[];
} = {}) {
  apiRequestMock.mockImplementation(async (url: string, options?: { method?: string; body?: string }) => {
    if (url === "/api/profiles" && options?.method === "POST") {
      const body = JSON.parse(options.body || "{}");
      return jsonResponse({ id: "profile_new", name: body.name, relation: body.relation, pan: body.pan });
    }
    if (url === "/api/profiles") return jsonResponse(profiles);
    if (url === "/api/tax-returns" && options?.method === "POST") {
      return jsonResponse({ taxReturn: { id: "return_new" } });
    }
    if (url === "/api/tax-returns") return jsonResponse({ taxReturns });
    return jsonResponse({});
  });
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(QueryClientProvider, { client }, React.createElement(ITRNewFilingPage)),
  );
}

describe("New filing owner selection", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    navigateMock.mockReset();
    localStorage.clear();
  });

  it("lists Self first plus saved members with their PAN", async () => {
    setupApi();

    renderPage();

    expect(await screen.findByText("Who are we filing for?")).toBeInTheDocument();
    expect(screen.getByText("Jit Suthar")).toBeInTheDocument();
    expect(await screen.findByText("Asha Suthar")).toBeInTheDocument();
    expect(screen.getByText("PAN ABCDE••••F")).toBeInTheDocument();
    expect(screen.getByText("PAN not added")).toBeInTheDocument();
    expect(screen.getByText("Add a family member")).toBeInTheDocument();
  });

  it("creates a self draft and opens the wizard", async () => {
    setupApi();

    renderPage();
    await userEvent.click(await screen.findByRole("button", { name: /^Continue/ }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/itr/filing/return_new"));
    const createCall = apiRequestMock.mock.calls.find(([url, options]) =>
      url === "/api/tax-returns" && options?.method === "POST"
    );
    const body = JSON.parse(createCall?.[1]?.body || "{}");
    expect(body.owner).toBe("self");
    expect(body.assessmentYear).toBe("2026-27");
    expect(body.profileId).toBeUndefined();
  });

  it("creates a member draft with the selected profile id", async () => {
    setupApi();

    renderPage();
    await userEvent.click(await screen.findByText("Asha Suthar"));
    await userEvent.click(screen.getByRole("button", { name: /^Continue/ }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/itr/filing/return_new"));
    const createCall = apiRequestMock.mock.calls.find(([url, options]) =>
      url === "/api/tax-returns" && options?.method === "POST"
    );
    const body = JSON.parse(createCall?.[1]?.body || "{}");
    expect(body.owner).toBe("member");
    expect(body.profileId).toBe("profile_1");
  });

  it("resumes an existing open draft instead of creating a duplicate", async () => {
    setupApi({
      taxReturns: [{
        id: "existing_draft",
        profileId: "profile_1",
        assessmentYear: "2026-27",
        status: "draft",
        formData: { filingOwner: { mode: "other" } },
      }],
    });

    renderPage();
    await userEvent.click(await screen.findByText("Asha Suthar"));
    expect(await screen.findByText(/already exists/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Continue draft/ }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/itr/filing/existing_draft"));
    expect(apiRequestMock.mock.calls.some(([url, options]) =>
      url === "/api/tax-returns" && options?.method === "POST"
    )).toBe(false);
  });

  it("saves a new member and selects them", async () => {
    setupApi();

    renderPage();
    await userEvent.click(await screen.findByText("Add a family member"));
    await userEvent.type(await screen.findByLabelText("Full name"), "Meena Suthar");
    await userEvent.type(screen.getByLabelText("PAN (optional)"), "abcde1234f");
    await userEvent.click(screen.getByRole("button", { name: /Save member/ }));

    await waitFor(() => {
      const createCall = apiRequestMock.mock.calls.find(([url, options]) =>
        url === "/api/profiles" && options?.method === "POST"
      );
      expect(createCall).toBeTruthy();
      const body = JSON.parse(createCall?.[1]?.body || "{}");
      expect(body.name).toBe("Meena Suthar");
      expect(body.pan).toBe("ABCDE1234F");
    });
  });

  it("rejects an invalid member PAN before saving", async () => {
    setupApi();

    renderPage();
    await userEvent.click(await screen.findByText("Add a family member"));
    await userEvent.type(await screen.findByLabelText("Full name"), "Meena Suthar");
    await userEvent.type(screen.getByLabelText("PAN (optional)"), "BADPAN");
    await userEvent.click(screen.getByRole("button", { name: /Save member/ }));

    expect(await screen.findByText(/PAN must look like ABCDE1234F/)).toBeInTheDocument();
    expect(apiRequestMock.mock.calls.some(([url, options]) =>
      url === "/api/profiles" && options?.method === "POST"
    )).toBe(false);
  });
});
