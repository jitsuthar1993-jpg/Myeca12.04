import { Helmet } from "react-helmet-async";

interface SchemaMarkupProps {
  type: "Organization" | "Service" | "Product" | "BreadcrumbList" | "FAQPage" | "HowTo" | "Article";
  data: any;
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  let schema: any = {
    "@context": "https://schema.org",
    "@type": type,
  };

  switch (type) {
    case "Organization":
      schema = {
        ...schema,
        name: data.name || "MyeCA.in",
        url: data.url || "https://myeca.in",
        logo: data.logo || "https://myeca.in/logo.png",
        description: data.description || "India's trusted platform for expert income tax filing and business services",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mumbai",
          addressRegion: "Maharashtra",
          addressCountry: "IN"
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-1800-123-4567",
          contactType: "customer support",
          availableLanguage: ["English", "Hindi", "Tamil", "Telugu", "Bengali"]
        },
        sameAs: [
          "https://www.facebook.com/myecain",
          "https://twitter.com/myecain",
          "https://www.linkedin.com/company/myecain"
        ],
        ...data
      };
      break;

    case "Service":
      schema = {
        ...schema,
        name: data.name,
        description: data.description,
        provider: {
          "@type": "Organization",
          name: "MyeCA.in"
        },
        serviceType: data.serviceType || "Professional Tax Services",
        areaServed: {
          "@type": "Country",
          name: "India"
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Tax & Business Services",
          itemListElement: data.offers || []
        },
        ...data
      };
      break;

    case "Product":
      schema = {
        ...schema,
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          "@type": "Brand",
          name: "MyeCA.in"
        },
        offers: {
          "@type": "Offer",
          price: data.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "MyeCA.in"
          }
        },
        aggregateRating: data.rating || {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "15000"
        },
        ...data
      };
      break;

    case "BreadcrumbList":
      schema = {
        ...schema,
        itemListElement: data.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      };
      break;

    case "FAQPage":
      schema = {
        ...schema,
        mainEntity: data.questions.map((faq: any) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      };
      break;

    case "HowTo":
      schema = {
        ...schema,
        name: data.name,
        description: data.description,
        image: data.image,
        totalTime: data.totalTime,
        estimatedCost: data.estimatedCost && {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: data.estimatedCost
        },
        supply: data.supplies || [],
        tool: data.tools || [],
        step: data.steps.map((step: any, index: number) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
          image: step.image
        }))
      };
      break;

    case "Article":
      schema = {
        ...schema,
        headline: data.headline,
        description: data.description,
        image: data.image,
        author: {
          "@type": "Organization",
          name: "MyeCA.in Editorial Team"
        },
        publisher: {
          "@type": "Organization",
          name: "MyeCA.in",
          logo: {
            "@type": "ImageObject",
            url: "https://myeca.in/logo.png"
          }
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": data.url
        }
      };
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}