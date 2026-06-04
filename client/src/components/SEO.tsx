import React from "react";
import { MetaSEO } from "@/components/seo/MetaSEO";

/**
 * @deprecated Prefer the newer `MetaSEO` component (or `RouteSeo` for routes whose
 * metadata lives in `seo.config.ts`). This file is now a thin compatibility shim
 * that translates the legacy prop shape into MetaSEO so the entire site shares one
 * Helmet/JSON-LD code path. Migrate call sites at your convenience and delete this file.
 */
interface LegacySEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: "website" | "article" | "service" | "calculator";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  calculatorData?: {
    type: string;
    features: string[];
    accuracy: string;
    updates: string;
  };
  serviceData?: {
    price: string;
    rating: string;
    reviews: string;
    availability: string;
  };
  faqData?: { question: string; answer: string }[];
  breadcrumbData?: { name: string; item: string }[];
}

const SEO: React.FC<LegacySEOProps> = ({
  title,
  description,
  keywords,
  url,
  image,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  tags,
  calculatorData,
  serviceData,
  faqData,
  breadcrumbData,
}) => {
  // Build an article-shaped jsonLd extra so MetaSEO's article schema picks up the
  // publish/modified timestamps and tags that the legacy component took as flat props.
  const articleExtra =
    type === "article" && (publishedTime || modifiedTime || (tags && tags.length))
      ? {
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          keywords: tags?.join(", "),
        }
      : undefined;

  return (
    <MetaSEO
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={url}
      ogImage={image}
      type={type}
      expertAuthor={author}
      breadcrumbs={breadcrumbData?.map((crumb) => ({ name: crumb.name, url: crumb.item }))}
      faqPageData={faqData}
      calculatorData={calculatorData}
      serviceData={serviceData}
      jsonLd={articleExtra}
    />
  );
};

export default SEO;
