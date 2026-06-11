import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import type { FilingPane } from "./panes";

export function PaneRenderer({
  panes,
  activePaneId,
  isMobile,
  onPaneDone,
  renderPane,
  children,
}: {
  panes: readonly FilingPane[];
  activePaneId?: string;
  isMobile: boolean;
  onPaneDone: () => void;
  renderPane?: (pane: FilingPane) => ReactNode;
  children?: ReactNode;
}) {
  const activePane = panes.find((pane) => pane.id === activePaneId) ?? panes[0];
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isMobile) headingRef.current?.focus({ preventScroll: true });
  }, [activePane?.id, isMobile]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.getAttribute("role") === "button") return;
    const fields = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[data-filing-field]:not([disabled])"),
    );
    const index = fields.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    const nextField = fields[index + 1];
    if (nextField) nextField.focus();
    else onPaneDone();
  };

  if (!isMobile) {
    if (children) return <>{children}</>;
    return <>{panes.map((pane) => <div key={pane.id}>{renderPane?.(pane)}</div>)}</>;
  }

  if (!activePane) return null;
  return (
    <section onKeyDown={onKeyDown}>
      <div role="status" aria-live="polite" className="sr-only">
        <h3 ref={headingRef} tabIndex={-1}>{activePane.title}</h3>
      </div>
      {children ?? renderPane?.(activePane)}
    </section>
  );
}
