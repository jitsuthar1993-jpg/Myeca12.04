export interface Service {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  description: string;
  documents: string[];
  features: string[];
  category: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  services: Service[];
}

export const servicesData: ServiceCategory[] = [
  {
    id: "tax-services",
    name: "Tax Services",
    description: "Complete tax compliance solutions for individuals and businesses",
    icon: "Calculator",
    color: "blue",
    services: [
      {
        id: "itr-filing-individual",
        name: "ITR Filing for Individuals",
        price: "\u20B9999",
        originalPrice: "\u20B91,499",
        duration: "24-48 hours",
        description: "Expert CA-assisted ITR filing for salary and other income sources",
        category: "tax-services",
        popular: true,
        features: [
          "CA Expert Review",
          "Maximum Refund Guarantee",
          "Form 16 Processing",
          "Investment Optimization",
          "Free Consultation"
        ],
        documents: [
          "PAN Card",
          "Aadhaar Card", 
          "Form 16/16A",
          "Bank Statements",
          "Investment Proofs",
          "Previous Year ITR"
        ]
      },
      {
        id: "itr-filing-business",
        name: "ITR Filing for Business",
        price: "\u20B92,999",
        originalPrice: "\u20B94,999",
        duration: "3-5 business days",
        description: "Complete ITR filing for businesses with balance sheet and P&L",
        category: "tax-services",
        features: [
          "Balance Sheet Preparation",
          "P&L Statement",
          "Tax Optimization",
          "Audit Support",
          "Compliance Review"
        ],
        documents: [
          "Books of Accounts",
          "Balance Sheet",
          "P&L Statement", 
          "Bank Statements",
          "Purchase/Sale Bills",
          "TDS Certificates"
        ]
      },
      {
        id: "tds-return-filing",
        name: "TDS Return Filing",
        price: "\u20B91,499",
        duration: "2-3 business days",
        description: "TDS return filing for all quarters with form correction",
        category: "tax-services",
        features: [
          "Quarterly TDS Filing",
          "Form 24Q/26Q/27Q",
          "TDS Correction",
          "Penalty Waiver Support",
          "Certificate Download"
        ],
        documents: [
          "Salary Register",
          "TDS Deducted Details",
          "Challan Details",
          "Employee PAN Details",
          "Previous Returns"
        ]
      }
    ]
  },
  {
    id: "gst-services", 
    name: "GST Services",
    description: "Complete GST registration, filing and compliance solutions",
    icon: "FileText",
    color: "green",
    services: [
      {
        id: "gst-registration",
        name: "GST Registration",
        price: "\u20B91,999",
        originalPrice: "\u20B92,999",
        duration: "7-10 business days",
        description: "Complete GST registration for new businesses and proprietorships",
        category: "gst-services",
        popular: true,
        features: [
          "Complete Documentation",
          "GSTIN Certificate",
          "HSN Code Mapping",
          "Compliance Calendar",
          "First Return Free"
        ],
        documents: [
          "PAN Card",
          "Aadhaar Card",
          "Business Address Proof",
          "Bank Account Details",
          "MOA/AOA (for companies)",
          "Partnership Deed (if applicable)"
        ]
      },
      {
        id: "gst-return-filing",
        name: "Monthly GST Return Filing",
        price: "\u20B9799",
        duration: "Same day filing",
        description: "Complete monthly GST return filing (GSTR-1, GSTR-3B)",
        category: "gst-services",
        features: [
          "GSTR-1 & GSTR-3B",
          "Input Tax Credit",
          "Tax Liability Calculation", 
          "Late Fee Minimization",
          "Compliance Reports"
        ],
        documents: [
          "Sales Invoices",
          "Purchase Invoices",
          "Credit Notes",
          "Debit Notes",
          "Export/Import Documents",
          "Previous GSTR-3B"
        ]
      },
      {
        id: "gst-annual-return",
        name: "GST Annual Return (GSTR-9)",
        price: "\u20B92,499",
        duration: "5-7 business days", 
        description: "Annual GST return filing with reconciliation and compliance check",
        category: "gst-services",
        features: [
          "Complete GSTR-9 Filing",
          "Book-Return Reconciliation",
          "Liability Reconciliation",
          "Audit Trail Report",
          "Compliance Certificate"
        ],
        documents: [
          "All Monthly Returns",
          "Books of Accounts",
          "Annual Financial Statements",
          "ITC Ledger",
          "Tax Payment Challans"
        ]
      }
    ]
  },
  {
    id: "company-services",
    name: "Company Services", 
    description: "Company incorporation, compliance and legal services",
    icon: "Building2",
    color: "purple",
    services: [
      {
        id: "company-incorporation",
        name: "Private Limited Company",
        price: "\u20B96,999",
        originalPrice: "\u20B912,999",
        duration: "15-20 business days",
        description: "Complete private limited company incorporation with digital signature",
        category: "company-services",
        popular: true,
        features: [
          "Name Reservation",
          "Digital Signature Certificate", 
          "Director Identification Number",
          "Certificate of Incorporation",
          "PAN & TAN Application",
          "Bank Account Opening Support"
        ],
        documents: [
          "Director's PAN & Aadhaar",
          "Address Proof of Directors",
          "Registered Office Proof",
          "MOA & AOA Draft",
          "No Objection Certificate",
          "Passport Size Photos"
        ]
      },
      {
        id: "llp-incorporation",
        name: "LLP Incorporation", 
        price: "\u20B94,999",
        originalPrice: "\u20B98,999",
        duration: "12-15 business days",
        description: "Limited Liability Partnership registration with compliance setup",
        category: "company-services",
        features: [
          "LLP Name Reservation",
          "DPIN for Partners",
          "LLP Agreement Drafting",
          "Certificate of Incorporation",
          "PAN Application",
          "Bank Account Assistance"
        ],
        documents: [
          "Partners' PAN & Aadhaar", 
          "Address Proof of Partners",
          "Registered Office Documents",
          "LLP Agreement",
          "Consent Letters",
          "ID & Address Proof"
        ]
      },
      {
        id: "proprietorship-registration",
        name: "Proprietorship Registration",
        price: "\u20B92,499",
        duration: "5-7 business days",
        description: "Complete proprietorship registration with trade license",
        category: "company-services", 
        features: [
          "Trade License",
          "Shop & Establishment License",
          "Current Account Opening",
          "MSME Registration",
          "Legal Documentation"
        ],
        documents: [
          "Proprietor's PAN & Aadhaar",
          "Address Proof",
          "Business Address Proof", 
          "Identity Proof",
          "No Objection Certificate"
        ]
      }
    ]
  },
  {
    id: "trademark-services",
    name: "Trademark & Legal",
    description: "Trademark registration and intellectual property services", 
    icon: "Shield",
    color: "red",
    services: [
      {
        id: "trademark-registration",
        name: "Trademark Registration",
        price: "\u20B94,999",
        originalPrice: "\u20B97,999", 
        duration: "12-18 months",
        description: "Complete trademark registration with search and filing",
        category: "trademark-services",
        popular: true,
        features: [
          "Trademark Search Report",
          "Class Identification",
          "Government Filing",
          "Response to Objections",
          "Registration Certificate",
          "10-Year Validity"
        ],
        documents: [
          "Trademark Logo/Text",
          "Applicant Identity Proof",
          "Business Registration Proof",
          "Power of Attorney",
          "User Affidavit"
        ]
      },
      {
        id: "copyright-registration",
        name: "Copyright Registration",
        price: "\u20B92,999",
        duration: "4-6 months",
        description: "Copyright registration for creative works and software",
        category: "trademark-services",
        features: [
          "Copyright Search",
          "Application Filing", 
          "Government Processing",
          "Registration Certificate",
          "Legal Protection",
          "Lifetime Validity"
        ],
        documents: [
          "Original Work Copy",
          "Author Identity Proof",
          "Statement of Further Particulars",
          "Power of Attorney",
          "No Objection Certificate"
        ]
      }
    ]
  },
  {
    id: "compliance-services",
    name: "Compliance Services",
    description: "Annual compliance and regulatory filing services",
    icon: "Settings", 
    color: "orange",
    services: [
      {
        id: "roc-annual-filing",
        name: "ROC Annual Filing",
        price: "\u20B93,499",
        duration: "7-10 business days",
        description: "Annual ROC compliance filing (AOC-4, MGT-7) for companies",
        category: "compliance-services",
        features: [
          "AOC-4 Filing",
          "MGT-7 Filing", 
          "Board Resolution",
          "Compliance Certificate",
          "Penalty Waiver Support"
        ],
        documents: [
          "Audited Financial Statements",
          "Board Resolutions",
          "AGM Minutes",
          "Directors' Details",
          "Share Transfer Register"
        ]
      },
      {
        id: "pf-esi-registration",
        name: "PF & ESI Registration",
        price: "\u20B92,999",
        duration: "10-15 business days", 
        description: "Employee Provident Fund and ESI registration for companies",
        category: "compliance-services",
        features: [
          "PF Registration",
          "ESI Registration",
          "Employee Enrollment",
          "Monthly Return Setup",
          "Compliance Calendar"
        ],
        documents: [
          "Company Incorporation Certificate",
          "PAN & TAN",
          "Employee Details & Salary",
          "Bank Account Details", 
          "Registered Office Proof"
        ]
      }
    ]
  },
  {
    id: "accounting-services",
    name: "Accounting Services",
    description: "Bookkeeping, accounting and financial statement services",
    icon: "Heart",
    color: "teal",
    services: [
      {
        id: "bookkeeping-monthly",
        name: "Monthly Bookkeeping",
        price: "\u20B92,999",
        duration: "Monthly service",
        description: "Complete monthly bookkeeping and financial reporting",
        category: "accounting-services",
        popular: true,
        features: [
          "Daily Transaction Recording",
          "Bank Reconciliation",
          "Monthly Financial Reports",
          "Expense Tracking",
          "GST Ready Books",
          "Tax Planning Advice"
        ],
        documents: [
          "Bank Statements",
          "Bills & Invoices",
          "Receipt Vouchers",
          "Payment Vouchers",
          "Petty Cash Records"
        ]
      },
      {
        id: "financial-audit",
        name: "Financial Statement Audit",
        price: "\u20B915,999",
        duration: "15-20 business days",
        description: "Statutory audit of financial statements by qualified CA",
        category: "accounting-services",
        features: [
          "Complete Financial Audit",
          "Audit Report", 
          "Management Letter",
          "Compliance Check",
          "Board Presentation",
          "Tax Audit (if applicable)"
        ],
        documents: [
          "Trial Balance",
          "Books of Accounts", 
          "Bank Statements",
          "Fixed Asset Register",
          "Loan Documents",
          "Investment Details"
        ]
      }
    ]
  }
];

// Helper functions
export const getAllServices = (): Service[] => {
  return servicesData.flatMap(category => category.services);
};

export const getServicesByCategory = (categoryId: string): Service[] => {
  const category = servicesData.find(cat => cat.id === categoryId);
  return category ? category.services : [];
};

export const searchServices = (query: string): Service[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllServices().filter(service => 
    service.name.toLowerCase().includes(lowercaseQuery) ||
    service.description.toLowerCase().includes(lowercaseQuery) ||
    service.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
  );
};

export const getPopularServices = (): Service[] => {
  return getAllServices().filter(service => service.popular);
};

export const getCategoryByColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800", 
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    red: "bg-red-50 border-red-200 text-red-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800"
  };
  return colorMap[color] || "bg-gray-50 border-gray-200 text-gray-800";
};

// Service Category Testimonials
export interface ServiceTestimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  serviceType: string;
  avatar?: string;
}

export const serviceTestimonials: ServiceTestimonial[] = [
  // Income Tax Services Testimonials
  {
    id: "1",
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra", 
    rating: 5,
    comment: "MyeCA.in made my ITR filing so simple! Their expert CA guidance saved me \u20B915,000 in taxes through proper deductions. Highly professional service.",
    serviceType: "income-tax"
  },
  {
    id: "2", 
    name: "Priya Sharma",
    location: "Delhi, NCR",
    rating: 5,
    comment: "Outstanding service for individual tax filing. They handled everything from form selection to e-filing. Got my refund in just 3 weeks!",
    serviceType: "income-tax"
  },
  {
    id: "3",
    name: "Amit Patel", 
    location: "Ahmedabad, Gujarat",
    rating: 5,
    comment: "Best CA service in India! They helped me with complex capital gains calculation and saved thousands. Very knowledgeable team.",
    serviceType: "income-tax"
  },
  
  // Labour Law Services Testimonials
  {
    id: "4",
    name: "Deepak Industries",
    location: "Pune, Maharashtra",
    rating: 5, 
    comment: "Excellent PF and ESI registration service. They completed everything within 10 days and provided ongoing compliance support. Very reliable!",
    serviceType: "labour-law"
  },
  {
    id: "5",
    name: "Sunita Manufacturing",
    location: "Chennai, Tamil Nadu", 
    rating: 5,
    comment: "MyeCA.in handled our complete labor compliance setup. From PF registration to monthly returns, everything was managed professionally.",
    serviceType: "labour-law"
  },
  {
    id: "6",
    name: "Vikram Enterprises", 
    location: "Bangalore, Karnataka",
    rating: 5,
    comment: "Great service for ESI and PF compliance. They saved us from penalties and ensured all employee benefits were properly setup.",
    serviceType: "labour-law"
  },

  // Company Services Testimonials  
  {
    id: "7",
    name: "TechStart Solutions",
    location: "Hyderabad, Telangana",
    rating: 5,
    comment: "Amazing company registration service! Got our Private Limited Company incorporated in just 7 days. All documentation was perfect.",
    serviceType: "company-services"
  },
  {
    id: "8",
    name: "GreenTech Pvt Ltd",
    location: "Kolkata, West Bengal", 
    rating: 5,
    comment: "Complete business setup service from company registration to GST registration. MyeCA.in is a one-stop solution for all business needs.",
    serviceType: "company-services"
  },
  {
    id: "9",
    name: "RetailMax India",
    location: "Jaipur, Rajasthan",
    rating: 5,
    comment: "Excellent GST registration and monthly return filing service. Their accounting team keeps our books perfectly maintained. Highly recommended!",
    serviceType: "company-services"
  }
];

// Get testimonials by service type
export const getTestimonialsByType = (serviceType: string): ServiceTestimonial[] => {
  return serviceTestimonials.filter(testimonial => testimonial.serviceType === serviceType);
};

// Testimonials organized by category for the services page
export const testimonialsByCategory = {
  "income-tax": getTestimonialsByType("income-tax"),
  "labour-law": getTestimonialsByType("labour-law"), 
  "company-services": getTestimonialsByType("company-services")
};

// Grouped services for the new layout
export const groupedServices = {
  "income-tax": {
    title: "Income Tax Services",
    description: "Expert CA assistance for individual and business tax filing with maximum refund optimization",
    services: getServicesByCategory("tax-services")
  },
  "labour-law": {
    title: "Labour Law & Compliance",
    description: "Complete employee compliance solutions including PF, ESI registration and ongoing support", 
    services: getServicesByCategory("compliance-services")
  },
  "company-services": {
    title: "Company Services",
    description: "End-to-end business solutions from company registration to accounting and GST compliance",
    services: [
      ...getServicesByCategory("company-services"),
      ...getServicesByCategory("gst-services"), 
      ...getServicesByCategory("accounting-services")
    ]
  }
};