export type PublicNavigationLink = {
  href: string;
  label: string;
};

export type PublicFooterLinkSection = {
  links: PublicNavigationLink[];
  title: string;
  tone: "blue" | "emerald" | "orange";
};

export type PublicHeaderIconKey =
  | "calculator"
  | "file-check"
  | "file-text"
  | "grid"
  | "help"
  | "home"
  | "scale";

export type PublicHeaderIconLink = PublicNavigationLink & {
  icon: PublicHeaderIconKey;
};

export type PublicHeaderPrimaryLink = PublicNavigationLink & {
  icon?: "trust";
};

export const PUBLIC_HEADER_PRIMARY_LINKS: PublicHeaderPrimaryLink[] = [
  { href: "/blog", label: "Blogs" },
  { href: "/trust", icon: "trust", label: "Trust" },
  { href: "/contact", label: "Contact" },
];

export const PUBLIC_HEADER_MOBILE_START_LINKS: PublicHeaderIconLink[] = [
  { href: "/which-itr-form-to-file?source=mobile_menu", icon: "file-text", label: "File ITR" },
  { href: "/calculators/income-tax", icon: "calculator", label: "Income Tax" },
  { href: "/calculators/regime-comparator", icon: "scale", label: "Regime" },
  { href: "/calculators/hra", icon: "home", label: "HRA" },
];

export const PUBLIC_HEADER_MOBILE_QUICK_LINKS: PublicHeaderIconLink[] = [
  { href: "/form16-parser", icon: "file-check", label: "Parse Form 16" },
  { href: "/contact", icon: "help", label: "Support" },
  { href: "/calculators", icon: "grid", label: "All Tools" },
  { href: "/", icon: "home", label: "Home" },
];

export const PUBLIC_HEADER_MOBILE_SERVICE_LINKS: PublicNavigationLink[] = [
  { href: "/services/itr-for-salaried", label: "Salaried ITR service" },
  { href: "/services/tds-filing", label: "TDS Filing" },
  { href: "/services/gst-registration", label: "GST Registration" },
  { href: "/services/document-vault", label: "Document Vault" },
  { href: "/services/notice-compliance", label: "Notice Help" },
  { href: "/services/company-registration", label: "Company Setup" },
];

export const PUBLIC_HEADER_MOBILE_STARTUP_LINKS: PublicNavigationLink[] = [
  { href: "/startup-services", label: "Startup overview" },
  { href: "/startup/registration", label: "Entity registration" },
  { href: "/services/company-registration", label: "Company setup" },
  { href: "/services/marketplace", label: "Services marketplace" },
];

export const PUBLIC_HEADER_MOBILE_CALCULATOR_LINKS: PublicNavigationLink[] = [
  { href: "/calculators/income-tax", label: "Income Tax" },
  { href: "/calculators/regime-comparator", label: "Regime Compare" },
  { href: "/calculators/hra", label: "HRA Calculator" },
  { href: "/calculators/gst", label: "GST Calculator" },
  { href: "/calculators/salary", label: "Salary Calculator" },
  { href: "/calculators/tds", label: "TDS Calculator" },
  { href: "/calculators", label: "All Calculators" },
];

export const PUBLIC_FOOTER_MOBILE_PRIMARY_LINKS: PublicNavigationLink[] = [
  { href: "/which-itr-form-to-file?source=footer_mobile_primary", label: "File ITR" },
  { href: "/itr-season-2026", label: "AY 2026 Hub" },
  { href: "/calculators/income-tax", label: "Estimate Tax" },
  { href: "/calculators/regime-comparator", label: "Compare Regimes" },
  { href: "/form16-parser", label: "Parse Form 16" },
];

export const PUBLIC_FOOTER_LEGAL_LINKS: PublicNavigationLink[] = [
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/trust", label: "Trust" },
  { href: "/legal/terms-of-service", label: "Terms" },
  { href: "/legal/refund-policy", label: "Refunds" },
  { href: "/contact", label: "Support" },
];

export const PUBLIC_FOOTER_SECTIONS: PublicFooterLinkSection[] = [
  {
    links: [
      { href: "/itr/form-selector", label: "ITR Filing (All Forms)" },
      { href: "/itr-season-2026", label: "AY 2026 ITR Season Hub" },
      { href: "/services/gst-registration", label: "GST Registration" },
      { href: "/services/tds-filing", label: "TDS Filing" },
      { href: "/services/notice-compliance", label: "Tax Notice Handling" },
      { href: "/calculators", label: "Tax Calculators" },
      { href: "/services", label: "View All Tax Services" },
    ],
    title: "Tax & Filing Services",
    tone: "blue",
  },
  {
    links: [
      { href: "/services/company-registration", label: "Company Registration" },
      { href: "/services/trademark-registration", label: "Trademark Registration" },
      { href: "/services/iso-certification", label: "ISO Certification" },
      { href: "/startup-services", label: "Startup Services" },
      { href: "/compliance-calendar", label: "Compliance Calendar" },
      { href: "/services", label: "View All Business Services" },
    ],
    title: "Business Services",
    tone: "emerald",
  },
  {
    links: [
      { href: "/about", label: "About MyeCA.in" },
      { href: "/trust", label: "Trust & Security" },
      { href: "/blog", label: "Tax Guides & Blog" },
      { href: "/experts", label: "Meet our Experts" },
      { href: "/pricing", label: "Pricing & Plans" },
      { href: "/help", label: "Help Center" },
      { href: "/legal/privacy-policy", label: "Privacy Policy" },
      { href: "/legal/terms-of-service", label: "Terms of Service" },
    ],
    title: "Resources & Support",
    tone: "orange",
  },
];

export const PUBLIC_FOOTER_BOTTOM_LINKS: PublicNavigationLink[] = [
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/trust", label: "Trust & Security" },
  { href: "/legal/terms-of-service", label: "Terms of Service" },
  { href: "/legal/refund-policy", label: "Refund Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

function uniqueLinks(links: readonly PublicNavigationLink[]) {
  return [...new Map(links.map((link) => [link.href, link])).values()];
}

export const PUBLIC_NAVIGATION_LINKS = uniqueLinks([
  ...PUBLIC_HEADER_PRIMARY_LINKS,
  ...PUBLIC_HEADER_MOBILE_START_LINKS,
  ...PUBLIC_HEADER_MOBILE_QUICK_LINKS,
  ...PUBLIC_HEADER_MOBILE_SERVICE_LINKS,
  ...PUBLIC_HEADER_MOBILE_STARTUP_LINKS,
  ...PUBLIC_HEADER_MOBILE_CALCULATOR_LINKS,
  ...PUBLIC_FOOTER_MOBILE_PRIMARY_LINKS,
  ...PUBLIC_FOOTER_LEGAL_LINKS,
  ...PUBLIC_FOOTER_SECTIONS.flatMap((section) => section.links),
  ...PUBLIC_FOOTER_BOTTOM_LINKS,
]);
