import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Coins, PieChart, Target, AlertTriangle } from "lucide-react";

interface TaxSummaryProps {
  formData: any;
}

export default function TaxSummaryDashboard({ formData }: TaxSummaryProps) {
  // Calculate comprehensive tax metrics
  const calculateTaxMetrics = () => {
    const salary = parseFloat(formData.incomeDetails?.salary || "0");
    const businessIncome = parseFloat(formData.businessIncome?.netProfit || "0");
    const capitalGains = formData.capitalGains?.gains?.reduce((total: number, gain: any) => {
      const saleValue = parseFloat(gain.saleValue || "0");
      const purchaseValue = parseFloat(gain.purchaseValue || "0");
      const improvementCost = parseFloat(gain.improvementCost || "0");
      const exemption = parseFloat(gain.exemptionClaimed || "0");
      return total + Math.max(0, saleValue - purchaseValue - improvementCost - exemption);
    }, 0) || 0;
    
    const totalIncome = salary + businessIncome + capitalGains;
    const deductions = parseFloat(formData.deductions?.section80C || "0") + 
                      parseFloat(formData.deductions?.section80D || "0");
    
    const taxableIncome = Math.max(0, totalIncome - deductions);
    
    // Estimate tax liability (simplified)
    let estimatedTax = 0;
    if (taxableIncome > 1500000) {
      estimatedTax = 75000 + 112500 + (taxableIncome - 1500000) * 0.3;
    } else if (taxableIncome > 1200000) {
      estimatedTax = 75000 + (taxableIncome - 1200000) * 0.2;
    } else if (taxableIncome > 900000) {
      estimatedTax = 30000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome > 600000) {
      estimatedTax = (taxableIncome - 600000) * 0.1;
    } else if (taxableIncome > 300000) {
      estimatedTax = (taxableIncome - 300000) * 0.05;
    }
    
    // Add cess
    estimatedTax = estimatedTax * 1.04;
    
    const effectiveRate = totalIncome > 0 ? (estimatedTax / totalIncome) * 100 : 0;
    const marginalRate = getMarginalRate(taxableIncome);
    
    return {
      totalIncome,
      salary,
      businessIncome,
      capitalGains,
      deductions,
      taxableIncome,
      estimatedTax,
      effectiveRate,
      marginalRate,
      netIncome: totalIncome - estimatedTax
    };
  };

  const getMarginalRate = (taxableIncome: number) => {
    if (taxableIncome > 1500000) return 31.2; // 30% + 4% cess
    if (taxableIncome > 1200000) return 20.8; // 20% + 4% cess
    if (taxableIncome > 900000) return 15.6; // 15% + 4% cess
    if (taxableIncome > 600000) return 10.4; // 10% + 4% cess
    if (taxableIncome > 300000) return 5.2; // 5% + 4% cess
    return 0;
  };

  const getTaxOptimizationTips = (metrics: any) => {
    const tips = [];
    
    if (metrics.deductions < 150000) {
      tips.push({
        type: 'opportunity',
        title: 'Maximize 80C Deductions',
        description: `You can save up to \u20B9${((150000 - (parseFloat(formData.deductions?.section80C || "0"))) * metrics.marginalRate / 100).toLocaleString()} by maximizing Section 80C deductions`,
        icon: Target
      });
    }
    
    if (metrics.capitalGains > 100000 && !formData.capitalGains?.gains?.some((g: any) => parseFloat(g.exemptionClaimed || "0") > 0)) {
      tips.push({
        type: 'warning',
        title: 'Capital Gains Exemption',
        description: 'Consider reinvestment exemptions under Section 54 for property gains',
        icon: AlertTriangle
      });
    }
    
    if (metrics.salary > 1500000) {
      tips.push({
        type: 'info',
        title: 'Tax Planning',
        description: 'Consider salary restructuring and additional investments for tax optimization',
        icon: TrendingUp
      });
    }
    
    return tips;
  };

  const metrics = calculateTaxMetrics();
  const tips = getTaxOptimizationTips(metrics);
  
  const formatCurrency = (amount: number) => {
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  const getIncomeBreakdown = () => [
    { label: 'Salary Income', value: metrics.salary, color: 'bg-blue-500' },
    { label: 'Business Income', value: metrics.businessIncome, color: 'bg-green-500' },
    { label: 'Capital Gains', value: metrics.capitalGains, color: 'bg-purple-500' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.totalIncome)}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxable Income</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.taxableIncome)}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimated Tax</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(metrics.estimatedTax)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.netIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Tax Rate Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Effective Tax Rate</span>
                <span className="font-semibold">{metrics.effectiveRate.toFixed(2)}%</span>
              </div>
              <Progress value={metrics.effectiveRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Marginal Tax Rate</span>
                <span className="font-semibold">{metrics.marginalRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.marginalRate} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Tax Efficiency</p>
              <p className="text-lg font-bold text-blue-900">
                {metrics.effectiveRate < 10 ? 'Excellent' : 
                 metrics.effectiveRate < 20 ? 'Good' : 
                 metrics.effectiveRate < 30 ? 'Average' : 'Needs Optimization'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Income Composition</CardTitle>
            <CardDescription>Breakdown of your income sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getIncomeBreakdown().map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-semibold">{formatCurrency(item.value)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.value / metrics.totalIncome) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {((item.value / metrics.totalIncome) * 100).toFixed(1)}% of total income
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tax Optimization Tips */}
      {tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Optimization Opportunities</CardTitle>
            <CardDescription>Personalized recommendations to reduce your tax liability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tips.map((tip, index) => {
              const IconComponent = tip.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${
                    tip.type === 'opportunity' ? 'text-green-600' :
                    tip.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                  </div>
                  <Badge variant={
                    tip.type === 'opportunity' ? 'default' :
                    tip.type === 'warning' ? 'destructive' : 'secondary'
                  }>
                    {tip.type}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Deduction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Deduction Summary</CardTitle>
          <CardDescription>Your claimed deductions and potential savings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Deductions</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(metrics.deductions)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Tax Saved</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(metrics.deductions * (metrics.marginalRate / 100))}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">Potential Additional Savings</p>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(Math.max(0, (150000 - metrics.deductions) * (metrics.marginalRate / 100)))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}