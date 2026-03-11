// Default SEO configuration for MyeCA.in
export const SEO_DEFAULTS = {
  siteName: 'MyeCA.in',
  siteTitle: 'Expert Income Tax Filing & ITR e-Filing Services India',
  titleTemplate: '%s | MyeCA.in',
  defaultDescription: 'File ITR online with MyeCA.in. Expert CA assistance, maximum refund guarantee, 15L+ happy customers. ITR filing starts at \u20B9499. File AY 2025-26 returns now!',
  siteUrl: 'https://myeca.in',
  defaultImage: '/og-image.png',
  twitterHandle: '@myecain',
  facebookAppId: '', // Add when available
  
  // Default keywords for all pages
  defaultKeywords: [
    'ITR filing',
    'income tax return',
    'tax filing India',
    'e-filing',
    'AY 2025-26',
    'tax consultant',
    'CA services',
    'online tax filing',
    'tax refund',
    'MyeCA'
  ],
  
  // Organization schema data
  organization: {
    "@type": "Organization",
    "@id": "https://myeca.in/#organization",
    "name": "MyeCA.in",
    "url": "https://myeca.in",
    "logo": {
      "@type": "ImageObject",
      "url": "https://myeca.in/logo.png",
      "width": 200,
      "height": 60
    },
    "sameAs": [
      "https://www.facebook.com/myecain",
      "https://twitter.com/myecain",
      "https://www.linkedin.com/company/myecain",
      "https://www.instagram.com/myecain"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-1234567890",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"],
      "areaServed": "IN"
    }
  },
  
  // WebSite schema data
  website: {
    "@type": "WebSite",
    "@id": "https://myeca.in/#website",
    "url": "https://myeca.in",
    "name": "MyeCA.in",
    "description": "India's premier digital platform for professional tax filing services",
    "publisher": {
      "@id": "https://myeca.in/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://myeca.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
};

// Service schema template
export const getServiceSchema = (service: {
  name: string;
  description: string;
  price: string;
  category: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": service.name,
  "name": service.name,
  "description": service.description,
  "provider": {
    "@id": "https://myeca.in/#organization"
  },
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": service.category,
    "itemListElement": [{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service.name,
        "description": service.description
      },
      "price": service.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    }]
  },
  "url": service.url
});

// FAQ schema template
export const getFAQSchema = (faqs: Array<{question: string; answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Article schema template
export const getArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "datePublished": article.datePublished,
  "dateModified": article.dateModified,
  "image": article.image,
  "publisher": {
    "@id": "https://myeca.in/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

// How-to schema template
export const getHowToSchema = (howTo: {
  name: string;
  description: string;
  totalTime: string;
  steps: Array<{name: string; text: string; image?: string}>;
}) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": howTo.name,
  "description": howTo.description,
  "totalTime": howTo.totalTime,
  "step": howTo.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && { "image": step.image })
  }))
});

// Review schema template
export const getReviewSchema = (review: {
  itemReviewed: string;
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Service",
    "name": review.itemReviewed
  },
  "author": {
    "@type": "Person",
    "name": review.author
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": review.rating,
    "bestRating": 5
  },
  "reviewBody": review.reviewBody,
  "datePublished": review.datePublished
});