import React from "react";
import { Helmet } from "react-helmet-async";

type BreadcrumbItem = { name: string; url: string };
type FAQItem = { question: string; answer: string };

interface EnhancedSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  type?: "website" | "article" | string;
  breadcrumbs?: BreadcrumbItem[];
  faqPageData?: { questions: FAQItem[] };
  localBusinessData?: Record<string, any>;
}

export const seoUtils = {
  toJsonLd: (obj: any) => JSON.stringify(obj),
};

export const EnhancedSEO: React.FC<EnhancedSEOProps> = ({
  title,
  description,
  canonicalUrl,
  keywords,
  ogImage,
  twitterImage,
  type = "website",
  breadcrumbs,
  faqPageData,
  localBusinessData,
}) => {
  const jsonLd: any[] = [];

  if (breadcrumbs && breadcrumbs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  if (faqPageData?.questions?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqPageData.questions.map(q => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    });
  }

  if (localBusinessData) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      ...localBusinessData,
    });
  }

  const keywordStr = keywords?.join(", ") ?? undefined;
  const url = canonicalUrl ?? (typeof window !== "undefined" ? window.location.href : undefined);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywordStr && <meta name="keywords" content={keywordStr} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />} 
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* JSON-LD */}
      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json">
          {seoUtils.toJsonLd(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default EnhancedSEO;

