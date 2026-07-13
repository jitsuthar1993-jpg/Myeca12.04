import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EMICalculator from "./emi.page";

vi.mock("@/components/seo/MetaSEO", () => ({ default: () => null }));

describe("EMICalculator", () => {
  it("withholds the estimate and explains invalid input", async () => {
    const user = userEvent.setup();
    render(<EMICalculator />);

    const amount = screen.getByRole("spinbutton", { name: "Loan Amount" });
    await user.clear(amount);

    expect(amount).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Loan Amount is required.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Correct the highlighted inputs to see the EMI estimate.")).toBeInTheDocument();
  });

  it("supports zero-interest loans and rejects fractional tenure", async () => {
    const user = userEvent.setup();
    render(<EMICalculator />);

    const rate = screen.getByRole("spinbutton", { name: "Interest Rate" });
    await user.clear(rate);
    await user.type(rate, "0");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Total interest ₹0");

    await user.clear(rate);
    await user.type(rate, "8.5");
    const tenure = screen.getByRole("spinbutton", { name: "Tenure in Years" });
    await user.clear(tenure);
    await user.type(tenure, "6.51");
    expect(screen.getByRole("alert")).toHaveTextContent("Tenure must resolve to whole months.");
  });

  it("resets defaults after manual and preset changes", async () => {
    const user = userEvent.setup();
    render(<EMICalculator />);

    await user.click(screen.getByRole("button", { name: "Car Loan" }));
    expect(screen.getByRole("spinbutton", { name: "Loan Amount" })).toHaveValue(800000);
    await user.click(screen.getByRole("button", { name: "Reset calculator" }));

    expect(screen.getByRole("spinbutton", { name: "Loan Amount" })).toHaveValue(1000000);
    expect(screen.getByRole("spinbutton", { name: "Interest Rate" })).toHaveValue(8.5);
    expect(screen.getByRole("spinbutton", { name: "Tenure in Years" })).toHaveValue(20);
    expect(screen.getByRole("status")).toHaveTextContent("Monthly EMI");
  });

  it("announces a concise updated EMI result", async () => {
    const user = userEvent.setup();
    render(<EMICalculator />);

    const result = screen.getByRole("status");
    expect(result).toHaveAttribute("aria-live", "polite");
    expect(result).toHaveTextContent("Monthly EMI");

    await user.click(screen.getByRole("button", { name: "Personal" }));
    expect(screen.getByRole("status")).toHaveTextContent("₹11,122");
  });
});
