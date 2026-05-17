const CHUNK_RECOVERY_KEY = "myeca:chunk-recovery-attempted";

export function isRecoverableChunkError(error: unknown) {
  const details = [
    error instanceof Error ? error.name : "",
    error instanceof Error ? error.message : "",
    error instanceof Error ? error.stack : "",
    typeof error === "string" ? error : "",
  ].join(" ");

  return /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Failed to load module script|MIME type.*text\/html/i.test(details);
}

export async function recoverFromStaleChunk(error: unknown) {
  if (!isRecoverableChunkError(error) || typeof window === "undefined") {
    return false;
  }

  const recoveryKey = `${CHUNK_RECOVERY_KEY}:${window.location.pathname}`;
  try {
    if (window.sessionStorage.getItem(recoveryKey)) {
      return false;
    }

    window.sessionStorage.setItem(recoveryKey, String(Date.now()));
  } catch {
    return false;
  }

  try {
    if ("caches" in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // Reloading is still useful even when cache cleanup is blocked by the browser.
  }

  window.location.reload();
  return true;
}
