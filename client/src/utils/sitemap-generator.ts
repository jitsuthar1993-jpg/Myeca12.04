// Sitemap generator utility
export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (entries: SitemapEntry[]): string => {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  const footer = `</urlset>`;
  
  const urls = entries.map(entry => `
  <url>
    <loc>${entry.loc}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('');
  
  return header + urls + '\n' + footer;
};

// All routes for sitemap
export const sitemapRoutes: SitemapEntry[] = [
  // Core pages
  { loc: 'https://myeca.in/', changefreq: 'daily', priority: 1.0 },
  { loc: 'https://myeca.in/services', changefreq: 'weekly', priority: 0.9 },
  { loc: 'https://myeca.in/pricing', changefreq: 'weekly', priority: 0.9 },
  { loc: 'https://myeca.in/calculators', changefreq: 'weekly', priority: 0.8 },
  
  // Auth pages
  { loc: 'https://myeca.in/auth/login', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/auth/register', changefreq: 'monthly', priority: 0.7 },
  
  // Calculator pages
  { loc: 'https://myeca.in/calculators/income-tax', changefreq: 'monthly', priority: 0.8 },
  { loc: 'https://myeca.in/calculators/tax-regime', changefreq: 'monthly', priority: 0.8 },
  { loc: 'https://myeca.in/calculators/hra', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/sip', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/emi', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/tds', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/fd', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/ppf', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/capital-gains', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/calculators/home-loan', changefreq: 'monthly', priority: 0.6 },
  { loc: 'https://myeca.in/calculators/car-loan', changefreq: 'monthly', priority: 0.6 },
  { loc: 'https://myeca.in/calculators/personal-loan', changefreq: 'monthly', priority: 0.6 },
  { loc: 'https://myeca.in/calculators/education-loan', changefreq: 'monthly', priority: 0.6 },
  
  // Service pages
  { loc: 'https://myeca.in/services/notice-compliance', changefreq: 'weekly', priority: 0.8 },
  { loc: 'https://myeca.in/services/tds-filing', changefreq: 'weekly', priority: 0.8 },
  { loc: 'https://myeca.in/services/gst-registration', changefreq: 'weekly', priority: 0.8 },
  { loc: 'https://myeca.in/services/gst-returns', changefreq: 'weekly', priority: 0.8 },
  { loc: 'https://myeca.in/services/company-registration', changefreq: 'weekly', priority: 0.8 },
  { loc: 'https://myeca.in/services/trademark-registration', changefreq: 'weekly', priority: 0.7 },
  { loc: 'https://myeca.in/services/iso-certification', changefreq: 'weekly', priority: 0.7 },
  { loc: 'https://myeca.in/services/labour-law-compliance', changefreq: 'weekly', priority: 0.7 },
  { loc: 'https://myeca.in/services/startup-india-registration', changefreq: 'weekly', priority: 0.7 },
  { loc: 'https://myeca.in/services/msme-udyam-registration', changefreq: 'weekly', priority: 0.7 },
  { loc: 'https://myeca.in/services/fssai-registration', changefreq: 'weekly', priority: 0.7 },
  { loc: 'https://myeca.in/services/trade-license', changefreq: 'weekly', priority: 0.6 },
  { loc: 'https://myeca.in/services/company-incorporation', changefreq: 'weekly', priority: 0.7 },
  
  // ITR pages
  { loc: 'https://myeca.in/itr/form-selector', changefreq: 'weekly', priority: 0.9 },
  { loc: 'https://myeca.in/itr/filing', changefreq: 'weekly', priority: 0.9 },
  { loc: 'https://myeca.in/itr/step-by-step-guide', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/itr/compact-filing', changefreq: 'monthly', priority: 0.7 },
  
  // Other important pages
  { loc: 'https://myeca.in/startup-services', changefreq: 'weekly', priority: 0.8 },
  { loc: 'https://myeca.in/compliance-calendar', changefreq: 'monthly', priority: 0.7 },
  { loc: 'https://myeca.in/blog', changefreq: 'daily', priority: 0.7 },
  { loc: 'https://myeca.in/help', changefreq: 'monthly', priority: 0.6 },
  { loc: 'https://myeca.in/help/faq', changefreq: 'monthly', priority: 0.6 },
  { loc: 'https://myeca.in/help/user-guide', changefreq: 'monthly', priority: 0.6 },
  { loc: 'https://myeca.in/help/knowledge-base', changefreq: 'monthly', priority: 0.6 },
  
  // Legal pages
  { loc: 'https://myeca.in/legal/privacy-policy', changefreq: 'yearly', priority: 0.4 },
  { loc: 'https://myeca.in/legal/terms-of-service', changefreq: 'yearly', priority: 0.4 },
  { loc: 'https://myeca.in/legal/refund-policy', changefreq: 'yearly', priority: 0.4 },
  { loc: 'https://myeca.in/legal/disclaimer', changefreq: 'yearly', priority: 0.4 },
  
  // Advanced features
  { loc: 'https://myeca.in/advanced-features', changefreq: 'weekly', priority: 0.7 },
];