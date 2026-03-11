import { writeFileSync } from 'fs';
import { join } from 'path';

// Define all the pages in your application
const pages = [
  // Main pages
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/services', changefreq: 'weekly', priority: 0.9 },
  { url: '/calculators', changefreq: 'weekly', priority: 0.9 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
  { url: '/blog', changefreq: 'daily', priority: 0.7 },
  { url: '/all-services', changefreq: 'weekly', priority: 0.7 },
  { url: '/startup-services', changefreq: 'weekly', priority: 0.8 },
  { url: '/compliance-calendar', changefreq: 'monthly', priority: 0.7 },
  { url: '/expert-consultation', changefreq: 'monthly', priority: 0.6 },
  
  // Service pages
  { url: '/services/notice-compliance', changefreq: 'monthly', priority: 0.8 },
  { url: '/services/tds-filing', changefreq: 'monthly', priority: 0.7 },
  { url: '/services/gst-registration', changefreq: 'monthly', priority: 0.8 },
  { url: '/services/company-registration', changefreq: 'monthly', priority: 0.8 },
  { url: '/services/startup-india-registration', changefreq: 'monthly', priority: 0.7 },
  { url: '/services/msme-udyam-registration', changefreq: 'monthly', priority: 0.7 },
  { url: '/services/fssai-registration', changefreq: 'monthly', priority: 0.6 },
  { url: '/services/trade-license', changefreq: 'monthly', priority: 0.6 },
  { url: '/services/company-incorporation', changefreq: 'monthly', priority: 0.8 },
  { url: '/services/gst-returns', changefreq: 'monthly', priority: 0.8 },
  { url: '/services/trademark-registration', changefreq: 'monthly', priority: 0.7 },
  { url: '/services/iso-certification', changefreq: 'monthly', priority: 0.6 },
  { url: '/services/labour-law-compliance', changefreq: 'monthly', priority: 0.7 },
  
  // Calculator pages
  { url: '/calculators/income-tax', changefreq: 'yearly', priority: 0.9 },
  { url: '/calculators/tax-regime', changefreq: 'yearly', priority: 0.8 },
  { url: '/calculators/hra', changefreq: 'yearly', priority: 0.7 },
  { url: '/calculators/sip', changefreq: 'yearly', priority: 0.7 },
  { url: '/calculators/emi', changefreq: 'yearly', priority: 0.7 },
  { url: '/calculators/tds', changefreq: 'yearly', priority: 0.7 },
  { url: '/calculators/fd', changefreq: 'yearly', priority: 0.6 },
  { url: '/calculators/ppf', changefreq: 'yearly', priority: 0.6 },
  { url: '/calculators/capital-gains', changefreq: 'yearly', priority: 0.7 },
  { url: '/calculators/home-loan', changefreq: 'yearly', priority: 0.6 },
  { url: '/calculators/car-loan', changefreq: 'yearly', priority: 0.6 },
  { url: '/calculators/personal-loan', changefreq: 'yearly', priority: 0.6 },
  { url: '/calculators/education-loan', changefreq: 'yearly', priority: 0.6 },
  
  // Legal pages
  { url: '/legal/privacy-policy', changefreq: 'monthly', priority: 0.5 },
  { url: '/legal/terms-of-service', changefreq: 'monthly', priority: 0.5 },
  { url: '/legal/refund-policy', changefreq: 'monthly', priority: 0.5 },
  { url: '/legal/disclaimer', changefreq: 'monthly', priority: 0.5 },
  
  // ITR pages
  { url: '/itr/form-selector', changefreq: 'weekly', priority: 0.9 },
];

interface SitemapUrl {
  url: string;
  changefreq: string;
  priority: number;
}

function generateSitemap() {
  const hostname = 'https://myeca.in';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pages.forEach((page: SitemapUrl) => {
    xml += '  <url>\n';
    xml += `    <loc>${hostname}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  // Write the sitemap to the public directory
  const sitemapPath = join(process.cwd(), '..', 'public', 'sitemap.xml');
  writeFileSync(sitemapPath, xml);
  
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  console.log(`📝 Total pages: ${pages.length}`);
}

// Generate the sitemap
generateSitemap();