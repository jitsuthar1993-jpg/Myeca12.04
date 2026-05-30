export type FetchTextWithRetryResult = {
  attempts: number;
  response: Response;
  text: string;
};

export type FetchTextWithRetryOptions = {
  attempts?: number;
  fetchImpl?: typeof fetch;
  init?: RequestInit;
  retryDelayMs?: number;
  timeoutMs?: number;
};

function clampAttemptCount(value: number | undefined) {
  return Math.max(1, Math.floor(value ?? 3));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isRetryableStatus(response: Response) {
  return response.status === 429 || response.status >= 500;
}

export async function fetchTextWithRetry(
  url: string,
  {
    attempts: rawAttempts,
    fetchImpl = fetch,
    init,
    retryDelayMs = 250,
    timeoutMs = 20_000,
  }: FetchTextWithRetryOptions = {},
): Promise<FetchTextWithRetryResult> {
  const attempts = clampAttemptCount(rawAttempts);
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = timeoutMs > 0 ? new AbortController() : null;
    const timeout = controller
      ? setTimeout(() => {
          controller.abort();
        }, timeoutMs)
      : null;

    try {
      const response = await fetchImpl(url, controller ? { ...init, signal: controller.signal } : init);

      if (attempt < attempts && isRetryableStatus(response)) {
        lastError = new Error(`${response.status} ${response.statusText}`);
        if (retryDelayMs > 0) await delay(retryDelayMs);
        continue;
      }

      return {
        attempts: attempt,
        response,
        text: await response.text(),
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts && retryDelayMs > 0) {
        await delay(retryDelayMs);
      }
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  throw new Error(`${url} failed after ${attempts} attempts: ${errorMessage(lastError)}`);
}
