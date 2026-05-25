import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { computeIndividualIncomeTax, type ResidentialStatus } from "@/lib/income-tax-engine";
import type { TaxCalculationResult } from "@/types/calculator";
import { 
  TrendingUp, IndianRupee, 
  Zap,
  ChevronRight, PieChart, ShieldCheck,
  Target, Info, ArrowLeft, ArrowRight,
  Shield, Wallet, Receipt, CheckCircle2,
  Lock, Headphones, Award, Calendar
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { SectionReferenceBadge } from "@/components/tax/SectionReferenceBadge";
import { DEFAULT_ASSESSMENT_YEAR, TAX_TRANSITION_NOTE, type AgeCategory } from "@/lib/tax-law-reference";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function IncomeTaxCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // States
  const [basicSalary, setBasicSalary] = useState<number>(710000);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [savingInterest, setSavingInterest] = useState<number>(10000);
  const [otherIncome, setOtherIncome] = useState<number>(50000);
  const [stcg111a, setStcg111a] = useState<number>(0);
  const [ltcg112a, setLtcg112a] = useState<number>(0);
  const [ltcg112, setLtcg112] = useState<number>(0);
  const [cryptoAndWinnings, setCryptoAndWinnings] = useState<number>(0);
  const [dividendSurchargeCapIncome, setDividendSurchargeCapIncome] = useState<number>(0);
  
  const [deductions80C, setDeductions80C] = useState<number>(150000);
  const [deductions80D, setDeductions80D] = useState<number>(25000);
  const [otherDeductions, setOtherDeductions] = useState<number>(50000);
  const [taxCredits, setTaxCredits] = useState<number>(0);
  
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [assessmentYear, setAssessmentYear] = useState('2026-27');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("regular");
  const [residentialStatus, setResidentialStatus] = useState<ResidentialStatus>("resident");

  // Derived totals
  const auto80TTA = Math.min(savingInterest, 10000);
  const age = ageCategory === "superSenior" ? 80 : ageCategory === "senior" ? 60 : 30;

  const { newRegimeTax, oldRegimeTax } = useMemo(() => {
    const sharedInputs = {
      assessmentYear,
      profile: { age, ageCategory, residentialStatus },
      income: {
        salary: basicSalary,
        rentalIncome,
        savingsInterest: savingInterest,
        otherIncome,
        stcg111a,
        ltcg112a,
        ltcg112,
        cryptoAndWinnings,
        dividendSurchargeCapIncome,
      },
      deductions: {
        section80C: deductions80C,
        section80D: deductions80D,
        otherDeductions,
        section80TTA: auto80TTA,
      },
      taxCredits: {
        tdsTcs: taxCredits,
      },
    };

    return {
      newRegimeTax: computeIndividualIncomeTax({ ...sharedInputs, regime: 'new' }),
      oldRegimeTax: computeIndividualIncomeTax({ ...sharedInputs, regime: 'old' }),
    };
  }, [
    assessmentYear,
    age,
    ageCategory,
    residentialStatus,
    basicSalary,
    rentalIncome,
    savingInterest,
    otherIncome,
    stcg111a,
    ltcg112a,
    ltcg112,
    cryptoAndWinnings,
    dividendSurchargeCapIncome,
    deductions80C,
    deductions80D,
    otherDeductions,
    auto80TTA,
    taxCredits,
  ]);

  const seo = getSEOConfig('/calculators/income-tax');

  const fmt = (n: number) => n.toLocaleString("en-IN");
  const fmtCurrency = (n: number) => `₹ ${fmt(n)}`;
  const readMoney = (value: string) => Math.max(0, Number(value) || 0);

  const taxDifference = newRegimeTax.grossTaxLiability - oldRegimeTax.grossTaxLiability;
  const savingsValue = Math.abs(newRegimeTax.grossTaxLiability - oldRegimeTax.grossTaxLiability);
  const betterRegime = taxDifference < 0 ? "New Regime" : taxDifference > 0 ? "Old Regime" : "Both Regimes";
  const savingsPercent = Math.round((savingsValue / Math.max(newRegimeTax.grossTaxLiability, oldRegimeTax.grossTaxLiability)) * 100) || 0;
  const selectedCalculation = regime === "new" ? newRegimeTax : oldRegimeTax;
  const recommendedCalculation = betterRegime === "Old Regime" ? oldRegimeTax : newRegimeTax;

  const renderAmountRow = (
    label: string,
    amount: number,
    options: { negative?: boolean; strong?: boolean } = {},
  ) => (
    <div className={cn(
      "flex items-center justify-between gap-4 py-2 text-sm",
      options.strong && "border-t border-[#EAECF0] pt-3 font-normal text-[#101828]",
    )}>
      <span className="min-w-0 text-[#667085]">{label}</span>
      <span className={cn(
        "shrink-0 tabular-nums text-[#101828]",
        options.negative && amount > 0 && "text-[#B42318]",
        options.strong && "text-base",
      )}>
        {options.negative && amount > 0 ? "-" : ""}{fmtCurrency(amount)}
      </span>
    </div>
  );

  const renderComputationCard = (
    title: "New Regime" | "Old Regime",
    calculation: TaxCalculationResult,
    isRecommended: boolean,
  ) => {
    const isOldRegime = title === "Old Regime";
    const oldDeductionAmount = isOldRegime
      ? calculation.deductionBreakdown.section80C
        + calculation.deductionBreakdown.section80D
        + calculation.deductionBreakdown.otherDeductions
      : 0;
    const auto80TTAAmount = calculation.deductionBreakdown.section80TTA;
    const visibleSlabBreakdown = calculation.slabBreakdown.filter((slab) => slab.taxableAmount > 0);
    const visibleSpecialBreakdown = calculation.specialRateBreakdown.filter((item) => item.taxableAmount > 0);

    return (
      <div className={cn(
        "min-w-0 rounded-[28px] border bg-white p-5 shadow-sm md:p-6",
        isRecommended ? "border-[#ABEFC6] bg-[#F6FEF9]" : "border-[#EAECF0]",
      )}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-normal text-[#101828]">{title}</h3>
            <p className="mt-1 text-xs text-[#667085]">
              {isOldRegime ? "Deductions and old-regime slabs applied" : "Default slabs with limited deductions"}
            </p>
          </div>
          {isRecommended && (
            <span className="rounded-full bg-[#ECFDF3] px-3 py-1 type-meta font-normal uppercase tracking-wider text-[#027A48]">
              {savingsValue > 0 ? "Lower tax" : "Same tax"}
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-5">
          <div className="rounded-[20px] border border-[#EAECF0] bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-normal text-[#101828]">
              <Wallet className="h-4 w-4 text-[#444CE7]" />
              Computation of Income
            </div>
            <div className="space-y-1">
              {renderAmountRow("Annual salary", basicSalary)}
              {renderAmountRow("Rental income", rentalIncome)}
              {renderAmountRow("Savings interest", savingInterest)}
              {renderAmountRow("Other income", otherIncome)}
              {renderAmountRow("Dividend income", dividendSurchargeCapIncome)}
              {renderAmountRow("Special-rate income", calculation.specialRateIncome)}
              {renderAmountRow("Gross total income", calculation.grossIncome, { strong: true })}
              {renderAmountRow("Standard deduction", calculation.standardDeduction, { negative: true })}
              {renderAmountRow("80C, 80D and other deductions", oldDeductionAmount, { negative: true })}
              {renderAmountRow("Section 80TTA savings interest", auto80TTAAmount, { negative: true })}
              {renderAmountRow("Taxable income", calculation.taxableIncome, { strong: true })}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#EAECF0] bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-normal text-[#101828]">
              <Receipt className="h-4 w-4 text-[#444CE7]" />
              Computation of Income Tax
            </div>
            <div className="space-y-2">
              {visibleSlabBreakdown.length > 0 ? (
                visibleSlabBreakdown.map((slab) => (
                  <div key={`${title}-${slab.min}-${slab.max}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl bg-[#F9FAFB] px-3 py-2">
                    <div className="min-w-0">
                      <p className="break-words text-xs text-[#475467]">{slab.label} ({Math.round(slab.rate * 100)}%)</p>
                      <p className="mt-0.5 type-meta text-[#98A2B3]">Taxable: {fmtCurrency(slab.taxableAmount)}</p>
                    </div>
                    <span className="text-right text-sm tabular-nums text-[#101828]">{fmtCurrency(slab.tax)}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-[#F9FAFB] px-3 py-2 text-xs text-[#667085]">
                  No taxable slab applies for this income.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1">
              {renderAmountRow("Normal slab tax", calculation.normalSlabTax)}
              {visibleSpecialBreakdown.map((item) => (
                <div key={`${title}-${item.key}`} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <span className="min-w-0 text-[#667085]">{item.label} ({item.rate * 100}%)</span>
                  <span className="shrink-0 tabular-nums text-[#101828]">{fmtCurrency(item.tax)}</span>
                </div>
              ))}
              {renderAmountRow("Special-rate tax", calculation.specialRateTax)}
              {renderAmountRow("Tax before rebate", calculation.taxBeforeRebate)}
              {renderAmountRow("Section 87A rebate", calculation.rebate87A, { negative: true })}
              {calculation.marginalRelief > 0 && renderAmountRow("87A marginal relief", calculation.marginalRelief, { negative: true })}
              {renderAmountRow("Tax after rebate", calculation.taxAfterRebate)}
              {calculation.surchargeBeforeRelief > 0 && renderAmountRow("Surcharge before relief", calculation.surchargeBeforeRelief)}
              {calculation.surchargeMarginalRelief > 0 && renderAmountRow("Surcharge marginal relief", calculation.surchargeMarginalRelief, { negative: true })}
              {renderAmountRow("Surcharge", calculation.surcharge)}
              {renderAmountRow("Health & Education Cess @ 4%", calculation.cess)}
              {renderAmountRow("Gross tax liability", calculation.grossTaxLiability, { strong: true })}
              {renderAmountRow("Tax credits", calculation.taxCredits, { negative: true })}
              {renderAmountRow("Final tax payable", calculation.taxPayable, { strong: true })}
              {calculation.refundDue > 0 && renderAmountRow("Refund due", calculation.refundDue, { strong: true })}
              {renderAmountRow("Net income after tax", calculation.netIncome, { strong: true })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <MetaSEO
        title={seo?.title || `Income Tax Calculator AY ${DEFAULT_ASSESSMENT_YEAR} | MyeCA.in`}
        description={seo?.description || `Calculate income tax for AY ${DEFAULT_ASSESSMENT_YEAR}. Compare Old vs New Tax Regime with 1961 Act sections and 2025 Act equivalents.`}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      {/* Header Section */}
      <div className="max-w-[1200px] mx-auto px-4 pt-8 pb-6 md:pt-12 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <h1 className="type-page-title font-normal text-[#101828]">Income Tax Calculator</h1>
            <p className="text-sm leading-6 text-[#667085] md:text-lg">Estimate tax, compare regimes, and move into ITR filing with the same assumptions.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#F0F2F5] px-4 py-2 rounded-full border border-[#D0D5DD]">
            <div className="flex items-center gap-2 text-sm font-normal text-[#475467]">
              <CheckCircle2 className="w-4 h-4 text-[#101828]" />
              Rule-based estimate
            </div>
            <div className="w-px h-4 bg-[#D0D5DD]" />
            <div className="text-sm font-normal text-[#475467]">Secure workflow</div>
            <div className="w-px h-4 bg-[#D0D5DD]" />
            <div className="text-sm font-normal text-[#475467]">Review before filing</div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm md:hidden">
          <p className="type-meta font-bold uppercase tracking-[0.16em] text-blue-700">Current estimate</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-700">Selected regime</p>
              <p className="mt-2 text-xl font-black text-slate-950">{fmtCurrency(selectedCalculation.taxPayable)}</p>
              <p className="mt-1 text-xs text-slate-500">{regime === "new" ? "New regime" : "Old regime"}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-700">Recommended</p>
              <p className="mt-2 text-xl font-black text-slate-950">{fmtCurrency(recommendedCalculation.taxPayable)}</p>
              <p className="mt-1 text-xs text-slate-500">{betterRegime}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {savingsValue > 0
              ? `${betterRegime} is lower by ${fmtCurrency(savingsValue)} before final document review.`
              : "Both regimes are currently showing the same tax before final document review."}
          </p>
          <div className="mt-4 grid gap-2">
            <Link href="/itr/form-selector">
              <Button className="h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">
                File ITR with this estimate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-11 w-full rounded-lg border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Review deductions and regime
            </Button>
          </div>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 md:gap-8 md:mt-12">
          
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#444CE7]">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-normal text-[#101828]">Your Income</h2>
                    <p className="text-sm text-[#667085]">Enter your income details to calculate your tax</p>
                  </div>
                </div>
                <div className="flex bg-[#F9FAFB] border border-[#EAECF0] p-1 rounded-xl">
                  {['2025-26', '2026-27'].map(year => (
                    <button
                      key={year}
                      onClick={() => setAssessmentYear(year)}
                      className={cn(
                        "px-5 py-1.5 rounded-lg text-xs font-normal transition-all",
                        assessmentYear === year 
                          ? "bg-white text-[#444CE7] shadow-sm border border-[#EAECF0]" 
                          : "text-[#667085] hover:text-[#101828]"
                      )}
                    >
                      AY {year}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 border-b border-[#F2F4F7] pb-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-normal text-[#344054]">Residential Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "resident", label: "Resident" },
                      { id: "nonResident", label: "Non-resident" },
                    ].map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setResidentialStatus(status.id as ResidentialStatus)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs transition-all",
                          residentialStatus === status.id
                            ? "border-[#444CE7] bg-[#F5F8FF] text-[#444CE7]"
                            : "border-[#EAECF0] bg-white text-[#667085] hover:text-[#101828]",
                        )}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-normal text-[#344054]">Age Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "regular", label: "Below 60" },
                      { id: "senior", label: "60-79" },
                      { id: "superSenior", label: "80+" },
                    ].map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setAgeCategory(category.id as AgeCategory)}
                        className={cn(
                          "rounded-xl border px-2 py-2 text-xs transition-all",
                          ageCategory === category.id
                            ? "border-[#444CE7] bg-[#F5F8FF] text-[#444CE7]"
                            : "border-[#EAECF0] bg-white text-[#667085] hover:text-[#101828]",
                        )}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 0 ? (
                  <motion.div
                    key="income"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Annual Salary */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-[#344054]">Annual Salary</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-normal text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[basicSalary]} 
                    onValueChange={(v) => setBasicSalary(v[0])} 
                    max={5000000} 
                    min={0} 
                    step={10000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                    <span>Gross salary</span>
                  </div>
                </div>

                {/* Rental Income */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-[#344054]">Rental Income (Annual)</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-normal text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={rentalIncome}
                        onChange={(e) => setRentalIncome(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[rentalIncome]} 
                    onValueChange={(v) => setRentalIncome(v[0])} 
                    max={2000000} 
                    min={0} 
                    step={10000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                    <span>House property</span>
                  </div>
                </div>

                  {/* Saving Interest */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-normal text-[#344054]">Saving Interest</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[110px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-normal text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={savingInterest}
                          onChange={(e) => setSavingInterest(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <Slider 
                      value={[savingInterest]} 
                      onValueChange={(v) => setSavingInterest(v[0])} 
                      max={100000} 
                      min={0} 
                      step={500} 
                      colorTheme="slate"
                    />
                    <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                      <span>Max ₹10k deduction</span>
                    </div>
                  </div>

                  {/* Other Income */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-normal text-[#344054]">Other Income</span>
                        <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                      </div>
                      <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[110px] flex items-center gap-1.5 shadow-sm">
                        <span className="text-xs font-normal text-[#667085]">₹</span>
                        <input 
                          type="number"
                          value={otherIncome}
                          onChange={(e) => setOtherIncome(Number(e.target.value))}
                          className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <Slider 
                      value={[otherIncome]} 
                      onValueChange={(v) => setOtherIncome(v[0])} 
                      max={1000000} 
                      min={0} 
                      step={5000} 
                      colorTheme="slate"
                    />
                    <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                      <span>Other sources</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#EAECF0] bg-[#FCFCFD] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#444CE7]" />
                    <div>
                      <h3 className="text-sm font-normal text-[#101828]">Special-rate income</h3>
                      <p className="text-xs text-[#667085]">Capital gains, winnings, and dividend surcharge-cap categories</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      { label: "STCG u/s 111A", value: stcg111a, setter: setStcg111a },
                      { label: "LTCG u/s 112A", value: ltcg112a, setter: setLtcg112a },
                      { label: "Other LTCG u/s 112", value: ltcg112, setter: setLtcg112 },
                      { label: "Crypto / winnings", value: cryptoAndWinnings, setter: setCryptoAndWinnings },
                      { label: "Dividend surcharge-cap income", value: dividendSurchargeCapIncome, setter: setDividendSurchargeCapIncome },
                    ].map((field) => (
                      <div key={field.label} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-[#EAECF0]">
                        <span className="min-w-0 text-xs text-[#475467]">{field.label}</span>
                        <div className="flex min-w-[118px] items-center gap-1.5">
                          <span className="text-xs text-[#667085]">₹</span>
                          <input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.setter(readMoney(e.target.value))}
                            className="w-full bg-transparent text-right text-sm text-[#101828] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regime Toggle */}
                <div className="pt-4 border-t border-[#F2F4F7]">
                  <label className="text-sm font-normal text-[#344054] mb-2 block">Choose Default Tax Regime</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'new', label: 'New Regime (Default)', desc: 'Lower tax rates, fewer deductions' },
                      { id: 'old', label: 'Old Regime', desc: 'Higher deductions, higher tax benefits' }
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setRegime(r.id as 'old' | 'new')}
                        className={cn(
                          "p-6 rounded-[20px] border-2 text-left transition-all relative overflow-hidden",
                          regime === r.id 
                            ? "border-[#444CE7] bg-[#F5F8FF]" 
                            : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            regime === r.id ? "border-[#444CE7] bg-[#444CE7]" : "border-[#D0D5DD]"
                          )}>
                            {regime === r.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={cn("text-sm font-normal", regime === r.id ? "text-[#444CE7]" : "text-[#344054]")}>{r.label}</span>
                        </div>
                        <p className="text-xs text-[#667085] ml-8">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-3.5 rounded-[20px] bg-[#101828] text-white font-normal text-base hover:bg-[#1C293E] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#101828]/10"
                >
                  Continue to Deductions
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="deductions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* 80C Deductions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-[#344054]">Section 80C<SectionReferenceBadge section="80C" /></span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-normal text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={deductions80C}
                        onChange={(e) => setDeductions80C(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[deductions80C]} 
                    onValueChange={(v) => setDeductions80C(v[0])} 
                    max={150000} 
                    min={0} 
                    step={5000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                    <span>PPF, ELSS, LIC (Max 1.5L)</span>
                  </div>
                </div>

                {/* 80D Deductions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-[#344054]">Section 80D<SectionReferenceBadge section="80D" /></span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-normal text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={deductions80D}
                        onChange={(e) => setDeductions80D(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[deductions80D]} 
                    onValueChange={(v) => setDeductions80D(v[0])} 
                    max={100000} 
                    min={0} 
                    step={5000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                    <span>Health Insurance Premiums</span>
                  </div>
                </div>

                {/* Other Deductions */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-[#344054]">Other Deductions</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-normal text-[#667085]">₹</span>
                      <input 
                        type="number"
                        value={otherDeductions}
                        onChange={(e) => setOtherDeductions(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider 
                    value={[otherDeductions]} 
                    onValueChange={(v) => setOtherDeductions(v[0])} 
                    max={500000} 
                    min={0} 
                    step={5000} 
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                    <span>NPS, HRA, etc.</span>
                  </div>
                </div>

                {/* Tax Credits */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-[#344054]">Tax Credits</span>
                      <Info className="w-3.5 h-3.5 text-[#98A2B3] cursor-pointer" />
                    </div>
                    <div className="bg-white border border-[#EAECF0] px-2.5 py-1 rounded-lg min-w-[120px] flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-normal text-[#667085]">₹</span>
                      <input
                        type="number"
                        value={taxCredits}
                        onChange={(e) => setTaxCredits(readMoney(e.target.value))}
                        className="bg-transparent border-none outline-none text-right w-full text-sm font-normal text-[#101828] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[taxCredits]}
                    onValueChange={(v) => setTaxCredits(v[0])}
                    max={2000000}
                    min={0}
                    step={5000}
                    colorTheme="slate"
                  />
                  <div className="flex items-center justify-between type-meta text-[#667085] font-normal uppercase tracking-wider">
                    <span>TDS, TCS, advance/self-assessment tax</span>
                  </div>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F2F4F7]">
                  <button 
                    onClick={() => setCurrentStep(0)}
                    className="py-3.5 rounded-[20px] bg-white border border-[#EAECF0] text-[#344054] font-normal text-base hover:bg-[#F9FAFB] transition-all flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Income
                  </button>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="py-3.5 rounded-[20px] bg-[#101828] text-white font-normal text-base hover:bg-[#1C293E] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#101828]/10"
                  >
                    View Result
                    <TrendingUp className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-[#EAECF0] p-6 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-normal text-[#101828]">Tax Summary</h2>
                <div className="bg-[#ECFDF3] text-[#027A48] type-meta font-normal px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Suggested
                </div>
              </div>
              <p className="text-sm text-[#667085] mb-4">Live comparison of tax regimes</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* New Regime Box */}
                <div className={cn(
                  "p-4 rounded-[20px] border-2",
                  betterRegime !== "Old Regime" ? "border-[#ECFDF3] bg-[#F6FEF9]" : "border-[#EAECF0] bg-white"
                )}>
                  <span className="text-xs font-normal text-[#101828] block mb-0.5">New Regime</span>
                  <span className="type-meta text-[#667085] block mb-2">Lower tax rates</span>
                  <span className={cn("text-2xl font-normal block mb-0.5", betterRegime !== "Old Regime" ? "text-[#027A48]" : "text-[#344054]")}>
                    ₹ {fmt(newRegimeTax.taxPayable)}
                  </span>
                  <span className="type-meta text-[#98A2B3] font-normal uppercase tracking-widest">Total Tax</span>
                </div>

                {/* Old Regime Box */}
                <div className={cn(
                  "p-4 rounded-[20px] border-2",
                  betterRegime !== "New Regime" ? "border-[#ECFDF3] bg-[#F6FEF9]" : "border-[#EAECF0] bg-white"
                )}>
                  <span className="text-xs font-normal text-[#101828] block mb-0.5">Old Regime</span>
                  <span className="type-meta text-[#667085] block mb-2">With deductions</span>
                  <span className={cn("text-2xl font-normal block mb-0.5", betterRegime !== "New Regime" ? "text-[#027A48]" : "text-[#B42318]")}>
                    ₹ {fmt(oldRegimeTax.taxPayable)}
                  </span>
                  <span className="type-meta text-[#98A2B3] font-normal uppercase tracking-widest">Total Tax</span>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="bg-[#F9FAFB] rounded-[20px] border border-[#EAECF0] p-4 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#ECFDF3] flex items-center justify-center text-[#027A48] shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal text-[#475467]">You Save</span>
                    <span className="text-2xl font-normal text-[#027A48]">₹ {fmt(savingsValue)}</span>
                  </div>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    {savingsValue > 0 ? (
                      <>
                        by choosing <span className="font-normal text-[#101828]">{betterRegime}</span>. 
                        That's <span className="font-normal text-[#027A48]">{savingsPercent}%</span> savings!
                      </>
                    ) : (
                      <>Both regimes are equal for these inputs.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal text-[#667085]">Tax Before Cess</span>
                  <div className="flex gap-8">
                    <span className="text-xs font-normal text-[#101828] min-w-[70px] text-right">₹ {fmt(newRegimeTax.taxBeforeCess)}</span>
                    <span className="text-xs font-normal text-[#101828] min-w-[70px] text-right">₹ {fmt(oldRegimeTax.taxBeforeCess)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal text-[#667085]">Health & Education Cess @ 4%</span>
                  <div className="flex gap-8">
                    <span className="text-xs font-normal text-[#101828] min-w-[70px] text-right">₹ {fmt(newRegimeTax.cess)}</span>
                    <span className="text-xs font-normal text-[#101828] min-w-[70px] text-right">₹ {fmt(oldRegimeTax.cess)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal text-[#667085]">Credits / Refund</span>
                  <div className="flex gap-8">
                    <span className="text-xs font-normal text-[#101828] min-w-[70px] text-right">₹ {fmt(newRegimeTax.taxCredits)} / ₹ {fmt(newRegimeTax.refundDue)}</span>
                    <span className="text-xs font-normal text-[#101828] min-w-[70px] text-right">₹ {fmt(oldRegimeTax.taxCredits)} / ₹ {fmt(oldRegimeTax.refundDue)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                  <span className="text-sm font-normal text-[#101828]">Take Home (Net)</span>
                  <div className="flex gap-8">
                    <span className="text-base font-normal text-[#027A48] min-w-[70px] text-right">₹ {fmt(newRegimeTax.netIncome)}</span>
                    <span className="text-base font-normal text-[#B42318] min-w-[70px] text-right">₹ {fmt(oldRegimeTax.netIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expert Call Box */}
              <div className="mt-6 bg-[#F5F8FF] border border-[#D1E0FF] rounded-[20px] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D1E0FF] flex items-center justify-center text-[#444CE7] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-normal text-[#101828] mb-0.5">Need expert help?</h4>
                  <p className="text-xs text-[#667085] mb-2">Plan your tax with our expert CA</p>
                  <Link href="/services/tax-planning">
                    <button className="text-sm font-normal text-[#444CE7] flex items-center gap-2 hover:gap-3 transition-all">
                      Request Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Computation */}
        <section className="mt-12" aria-labelledby="income-tax-computation">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="income-tax-computation" className="text-2xl font-normal tracking-tight text-[#101828]">
                Computation of Income and Income Tax
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Complete working for both regimes based on your current calculator inputs. EC and SHEC are not separately levied for AY {assessmentYear}; Health & Education Cess @ 4% is applied.
              </p>
            </div>
            <div className="rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-xs text-[#475467]">
              AY {assessmentYear}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderComputationCard("New Regime", newRegimeTax, betterRegime !== "Old Regime")}
            {renderComputationCard("Old Regime", oldRegimeTax, betterRegime !== "New Regime")}
          </div>
        </section>

        {/* Bottom Trust Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <Headphones className="w-5 h-5" />, label: "Expert CA Support", desc: "Get guidance from tax experts" },
            { icon: <Award className="w-5 h-5" />, label: "Current Slabs", desc: "Common AY 2026-27 cases" },
            { icon: <Lock className="w-5 h-5" />, label: "Secure & Private", desc: "Your data is fully encrypted" },
            { icon: <PieChart className="w-5 h-5" />, label: "Save & Compare", desc: "Save scenarios and compare later" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center text-[#101828] shrink-0">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h5 className="type-support font-normal text-[#101828]">{item.label}</h5>
                <p className="type-support text-[#667085]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Content */}
        <div className="mt-32">
          <CalculatorMiniBlog 
            features={[
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "AY 2026-27 Tax Planning",
                desc: "For AY 2026-27, the New Regime is optimized around the enhanced Section 87A rebate. Taxable income up to ₹12 lakh can result in zero tax."
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                iconBg: "bg-emerald-50 text-emerald-600",
                title: "Old Regime Benefits",
                desc: "If you have a home loan, pay high rent (HRA), or have major investments in PPF/LIC, the Old Regime may still be suitable."
              },
              {
                icon: <Target className="w-5 h-5" />,
                iconBg: "bg-amber-50 text-amber-600",
                title: "Tax Optimization",
                desc: "Our calculator compares both regimes using AY 2026-27 slabs. Special-rate income and complex house-property cases may need expert review."
              }
            ]}
            howItWorks={{
              title: "How Income Tax is Calculated (AY 2026-27)",
              description: `${TAX_TRANSITION_NOTE} This calculator is an estimate for common salary and other-income cases. Special-rate income, detailed house-property computation, surcharge relief, and business income may need separate review.`,
              steps: [
                { title: "Gross Total Income", desc: "Sum up salary, interest, rental income, and business profits." },
                { title: "Exemptions & Deductions", desc: "Apply salary standard deduction and eligible Old Regime deductions where allowed." },
                { title: "Slab Application", desc: "Apply the AY 2026-27 new-regime slabs: 0% up to 4L, 5% up to 8L, 10% up to 12L, 15% up to 16L, 20% up to 20L, 25% up to 24L, and 30% above 24L." }
              ]
            }}
            faqs={[
              { q: "What is the new 12L rebate in AY 2026-27?", a: "For AY 2026-27, if your taxable income is up to ₹12 lakh under the New Regime, Section 87A allows rebate up to ₹60,000, making your net tax zero before cess." },
              { q: "Is the standard deduction for everyone?", a: "No. It applies to salary or pension income. It should not be applied to pure business, capital gains, or other non-salary income." },
              { q: "Can I claim HRA in the New Regime?", a: "No, HRA exemption is not available in the New Tax Regime. It is only available in the Old Tax Regime." }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
