import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FDCalculator from "./fd.page";

vi.mock("@/components/seo/MetaSEO", () => ({ default: () => null }));
vi.mock("@/components/ui/calculator-chart", () => ({ CalculatorChart: () => null }));

describe("FDCalculator", () => {
  beforeEach(() => window.history.pushState({}, "", "/calculators/fd"));

  it("exposes named assumptions and a concise live result", () => {
    render(<FDCalculator />);
    expect(screen.getByRole("spinbutton", { name: "Principal amount" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Interest rate" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Tenure in years" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Estimated maturity value");
  });

  it("shows validation instead of coercing a cleared principal", async () => {
    const user = userEvent.setup();
    render(<FDCalculator />);
    await user.clear(screen.getByRole("spinbutton", { name: "Principal amount" }));
    expect(screen.getByText("Enter a principal amount." )).toBeInTheDocument();
  });

  it("resets assumptions to defaults", async () => {
    const user = userEvent.setup();
    render(<FDCalculator />);
    const rate = screen.getByRole("spinbutton", { name: "Interest rate" });
    await user.clear(rate);
    await user.type(rate, "8");
    await user.click(screen.getByRole("button", { name: "Reset calculator" }));
    expect(rate).toHaveValue(6.5);
  });

  it("states that rate and tax outputs are planning assumptions", () => {
    render(<FDCalculator />);
    expect(screen.getByText(/rate entered is an assumption/i)).toBeInTheDocument();
    expect(screen.getByText(/not a tax or bank quote/i)).toBeInTheDocument();
  });

  it("renders enhanced route identity from the shared implementation", () => {
    window.history.pushState({}, "", "/calculators/fd-enhanced?source=test");
    render(<FDCalculator />);
    expect(screen.getByRole("heading", { level: 1, name: "Enhanced FD Planner" })).toBeInTheDocument();
  });
});
