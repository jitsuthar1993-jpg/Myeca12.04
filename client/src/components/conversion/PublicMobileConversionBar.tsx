import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { trackPublicCtaClick } from "@/lib/public-conversion-events";

const HIDDEN_PATH_PREFIXES = [
  "/which-itr-form-to-file",
  "/auth",
  "/dashboard",
  "/documents",
  "/reports",
  "/admin",
  "/itr/filing",
  "/payments",
  "/settings",
  "/profile",
  "/account",
  "/business/dashboard",
  "/tax-assistant",
];

function normalizePath(path: string) {
  const pathname = path.split(/[?#]/)[0] || "/";
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function hasFormFocus() {
  if (typeof document === "undefined") return false;

  const activeElement = document.activeElement;
  if (!activeElement || activeElement === document.body) return false;

  const tagName = activeElement.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    activeElement.getAttribute("contenteditable") === "true"
  );
}

function getScrollThreshold() {
  if (typeof window === "undefined") return Number.POSITIVE_INFINITY;
  return Math.max(360, window.innerHeight * 0.9);
}

export default function PublicMobileConversionBar({ currentPath = "/" }: { currentPath?: string }) {
  const normalizedPath = useMemo(() => normalizePath(currentPath), [currentPath]);
  const [hasScrolledPastFirstViewport, setHasScrolledPastFirstViewport] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const isHiddenPath = HIDDEN_PATH_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  useEffect(() => {
    setHasScrolledPastFirstViewport(false);

    if (isHiddenPath) return undefined;

    const updateScrollState = () => {
      setHasScrolledPastFirstViewport(window.scrollY > getScrollThreshold());
    };

    const frame = window.requestAnimationFrame(updateScrollState);
    const interval = window.setInterval(updateScrollState, 250);
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isHiddenPath, normalizedPath]);

  useEffect(() => {
    if (isHiddenPath) return undefined;

    const updateFocusState = () => setIsFormFocused(hasFormFocus());
    const updateFocusStateAfterBlur = () => window.setTimeout(updateFocusState, 0);
    const interval = window.setInterval(updateFocusState, 250);

    updateFocusState();
    document.addEventListener("focusin", updateFocusState);
    document.addEventListener("focusout", updateFocusStateAfterBlur);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("focusin", updateFocusState);
      document.removeEventListener("focusout", updateFocusStateAfterBlur);
    };
  }, [isHiddenPath, normalizedPath]);

  const isScrolledNow =
    typeof window !== "undefined" ? window.scrollY > getScrollThreshold() : hasScrolledPastFirstViewport;

  if (isHiddenPath || isFormFocused || !hasScrolledPastFirstViewport || !isScrolledNow) return null;

  return (
    <nav
      aria-label="Public conversion actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr] gap-2">
        <Link
          href="/which-itr-form-to-file?source=public_mobile_sticky_bar"
          onClick={() => trackPublicCtaClick("Start ITR Filing", "public_mobile_sticky_bar")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-black text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
        >
          Start ITR
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/expert-consultation?service=itr-filing&source=public_mobile_sticky_bar"
          onClick={() => trackPublicCtaClick("Talk to Expert", "public_mobile_sticky_bar")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"
        >
          <MessageCircle className="h-4 w-4" />
          Talk to Expert
        </Link>
      </div>
    </nav>
  );
}
