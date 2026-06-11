import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFilingNavigation } from "./use-filing-navigation";

const stepPaneIds = [
  ["owner-choice"],
  ["identity-name", "identity-pan-aadhaar", "identity-contact"],
  ["income-types"],
];

describe("useFilingNavigation", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/itr/filing");
  });

  it("pushes history only when the macro step changes", () => {
    const pushSpy = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useFilingNavigation({
      isMobile: true,
      stepPaneIds,
    }));

    act(() => result.current.navigateTo(1, 0));
    expect(pushSpy).toHaveBeenCalledTimes(1);

    act(() => result.current.navigateTo(1, 1));
    expect(pushSpy).toHaveBeenCalledTimes(1);
    pushSpy.mockRestore();
  });

  it("moves back through panes before moving to the previous step", () => {
    const { result } = renderHook(() => useFilingNavigation({
      isMobile: true,
      stepPaneIds,
    }));

    act(() => result.current.navigateTo(1, 2));
    act(() => result.current.navigateBack());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.currentPane).toBe(1);

    act(() => result.current.navigateBack());
    act(() => result.current.navigateBack());
    expect(result.current.currentStep).toBe(0);
    expect(result.current.currentPane).toBe(0);
  });

  it("deep-links an issue to its exact pane", () => {
    const { result } = renderHook(() => useFilingNavigation({
      isMobile: true,
      stepPaneIds,
    }));

    act(() => result.current.navigateToPaneId("identity-pan-aadhaar"));
    expect(result.current.currentStep).toBe(1);
    expect(result.current.currentPane).toBe(1);
  });
});
