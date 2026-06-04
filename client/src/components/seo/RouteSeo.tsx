import { MetaSEO } from "./MetaSEO";
import { getSEOConfig } from "@/config/seo.config";

interface RouteSeoProps {
  path: string;
  /** Optional overrides - useful when the page knows something the static config doesn't (e.g. dynamic title). */
  titleOverride?: string;
  descriptionOverride?: string;
}

/**
 * Single-source-of-truth SEO wrapper for routes whose metadata lives in seo.config.ts.
 * Renders <MetaSEO /> populated from SEO_CONFIG[path]; renders nothing if the path is unconfigured
 * so adding it later is the only change needed.
 */
export function RouteSeo({ path, titleOverride, descriptionOverride }: RouteSeoProps) {
  const config = getSEOConfig(path);
  if (!config) return null;

  return (
    <MetaSEO
      title={titleOverride ?? config.title}
      description={descriptionOverride ?? config.description}
      keywords={config.keywords}
      type={config.type}
      breadcrumbs={config.breadcrumbs}
      faqPageData={config.faqItems?.map((item) => ({ question: item.q, answer: item.a }))}
      calculatorData={config.calculatorData}
      serviceData={config.serviceData}
      noindex={config.noindex}
    />
  );
}

export default RouteSeo;
