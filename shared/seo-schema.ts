export const SITE_URL = "https://myeca.in";
export const SITE_NAME = "myeca.in";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const LOGO_URL = `${SITE_URL}/logo.png`;

type Thing = Record<string, any>;

export type FaqInput = {
  question: string;
  answer: string;
};

export type ArticleSchemaInput = {
  url: string;
  headline: string;
  description: string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  image?: string | null;
  author?: PersonSchemaInput | null;
  reviewer?: PersonSchemaInput | null;
};

export type PersonSchemaInput = {
  name?: string | null;
  role?: string | null;
  credentialName?: string | null;
  credentialId?: string | null;
  credentialAuthority?: string | null;
};

export type HowToSchemaInput = {
  url: string;
  name: string;
  description: string;
  totalTime?: string | null;
  steps: Array<string | { name?: string; text: string; image?: string }>;
};

export type CollectionPageSchemaInput = {
  url: string;
  name: string;
  description: string;
  items: Array<{
    name: string;
    url: string;
    description?: string;
  }>;
};

function absoluteUrl(value: string | null | undefined) {
  if (!value) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function personSchema(input: PersonSchemaInput | null | undefined): Thing | null {
  const name = input?.name?.trim();
  if (!name) return null;

  const credentialName = input?.credentialName?.trim();
  const credentialId = input?.credentialId?.trim();
  const credentialAuthority = input?.credentialAuthority?.trim();
  const hasVerifiedCredential = Boolean(credentialName && credentialId);

  return {
    "@type": "Person",
    name,
    ...(input?.role?.trim() ? { jobTitle: input.role.trim() } : {}),
    ...(hasVerifiedCredential
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: credentialName,
            identifier: credentialId,
            ...(credentialAuthority
              ? {
                  recognizedBy: {
                    "@type": "Organization",
                    name: credentialAuthority,
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}

export function bikanerAddress(): Thing {
  return {
    "@type": "PostalAddress",
    streetAddress: "Bikaner",
    addressLocality: "Bikaner",
    addressRegion: "Rajasthan",
    postalCode: "334001",
    addressCountry: "IN",
  };
}

export function organizationNode(): Thing {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    address: bikanerAddress(),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@myeca.in",
      availableLanguage: ["English", "Hindi"],
      areaServed: "IN",
    },
  };
}

export function websiteNode(): Thing {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildHomepageGraph(): Thing {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode()],
  };
}

export function buildAccountingServiceSchema(url = SITE_URL): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${SITE_URL}/#local-business`,
    name: "myeca.in — CA Tax Filing Services",
    url,
    image: DEFAULT_OG_IMAGE,
    logo: LOGO_URL,
    address: bikanerAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.0229,
      longitude: 73.3119,
    },
    priceRange: "₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Chartered Accountant",
      recognizedBy: {
        "@type": "Organization",
        name: "Institute of Chartered Accountants of India",
      },
    },
  };
}

export function buildServiceSchema(input: {
  url: string;
  name: string;
  description: string;
  serviceType?: string;
}): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${input.url}#service`,
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.serviceType ?? "Tax Filing",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
  };
}

export function buildArticleSchema(input: ArticleSchemaInput): Thing {
  const modifiedAt = input.modifiedAt || input.publishedAt || undefined;
  const author = personSchema(input.author);
  const reviewer = personSchema(input.reviewer);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    image: absoluteUrl(input.image),
    datePublished: input.publishedAt || undefined,
    dateModified: modifiedAt,
    author: author ?? {
      "@type": "Organization",
      name: "Team myeca.in",
    },
    ...(reviewer?.hasCredential ? { reviewedBy: reviewer } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    inLanguage: "en-IN",
    isAccessibleForFree: true,
  };
}

export function buildFaqPageSchema(faqs: FaqInput[]): Thing | null {
  const mainEntity = faqs
    .filter((faq) => faq.question.trim() && faq.answer.trim())
    .map((faq) => ({
      "@type": "Question",
      name: faq.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.trim(),
      },
    }));

  if (!mainEntity.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function buildHowToSchema(input: HowToSchemaInput): Thing | null {
  if (!input.steps.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${input.url}#howto`,
    name: input.name,
    description: input.description,
    totalTime: input.totalTime || undefined,
    step: input.steps.map((step, index) => {
      const normalized = typeof step === "string" ? { text: step } : step;
      return {
        "@type": "HowToStep",
        position: index + 1,
        name: normalized.name || `Step ${index + 1}`,
        text: normalized.text,
        image: normalized.image ? absoluteUrl(normalized.image) : undefined,
      };
    }),
  };
}

export function buildCollectionPageSchema(input: CollectionPageSchemaInput): Thing {
  const items = input.items
    .filter((item) => item.name.trim() && item.url.trim())
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name.trim(),
      url: absoluteUrl(item.url),
      ...(item.description?.trim() ? { description: item.description.trim() } : {}),
    }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(input.url)}#collection`,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${absoluteUrl(input.url)}#itemlist`,
      numberOfItems: items.length,
      itemListElement: items,
    },
  };
}
