import { useEffect, type RefObject } from "react";

/**
 * Animates `[data-reveal]` descendants into view on mobile by toggling CSS
 * classes directly on the DOM (no React state, so no re-renders).
 *
 * The hidden state (`m-reveal`) is only applied from JS, which keeps content
 * visible when JS fails, and only to elements below the first viewport, which
 * avoids a hide/show flicker above the fold. Desktop and reduced-motion users
 * never get the hidden state.
 */
export function useMobileScrollReveal(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.85
    );
    if (targets.length === 0) return;

    targets.forEach((el) => el.classList.add("m-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).classList.add("m-reveal-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);
}
