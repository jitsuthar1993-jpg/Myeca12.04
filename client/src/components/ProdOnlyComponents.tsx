import TelemetryRuntime from "@/components/TelemetryRuntime";
import TelemetryConsentBanner from "@/components/TelemetryConsentBanner";
import SkipLinks from "@/components/accessibility/SkipLinks";

export default function ProdOnlyComponents() {
  return (
    <>
      <SkipLinks />
      <TelemetryRuntime />
      <TelemetryConsentBanner />
    </>
  );
}
