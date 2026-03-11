// SEO/Accessibility Testing and Demo Page
import React, { useState, useEffect } from 'react';
import { EnhancedSEO, seoUtils } from '../components/seo/EnhancedSEO';
import { useAccessibility } from '../utils/accessibility-audit';
import { useKeyboardNavigation } from '../hooks/use-keyboard-navigation';
import { KeyboardShortcutsHelp } from '../hooks/KeyboardShortcutsHelp';
import { useSEOAccessibilityTesting } from '../utils/seo-accessibility-testing';
import { 
  ScreenReaderAnnouncement, 
  VisuallyHidden, 
  SkipLink, 
  ScreenReaderStatus,
  ScreenReaderFormHelper,
  ScreenReaderTableHelper,
  ScreenReaderLoading,
  ScreenReaderErrorBoundary
} from '../components/accessibility/ScreenReaderComponents';
import {
  MobileAccessibleButton,
  MobileAccessibleInput,
  MobileAccessibleCheckbox,
  MobileAccessibleRadio,
  MobileAccessibleSelect,
  useMobileAccessibility
} from '../components/accessibility/MobileAccessibility';

const SEOAccessibilityDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    country: '',
    subscribe: false,
    contactMethod: 'email'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');

  // Initialize accessibility tools
  const { 
    issues, 
    isAuditing, 
    performAudit, 
    applyFixes, 
    getReport 
  } = useAccessibility({ 
    autoFix: false, 
    auditOnMount: false 
  });

  const keyboardNav = useKeyboardNavigation({
    enabled: true,
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrl'],
        description: 'Run accessibility audit',
        action: () => handleAccessibilityAudit(),
        category: 'action'
      },
      {
        key: 's',
        modifiers: ['ctrl'],
        description: 'Run SEO tests',
        action: () => handleSEOTests(),
        category: 'action'
      },
      {
        key: 'r',
        modifiers: ['ctrl'],
        description: 'Run all tests',
        action: () => handleRunAllTests(),
        category: 'action'
      }
    ]
  });

  const seoAccessibilityTesting = useSEOAccessibilityTesting({
    url: window.location.href,
    accessibilityLevel: 'AA',
    seoChecks: true,
    performanceChecks: true,
    bestPracticesChecks: true
  });

  const mobileAccessibility = useMobileAccessibility();

  // SEO Configuration
  const seoConfig = {
    title: 'SEO & Accessibility Testing - SmartTaxCalculator',
    description: 'Comprehensive testing and demonstration of SEO and accessibility features including structured data, ARIA labels, keyboard navigation, and mobile accessibility.',
    keywords: ['SEO testing', 'accessibility testing', 'WCAG compliance', 'structured data', 'keyboard navigation', 'screen reader', 'mobile accessibility'],
    canonicalUrl: window.location.href,
    ogImage: 'https://tax-calculator.com/og-seo-accessibility.jpg',
    twitterImage: 'https://tax-calculator.com/twitter-seo-accessibility.jpg',
    type: 'website' as const,
    breadcrumbs: [
      { name: 'Home', url: 'https://tax-calculator.com' },
      { name: 'Testing', url: 'https://tax-calculator.com/testing' },
      { name: 'SEO & Accessibility', url: window.location.href }
    ],
    faqPageData: {
      questions: [
        {
          question: 'What is WCAG compliance?',
          answer: 'WCAG (Web Content Accessibility Guidelines) are international standards for making web content more accessible to people with disabilities.'
        },
        {
          question: 'Why is SEO important?',
          answer: 'SEO helps improve your website\'s visibility in search engines, driving more organic traffic and improving user experience.'
        },
        {
          question: 'How do I test accessibility?',
          answer: 'Use automated tools, manual testing, and real user testing with assistive technologies to ensure comprehensive accessibility.'
        }
      ]
    },
    localBusinessData: {
      name: 'SmartTaxCalculator',
      description: 'Comprehensive tax calculation and planning services with full accessibility support',
      address: {
        street: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India'
      },
      telephone: '+91-123-456-7890',
      email: 'support@tax-calculator.com',
      url: 'https://tax-calculator.com',
      openingHours: ['Mo-Fr 09:00-18:00', 'Sa 09:00-13:00'],
      priceRange: '\u20B9',
      rating: {
        ratingValue: 4.8,
        reviewCount: 1250
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    // Simulate form validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.country) newErrors.country = 'Country is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      setAnnouncement('Form validation failed. Please check the errors and try again.');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Form submitted successfully! Thank you for your input.');
      setAnnouncement('Form submitted successfully!');
      setFormData({
        name: '',
        email: '',
        age: '',
        country: '',
        subscribe: false,
        contactMethod: 'email'
      });
    }, 2000);
  };

  // Handle accessibility audit
  const handleAccessibilityAudit = async () => {
    setAnnouncement('Running accessibility audit...');
    await performAudit();
    const report = getReport();
    setAnnouncement(`Accessibility audit complete. Found ${report.totalIssues} issues.`);
  };

  // Handle SEO tests
  const handleSEOTests = async () => {
    setAnnouncement('Running SEO tests...');
    await seoAccessibilityTesting.runTests();
    setTestResults(seoAccessibilityTesting.results);
    setAnnouncement('SEO tests complete.');
  };

  // Handle all tests
  const handleRunAllTests = async () => {
    setAnnouncement('Running comprehensive SEO and accessibility tests...');
    await handleAccessibilityAudit();
    await handleSEOTests();
    setAnnouncement('All tests complete.');
  };

  // Handle fixes
  const handleApplyFixes = async () => {
    setAnnouncement('Applying automated accessibility fixes...');
    const fixesApplied = applyFixes();
    setAnnouncement(`Applied ${fixesApplied} accessibility fixes.`);
  };

  return (
    <ScreenReaderErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced SEO Component */}
        <EnhancedSEO {...seoConfig} />

        {/* Skip Links */}
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#testing-controls">Skip to testing controls</SkipLink>

        {/* Screen Reader Announcements */}
        <ScreenReaderAnnouncement message={announcement} priority="polite" />
        <ScreenReaderLoading isLoading={isLoading} />

        {/* Header */}
        <header className="bg-white shadow-sm border-b" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                SEO & Accessibility Testing
              </h1>
              <div className="flex items-center space-x-4">
                <KeyboardShortcutsHelp shortcuts={keyboardNav.shortcuts} />
                <span className="text-sm text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded">Shift+?</kbd> for help
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Testing Controls */}
          <section id="testing-controls" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Testing Controls</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MobileAccessibleButton
                  onClick={handleAccessibilityAudit}
                  disabled={isAuditing}
                  variant="primary"
                >
                  {isAuditing ? 'Running Audit...' : 'Run Accessibility Audit'}
                </MobileAccessibleButton>

                <MobileAccessibleButton
                  onClick={handleSEOTests}
                  disabled={seoAccessibilityTesting.isTesting}
                  variant="secondary"
                >
                  {seoAccessibilityTesting.isTesting ? 'Testing SEO...' : 'Run SEO Tests'}
                </MobileAccessibleButton>

                <MobileAccessibleButton
                  onClick={handleRunAllTests}
                  disabled={isAuditing || seoAccessibilityTesting.isTesting}
                  variant="primary"
                >
                  Run All Tests
                </MobileAccessibleButton>

                <MobileAccessibleButton
                  onClick={handleApplyFixes}
                  disabled={issues.length === 0}
                  variant="secondary"
                >
                  Apply Fixes ({issues.filter(i => i.automatedFix && !i.manualFixRequired).length})
                </MobileAccessibleButton>
              </div>
            </div>
          </section>

          {/* Test Results */}
          {(issues.length > 0 || testResults.length > 0) && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
              
              {/* Accessibility Issues */}
              {issues.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Issues ({issues.length})</h3>
                  <div className="space-y-3">
                    {issues.slice(0, 5).map((issue, index) => (
                      <div key={issue.id} className={`p-3 rounded border-l-4 ${
                        issue.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        issue.severity === 'serious' ? 'border-orange-500 bg-orange-50' :
                        issue.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{issue.description}</p>
                            <p className="text-sm text-gray-600 mt-1">{issue.remediation}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              WCAG {issue.wcagLevel} - {issue.wcagGuideline}
                            </p>
                          </div>
                          {issue.automatedFix && !issue.manualFixRequired && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Auto-fixable
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {issues.length > 5 && (
                    <p className="text-sm text-gray-600 mt-4">
                      Showing 5 of {issues.length} issues. Run full audit for complete results.
                    </p>
                  )}
                </div>
              )}

              {/* SEO Test Results */}
              {testResults.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Test Results ({testResults.length})</h3>
                  <div className="space-y-3">
                    {testResults.slice(0, 5).map((result, index) => (
                      <div key={result.id} className={`p-3 rounded border-l-4 ${
                        result.status === 'pass' ? 'border-green-500 bg-green-50' :
                        result.status === 'fail' ? 'border-red-500 bg-red-50' :
                        result.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{result.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                            {result.recommendations && result.recommendations.length > 0 && (
                              <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                                {result.recommendations.map((rec: string, i: number) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {result.score && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.score >= 80 ? 'bg-green-100 text-green-800' :
                              result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {testResults.length > 5 && (
                    <p className="text-sm text-gray-600 mt-4">
                      Showing 5 of {testResults.length} results. Run full tests for complete results.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Demo Form */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessibility Demo Form</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} noValidate>
                <ScreenReaderFormHelper
                  formId="demo-form"
                  instructions="Please fill out all required fields. Fields marked with * are required."
                  errors={errors}
                  successMessage={successMessage}
                  isSubmitting={isLoading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MobileAccessibleInput
                    label="Full Name *"
                    id="name"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    placeholder="Enter your full name"
                    error={errors.name}
                    required
                    autoComplete="name"
                  />

                  <MobileAccessibleInput
                    label="Email Address *"
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    placeholder="Enter your email address"
                    error={errors.email}
                    required
                    autoComplete="email"
                    inputMode="email"
                  />

                  <MobileAccessibleInput
                    label="Age *"
                    type="number"
                    id="age"
                    value={formData.age}
                    onChange={(value) => setFormData(prev => ({ ...prev, age: value }))}
                    placeholder="Enter your age"
                    error={errors.age}
                    required
                    min={18}
                    max={100}
                    inputMode="numeric"
                  />

                  <MobileAccessibleSelect
                    label="Country *"
                    id="country"
                    value={formData.country}
                    onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    placeholder="Select your country"
                    error={errors.country}
                    required
                    options={[
                      { value: '', label: 'Select Country', disabled: true },
                      { value: 'IN', label: 'India' },
                      { value: 'US', label: 'United States' },
                      { value: 'UK', label: 'United Kingdom' },
                      { value: 'CA', label: 'Canada' },
                      { value: 'AU', label: 'Australia' }
                    ]}
                  />
                </div>

                <div className="mt-6">
                  <MobileAccessibleCheckbox
                    label="Subscribe to newsletter"
                    checked={formData.subscribe}
                    onChange={(checked) => setFormData(prev => ({ ...prev, subscribe: checked }))}
                  />
                </div>

                <div className="mt-6">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method
                    </legend>
                    <div className="space-y-2">
                      <MobileAccessibleRadio
                        name="contactMethod"
                        label="Email"
                        value="email"
                        checked={formData.contactMethod === 'email'}
                        onChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}
                      />
                      <MobileAccessibleRadio
                        name="contactMethod"
                        label="Phone"
                        value="phone"
                        checked={formData.contactMethod === 'phone'}
                        onChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}
                      />
                      <MobileAccessibleRadio
                        name="contactMethod"
                        label="SMS"
                        value="sms"
                        checked={formData.contactMethod === 'sms'}
                        onChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}
                      />
                    </div>
                  </fieldset>
                </div>

                <div className="mt-6">
                  <MobileAccessibleButton
                    type="submit"
                    loading={isLoading}
                    loadingText="Submitting..."
                    variant="primary"
                  >
                    Submit Form
                  </MobileAccessibleButton>
                </div>
              </form>
            </div>
          </section>

          {/* Demo Table */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessibility Demo Table</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200" role="table">
                <ScreenReaderTableHelper
                  tableId="demo-table"
                  caption="Demo table showing accessibility features and their implementation status"
                  rowCount={5}
                  columnCount={4}
                  hasHeaders={true}
                />
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WCAG Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Implementation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Keyboard Navigation
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Implemented
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Complete</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Screen Reader Support
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Implemented
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Complete</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Color Contrast
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Implemented
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">AA</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Complete</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Mobile Accessibility
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Implemented
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Complete</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Structured Data
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Implemented
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Complete</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile Accessibility Info */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mobile Accessibility Features</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-medium text-gray-900 mb-2">Touch Targets</h3>
                  <p className="text-sm text-gray-600">
                    All interactive elements meet minimum 44px touch target size requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">👆</div>
                  <h3 className="font-medium text-gray-900 mb-2">Touch Gestures</h3>
                  <p className="text-sm text-gray-600">
                    Optimized for touch interactions with proper feedback and gesture support
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <h3 className="font-medium text-gray-900 mb-2">No Zoom</h3>
                  <p className="text-sm text-gray-600">
                    Prevents unwanted zoom on form inputs with proper font sizing
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Visually Hidden Content */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Screen Reader Content</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <VisuallyHidden>
                This content is only visible to screen readers and provides additional context
                for users who rely on assistive technologies. It demonstrates proper use of
                visually hidden content that enhances accessibility without affecting visual design.
              </VisuallyHidden>
              
              <p className="text-gray-600 mb-4">
                The content above is hidden visually but available to screen readers. 
                This demonstrates proper accessibility implementation.
              </p>

              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Screen Reader Announcement:</strong> This page includes comprehensive 
                  accessibility features including keyboard navigation, ARIA labels, structured data, 
                  and mobile accessibility optimizations.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-sm">
                © 2024 SmartTaxCalculator. Built with comprehensive SEO and accessibility features.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This page demonstrates WCAG 2.1 AA compliance, structured data implementation, 
                and mobile-first accessibility design.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ScreenReaderErrorBoundary>
  );
};

export default SEOAccessibilityDemo;
