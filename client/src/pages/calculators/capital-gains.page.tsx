import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateCapitalGains } from "@/lib/tax-calculations";
import { TrendingUp, Coins, Calendar, Target, AlertCircle, Clock, Info, Calculator, IndianRupee, Receipt } from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema, getFAQSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function CapitalGainsCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    if (purchasePrice > 0 && salePrice > 0 && purchaseDate && saleDate && assetType) {
      const cgResult = calculateCapitalGains(
        purchasePrice,
        salePrice,
        new Date(purchaseDate),
        new Date(saleDate),
        assetType as 'equity' | 'property' | 'gold' | 'bonds'
      );
      setResult(cgResult);
    }
  };

  const assetTypes = [
    { value: 'equity', label: 'Equity Shares/Mutual Funds', ltcg: '1 year', stcgRate: '20%', ltcgRate: '12.5%' },
    { value: 'property', label: 'Real Estate/Property', ltcg: '2 years', stcgRate: '20%', ltcgRate: '12.5%' },
    { value: 'gold', label: 'Gold/Precious Metals', ltcg: '2 years', stcgRate: '20%', ltcgRate: '12.5%' },
    { value: 'bonds', label: 'Bonds/Debentures', ltcg: '2 years', stcgRate: '20%', ltcgRate: '12.5%' }
  ];

  const selectedAssetType = assetTypes.find(type => type.value === assetType);

  const faqSchema = getFAQSchema([
    {
      question: "What is the difference between STCG and LTCG?",
      answer: "Short-term capital gains (STCG) apply when assets are held for less than the specified period (1 year for equity, 2 years for property). Long-term capital gains (LTCG) apply for longer holding periods."
    },
    {
      question: "What are the new capital gains tax rates for 2025?",
      answer: "From Budget 2024, LTCG tax rate is 12.5% (without indexation) and STCG on equity is 20%. Property and other assets have different rates."
    },
    {
      question: "Is there any exemption on capital gains?",
      answer: "Yes, LTCG up to \u20B91.25 lakh per year is exempt. You can also claim exemptions under sections 54, 54F, 54EC by reinvesting gains."
    }
  ]);

  return (
    <>
      <EnhancedSEO
        title="Capital Gains Tax Calculator 2025 | STCG & LTCG Calculator"
        description="Calculate capital gains tax on stocks, mutual funds, property & gold. Updated with Budget 2024 rates. Know STCG & LTCG tax rates, exemptions & holding periods."
        keywords={[
          'capital gains calculator',
          'LTCG calculator',
          'STCG calculator',
          'capital gains tax 2025',
          'property capital gains',
          'equity capital gains',
          'section 54 exemption',
          'capital gains tax rates'
        ]}
        url="https://myeca.in/calculators/capital-gains"
        type="website"
        jsonLd={faqSchema}
      />
    <TooltipProvider>
      <div className="calculator-page min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <CalculatorHeader
            icon={TrendingUp}
            title="Capital Gains Calculator"
            subtitle="Calculate Short-Term and Long-Term Capital Gains tax on your investments. Updated with latest FY 2024-25 tax rates."
            color="green"
            align="center"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Investment Details
                    </CardTitle>
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Enter your investment transaction details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="asset-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Asset Type
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select the type of asset you sold</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={assetType} onValueChange={setAssetType}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {assetTypes.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="purchase-price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purchase Price
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the price at which you bought the asset</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <Input
                        id="purchase-price"
                        type="number"
                        value={purchasePrice || ''}
                        onChange={(e) => setPurchasePrice(Number(e.target.value))}
                        placeholder="0"
                        className="pl-10 text-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="sale-price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sale Price
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the price at which you sold the asset</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <Input
                        id="sale-price"
                        type="number"
                        value={salePrice || ''}
                        onChange={(e) => setSalePrice(Number(e.target.value))}
                        placeholder="0"
                        className="pl-10 text-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchase-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purchase Date
                      </Label>
                      <Input
                        id="purchase-date"
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="mt-1 text-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sale-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sale Date
                      </Label>
                      <Input
                        id="sale-date"
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        className="mt-1 text-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCalculate} 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    disabled={!purchasePrice || !salePrice || !purchaseDate || !saleDate || !assetType}
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculate Capital Gains
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Capital Gains Results
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {result && (
                        <CalculatorExport 
                          title="Capital Gains Calculation"
                          data={{
                            "Asset Type": selectedAssetType?.label || assetType,
                            "Purchase Price": purchasePrice,
                            "Sale Price": salePrice,
                            "Holding Period": `${result.holdingPeriod} years`,
                            "Capital Gain": result.capitalGain,
                            "Gain Type": result.gainType,
                            "Tax Rate": `${result.taxRate}%`,
                            "Tax Payable": result.taxPayable,
                            "Net Gain": result.netGain
                          }}
                        />
                      )}
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your capital gains calculation breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`p-4 rounded-xl border ${
                            result.capitalGain >= 0 
                              ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700' 
                              : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className={`w-5 h-5 ${result.capitalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                            <span className={`text-sm font-medium ${result.capitalGain >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                              Capital Gain
                            </span>
                          </div>
                          <p className={`text-2xl font-bold ${result.capitalGain >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                            {result.capitalGain >= 0 ? '+' : ''}\u20B9{result.capitalGain.toLocaleString()}
                          </p>
                        </motion.div>
                        
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Holding Period</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{result.holdingPeriod} years</p>
                        </motion.div>
                      </div>

                      {/* Gain Type Badge */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-center"
                      >
                        <Badge className={`text-lg px-6 py-2 ${
                          result.gainType === 'LTCG' 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' 
                            : 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
                        }`}>
                          {result.gainType} - {result.taxRate}% Tax
                        </Badge>
                      </motion.div>

                      <Separator className="dark:border-gray-700" />

                      {/* Calculation Breakdown */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          <Calculator className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                          Transaction Breakdown
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 dark:text-gray-400">Purchase Price</span>
                            <span className="font-semibold text-gray-900 dark:text-white">\u20B9{purchasePrice.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Sale Price</span>
                            <span className="font-semibold text-gray-900 dark:text-white">\u20B9{salePrice.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Capital Gain</span>
                            <span className={`font-semibold ${result.capitalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {result.capitalGain >= 0 ? '+' : ''}\u20B9{result.capitalGain.toLocaleString()}
                            </span>
                          </div>
                          
                          {/* LTCG Exemption - show only for equity with positive gains */}
                          {result.ltcgExemption > 0 && (
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                              <span className="text-gray-600 dark:text-gray-400">LTCG Exemption (u/s 112A)</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">-\u20B9{result.ltcgExemption.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {/* Taxable Gain after exemption */}
                          {result.ltcgExemption > 0 && (
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                              <span className="text-gray-600 dark:text-gray-400">Taxable Gain</span>
                              <span className="font-semibold text-gray-900 dark:text-white">\u20B9{result.taxableGain.toLocaleString()}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Tax Payable (incl. 4% cess)</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">-\u20B9{result.taxPayable.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 dark:border-gray-600">
                            <span className="font-medium text-gray-900 dark:text-white">Net Gain After Tax</span>
                            <span className={`font-bold text-lg ${result.netGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {result.netGain >= 0 ? '+' : ''}\u20B9{result.netGain.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Tax Information Alert */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="space-y-2">
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">Tax Details</h5>
                            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                              <p><strong>Type:</strong> {result.gainType === 'LTCG' ? 'Long-Term Capital Gains' : 'Short-Term Capital Gains'}</p>
                              <p><strong>Tax Rate:</strong> {result.taxRate}% + 4% Cess = {(result.taxRate * 1.04).toFixed(2)}% effective</p>
                              <p><strong>Holding Period:</strong> {result.holdingPeriodDays} days ({result.holdingPeriod} year{result.holdingPeriod !== 1 ? 's' : ''})</p>
                              {result.ltcgExemption > 0 && (
                                <p><strong>LTCG Exemption:</strong> \u20B9{result.ltcgExemption.toLocaleString()} (Section 112A)</p>
                              )}
                              {selectedAssetType && (
                                <p><strong>Asset Class:</strong> {selectedAssetType.label}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full inline-block mb-4">
                        <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Enter investment details to calculate capital gains
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Select asset type, prices, and dates to see tax calculation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Capital Gains Information Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Tax Rates Card */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 transition-colors duration-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Receipt className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                Tax Rates FY 2024-25
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-start mb-2">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Equity LTCG:</strong> 12.5% (holding &gt; 1 year)</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Equity STCG:</strong> 20% (holding ≤ 1 year)</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Property/Gold LTCG:</strong> 12.5% (holding &gt; 2 years)</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span><strong>Property/Gold STCG:</strong> As per income slab (holding ≤ 2 years)</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Important Notes Card */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 transition-colors duration-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                Important Notes
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-start mb-2">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>\u20B91.25 lakh exemption on LTCG for equity</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>Indexation benefit removed from July 2024</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>Set-off of losses allowed within same category</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>Securities Transaction Tax applicable on equity</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Detailed Tax Rates Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8"
          >
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Capital Gains Tax Rates (FY 2024-25)
                  </CardTitle>
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Latest Rates
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Current tax rates and holding periods for different asset classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Asset Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">LTCG Period</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">STCG Rate</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">LTCG Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {assetTypes.map((type, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{type.label}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{type.ltcg}</td>
                          <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{type.stcgRate}</td>
                          <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">{type.ltcgRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Budget 2024 Update:</strong> LTCG rates reduced from 20% to 12.5% for most assets. 
                      STCG rates increased from 15% to 20% for equity shares.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700"
                  >
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Important:</strong> Additional 4% Health & Education Cess applies on capital gains tax. 
                      Indexation benefit has been removed for most asset classes from July 2024.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
    </>
  );
}