import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'service' | 'calculator';
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
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'tax filing, income tax, ITR, tax calculator, India',
  url = 'https://myeca.in',
  image = 'https://myeca.in/og-image.png',
  type = 'website',
  author = 'MyeCA.in',
  publishedTime,
  modifiedTime,
  tags = [],
  calculatorData,
  serviceData,
}) => {
  const [location] = useLocation();
  const currentUrl = `https://myeca.in${location}`;
  const siteName = 'MyeCA.in - Expert Tax Filing Services';
  
  // Generate structured data based on type
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'calculator' ? 'SoftwareApplication' : type === 'service' ? 'ProfessionalService' : 'WebSite',
      name: title,
      description: description,
      url: currentUrl,
      image: image,
      author: {
        "@type": "Organization",
        name: author,
        url: "https://myeca.in",
        logo: "https://myeca.in/logo.png",
        sameAs: [
          "https://twitter.com/myecain",
          "https://facebook.com/myecain",
          "https://linkedin.com/company/myecain"
        ]
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        logo: {
          "@type": "ImageObject",
          url: "https://myeca.in/logo.png"
        }
      }
    };

    if (type === 'calculator' && calculatorData) {
      return {
        ...baseData,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "150000"
        },
        features: calculatorData.features,
        screenshot: "https://myeca.in/calculator-screenshot.png"
      };
    }

    if (type === 'service' && serviceData) {
      return {
        ...baseData,
        provider: {
          "@type": "Organization",
          name: siteName,
          url: "https://myeca.in"
        },
        areaServed: {
          "@type": "Country",
          name: "India"
        },
        offers: {
          "@type": "Offer",
          price: serviceData.price,
          priceCurrency: "INR",
          availability: serviceData.availability || "https://schema.org/InStock"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: serviceData.rating,
          reviewCount: serviceData.reviews
        }
      };
    }

    if (type === 'article') {
      return {
        ...baseData,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        author: {
          "@type": "Organization",
          name: author
        },
        keywords: tags.join(', '),
        articleSection: 'Tax and Finance',
        wordCount: description.split(' ').length + 200
      };
    }

    return baseData;
  };

  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@myecain" />
      <meta name="twitter:creator" content="@myecain" />
      
      {/* Article Specific Tags */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime || publishedTime} />
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Tax and Finance" />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Calculator Specific Tags */}
      {type === 'calculator' && calculatorData && (
        <>
          <meta property="calculator:type" content={calculatorData.type} />
          <meta property="calculator:accuracy" content={calculatorData.accuracy} />
          <meta property="calculator:last-updated" content={calculatorData.updates} />
          <meta name="application-name" content="MyeCA Tax Calculator" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content="MyeCA Calculator" />
        </>
      )}
      
      {/* Service Specific Tags */}
      {type === 'service' && serviceData && (
        <>
          <meta property="service:price" content={serviceData.price} />
          <meta property="service:rating" content={serviceData.rating} />
          <meta property="service:reviews" content={serviceData.reviews} />
          <meta property="service:availability" content={serviceData.availability} />
        </>
      )}
      
      {/* Local Business Schema for Homepage */}
      {location === '/' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: siteName,
            description: "Expert CA-assisted tax filing services in India. File ITR online with maximum refund guarantee.",
            url: "https://myeca.in",
            telephone: "+91-9876543210",
            email: "support@myeca.in",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Business Park",
              addressLocality: "Mumbai",
              addressRegion: "Maharashtra",
              postalCode: "400001",
              addressCountry: "IN"
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "09:00",
              closes: "18:00"
            },
            priceRange: "\u20B9499-\u20B94999",
            rating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "150000"
            }
          })}
        </script>
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      <meta name="application-name" content="MyeCA.in" />
      
      {/* Favicon Tags */}
      <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    </Helmet>
  );
};

export default SEO;