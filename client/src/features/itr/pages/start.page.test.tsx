import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_ITR_START_SELECTOR_ANSWERS,
  clearItrStartHandoff,
  readItrStartHandoff,
  writeItrStartHandoff,
} from "@/features/itr/lib/start-selector";
import ITRStartPage from "./start.page";

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("wouter", () => ({
  Link: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ["/which-itr-form-to-file?source=homepage_hero", navigateMock],
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock("@/telemetry/browser", () => ({
  captureTelemetryEvent: vi.fn(),
}));

vi.mock("@/components/seo/MetaSEO", () => ({
  default: () => null,
}));

describe("ITR start form selector page", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    window.history.pushState({}, "", "/which-itr-form-to-file?source=homepage_hero");
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearItrStartHandoff();
  });

  it("renders a form-selection-only public page", () => {
    render(<ITRStartPage />);

    expect(screen.getByRole("heading", { name: /Individual ITR form selector/i })).toBeInTheDocument();
    expect(screen.getByText("Individual filing facts")).toBeInTheDocument();
    expect(screen.getByText("Residential status")).toBeInTheDocument();
    expect(screen.getByText("Recommended form")).toBeInTheDocument();
    expect(screen.getByText("ITR-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue to MY ITR/i })).toBeInTheDocument();
    expect(screen.getByText(/can be resumed after login/i)).toBeInTheDocument();

    expect(screen.queryByText("Taxpayer type")).not.toBeInTheDocument();
    for (const unsupportedType of ["HUF", "Firm", "LLP", "Company", "Trust / other"]) {
      expect(screen.queryByText(unsupportedType)).not.toBeInTheDocument();
    }
    expect(screen.queryByText(/Recommended plan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/payment link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Compare pricing/i)).not.toBeInTheDocument();
  });

  it("updates the recommended form when a blocker is selected", async () => {
    render(<ITRStartPage />);

    await userEvent.click(screen.getByRole("button", { name: /Short-term gains/i }));

    expect(screen.getByText("ITR-2")).toBeInTheDocument();
    expect(screen.getByText("ITR-1 cannot be used for short-term capital gains.")).toBeInTheDocument();
  });

  it("keeps selected boolean facts light like the other selected choices", async () => {
    render(<ITRStartPage />);

    const salaryOption = screen.getByRole("button", { name: /Salary or pension/i });
    const agriculturalIncomeOption = screen.getByRole("button", { name: /Agricultural income above Rs 5,000/i });

    expect(salaryOption).toHaveClass("bg-blue-50", "text-slate-950");
    expect(salaryOption).not.toHaveClass("bg-slate-900", "text-white");

    await userEvent.click(agriculturalIncomeOption);

    expect(agriculturalIncomeOption).toHaveAttribute("aria-pressed", "true");
    expect(agriculturalIncomeOption).toHaveClass("bg-blue-50", "text-slate-950");
    expect(agriculturalIncomeOption).not.toHaveClass("bg-slate-900", "text-white");
  });

  it("routes unauthenticated users through auth and back to the filing draft", async () => {
    render(<ITRStartPage />);

    await userEvent.click(screen.getByRole("button", { name: /Continue to MY ITR/i }));

    expect(navigateMock).toHaveBeenCalledWith(
      `/auth/register?redirect_url=${encodeURIComponent("/itr/filing?source=homepage_hero")}`,
    );
  });

  it("redirects legacy header login-file visits to login for the dashboard", async () => {
    window.history.pushState({}, "", "/which-itr-form-to-file?source=header_desktop_login_file");

    render(<ITRStartPage />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/auth/login?next=%2Fdashboard");
    });
    expect(screen.queryByRole("heading", { name: /Individual ITR form selector/i })).not.toBeInTheDocument();
  });

  it("stores the selector handoff before routing to auth", async () => {
    render(<ITRStartPage />);

    await userEvent.click(screen.getByRole("button", { name: /Short-term gains/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue to MY ITR/i }));

    expect(readItrStartHandoff()).toMatchObject({
      source: "homepage_hero",
      answers: { capitalGains: "short-term" },
      recommendation: { form: "ITR-2" },
    });
  });

  it("restores saved selector answers when resume is requested", () => {
    writeItrStartHandoff({
      answers: {
        ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
        capitalGains: "short-term",
      },
      source: "resume_test",
    });
    window.history.pushState({}, "", "/which-itr-form-to-file?source=resume_test&resume=1");

    render(<ITRStartPage />);

    expect(screen.getByText("ITR-2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Short-term gains/i })).toHaveAttribute("aria-pressed", "true");
  });
});
