import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { calculateIncomeTax } from "@/lib/tax-calculations";

interface TaxCalculationFormProps {
  formData: any;
  onChange: (data: any) => void;
}

export default function TaxCalculationForm({ formData, onChange }: TaxCalculationFormProps) {
  const [calculation, setCalculation] = useState<any>(null);
  const [selectedRegime, setSelectedRegime] = useState<'old' | 'new'>('new');

  useEffect(() => {
    calculateTax();
  }, [formData, selectedRegime]);

  const calculateTax = () => {
    const { incomeDetails, deductions } = formData;
    
    if (!incomeDetails) return;

    const totalIncome = 
      parseFloat(incomeDetails.salaryIncome || "0") +
      parseFloat(incomeDetails.bonusIncome || "0") +
      parseFloat(incomeDetails.interestIncome || "0") +
      parseFloat(incomeDetails.dividendIncome || "0") +
      parseFloat(incomeDetails.otherIncome || "0");

    const totalDeductions = selectedRegime === 'old' ? (
      parseFloat(deductions?.section80C || "0") +
      parseFloat(deductions?.section80D || "0") +
      parseFloat(deductions?.section80G || "0") +
      parseFloat(deductions?.section80E || "0") +
      parseFloat(deductions?.section24 || "0") +
      parseFloat(deductions?.standardDeduction || "50000") +
      parseFloat(deductions?.professionalTax || "0") +
      parseFloat(deductions?.nps || "0") +
      parseFloat(deductions?.otherDeductions || "0")
    ) : 50000; // Only standard deduction in new regime

    const result = calculateIncomeTax({
      income: totalIncome,
      regime: selectedRegime,
      deductions: totalDeductions
    });

    setCalculation(result);
    onChange({
      regime: selectedRegime,
      totalIncome,
      totalDeductions,
      calculation: result
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  const oldRegimeCalculation = () => {
    const { incomeDetails, deductions } = formData;
    const totalIncome = 
      parseFloat(incomeDetails?.salaryIncome || "0") +
      parseFloat(incomeDetails?.bonusIncome || "0") +
      parseFloat(incomeDetails?.interestIncome || "0") +
      parseFloat(incomeDetails?.dividendIncome || "0") +
      parseFloat(incomeDetails?.otherIncome || "0");
    
    const totalDeductions = 
      parseFloat(deductions?.section80C || "0") +
      parseFloat(deductions?.section80D || "0") +
      parseFloat(deductions?.section80G || "0") +
      parseFloat(deductions?.section80E || "0") +
      parseFloat(deductions?.section24 || "0") +
      parseFloat(deductions?.standardDeduction || "50000") +
      parseFloat(deductions?.professionalTax || "0") +
      parseFloat(deductions?.nps || "0") +
      parseFloat(deductions?.otherDeductions || "0");

    return calculateIncomeTax({
      income: totalIncome,
      regime: 'old',
      deductions: totalDeductions
    });
  };

  const newRegimeCalculation = () => {
    const { incomeDetails } = formData;
    const totalIncome = 
      parseFloat(incomeDetails?.salaryIncome || "0") +
      parseFloat(incomeDetails?.bonusIncome || "0") +
      parseFloat(incomeDetails?.interestIncome || "0") +
      parseFloat(incomeDetails?.dividendIncome || "0") +
      parseFloat(incomeDetails?.otherIncome || "0");

    return calculateIncomeTax({
      income: totalIncome,
      regime: 'new',
      deductions: 50000 // Only standard deduction
    });
  };

  const oldRegime = oldRegimeCalculation();
  const newRegime = newRegimeCalculation();
  const savings = oldRegime.taxPayable - newRegime.taxPayable;

  return (
    <div className="space-y-6">
      {/* Tax Regime Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Tax Regime Comparison
          </CardTitle>
          <CardDescription>
            Compare old vs new tax regime to choose the best option
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Regime */}
            <Card 
              className={`cursor-pointer transition-all ${selectedRegime === 'old' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedRegime('old')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Old Tax Regime</CardTitle>
                  {selectedRegime === 'old' && <Badge variant="default">Selected</Badge>}
                </div>
                <CardDescription>With all deductions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Income</span>
                  <span className="font-medium">\u20B9{formatCurrency(oldRegime.grossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Deductions</span>
                  <span className="font-medium text-green-600">
                    -\u20B9{formatCurrency(oldRegime.grossIncome - oldRegime.taxableIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxable Income</span>
                  <span className="font-medium">\u20B9{formatCurrency(oldRegime.taxableIncome)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Tax Payable</span>
                  <span className="font-bold text-lg text-red-600">
                    \u20B9{formatCurrency(oldRegime.taxPayable)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Net Income</span>
                  <span className="font-bold text-green-600">
                    \u20B9{formatCurrency(oldRegime.netIncome)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* New Regime */}
            <Card 
              className={`cursor-pointer transition-all ${selectedRegime === 'new' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
              onClick={() => setSelectedRegime('new')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">New Tax Regime</CardTitle>
                  {selectedRegime === 'new' && <Badge variant="default">Selected</Badge>}
                </div>
                <CardDescription>Lower rates, limited deductions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Income</span>
                  <span className="font-medium">\u20B9{formatCurrency(newRegime.grossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Standard Deduction</span>
                  <span className="font-medium text-green-600">
                    -\u20B9{formatCurrency(50000)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxable Income</span>
                  <span className="font-medium">\u20B9{formatCurrency(newRegime.taxableIncome)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Tax Payable</span>
                  <span className="font-bold text-lg text-red-600">
                    \u20B9{formatCurrency(newRegime.taxPayable)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Net Income</span>
                  <span className="font-bold text-green-600">
                    \u20B9{formatCurrency(newRegime.netIncome)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Indicator */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              {savings > 0 ? (
                <>
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    Save \u20B9{formatCurrency(Math.abs(savings))} with Old Regime
                  </span>
                </>
              ) : savings < 0 ? (
                <>
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    Save \u20B9{formatCurrency(Math.abs(savings))} with New Regime
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-lg font-semibold text-yellow-600">
                    Both regimes result in same tax
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tax Breakdown */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Tax Calculation Breakdown ({selectedRegime.charAt(0).toUpperCase() + selectedRegime.slice(1)} Regime)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Income Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-blue-600">Gross Income</p>
                  <p className="text-lg font-semibold text-blue-900">
                    \u20B9{formatCurrency(calculation.grossIncome)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Deductions</p>
                  <p className="text-lg font-semibold text-green-600">
                    \u20B9{formatCurrency(calculation.grossIncome - calculation.taxableIncome)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Taxable Income</p>
                  <p className="text-lg font-semibold text-blue-900">
                    \u20B9{formatCurrency(calculation.taxableIncome)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Tax Payable</p>
                  <p className="text-lg font-semibold text-red-600">
                    \u20B9{formatCurrency(calculation.taxPayable)}
                  </p>
                </div>
              </div>

              {/* Tax Slab Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Tax Slab Breakdown:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRegime === 'old' ? (
                    <>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Up to \u20B92,50,000 (0%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab1)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>\u20B92,50,001 - \u20B95,00,000 (5%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>\u20B95,00,001 - \u20B910,00,000 (20%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab3)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Above \u20B910,00,000 (30%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab4)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Up to \u20B93,00,000 (0%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab1)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>\u20B93,00,001 - \u20B96,00,000 (5%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>\u20B96,00,001 - \u20B99,00,000 (10%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab3)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Above \u20B99,00,000 (15%/20%/30%)</span>
                        <span>\u20B9{formatCurrency(calculation.breakdown.slab4)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Final Summary */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Final Tax Liability</p>
                    <p className="text-sm text-gray-600">After all calculations and deductions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      \u20B9{formatCurrency(calculation.taxPayable)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Net Income: \u20B9{formatCurrency(calculation.netIncome)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}