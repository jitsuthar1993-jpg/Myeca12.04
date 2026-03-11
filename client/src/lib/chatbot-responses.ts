// Tax Chatbot Response Engine
// Rule-based responses for common tax queries

export interface ChatIntent {
  id: string;
  patterns: string[];
  response: string;
  quickActions?: { label: string; action: string; href?: string }[];
  followUp?: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickActions?: { label: string; action: string; href?: string }[];
}

// Tax-related intents and responses
export const TAX_INTENTS: ChatIntent[] = [
  // Greetings
  {
    id: 'greeting',
    patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
    response: "Hello! 👋 I'm your AI Tax Assistant. I can help you with:\n\n• Income tax calculations\n• Tax regime comparison\n• ITR filing guidance\n• Tax-saving investments\n• Deadline reminders\n\nHow can I assist you today?",
    quickActions: [
      { label: 'Calculate Tax', action: 'calculate_tax', href: '/calculators/income-tax' },
      { label: 'Compare Regimes', action: 'compare_regimes', href: '/calculators/regime-comparator' },
      { label: 'File ITR', action: 'file_itr', href: '/itr/form-selector' },
    ],
  },

  // ITR Filing Deadlines
  {
    id: 'deadline',
    patterns: ['deadline', 'due date', 'last date', 'when to file', 'itr deadline', 'filing date'],
    response: "📅 **ITR Filing Deadlines for FY 2024-25 (AY 2025-26):**\n\n• **Individual/HUF (no audit):** July 31, 2025\n• **Businesses (audit required):** October 31, 2025\n• **Transfer Pricing cases:** November 30, 2025\n• **Revised/Belated Return:** December 31, 2025\n\n⚠️ Late filing attracts penalty of \u20B91,000 to \u20B910,000 plus interest under Section 234A.",
    quickActions: [
      { label: 'Start Filing Now', action: 'file_itr', href: '/itr/form-selector' },
      { label: 'Set Reminder', action: 'set_reminder' },
    ],
  },

  // Tax Regime Comparison
  {
    id: 'regime',
    patterns: ['old regime', 'new regime', 'which regime', 'better regime', 'regime comparison', 'tax regime'],
    response: "🔄 **Old vs New Tax Regime Comparison:**\n\n**New Regime (Default from FY 24-25):**\n• Lower tax rates (5%-30%)\n• Standard deduction: \u20B975,000\n• No other deductions allowed\n• Rebate up to \u20B97 lakh income\n\n**Old Regime:**\n• Higher rates but more deductions\n• 80C (\u20B91.5L), 80D, HRA, LTA allowed\n• Good if deductions > \u20B93.75 lakh\n\nWant me to help you compare based on your income?",
    quickActions: [
      { label: 'Compare My Tax', action: 'compare_regimes', href: '/calculators/regime-comparator' },
      { label: 'Tax Optimizer', action: 'optimize', href: '/tax-optimizer' },
    ],
  },

  // 80C Deductions
  {
    id: '80c',
    patterns: ['80c', 'section 80c', 'tax saving', 'elss', 'ppf', 'nsc', 'tax deduction'],
    response: "💰 **Section 80C Tax Saving Options (Max \u20B91.5 Lakh):**\n\n• **ELSS Funds:** 3-year lock-in, best returns\n• **PPF:** 15-year lock-in, 7.1% interest, tax-free\n• **NSC:** 5-year, 7.7% interest\n• **Tax Saver FD:** 5-year lock-in\n• **Life Insurance Premium**\n• **Children's Tuition Fees**\n• **Home Loan Principal**\n• **Sukanya Samriddhi:** For girl child\n\n💡 Tip: Invest early in the year for maximum benefit!",
    quickActions: [
      { label: 'PPF Calculator', action: 'ppf_calc', href: '/calculators/ppf' },
      { label: 'SIP Calculator', action: 'sip_calc', href: '/calculators/sip' },
    ],
  },

  // 80D Health Insurance
  {
    id: '80d',
    patterns: ['80d', 'health insurance', 'medical', 'mediclaim'],
    response: "🏥 **Section 80D - Health Insurance Deduction:**\n\n**For Self & Family:**\n• Below 60 years: \u20B925,000\n• Senior citizen: \u20B950,000\n\n**For Parents (additional):**\n• Below 60 years: \u20B925,000\n• Senior citizen: \u20B950,000\n\n**Preventive Health Checkup:** \u20B95,000 (within overall limit)\n\n📌 Maximum deduction: \u20B91,00,000 (if all are senior citizens)",
  },

  // HRA Exemption
  {
    id: 'hra',
    patterns: ['hra', 'house rent', 'rent allowance', 'hra exemption', 'hra calculator'],
    response: "🏠 **HRA Exemption Calculation:**\n\nHRA exemption is the **minimum** of:\n1. Actual HRA received\n2. 50% of salary (metro) or 40% (non-metro)\n3. Rent paid - 10% of salary\n\n📌 **Requirements:**\n• Must pay rent actually\n• Need rent receipts for claims > \u20B91 lakh/year\n• Landlord PAN required if rent > \u20B91 lakh/year\n\n⚠️ HRA exemption is NOT available in New Tax Regime!",
    quickActions: [
      { label: 'Calculate HRA', action: 'hra_calc', href: '/calculators/hra' },
    ],
  },

  // ITR Form Selection
  {
    id: 'itr_form',
    patterns: ['which itr', 'itr form', 'itr-1', 'itr-2', 'itr-3', 'itr-4', 'form selection'],
    response: "📋 **Which ITR Form to File?**\n\n• **ITR-1 (Sahaj):** Salary income up to \u20B950L, one house property, interest income\n\n• **ITR-2:** Salary + Capital gains, multiple properties, foreign income\n\n• **ITR-3:** Business/profession income + salary\n\n• **ITR-4 (Sugam):** Presumptive business income (44AD/44ADA)\n\n🔍 Let me help you select the right form!",
    quickActions: [
      { label: 'Find My ITR Form', action: 'form_selector', href: '/itr/form-selector' },
    ],
  },

  // Capital Gains
  {
    id: 'capital_gains',
    patterns: ['capital gain', 'stcg', 'ltcg', 'stock tax', 'share tax', 'mutual fund tax'],
    response: "📈 **Capital Gains Tax (FY 2024-25):**\n\n**Equity (Stocks, Equity MF):**\n• STCG (< 1 year): 20%\n• LTCG (> 1 year): 12.5% above \u20B91.25 lakh\n\n**Debt MF, Gold, Property:**\n• STCG: As per income slab\n• LTCG (> 2 years): 12.5% without indexation\n\n💡 Tip: Use Tax Loss Harvesting to offset gains with losses!",
    quickActions: [
      { label: 'Capital Gains Calculator', action: 'cg_calc', href: '/calculators/capital-gains' },
      { label: 'Loss Harvesting', action: 'harvest', href: '/tax-loss-harvesting' },
    ],
  },

  // Advance Tax
  {
    id: 'advance_tax',
    patterns: ['advance tax', 'quarterly tax', '234b', '234c', 'advance payment'],
    response: "📆 **Advance Tax Due Dates (FY 2024-25):**\n\n• **June 15:** 15% of total tax\n• **September 15:** 45% of total tax\n• **December 15:** 75% of total tax\n• **March 15:** 100% of total tax\n\n⚠️ **Who must pay?**\nTax liability > \u20B910,000 after TDS\n\n💸 **Interest:** 1% per month under 234B & 234C for delays",
    quickActions: [
      { label: 'Calculate Advance Tax', action: 'advance_calc', href: '/calculators/advance-tax' },
    ],
  },

  // TDS
  {
    id: 'tds',
    patterns: ['tds', 'tax deducted', '26as', 'form 16', 'tds refund'],
    response: "🧾 **TDS (Tax Deducted at Source):**\n\n**Common TDS Rates:**\n• Salary: As per slab\n• Bank Interest: 10% (above \u20B940K/\u20B950K for seniors)\n• Rent: 10% (above \u20B92.4 lakh/year)\n• Professional fees: 10%\n\n**To Claim TDS Credit:**\n1. Check Form 26AS on IT portal\n2. Verify TDS matches your records\n3. Report in ITR for refund/adjustment\n\n💡 Submit Form 15G/15H to avoid TDS if income is below taxable limit.",
    quickActions: [
      { label: 'TDS Calculator', action: 'tds_calc', href: '/calculators/tds' },
      { label: 'Check Refund Status', action: 'refund', href: '/tds-refund-tracker' },
    ],
  },

  // NPS
  {
    id: 'nps',
    patterns: ['nps', 'national pension', 'pension', '80ccd', 'retirement'],
    response: "🏦 **NPS Tax Benefits:**\n\n**Section 80CCD(1):** Part of 80C limit (\u20B91.5L)\n\n**Section 80CCD(1B):** Additional \u20B950,000 deduction! 🎯\n\n**Section 80CCD(2):** Employer contribution up to 10% of salary (14% for govt.)\n\n**At Maturity:**\n• 60% withdrawal: Tax-free\n• 40% annuity: Taxable as per slab\n\n💡 NPS gives extra \u20B950K deduction over 80C limit - don't miss it!",
    quickActions: [
      { label: 'Tax Optimizer', action: 'optimize', href: '/tax-optimizer' },
    ],
  },

  // Refund
  {
    id: 'refund',
    patterns: ['refund', 'refund status', 'when refund', 'refund not received', 'refund delay'],
    response: "💸 **Income Tax Refund:**\n\n**Expected Timeline:**\n• Processing: 2-4 weeks after e-verification\n• Refund credit: 4-6 weeks after processing\n\n**Common Delay Reasons:**\n• ITR not e-verified\n• Bank account not pre-validated\n• Mismatch in bank details\n• Outstanding tax demands\n\n**To Check Status:**\nLogin to incometax.gov.in → My Account → Refund Status",
    quickActions: [
      { label: 'Track Refund', action: 'track_refund', href: '/tds-refund-tracker' },
      { label: 'ITR Status', action: 'itr_status', href: '/itr/status-tracker' },
    ],
  },

  // e-Verification
  {
    id: 'everify',
    patterns: ['e-verify', 'everify', 'verification', 'itr-v', 'aadhaar otp'],
    response: "✅ **e-Verification Methods:**\n\n1. **Aadhaar OTP** (Recommended) - Instant\n2. **Net Banking** - Login via bank\n3. **Demat Account** - Via NSDL/CDSL\n4. **Bank ATM** - Generate EVC at ATM\n5. **Physical ITR-V** - Send to CPC Bengaluru\n\n⚠️ **Important:**\n• Complete within 30 days of filing\n• Without verification, ITR is invalid!\n• Aadhaar OTP is fastest method",
    quickActions: [
      { label: 'Check Verification Status', action: 'verify_status', href: '/itr/status-tracker' },
    ],
  },

  // Tax Calculator
  {
    id: 'calculate',
    patterns: ['calculate', 'calculator', 'how much tax', 'tax calculation', 'compute tax'],
    response: "🧮 **Tax Calculators Available:**\n\n• **Income Tax Calculator** - Old & New regime\n• **HRA Calculator** - Rent exemption\n• **Capital Gains** - STCG/LTCG on investments\n• **TDS Calculator** - Tax deducted at source\n• **Advance Tax** - Quarterly payments\n• **SIP/PPF/FD** - Investment returns\n\nWhich calculation do you need help with?",
    quickActions: [
      { label: 'Income Tax', action: 'tax_calc', href: '/calculators/income-tax' },
      { label: 'All Calculators', action: 'all_calc', href: '/calculators' },
    ],
  },

  // Help/Default
  {
    id: 'help',
    patterns: ['help', 'what can you do', 'features', 'options', 'menu'],
    response: "🤖 **I can help you with:**\n\n📊 **Calculations:**\n• Income tax (old & new regime)\n• HRA, Capital Gains, TDS\n• Advance tax, SIP, PPF\n\n📝 **ITR Filing:**\n• Form selection guidance\n• Filing process steps\n• e-Verification help\n\n💰 **Tax Planning:**\n• 80C, 80D deductions\n• Tax-saving investments\n• Regime comparison\n\n📅 **Deadlines & Status:**\n• Filing deadlines\n• Refund tracking\n• ITR status check\n\nJust ask me anything!",
    quickActions: [
      { label: 'Start Filing', action: 'file', href: '/itr/form-selector' },
      { label: 'Calculators', action: 'calc', href: '/calculators' },
      { label: 'Tax Optimizer', action: 'optimize', href: '/tax-optimizer' },
    ],
  },
];

// Find the best matching intent for user input
export function findIntent(userMessage: string): ChatIntent | null {
  const normalizedMessage = userMessage.toLowerCase().trim();
  
  // Check each intent's patterns
  for (const intent of TAX_INTENTS) {
    for (const pattern of intent.patterns) {
      if (normalizedMessage.includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }
  
  return null;
}

// Generate bot response
export function generateResponse(userMessage: string): { response: string; quickActions?: ChatIntent['quickActions'] } {
  const intent = findIntent(userMessage);
  
  if (intent) {
    return {
      response: intent.response,
      quickActions: intent.quickActions,
    };
  }
  
  // Default response for unrecognized queries
  return {
    response: "I'm not sure I understand that query. 🤔\n\nI can help you with:\n• Tax calculations and planning\n• ITR filing guidance\n• Tax-saving deductions (80C, 80D, etc.)\n• Deadlines and refund status\n\nCould you please rephrase your question, or choose from the options below?",
    quickActions: [
      { label: 'Ask about Tax', action: 'tax_help' },
      { label: 'Filing Help', action: 'filing_help' },
      { label: 'Calculators', action: 'calculators', href: '/calculators' },
    ],
  };
}

// Suggested questions for new users
export const SUGGESTED_QUESTIONS = [
  "Which tax regime is better for me?",
  "What are the ITR filing deadlines?",
  "How can I save tax under 80C?",
  "How to calculate HRA exemption?",
  "What is advance tax?",
  "How to check refund status?",
];

// Quick tips for display
export const TAX_TIPS = [
  "💡 New regime is default from FY 24-25. Opt out explicitly for old regime.",
  "💡 Don't forget the additional \u20B950,000 NPS deduction under 80CCD(1B)!",
  "💡 Health insurance for parents can give you up to \u20B950,000 extra deduction.",
  "💡 Complete e-verification within 30 days of filing your ITR.",
  "💡 Pre-validate your bank account for faster refund processing.",
];

