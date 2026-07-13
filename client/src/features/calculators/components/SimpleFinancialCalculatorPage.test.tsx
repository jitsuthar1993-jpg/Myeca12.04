import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { calculatorConfigs, SimpleFinancialCalculatorPage } from "./SimpleFinancialCalculatorPage";

vi.mock("@/components/seo/MetaSEO", () => ({ default: () => null }));

describe("SimpleFinancialCalculatorPage", () => {
  it("shows linked validation and withholds results for invalid numeric inputs", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="gst" />);

    const amount = screen.getByRole("spinbutton", { name: "Amount" });
    await user.clear(amount);

    expect(amount).toHaveAttribute("aria-invalid", "true");
    expect(amount).toHaveAccessibleDescription(/Amount is required\./);
    expect(screen.getByRole("alert")).toHaveTextContent("Amount is required.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Correct the highlighted inputs to see the estimate.")).toBeInTheDocument();

    await user.type(amount, "10000001");
    expect(screen.getByRole("alert")).toHaveTextContent("Amount must be 1,00,00,000 or less.");
  });

  it("resets inputs to configured defaults and clears validation", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="gst" />);

    const amount = screen.getByRole("spinbutton", { name: "Amount" });
    const rate = screen.getByRole("spinbutton", { name: "GST Rate" });
    await user.clear(amount);
    await user.type(rate, "5");
    await user.click(screen.getByRole("button", { name: "Reset calculator" }));

    expect(amount).toHaveValue(10000);
    expect(rate).toHaveValue(18);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Invoice Total");
  });

  it("announces recalculated results through a polite status region", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="gst" />);

    const result = screen.getByRole("status");
    expect(result).toHaveAttribute("aria-live", "polite");
    expect(result).toHaveTextContent("₹11,800");

    const amount = screen.getByRole("spinbutton", { name: "Amount" });
    await user.clear(amount);
    await user.type(amount, "20000");
    expect(screen.getByRole("status")).toHaveTextContent("₹23,600");
  });

  it("shows assumptions and the calculator rules basis", () => {
    render(<SimpleFinancialCalculatorPage slug="gst" />);

    expect(screen.getByText("Important assumptions")).toBeInTheDocument();
    expect(screen.getByText(/notified rate for the exact HSN\/SAC classification/)).toBeInTheDocument();
    expect(screen.getByText(/Current selectable GST rates/)).toHaveTextContent("Rules basis:");
  });

  it("rejects fractional values for discrete period fields", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="rd" />);

    const tenure = screen.getByRole("spinbutton", { name: "Tenure" });
    await user.clear(tenure);
    await user.type(tenure, "6.5");

    expect(screen.getByRole("alert")).toHaveTextContent("Tenure must use increments of 1.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the RD model assumptions and supports reset", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="rd" />);

    expect(screen.getByText(/beginning of the month/)).toBeInTheDocument();
    expect(screen.getByText(/verify the offered rate/)).toBeInTheDocument();
    const deposit = screen.getByRole("spinbutton", { name: "Monthly Deposit" });
    await user.clear(deposit);
    await user.type(deposit, "20000");
    await user.click(screen.getByRole("button", { name: "Reset calculator" }));
    expect(deposit).toHaveValue(10000);
  });

  it("shows lumpsum projection assumptions and supports precise return inputs", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="lumpsum" />);

    expect(screen.getByText(/constant annual compounding/)).toBeInTheDocument();
    expect(screen.getByText(/purchasing-power estimate/)).toBeInTheDocument();
    const expectedReturn = screen.getByRole("spinbutton", { name: "Expected Return" });
    await user.clear(expectedReturn);
    await user.type(expectedReturn, "11.75");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows SWP timing assumptions and supports downside returns", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="swp" />);
    expect(screen.getByText(/return is applied before each monthly withdrawal/)).toBeInTheDocument();
    expect(screen.getByText(/does not guarantee sustainability/)).toBeInTheDocument();
    const expectedReturn = screen.getByRole("spinbutton", { name: "Expected Return" });
    await user.clear(expectedReturn);
    await user.type(expectedReturn, "-5.25");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows inflation assumptions and supports precise rates", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="inflation" />);
    expect(screen.getByText(/constant annual inflation/)).toBeInTheDocument();
    expect(screen.getByText(/not a forecast/)).toBeInTheDocument();
    const rate = screen.getByRole("spinbutton", { name: "Inflation Rate" });
    await user.clear(rate);
    await user.type(rate, "5.75");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows loan eligibility assumptions and accepts precise lender rates", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="loan-eligibility" />);
    expect(screen.getByText(/FOIR is a user-entered lender-policy assumption/)).toBeInTheDocument();
    expect(screen.getByText(/not a loan approval/)).toBeInTheDocument();
    const rate = screen.getByRole("spinbutton", { name: "Interest Rate" });
    await user.clear(rate);
    await user.type(rate, "8.75");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("validates important relationships between salary calculator inputs", async () => {
    const user = userEvent.setup();
    render(<SimpleFinancialCalculatorPage slug="salary" />);

    const variablePay = screen.getByRole("spinbutton", { name: "Annual Variable Pay" });
    await user.clear(variablePay);
    await user.type(variablePay, "1300000");

    expect(screen.getByRole("alert")).toHaveTextContent("Annual Variable Pay cannot exceed Annual CTC.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each(Object.keys(calculatorConfigs))("renders a valid default result for %s", (slug) => {
    render(<SimpleFinancialCalculatorPage slug={slug} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset calculator" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
