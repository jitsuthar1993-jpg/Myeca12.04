import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableRowsSkeleton } from "./page-skeleton";

function renderInTable(node: React.ReactNode) {
  return render(
    <table>
      <tbody data-testid="tbody">{node}</tbody>
    </table>,
  );
}

describe("TableRowsSkeleton", () => {
  it("renders the default 5 skeleton rows", () => {
    renderInTable(<TableRowsSkeleton columns={3} />);
    expect(screen.getAllByTestId("table-row-skeleton")).toHaveLength(5);
  });

  it("respects the rows prop", () => {
    renderInTable(<TableRowsSkeleton columns={3} rows={2} />);
    expect(screen.getAllByTestId("table-row-skeleton")).toHaveLength(2);
  });

  it("renders the requested number of cells per row", () => {
    renderInTable(<TableRowsSkeleton columns={6} rows={1} />);
    const row = screen.getByTestId("table-row-skeleton");
    expect(row.children).toHaveLength(6);
  });

  it("each cell contains a Skeleton placeholder", () => {
    renderInTable(<TableRowsSkeleton columns={2} rows={1} />);
    const row = screen.getByTestId("table-row-skeleton");
    for (const cell of Array.from(row.children)) {
      expect(cell.querySelector(".animate-pulse")).not.toBeNull();
    }
  });
});
