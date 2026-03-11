import { Helmet } from 'react-helmet-async';
import { SEO_DEFAULTS } from '@/utils/seo-defaults';

interface EnhancedSEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
  alternateLanguages?: Array<{
    hrefLang: string;
    href: string;
  }>;
  jsonLd?: any;
}

export default function EnhancedSEO({ 
  title, 
  description, 
  keywords = SEO_DEFAULTS.defaultKeywords,
  image = SEO_DEFAULTS.defaultImage,
  url = SEO_DEFAULTS.siteUrl,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonicalUrl,
  alternateLanguages = [],
  jsonLd
}: EnhancedSEOProps) {
  const fullTitle = title === SEO_DEFAULTS.siteTitle ? title : `${title} | ${SEO_DEFAULTS.siteName}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SEO_DEFAULTS.siteUrl}${image}`;
  const canonical = canonicalUrl || url;
  
  const robots = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      
      {/* Author and dates */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      <meta property="og:locale" content="en_IN" />
      
      {/* Article specific OG tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_DEFAULTS.twitterHandle} />
      <meta name="twitter:creator" content={SEO_DEFAULTS.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Facebook App ID */}
      {SEO_DEFAULTS.facebookAppId && (
        <meta property="fb:app_id" content={SEO_DEFAULTS.facebookAppId} />
      )}
      
      {/* Alternate languages */}
      {alternateLanguages.map((lang, index) => (
        <link 
          key={index} 
          rel="alternate" 
          hrefLang={lang.hrefLang} 
          href={lang.href} 
        />
      ))}
      
      {/* Additional meta tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}