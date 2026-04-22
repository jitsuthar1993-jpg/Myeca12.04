import { Switch, Route } from "wouter";
import { Suspense, lazy } from 'react';
import { lazyWithRetry } from '@/utils/bundle-optimization';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import HomePage from "@/pages/home.page";

// Route components loaded lazily to reduce initial bundle size
const NotFound = lazyWithRetry(() => import("@/pages/not-found"));
const IncomeTaxCalculator = lazyWithRetry(() => import("@/features/calculators/pages/income-tax.page"));
const TaxRegimeCalculator = lazyWithRetry(() => import("@/features/calculators/pages/tax-regime.page"));
const HRACalculator = lazyWithRetry(() => import("@/features/calculators/pages/hra.page"));
const SIPCalculator = lazyWithRetry(() => import("@/features/calculators/pages/sip.page"));
const EnhancedSIPCalculatorPage = lazyWithRetry(() => import("@/features/calculators/pages/sip-enhanced.page"));
const EMICalculator = lazyWithRetry(() => import("@/features/calculators/pages/emi.page"));
const TDSCalculator = lazyWithRetry(() => import("@/features/calculators/pages/tds.page"));
const FDCalculator = lazyWithRetry(() => import("@/features/calculators/pages/fd.page"));
const EnhancedFDCalculatorPage = lazyWithRetry(() => import("@/features/calculators/pages/fd-enhanced.page"));
const PPFCalculator = lazyWithRetry(() => import("@/features/calculators/pages/ppf.page"));
const WithdrawalPlannerPage = lazyWithRetry(() => import("@/features/calculators/pages/withdrawal-planner.page"));
const CapitalGainsCalculator = lazyWithRetry(() => import("@/features/calculators/pages/capital-gains.page"));
const LoanCalculator = lazyWithRetry(() => import("@/features/calculators/pages/loan-calculator.page"));

const CalculatorsPage = lazyWithRetry(() => import("@/features/calculators/pages/index.page"));
const TaxOptimizerPage = lazyWithRetry(() => import("@/pages/tax-optimizer.page"));
const RegimeComparatorPage = lazyWithRetry(() => import("@/features/calculators/pages/regime-comparator.page"));
const AdvanceTaxCalculatorPage = lazyWithRetry(() => import("@/features/calculators/pages/advance-tax.page"));
const GeneralCalculatorPage = lazyWithRetry(() => import("@/features/calculators/pages/general.page"));
const HSNFinderPage = lazyWithRetry(() => import("@/features/calculators/pages/hsn-finder.page"));
const ITRStatusTrackerPage = lazyWithRetry(() => import("@/features/itr/pages/status-tracker.page"));
const TDSRefundTrackerPage = lazyWithRetry(() => import("@/pages/tds-refund-tracker.page"));
const TaxLossHarvestingPage = lazyWithRetry(() => import("@/pages/tax-loss-harvesting.page"));

// AI & Automation Features
const TaxAssistantPage = lazyWithRetry(() => import("@/pages/tax-assistant.page"));
const Form16ParserPage = lazyWithRetry(() => import("@/pages/form16-parser.page"));
const BankAnalyzerPage = lazyWithRetry(() => import("@/pages/bank-analyzer.page"));
const AISViewerPage = lazyWithRetry(() => import("@/pages/ais-viewer.page"));
const CapitalGainsImportPage = lazyWithRetry(() => import("@/pages/capital-gains-import.page"));

// Investment Integration Features
const NPSCalculatorPage = lazyWithRetry(() => import("@/features/calculators/pages/nps.page"));
const ELSSComparatorPage = lazyWithRetry(() => import("@/pages/elss-comparator.page"));
// Educational Content Features
const LearnPage = lazyWithRetry(() => import("@/pages/learn/index.page"));
const GlossaryPage = lazyWithRetry(() => import("@/pages/learn/glossary.page"));
const VideoTutorialsPage = lazyWithRetry(() => import("@/pages/learn/videos.page"));
const TaxGuidesPage = lazyWithRetry(() => import("@/pages/learn/guides.page"));
const TaxGuidePage = lazyWithRetry(() => import("@/pages/learn/guide/[slug].page"));
const ConsultationsPage = lazyWithRetry(() => import("@/pages/learn/consultations.page"));

// Professional Services Platform
const ServicesMarketplacePage = lazyWithRetry(() => import("@/pages/services/marketplace.page"));
const ServiceSelectionPage = lazyWithRetry(() => import("@/pages/services/selection.page"));
const DocumentGeneratorPage = lazyWithRetry(() => import("@/pages/documents/generator.page"));
const DocumentGeneratorRegistry = lazyWithRetry(() => import("@/pages/documents/registry.page"));
const BusinessDashboardPage = lazyWithRetry(() => import("@/pages/business/dashboard.page"));
const VirtualCFOPage = lazyWithRetry(() => import("@/pages/business/virtual-cfo.page"));

const NoticeCompliancePage = lazyWithRetry(() => import("@/pages/services/notice-compliance.page"));
const TdsFilingPage = lazyWithRetry(() => import("@/pages/services/tds-filing.page"));
const GstRegistrationPage = lazyWithRetry(() => import("@/pages/services/gst-registration.page"));
const CompanyRegistrationPage = lazyWithRetry(() => import("@/pages/services/company-registration.page"));
const StartupIndiaRegistrationPage = lazyWithRetry(() => import("@/pages/services/startup-india-registration.page"));
const MSMEUdyamRegistrationPage = lazyWithRetry(() => import("@/pages/services/msme-udyam-registration.page"));
const FSSAIRegistrationPage = lazyWithRetry(() => import("@/pages/services/fssai-registration.page"));
const TradeLicensePage = lazyWithRetry(() => import("@/pages/services/trade-license.page"));
const GSTReturnsPage = lazyWithRetry(() => import("@/pages/services/gst-returns.page"));
const TrademarkRegistrationPage = lazyWithRetry(() => import("@/pages/services/trademark-registration.page"));
const ISOCertificationPage = lazyWithRetry(() => import("@/pages/services/iso-certification.page"));
const LabourLawCompliancePage = lazyWithRetry(() => import("@/pages/services/labour-law-compliance.page"));
const StartupServicesPage = lazyWithRetry(() => import("@/pages/startup-services.page"));
const CityLandingPage = lazyWithRetry(() => import("@/pages/services/city-landing.page"));
const FundingPage = lazyWithRetry(() => import("@/pages/startup/funding.page"));
const StartupRegistrationPage = lazyWithRetry(() => import("@/pages/startup/registration.page"));
const TaxPlanningPage = lazyWithRetry(() => import("@/pages/services/tax-planning.page"));
const ComplianceManagementPage = lazyWithRetry(() => import("@/pages/services/compliance-management.page"));
const AuditServicesPage = lazyWithRetry(() => import("@/pages/services/audit-services.page"));
const DocumentVaultServicePage = lazyWithRetry(() => import("@/pages/services/document-vault.page"));
const PricingPage = lazyWithRetry(() => import("@/pages/pricing.page"));
const ContactPage = lazyWithRetry(() => import("@/pages/contact.page"));
const AboutPage = lazyWithRetry(() => import("@/pages/about.page"));
const LoginPage = lazyWithRetry(() => import("@/pages/auth/login.page"));
const RegisterPage = lazyWithRetry(() => import("@/pages/auth/register.page"));
const ForgotPasswordPage = lazyWithRetry(() => import("@/pages/auth/forgot-password.page"));
const AdminLoginPage = lazyWithRetry(() => import("@/pages/auth/admin-login.page"));
const UserDashboard = lazyWithRetry(() => import("@/pages/user-dashboard.page"));
const AccountSettingsPage = lazyWithRetry(() => import("@/pages/settings/account.page"));
const ProfilePage = lazyWithRetry(() => import("@/pages/profile.page"));
const ProfilesPage = lazyWithRetry(() => import("@/pages/profiles.page"));
const ExpertsIndexPage = lazyWithRetry(() => import("@/pages/experts/index.page"));
const ExpertProfilePage = lazyWithRetry(() => import("@/pages/experts/profile.page"));
const DocumentsPage = lazyWithRetry(() => import("@/pages/documents.page"));
const ReportsPage = lazyWithRetry(() => import("@/pages/reports.page"));
const WorkflowsPage = lazyWithRetry(() => import("@/pages/workflows.page"));
const TeamsPage = lazyWithRetry(() => import("@/pages/teams.page"));
const ReferralsPage = lazyWithRetry(() => import("@/pages/referrals.page"));
const ComparisonToolsPage = lazyWithRetry(() => import("@/components/comparison/ComparisonToolsPage"));
const ServerErrorPage = lazyWithRetry(() => import("@/pages/server-error.page"));

// Blog management is handled via AdminBlog below
const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/index.page"));
const ForbiddenPage = lazyWithRetry(() => import("@/pages/forbidden.page"));
const ClerkCallback = lazyWithRetry(() => import("@/components/auth/ClerkCallback"));
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RequireRole } from '@/components/auth/RequireRole';
import { RequireAuth } from '@/components/auth/RequireAuth';
const CADashboard = lazyWithRetry(() => import("@/pages/ca/dashboard.page"));
const AdminServices = lazyWithRetry(() => import("@/pages/admin/services.page"));
const AdminBlog = lazyWithRetry(() => import("@/pages/admin/blog.page"));
const AdminAnalytics = lazyWithRetry(() => import("@/pages/admin/analytics.page"));
const AdminUsers = lazyWithRetry(() => import("@/pages/admin/users.page"));
const AdminUserManagement = lazyWithRetry(() => import("@/pages/admin/user-management.page"));
const AdminCreateAdmin = lazyWithRetry(() => import("@/pages/admin/create-admin.page"));
const AdminFeedbackManagement = lazyWithRetry(() => import("@/pages/admin/feedback-management.page"));
const AdminSettings = lazyWithRetry(() => import("@/pages/admin/settings.page"));
const CategoriesManagementPage = lazyWithRetry(() => import("@/pages/admin/categories-management.page"));
const UpdatesManagementPage = lazyWithRetry(() => import("@/pages/admin/updates-management.page"));
const MediaManagementPage = lazyWithRetry(() => import("@/pages/admin/media-management.page"));
const TeamDashboard = lazyWithRetry(() => import("@/pages/team/dashboard.page"));
const ITRFilingPage = lazyWithRetry(() => import("@/features/itr/pages/filing.page"));
const ITRFormSelectorPage = lazyWithRetry(() => import("@/features/itr/pages/form-selector.page"));
const ITRFormRecommenderPage = lazyWithRetry(() => import("@/features/itr/pages/form-recommender.page"));
const ITRSuccessPage = lazyWithRetry(() => import("@/features/itr/pages/success.page"));
const ITRStepByStepGuide = lazyWithRetry(() => import("@/features/itr/pages/step-by-step-guide.page"));
const CompactFilingGuidePage = lazyWithRetry(() => import("@/features/itr/pages/compact-filing-guide.page").then(mod => ({ default: mod.CompactFilingGuidePage })));
const SearchPage = lazyWithRetry(() => import("@/pages/search.page"));
const AnalyticsPage = lazyWithRetry(() => import("@/pages/analytics.page"));
const AnalyticsDashboardPage = lazyWithRetry(() => import("@/pages/analytics-dashboard.page"));
const SettingsPage = lazyWithRetry(() => import("@/pages/settings.page"));
const ApiDocsPage = lazyWithRetry(() => import("@/pages/api-docs.page"));
const ExportCenterPage = lazyWithRetry(() => import("@/pages/export-center.page"));
const IntegrationsPage = lazyWithRetry(() => import("@/pages/integrations.page"));
const BlogIndexPage = lazyWithRetry(() => import("@/pages/blog.page"));
const BlogDetailPage = lazyWithRetry(() => import("@/pages/blog/[slug].page"));
const ServicesPage = lazyWithRetry(() => import("@/pages/services.page"));
const AllServicesPage = lazyWithRetry(() => import("@/pages/all-services.page"));
const AdvancedFeaturesPage = lazyWithRetry(() => import("@/pages/advanced-features.page"));
const PrivacyPolicyPage = lazyWithRetry(() => import("@/pages/legal/privacy-policy.page"));
const TermsOfServicePage = lazyWithRetry(() => import("@/pages/legal/terms-of-service.page"));
const RefundPolicyPage = lazyWithRetry(() => import("@/pages/legal/refund-policy.page"));
const DisclaimerPage = lazyWithRetry(() => import("@/pages/legal/disclaimer.page"));
const ComplianceCalendarPage = lazyWithRetry(() => import("@/pages/compliance-calendar.page"));
const PenaltyCalculatorPage = lazyWithRetry(() => import("@/features/calculators/pages/penalty-calculator.page"));
const ExpertConsultationPage = lazyWithRetry(() => import("@/pages/expert-consultation.page"));
const HelpCenterPage = lazyWithRetry(() => import("@/pages/help/help-center.page"));
const FAQPage = lazyWithRetry(() => import("@/pages/help/faq.page"));
const UserGuidePage = lazyWithRetry(() => import("@/pages/help/user-guide.page"));
const DashboardServicesPage = lazyWithRetry(() => import("@/pages/dashboard/services.page"));
const UnifiedAccountPage = lazyWithRetry(() => import("@/pages/dashboard/account.page"));
const KnowledgeBasePage = lazyWithRetry(() => import("@/pages/help/knowledge-base.page"));



const AppLoading = () => <PageSkeleton />;

export default function Routes() {
  return (
    <Suspense fallback={<AppLoading />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/calculators/income-tax" component={IncomeTaxCalculator} />
        <Route path="/calculators/tax-regime" component={TaxRegimeCalculator} />
        <Route path="/calculators/hra" component={HRACalculator} />
        <Route path="/calculators/sip" component={SIPCalculator} />
        <Route path="/calculators/sip-enhanced" component={EnhancedSIPCalculatorPage} />
        <Route path="/calculators/emi" component={EMICalculator} />
        <Route path="/calculators/tds" component={TDSCalculator} />
        <Route path="/calculators/fd" component={FDCalculator} />
        <Route path="/calculators/fd-enhanced" component={EnhancedFDCalculatorPage} />
        <Route path="/calculators/ppf" component={PPFCalculator} />
        <Route path="/calculators/withdrawal-planner" component={WithdrawalPlannerPage} />
        <Route path="/calculators/capital-gains" component={CapitalGainsCalculator} />
        <Route path="/calculators/home-loan" component={LoanCalculator} />
        <Route path="/calculators/car-loan" component={LoanCalculator} />
        <Route path="/calculators/personal-loan" component={LoanCalculator} />
        <Route path="/calculators/education-loan" component={LoanCalculator} />
        <Route path="/calculators" component={CalculatorsPage} />
        <Route path="/calculators/regime-comparator" component={RegimeComparatorPage} />
        <Route path="/calculators/advance-tax" component={AdvanceTaxCalculatorPage} />
        <Route path="/calculators/general" component={GeneralCalculatorPage} />
        <Route path="/calculators/hsn-finder" component={HSNFinderPage} />
        <Route path="/tax-optimizer" component={TaxOptimizerPage} />
        <Route path="/itr/status-tracker" component={ITRStatusTrackerPage} />
        <Route path="/tds-refund-tracker" component={TDSRefundTrackerPage} />
        <Route path="/tax-loss-harvesting" component={TaxLossHarvestingPage} />

        {/* AI & Automation Features */}
        <Route path="/tax-assistant" component={TaxAssistantPage} />
        <Route path="/form16-parser" component={Form16ParserPage} />
        <Route path="/bank-analyzer" component={BankAnalyzerPage} />
        <Route path="/ais-viewer" component={AISViewerPage} />
        <Route path="/capital-gains-import" component={CapitalGainsImportPage} />

        {/* Investment Integration Features */}
        <Route path="/calculators/nps" component={NPSCalculatorPage} />
        <Route path="/elss-comparator" component={ELSSComparatorPage} />
        <Route path="/learn/investment-basics" component={LearnPage} />

        {/* Educational Content */}
        <Route path="/learn" component={LearnPage} />
        <Route path="/learn/glossary" component={GlossaryPage} />
        <Route path="/learn/videos" component={VideoTutorialsPage} />
        <Route path="/learn/guides" component={TaxGuidesPage} />
        <Route path="/learn/guide/:slug" component={TaxGuidePage} />
        <Route path="/learn/consultations" component={ConsultationsPage} />

        {/* Professional Services Platform */}
        <Route path="/services/selection" component={ServiceSelectionPage} />
        <Route path="/services/activate/:serviceId" component={lazyWithRetry(() => import("@/pages/services/activation.page"))} />
        <Route path="/services/marketplace" component={ServicesMarketplacePage} />
        <Route path="/documents/generator" component={DocumentGeneratorRegistry} />
        <Route path="/documents/generator_page" component={DocumentGeneratorRegistry} />
        <Route path="/documents/generator/:type" component={DocumentGeneratorPage} />
        <Route path="/business/dashboard" component={BusinessDashboardPage} />
        <Route path="/business/virtual-cfo" component={VirtualCFOPage} />

        <Route path="/services/notice-compliance" component={NoticeCompliancePage} />
        <Route path="/services/tds-filing" component={TdsFilingPage} />
        <Route path="/services/gst-registration" component={GstRegistrationPage} />
        <Route path="/services/company-registration" component={CompanyRegistrationPage} />
        <Route path="/services/startup-india-registration" component={StartupIndiaRegistrationPage} />
        <Route path="/startup/registration" component={StartupRegistrationPage} />
        <Route path="/services/msme-udyam-registration" component={MSMEUdyamRegistrationPage} />
        <Route path="/services/fssai-registration" component={FSSAIRegistrationPage} />
        <Route path="/services/trade-license" component={TradeLicensePage} />
        <Route path="/services/company-incorporation" component={CompanyRegistrationPage} />
        <Route path="/services/gst-returns" component={GSTReturnsPage} />
        <Route path="/services/trademark-registration" component={TrademarkRegistrationPage} />
        <Route path="/services/iso-certification" component={ISOCertificationPage} />
        <Route path="/services/labour-law-compliance" component={LabourLawCompliancePage} />
        <Route path="/startup/funding" component={FundingPage} />
        <Route path="/startup-services" component={StartupServicesPage} />
        <Route path="/services/funding-assistance" component={FundingPage} />
        <Route path="/services/tax-planning" component={TaxPlanningPage} />
        <Route path="/services/compliance-management" component={ComplianceManagementPage} />
        <Route path="/services/audit-services" component={AuditServicesPage} />
        <Route path="/services/document-vault" component={DocumentVaultServicePage} />
        <Route path="/services/:service/:city" component={CityLandingPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/all-services" component={AllServicesPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/auth/admin-login" component={AdminLoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/auth/callback" component={ClerkCallback} />
        <Route path="/dashboard/services" component={() => <RequireAuth><DashboardServicesPage /></RequireAuth>} />
        <Route path="/dashboard" component={() => <RequireAuth><UserDashboard /></RequireAuth>} />

        <Route path="/user" component={() => <RequireAuth><UserDashboard /></RequireAuth>} />
        <Route path="/account" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />
        <Route path="/profile" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />
        <Route path="/settings" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />
        <Route path="/settings/account" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />

        <Route path="/team/dashboard" component={() => (
          <RequireRole roles={['admin', 'team_member']}>
            <TeamDashboard />
          </RequireRole>
        )} />
        <Route path="/experts" component={ExpertsIndexPage} />
        <Route path="/experts/:id" component={ExpertProfilePage} />
        <Route path="/profiles" component={ProfilesPage} />
        <Route path="/documents" component={() => <RequireAuth><DocumentsPage /></RequireAuth>} />
        <Route path="/admin/blog-management" component={() => (
          <RequireRole roles={['admin', 'team_member']}>
            <AdminBlog />
          </RequireRole>
        )} />
        <Route path="/admin/categories-management" component={() => (
          <RequireRole roles={['admin', 'team_member']}>
            <CategoriesManagementPage />
          </RequireRole>
        )} />
        <Route path="/admin/updates-management" component={() => (
          <RequireRole roles={['admin', 'team_member']}>
            <UpdatesManagementPage />
          </RequireRole>
        )} />
        <Route path="/admin/media-management" component={() => (
          <RequireRole roles={['admin', 'team_member']}>
            <MediaManagementPage />
          </RequireRole>
        )} />
        <Route path="/403" component={ForbiddenPage} />
        <Route path="/admin/dashboard" component={() => (
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        )} />
        <Route path="/admin" component={() => (
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        )} />
        <Route path="/admin/services" component={() => (
          <RequireAdmin>
            <AdminServices />
          </RequireAdmin>
        )} />
        <Route path="/admin/blog" component={() => (
          <RequireAdmin>
            <AdminBlog />
          </RequireAdmin>
        )} />
        <Route path="/admin/analytics" component={() => {
          const AdminAnalytics = lazyWithRetry(() => import("@/pages/admin/analytics/index.page"))
          return (
            <RequireAdmin>
              <AdminAnalytics />
            </RequireAdmin>
          )
        }} />
        <Route path="/admin/users" component={() => {
          const AdminUsers = lazyWithRetry(() => import("@/pages/admin/users.page"))
          return (
            <RequireAdmin>
              <AdminUsers />
            </RequireAdmin>
          )
        }} />
        <Route path="/admin/user-management" component={() => {
          const AdminUsers = lazyWithRetry(() => import("@/pages/admin/users.page"))
          return (
            <RequireAdmin>
              <AdminUsers />
            </RequireAdmin>
          )
        }} />
        <Route path="/admin/create-admin" component={() => (
          <RequireAdmin>
            <AdminCreateAdmin />
          </RequireAdmin>
        )} />
        <Route path="/admin/feedback" component={() => (
          <RequireAdmin>
            <AdminFeedbackManagement />
          </RequireAdmin>
        )} />
        <Route path="/admin/settings" component={() => (
          <RequireAdmin>
            <AdminSettings />
          </RequireAdmin>
        )} />
        <Route path="/admin/audit-logs" component={() => {
          const AuditLogsPage = lazyWithRetry(() => import("@/pages/admin/audit-logs.page"));
          return (
            <RequireAdmin>
              <AuditLogsPage />
            </RequireAdmin>
          )
        }} />
        {/* CA Routes */}
        <Route path="/ca/dashboard" component={() => (
          <RequireRole roles={['admin', 'ca']}>
            <CADashboard />
          </RequireRole>
        )} />
        <Route path="/ca" component={() => (
          <RequireRole roles={['admin', 'ca']}>
            <CADashboard />
          </RequireRole>
        )} />
        <Route path="/itr/form-selector" component={ITRFormSelectorPage} />
        <Route path="/itr/form-recommender" component={ITRFormRecommenderPage} />
        <Route path="/itr/filing" component={ITRFilingPage} />
        <Route path="/itr/success" component={ITRSuccessPage} />
        <Route path="/itr/step-by-step-guide" component={ITRStepByStepGuide} />
        <Route path="/itr/compact-filing" component={CompactFilingGuidePage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/blog" component={BlogIndexPage} />
        <Route path="/blog/:slug" component={BlogDetailPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/legal/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/legal/terms-of-service" component={TermsOfServicePage} />
        <Route path="/legal/refund-policy" component={RefundPolicyPage} />
        <Route path="/legal/disclaimer" component={DisclaimerPage} />
        <Route path="/compliance-calendar" component={ComplianceCalendarPage} />
        <Route path="/calculators/penalty" component={PenaltyCalculatorPage} />
        <Route path="/expert-consultation" component={ExpertConsultationPage} />
        <Route path="/help" component={HelpCenterPage} />
        <Route path="/help/faq" component={FAQPage} />
        <Route path="/help/user-guide" component={UserGuidePage} />
        <Route path="/help/knowledge-base" component={KnowledgeBasePage} />
        <Route path="/advanced-features" component={AdvancedFeaturesPage} />
        <Route path="/analytics-dashboard" component={AnalyticsDashboardPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/compare" component={ComparisonToolsPage} />
        <Route path="/api-docs" component={ApiDocsPage} />
        <Route path="/export" component={ExportCenterPage} />
        <Route path="/integrations" component={IntegrationsPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/workflows" component={WorkflowsPage} />
        <Route path="/teams" component={TeamsPage} />
        <Route path="/referrals" component={ReferralsPage} />
        <Route path="/500" component={ServerErrorPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
