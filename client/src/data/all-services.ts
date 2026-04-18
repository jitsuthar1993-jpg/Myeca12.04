// Comprehensive list of all services provided by MyeCA.in
// Organized by navigation sections and categories

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  section: string;
  icon: string;
  path?: string;
  price?: string;
  popular?: boolean;
}

export const allServices: Service[] = [
  // SERVICES SECTION - Tax & Filing Services
  {
    id: "itr-filing",
    title: "ITR Filing",
    description: "Complete income tax return filing",
    category: "Tax & Filing Services",
    section: "Services",
    icon: "FileText",
    path: "/itr/filing",
    price: "₹499 - ₹2,999",
    popular: true
  },
  {
    id: "gst-registration",
    title: "GST Registration",
    description: "Quick GST registration online",
    category: "Tax & Filing Services", 
    section: "Services",
    icon: "Receipt",
    path: "/services/gst-registration",
    price: "₹999"
  },
  {
    id: "tds-filing",
    title: "TDS Return Filing",
    description: "TDS quarterly return filing",
    category: "Tax & Filing Services",
    section: "Services", 
    icon: "PiggyBank",
    path: "/services/tds-filing",
    price: "₹799"
  },
  {
    id: "tax-audit",
    title: "Tax Audit",
    description: "Professional tax audit services",
    category: "Tax & Filing Services",
    section: "Services",
    icon: "Shield",
    path: "/services/audit-services",
    price: "₹4,999"
  },
  {
    id: "advance-tax",
    title: "Advance Tax Calculation",
    description: "Calculate and pay advance tax",
    category: "Tax & Filing Services",
    section: "Services",
    icon: "CreditCard",
    path: "/calculators/advance-tax",
    price: "₹299"
  },
  {
    id: "notice-compliance",
    title: "Income Tax Notice Handling",
    description: "Expert assistance for IT notices & responses",
    category: "Tax & Filing Services",
    section: "Services",
    icon: "AlertTriangle",
    path: "/services/notice-compliance",
    price: "₹1,999",
    popular: true
  },

  // SERVICES SECTION - Business Services
  {
    id: "company-registration",
    title: "Company Registration",
    description: "Private limited company incorporation",
    category: "Business Services",
    section: "Services",
    icon: "Building2",
    path: "/services/company-registration", 
    price: "₹6,999",
    popular: true
  },
  {
    id: "trademark-registration",
    title: "Trademark Registration",
    description: "Protect your brand legally",
    category: "Business Services",
    section: "Services",
    icon: "Award",
    path: "/services/trademark-registration",
    price: "₹3,999"
  },
  {
    id: "msme-registration",
    title: "MSME Registration", 
    description: "Udyog Aadhaar registration",
    category: "Business Services",
    section: "Services",
    icon: "Award",
    path: "/services/msme-udyam-registration",
    price: "₹999"
  },
  {
    id: "partnership-deed",
    title: "Partnership Deed",
    description: "Legal partnership agreement",
    category: "Business Services",
    section: "Services",
    icon: "FileText",
    path: "/services/activate/partnership-deed",
    price: "₹2,999"
  },
  {
    id: "annual-compliance",
    title: "Annual Compliance",
    description: "Complete ROC compliance",
    category: "Business Services",
    section: "Services", 
    icon: "Shield",
    path: "/services/compliance-management",
    price: "₹8,999"
  },

  // SERVICES SECTION - Tools & Calculators
  {
    id: "income-tax-calculator",
    title: "Income Tax Calculator",
    description: "Calculate your income tax",
    category: "Tools & Calculators",
    section: "Services",
    icon: "Calculator",
    path: "/calculators/income-tax"
  },
  {
    id: "hra-calculator", 
    title: "HRA Calculator",
    description: "House rent allowance calculator",
    category: "Tools & Calculators",
    section: "Services",
    icon: "Home",
    path: "/calculators/hra"
  },
  {
    id: "sip-calculator",
    title: "SIP Calculator",
    description: "Systematic investment planning",
    category: "Tools & Calculators", 
    section: "Services",
    icon: "TrendingUp",
    path: "/calculators/sip"
  },
  {
    id: "all-calculators",
    title: "All Calculators",
    description: "Complete financial toolkit",
    category: "Tools & Calculators",
    section: "Services",
    icon: "Grid",
    path: "/calculators"
  },

  // ITR FILING SECTION - ITR Filing Services
  {
    id: "start-itr-filing",
    title: "Start ITR Filing",
    description: "Quick & accurate filing",
    category: "ITR Filing Services",
    section: "ITR Filing",
    icon: "FileText",
    path: "/itr/form-selector",
    popular: true
  },
  {
    id: "tax-dashboard",
    title: "Tax Dashboard",
    description: "View your progress",
    category: "ITR Filing Services", 
    section: "ITR Filing",
    icon: "BarChart3",
    path: "/dashboard"
  },
  {
    id: "document-vault",
    title: "Document Vault", 
    description: "Manage documents securely",
    category: "ITR Filing Services",
    section: "ITR Filing",
    icon: "FileText",
    path: "/documents"
  },
  {
    id: "manage-profiles",
    title: "Manage Profiles",
    description: "Family tax filing made easy",
    category: "ITR Filing Services",
    section: "ITR Filing", 
    icon: "Users",
    path: "/profiles"
  },

  // ITR FILING SECTION - Support & Resources
  {
    id: "expert-help",
    title: "Expert Help",
    description: "Professional CA assistance",
    category: "Support & Resources",
    section: "ITR Filing",
    icon: "HelpCircle",
    path: "/pricing"
  },
  {
    id: "tax-guides",
    title: "Tax Guides",
    description: "Learn tax rules and regulations",
    category: "Support & Resources",
    section: "ITR Filing",
    icon: "BookOpen",
    path: "/blog"
  },
  {
    id: "ai-tax-assistant",
    title: "AI Tax Assistant", 
    description: "Smart tax guidance",
    category: "Support & Resources",
    section: "ITR Filing",
    icon: "Bot", 
    path: "/advanced-features"
  },
  {
    id: "tax-analytics",
    title: "Tax Analytics",
    description: "Insights and trends",
    category: "Support & Resources", 
    section: "ITR Filing",
    icon: "BarChart3",
    path: "/analytics"
  },

  // STARTUP SECTION - Business Setup
  {
    id: "startup-company-registration",
    title: "Company Registration",
    description: "Start your business journey",
    category: "Business Setup",
    section: "Startup",
    icon: "Building2", 
    path: "/services/company-registration",
    price: "₹6,999",
    popular: true
  },
  {
    id: "legal-documentation",
    title: "Legal Documentation",
    description: "Complete paperwork assistance",
    category: "Business Setup",
    section: "Startup",
    icon: "FileText",
    path: "/services/activate/legal-documentation",
    price: "₹2,999"
  },
  {
    id: "compliance-setup",
    title: "Compliance Setup", 
    description: "Stay legally compliant",
    category: "Business Setup",
    section: "Startup",
    icon: "Shield",
    path: "/services/compliance-management",
    price: "₹4,999"
  },

  // STARTUP SECTION - Financial Services
  {
    id: "accounting-setup",
    title: "Accounting Setup",
    description: "Financial management system",
    category: "Financial Services",
    section: "Startup",
    icon: "Calculator",
    path: "/startup/accounting",
    price: "₹3,999"
  },
  {
    id: "banking-solutions",
    title: "Banking Solutions",
    description: "Business account opening",
    category: "Financial Services",
    section: "Startup", 
    icon: "CreditCard",
    path: "/services/activate/banking-solutions",
    price: "₹1,999"
  },
  {
    id: "investment-guidance",
    title: "Investment Guidance",
    description: "Grow your startup capital",
    category: "Financial Services",
    section: "Startup",
    icon: "TrendingUp",
    path: "/services/activate/investment-guidance",
    price: "₹5,999"
  },

  // STARTUP SECTION - Support & Growth
  {
    id: "expert-consultation",
    title: "Expert Consultation",
    description: "Strategic business guidance",
    category: "Support & Growth",
    section: "Startup",
    icon: "MessageCircle",
    path: "/expert-consultation",
    price: "₹2,999"
  },
  {
    id: "business-planning",
    title: "Business Planning",
    description: "Blueprint for success",
    category: "Support & Growth", 
    section: "Startup",
    icon: "BookOpen",
    path: "/startup/planning",
    price: "₹4,999"
  },
  {
    id: "growth-strategies",
    title: "Growth Strategies",
    description: "Scale your business effectively", 
    category: "Support & Growth",
    section: "Startup",
    icon: "Award",
    path: "/startup/growth",
    price: "₹7,999"
  },

  // CALCULATORS SECTION - Tax Calculators
  {
    id: "tax-regime-calculator",
    title: "Tax Regime Comparison",
    description: "Old vs new tax regime",
    category: "Tax Calculators",
    section: "Calculators",
    icon: "Calculator",
    path: "/calculators/tax-regime"
  },
  {
    id: "tds-calculator",
    title: "TDS Calculator", 
    description: "Tax deducted at source",
    category: "Tax Calculators",
    section: "Calculators",
    icon: "PiggyBank",
    path: "/calculators/tds"
  },
  {
    id: "capital-gains-calculator",
    title: "Capital Gains Calculator",
    description: "STCG & LTCG calculation",
    category: "Tax Calculators",
    section: "Calculators",
    icon: "TrendingUp", 
    path: "/calculators/capital-gains"
  },

  // CALCULATORS SECTION - Investment Calculators
  {
    id: "ppf-calculator",
    title: "PPF Calculator",
    description: "Public Provident Fund returns",
    category: "Investment Calculators",
    section: "Calculators",
    icon: "PiggyBank",
    path: "/calculators/ppf"
  },
  {
    id: "fd-calculator",
    title: "Fixed Deposit Calculator",
    description: "FD maturity calculator",
    category: "Investment Calculators", 
    section: "Calculators",
    icon: "PiggyBank",
    path: "/calculators/fd"
  },

  // CALCULATORS SECTION - Loan Calculators  
  {
    id: "emi-calculator",
    title: "EMI Calculator",
    description: "Loan EMI calculation", 
    category: "Loan Calculators",
    section: "Calculators",
    icon: "CreditCard",
    path: "/calculators/emi"
  }
];

// Helper functions to filter services
export const getServicesBySection = (section: string) => 
  allServices.filter(service => service.section === section);

export const getServicesByCategory = (category: string) =>
  allServices.filter(service => service.category === category);

export const getPopularServices = () =>
  allServices.filter(service => service.popular);

export const getPaidServices = () =>
  allServices.filter(service => service.price);

export const getFreeServices = () =>
  allServices.filter(service => !service.price);

// Service counts by section
export const serviceCounts = {
  services: getServicesBySection("Services").length,
  itrFiling: getServicesBySection("ITR Filing").length, 
  startup: getServicesBySection("Startup").length,
  calculators: getServicesBySection("Calculators").length,
  total: allServices.length
};

// Category breakdown
export const categoryBreakdown = allServices.reduce((acc, service) => {
  acc[service.category] = (acc[service.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

export default allServices;
