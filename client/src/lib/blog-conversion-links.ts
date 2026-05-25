export type BlogConversionSource = {
  audience?: string | null;
  calculatorSlug?: string | null;
  categoryId?: string | null;
  ctaHref?: string | null;
  serviceSlug?: string | null;
  tags?: string[] | null;
  title?: string | null;
};

export type BlogConversionLink = {
  description: string;
  href: string;
  label: string;
};

function routeFromSlug(prefix: string, slug: string | null | undefined) {
  const value = (slug ?? "").trim();
  if (!value) return "";
  if (value.startsWith("/")) return value;
  return `${prefix}/${value}`;
}

function textBucket(post: BlogConversionSource) {
  return [
    post.title,
    post.categoryId,
    post.audience,
    ...(post.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function fallbackCalculatorHref(post: BlogConversionSource) {
  const text = textBucket(post);
  if (text.includes("capital gain") || text.includes("crypto") || text.includes("vda")) return "/calculators/capital-gains";
  if (text.includes("regime") || text.includes("deduction") || text.includes("80c")) return "/calculators/regime-comparator";
  if (text.includes("gst") || text.includes("business")) return "/calculators/gst";
  return "/calculators/income-tax";
}

function fallbackServiceHref(post: BlogConversionSource) {
  const text = textBucket(post);
  if (text.includes("gst")) return "/services/gst-registration";
  if (text.includes("notice") || text.includes("demand")) return "/services/notice-compliance";
  if (text.includes("startup") || text.includes("business")) return "/services/company-registration";
  return "/services/itr-for-salaried";
}

function conversionHref(post: BlogConversionSource) {
  const href = (post.ctaHref ?? "").trim();
  if (href === "/itr/form-selector" || href.startsWith("/services/")) return href;
  return "/itr/form-selector";
}

function uniqueLinks(links: BlogConversionLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export function getBlogConversionLinks(post: BlogConversionSource): BlogConversionLink[] {
  const serviceHref = routeFromSlug("/services", post.serviceSlug) || fallbackServiceHref(post);
  const calculatorHref = routeFromSlug("/calculators", post.calculatorSlug) || fallbackCalculatorHref(post);
  const ctaHref = conversionHref(post);

  return uniqueLinks([
    {
      label: "Calculate the numbers",
      href: calculatorHref,
      description: "Use a relevant calculator before applying the article guidance.",
    },
    {
      label: "Review the service scope",
      href: serviceHref,
      description: "Check the matching service page, documents, and assisted-review scope.",
    },
    {
      label: "Compare pricing",
      href: "/pricing",
      description: "See guided and CA-assisted plan options before starting.",
    },
    {
      label: ctaHref.startsWith("/services/") ? "Start this service" : "Choose your ITR path",
      href: ctaHref,
      description: "Move from reading into the next filing or service workflow.",
    },
  ]);
}
