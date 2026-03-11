import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { CalculatorChart } from "@/components/ui/calculator-chart";
import { AlertCircle, PiggyBank, TrendingUp, IndianRupee } from "lucide-react";
import { calculateWithdrawalPlan, WithdrawalFrequency } from "@/lib/withdrawal-planner";
import { formatCurrency } from "@/lib/enhanced-calculator-utils";

export default function WithdrawalPlannerPage() {
  const [principal, setPrincipal] = useState<number>(1000000);
  const [annualRate, setAnnualRate] = useState<number>(7.0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [frequency, setFrequency] = useState<WithdrawalFrequency>("monthly");
  const [years, setYears] = useState<number>(10);

  const result = useMemo(() => {
    return calculateWithdrawalPlan(principal, annualRate, withdrawalAmount, frequency, years);
  }, [principal, annualRate, withdrawalAmount, frequency, years]);

  const frequencyOptions: { value: WithdrawalFrequency; label: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  const chartData = result.schedule.map((entry) => ({
    year: `${entry.year}-${entry.period}`,
    investment: Math.max(0, entry.withdrawal),
    interestEarned: Math.max(0, entry.interestAccrued),
  }));

  return (
    <div className="calculator-page min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        <CalculatorHeader
          icon={PiggyBank}
          title="Fixed Income Withdrawal Planner"
          subtitle="Plan periodic withdrawals from fixed income with interest accrual, frequency control, and detailed projections."
          color="green"
          align="center"
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">Planner Inputs</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <PiggyBank className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <CardDescription>Enter your principal, interest rate, withdrawal amount, frequency, and duration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Principal */}
              <div className="space-y-2">
                <Label>Principal Amount (\u20B9)</Label>
                <Input
                  type="number"
                  min={0}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="text-lg"
                />
                <div className="grid grid-cols-3 gap-2">
                  {[100000, 500000, 1000000, 2500000, 5000000, 10000000].map((amt) => (
                    <Button key={amt} variant="outline" size="sm" onClick={() => setPrincipal(amt)} className="text-xs">
                      \u20B9{(amt / 100000).toFixed(0)}L
                    </Button>
                  ))}
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label>Annual Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                  className="text-lg"
                />
              </div>

              {/* Withdrawal Amount */}
              <div className="space-y-2">
                <Label>Withdrawal Amount per Period (\u20B9)</Label>
                <Input
                  type="number"
                  min={0}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Math.max(0, Number(e.target.value)))}
                  className="text-lg"
                />
              </div>

              {/* Withdrawal Frequency */}
              <div className="space-y-2">
                <Label>Withdrawal Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as WithdrawalFrequency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration (Years)</Label>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                  className="text-lg"
                />
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  If withdrawals exceed interest, the principal reduces and can eventually deplete. This planner caps the final withdrawal to avoid negative balances and indicates the depletion period.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Plan Summary</CardTitle>
              <CardDescription>Overview of totals, remaining balance, and key metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Starting Principal</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(Math.max(0, result.principal))}</p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Interest Accrued</p>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(Math.max(0, result.totalInterestAccrued))}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Total Withdrawn</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(Math.max(0, result.totalWithdrawn))}</p>
                    </div>
                    <PiggyBank className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Ending Balance</p>
                      <p className="text-2xl font-bold text-orange-900">{formatCurrency(Math.max(0, result.endingBalance))}</p>
                    </div>
                    <IndianRupee className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Key Metrics */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Withdrawal Frequency:</span>
                    <span className="font-semibold ml-2">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Periodic Rate:</span>
                    <span className="font-semibold ml-2">{(result.periodicRate * 100).toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Periods:</span>
                    <span className="font-semibold ml-2">{result.totalPeriods}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Depletion Status:</span>
                    <span className="font-semibold ml-2">{result.depleted ? `Depleted in period ${result.depletionPeriod}` : "Not Depleted"}</span>
                  </div>
                </div>
              </div>

              {/* Chart: Withdrawal vs Interest per Period */}
              <div className="h-64">
                <CalculatorChart
                  data={chartData}
                  type="bar"
                  title="Withdrawal vs Interest per Period"
                  height={240}
                />
              </div>

              {/* Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Period</th>
                      <th className="text-right p-2">Beginning Balance</th>
                      <th className="text-right p-2">Interest</th>
                      <th className="text-right p-2">Withdrawal</th>
                      <th className="text-right p-2">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.period} className="border-b hover:bg-gray-50">
                        <td className="p-2">Y{row.year} / P{row.period}</td>
                        <td className="text-right p-2">{formatCurrency(Math.max(0, row.beginningBalance))}</td>
                        <td className="text-right p-2 text-green-600">{formatCurrency(Math.max(0, row.interestAccrued))}</td>
                        <td className="text-right p-2 text-blue-600">{formatCurrency(Math.max(0, row.withdrawal))}</td>
                        <td className="text-right p-2 font-semibold">{formatCurrency(Math.max(0, row.endingBalance))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}