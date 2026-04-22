import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, Calculator, Percent, IndianRupee, Info, Zap, HelpCircle } from "lucide-react";
import { calculateEnhancedFD, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { CalculatorChart } from "@/components/ui/calculator-chart";
import { cn } from "@/lib/utils";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function EnhancedFDCalculator() {
  const seo = getSEOConfig('/calculators/fd-enhanced');
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState(4);
  const [taxRate, setTaxRate] = useState(30);
  const [bankSelected, setBankSelected] = useState('sbi');
  const [activeTab, setActiveTab] = useState('calculator');

  const result = calculateEnhancedFD(principal, rate, years, compoundingFrequency, taxRate);

  const banks = [
    { value: 'sbi', label: 'State Bank of India', rate: CURRENT_RATES.FD_RATES.SBI },
    { value: 'hdfc', label: 'HDFC Bank', rate: CURRENT_RATES.FD_RATES.HDFC },
    { value: 'icici', label: 'ICICI Bank', rate: CURRENT_RATES.FD_RATES.ICICI },
    { value: 'axis', label: 'Axis Bank', rate: CURRENT_RATES.FD_RATES.AXIS },
    { value: 'kotak', label: 'Kotak Mahindra Bank', rate: CURRENT_RATES.FD_RATES.KOTAK },
    { value: 'yes', label: 'Yes Bank', rate: CURRENT_RATES.FD_RATES.YES_BANK }
  ];

  const compoundingOptions = [
    { value: 1, label: 'Annually' },
    { value: 2, label: 'Half-yearly' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' }
  ];

  const handleBankChange = (bankValue: string) => {
    setBankSelected(bankValue);
    const selectedBank = banks.find(bank => bank.value === bankValue);
    if (selectedBank) {
      setRate(selectedBank.rate);
    }
  };

  const chartData = result.yearlyBreakdown.map(year => ({
    year: year.year,
    investment: principal,
    interestEarned: Math.max(0, year.interest)
  }));

  return (
    <>
      <MetaSEO
        title={seo?.title || "Enhanced FD Calculator 2025 | Bank Rates Comparison | MyeCA.in"}
        description={seo?.description || "Compare FD interest rates across major Indian banks. Plan your fixed deposits with tax-adjusted maturity calculations."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="Enhanced FD Planner"
        description="Compare real-time bank interest rates and calculate post-tax maturity returns with precision."
        category="Investment Tools"
        icon={<PiggyBank className="w-6 h-6" />}
        variant="indigo"
        breadcrumbItems={[{ name: "Enhanced FD" }]}
      />

      <CalcLayout
        variant="indigo"
        complianceFacts={[
          { title: "TDS on FD", content: "Banks deduct 10% TDS if interest income exceeds ₹40,000 (₹50,000 for seniors). Form 15G/H can be submitted to avoid this if eligible." },
          { title: "Section 80C", content: "5-Year Tax Saving FDs are eligible for deduction up to ₹1.5 Lakhs under Section 80C of the Income Tax Act." },
          { title: "DICGC Cover", content: "Your deposits in banks are insured up to ₹5 Lakhs (including principal and interest) by the DICGC." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Investment Summary">
            <div className="space-y-4">
              <CalcResultRow label="Principal Invested" value={formatCurrency(principal)} />
              <CalcResultRow label="Total Interest" value={formatCurrency(result.interest)} variant="warning" />
              <CalcResultRow label="Maturity Value" value={formatCurrency(result.maturityValue)} variant="highlight" className="pt-4 border-t border-white/20" />
              <CalcResultRow label="Post-Tax Returns" value={formatCurrency(result.postTaxReturns)} variant="success" />
              
              <div className="bg-white/30 rounded-xl p-4 mt-6 border border-white/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Yield Analysis</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Effective rate</p>
                    <p className="text-sm font-bold text-slate-800">{result.effectiveRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Total Tax</p>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(result.taxOnInterest)}</p>
                  </div>
                </div>
              </div>

              <Link href="/services/tax-consultation">
                <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Optimize FD Tax Now
                </button>
              </Link>
            </div>
          </CalcGlassSidebar>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100 rounded-2xl">
            <TabsTrigger value="calculator" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Calculator</TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Bank Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-8">
            <CalcInputCard title="Deposit Parameters">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Bank</Label>
                    <Select value={bankSelected} onValueChange={handleBankChange}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.value} value={bank.value}>
                            {bank.label} ({bank.rate}% p.a.)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <CalcInputGroup label="Principal Amount" badgeValue={formatCurrency(principal)}>
                    <Input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50 text-lg font-bold"
                    />
                  </CalcInputGroup>

                  <CalcInputGroup label="Interest Rate (%)" badgeValue={`${rate}%`}>
                    <Input
                      type="number"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50 text-lg font-bold"
                    />
                  </CalcInputGroup>
                </div>

                <div className="space-y-6">
                  <CalcInputGroup label="Tenure (Years)" badgeValue={`${years} Yrs`}>
                    <Input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50 text-lg font-bold"
                    />
                  </CalcInputGroup>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compounding</Label>
                    <Select value={compoundingFrequency.toString()} onValueChange={(value) => setCompoundingFrequency(Number(value))}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {compoundingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Your Tax Slab</Label>
                    <Select value={taxRate.toString()} onValueChange={(value) => setTaxRate(Number(value))}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Tax Exempt)</SelectItem>
                        <SelectItem value="5">5% (Slab 1)</SelectItem>
                        <SelectItem value="20">20% (Slab 2)</SelectItem>
                        <SelectItem value="30">30% (Slab 3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CalcInputCard>

            <CalcInputCard title="Growth Visualization">
              <div className="h-72 w-full mt-4">
                <CalculatorChart
                  data={chartData}
                  type="bar"
                  title="Year-wise FD Growth"
                  height={280}
                />
              </div>
            </CalcInputCard>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <CalcInputCard title="Market Rates Comparison">
              <p className="text-xs text-slate-500 font-medium mb-6">
                Projected returns for ₹{principal.toLocaleString()} over {years} years.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank</th>
                      <th className="text-center p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate</th>
                      <th className="text-right p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maturity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank) => {
                      const bankResult = calculateEnhancedFD(principal, bank.rate, years, compoundingFrequency, taxRate);
                      return (
                        <tr key={bank.value} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-800 text-sm">{bank.label}</td>
                          <td className="text-center p-4">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                              {bank.rate}%
                            </Badge>
                          </td>
                          <td className="text-right p-4 font-bold text-slate-900 text-sm">
                            {formatCurrency(bankResult.maturityValue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CalcInputCard>
          </TabsContent>
        </Tabs>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <Calculator className="w-5 h-5" />,
              iconBg: "bg-indigo-50 text-indigo-600",
              title: "Tax-Adjusted Yield",
              desc: "See your actual 'take-home' interest by factoring in your specific income tax slab."
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "Market Comparison",
              desc: "Quickly compare rates from top PSU and private banks to ensure you're getting the best deal."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Smart Compounding",
              desc: "Choose between monthly, quarterly, or annual compounding to match your specific bank scheme."
            }
          ]}
          howItWorks={{
            title: "Enhanced FD Math",
            description: "Our planner uses the official banking compounding formula with integrated tax slab processing.",
            steps: [
              { title: "Select Your Bank", desc: "Start with real-time rates or enter your own custom rate for precision." },
              { title: "Configure Compounding", desc: "Select the frequency at which your bank calculates interest (standard is quarterly)." },
              { title: "Review Net Returns", desc: "Check the final post-tax maturity value to understand your real wealth growth." }
            ]
          }}
          faqs={[
            { q: "Is FD interest taxed at a flat rate?", a: "No, FD interest is added to your total income and taxed as per your individual tax slab." },
            { q: "Can I avoid TDS on my FD?", a: "Yes, by submitting Form 15G or 15H if your total income is below the exemption limit." },
            { q: "What is the penalty for premature withdrawal?", a: "Most banks charge a penalty of 0.5% to 1% on the interest rate for the period the FD was held." }
          ]}
        />
      </CalcLayout>
    </>
  );
}