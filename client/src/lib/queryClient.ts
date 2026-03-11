import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: string;
  }
): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {};
  
  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method: options?.method || "GET",
    headers,
    body: options?.body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Cache time configurations for different data types
const CACHE_TIMES = {
  // User/auth data - short stale time, moderate cache
  user: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 }, // 30s stale, 5min cache
  // Static data like tax slabs, calculators - long lived
  static: { staleTime: 24 * 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 }, // 24hr
  // Blog posts, services - moderate
  content: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000 }, // 5min stale, 30min cache
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
