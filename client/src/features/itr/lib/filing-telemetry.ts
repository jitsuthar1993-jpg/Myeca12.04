import { captureTelemetryEvent } from "@/telemetry/browser";

type FilingViewport = "mobile" | "desktop";

type ItrFilingEventMap = {
  itr_filing_pane_viewed: {
    step: string;
    pane: string;
    viewport: FilingViewport;
  };
  itr_filing_pane_completed: {
    step: string;
    pane: string;
    msOnPane: number;
  };
  itr_filing_validation_blocked: {
    step: string;
    pane: string;
    rule: string;
  };
  itr_filing_review_submitted: {
    stepsVisited: number;
    totalMs: number;
    viewport: FilingViewport;
  };
  itr_filing_whatsapp_case_link_created: {
    returnId: string | null;
    viewport: FilingViewport;
  };
};

export function captureItrFilingEvent<EventName extends keyof ItrFilingEventMap>(
  eventName: EventName,
  properties: ItrFilingEventMap[EventName],
) {
  if (eventName === "itr_filing_pane_viewed") {
    const { step, pane, viewport } = properties as ItrFilingEventMap["itr_filing_pane_viewed"];
    captureTelemetryEvent(eventName, { step, pane, viewport });
    return;
  }
  if (eventName === "itr_filing_pane_completed") {
    const { step, pane, msOnPane } = properties as ItrFilingEventMap["itr_filing_pane_completed"];
    captureTelemetryEvent(eventName, { step, pane, msOnPane });
    return;
  }
  if (eventName === "itr_filing_validation_blocked") {
    const { step, pane, rule } = properties as ItrFilingEventMap["itr_filing_validation_blocked"];
    captureTelemetryEvent(eventName, { step, pane, rule });
    return;
  }
  if (eventName === "itr_filing_whatsapp_case_link_created") {
    const { returnId, viewport } = properties as ItrFilingEventMap["itr_filing_whatsapp_case_link_created"];
    captureTelemetryEvent(eventName, { returnId, viewport });
    return;
  }
  const { stepsVisited, totalMs, viewport } = properties as ItrFilingEventMap["itr_filing_review_submitted"];
  captureTelemetryEvent(eventName, { stepsVisited, totalMs, viewport });
}
