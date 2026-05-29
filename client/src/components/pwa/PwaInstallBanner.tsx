import { useEffect, useMemo, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasDeferredInstallPrompt, isStandalone, promptInstall } from "@/utils/registerSW";

const DISMISSED_KEY = "myeca:pwa-install-dismissed";

const privatePathPrefixes = [
  "/account",
  "/admin",
  "/analytics-dashboard",
  "/auth",
  "/business/dashboard",
  "/ca",
  "/dashboard",
  "/documents",
  "/export",
  "/integrations",
  "/itr/filing",
  "/payments",
  "/profile",
  "/reports",
  "/settings",
  "/team",
  "/teams",
  "/user",
  "/workflows",
];

function isInstallPromptAllowedPath(path: string) {
  return !privatePathPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

type PwaInstallBannerProps = {
  currentPath?: string;
};

export function PwaInstallBanner({ currentPath = window.location.pathname }: PwaInstallBannerProps) {
  const [isInstallReady, setIsInstallReady] = useState(() => hasDeferredInstallPrompt());
  const [isDismissed, setIsDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "true");
  const [isInstalled, setIsInstalled] = useState(() => isStandalone());
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);
  const canShowOnPath = useMemo(() => isInstallPromptAllowedPath(currentPath), [currentPath]);

  useEffect(() => {
    const handleReady = () => setIsInstallReady(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallReady(false);
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("pwainstallready", handleReady);
    window.addEventListener("pwainstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("pwainstallready", handleReady);
      window.removeEventListener("pwainstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isStandalone()) {
      setIsInstalled(true);
      setIsInstallReady(false);
    }
  }, [currentPath]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setIsInstalled(true);
      setIsInstallReady(false);
    }
  };

  if (!isInstallReady || isDismissed || isInstalled || !canShowOnPath) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-lg rounded-lg border border-blue-100 bg-white p-3 shadow-xl shadow-slate-900/15",
        "md:bottom-5 md:right-5 md:left-auto md:mx-0 md:w-[28rem]",
      )}
      aria-label="Install MyeCA app"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          {isOnline ? <Download className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">Add MyeCA to your home screen</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            {isOnline
              ? "Open tax tools faster and keep public calculators available offline."
              : "Reconnect to finish installing the app."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleInstall}
              disabled={!isOnline}
              aria-label="Install MyeCA"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md px-3 py-2 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={handleDismiss}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
