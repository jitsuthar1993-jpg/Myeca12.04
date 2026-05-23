import { recordReloadAttempt } from "@/utils/reload-diagnostics";

type Navigate = (path: string) => void;
type NavigationMode = "spa" | "document";

interface LoginNavigationOptions {
  now?: number;
  replaceLocation?: (target: string) => void;
  storage?: Storage | null;
}

function isInternalPath(target: string) {
  return target.startsWith("/") && !target.startsWith("//");
}

export function navigateAfterLogin(
  target: string,
  navigate: Navigate,
  options: LoginNavigationOptions = {},
): NavigationMode {
  const timestamp = options.now ?? Date.now();
  const storage = options.storage ?? (typeof window === "undefined" ? null : window.sessionStorage);

  recordReloadAttempt("login_redirect", {
    path: target,
    now: timestamp,
    storage,
  });

  if (isInternalPath(target)) {
    navigate(target);
    return "spa";
  }

  const replaceLocation = options.replaceLocation ?? ((nextTarget: string) => window.location.replace(nextTarget));
  replaceLocation(target);
  return "document";
}
