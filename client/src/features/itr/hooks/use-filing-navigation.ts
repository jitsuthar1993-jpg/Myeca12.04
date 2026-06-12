import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "myecaItrPane";

function clamp(value: number, maximum: number) {
  return Math.max(0, Math.min(value, Math.max(maximum, 0)));
}

function readPosition(stepPaneIds: readonly (readonly string[])[]) {
  if (typeof window === "undefined" || !window.location.pathname.startsWith("/itr/filing")) return { step: 0, pane: 0 };
  const marker = window.history.state?.[HISTORY_KEY] as { step?: number; pane?: number } | undefined;
  const step = clamp(typeof marker?.step === "number" ? marker.step : 0, stepPaneIds.length - 1);
  return {
    step,
    pane: clamp(typeof marker?.pane === "number" ? marker.pane : 0, (stepPaneIds[step]?.length ?? 1) - 1),
  };
}

export function useFilingNavigation({
  isMobile,
  stepPaneIds,
}: {
  isMobile: boolean;
  stepPaneIds: readonly (readonly string[])[];
}) {
  const initial = readPosition(stepPaneIds);
  const [currentStep, setCurrentStep] = useState(initial.step);
  const [currentPane, setCurrentPane] = useState(initial.pane);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([initial.step]);

  const replaceMarker = useCallback((step: number, pane: number) => {
    if (!isMobile || typeof window === "undefined") return;
    window.history.replaceState(
      { ...(window.history.state ?? {}), [HISTORY_KEY]: { step, pane } },
      "",
      window.location.href,
    );
  }, [isMobile]);

  const navigateTo = useCallback((step: number, pane = 0) => {
    const nextStep = clamp(step, stepPaneIds.length - 1);
    const nextPane = clamp(pane, (stepPaneIds[nextStep]?.length ?? 1) - 1);
    if (isMobile && typeof window !== "undefined") {
      if (nextStep !== currentStep) {
        replaceMarker(currentStep, currentPane);
        window.history.pushState(
          { ...(window.history.state ?? {}), [HISTORY_KEY]: { step: nextStep, pane: nextPane } },
          "",
          window.location.href,
        );
      } else {
        replaceMarker(nextStep, nextPane);
      }
    }
    setCurrentStep(nextStep);
    setCurrentPane(nextPane);
    setVisitedSteps((steps) => steps.includes(nextStep) ? steps : [...steps, nextStep]);
  }, [currentPane, currentStep, isMobile, replaceMarker, stepPaneIds]);

  const navigateBack = useCallback(() => {
    if (currentPane > 0) {
      navigateTo(currentStep, currentPane - 1);
      return;
    }
    const previousStep = Math.max(currentStep - 1, 0);
    const previousPane = isMobile ? Math.max((stepPaneIds[previousStep]?.length ?? 1) - 1, 0) : 0;
    navigateTo(previousStep, previousPane);
  }, [currentPane, currentStep, isMobile, navigateTo, stepPaneIds]);

  const navigateNext = useCallback(() => {
    const paneCount = stepPaneIds[currentStep]?.length ?? 1;
    if (isMobile && currentPane < paneCount - 1) {
      navigateTo(currentStep, currentPane + 1);
      return;
    }
    navigateTo(currentStep + 1, 0);
  }, [currentPane, currentStep, isMobile, navigateTo, stepPaneIds]);

  const navigateToPaneId = useCallback((paneId: string) => {
    const step = stepPaneIds.findIndex((panes) => panes.includes(paneId));
    if (step < 0) return;
    navigateTo(step, stepPaneIds[step].indexOf(paneId));
  }, [navigateTo, stepPaneIds]);

  useEffect(() => {
    replaceMarker(currentStep, currentPane);
    const onPopState = (event: PopStateEvent) => {
      const marker = event.state?.[HISTORY_KEY] as { step?: number; pane?: number } | undefined;
      if (!marker || typeof marker.step !== "number") return;
      const step = clamp(marker.step, stepPaneIds.length - 1);
      const pane = clamp(typeof marker.pane === "number" ? marker.pane : 0, (stepPaneIds[step]?.length ?? 1) - 1);
      setCurrentStep(step);
      setCurrentPane(pane);
      setVisitedSteps((steps) => steps.includes(step) ? steps : [...steps, step]);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [currentPane, currentStep, replaceMarker, stepPaneIds]);

  return {
    currentStep,
    currentPane,
    visitedSteps,
    navigateTo,
    navigateBack,
    navigateNext,
    navigateToPaneId,
    setCurrentPane,
  };
}
