import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'Service' | 'FAQPage' | 'BreadcrumbList' | 'Product' | 'Article';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "MyeCA.in",
          "alternateName": "MyeCA - Expert Income Tax Filing",
          "url": "https://myeca.in",
          "logo": "https://myeca.in/logo.png",
          "description": "India's premier digital platform for professional tax filing services with expert CA assistance",
          "founder": {
            "@type": "Person",
            "name": "MyeCA Team"
          },
          "foundingDate": "2023",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@myeca.in",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
          },
          "sameAs": [
            "https://www.facebook.com/myecain",
            "https://twitter.com/myecain",
            "https://www.linkedin.com/company/myecain",
            "https://www.instagram.com/myecain"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Mumbai",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          }
        };

      case 'Service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": data.serviceType || "Tax Filing Service",
          "provider": {
            "@type": "Organization",
            "name": "MyeCA.in"
          },
          "name": data.name,
          "description": data.description,
          "offers": {
            "@type": "Offer",
            "price": data.price || "499",
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "validFrom": "2025-01-01"
          },
          "areaServed": {
            "@type": "Country",
            "name": "India"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Tax Filing Services",
            "itemListElement": data.features?.map((feature: string, index: number) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": feature
              },
              "position": index + 1
            }))
          }
        };

      case 'FAQPage':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.questions?.map((item: any) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer
            }
          }))
        };

      case 'BreadcrumbList':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items?.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      case 'Product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "image": data.image,
          "brand": {
            "@type": "Brand",
            "name": "MyeCA.in"
          },
          "offers": {
            "@type": "Offer",
            "url": data.url,
            "priceCurrency": "INR",
            "price": data.price,
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "MyeCA.in"
            }
          },
          "aggregateRating": data.rating ? {
            "@type": "AggregateRating",
            "ratingValue": data.rating.value,
            "reviewCount": data.rating.count
          } : undefined
        };

      case 'Article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.headline,
          "description": data.description,
          "image": data.image,
          "author": {
            "@type": "Organization",
            "name": "MyeCA.in"
          },
          "publisher": {
            "@type": "Organization",
            "name": "MyeCA.in",
            "logo": {
              "@type": "ImageObject",
              "url": "https://myeca.in/logo.png"
            }
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified || data.datePublished,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url
          }
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}