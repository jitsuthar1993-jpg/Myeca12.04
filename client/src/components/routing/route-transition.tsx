import {
  createContext,
  startTransition as reactStartTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  Router as WouterRouter,
  useLocation,
  type AroundNavHandler,
  type NavigateOptions,
  type Path,
} from "wouter";
import { isPrivateRoute, normalizePublicPath } from "@shared/seo-public";

type StartNavigation = (callback: () => void) => void;

type RouteTransitionContextValue = {
  clearPendingRoute: () => void;
  isPending: boolean;
  pendingTarget: string | null;
};

type CreateRouteAroundNavOptions = {
  getCurrentPath?: () => string;
  onTransitionStart?: (targetPath: string) => void;
  startNavigation?: StartNavigation;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue>({
  clearPendingRoute: () => undefined,
  isPending: false,
  pendingTarget: null,
});

function currentBrowserPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isSkippedTarget(path: string) {
  return path === "/logout" || path === "/auth/callback";
}

function isSamePageHashNavigation(currentPath: string, targetPath: string) {
  if (!targetPath.includes("#")) return false;

  const [targetWithoutHash] = targetPath.split("#");
  const current = normalizePublicPath(currentPath);
  const target = targetWithoutHash ? normalizePublicPath(targetWithoutHash) : current;
  return current === target;
}

export function shouldUseRouteTransition(currentPath: string, targetPath: string) {
  if (isSamePageHashNavigation(currentPath, targetPath)) return false;

  const current = normalizePublicPath(currentPath);
  const target = normalizePublicPath(targetPath);
  if (current === target || isSkippedTarget(target)) return false;

  return isPrivateRoute(current) === isPrivateRoute(target);
}

export function createRouteAroundNav({
  getCurrentPath = currentBrowserPath,
  onTransitionStart,
  startNavigation = reactStartTransition,
}: CreateRouteAroundNavOptions = {}): AroundNavHandler {
  return (navigate: (to: Path, options?: NavigateOptions) => void, to: Path, options?: NavigateOptions) => {
    if (!shouldUseRouteTransition(getCurrentPath(), to)) {
      navigate(to, options);
      return;
    }

    onTransitionStart?.(to);
    startNavigation(() => {
      navigate(to, options);
    });
  };
}

export function RouteTransitionCompletionMarker({ onCommit }: { onCommit?: (path: string) => void }) {
  const [location] = useLocation();
  const { clearPendingRoute, pendingTarget } = useContext(RouteTransitionContext);

  useEffect(() => {
    const committedPath = normalizePublicPath(location);
    onCommit?.(committedPath);

    if (pendingTarget && committedPath === pendingTarget) {
      clearPendingRoute();
    }
  }, [clearPendingRoute, location, onCommit, pendingTarget]);

  return null;
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  const [isTransitionPending, startNavigation] = useTransition();

  const clearPendingRoute = useCallback(() => {
    setPendingTarget(null);
  }, []);

  const aroundNav = useMemo(
    () =>
      createRouteAroundNav({
        onTransitionStart: (targetPath) => setPendingTarget(normalizePublicPath(targetPath)),
        startNavigation,
      }),
    [startNavigation],
  );

  useEffect(() => {
    if (!pendingTarget || typeof window === "undefined") return;

    const timeoutId = window.setTimeout(() => {
      setPendingTarget(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [pendingTarget]);

  const value = useMemo(
    () => ({
      clearPendingRoute,
      isPending: Boolean(pendingTarget) || isTransitionPending,
      pendingTarget,
    }),
    [clearPendingRoute, isTransitionPending, pendingTarget],
  );

  return (
    <WouterRouter aroundNav={aroundNav}>
      <RouteTransitionContext.Provider value={value}>
        {children}
      </RouteTransitionContext.Provider>
    </WouterRouter>
  );
}

export function useRouteTransitionPending() {
  return useContext(RouteTransitionContext).isPending;
}

export function RouteProgressOverlay({ isVisible }: { isVisible?: boolean }) {
  const { isPending } = useContext(RouteTransitionContext);
  const visible = isVisible ?? isPending;

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-blue-100"
      data-testid="route-progress-overlay"
      role="status"
    >
      <div className="h-full w-2/3 animate-pulse bg-blue-600 shadow-[0_0_18px_rgba(37,99,235,0.55)]" />
      <span className="sr-only">Loading next page</span>
    </div>
  );
}
