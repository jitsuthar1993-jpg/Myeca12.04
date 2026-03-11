import GoogleAnalytics from '@/components/GoogleAnalytics';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import { ContentSecurityPolicy } from "@/components/security/ContentSecurityPolicy";
import SkipLinks from "@/components/accessibility/SkipLinks";

export default function ProdOnlyComponents() {
  return (
    <>
      <SkipLinks />
      <ContentSecurityPolicy />
      <GoogleAnalytics />
      <PerformanceMonitor />
    </>
  );
}
