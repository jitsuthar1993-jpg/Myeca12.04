import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SIPCalculator from "./sip.page";

vi.mock("@/components/seo/MetaSEO", () => ({ default: () => null }));
vi.mock("@/components/charts/lightweight-recharts", () => ({
  AreaChart: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("SIPCalculator", () => {
  beforeEach(() => window.history.pushState({}, "", "/calculators/sip"));

  it("provides named sliders and a concise live projection", () => {
    render(<SIPCalculator />);

    expect(screen.getByRole("slider", { name: "Monthly investment" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Investment period" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Expected annual return" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Projected value");
  });

  it("supports a zero-return projection", async () => {
    const user = userEvent.setup();
    render(<SIPCalculator />);

    const returnSlider = screen.getByRole("slider", { name: "Expected annual return" });
    await user.keyboard("{Tab}");
    returnSlider.focus();
    await user.keyboard("{Home}");

    expect(returnSlider).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("status")).toHaveTextContent("Estimated gains ₹0");
  });

  it("resets all assumptions to their defaults", async () => {
    const user = userEvent.setup();
    render(<SIPCalculator />);

    const periodSlider = screen.getByRole("slider", { name: "Investment period" });
    periodSlider.focus();
    await user.keyboard("{End}");
    await user.click(screen.getByRole("button", { name: "Reset calculator" }));

    expect(periodSlider).toHaveAttribute("aria-valuenow", "10");
    expect(screen.getByRole("status")).toHaveTextContent("Total invested ₹6,00,000");
  });

  it("shows explicit projection assumptions", () => {
    render(<SIPCalculator />);

    expect(screen.getByText(/constant annual return/)).toHaveTextContent("beginning of each month");
    expect(screen.getByText(/not guaranteed/)).toBeInTheDocument();
  });

  it("renders the enhanced route identity from the shared implementation", () => {
    window.history.pushState({}, "", "/calculators/sip-enhanced?source=test");
    render(<SIPCalculator />);

    expect(screen.getByRole("heading", { level: 1, name: "Enhanced SIP Calculator" })).toBeInTheDocument();
  });
});
