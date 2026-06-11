import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CurrencyInput } from "./CurrencyInput";
import { AadhaarInput, IfscInput, PanInput } from "./identity-inputs";

describe("CurrencyInput", () => {
  it("uses a numeric keyboard, formats en-IN digits, and emits an integer", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CurrencyInput label="Gross salary" value={900000} onChange={onChange} />);

    const input = screen.getByLabelText("Gross salary");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("9,00,000");

    await user.clear(input);
    await user.type(input, "₹ 12,34,567");

    expect(onChange).toHaveBeenLastCalledWith(1234567);
  });

  it("emits zero for an empty value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CurrencyInput label="TDS" value={100} onChange={onChange} />);
    await user.clear(screen.getByLabelText("TDS"));

    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("does not accept a negative value unless the field opts in", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CurrencyInput label="Salary" value={0} onChange={onChange} />);
    const input = screen.getByLabelText("Salary");
    await user.type(input, "-125000");

    expect(input).toHaveValue("1,25,000");
    expect(onChange).toHaveBeenLastCalledWith(125000);
  });

  it("preserves a leading minus for loss-capable fields", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<CurrencyInput label="House property income" value={-250000} allowNegative onChange={onChange} />);
    const input = screen.getByLabelText("House property income");
    expect(input).toHaveValue("-2,50,000");
    expect(input).toHaveAttribute("inputmode", "decimal");

    await user.clear(input);
    await user.type(input, "-125000");
    expect(onChange).toHaveBeenLastCalledWith(-125000);
  });
});

describe("identity inputs", () => {
  it("normalizes PAN to the required positional character classes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<PanInput value="" onChange={onChange} />);
    const input = screen.getByLabelText("PAN");

    expect(input).toHaveAttribute("maxlength", "10");
    expect(input).toHaveAttribute("autocapitalize", "characters");

    await user.type(input, "abcde1234f");
    expect(onChange).toHaveBeenLastCalledWith("ABCDE1234F");
  });

  it("stores Aadhaar as digits while displaying 4-4-4 groups when revealed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(<AadhaarInput value="" onChange={onChange} />);
    expect(screen.getByLabelText("Aadhaar")).toHaveAttribute("inputmode", "numeric");

    await user.type(screen.getByLabelText("Aadhaar"), "1234 5678 9012");
    expect(onChange).toHaveBeenLastCalledWith("123456789012");

    rerender(<AadhaarInput value="123456789012" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Show Aadhaar" }));

    expect(screen.getByLabelText("Aadhaar")).toHaveValue("1234 5678 9012");
  });

  it("uppercases and constrains IFSC input", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<IfscInput value="" onChange={onChange} />);
    const input = screen.getByLabelText("IFSC");

    expect(input).toHaveAttribute("maxlength", "11");
    await user.type(input, "hdfc0ab12$cd");

    expect(onChange).toHaveBeenLastCalledWith("HDFC0AB12CD");
  });
});
