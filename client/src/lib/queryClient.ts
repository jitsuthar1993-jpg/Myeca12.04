import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authToken";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Strip query strings and high-cardinality path segments before reporting so the
// telemetry endpoint sees a stable route shape (e.g. /api/user-services instead of
// /api/user-services/abc123). Keeping the function tiny so importing it stays free.
export function normalizeApiPath(rawUrl: string) {
  try {
    const u = rawUrl.startsWith("http") ? new URL(rawUrl) : new URL(rawUrl, "http://x");
    return u.pathname
      .replace(/[0-9a-f]{8,}/gi, ":id")
      .replace(/\/\d+/g, "/:id");
  } catch {
    return rawUrl.split("?")[0];
  }
}

function reportApiTiming(opts: {
  url: string;
  method: string;
  status: number;
  durationMs: number;
  ok: boolean;
}) {
  // Dynamic import keeps the telemetry module out of the critical bundle. Failures
  // are swallowed: telemetry is a nice-to-have, never a request-blocking dependency.
  void import("@/telemetry/browser")
    .then(({ captureTelemetryEvent }) => {
      captureTelemetryEvent("api_request", {
        api_path: normalizeApiPath(opts.url),
        method: opts.method,
        status: opts.status,
        duration_ms: Math.round(opts.durationMs),
        ok: opts.ok,
      });
    })
    .catch(() => {});
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: string;
    keepalive?: boolean;
  }
): Promise<Response> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};

  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const method = options?.method || "GET";
  const start = performance.now();
  let status = 0;
  let ok = false;
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: options?.body,
      credentials: "include",
      keepalive: options?.keepalive,
    });
    status = res.status;
    ok = res.ok;
    await throwIfResNotOk(res);
    return res;
  } finally {
    reportApiTiming({ url, method, status, durationMs: performance.now() - start, ok });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = await getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = queryKey.join("/") as string;
    const start = performance.now();
    let status = 0;
    let ok = false;
    try {
      const res = await fetch(url, {
        headers,
        credentials: "include",
      });
      status = res.status;
      ok = res.ok;

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } finally {
      reportApiTiming({ url, method: "GET", status, durationMs: performance.now() - start, ok });
    }
  };

// Cache time configurations for different data types
const CACHE_TIMES = {
  // User/auth data - short stale time, moderate cache
  user: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 }, // 30s stale, 5min cache
  // Static data like tax slabs, calculators - long lived
  static: { staleTime: 24 * 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 }, // 24hr
  // Blog posts, services - moderate
  content: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000 }, // 5min stale, 30min cache
  // Admin list views - heavy queries that hit large tables; refresh on demand only.
  adminList: { staleTime: 2 * 60 * 1000, gcTime: 15 * 60 * 1000 }, // 2min stale, 15min cache
  // Default for most API calls
  default: { staleTime: 60 * 1000, gcTime: 10 * 60 * 1000 }, // 1min stale, 10min cache
};

export { CACHE_TIMES };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: CACHE_TIMES.default.staleTime,
      gcTime: CACHE_TIMES.default.gcTime,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

queryClient.setQueryDefaults(["/api/public/blogs"], CACHE_TIMES.content);
queryClient.setQueryDefaults(["/api/public/categories"], CACHE_TIMES.content);

const USER_FOCUS_REFETCH_OPTIONS = {
  ...CACHE_TIMES.user,
  refetchOnWindowFocus: true,
};

queryClient.setQueryDefaults(["/api/user/dashboard"], USER_FOCUS_REFETCH_OPTIONS);
queryClient.setQueryDefaults(["/api/profiles"], USER_FOCUS_REFETCH_OPTIONS);
queryClient.setQueryDefaults(["/api/user-services"], USER_FOCUS_REFETCH_OPTIONS);
queryClient.setQueryDefaults(["/api/ca/stats"], USER_FOCUS_REFETCH_OPTIONS);

// /api/admin/stats still refetches on focus for fresh dashboard feel — the server now
// serves it from a 60s in-memory cache, so the refetch is cheap.
queryClient.setQueryDefaults(["/api/admin/stats"], USER_FOCUS_REFETCH_OPTIONS);

// Admin list queries hit large tables; use a longer stale window and refresh on demand.
queryClient.setQueryDefaults(["/api/admin/user-services"], CACHE_TIMES.adminList);
queryClient.setQueryDefaults(["/api/admin/requests/consultations"], CACHE_TIMES.adminList);
queryClient.setQueryDefaults(["/api/admin/requests/payment-links"], CACHE_TIMES.adminList);
