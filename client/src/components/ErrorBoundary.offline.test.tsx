import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

describe("ErrorBoundary offline rendering", () => {
  afterEach(() => {
    cleanup();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("keeps rendering children while offline if no component error occurred", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(
      <ErrorBoundary>
        <main>Public app shell remains available offline</main>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Public app shell remains available offline")).toBeVisible();
    expect(screen.queryByText("You're Offline")).not.toBeInTheDocument();
  });
});
