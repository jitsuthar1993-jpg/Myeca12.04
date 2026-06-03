import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  RouteProgressOverlay,
  createRouteAroundNav,
  shouldUseRouteTransition,
} from "./route-transition";

describe("route transition helpers", () => {
  it("uses route transitions for normal public route changes", () => {
    expect(shouldUseRouteTransition("/", "/pricing")).toBe(true);
    expect(shouldUseRouteTransition("/services", "/calculators/income-tax")).toBe(true);
  });

  it("skips same-page hash, auth callback, logout, and private/public boundary changes", () => {
    expect(shouldUseRouteTransition("/learn/videos", "/learn/videos#all")).toBe(false);
    expect(shouldUseRouteTransition("/", "/auth/callback")).toBe(false);
    expect(shouldUseRouteTransition("/dashboard", "/logout")).toBe(false);
    expect(shouldUseRouteTransition("/", "/dashboard")).toBe(false);
    expect(shouldUseRouteTransition("/dashboard", "/pricing")).toBe(false);
  });

  it("wraps eligible navigation in a transition and starts the overlay", () => {
    const navigate = vi.fn();
    const startNavigation = vi.fn((callback: () => void) => callback());
    const onTransitionStart = vi.fn();

    const aroundNav = createRouteAroundNav({
      getCurrentPath: () => "/",
      onTransitionStart,
      startNavigation,
    });

    aroundNav(navigate, "/pricing", { replace: false });

    expect(onTransitionStart).toHaveBeenCalledWith("/pricing");
    expect(startNavigation).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/pricing", { replace: false });
  });

  it("navigates skipped routes directly without starting the overlay", () => {
    const navigate = vi.fn();
    const startNavigation = vi.fn((callback: () => void) => callback());
    const onTransitionStart = vi.fn();

    const aroundNav = createRouteAroundNav({
      getCurrentPath: () => "/pricing",
      onTransitionStart,
      startNavigation,
    });

    aroundNav(navigate, "/auth/callback", undefined);

    expect(onTransitionStart).not.toHaveBeenCalled();
    expect(startNavigation).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/auth/callback", undefined);
  });

  it("renders an accessible fixed progress overlay while pending", () => {
    render(<RouteProgressOverlay isVisible />);

    expect(screen.getByTestId("route-progress-overlay")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/loading next page/i);
  });
});
