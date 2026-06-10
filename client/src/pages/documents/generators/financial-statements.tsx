import { Landmark, Scale, WalletCards } from "lucide-react";
import {
  createFinancialStatementGenerator,
  statementValueAt,
  type FinancialStatementRow,
} from "./financial-statement-factory";
import { calculateFinancialRatios, roundCurrency } from "../financial";

const periods4 = ["Current Period", "Projected FY 1", "Projected FY 2", "Projected FY 3"];
const periods3 = ["Projected FY 1", "Projected FY 2", "Projected FY 3"];
const periodValues = (count: number, calculate: (index: number) => number) =>
  Array.from({ length: count }, (_, index) => roundCurrency(calculate(index)));

const financeSeo = (
  keywords: string[],
  requiredInputs: string[],
  limitations: string[],
) => ({
  keywords,
  requiredInputs,
  limitations,
  faqs: [
    {
      question: "Is this statement audited or certified?",
      answer: "No. It is a self-prepared draft based on user inputs. Professional review or certification is a separate service.",
    },
    {
      question: "Does a bank have to accept this format?",
      answer: "No. Banks and institutions may request their own format, supporting documents, assumptions, and professional certification.",
    },
  ],
});
const cashFlowRows: FinancialStatementRow[] = [
  { id: "operatingReceipts", label: "Cash receipts from operations", group: "Operating Activities" },
  { id: "otherOperatingReceipts", label: "Other operating receipts", group: "Operating Activities" },
  { id: "operatingPayments", label: "Payments to suppliers and employees", group: "Operating Activities" },
  { id: "taxPayments", label: "Tax and statutory payments", group: "Operating Activities" },
  { id: "assetPurchases", label: "Purchase of fixed assets", group: "Investing Activities" },
  { id: "assetSaleReceipts", label: "Receipts from sale of assets", group: "Investing Activities" },
  { id: "loanDrawdowns", label: "Loan drawdowns", group: "Financing Activities" },
  { id: "ownerCapital", label: "Owner / promoter capital introduced", group: "Financing Activities" },
  { id: "principalRepayment", label: "Loan principal repayment", group: "Debt Service" },
  { id: "interestPaid", label: "Interest paid", group: "Debt Service" },
  { id: "openingCash", label: "Opening cash and bank balance", group: "Cash Position" },
];

export const MsmeCashFlowGenerator = createFinancialStatementGenerator({
  id: "msme-cash-flow",
  title: "MSME Cash Flow Statement",
  description: "Prepare a direct-method current and three-year projected cash flow for MSME bank-finance planning.",
  documentTitle: "MSME Cash Flow Statement",
  icon: WalletCards,
  periods: periods4,
  rows: cashFlowRows,
  complianceNotice: "Self-prepared MSME cash-flow draft - Not audited, certified, or guaranteed to be accepted by a lender.",
  conversionTargets: [{ kind: "projected-balance-sheet", label: "Create Projected Balance Sheet" }],
  summary: (values) => {
    const count = periods4.length;
    const operatingSurplus = periodValues(count, (i) =>
      statementValueAt(values, "operatingReceipts", i) +
      statementValueAt(values, "otherOperatingReceipts", i) -
      statementValueAt(values, "operatingPayments", i) -
      statementValueAt(values, "taxPayments", i),
    );
    const investingNet = periodValues(count, (i) =>
      statementValueAt(values, "assetSaleReceipts", i) - statementValueAt(values, "assetPurchases", i),
    );
    const financingBeforeDebt = periodValues(count, (i) =>
      statementValueAt(values, "loanDrawdowns", i) + statementValueAt(values, "ownerCapital", i),
    );
    const debtService = periodValues(count, (i) =>
      statementValueAt(values, "principalRepayment", i) + statementValueAt(values, "interestPaid", i),
    );
    const netCashMovement = periodValues(count, (i) =>
      operatingSurplus[i] + investingNet[i] + financingBeforeDebt[i] - debtService[i],
    );
    const closingCash = periodValues(count, (i) => statementValueAt(values, "openingCash", i) + netCashMovement[i]);
    const dscr = periodValues(count, (i) => {
      const service = debtService[i];
      return service ? (operatingSurplus[i] + statementValueAt(values, "interestPaid", i)) / service : 0;
    });
    return [
      { label: "Operating cash surplus / (deficit)", values: operatingSurplus },
      { label: "Net cash movement", values: netCashMovement },
      { label: "Closing cash and bank balance", values: closingCash },
      { label: "Debt service", values: debtService },
      { label: "Indicative DSCR", values: dscr, format: "ratio" },
    ];
  },
  seo: financeSeo(
    ["MSME cash flow statement", "projected cash flow for bank loan", "cash flow statement format India"],
    ["Current cash receipts and payments", "Three-year assumptions", "Loan drawdowns and debt service", "Opening cash"],
    ["This is not an audited or certified statement.", "Lenders may require a different format and supporting records."],
  ),
});

const balanceSheetRows: FinancialStatementRow[] = [
  { id: "capital", label: "Capital / Share capital / Proprietor funds", group: "Equity and Liabilities" },
  { id: "reserves", label: "Reserves and retained earnings", group: "Equity and Liabilities" },
  { id: "securedLoans", label: "Secured loans", group: "Equity and Liabilities" },
  { id: "unsecuredLoans", label: "Unsecured loans", group: "Equity and Liabilities" },
  { id: "tradePayables", label: "Trade payables", group: "Equity and Liabilities" },
  { id: "otherCurrentLiabilities", label: "Other current liabilities", group: "Equity and Liabilities" },
  { id: "fixedAssets", label: "Net fixed assets", group: "Assets" },
  { id: "investments", label: "Investments", group: "Assets" },
  { id: "inventory", label: "Inventory", group: "Assets" },
  { id: "receivables", label: "Trade receivables", group: "Assets" },
  { id: "cash", label: "Cash and bank balances", group: "Assets" },
  { id: "otherAssets", label: "Other assets", group: "Assets" },
];

const balanceSheetSummary = (values: Record<string, number[]>) => {
  const count = periods3.length;
  const equity = periodValues(count, (i) => statementValueAt(values, "capital", i) + statementValueAt(values, "reserves", i));
  const debt = periodValues(count, (i) => statementValueAt(values, "securedLoans", i) + statementValueAt(values, "unsecuredLoans", i));
  const currentLiabilities = periodValues(count, (i) => statementValueAt(values, "tradePayables", i) + statementValueAt(values, "otherCurrentLiabilities", i));
  const totalLiabilitiesAndEquity = periodValues(count, (i) => equity[i] + debt[i] + currentLiabilities[i]);
  const currentAssets = periodValues(count, (i) =>
    statementValueAt(values, "inventory", i) +
    statementValueAt(values, "receivables", i) +
    statementValueAt(values, "cash", i) +
    statementValueAt(values, "otherAssets", i),
  );
  const totalAssets = periodValues(count, (i) =>
    statementValueAt(values, "fixedAssets", i) + statementValueAt(values, "investments", i) + currentAssets[i],
  );
  const ratios = periodValues(count, (i) => calculateFinancialRatios({
    currentAssets: currentAssets[i],
    currentLiabilities: currentLiabilities[i],
    totalDebt: debt[i],
    equity: equity[i],
    assets: totalAssets[i],
    liabilitiesAndEquity: totalLiabilitiesAndEquity[i],
  }).currentRatio);
  const debtEquity = periodValues(count, (i) => calculateFinancialRatios({
    totalDebt: debt[i],
    equity: equity[i],
  }).debtEquityRatio);
  const difference = periodValues(count, (i) => totalAssets[i] - totalLiabilitiesAndEquity[i]);
  return [
    { label: "Total equity and liabilities", values: totalLiabilitiesAndEquity },
    { label: "Total assets", values: totalAssets },
    { label: "Working capital", values: periodValues(count, (i) => currentAssets[i] - currentLiabilities[i]) },
    { label: "Current ratio", values: ratios, format: "ratio" as const },
    { label: "Debt-equity ratio", values: debtEquity, format: "ratio" as const },
    { label: "Balance difference", values: difference },
  ];
};

export const ProjectedBalanceSheetGenerator = createFinancialStatementGenerator({
  id: "projected-balance-sheet",
  title: "Projected Balance Sheet",
  description: "Prepare a three-year projected balance sheet with bank-oriented ratios and an explicit balance check.",
  documentTitle: "Projected Balance Sheet",
  icon: Scale,
  periods: periods3,
  rows: balanceSheetRows,
  complianceNotice: "Self-prepared projection - Not audited, certified, bank-approved, or a substitute for professional review.",
  summary: balanceSheetSummary,
  exportBlockReason: (values) => {
    const differences = balanceSheetSummary(values).find((row) => row.label === "Balance difference")?.values || [];
    return differences.some((difference) => Math.abs(difference) > 0.01)
      ? "Export blocked: assets must equal equity and liabilities for every projected year. No balancing figure has been inserted."
      : null;
  },
  seo: financeSeo(
    ["projected balance sheet format India", "projected balance sheet for bank loan", "MSME balance sheet projection"],
    ["Projected equity and borrowings", "Current liabilities", "Projected assets", "Three financial-year labels"],
    ["The statement must balance before export.", "This is not an audited, certified, or bank-approved statement."],
  ),
});

const netWorthRows: FinancialStatementRow[] = [
  { id: "cashBank", label: "Cash and bank balances", group: "Assets" },
  { id: "quotedInvestments", label: "Quoted / readily realisable investments", group: "Assets" },
  { id: "otherInvestments", label: "Other investments", group: "Assets" },
  { id: "residentialProperty", label: "Residential property", group: "Assets" },
  { id: "commercialProperty", label: "Commercial / business property", group: "Assets" },
  { id: "businessInterest", label: "Business / partnership interest", group: "Assets" },
  { id: "receivables", label: "Receivables and loans given", group: "Assets" },
  { id: "vehiclesOtherAssets", label: "Vehicles and other assets", group: "Assets" },
  { id: "securedLoans", label: "Secured loans", group: "Liabilities" },
  { id: "unsecuredLoans", label: "Unsecured loans", group: "Liabilities" },
  { id: "creditCardsOther", label: "Credit cards and other liabilities", group: "Liabilities" },
  { id: "contingentLiabilities", label: "Contingent liabilities", group: "Liabilities" },
];

export const NetWorthStatementGenerator = createFinancialStatementGenerator({
  id: "net-worth-statement",
  title: "Net Worth Statement Builder",
  description: "Prepare a self-declared net-worth statement for individuals, proprietors, directors, partners, or guarantors.",
  documentTitle: "Self-Prepared Net Worth Statement",
  icon: Landmark,
  periods: ["Valuation Amount"],
  rows: netWorthRows,
  complianceNotice: "Self-prepared Net Worth Statement - Not CA Certified.",
  summary: (values) => {
    const assets = ["cashBank", "quotedInvestments", "otherInvestments", "residentialProperty", "commercialProperty", "businessInterest", "receivables", "vehiclesOtherAssets"]
      .reduce((total, row) => total + statementValueAt(values, row, 0), 0);
    const liabilities = ["securedLoans", "unsecuredLoans", "creditCardsOther", "contingentLiabilities"]
      .reduce((total, row) => total + statementValueAt(values, row, 0), 0);
    const liquidAssets = statementValueAt(values, "cashBank", 0) + statementValueAt(values, "quotedInvestments", 0);
    return [
      { label: "Gross assets", values: [assets] },
      { label: "Total liabilities", values: [liabilities] },
      { label: "Net worth", values: [assets - liabilities] },
      { label: "Liquid net worth", values: [liquidAssets - liabilities] },
    ];
  },
  seo: financeSeo(
    ["net worth statement India", "net worth statement builder", "personal net worth format India"],
    ["Assets and valuation basis", "Loans and liabilities", "Valuation date", "Supporting-document notes"],
    ["This output is not a CA-certified net-worth certificate.", "Certification, UDIN, and institutional acceptance require separate professional review."],
  ),
});
