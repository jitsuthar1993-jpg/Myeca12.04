import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, RefreshCcw, DollarSign, Calendar, Percent } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import SEO from "@/components/SEO";

// Types for simulation parameters
interface SimulationParams {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  expectedReturn: number;
  inflationRate: number;
}

export default function PortfolioSimulatorPage() {
  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 100000,
    monthlyContribution: 5000,
    years: 10,
    expectedReturn: 12,
    inflationRate: 6
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [finalValue, setFinalValue] = useState(0);
  const [investedAmount, setInvestedAmount] = useState(0);

  // Calculate projection whenever params change
  useEffect(() => {
    const data = [];
    let currentBalance = params.initialInvestment;
    let totalInvested = params.initialInvestment;
    const monthlyRate = params.expectedReturn / 100 / 12;
    const monthlyInflation = params.inflationRate / 100 / 12;

    for (let year = 0; year <= params.years; year++) {
      data.push({
        year: `Year ${year}`,
        balance: Math.round(currentBalance),
        invested: Math.round(totalInvested),
      });

      // Calculate for next 12 months
      if (year < params.years) {
        for (let month = 0; month < 12; month++) {
          currentBalance = (currentBalance + params.monthlyContribution) * (1 + monthlyRate);
          totalInvested += params.monthlyContribution;
        }
        // Adjust monthly contribution for inflation annually if needed (optional complexity)
        // For simplicity, we keep contribution constant but could scale it
      }
    }

    setChartData(data);
    setFinalValue(Math.round(currentBalance));
    setInvestedAmount(Math.round(totalInvested));
  }, [params]);

  const handleParamChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Portfolio Simulator - MyeCA"
        description="Project your future wealth with our interactive portfolio simulation tool."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Simulator</h1>
          <p className="text-slate-600">Visualize the power of compounding and plan your financial future</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Simulation Parameters</CardTitle>
            <CardDescription>Adjust the inputs to see how your portfolio grows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="initial">Initial Investment</Label>
                <span className="text-sm font-medium text-blue-600">{formatCurrency(params.initialInvestment)}</span>
              </div>
              <div className="flex gap-4 items-center">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <Slider
                  colorTheme="blue"
                  id="initial"
                  min={0}
                  max={5000000}
                  step={10000}
                  value={[params.initialInvestment]}
                  onValueChange={(val) => handleParamChange('initialInvestment', val[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="monthly">Monthly Contribution</Label>
                <span className="text-sm font-medium text-blue-600">{formatCurrency(params.monthlyContribution)}</span>
              </div>
              <div className="flex gap-4 items-center">
                <RefreshCcw className="w-4 h-4 text-slate-400" />
                <Slider
                  colorTheme="blue"
                  id="monthly"
                  min={0}
                  max={200000}
                  step={1000}
                  value={[params.monthlyContribution]}
                  onValueChange={(val) => handleParamChange('monthlyContribution', val[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="years">Time Horizon (Years)</Label>
                <span className="text-sm font-medium text-blue-600">{params.years} Years</span>
              </div>
              <div className="flex gap-4 items-center">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Slider
                  colorTheme="blue"
                  id="years"
                  min={1}
                  max={40}
                  step={1}
                  value={[params.years]}
                  onValueChange={(val) => handleParamChange('years', val[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="return">Expected Return (Annual %)</Label>
                <span className="text-sm font-medium text-green-600">{params.expectedReturn}%</span>
              </div>
              <div className="flex gap-4 items-center">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <Slider
                  colorTheme="green"
                  id="return"
                  min={1}
                  max={30}
                  step={0.5}
                  value={[params.expectedReturn]}
                  onValueChange={(val) => handleParamChange('expectedReturn', val[0])}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-4">
            <p className="text-xs text-slate-500">
              *Projections are based on constant returns and do not account for market volatility or taxes.
            </p>
          </CardFooter>
        </Card>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-blue-600 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(investedAmount)}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-green-600 mb-1">Estimated Returns</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(finalValue - investedAmount)}</p>
              </CardContent>
            </Card>
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-indigo-600 mb-1">Future Value</p>
                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(finalValue)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Projection</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" />
                  <YAxis 
                    tickFormatter={(value) => `\u20B9${value/100000}L`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#1e293b' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    name="Projected Value"
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invested" 
                    name="Invested Amount"
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorInvested)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
