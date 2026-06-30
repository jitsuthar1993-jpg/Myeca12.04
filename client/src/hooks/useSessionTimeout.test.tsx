import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionTimeout } from "./useSessionTimeout";

class BroadcastChannelMock {
  static channels: BroadcastChannelMock[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  messages: string[] = [];
  name: string;

  constructor(name: string) {
    this.name = name;
    BroadcastChannelMock.channels.push(this);
  }

  postMessage(message: string) {
    this.messages.push(message);
    for (const channel of BroadcastChannelMock.channels) {
      if (channel !== this && channel.name === this.name) {
        channel.onmessage?.({ data: message });
      }
    }
  }

  close() {
    BroadcastChannelMock.channels = BroadcastChannelMock.channels.filter((channel) => channel !== this);
  }
}

describe("useSessionTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    BroadcastChannelMock.channels = [];
    vi.stubGlobal("BroadcastChannel", BroadcastChannelMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows a warning before logging out inactive authenticated users", () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useSessionTimeout({ isAuthenticated: true, onLogout }));

    act(() => {
      vi.advanceTimersByTime(13 * 60 * 1000);
    });

    expect(result.current.showWarning).toBe(true);
    expect(result.current.timeLeft).toBe(120);

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(BroadcastChannelMock.channels[0]?.messages).toContain("LOGOUT");
  });

  it("resets the timeout from mobile touch activity", () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useSessionTimeout({ isAuthenticated: true, onLogout }));

    act(() => {
      vi.advanceTimersByTime(12 * 60 * 1000);
      window.dispatchEvent(new Event("touchstart"));
    });

    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000);
    });

    expect(result.current.showWarning).toBe(false);
    expect(onLogout).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(result.current.showWarning).toBe(true);
  });

  it("does not reset the active countdown when the logout callback identity changes", () => {
    const initialLogout = vi.fn();
    const nextLogout = vi.fn();
    const { rerender, result } = renderHook(
      ({ onLogout }) => useSessionTimeout({ isAuthenticated: true, onLogout }),
      { initialProps: { onLogout: initialLogout } },
    );

    act(() => {
      vi.advanceTimersByTime(13 * 60 * 1000);
    });

    expect(result.current.showWarning).toBe(true);

    rerender({ onLogout: nextLogout });

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(initialLogout).not.toHaveBeenCalled();
    expect(nextLogout).toHaveBeenCalledTimes(1);
  });
});
