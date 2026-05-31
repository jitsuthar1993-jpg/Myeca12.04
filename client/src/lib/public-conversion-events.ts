export function trackPublicCtaClick(ctaName: string, location: string) {
  if (typeof window === "undefined") return;

  void import("@/telemetry/browser")
    .then(({ captureTelemetryEvent }) => {
      captureTelemetryEvent("public_cta_click", {
        cta_name: ctaName,
        location,
      });
    })
    .catch(() => undefined);
}
