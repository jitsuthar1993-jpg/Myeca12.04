import { useState } from "react";
import { useLocation } from "wouter";
import { PiggyBank } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateEnhancedFD, formatCurrency } from "@/lib/enhanced-calculator-utils";
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard, { CalcInputGroup } from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar, { CalcResultRow } from "@/features/calculators/components/CalcGlassSidebar";

const defaults = { principal: "100000", rate: "6.5", years: "5", frequency: 4, taxRate: 30 };

export default function EnhancedFDCalculator() {
  const [location] = useLocation();
  const enhanced = location.split("?")[0] === "/calculators/fd-enhanced";
  const seo = getSEOConfig(enhanced ? "/calculators/fd-enhanced" : "/calculators/fd");
  const [principalInput, setPrincipalInput] = useState(defaults.principal);
  const [rateInput, setRateInput] = useState(defaults.rate);
  const [yearsInput, setYearsInput] = useState(defaults.years);
  const [frequency, setFrequency] = useState(defaults.frequency);
  const [taxRate, setTaxRate] = useState(defaults.taxRate);
  const principal = Number(principalInput), rate = Number(rateInput), years = Number(yearsInput);
  const principalError = principalInput === "" ? "Enter a principal amount." : principal < 0 || principal > 100_000_000 ? "Enter an amount from ₹0 to ₹10 crore." : "";
  const rateError = rateInput === "" ? "Enter an interest rate." : rate < 0 || rate > 100 ? "Enter a rate from 0% to 100%." : "";
  const yearsError = yearsInput === "" ? "Enter a tenure." : !Number.isInteger(years) || years < 1 || years > 100 ? "Enter a whole number from 1 to 100 years." : "";
  const valid = !principalError && !rateError && !yearsError;
  const result = valid ? calculateEnhancedFD(principal, rate, years, frequency, taxRate) : null;
  const reset = () => { setPrincipalInput(defaults.principal); setRateInput(defaults.rate); setYearsInput(defaults.years); setFrequency(defaults.frequency); setTaxRate(defaults.taxRate); };

  return <>
    <MetaSEO title={seo?.title ?? "FD Calculator"} description={seo?.description ?? "Estimate FD maturity."} keywords={seo?.keywords} type={seo?.type} calculatorData={seo?.calculatorData} breadcrumbs={seo?.breadcrumbs} />
    <CalcHero title={enhanced ? "Enhanced FD Planner" : "FD Calculator"} description="Estimate fixed-deposit maturity using your rate, tenure, compounding and tax assumptions." category="Investment Tools" icon={<PiggyBank className="h-6 w-6" />} variant="indigo" breadcrumbItems={[{ name: enhanced ? "Enhanced FD" : "FD Calculator" }]} compact />
    <CalcLayout variant="indigo" complianceFacts={[
      { title: "Rate assumption", content: "Verify the offered rate and product terms directly with the bank." },
      { title: "Tax estimate", content: "The selected tax rate is applied to projected interest and is not a TDS calculation." },
      { title: "Product terms", content: "Premature-withdrawal penalties and product-specific conditions are excluded." },
    ]} sidebar={<CalcGlassSidebar title="Investment Summary"><div className="space-y-4">
      <div role="status" aria-live="polite" className="text-sm text-slate-700">{result ? `Estimated maturity value ${formatCurrency(result.maturityValue)}. Estimated interest ${formatCurrency(result.interest)}.` : "Enter valid assumptions to see an estimate."}</div>
      {result && <><CalcResultRow label="Principal invested" value={formatCurrency(result.principal)} />
      <CalcResultRow label="Estimated interest" value={formatCurrency(result.interest)} variant="warning" />
      <CalcResultRow label="Maturity value" value={formatCurrency(result.maturityValue)} variant="highlight" />
      <CalcResultRow label="Maturity less estimated tax" value={formatCurrency(result.postTaxReturns)} variant="success" /></>}
    </div></CalcGlassSidebar>}>
      <div className="space-y-8">
        <CalcInputCard title="Deposit assumptions"><div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CalcInputGroup label="Principal amount" badgeValue={valid ? formatCurrency(principal) : "—"}><Input aria-label="Principal amount" aria-invalid={!!principalError} aria-describedby={principalError ? "fd-principal-error" : undefined} type="number" min="0" max="100000000" step="1000" value={principalInput} onChange={e => setPrincipalInput(e.target.value)} />{principalError && <p id="fd-principal-error" role="alert" className="text-sm text-red-600">{principalError}</p>}</CalcInputGroup>
          <CalcInputGroup label="Interest rate" badgeValue={rateInput ? `${rateInput}%` : "—"}><Input aria-label="Interest rate" aria-invalid={!!rateError} aria-describedby={rateError ? "fd-rate-error" : undefined} type="number" min="0" max="100" step="0.1" value={rateInput} onChange={e => setRateInput(e.target.value)} />{rateError && <p id="fd-rate-error" role="alert" className="text-sm text-red-600">{rateError}</p>}</CalcInputGroup>
          <CalcInputGroup label="Tenure in years" badgeValue={yearsInput ? `${yearsInput} years` : "—"}><Input aria-label="Tenure in years" aria-invalid={!!yearsError} aria-describedby={yearsError ? "fd-years-error" : undefined} type="number" min="1" max="100" step="1" value={yearsInput} onChange={e => setYearsInput(e.target.value)} />{yearsError && <p id="fd-years-error" role="alert" className="text-sm text-red-600">{yearsError}</p>}</CalcInputGroup>
          <div className="space-y-2"><Label id="fd-frequency-label">Compounding frequency</Label><Select value={String(frequency)} onValueChange={value => setFrequency(Number(value))}><SelectTrigger aria-labelledby="fd-frequency-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Annually</SelectItem><SelectItem value="2">Half-yearly</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label id="fd-tax-label">Marginal tax-rate assumption</Label><Select value={String(taxRate)} onValueChange={value => setTaxRate(Number(value))}><SelectTrigger aria-labelledby="fd-tax-label"><SelectValue /></SelectTrigger><SelectContent>{[0,5,20,30].map(value => <SelectItem key={value} value={String(value)}>{value}%</SelectItem>)}</SelectContent></Select></div>
        </div><Button className="mt-6" type="button" variant="outline" onClick={reset} aria-label="Reset calculator">Reset calculator</Button></CalcInputCard>
        <CalcInputCard title="Projection assumptions"><div className="space-y-3 text-sm text-slate-600"><p>The rate entered is an assumption, not a live bank rate. Verify it with the bank.</p><p>The tax adjustment subtracts the selected marginal rate from total projected interest at maturity. It is a simplified liability estimate, not a tax or bank quote and not a TDS calculation.</p><p>Compounding, premature-withdrawal rules and other product terms vary by deposit.</p></div></CalcInputCard>
      </div>
    </CalcLayout>
  </>;
}
