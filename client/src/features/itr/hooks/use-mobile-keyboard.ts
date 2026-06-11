import { useEffect, useState } from "react";

export function useMobileKeyboard(enabled: boolean) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.visualViewport) {
      setKeyboardOpen(false);
      return;
    }

    const viewport = window.visualViewport;
    const update = () => setKeyboardOpen(window.innerHeight - viewport.height > 180);
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return keyboardOpen;
}
