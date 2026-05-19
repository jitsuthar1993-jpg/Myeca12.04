import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  initializeBrowserTelemetry,
  trackTelemetryPageView,
  updateTelemetryForRoute,
} from "@/telemetry/browser";
import { TELEMETRY_CONSENT_EVENT } from "@/telemetry/config";

export default function TelemetryRuntime() {
  const [location] = useLocation();

  useEffect(() => {
    void initializeBrowserTelemetry(location).then(() => {
      updateTelemetryForRoute(location);
      trackTelemetryPageView(location, document.title);
    });
  }, [location]);

  useEffect(() => {
    const handleConsentChange = () => {
      void initializeBrowserTelemetry(location);
    };

    window.addEventListener(TELEMETRY_CONSENT_EVENT, handleConsentChange);
    return () => window.removeEventListener(TELEMETRY_CONSENT_EVENT, handleConsentChange);
  }, [location]);

  return null;
}
