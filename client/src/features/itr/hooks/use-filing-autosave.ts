import { useCallback, useEffect, useRef, useState } from "react";
import type { ItrFilingDraft } from "@shared/itr-filing";

export type FilingSaveState = "saved" | "saving" | "error" | "offline";

export function useFilingAutosave({
  returnId,
  initialDraft,
  saveDraft,
  debounceMs = 700,
}: {
  returnId: string | null;
  initialDraft: ItrFilingDraft;
  saveDraft: (draft: ItrFilingDraft, options: { keepalive: boolean }) => Promise<void>;
  debounceMs?: number;
}) {
  const [pendingSave, setPendingSave] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const latestDraftRef = useRef(initialDraft);
  const returnIdRef = useRef(returnId);
  const draftRevisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const resetDraft = useCallback((nextDraft: ItrFilingDraft) => {
    latestDraftRef.current = nextDraft;
    draftRevisionRef.current = 0;
    savedRevisionRef.current = 0;
    setPendingSave(false);
    setSaveError(null);
  }, []);

  useEffect(() => {
    returnIdRef.current = returnId;
    resetDraft(initialDraft);
  }, [returnId, resetDraft]);

  const persistLatestDraft = useCallback(async ({ keepalive = false }: { keepalive?: boolean } = {}) => {
    if (!returnIdRef.current) return false;
    if (draftRevisionRef.current <= savedRevisionRef.current) return true;
    if (savePromiseRef.current) return savePromiseRef.current;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOnline(false);
      setPendingSave(true);
      return false;
    }

    const revision = draftRevisionRef.current;
    const draft = latestDraftRef.current;
    let succeeded = false;
    const promise = (async () => {
      try {
        await saveDraft(draft, { keepalive });
        savedRevisionRef.current = Math.max(savedRevisionRef.current, revision);
        succeeded = true;
        setLastSavedAt(new Date());
        setSaveError(null);
        return true;
      } catch (error) {
        setSaveError(error);
        return false;
      } finally {
        savePromiseRef.current = null;
        const hasNewerChanges = draftRevisionRef.current > savedRevisionRef.current;
        setPendingSave(hasNewerChanges);
        if (succeeded && hasNewerChanges && (typeof navigator === "undefined" || navigator.onLine)) {
          window.setTimeout(() => void persistLatestDraft(), 0);
        }
      }
    })();
    savePromiseRef.current = promise;
    return promise;
  }, [saveDraft]);

  const flushLatestDraft = useCallback(async () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    while (draftRevisionRef.current > savedRevisionRef.current) {
      const saved = await persistLatestDraft();
      if (!saved) return false;
    }
    return true;
  }, [persistLatestDraft]);

  const markChanged = useCallback((nextDraft: ItrFilingDraft) => {
    latestDraftRef.current = nextDraft;
    draftRevisionRef.current += 1;
    setSaveError(null);
    setPendingSave(Boolean(returnIdRef.current));
  }, []);

  useEffect(() => {
    if (!returnId || !pendingSave || !online) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => void persistLatestDraft(), debounceMs);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [debounceMs, online, pendingSave, persistLatestDraft, returnId]);

  useEffect(() => {
    const flushKeepalive = () => {
      if (draftRevisionRef.current > savedRevisionRef.current) void persistLatestDraft({ keepalive: true });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushKeepalive();
    };
    const onOnline = () => {
      setOnline(true);
      void persistLatestDraft();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("pagehide", flushKeepalive);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushKeepalive);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [persistLatestDraft]);

  const saveState: FilingSaveState = !online ? "offline" : saveError ? "error" : pendingSave ? "saving" : "saved";

  return {
    pendingSave,
    saveState,
    saveError,
    lastSavedAt,
    online,
    resetDraft,
    markChanged,
    persistLatestDraft,
    flushLatestDraft,
  };
}
