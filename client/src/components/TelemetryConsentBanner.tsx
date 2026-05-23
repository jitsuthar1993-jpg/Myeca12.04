import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getTelemetryConsent, setTelemetryConsent } from "@/telemetry/config";
import { allowsBehaviorReplay, allowsSupportChat } from "@/telemetry/privacy";
import { shouldLoadProductionTelemetry } from "@/utils/runtime-env";

export default function TelemetryConsentBanner() {
  const [location] = useLocation();
  const [decision, setDecision] = useState(() => getTelemetryConsent());

  useEffect(() => {
    setDecision(getTelemetryConsent());
  }, [location]);

  if (!shouldLoadProductionTelemetry()) return null;
  if (decision) return null;
  if (!allowsBehaviorReplay(location) && !allowsSupportChat(location)) return null;

  const choose = (value: "granted" | "denied") => {
    setTelemetryConsent(value);
    setDecision(value);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.10)] backdrop-blur"
      data-telemetry-block="true"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
          <span className="sm:hidden">
            Privacy-scrubbed analytics improve public pages. Sensitive tax, document, payment, and account flows stay excluded.
          </span>
          <span className="hidden sm:inline">
            MyeCA uses privacy-scrubbed analytics on public pages to improve forms, support, and site speed. Sensitive tax, document, payment, and account flows stay excluded from replay.
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => choose("denied")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            onClick={() => choose("granted")}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
