import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormsPage from "./forms.page";

const { sourceFormsMock, loadSourceFormsMock } = vi.hoisted(() => {
  const forms = Array.from({ length: 1014 }, (_, index) => ({
    id: index === 0 ? "genius-form1-company-law" : `genius-source-${index}`,
    title: index === 0 ? "Form1 Declaration of compliance" : `Source template ${index + 1}`,
    sourceCategory: index === 0 ? "COMPANY LAW" : "AGREEMENT",
    sourceFormat: "encrypted" as const,
    sourceOriginalFormat: "doc" as const,
    sourceReadable: false,
    policyKey: index === 0 ? "COMPANY LAW" : "AGREEMENT",
    sourceApproval: "approved-for-migration" as const,
    publicationStatus: "review_required" as const,
    lawReviewStatus: index === 0 ? "blocked-superseded" as const : "pending-state-law-review" as const,
    reviewReason: index === 0 ? "Map this superseded company form before implementation." : "Current law review required.",
    officialSources: [{ label: "India Code", url: "https://www.indiacode.nic.in/" }],
  }));
  return { sourceFormsMock: forms, loadSourceFormsMock: vi.fn(async () => forms) };
});

vi.mock("@/components/seo/MetaSEO", () => ({
  default: () => null,
}));

vi.mock("@/data/genius-source-catalog", () => ({
  GENIUS_SOURCE_INVENTORY: { total: 1014, encrypted: 881, rtf: 124, html: 9 },
  loadGeniusSourceCatalog: loadSourceFormsMock,
}));

describe("public forms catalogue", () => {
  it("shows public templates and their legal status", () => {
    render(<FormsPage />);

    expect(screen.getByRole("heading", { name: "Forms for Indian business and compliance work" })).toBeInTheDocument();
    expect(screen.getByTestId("form-template-card-gst-quotation")).toBeInTheDocument();
    expect(screen.getAllByText("Draft template").length).toBeGreaterThan(0);
  });

  it("filters templates by search text and category", () => {
    render(<FormsPage />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search forms" }), {
      target: { value: "quotation" },
    });

    expect(screen.getByTestId("form-template-card-gst-quotation")).toBeInTheDocument();
    expect(screen.queryByTestId("form-template-card-will")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search forms" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Legal and personal" }));

    expect(screen.getByTestId("form-template-card-will")).toBeInTheDocument();
    expect(screen.queryByTestId("form-template-card-gst-quotation")).not.toBeInTheDocument();
  });

  it("loads the complete approved source inventory only when its review queue is opened", async () => {
    render(<FormsPage />);

    expect(screen.getByText("1,014 imported source templates under review")).toBeInTheDocument();
    expect(loadSourceFormsMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Source review queue" }));

    expect(await screen.findByText("Showing 24 of 1,014 source templates")).toBeInTheDocument();
    expect(loadSourceFormsMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Law review required").length).toBeGreaterThan(0);
  });

  it("finds a source-specific form and keeps superseded statutory forms blocked", async () => {
    render(<FormsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Source review queue" }));
    await screen.findByText("Showing 24 of 1,014 source templates");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search source templates" }), {
      target: { value: "Form1 Declaration of compliance" },
    });

    expect(screen.getByText(/Form1 Declaration of compliance/i)).toBeInTheDocument();
    expect(screen.getByText("Superseded - blocked")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open template" })).not.toBeInTheDocument();
  });
});
