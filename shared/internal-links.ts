import type { StaticRouteBodyLink } from "./static-seo-content";

type LinkCluster = {
  routes: string[];
  links: StaticRouteBodyLink[];
};

const coreLinks: StaticRouteBodyLink[] = [
  { label: "Choose your ITR form", href: "/itr/form-selector" },
  { label: "Income tax calculator", href: "/calculators/income-tax" },
  { label: "Talk to a CA", href: "/expert-consultation" },
];

const clusters: LinkCluster[] = [
  {
    routes: ["/", "/itr-filing", "/itr/form-selector", "/services/itr-for-salaried", "/form16-parser", "/itr-season-2026"],
    links: [
      { label: "ITR filing service", href: "/itr-filing" },
      { label: "Salaried ITR support", href: "/services/itr-for-salaried" },
      { label: "Form 16 parser", href: "/form16-parser" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
  },
  {
    routes: [
      "/calculators/income-tax",
      "/calculators/tax-regime",
      "/calculators/regime-comparator",
      "/calculators/hra",
      "/calculators/nps",
      "/calculators/ppf",
      "/calculators/fd",
      "/calculators/tds",
      "/calculators/gratuity",
    ],
    links: [
      { label: "Old vs new regime calculator", href: "/calculators/tax-regime" },
      { label: "HRA calculator", href: "/calculators/hra" },
      { label: "NPS calculator", href: "/calculators/nps" },
      { label: "Tax planning service", href: "/services/tax-planning" },
    ],
  },
  {
    routes: ["/calculators/capital-gains", "/capital-gains-import", "/tax-loss-harvesting", "/compare/quicko-capital-gains-alternative"],
    links: [
      { label: "Capital gains calculator", href: "/calculators/capital-gains" },
      { label: "Capital gains import", href: "/capital-gains-import" },
      { label: "Tax loss harvesting", href: "/tax-loss-harvesting" },
      { label: "Capital gains filing guide", href: "/blog/capital-gains-trading-income-itr-guide-ay-2026-27" },
    ],
  },
  {
    routes: ["/gst-filing", "/services/gst-registration", "/services/gst-returns", "/calculators/gst", "/calculators/hsn-finder"],
    links: [
      { label: "GST filing service", href: "/gst-filing" },
      { label: "GST registration", href: "/services/gst-registration" },
      { label: "GST calculator", href: "/calculators/gst" },
      { label: "HSN finder", href: "/calculators/hsn-finder" },
    ],
  },
  {
    routes: [
      "/startup-services",
      "/startup/registration",
      "/startup/funding",
      "/services/company-registration",
      "/services/msme-udyam-registration",
      "/services/startup-india-registration",
    ],
    links: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Company registration", href: "/services/company-registration" },
      { label: "MSME Udyam registration", href: "/services/msme-udyam-registration" },
      { label: "Startup funding readiness", href: "/startup/funding" },
    ],
  },
  {
    routes: [
      "/compare",
      "/compare/best-ca-assisted-itr-filing",
      "/compare/cleartax-alternative",
      "/compare/taxbuddy-alternative",
      "/compare/indiafilings-alternative",
      "/compare/quicko-capital-gains-alternative",
    ],
    links: [
      { label: "Compare filing options", href: "/compare" },
      { label: "Best CA-assisted ITR filing", href: "/compare/best-ca-assisted-itr-filing" },
      { label: "ClearTax alternative", href: "/compare/cleartax-alternative" },
      { label: "TaxBuddy alternative", href: "/compare/taxbuddy-alternative" },
    ],
  },
  {
    routes: ["/learn", "/learn/guides", "/learn/glossary"],
    links: [
      { label: "Freelancer tax filing guide", href: "/learn/guide/freelancer-tax-filing" },
      { label: "Tax deduction guide", href: "/learn/guide/maximize-tax-deductions" },
      { label: "Capital gains tax guide", href: "/learn/guide/stock-capital-gains-tax" },
      { label: "Salary tax guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
    ],
  },
];

export function topicalInternalLinksForRoute(route: string): StaticRouteBodyLink[] {
  const matches = clusters
    .filter((cluster) => cluster.routes.includes(route))
    .flatMap((cluster) => cluster.links);

  return matches.length ? matches : coreLinks;
}
