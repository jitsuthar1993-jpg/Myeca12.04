import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { calculateEnhancedSIP, formatCurrency } from "@/lib/enhanced-calculator-utils";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { 
  ArrowRight, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Zap, 
  ShieldCheck, 
  Info, 
  Plus, 
  Minus,
  IndianRupee,
  Calendar,
  Percent,
  ChevronDown,
  HelpCircle,
  BarChart3,
  Calculator
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function SIPCalculator() {
  const seo = getSEOConfig('/calculators/sip');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(5000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const result = calculateEnhancedSIP(monthlyAmount || 0, years || 0, expectedReturn || 0);
  
  const chartData = result.yearlyBreakdown.map((d) => ({
    year: d.year,
    investment: d.investment,
    returns: d.interestEarned,
    total: d.value,
  }));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const numVal = Number(val);
    if (numVal <= 1000000) {
      setMonthlyAmount(numVal);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <>
      <MetaSEO
        title={seo?.title || "SIP Calculator | Calculate Mutual Fund Returns | MyeCA.in"}
        description={seo?.description || "Plan your wealth with our premium SIP calculator. Interactive visualizations for mutual fund returns and compounding growth."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="min-h-screen bg-[#f8faff] text-slate-900 selection:bg-blue-600/10 selection:text-blue-700 font-sans antialiased overflow-x-hidden">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12"
          >
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-[11px] font-black tracking-widest uppercase">
                <TrendingUp className="w-3.5 h-3.5" />
                Wealth Creation
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
                Plan your <span className="text-blue-600">Wealth Journey</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                Visualize the power of compounding. Our professional SIP calculator helps you project your mutual fund returns and build long-term wealth.
              </p>
            </div>
            
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
               <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20">SIP Calculator</button>
               <Link href="/calculators/lumpsum">
                 <button className="px-6 py-2.5 rounded-xl text-slate-600 font-bold text-sm transition-all hover:text-blue-600 hover:bg-blue-50">Lumpsum</button>
               </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Inputs */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-5 space-y-6"
            >
              {/* Input Card: Monthly Amount */}
              <motion.div variants={itemVariants} className="group p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.02] blur-3xl group-hover:bg-blue-500/[0.05] transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                    Monthly Investment
                  </label>
                  <div className="relative group/input">
                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 group-focus-within/input:border-blue-500 group-focus-within/input:bg-white transition-all">
                      <span className="text-blue-600 font-black mr-1.5 text-lg">₹</span>
                      <input 
                        type="text"
                        value={monthlyAmount.toLocaleString('en-IN')}
                        onChange={handleAmountChange}
                        className="bg-transparent border-none text-right font-black text-2xl text-slate-900 w-28 focus:outline-none focus:ring-0 p-0 tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <Slider 
                    value={[monthlyAmount]} 
                    onValueChange={(v) => setMonthlyAmount(v[0])} 
                    max={100000} 
                    min={500} 
                    step={500} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    <span>Min ₹500</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Step ₹500</span>
                    <span>Max ₹1L</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {[2000, 5000, 10000, 25000].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setMonthlyAmount(amt)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${monthlyAmount === amt ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Input Card: Time Period */}
              <motion.div variants={itemVariants} className="group p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] blur-3xl group-hover:bg-indigo-500/[0.05] transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Time Period
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 transition-all">
                    <input 
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Math.min(40, Math.max(1, Number(e.target.value))))}
                      className="bg-transparent border-none text-right font-black text-2xl text-slate-900 w-12 focus:outline-none focus:ring-0 p-0 tabular-nums"
                    />
                    <span className="text-indigo-600 font-black text-lg">Yrs</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <Slider 
                    value={[years]} 
                    onValueChange={(v) => setYears(v[0])} 
                    max={40} 
                    min={1} 
                    step={1} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    <span>1 Year</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Long Term Focus</span>
                    <span>40 Years</span>
                  </div>
                </div>
              </motion.div>

              {/* Input Card: Return Rate */}
              <motion.div variants={itemVariants} className="group p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-blue-900/5 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] blur-3xl group-hover:bg-emerald-500/[0.05] transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2.5">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    Expected Return
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 transition-all">
                    <input 
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Math.min(30, Math.max(1, Number(e.target.value))))}
                      className="bg-transparent border-none text-right font-black text-2xl text-slate-900 w-12 focus:outline-none focus:ring-0 p-0 tabular-nums"
                    />
                    <span className="text-emerald-600 font-black text-lg">%</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <Slider 
                    value={[expectedReturn]} 
                    onValueChange={(v) => setExpectedReturn(v[0])} 
                    max={30} 
                    min={1} 
                    step={0.5} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    <span>1% Min</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Equity Avg 12-15%</span>
                    <span>30% Max</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Visualization & Results */}
            <div className="lg:col-span-7 space-y-8">
              {/* Main Result Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-1 rounded-[3rem] bg-white border border-slate-200 shadow-2xl shadow-blue-900/10 overflow-hidden"
              >
                <div className="bg-white rounded-[2.9rem] p-6 sm:p-10 relative">
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimated Maturity</p>
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={result.maturityValue}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-4xl font-black text-slate-950 tracking-tighter tabular-nums"
                        >
                          {formatCurrency(result.maturityValue)}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Gains</p>
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={result.wealthGain}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-black text-blue-600 tracking-tighter tabular-nums"
                        >
                          +{formatCurrency(result.wealthGain)}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal Amount</p>
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={result.totalInvestment}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-black text-slate-900/60 tracking-tighter tabular-nums"
                        >
                          {formatCurrency(result.totalInvestment)}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-[400px] w-full -ml-4 pr-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="year" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }}
                          tickFormatter={(val) => `YEAR ${val}`}
                          dy={15}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }}
                          tickFormatter={(val) => {
                            if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
                            if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
                            return `${val / 1000}k`;
                          }}
                          width={60}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-2xl">
                                  <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Year {label} Forecast</p>
                                  <div className="space-y-2">
                                    <p className="text-sm font-black text-slate-900 flex justify-between gap-10">
                                      Total Value: <span className="text-blue-600">{formatCurrency(payload[0].value as number)}</span>
                                    </p>
                                    <p className="text-sm font-black text-slate-900 flex justify-between gap-10">
                                      Investment: <span className="text-slate-500">{formatCurrency(payload[1].value as number)}</span>
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#2563eb" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorTotal)" 
                          animationDuration={1500}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="investment" 
                          stroke="#64748b" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorInvest)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-10 flex justify-center gap-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Wealth</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-lg shadow-slate-400/30" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Principal</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/auth/register" className="flex-1">
                  <button className="w-full group relative px-8 py-5 rounded-[2rem] bg-slate-950 text-white font-black text-lg transition-all hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-950/10">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Start My SIP Now
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                </Link>
                <button className="flex-1 px-8 py-5 rounded-[2rem] bg-white border border-slate-200 text-slate-950 font-black text-lg transition-all hover:bg-slate-50 hover:border-blue-200 flex items-center justify-center gap-3 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  Expert CA Help
                </button>
              </div>
            </div>
          </div>

          {/* Deep Dive Section */}
          <div className="mt-32 space-y-24">
            
            {/* Features/Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 {
                   icon: <Zap className="w-6 h-6 text-blue-600" />,
                   title: "Power of Compounding",
                   desc: "SIP allows you to reinvest your returns, leading to exponential growth. Small steps today lead to big wealth tomorrow."
                 },
                 {
                   icon: <PieChartIcon className="w-6 h-6 text-indigo-600" />,
                   title: "Cost Averaging",
                   desc: "Invest fixed amounts to buy more units when prices are low, effectively lowering your average cost over time."
                 },
                 {
                   icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                   title: "Disciplined Strategy",
                   desc: "Automate your investments and stay consistent regardless of market volatility to reach your goals faster."
                 }
               ].map((feature, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-900/[0.03] transition-transform hover:-translate-y-1"
                 >
                   <div className="mb-8 p-4 rounded-2xl bg-slate-50 w-fit">{feature.icon}</div>
                   <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">{feature.title}</h3>
                   <p className="text-slate-600 leading-relaxed text-[15px] font-medium">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>

            {/* The Math Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  The Science of <br /><span className="text-blue-600">Wealth Generation</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  SIP returns are calculated using the Future Value of an Annuity formula. Unlike simple interest, every installment earns interest on the previous period's total value.
                </p>
                <div className="bg-slate-950 rounded-[2.5rem] p-10 border border-slate-800 font-mono text-sm relative overflow-hidden group shadow-2xl shadow-blue-900/20">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calculator className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="pt-4 text-white font-bold text-lg sm:text-xl">FV = P × ([(1 + r)ⁿ - 1] / r) × (1 + r)</div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-slate-500 text-[13px] mt-6 border-t border-slate-800 pt-6">
                      <div><span className="text-blue-400 font-black mr-2">P:</span> Monthly Amount</div>
                      <div><span className="text-blue-400 font-black mr-2">r:</span> Monthly Rate</div>
                      <div><span className="text-blue-400 font-black mr-2">n:</span> Total Months</div>
                      <div><span className="text-blue-400 font-black mr-2">FV:</span> Maturity Value</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-950 flex items-center gap-3 mb-4">
                  <HelpCircle className="w-7 h-7 text-blue-600" />
                  Expert Insights
                </h3>
                <div className="space-y-4">
                  {[
                    { q: "Is SIP better than Lumpsum?", a: "SIP is generally safer for volatile markets as it uses rupee cost averaging. Lumpsum can be better if you have a large surplus and the market is at a low point." },
                    { q: "Can I increase my SIP amount?", a: "Yes, many funds offer a 'Step-up SIP' option where you can increase your investment amount annually as your income grows." },
                    { q: "What is a realistic return rate?", a: "For equity funds in India, 12-15% is a historically reasonable long-term expectation, though it can vary significantly in the short term." }
                  ].map((faq, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-default shadow-sm">
                      <h4 className="font-black text-slate-950 mb-3 text-lg tracking-tight">{faq.q}</h4>
                      <p className="text-[15px] font-medium text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-12 sm:p-20 rounded-[4rem] bg-blue-600 overflow-hidden text-center shadow-2xl shadow-blue-600/30"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.1),transparent_40%)]" />
              <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
                  Your future self will <br />thank you for <span className="underline decoration-white/30 underline-offset-8">starting today</span>.
                </h2>
                <p className="text-xl text-blue-50 font-medium max-w-2xl mx-auto leading-relaxed">
                  Join thousands of smart investors who use MyeCA to build wealth and secure their financial freedom.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link href="/auth/register">
                    <button className="px-12 py-5 rounded-[2rem] bg-white text-blue-600 font-black text-xl transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 shadow-2xl">
                      Get Started Now
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="px-12 py-5 rounded-[2rem] bg-blue-700 text-white font-black text-xl transition-all hover:bg-blue-800">
                      View Our Services
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-200 bg-white py-16 px-4 text-center">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-4xl mx-auto leading-loose">
             Disclaimer: Mutual Fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not an indicator of future returns. MyeCA.in provides tools for educational purposes only.
           </p>
        </div>
      </div>
    </>
  );
}
