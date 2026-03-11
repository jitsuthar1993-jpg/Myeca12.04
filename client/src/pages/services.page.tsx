import React, { useState } from 'react';
import { Link } from "wouter";
import { motion } from 'framer-motion';
import SEO from "@/components/SEO";
import Breadcrumb from "@/components/Breadcrumb";
import StructuredData from "@/components/StructuredData";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useServiceTracking } from '@/hooks/useAnalytics';
import { 
  Calculator, 
  FileText, 
  Building, 
  Shield, 
  Award, 
  CheckCircle, 
  Clock, 
  Star,
  Users,
  ArrowRight,
  Phone,
  MessageCircle,
  Info,
  X,
  Download,
  FileCheck,
  CreditCard,
  Globe,
  ShoppingBag,
  Briefcase,
  Home,
  Car,
  Landmark,
  Receipt,
  BookOpen,
  Scale,
  TrendingUp,
  MapPin,
  Zap,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Enhanced service data structure with documents
const serviceCategories = [
  {
    id: 'tax-gst',
    title: 'Tax & GST Services',
    icon: Calculator,
    description: 'Complete tax compliance and GST solutions',
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    services: [
      {
        id: 'gst-registration',
        title: 'GST Registration',
        price: '\u20B92,999',
        originalPrice: '\u20B94,999',
        tat: '3-5 Days',
        description: 'Complete GST registration with expert guidance and compliance support',
        features: ['Expert Consultation', 'Document Verification', 'Fast Processing', '24/7 Support'],
        popular: true,
        rating: 4.8,
        reviews: 1250,
        documents: [
          'PAN Card of Business/Proprietor',
          'Aadhaar Card of Proprietor/Authorized Signatory', 
          'Business Registration Certificate',
          'Bank Account Statement (Latest 3 months)',
          'Passport Size Photograph',
          'Digital Signature Certificate (if company)',
          'Electricity Bill of Business Premises',
          'Rent Agreement/Property Documents'
        ]
      },
      {
        id: 'itr-filing',
        title: 'ITR Filing (Salaried)',
        price: '\u20B9499',
        originalPrice: '\u20B9999',
        tat: '24 Hours',
        description: 'Quick and accurate income tax return filing for salaried professionals',
        features: ['Form 16 Upload', 'Auto Calculations', 'E-Verification', 'Refund Tracking'],
        popular: true,
        rating: 4.9,
        reviews: 3400,
        documents: [
          'Form 16 from Employer',
          'Form 26AS',
          'Bank Statements',
          'Interest Certificates',
          'Investment Proofs (80C, 80D, etc.)',
          'Home Loan Interest Certificate',
          'Rent Receipts (for HRA)',
          'Previous Year ITR (if applicable)'
        ]
      },
      {
        id: 'gst-filing',
        title: 'GST Returns Filing',
        price: '\u20B9590',
        originalPrice: '\u20B9999',
        tat: '48 Hours',
        description: 'Monthly/Quarterly GST return filing with accuracy guarantee (Up to 50 bills)',
        features: ['GSTR-1/3B Filing', 'Input Credit Reconciliation', 'Compliance Check', 'Expert Review'],
        rating: 4.7,
        reviews: 890,
        documents: [
          'Purchase Invoices',
          'Sales Invoices', 
          'E-way Bills',
          'Bank Statements',
          'Cash/Credit Notes',
          'Import/Export Documents',
          'Previous GST Returns',
          'ITC Reversal Documents'
        ],
        hasDetailedPage: true,
        detailedPagePath: '/services/gst-returns'
      },
      {
        id: 'tds-filing',
        title: 'TDS Filing Service',
        price: '\u20B9999',
        originalPrice: '\u20B91,499',
        tat: '24 Hours',
        description: 'Complete TDS/TCS return filing with current FY 2024-25 requirements',
        features: ['24Q/26Q/27Q/27EQ Filing', 'TDS Certificate Generation', 'Compliance Check', 'Expert Review'],
        rating: 4.8,
        reviews: 1250,
        documents: [
          'TDS Deduction Details',
          'Form 16/16A', 
          'Challan Details',
          'Bank Statements',
          'Previous TDS Returns',
          'Employee/Vendor Details'
        ],
        hasDetailedPage: true,
        detailedPagePath: '/services/tds-filing'
      },
      {
        id: 'gst-nil-filing',
        title: 'GST Nil Returns Filing',
        price: '\u20B9590',
        originalPrice: '\u20B9999',
        tat: '48 Hours',
        description: 'Nil GST return filing for businesses with no transactions',
        features: ['GSTR-1 Nil Filing', 'GSTR-3B Nil Filing', 'Compliance Support', 'Quick Processing'],
        popular: true,
        rating: 4.8,
        reviews: 1234,
        documents: [
          'GST Registration Certificate',
          'Previous Returns',
          'Business Registration',
          'Bank Account Details'
        ]
      },
      {
        id: 'notice-compliance',
        title: 'Income Tax Notice Handling',
        price: '\u20B91,999',
        originalPrice: '\u20B92,999',
        tat: '24 Hours',
        description: 'Expert assistance for all types of income tax notices with 95% success rate',
        features: ['24-Hour Response', 'Expert CA Team', 'Comprehensive Response', 'Follow-up Support'],
        popular: true,
        urgent: true,
        rating: 4.9,
        reviews: 856,
        documents: [
          'Notice Copy from IT Department',
          'PAN Card',
          'Aadhaar Card',
          'Previous ITR Returns',
          'Supporting Documents',
          'Bank Statements',
          'Investment Proofs',
          'Form 26AS'
        ]
      },
      {
        id: 'itr-1-with-bs',
        title: 'ITR-1 Filing (With Balance Sheet)',
        price: '\u20B9588',
        originalPrice: '\u20B9999',
        tat: '24 Hours',
        description: 'ITR-1 filing for salaried individuals with balance sheet preparation',
        features: ['CA Certified Balance Sheet', 'Form 16 Processing', 'Tax Optimization', 'E-Verification'],
        rating: 4.9,
        reviews: 2340,
        documents: [
          'Form 16',
          'Salary Slips',
          'Bank Statements',
          'Investment Proofs',
          'Previous Year ITR',
          'Form 26AS'
        ]
      },
      {
        id: 'itr-2-with-bs',
        title: 'ITR-2 Filing (With Balance Sheet)',
        price: '\u20B9825',
        originalPrice: '\u20B91,299',
        tat: '24 Hours',
        description: 'ITR-2 filing for individuals with capital gains and balance sheet',
        features: ['Capital Gains Calculation', 'Balance Sheet', 'Multiple Income Sources', 'Tax Planning'],
        rating: 4.8,
        reviews: 1567,
        documents: [
          'Capital Gains Statements',
          'Share Transaction Details',
          'Property Sale Documents',
          'Bank Statements',
          'Investment Proofs'
        ]
      },
      {
        id: 'itr-3-with-bs',
        title: 'ITR-3 Filing (With Balance Sheet)',
        price: '\u20B9825',
        originalPrice: '\u20B91,299',
        tat: '24 Hours',
        description: 'ITR-3 filing for business income with balance sheet preparation',
        features: ['Business Income', 'Balance Sheet & P&L', 'Depreciation Calculation', 'Tax Audit Support'],
        rating: 4.7,
        reviews: 890,
        documents: [
          'Books of Accounts',
          'Trading Account',
          'Profit & Loss Statement',
          'Balance Sheet',
          'Cash Flow Statement'
        ]
      },
      {
        id: 'firm-itr',
        title: 'Partnership Firm ITR',
        price: '\u20B92,360',
        originalPrice: '\u20B93,999',
        tat: '3 Working Days',
        description: 'Income tax return filing for partnership firms with complete documentation',
        features: ['Firm ITR Filing', 'Partner Schedule', 'Book Profit Calculation', 'Tax Audit'],
        rating: 4.6,
        reviews: 456,
        documents: [
          'Partnership Deed',
          'Books of Accounts',
          'Partners PAN Cards',
          'Capital Account',
          'Profit Distribution'
        ]
      }
    ]
  },
  {
    id: 'business-incorporation',
    title: 'Business Incorporation',
    icon: Building,
    description: 'Start your business with proper legal structure',
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    services: [
      {
        id: 'pvt-ltd',
        title: 'Private Limited Company',
        price: '\u20B98,999',
        originalPrice: '\u20B915,999',
        tat: '15-20 Days',
        description: 'Complete company incorporation with digital signature and compliance',
        features: ['Name Approval', 'DIN & DSC', 'MOA & AOA', 'Certificate of Incorporation'],
        popular: true,
        rating: 4.8,
        reviews: 2100,
        documents: [
          'PAN Card of All Directors',
          'Aadhaar Card of All Directors',
          'Passport Size Photos',
          'Address Proof of Directors',
          'Registered Office Address Proof',
          'Electricity Bill of Registered Office',
          'No Objection Certificate from Property Owner',
          'Bank Statement of Directors'
        ],
        hasDetailedPage: true,
        detailedPagePath: '/services/company-incorporation'
      },
      {
        id: 'llp-reg',
        title: 'LLP Registration',
        price: '\u20B92,124',
        originalPrice: '\u20B93,499',
        tat: '4 Working Days',
        description: 'Limited Liability Partnership registration with complete documentation',
        features: ['Name Reservation', 'LLP Agreement', 'Certificate', 'DPIN'],
        rating: 4.7,
        reviews: 890,
        documents: [
          'PAN Card of All Partners',
          'Aadhaar Card of All Partners',
          'Address Proof of Partners',
          'Passport Size Photos',
          'Registered Office Proof',
          'Rent Agreement/NOC',
          'Bank Statement of Partners'
        ]
      },
      {
        id: 'proprietorship-reg',
        title: 'Proprietorship Registration',
        price: '\u20B91,770',
        originalPrice: '\u20B92,999',
        tat: '2 Working Days',
        description: 'Complete proprietorship business registration with trade license',
        features: ['Business Registration', 'Trade License', 'MSME Support', 'Bank Account Opening'],
        popular: true,
        rating: 4.8,
        reviews: 1234,
        documents: [
          'Proprietor PAN Card',
          'Aadhaar Card',
          'Address Proof',
          'Business Address Proof',
          'Passport Size Photos',
          'Bank Account Details'
        ]
      },
      {
        id: 'partnership-reg',
        title: 'Partnership Registration',
        price: '\u20B92,950',
        originalPrice: '\u20B94,999',
        tat: '4 Working Days',
        description: 'Partnership firm registration with partnership deed and compliance',
        features: ['Partnership Deed', 'Registration Certificate', 'PAN Application', 'Bank Account Support'],
        rating: 4.6,
        reviews: 678,
        documents: [
          'Partners PAN Cards',
          'Aadhaar Cards of Partners',
          'Address Proof of Partners',
          'Business Address Proof',
          'Partnership Agreement Draft',
          'Capital Contribution Details'
        ]
      },
      {
        id: 'section-8-company',
        title: 'Section 8 Company (NGO)',
        price: '\u20B94,720',
        originalPrice: '\u20B97,999',
        tat: '4 Working Days',
        description: 'Non-profit company registration under Section 8 of Companies Act',
        features: ['Section 8 License', 'Certificate of Incorporation', '12A & 80G Support', 'Compliance Guide'],
        rating: 4.5,
        reviews: 234,
        documents: [
          'Memorandum & Articles',
          'Directors Details & Documents',
          'Registered Office Proof',
          'Object Clause',
          'Board Resolution',
          'No Profit Distribution Declaration'
        ]
      },
      {
        id: 'name-reservation',
        title: 'Company Name Reservation',
        price: '\u20B91,770',
        originalPrice: '\u20B92,499',
        tat: '48 Hours',
        description: 'Reserve your preferred company name with ROC approval',
        features: ['Name Availability Check', 'ROC Application', 'Name Approval Certificate', 'Validity Extension'],
        rating: 4.7,
        reviews: 890,
        documents: [
          'Proposed Company Names (6 Options)',
          'Business Activity Details',
          'Promoter Details',
          'Registered Office State'
        ]
      }
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    icon: Shield,
    description: 'Protect your brand and innovations',
    color: 'from-teal-600 to-teal-700',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    services: [
      {
        id: 'trademark-reg',
        title: 'Trademark Registration',
        price: '\u20B96,999',
        originalPrice: '\u20B912,999',
        tat: '12-18 Months',
        description: 'Complete trademark registration with search and filing',
        features: ['Trademark Search', 'Application Filing', 'Response to Objections', 'Registration Certificate'],
        popular: true,
        rating: 4.8,
        reviews: 1890,
        documents: [
          'Trademark Logo/Wordmark',
          'Applicant ID Proof',
          'Address Proof',
          'Business Registration Certificate',
          'Power of Attorney',
          'User Affidavit (if applicable)',
          'Priority Document (if claiming priority)'
        ],
        hasDetailedPage: true,
        detailedPagePath: '/services/trademark-registration'
      },
      {
        id: 'copyright-reg',
        title: 'Copyright Registration',
        price: '\u20B93,999',
        originalPrice: '\u20B97,999',
        tat: '30-45 Days',
        description: 'Protect your creative works with copyright registration',
        features: ['Application Drafting', 'Filing & Tracking', 'Certificate', 'Legal Protection'],
        rating: 4.7,
        reviews: 567,
        documents: [
          'Original Work/Creation',
          'Author ID Proof',
          'Address Proof',
          'Power of Attorney',
          'Publication Details (if published)',
          'NOC from Publisher (if applicable)'
        ]
      }
    ]
  },
  {
    id: 'licenses-compliance',
    title: 'Licenses & Compliance',
    icon: Award,
    description: 'Obtain necessary business licenses and maintain compliance',
    color: 'from-orange-600 to-orange-700',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    services: [
      {
        id: 'fssai-basic',
        title: 'FSSAI Basic License',
        price: '\u20B9590',
        originalPrice: '\u20B9999',
        tat: '48 Hours',
        description: 'Basic food safety license for small food businesses (One Year)',
        features: ['One Year Validity', 'Document Verification', 'Fast Processing', 'Digital Certificate'],
        popular: true,
        rating: 4.8,
        reviews: 890,
        documents: [
          'Form B (Application Form)',
          'ID Proof of Applicant',
          'Address Proof of Business',
          'NOC from Municipal Corporation',
          'Layout Plan of Premises',
          'List of Food Categories'
        ]
      },
      {
        id: 'fssai-state',
        title: 'FSSAI State License',
        price: '\u20B91,180',
        originalPrice: '\u20B91,999',
        tat: '3 Working Days',
        description: 'State level FSSAI license for manufacturing and trading businesses',
        features: ['State Level License', 'Manufacturing Permission', 'Trading Permission', 'Expert Support'],
        rating: 4.7,
        reviews: 567,
        documents: [
          'Form B (Application Form)',
          'Manufacturing License',
          'Water Test Report',
          'Medical Certificate',
          'Layout Plan of Premises',
          'NOC from Pollution Control Board'
        ]
      },
      {
        id: 'fssai-central',
        title: 'FSSAI Central License',
        price: '\u20B92,950',
        originalPrice: '\u20B94,999',
        tat: '3 Working Days',
        description: 'Central FSSAI license for large scale food businesses and importers',
        features: ['Central Level License', 'Import/Export Permission', 'Multi-state Operations', 'Premium Support'],
        rating: 4.6,
        reviews: 234,
        documents: [
          'Form B (Application Form)',
          'Import/Export License',
          'Central Excise Registration',
          'Water Analysis Report',
          'Food Analysis Report',
          'NOC from Central Authorities'
        ]
      },
      {
        id: 'trade-license',
        title: 'Trade License',
        price: '\u20B91,180',
        originalPrice: '\u20B91,999',
        tat: '48 Hours',
        description: 'Municipal trade license for business operations',
        features: ['Municipal Approval', 'Business Legalization', 'Renewal Support', 'Expert Guidance'],
        rating: 4.6,
        reviews: 445,
        documents: [
          'Trade License Application',
          'Property Documents',
          'NOC from Property Owner',
          'ID Proof of Applicant',
          'Partnership Deed/MOA',
          'Fire Safety Certificate'
        ]
      },
      {
        id: 'shop-act',
        title: 'Shop & Establishment License',
        price: '\u20B92,360',
        originalPrice: '\u20B93,999',
        tat: '3 Working Days',
        description: 'Mandatory license for all commercial establishments',
        features: ['Legal Recognition', 'Employee Protection', 'Compliance Certificate', 'Renewal Reminder'],
        rating: 4.7,
        reviews: 678,
        documents: [
          'Application Form',
          'Property Documents',
          'Rent Agreement/NOC',
          'Partnership Deed/MOA',
          'Employee Details',
          'ID & Address Proof'
        ]
      },
      {
        id: 'msme-registration',
        title: 'MSME Registration',
        price: '\u20B9590',
        originalPrice: '\u20B9999',
        tat: '24 Hours',
        description: 'Udyam registration for Micro, Small & Medium Enterprises',
        features: ['Udyam Certificate', 'Government Benefits', 'Loan Eligibility', 'Subsidy Access'],
        popular: true,
        rating: 4.9,
        reviews: 1234,
        documents: [
          'Aadhaar Card of Proprietor',
          'PAN Card',
          'Business Registration Certificate',
          'Investment Details',
          'Bank Statement'
        ]
      },
      {
        id: 'iec-registration',
        title: 'Import Export Code (IEC)',
        price: '\u20B91,416',
        originalPrice: '\u20B92,499',
        tat: '24 Hours',
        description: 'Essential code for import/export business activities',
        features: ['10-Digit IEC Code', 'DGFT Registration', 'Export Benefits', 'Import Facility'],
        rating: 4.7,
        reviews: 567,
        documents: [
          'ANF 2A Application Form',
          'PAN Card',
          'Bank Certificate',
          'CA Certificate',
          'Cancelled Cheque'
        ]
      },
      {
        id: 'startup-india',
        title: 'Startup India Certificate',
        price: '\u20B93,186',
        originalPrice: '\u20B94,999',
        tat: '3 Working Days',
        description: 'Official recognition as a startup with government benefits',
        features: ['DIPP Recognition', 'Tax Benefits', 'IPR Support', 'Funding Access'],
        rating: 4.8,
        reviews: 345,
        documents: [
          'Certificate of Incorporation',
          'Business Plan',
          'Funding Details',
          'Innovation Description',
          'Audited Financials'
        ]
      }
    ]
  },
  {
    id: 'iso-quality',
    title: 'ISO Certification & Quality',
    icon: Award,
    description: 'International quality certifications and compliance',
    color: 'from-purple-600 to-purple-700',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    services: [
      {
        id: 'iso-certification',
        title: 'ISO Certification Services',
        price: '\u20B925,000',
        originalPrice: '\u20B950,000',
        tat: '3-6 Months',
        description: 'Complete ISO 9001, 14001, 45001, 27001 certification with documentation',
        features: ['Gap Analysis', 'Documentation Support', 'Implementation Guidance', 'Audit Support'],
        popular: true,
        rating: 4.9,
        reviews: 856,
        documents: [
          'Company Registration Certificate',
          'Business License',
          'Quality Manual',
          'Process Documentation',
          'Organizational Chart',
          'Previous Audit Reports'
        ],
        hasDetailedPage: true,
        detailedPagePath: '/services/iso-certification'
      }
    ]
  },
  {
    id: 'labour-compliance',
    title: 'Labour Law Compliance',
    icon: Users,
    description: 'Complete PF, ESI, Contract Labour Act compliance',
    color: 'from-orange-600 to-red-600',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    services: [
      {
        id: 'labour-law-compliance',
        title: 'Labour Law Compliance',
        price: '\u20B92,999',
        originalPrice: '\u20B94,999',
        tat: 'Monthly',
        description: 'Complete PF, ESI, Contract Labour Act, and Factory Act compliance with 2025 updates',
        features: ['PF/ESI Management', 'Forms A-D Compliance', 'Digital Platform Integration', 'Zero Penalty Guarantee'],
        popular: true,
        rating: 4.8,
        reviews: 1234,
        documents: [
          'Employee Database',
          'Attendance Records',
          'Wage Registers',
          'Previous Compliance Reports',
          'Employment Contracts',
          'Factory/Office License'
        ],
        hasDetailedPage: true,
        detailedPagePath: '/services/labour-law-compliance'
      }
    ]
  },
  {
    id: 'annual-compliance',
    title: 'Annual Compliance',
    icon: FileCheck,
    description: 'Complete annual filing and compliance management',
    color: 'from-teal-700 to-teal-800',
    textColor: 'text-teal-800',
    bgColor: 'bg-teal-50',
    services: [
      {
        id: 'aoc-04',
        title: 'AOC-04 Filing',
        price: '\u20B91,770',
        originalPrice: '\u20B92,999',
        tat: '3 Working Days',
        description: 'Annual filing of financial statements with ROC',
        features: ['Balance Sheet Filing', 'P&L Statement', 'ROC Compliance', 'Penalty Avoidance'],
        popular: true,
        rating: 4.8,
        reviews: 567,
        documents: [
          'Audited Financial Statements',
          'Balance Sheet',
          'Profit & Loss Statement',
          'Directors Report',
          'Auditors Report'
        ]
      },
      {
        id: 'mgt-07',
        title: 'MGT-07 Filing',
        price: '\u20B91,770',
        originalPrice: '\u20B92,999',
        tat: '3 Working Days',
        description: 'Annual return filing for companies',
        features: ['Annual Return', 'Shareholding Details', 'ROC Filing', 'Compliance Certificate'],
        rating: 4.7,
        reviews: 445,
        documents: [
          'Share Capital Details',
          'Member Register',
          'Director Details',
          'Audited Financials',
          'Board Resolutions'
        ]
      },
      {
        id: 'dir-03-kyc',
        title: 'DIR-03 KYC',
        price: '\u20B91,180',
        originalPrice: '\u20B91,999',
        tat: '3 Working Days',
        description: 'Annual KYC filing for company directors',
        features: ['Director KYC', 'Compliance Update', 'Penalty Avoidance', 'Digital Filing'],
        rating: 4.6,
        reviews: 789,
        documents: [
          'Director PAN Card',
          'Aadhaar Card',
          'Address Proof',
          'Passport Size Photo',
          'Mobile Number'
        ]
      },
      {
        id: 'llp-form-8',
        title: 'LLP Form-8 Filing',
        price: '\u20B93,540',
        originalPrice: '\u20B94,999',
        tat: '48 Hours',
        description: 'Annual statement of accounts and solvency for LLP',
        features: ['Account Statement', 'Solvency Certificate', 'ROC Filing', 'Compliance Support'],
        rating: 4.7,
        reviews: 234,
        documents: [
          'Statement of Accounts',
          'Solvency Statement',
          'Partners Details',
          'Audited Financials',
          'LLP Agreement'
        ]
      },
      {
        id: 'llp-form-11',
        title: 'LLP Form-11 Filing',
        price: '\u20B93,540',
        originalPrice: '\u20B94,999',
        tat: '48 Hours',
        description: 'Annual return filing for Limited Liability Partnership',
        features: ['Annual Return', 'Partner Details', 'ROC Compliance', 'Expert Support'],
        rating: 4.6,
        reviews: 156,
        documents: [
          'LLP Agreement',
          'Partners Information',
          'Contribution Details',
          'Annual Accounts',
          'Designated Partner Details'
        ]
      }
    ]
  },
  {
    id: 'iso-certifications',
    title: 'ISO Certifications',
    icon: Award,
    description: 'International standard certifications for business excellence',
    color: 'from-orange-700 to-orange-800',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-50',
    services: [
      {
        id: 'iso-9001',
        title: 'ISO 9001:2015 (IAF)',
        price: '\u20B95,900',
        originalPrice: '\u20B99,999',
        tat: '10 Working Days',
        description: 'Quality Management System certification with international accreditation',
        features: ['IAF Accredited', 'Quality Management', 'International Recognition', 'Audit Support'],
        popular: true,
        rating: 4.8,
        reviews: 345,
        documents: [
          'Company Registration',
          'Quality Manual',
          'Process Documentation',
          'Organization Chart',
          'Product/Service Details'
        ]
      },
      {
        id: 'iso-45001',
        title: 'ISO 45001:2018 (IAF)',
        price: '\u20B98,260',
        originalPrice: '\u20B912,999',
        tat: '10 Working Days',
        description: 'Occupational Health & Safety Management System certification',
        features: ['Safety Management', 'Worker Protection', 'Risk Assessment', 'Compliance Certificate'],
        rating: 4.7,
        reviews: 234,
        documents: [
          'Safety Policy',
          'Risk Assessment',
          'Safety Procedures',
          'Training Records',
          'Incident Reports'
        ]
      },
      {
        id: 'iso-14001',
        title: 'ISO 14001:2015 (IAF)',
        price: '\u20B96,490',
        originalPrice: '\u20B99,999',
        tat: '10 Working Days',
        description: 'Environmental Management System certification',
        features: ['Environmental Management', 'Sustainability', 'Compliance Support', 'Green Certification'],
        rating: 4.6,
        reviews: 189,
        documents: [
          'Environmental Policy',
          'Environmental Aspects',
          'Legal Compliance',
          'Monitoring Records',
          'Improvement Plans'
        ]
      },
      {
        id: 'iso-27001',
        title: 'ISO 27001:2022 (IAF)',
        price: '\u20B95,900',
        originalPrice: '\u20B98,999',
        tat: '10 Working Days',
        description: 'Information Security Management System certification',
        features: ['Data Security', 'Cyber Protection', 'Risk Management', 'Compliance Assurance'],
        rating: 4.8,
        reviews: 267,
        documents: [
          'Security Policy',
          'Risk Assessment',
          'Security Controls',
          'Asset Register',
          'Incident Response Plan'
        ]
      }
    ]
  },
  {
    id: 'specialized-services',
    title: 'Specialized Services',
    icon: Zap,
    description: 'Expert consulting and specialized business solutions',
    color: 'from-teal-800 to-teal-900',
    textColor: 'text-teal-900',
    bgColor: 'bg-teal-50',
    services: [
      {
        id: 'consulting-services',
        title: 'Business Consulting',
        price: '\u20B9590',
        originalPrice: '\u20B91,199',
        tat: 'As per Appointment',
        description: 'Expert business consultation for strategic planning and compliance',
        features: ['Strategic Planning', 'Compliance Guidance', 'Business Advisory', 'Custom Solutions'],
        popular: true,
        rating: 4.9,
        reviews: 1234,
        documents: [
          'Business Details',
          'Current Challenges',
          'Financial Statements',
          'Consultation Requirements',
          'Meeting Schedule'
        ]
      },
      {
        id: 'gem-certification',
        title: 'GEM Registration',
        price: '\u20B92,360',
        originalPrice: '\u20B93,999',
        tat: '3 Working Days',
        description: 'Government e-Marketplace registration for government tenders',
        features: ['Government Portal Access', 'Tender Participation', 'OEM Authorization', 'Bid Management'],
        rating: 4.7,
        reviews: 345,
        documents: [
          'Company Registration',
          'PAN Card',
          'GST Certificate',
          'Bank Details',
          'Product Catalog',
          'OEM Authorization'
        ]
      },
      {
        id: 'ngo-darpan',
        title: 'NGO Darpan Registration',
        price: '\u20B92,360',
        originalPrice: '\u20B93,999',
        tat: '4 Working Days',
        description: 'Registration on government portal for NGOs and voluntary organizations',
        features: ['Government Recognition', 'Funding Access', 'CSR Eligibility', 'Compliance Support'],
        rating: 4.6,
        reviews: 234,
        documents:[
          'Registration Certificate',
          'PAN Card',
          'Audited Accounts',
          'Activity Report',
          'Board Resolution'
        ]
      },
      {
        id: 'company-conversion',
        title: 'Company Conversion',
        price: '\u20B911,800',
        originalPrice: '\u20B919,999',
        tat: '30 Days',
        description: 'Convert your business structure (Partnership to Company, etc.)',
        features: ['Structure Change', 'Legal Compliance', 'Asset Transfer', 'ROC Filing'],
        rating: 4.5,
        reviews: 89,
        documents: [
          'Existing Registration',
          'Board Resolution',
          'Partner Consent',
          'Asset Valuation',
          'Financial Statements'
        ]
      }
    ]
  }
];

// Document Requirements Dialog Component
const DocumentsDialog: React.FC<{ service: any }> = ({ service }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium bg-white transition-all duration-300">
          <FileText className="w-4 h-4 mr-2" />
          Documents Required
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileCheck className="w-5 h-5 mr-2 text-teal-600" />
            Documents Required
          </DialogTitle>
          <DialogDescription>
            Please prepare these documents for {service.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {service.documents?.map((document: string, index: number) => (
            <div 
              key={index} 
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleCheck(index)}
            >
              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                checkedItems.has(index) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300'
              }`}>
                {checkedItems.has(index) && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className={`text-sm ${
                checkedItems.has(index) ? 'line-through text-gray-500' : 'text-gray-700'
              }`}>
                {document}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Checklist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Service Card Component
const ServiceCard: React.FC<{ service: any, category: any }> = ({ service, category }) => {
  const isUrgent = service.urgent || service.id === 'notice-compliance';
  const borderColor = isUrgent ? 'border-l-red-500' : 'border-l-blue-500';
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackServiceView, trackServicePurchase } = useServiceTracking();

  const renderPrice = (p: string, className?: string) => {
    if (!p) return null;
    return (
      <span className={`inline-flex items-center ${className || ""}`}>
        <IndianRupee className="w-4 h-4 mr-0.5" />
        {p.replace(/\\u20B9|₹|â‚¹/g, "")}
      </span>
    );
  };

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      // Parse price from string like "\u20B92,999" to number
      const priceNum = parseInt(service.price.replace(/[\u20B9,]/g, ''));

      const response = await apiRequest('/api/user-services', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: service.id,
          serviceTitle: service.title,
          serviceCategory: category.title,
          paymentAmount: priceNum,
          paymentStatus: 'paid',
          status: 'pending'
        })
      });
      return response.json();
    },
    onSuccess: () => {
      // Track successful purchase
      const priceValue = parseInt(service.price.replace(/[\u20B9,]/g, ''));
      trackServicePurchase(service.title, service.id, priceValue);
      toast({
        title: "Service Purchased!",
        description: `${service.title} has been added to your dashboard.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-services'] });
    },
    onError: (error: any) => {
      if (error.message.includes('401')) {
        toast({
          title: "Please Login",
          description: "You need to login to purchase services.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to purchase service. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Login",
        description: "You need to login to purchase services.",
        variant: "destructive"
      });
      return;
    }
    purchaseMutation.mutate();
  };

  return (
    <div className="w-full">
      <Card className={`relative h-full hover:shadow-lg transition-all duration-300 border-l-4 ${borderColor} group bg-white overflow-visible mt-4 mx-auto max-w-sm lg:max-w-none`}>
        {service.popular && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 shadow-md text-xs">
              Popular
            </Badge>
          </div>
        )}
        {isUrgent && (
          <div className="absolute -top-2 -left-2 z-10">
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 shadow-md flex items-center text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Urgent
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words">
              {service.title}
            </CardTitle>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-baseline justify-end">
              <span className="text-xl lg:text-2xl font-bold text-blue-600">{renderPrice(service.price)}</span>
                  {service.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">{renderPrice(service.originalPrice)}</span>
                  )}
            </div>
            <div className="flex items-center justify-end text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="truncate">{service.tat}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 break-words leading-relaxed">{service.description}</p>

        {service.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold ml-1">{service.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
          </div>
        )}
        </CardHeader>

        <CardContent className="pt-0">
        <div className="space-y-3 mb-6">
          {service.features?.slice(0, 4).map((feature: string, index: number) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 break-words leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <DocumentsDialog service={service} />
            <Button variant="outline" size="sm" className="w-full border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium bg-white transition-all duration-300">
              <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Consult Expert</span>
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-3"></div>

          <div>
            {service.hasDetailedPage ? (
              <Link href={service.detailedPagePath}>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Info className="w-4 h-4 mr-2" />
                  View Complete Details
                </Button>
              </Link>
            ) : isUrgent ? (
              <Link href="/services/notice-compliance">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Get Help Now
                </Button>
              </Link>
            ) : (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Services Page Component
export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory 
    ? serviceCategories.filter(cat => cat.id === selectedCategory)
    : serviceCategories;

  return (
    <>
      <SEO 
        title="Business Services & Tax Solutions - GST, Company Registration | MyeCA.in"
        description="Complete business services including GST registration (\u20B9590), company incorporation, tax filing, compliance services, and more. Expert CA assistance with 24/7 support."
        keywords="GST registration, company registration, business services, tax filing, compliance services, trademark registration, FSSAI license, ISO certification, startup services"
        url="https://myeca.in/services"
      />
      <StructuredData 
        type="Service" 
        data={{
          name: "Professional Tax & Business Services",
          description: "Complete tax and business compliance services with expert CA assistance",
          serviceType: "Tax and Business Consulting",
          price: "499",
          features: ["ITR Filing", "GST Registration", "Company Incorporation", "Trademark Registration", "ISO Certification"]
        }} 
      />
      <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ name: 'Services' }]} />
      {/* Hero Section - Only show when no category is selected */}
      {selectedCategory === null && (
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Comprehensive Business Solutions
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                From tax filing to business incorporation, we provide end-to-end professional services 
                to help your business grow with complete legal compliance and expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
                  Get Started Today
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300">
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className={selectedCategory === null ? "py-12 bg-gray-50 border-b" : "py-8 bg-white border-b sticky top-0 z-40 shadow-sm"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Selected Category Title - Show when category is selected */}
          {selectedCategory !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-6"
            >
              {(() => {
                const selectedCat = serviceCategories.find(cat => cat.id === selectedCategory);
                if (selectedCat) {
                  const IconComponent = selectedCat.icon;
                  return (
                    <div className="flex items-center justify-center gap-3">
                      <div className={`w-8 h-8 ${selectedCat.bgColor} rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${selectedCat.textColor}`} />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {selectedCat.title}
                      </h1>
                    </div>
                  );
                }
                return null;
              })()}
            </motion.div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            >
              All Services
            </Button>
            {serviceCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-blue-600 border-blue-600 hover:bg-blue-50"
                  }
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {category.title}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      {filteredCategories.map((category, categoryIndex) => {
        const IconComponent = category.icon;

        return (
          <section key={category.id} className={selectedCategory === null 
            ? (categoryIndex % 2 === 0 ? "py-12 bg-white" : "py-12 bg-gray-50")
            : "py-8 bg-white"
          }>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
              {/* Only show category header when showing all categories */}
              {selectedCategory === null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className={`flex items-center justify-center w-12 h-12 ${category.bgColor} rounded-xl flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${category.textColor}`} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {category.title}
                    </h2>
                    <p className="text-lg text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {category.services.map((service, serviceIndex) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: serviceIndex * 0.1 }}
                  >
                    <ServiceCard service={service} category={category} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Need Help Choosing the Right Service?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our expert consultants are here to guide you through the best options for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 shadow-lg">
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now: +91-9876543210
              </Button>
              <Link href="/expert-consultation?service=general">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 px-8 py-4 shadow-lg font-semibold">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Get Expert Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}