import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMobileKeyboard } from "./use-mobile-keyboard";

describe("useMobileKeyboard", () => {
  it("tracks visual viewport resize and scroll changes", () => {
    const listeners = new Map<string, EventListener>();
    const viewport = {
      height: 844,
      addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
      removeEventListener: (type: string) => listeners.delete(type),
    };
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
    Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });

    const { result, unmount } = renderHook(() => useMobileKeyboard(true));
    expect(result.current).toBe(false);

    act(() => {
      viewport.height = 560;
      listeners.get("resize")?.(new Event("resize"));
    });
    expect(result.current).toBe(true);

    act(() => {
      viewport.height = 844;
      listeners.get("scroll")?.(new Event("scroll"));
    });
    expect(result.current).toBe(false);

    unmount();
    expect(listeners.size).toBe(0);
  });
});
