import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FilingPane } from "./panes";
import { PaneRenderer } from "./PaneRenderer";

const panes: FilingPane[] = [
  { id: "identity-name", stepId: "identity", title: "Name", description: "Name details" },
  { id: "identity-pan-aadhaar", stepId: "identity", title: "PAN and Aadhaar", description: "Identity details" },
];

describe("PaneRenderer", () => {
  it("renders one mobile pane and announces its heading", () => {
    render(
      <PaneRenderer
        panes={panes}
        activePaneId="identity-pan-aadhaar"
        isMobile
        onPaneDone={vi.fn()}
        renderPane={(pane) => <div>{pane.id}</div>}
      />,
    );

    expect(screen.queryByText("identity-name")).not.toBeInTheDocument();
    expect(screen.getByText("identity-pan-aadhaar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PAN and Aadhaar" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("renders every pane on desktop", () => {
    render(
      <PaneRenderer
        panes={panes}
        activePaneId="identity-name"
        isMobile={false}
        onPaneDone={vi.fn()}
        renderPane={(pane) => <div>{pane.id}</div>}
      />,
    );

    expect(screen.getByText("identity-name")).toBeInTheDocument();
    expect(screen.getByText("identity-pan-aadhaar")).toBeInTheDocument();
  });
});
