import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ItrTaxLiabilitySummary } from "@shared/itr-filing";
import { CollapsibleFlags } from "./CollapsibleFlags";
import { DocumentCaptureCard } from "./DocumentCaptureCard";
import { FilingProgressHeader } from "./FilingProgressHeader";
import { LiabilityChip, LiabilitySheet } from "./LiabilityChip";
import { RegimeComparator } from "./RegimeComparator";

const liability: ItrTaxLiabilitySummary = {
  status: "computed",
  activeRegime: "new",
  recommendedRegime: "new",
  unsupportedReasons: [],
  oldRegime: {
    regime: "old",
    grossIncome: 900000,
    standardDeduction: 50000,
    eligibleDeductions: 100000,
    taxableIncome: 750000,
    normalSlabTax: 65000,
    specialRateTax: 0,
    rebate87A: 0,
    marginalRelief: 0,
    taxBeforeCess: 65000,
    cess: 2600,
    grossTaxLiability: 67600,
  },
  newRegime: {
    regime: "new",
    grossIncome: 900000,
    standardDeduction: 75000,
    eligibleDeductions: 0,
    taxableIncome: 825000,
    normalSlabTax: 22500,
    specialRateTax: 0,
    rebate87A: 22500,
    marginalRelief: 0,
    taxBeforeCess: 0,
    cess: 0,
    grossTaxLiability: 0,
  },
  totalTaxPaid: 12400,
  grossTaxLiability: 0,
  taxPayable: 0,
  refundDue: 12400,
};

describe("CollapsibleFlags", () => {
  it("shows the active count and reveals flags on demand", async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleFlags
        flags={[
          {
            id: "director",
            title: "Director in company",
            description: "Needs enhanced review.",
            checked: true,
            onCheckedChange: vi.fn(),
          },
          {
            id: "foreign",
            title: "Foreign assets",
            description: "Triggers Schedule FA.",
            checked: false,
            onCheckedChange: vi.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByText("1 active")).toBeInTheDocument();
    expect(screen.queryByText("Director in company")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Special situations/i }));
    expect(screen.getByText("Director in company")).toBeInTheDocument();
  });
});

describe("FilingProgressHeader", () => {
  it("marks the active dot and exposes compact save and recommendation state", () => {
    render(
      <FilingProgressHeader
        steps={[
          { id: "owner", title: "Owner", description: "Owner details" },
          { id: "identity", title: "Identity", description: "Identity details" },
          { id: "income", title: "Income", description: "Income details" },
        ]}
        currentStep={1}
        currentPane={0}
        paneCount={5}
        saveState="saved"
        recommendation="ITR-1"
      />,
    );

    expect(screen.getByText("Identity · 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("Pane 1 of 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Saved")).toBeInTheDocument();
    expect(screen.getByText("ITR-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Identity" })).toHaveAttribute("aria-current", "step");
  });
});

describe("liability primitives", () => {
  it("uses refund and payable semantic tones", () => {
    const { rerender } = render(<LiabilityChip liability={liability} onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Refund/i })).toHaveClass("text-emerald-800");

    rerender(
      <LiabilityChip
        liability={{ ...liability, refundDue: 0, taxPayable: 2500 }}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Payable/i })).toHaveClass("text-amber-900");
  });

  it("renders liability detail in a bottom sheet", () => {
    render(
      <LiabilitySheet
        open
        onOpenChange={vi.fn()}
        liability={liability}
        recommendation="ITR-1"
        requiredDocuments={3}
        issueCount={1}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent("Tax liability");
    expect(screen.getByRole("dialog")).toHaveTextContent("Refund");
    expect(screen.getByRole("dialog")).toHaveTextContent("New regime");
  });
});

describe("RegimeComparator", () => {
  it("switches the focused regime and explains the savings delta", async () => {
    const onRegimeChange = vi.fn();
    const user = userEvent.setup();

    render(<RegimeComparator liability={liability} onRegimeChange={onRegimeChange} />);

    expect(screen.getByText(/New regime saves/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New regime" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Old regime" }));
    expect(onRegimeChange).toHaveBeenCalledWith("old");
    expect(screen.getByRole("button", { name: "Old regime" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("DocumentCaptureCard", () => {
  it("exposes camera capture and delegates selected files", async () => {
    const onUpload = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentCaptureCard
        item={{ id: "form16", title: "Form 16", required: true, reason: "Salary evidence" }}
        status="idle"
        onUpload={onUpload}
        onDefer={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Upload Form 16");
    expect(input).toHaveAttribute("accept", "image/*,application/pdf");
    expect(input).toHaveAttribute("capture", "environment");

    const file = new File(["form16"], "form16.pdf", { type: "application/pdf" });
    await user.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("shows retry only for failed uploads", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentCaptureCard
        item={{ id: "ais", title: "AIS", required: true, reason: "Income reconciliation" }}
        status="error"
        error="Upload failed"
        onUpload={vi.fn()}
        onRetry={onRetry}
        onDefer={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retry upload" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
