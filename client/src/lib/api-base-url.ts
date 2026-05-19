const API_PATH_PATTERN = /^\/api(?:[/?#]|$)/;

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
}

function isCurrentOriginApiUrl(url: URL) {
  return (
    typeof window !== "undefined" &&
    url.origin === window.location.origin &&
    API_PATH_PATTERN.test(`${url.pathname}${url.search}${url.hash}`)
  );
}

export function resolveApiUrl(input: string | URL): string | URL {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return input;

  if (typeof input === "string" && API_PATH_PATTERN.test(input)) {
    return `${apiBaseUrl}${input}`;
  }

  const url = typeof input === "string" ? new URL(input, window.location.href) : input;
  if (!isCurrentOriginApiUrl(url)) return input;

  return `${apiBaseUrl}${url.pathname}${url.search}${url.hash}`;
}

function resolveFetchInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string" || input instanceof URL) {
    return resolveApiUrl(input);
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    const resolvedUrl = resolveApiUrl(input.url);
    if (resolvedUrl === input.url) return input;

    return new Request(resolvedUrl, {
      method: input.method,
      headers: input.headers,
      body: input.body,
      mode: input.mode,
      credentials: input.credentials,
      cache: input.cache,
      redirect: input.redirect,
      referrer: input.referrer,
      referrerPolicy: input.referrerPolicy,
      integrity: input.integrity,
      keepalive: input.keepalive,
      signal: input.signal,
    });
  }

  return input;
}

export function installApiBaseUrlFetch() {
  if (!getApiBaseUrl() || typeof window === "undefined" || typeof window.fetch !== "function") {
    return;
  }

  const patchedKey = "__myecaApiBaseUrlPatched";
  if ((window.fetch as typeof window.fetch & Record<string, boolean>)[patchedKey]) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);
  const patchedFetch = ((input, init) => nativeFetch(resolveFetchInput(input), init)) as typeof window.fetch &
    Record<string, boolean>;

  patchedFetch[patchedKey] = true;
  window.fetch = patchedFetch;
}
