import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  useLocation: () => ["/itr/start?source=homepage_hero", navigateMock],
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
    window.history.pushState({}, "", "/itr/start?source=homepage_hero");
    window.sessionStorage.clear();
  });

  it("renders a form-selection-only public page", () => {
    render(<ITRStartPage />);

    expect(screen.getByRole("heading", { name: /Individual ITR form selector/i })).toBeInTheDocument();
    expect(screen.getByText("Individual filing facts")).toBeInTheDocument();
    expect(screen.getByText("Residential status")).toBeInTheDocument();
    expect(screen.getByText("Recommended form")).toBeInTheDocument();
    expect(screen.getByText("ITR-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue filing/i })).toBeInTheDocument();

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

  it("routes unauthenticated users through auth and back to the filing draft", async () => {
    render(<ITRStartPage />);

    await userEvent.click(screen.getByRole("button", { name: /Continue filing/i }));

    expect(navigateMock).toHaveBeenCalledWith(
      `/auth/register?redirect_url=${encodeURIComponent("/itr/filing?source=homepage_hero")}`,
    );
  });
});
