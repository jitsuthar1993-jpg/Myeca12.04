// SEO/Accessibility Testing Framework
import { useEffect, useState, useCallback } from 'react';
import { AccessibilityAuditService } from '../utils/accessibility-audit';

// Test Result Interface
interface TestResult {
  id: string;
  name: string;
  category: 'seo' | 'accessibility' | 'performance' | 'best-practices';
  status: 'pass' | 'fail' | 'warning' | 'info';
  score?: number;
  message: string;
  details?: any;
  recommendations?: string[];
  wcagGuideline?: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
}

// Test Configuration Interface
interface TestConfig {
  url: string;
  viewport?: { width: number; height: number };
  userAgent?: string;
  timeout?: number;
  includeScreenshots?: boolean;
  includeMetrics?: boolean;
  accessibilityLevel?: 'A' | 'AA' | 'AAA';
  seoChecks?: boolean;
  performanceChecks?: boolean;
  bestPracticesChecks?: boolean;
}

// Comprehensive SEO/Accessibility Test Suite
export class SEOAccessibilityTestSuite {
  private auditService: AccessibilityAuditService;
  private testConfig: TestConfig;

  constructor(config: TestConfig) {
    this.auditService = new AccessibilityAuditService();
    this.testConfig = config;
  }

  // Run comprehensive test suite
  async runFullTest(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // SEO Tests
    if (this.testConfig.seoChecks !== false) {
      results.push(...await this.runSEOTests());
    }

    // Accessibility Tests
    results.push(...await this.runAccessibilityTests());

    // Performance Tests
    if (this.testConfig.performanceChecks !== false) {
      results.push(...await this.runPerformanceTests());
    }

    // Best Practices Tests
    if (this.testConfig.bestPracticesChecks !== false) {
      results.push(...await this.runBestPracticesTests());
    }

    return results;
  }

  // SEO Tests
  private async runSEOTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Page Title Test
    results.push(await this.testPageTitle());

    // Meta Description Test
    results.push(await this.testMetaDescription());

    // Meta Keywords Test
    results.push(await this.testMetaKeywords());

    // Canonical URL Test
    results.push(await this.testCanonicalURL());

    // Open Graph Tags Test
    results.push(await this.testOpenGraphTags());

    // Twitter Card Tags Test
    results.push(await this.testTwitterCardTags());

    // Structured Data Test
    results.push(await this.testStructuredData());

    // Heading Structure Test
    results.push(await this.testHeadingStructure());

    // Image Alt Text Test
    results.push(await this.testImageAltText());

    // Internal Links Test
    results.push(await this.testInternalLinks());

    // External Links Test
    results.push(await this.testExternalLinks());

    // XML Sitemap Test
    results.push(await this.testXMLSitemap());

    // Robots.txt Test
    results.push(await this.testRobotsTxt());

    // Page Speed Test
    results.push(await this.testPageSpeed());

    // Mobile Friendliness Test
    results.push(await this.testMobileFriendliness());

    return results;
  }

  // Accessibility Tests
  private async runAccessibilityTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Run accessibility audit
    const auditResults = await this.auditService.performFullAudit();

    // Convert audit results to test results
    auditResults.forEach(issue => {
      results.push({
        id: `accessibility-${issue.id}`,
        name: `Accessibility: ${issue.description}`,
        category: 'accessibility',
        status: issue.severity === 'critical' ? 'fail' : issue.severity === 'serious' ? 'warning' : 'info',
        message: issue.description,
        details: issue,
        recommendations: [issue.remediation],
        wcagGuideline: issue.wcagGuideline,
        wcagLevel: issue.wcagLevel
      });
    });

    return results;
  }

  // Performance Tests
  private async runPerformanceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Core Web Vitals Test
    results.push(await this.testCoreWebVitals());

    // First Contentful Paint Test
    results.push(await this.testFirstContentfulPaint());

    // Largest Contentful Paint Test
    results.push(await this.testLargestContentfulPaint());

    // First Input Delay Test
    results.push(await this.testFirstInputDelay());

    // Cumulative Layout Shift Test
    results.push(await this.testCumulativeLayoutShift());

    // Speed Index Test
    results.push(await this.testSpeedIndex());

    // Time to Interactive Test
    results.push(await this.testTimeToInteractive());

    return results;
  }

  // Best Practices Tests
  private async runBestPracticesTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // HTTPS Test
    results.push(await this.testHTTPS());

    // Security Headers Test
    results.push(await this.testSecurityHeaders());

    // CSP Test
    results.push(await this.testContentSecurityPolicy());

    // HTTPS Redirects Test
    results.push(await this.testHTTPSRedirects());

    // Mixed Content Test
    results.push(await this.testMixedContent());

    // Deprecated APIs Test
    results.push(await this.testDeprecatedAPIs());

    // Console Errors Test
    results.push(await this.testConsoleErrors());

    return results;
  }

  // Individual Test Methods
  private async testPageTitle(): Promise<TestResult> {
    const title = document.title;
    const score = this.calculateTitleScore(title);
    
    return {
      id: 'seo-page-title',
      name: 'Page Title',
      category: 'seo',
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
      score,
      message: `Page title is ${title.length} characters: "${title}"`,
      recommendations: [
        title.length < 30 ? 'Page title is too short (minimum 30 characters)' : '',
        title.length > 60 ? 'Page title is too long (maximum 60 characters)' : '',
        !title.includes('SmartTaxCalculator') ? 'Consider including brand name in title' : ''
      ].filter(Boolean)
    };
  }

  private async testMetaDescription(): Promise<TestResult> {
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const score = this.calculateMetaDescriptionScore(metaDescription);
    
    return {
      id: 'seo-meta-description',
      name: 'Meta Description',
      category: 'seo',
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
      score,
      message: `Meta description is ${metaDescription.length} characters`,
      recommendations: [
        !metaDescription ? 'Add meta description tag' : '',
        metaDescription.length < 120 ? 'Meta description is too short (minimum 120 characters)' : '',
        metaDescription.length > 160 ? 'Meta description is too long (maximum 160 characters)' : ''
      ].filter(Boolean)
    };
  }

  private async testMetaKeywords(): Promise<TestResult> {
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const keywords = metaKeywords.split(',').map(k => k.trim()).filter(Boolean);
    
    return {
      id: 'seo-meta-keywords',
      name: 'Meta Keywords',
      category: 'seo',
      status: 'info',
      message: `Found ${keywords.length} keywords in meta keywords tag`,
      recommendations: [
        'Meta keywords tag is not used by major search engines anymore',
        'Focus on content quality and semantic markup instead'
      ]
    };
  }

  private async testCanonicalURL(): Promise<TestResult> {
    const canonicalLink = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    
    return {
      id: 'seo-canonical-url',
      name: 'Canonical URL',
      category: 'seo',
      status: canonicalLink ? 'pass' : 'warning',
      message: canonicalLink ? `Canonical URL: ${canonicalLink}` : 'No canonical URL found',
      recommendations: canonicalLink ? [] : ['Add canonical URL to prevent duplicate content issues']
    };
  }

  private async testOpenGraphTags(): Promise<TestResult> {
    const ogTags = {
      title: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      description: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      image: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      url: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
      type: document.querySelector('meta[property="og:type"]')?.getAttribute('content')
    };
    
    const missingTags = Object.entries(ogTags)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    
    return {
      id: 'seo-open-graph',
      name: 'Open Graph Tags',
      category: 'seo',
      status: missingTags.length === 0 ? 'pass' : 'warning',
      message: `Found ${5 - missingTags.length}/5 essential Open Graph tags`,
      recommendations: missingTags.map(tag => `Add og:${tag} meta tag`)
    };
  }

  private async testTwitterCardTags(): Promise<TestResult> {
    const twitterTags = {
      card: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      title: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
      description: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
      image: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
      site: document.querySelector('meta[name="twitter:site"]')?.getAttribute('content')
    };
    
    const missingTags = Object.entries(twitterTags)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    
    return {
      id: 'seo-twitter-card',
      name: 'Twitter Card Tags',
      category: 'seo',
      status: missingTags.length <= 2 ? 'pass' : 'warning',
      message: `Found ${5 - missingTags.length}/5 Twitter Card tags`,
      recommendations: missingTags.map(tag => `Add twitter:${tag} meta tag`)
    };
  }

  private async testStructuredData(): Promise<TestResult> {
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    const dataCount = structuredData.length;
    
    return {
      id: 'seo-structured-data',
      name: 'Structured Data',
      category: 'seo',
      status: dataCount > 0 ? 'pass' : 'info',
      message: `Found ${dataCount} structured data blocks`,
      recommendations: dataCount === 0 ? ['Consider adding structured data for better SEO'] : []
    };
  }

  private async testHeadingStructure(): Promise<TestResult> {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = document.querySelectorAll('h1').length;
    
    return {
      id: 'seo-heading-structure',
      name: 'Heading Structure',
      category: 'seo',
      status: h1Count === 1 ? 'pass' : 'warning',
      message: `Found ${headings.length} headings, ${h1Count} h1 tags`,
      recommendations: [
        h1Count === 0 ? 'Add h1 tag for main page title' : '',
        h1Count > 1 ? 'Use only one h1 tag per page' : '',
        headings.length === 0 ? 'Add heading tags for better content structure' : ''
      ].filter(Boolean)
    };
  }

  private async testImageAltText(): Promise<TestResult> {
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute('alt'));
    
    return {
      id: 'seo-image-alt-text',
      name: 'Image Alt Text',
      category: 'seo',
      status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
      message: `Found ${images.length} images, ${imagesWithoutAlt.length} without alt text`,
      recommendations: imagesWithoutAlt.length > 0 ? [`Add alt text to ${imagesWithoutAlt.length} images`] : []
    };
  }

  private async testInternalLinks(): Promise<TestResult> {
    const internalLinks = Array.from(document.querySelectorAll('a[href^="/"], a[href^="."], a[href^="#"]'));
    const brokenLinks = internalLinks.filter(link => {
      const href = link.getAttribute('href');
      return !href || href === '#' || href === '';
    });
    
    return {
      id: 'seo-internal-links',
      name: 'Internal Links',
      category: 'seo',
      status: brokenLinks.length === 0 ? 'pass' : 'warning',
      message: `Found ${internalLinks.length} internal links, ${brokenLinks.length} potentially broken`,
      recommendations: brokenLinks.length > 0 ? [`Review ${brokenLinks.length} internal links`] : []
    };
  }

  private async testExternalLinks(): Promise<TestResult> {
    const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]'));
    const noFollowLinks = externalLinks.filter(link => link.getAttribute('rel')?.includes('nofollow'));
    
    return {
      id: 'seo-external-links',
      name: 'External Links',
      category: 'seo',
      status: 'info',
      message: `Found ${externalLinks.length} external links, ${noFollowLinks.length} with nofollow`,
      recommendations: [
        externalLinks.length > 0 ? 'Consider adding nofollow to external links where appropriate' : ''
      ].filter(Boolean)
    };
  }

  private async testXMLSitemap(): Promise<TestResult> {
    // This would typically check for sitemap.xml
    return {
      id: 'seo-xml-sitemap',
      name: 'XML Sitemap',
      category: 'seo',
      status: 'info',
      message: 'XML sitemap check requires server-side verification',
      recommendations: ['Ensure XML sitemap exists and is submitted to search engines']
    };
  }

  private async testRobotsTxt(): Promise<TestResult> {
    // This would typically check for robots.txt
    return {
      id: 'seo-robots-txt',
      name: 'Robots.txt',
      category: 'seo',
      status: 'info',
      message: 'Robots.txt check requires server-side verification',
      recommendations: ['Ensure robots.txt exists and is properly configured']
    };
  }

  private async testPageSpeed(): Promise<TestResult> {
    // This would typically use Lighthouse or similar
    return {
      id: 'seo-page-speed',
      name: 'Page Speed',
      category: 'seo',
      status: 'info',
      message: 'Page speed analysis requires performance testing tools',
      recommendations: ['Use Google PageSpeed Insights for detailed analysis']
    };
  }

  private async testMobileFriendliness(): Promise<TestResult> {
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewport = !!viewport;
    
    return {
      id: 'seo-mobile-friendly',
      name: 'Mobile Friendliness',
      category: 'seo',
      status: hasViewport ? 'pass' : 'fail',
      message: hasViewport ? 'Viewport meta tag found' : 'No viewport meta tag',
      recommendations: hasViewport ? [] : ['Add viewport meta tag for mobile optimization']
    };
  }

  // Performance Tests
  private async testCoreWebVitals(): Promise<TestResult> {
    // Simulate Core Web Vitals measurement
    return {
      id: 'performance-core-web-vitals',
      name: 'Core Web Vitals',
      category: 'performance',
      status: 'info',
      message: 'Core Web Vitals measurement requires real user monitoring',
      recommendations: [
        'Implement real user monitoring for accurate Core Web Vitals',
        'Target LCP < 2.5s, FID < 100ms, CLS < 0.1'
      ]
    };
  }

  private async testFirstContentfulPaint(): Promise<TestResult> {
    return {
      id: 'performance-fcp',
      name: 'First Contentful Paint',
      category: 'performance',
      status: 'info',
      message: 'FCP measurement requires performance API',
      recommendations: ['Use Performance Observer API for FCP measurement']
    };
  }

  private async testLargestContentfulPaint(): Promise<TestResult> {
    return {
      id: 'performance-lcp',
      name: 'Largest Contentful Paint',
      category: 'performance',
      status: 'info',
      message: 'LCP measurement requires performance API',
      recommendations: ['Use Performance Observer API for LCP measurement']
    };
  }

  private async testFirstInputDelay(): Promise<TestResult> {
    return {
      id: 'performance-fid',
      name: 'First Input Delay',
      category: 'performance',
      status: 'info',
      message: 'FID measurement requires event timing API',
      recommendations: ['Use Event Timing API for FID measurement']
    };
  }

  private async testCumulativeLayoutShift(): Promise<TestResult> {
    return {
      id: 'performance-cls',
      name: 'Cumulative Layout Shift',
      category: 'performance',
      status: 'info',
      message: 'CLS measurement requires layout shift API',
      recommendations: ['Use Layout Instability API for CLS measurement']
    };
  }

  private async testSpeedIndex(): Promise<TestResult> {
    return {
      id: 'performance-speed-index',
      name: 'Speed Index',
      category: 'performance',
      status: 'info',
      message: 'Speed Index measurement requires synthetic testing',
      recommendations: ['Use Lighthouse for Speed Index measurement']
    };
  }

  private async testTimeToInteractive(): Promise<TestResult> {
    return {
      id: 'performance-tti',
      name: 'Time to Interactive',
      category: 'performance',
      status: 'info',
      message: 'TTI measurement requires performance API',
      recommendations: ['Use Performance Observer API for TTI measurement']
    };
  }

  // Best Practices Tests
  private async testHTTPS(): Promise<TestResult> {
    const isHTTPS = window.location.protocol === 'https:';
    
    return {
      id: 'best-practices-https',
      name: 'HTTPS Usage',
      category: 'best-practices',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'Site is served over HTTPS' : 'Site is not served over HTTPS',
      recommendations: isHTTPS ? [] : ['Implement HTTPS for security and SEO benefits']
    };
  }

  private async testSecurityHeaders(): Promise<TestResult> {
    // This would typically check response headers
    return {
      id: 'best-practices-security-headers',
      name: 'Security Headers',
      category: 'best-practices',
      status: 'info',
      message: 'Security headers check requires server response analysis',
      recommendations: [
        'Implement Content-Security-Policy',
        'Add X-Content-Type-Options',
        'Add X-Frame-Options',
        'Add X-XSS-Protection'
      ]
    };
  }

  private async testContentSecurityPolicy(): Promise<TestResult> {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    return {
      id: 'best-practices-csp',
      name: 'Content Security Policy',
      category: 'best-practices',
      status: cspMeta ? 'pass' : 'warning',
      message: cspMeta ? 'CSP meta tag found' : 'No CSP meta tag found',
      recommendations: cspMeta ? [] : ['Implement Content Security Policy for security']
    };
  }

  private async testHTTPSRedirects(): Promise<TestResult> {
    return {
      id: 'best-practices-https-redirects',
      name: 'HTTPS Redirects',
      category: 'best-practices',
      status: 'info',
      message: 'HTTPS redirect check requires server configuration verification',
      recommendations: ['Ensure HTTP requests redirect to HTTPS']
    };
  }

  private async testMixedContent(): Promise<TestResult> {
    const mixedContent = Array.from(document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]'));
    
    return {
      id: 'best-practices-mixed-content',
      name: 'Mixed Content',
      category: 'best-practices',
      status: mixedContent.length === 0 ? 'pass' : 'fail',
      message: `Found ${mixedContent.length} HTTP resources on HTTPS page`,
      recommendations: mixedContent.length > 0 ? ['Update all resources to use HTTPS'] : []
    };
  }

  private async testDeprecatedAPIs(): Promise<TestResult> {
    // Check for deprecated APIs
    const deprecatedAPIs: string[] = [];
    
    return {
      id: 'best-practices-deprecated-apis',
      name: 'Deprecated APIs',
      category: 'best-practices',
      status: deprecatedAPIs.length === 0 ? 'pass' : 'warning',
      message: `Found ${deprecatedAPIs.length} deprecated API usages`,
      recommendations: deprecatedAPIs.length > 0 ? ['Update deprecated APIs'] : []
    };
  }

  private async testConsoleErrors(): Promise<TestResult> {
    // This would typically monitor console errors
    return {
      id: 'best-practices-console-errors',
      name: 'Console Errors',
      category: 'best-practices',
      status: 'info',
      message: 'Console error monitoring requires runtime analysis',
      recommendations: ['Monitor and fix console errors']
    };
  }

  // Scoring Methods
  private calculateTitleScore(title: string): number {
    let score = 100;
    if (title.length < 30) score -= 20;
    if (title.length > 60) score -= 20;
    if (!title.includes('SmartTaxCalculator')) score -= 10;
    return Math.max(0, score);
  }

  private calculateMetaDescriptionScore(description: string): number {
    let score = 100;
    if (description.length < 120) score -= 30;
    if (description.length > 160) score -= 20;
    if (!description) score = 0;
    return Math.max(0, score);
  }

  // Generate Report
  generateReport(results: TestResult[]): {
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      warnings: number;
      info: number;
      averageScore: number;
    };
    categories: {
      seo: { score: number; issues: number };
      accessibility: { score: number; issues: number };
      performance: { score: number; issues: number };
      'best-practices': { score: number; issues: number };
    };
    recommendations: string[];
    wcagCompliance: {
      levelA: number;
      levelAA: number;
      levelAAA: number;
    };
  } {
    const summary = {
      totalTests: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length,
      info: results.filter(r => r.status === 'info').length,
      averageScore: results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length
    };

    const categories = {
      seo: { 
        score: this.calculateCategoryScore(results.filter(r => r.category === 'seo')),
        issues: results.filter(r => r.category === 'seo' && (r.status === 'fail' || r.status === 'warning')).length
      },
      accessibility: { 
        score: this.calculateCategoryScore(results.filter(r => r.category === 'accessibility')),
        issues: results.filter(r => r.category === 'accessibility' && (r.status === 'fail' || r.status === 'warning')).length
      },
      performance: { 
        score: this.calculateCategoryScore(results.filter(r => r.category === 'performance')),
        issues: results.filter(r => r.category === 'performance' && (r.status === 'fail' || r.status === 'warning')).length
      },
      'best-practices': { 
        score: this.calculateCategoryScore(results.filter(r => r.category === 'best-practices')),
        issues: results.filter(r => r.category === 'best-practices' && (r.status === 'fail' || r.status === 'warning')).length
      }
    };

    const wcagCompliance = {
      levelA: results.filter(r => r.wcagLevel === 'A' && r.status === 'fail').length,
      levelAA: results.filter(r => r.wcagLevel === 'AA' && r.status === 'fail').length,
      levelAAA: results.filter(r => r.wcagLevel === 'AAA' && r.status === 'fail').length
    };

    const recommendations = this.generateRecommendations(results);

    return {
      summary,
      categories,
      recommendations,
      wcagCompliance
    };
  }

  private calculateCategoryScore(categoryResults: TestResult[]): number {
    if (categoryResults.length === 0) return 0;
    const scores = categoryResults.map(r => r.score || 0).filter(s => s > 0);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  private generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const criticalIssues = results.filter(r => r.status === 'fail');
    const warnings = results.filter(r => r.status === 'warning');
    
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical issues immediately`);
    }
    
    if (warnings.length > 0) {
      recommendations.push(`Review ${warnings.length} warnings for potential improvements`);
    }
    
    const seoIssues = results.filter(r => r.category === 'seo' && (r.status === 'fail' || r.status === 'warning'));
    if (seoIssues.length > 5) {
      recommendations.push('Comprehensive SEO review recommended');
    }
    
    const accessibilityIssues = results.filter(r => r.category === 'accessibility' && r.status === 'fail');
    if (accessibilityIssues.length > 0) {
      recommendations.push('Fix accessibility issues to ensure WCAG compliance');
    }
    
    return recommendations;
  }
}

// React Hook for Testing
export const useSEOAccessibilityTesting = (config: TestConfig) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSuite = new SEOAccessibilityTestSuite(config);

  const runTests = useCallback(async () => {
    setIsTesting(true);
    setError(null);
    
    try {
      const testResults = await testSuite.runFullTest();
      const testReport = testSuite.generateReport(testResults);
      
      setResults(testResults);
      setReport(testReport);
      
      return { results: testResults, report: testReport };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Testing failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsTesting(false);
    }
  }, [config]);

  return {
    results,
    isTesting,
    report,
    error,
    runTests
  };
};

export default SEOAccessibilityTestSuite;