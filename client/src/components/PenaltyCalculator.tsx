import React, { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  AlertTriangle, 
  Calendar,
  IndianRupee,
  TrendingUp,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Comprehensive Penalty Data
const penaltySections = {
  gst: {
    title: "GST Compliance",
    color: "blue",
    items: {
      "gstr1": {
        name: "GSTR-1 (Monthly/Quarterly)",
        rate: 200, // Combined CGST + SGST (100+100)
        maxPenalty: 5000,
        frequency: "per day",
        description: "Late filing fee for outward supplies return."
      },
      "gstr3b": {
        name: "GSTR-3B (Monthly/QRMP)",
        rate: 50, // 25+25 for non-nil, small if nil
        maxPenalty: 10000,
        frequency: "per day",
        description: "Late filing fee for summary return and tax payment."
      },
      "gstr9": {
        name: "GSTR-9 (Annual Return)",
        rate: 200,
        maxPenalty: "0.5% of turnover",
        frequency: "per day",
        description: "Late filing of Annual GST return."
      }
    }
  },
  incomeTax: {
    title: "Income Tax & TDS",
    color: "emerald",
    items: {
      "tdsLate": {
        name: "TDS/TCS Late Deposit",
        rate: 1.5,
        isPercentage: true,
        frequency: "per month",
        description: "Interest on late payment of tax deducted at source."
      },
      "tdsReturn": {
        name: "TDS Statement (24Q/26Q)",
        rate: 200,
        maxPenalty: "Amount of TDS",
        frequency: "per day",
        description: "Late filing fee under Section 234E."
      },
      "itrLate": {
        name: "Income Tax Return (ITR)",
        rate: 5000,
        flat: true,
        frequency: "flat fee",
        description: "Late filing fee under Section 234F (Up to Rs. 5,000)."
      }
    }
  },
  mca: {
    title: "MCA / Company Law",
    color: "purple",
    items: {
      "aoc4": {
        name: "Form AOC-4 (Financials)",
        rate: 100,
        frequency: "per day",
        description: "Additional fee for late filing of financial statements."
      },
      "mgt7": {
        name: "Form MGT-7 (Annual Return)",
        rate: 100,
        frequency: "per day",
        description: "Additional fee for late filing of MGT-7/7A."
      },
      "kyc": {
        name: "DIR-3 KYC",
        rate: 5000,
        flat: true,
        frequency: "one-time",
        description: "Penalty for late submission of Director KYC."
      }
    }
  },
  fema: {
    title: "FEMA & Others",
    color: "orange",
    items: {
      "ecb2": {
        name: "ECB-2 Return",
        rate: 5000,
        flat: true,
        frequency: "per month delay",
        description: "Late Submission Charge (LSC) for FEMA reporting."
      },
      "flair": {
        name: "FLA Return",
        rate: 10000,
        flat: true,
        frequency: "indicative",
        description: "Penalty for late filing of Foreign Assets & Liabilities."
      }
    }
  }
};

export default function PenaltyCalculator() {
  const [activeTab, setActiveTab] = useState("gst");
  const [selectedItem, setSelectedItem] = useState("gstr1");
  const [delay, setDelay] = useState(15);
  const [amount, setAmount] = useState(50000);

  const calculation = useMemo(() => {
    const section = penaltySections[activeTab as keyof typeof penaltySections] as any;
    const config = section.items[selectedItem as keyof typeof section.items] as any;
    
    let penalty = 0;
    let label = "";

    if (!config) return { penalty: 0, label: "Select Item", config: null, section };

    if (config.isPercentage) {
      const months = Math.ceil(delay / 30) || 1;
      penalty = (amount * config.rate * months) / 100;
      label = `Interest (${config.rate}% for ${months} month/s)`;
    } else if (config.flat) {
      penalty = config.rate;
      label = "Fixed Penalty";
    } else {
      penalty = config.rate * delay;
      if (typeof config.maxPenalty === 'number' && penalty > config.maxPenalty) {
        penalty = config.maxPenalty;
      }
      label = `Cumulative Fee (${delay} days)`;
    }

    return { penalty, label, config, section };
  }, [activeTab, selectedItem, delay, amount]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Penalty <span className="text-blue-600">Estimator</span></h2>
          <p className="text-slate-500 font-medium">Predict your non-compliance costs with precision.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
           <ShieldAlert className="w-5 h-5 text-blue-600" />
           <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Regulatory Compliance v2.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(val) => {
                setActiveTab(val);
                setSelectedItem(Object.keys(penaltySections[val as keyof typeof penaltySections].items)[0]);
              }}>
                <div className="bg-slate-50/50 p-2 border-b border-slate-100">
                  <TabsList className="w-full bg-white/50 border border-slate-200 p-1 rounded-xl h-12">
                    {Object.entries(penaltySections).map(([key, section]) => (
                      <TabsTrigger 
                        key={key} 
                        value={key}
                        className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                      >
                        {section.title.split(' ')[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="p-8 space-y-8">
                  {/* Item Selection */}
                  <div className="space-y-4">
                    <Label className="text-slate-900 font-black text-sm uppercase tracking-widest">Select Compliance Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(penaltySections[activeTab as keyof typeof penaltySections].items).map(([key, item]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedItem(key)}
                          className={`p-4 rounded-2xl text-left transition-all border-2 ${
                            selectedItem === key 
                              ? 'border-blue-600 bg-blue-50/30' 
                              : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`text-xs font-black mb-1 ${selectedItem === key ? 'text-blue-600' : 'text-slate-400'}`}>
                            {item.frequency.toUpperCase()}
                          </div>
                          <div className="text-slate-900 font-bold text-sm leading-snug">{item.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delay Input */}
                  {!calculation.config.flat && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <Label className="text-slate-900 font-black text-sm uppercase tracking-widest">Delay Period (Days)</Label>
                        <div className="text-2xl font-black text-blue-600">{delay} <span className="text-sm font-medium text-slate-400">Days</span></div>
                      </div>
                      <Slider 
                        value={[delay]} 
                        onValueChange={(val) => setDelay(val[0])} 
                        max={180} 
                        step={1} 
                        className="py-4"
                      />
                      <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase">
                        <span>On Time</span>
                        <span>6 Months Delay</span>
                      </div>
                    </div>
                  )}

                  {/* Amount Input for Percentage */}
                  {calculation.config.isPercentage && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <Label className="text-slate-900 font-black text-sm uppercase tracking-widest">Base Tax Amount (₹)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-lg font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary & Visualization */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-slate-900 text-white flex-1 relative">
            <CardContent className="p-10 flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                   Calculated Liability
                </div>
                <h3 className="text-slate-400 font-medium mb-1">Estimated {calculation.label}</h3>
                <div className="text-6xl font-black tracking-tighter mb-8 flex items-baseline gap-2">
                  <span className="text-3xl text-slate-500">₹</span>
                  {calculation.penalty.toLocaleString('en-IN')}
                </div>

                <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Regular Rate</span>
                    <span className="font-bold">
                      {calculation.config.isPercentage ? `${calculation.config.rate}% / Mo` : `₹${calculation.config.rate} / ${calculation.config.frequency.split(' ')[1] || 'Day'}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Max Cap</span>
                    <span className="font-bold">{calculation.config.maxPenalty?.toLocaleString('en-IN') || "Unlimited"}</span>
                  </div>
                  <div className="h-px bg-white/10 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Severity Level</span>
                    <Badge className={calculation.penalty > 5000 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}>
                      {calculation.penalty > 10000 ? "CRITICAL" : calculation.penalty > 5000 ? "HIGH" : "MODERATE"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/40 mt-auto">
                Consult Advisor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Light Tinted Visualization */}
          <Card className="border-slate-200/60 shadow-lg rounded-[2rem] bg-white p-6">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Impact Analysis</h4>
               <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                     <span>Growth Trend</span>
                     <span>{delay} Days</span>
                  </div>
                  <div className="h-10 w-full flex items-end gap-1.5 bg-slate-50 p-2 rounded-xl">
                    {[...Array(20)].map((_, i) => {
                      const isActive = i <= (delay / 180) * 20;
                      return (
                        <div 
                           key={i} 
                           className={`flex-1 rounded-full transition-all duration-1000 ${
                             isActive ? 'bg-blue-600/20 h-full' : 'bg-slate-200 h-1/4'
                           }`} 
                        />
                      );
                    })}
                  </div>
               </div>
               
               <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-[10px] text-orange-800 font-medium leading-relaxed">
                    Note: Actual penalties may involve interest on late payment AND late filing fees. 
                    This is an indicative estimation for informational purposes.
                  </p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}