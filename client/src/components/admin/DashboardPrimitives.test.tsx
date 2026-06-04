import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileText, Plus } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardIconButton,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
  DashboardToolbar,
} from "./DashboardPrimitives";

describe("dashboard primitives", () => {
  it("renders compact shared dashboard building blocks", () => {
    render(
      <div>
        <DashboardPageHeader
          eyebrow="System"
          title="Services"
          description="Manage compact dashboard surfaces."
          action={<button type="button">Add</button>}
        />
        <DashboardMetricTile label="Active" value={12} icon={FileText} tone="blue" />
        <DashboardToolbar title="Catalog" action={<button type="button">Filter</button>} />
        <DashboardPanel title="Service table" description="Dense rows">
          <p>Panel body</p>
        </DashboardPanel>
        <DashboardEmptyState icon={FileText} title="No services" description="Create one to start." action={<button type="button">Create</button>} />
        <DashboardIconButton label="Add service">
          <Plus />
        </DashboardIconButton>
      </div>,
    );

    expect(screen.getByRole("heading", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add service" })).toHaveClass("rounded-lg");
    expect(screen.getByText("No services")).toBeInTheDocument();
    expect(screen.getByText("Panel body")).toBeInTheDocument();
  });
});
