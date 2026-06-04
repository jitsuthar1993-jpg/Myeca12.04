import { render, screen, fireEvent } from "@testing-library/react";
import { Router as StaticRouter, type BaseLocationHook } from "wouter";
import { useState, type ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

function BrokenChild(): ReactNode {
  throw new Error("kaboom");
}

function HealthyChild() {
  return <div data-testid="route-content">Healthy content</div>;
}

function makeLocationHook(initialPath: string): BaseLocationHook {
  let path = initialPath;
  const listeners = new Set<(p: string) => void>();
  const hook: BaseLocationHook = () => {
    const [current, setCurrent] = useState(path);
    listeners.add(setCurrent);
    const navigate = (to: string) => {
      path = to;
      listeners.forEach((fn) => fn(to));
    };
    return [current, navigate];
  };
  return hook;
}

describe("RouteErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    const hook = makeLocationHook("/");
    render(
      <StaticRouter hook={hook}>
        <RouteErrorBoundary>
          <HealthyChild />
        </RouteErrorBoundary>
      </StaticRouter>,
    );

    expect(screen.getByTestId("route-content")).toHaveTextContent("Healthy content");
  });

  it("renders the in-content fallback (not a full-screen error) when a child throws", () => {
    // React logs the caught error to console.error; silence it for the assertion.
    const originalError = console.error;
    console.error = vi.fn();

    const hook = makeLocationHook("/broken");
    render(
      <StaticRouter hook={hook}>
        <RouteErrorBoundary>
          <BrokenChild />
        </RouteErrorBoundary>
      </StaticRouter>,
    );

    expect(screen.getByText(/page hit an error/i)).toBeInTheDocument();
    // Recovery affordances should be present so the user is not stuck.
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument();
    // Crucially: the fallback does NOT take over the whole viewport — it's a card
    // sized for the content area only, leaving header/footer chrome alive.
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();

    console.error = originalError;
  });
});
