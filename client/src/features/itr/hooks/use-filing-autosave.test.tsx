import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeItrDraft } from "@shared/itr-filing";
import { useFilingAutosave } from "./use-filing-autosave";

describe("useFilingAutosave", () => {
  beforeEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  });

  it("debounces edits and saves the latest draft", async () => {
    vi.useFakeTimers();
    const saveDraft = vi.fn().mockResolvedValue(undefined);
    const initialDraft = normalizeItrDraft({});
    const { result } = renderHook(() => useFilingAutosave({
      returnId: "return_1",
      initialDraft,
      saveDraft,
    }));

    act(() => {
      result.current.markChanged(normalizeItrDraft({ taxpayer: { firstName: "Asha" } }));
    });
    act(() => {
      vi.advanceTimersByTime(699);
    });
    expect(saveDraft).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(saveDraft).toHaveBeenCalledWith(
      expect.objectContaining({ taxpayer: expect.objectContaining({ firstName: "Asha" }) }),
      { keepalive: false },
    );
  });

  it("flushes pending changes with keepalive on pagehide", async () => {
    const saveDraft = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFilingAutosave({
      returnId: "return_1",
      initialDraft: normalizeItrDraft({}),
      saveDraft,
    }));

    act(() => {
      result.current.markChanged(normalizeItrDraft({ taxpayer: { firstName: "Asha" } }));
      window.dispatchEvent(new PageTransitionEvent("pagehide"));
    });

    await waitFor(() => {
      expect(saveDraft).toHaveBeenCalledWith(expect.anything(), { keepalive: true });
    });
  });

  it("does not write authenticated filing drafts into browser storage", () => {
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useFilingAutosave({
      returnId: "return_1",
      initialDraft: normalizeItrDraft({}),
      saveDraft: vi.fn().mockResolvedValue(undefined),
    }));

    act(() => {
      result.current.markChanged(normalizeItrDraft({ taxpayer: { pan: "ABCDE1234F" } }));
    });

    expect(storageSpy).not.toHaveBeenCalled();
    storageSpy.mockRestore();
  });
});
