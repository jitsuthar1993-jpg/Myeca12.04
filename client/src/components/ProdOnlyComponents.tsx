import GoogleAnalytics from '@/components/GoogleAnalytics';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import SkipLinks from "@/components/accessibility/SkipLinks";

export default function ProdOnlyComponents() {
  return (
    <>
      <SkipLinks />
      <GoogleAnalytics />
      <PerformanceMonitor />
    </>
  );
}
