import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { calculateEnhancedSIP, formatCurrency } from "@/lib/enhanced-calculator-utils";
import EnhancedSEO from "@/components/EnhancedSEO";
import { ArrowRight, MoreHorizontal } from "lucide-react";

export default function SIPCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState<number>(5000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [viewMode, setViewMode] = useState<"predicted" | "method" | "adjust">("predicted");

  const result = calculateEnhancedSIP(monthlyAmount || 0, years || 0, expectedReturn || 0);
  
  // Format data for Recharts
  const chartData = result.yearlyBreakdown.map((d) => ({
    year: d.year,
    Investment: d.investment,
    Total: d.value,
    Returns: d.interestEarned
  }));

  const investedPercent = result.maturityValue > 0 ? (result.totalInvestment / result.maturityValue) * 100 : 0;
  const wealthPercent = result.maturityValue > 0 ? (result.wealthGain / result.maturityValue) * 100 : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(val)) && Number(val) > 0) {
      setMonthlyAmount(Number(val));
    } else if (val === '') {
      setMonthlyAmount(0);
    }
  };

  return (
    <>
      <EnhancedSEO
        title="SIP Calculator | Modern Mutual Fund Returns Calculator"
        description="Beautiful, modern SIP calculator to calculate mutual fund returns."
        keywords={['SIP calculator', 'modern calculator']}
        url="https://myeca.in/calculators/sip"
      />

      <div className="min-h-screen bg-gradient-hero pt-[var(--space-6)] pb-[var(--space-20)] px-[var(--space-4)] md:px-[var(--space-8)] lg:px-[var(--space-12)] font-sans overflow-x-hidden text-[var(--color-primary-900)] border-none">
        <div className="max-w-6xl mx-auto space-y-[var(--space-10)]">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start pt-[var(--space-8)] pb-[var(--space-4)] relative">


            <div className="space-y-[var(--space-4)] max-w-lg pt-[var(--space-12)]">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-[var(--color-primary-900)] -ml-1">What if?</h1>
              <p className="text-xl md:text-2xl text-[var(--color-primary-800)] tracking-wide">Mutual Fund SIP Calculator</p>
            </div>

            {/* Right side mini-card */}
            <div className="mt-12 md:mt-24 w-full md:w-[320px] bg-white/50 backdrop-blur-3xl rounded-[var(--radius-3xl)] p-[var(--space-6)] shadow-sm border border-white/80 relative transition-transform hover:-translate-y-1 duration-500">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-semibold text-slate-900">Maturity Value Preview</h3>
                 <MoreHorizontal className="text-slate-500 w-5 h-5 cursor-pointer hover:text-slate-900" />
               </div>
               <p className="text-sm font-medium text-slate-600 tracking-wide">Year {years || 0}</p>
               <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.maturityValue)}</p>
               
               {/* Mini CSS chart for visual flair */}
               <div className="mt-6 flex flex-col justify-end gap-2 h-20 w-full relative">
                 <svg className="absolute inset-0 w-[110%] h-[120%] -top-6 -left-2 text-[#7c92ba]" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M5,90 Q30,60 50,45 T95,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                   <path d="M85,25 L95,15 L80,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                 </svg>

                 <div className="flex items-end justify-between gap-1 w-full h-[80%] absolute bottom-0 px-2 opacity-60">
                   <div className="w-[15%] bg-[#a5b4cc] rounded-tl-[4px] rounded-tr-[4px] h-[20%]"></div>
                   <div className="w-[15%] bg-[#a5b4cc] rounded-tl-[4px] rounded-tr-[4px] h-[35%]"></div>
                   <div className="w-[15%] bg-[#a5b4cc] rounded-tl-[4px] rounded-tr-[4px] h-[50%]"></div>
                   <div className="w-[15%] bg-[#a5b4cc] rounded-tl-[4px] rounded-tr-[4px] h-[70%]"></div>
                   <div className="w-[15%] bg-[#a5b4cc] rounded-tl-[4px] rounded-tr-[4px] h-[95%]"></div>
                   <div className="w-[15%] bg-[#a5b4cc] rounded-tl-[4px] rounded-tr-[4px] h-[100%]"></div>
                 </div>
               </div>
               
               <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-4 px-3 tabular-nums">
                 <span>{Math.floor((years||1)/6)}</span>
                 <span>{Math.floor((years||1)/6)*2}</span>
                 <span>{Math.floor((years||1)/6)*3}</span>
                 <span>{Math.floor((years||1)/6)*4}</span>
                 <span>{Math.floor((years||1)/6)*5}</span>
                 <span>{years || 1}</span>
               </div>
            </div>
          </div>

          {/* Three Input Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Monthly Investment */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-3xl)] p-[var(--space-6)] shadow-sm shadow-[var(--color-primary-900)]/5 border border-white hover:shadow-md transition-shadow">
               <h3 className="text-lg font-bold text-[var(--color-primary-800)] mb-[var(--space-6)] tracking-wide">Monthly Investment</h3>
               
               <p className="text-xs font-semibold text-[var(--color-primary-500)] mb-[var(--space-2)] tracking-wide uppercase">Amount</p>
               <div className="flex items-center border border-[var(--color-primary-200)] rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-1)] mb-[var(--space-6)] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary-800)] focus-within:border-transparent transition-all">
                 <span className="text-[var(--color-primary-800)] font-bold mr-1">\u20B9</span>
                 <Input 
                   type="text" 
                   value={monthlyAmount > 0 ? monthlyAmount.toLocaleString('en-IN') : ''} 
                   onChange={handleAmountChange}
                   className="border-0 bg-transparent p-0 py-2 h-auto text-lg font-bold text-[var(--color-primary-900)] focus-visible:ring-0 shadow-none w-full tabular-nums"
                 />
               </div>
               
               <div className="flex flex-col mt-[var(--space-4)]">
                 <div className="flex justify-between mb-[var(--space-2)]">
                   <span className="text-xs font-semibold text-[var(--color-primary-500)] tracking-wide uppercase">Adjust</span>
                   <span className="text-xs font-bold text-[var(--color-primary-800)]">\u20B91L Max</span>
                 </div>
                 <Slider colorTheme="blue" value={[monthlyAmount]} onValueChange={(v) => setMonthlyAmount(v[0])} max={100000} min={500} step={500} className="w-full cursor-pointer" />
               </div>
            </div>

            {/* Investment Period */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-3xl)] p-[var(--space-6)] shadow-sm shadow-[var(--color-primary-900)]/5 border border-white hover:shadow-md transition-shadow">
               <h3 className="text-lg font-bold text-[var(--color-primary-800)] mb-[var(--space-6)] tracking-wide">Investment Period</h3>
               
               <p className="text-xs font-semibold text-[var(--color-primary-500)] mb-[var(--space-2)] tracking-wide uppercase">Duration</p>
               <div className="flex items-center border border-[var(--color-primary-200)] rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-1)] mb-[var(--space-6)] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary-800)] focus-within:border-transparent transition-all">
                 <Input 
                   type="number" 
                   value={years || ''} 
                   onChange={(e) => setYears(Number(e.target.value))}
                   className="border-0 bg-transparent p-0 py-2 h-auto text-lg font-bold text-[var(--color-primary-900)] focus-visible:ring-0 shadow-none w-full tabular-nums"
                 />
                 <span className="text-[var(--color-primary-500)] font-bold ml-1 pl-1">Years</span>
               </div>
               
               <div className="flex flex-col mt-[var(--space-4)]">
                 <div className="flex justify-between mb-[var(--space-2)]">
                   <span className="text-xs font-semibold text-[var(--color-primary-500)] tracking-wide uppercase">Adjust</span>
                   <span className="text-xs font-bold text-[var(--color-primary-800)]">30Y Max</span>
                 </div>
                 <Slider colorTheme="blue" value={[years]} onValueChange={(v) => setYears(v[0])} max={30} min={1} step={1} className="w-full cursor-pointer" />
               </div>
            </div>

            {/* Expected Return Rate */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius-3xl)] p-[var(--space-6)] shadow-sm shadow-[var(--color-primary-900)]/5 border border-white hover:shadow-md transition-shadow">
               <h3 className="text-lg font-bold text-[var(--color-primary-800)] mb-[var(--space-6)] tracking-wide">Expected Return Rate</h3>
               
               <p className="text-xs font-semibold text-[var(--color-primary-500)] mb-[var(--space-2)] tracking-wide uppercase">Selection</p>
               <div className="flex items-center border border-[var(--color-primary-200)] rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-1)] mb-[var(--space-6)] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary-800)] focus-within:border-transparent transition-all">
                 <Input 
                   type="number" 
                   value={expectedReturn || ''} 
                   onChange={(e) => setExpectedReturn(Number(e.target.value))}
                   className="border-0 bg-transparent p-0 py-2 h-auto text-lg font-bold text-[var(--color-primary-900)] focus-visible:ring-0 shadow-none w-full tabular-nums"
                 />
                 <span className="text-[var(--color-primary-500)] font-bold ml-1 pl-1">%</span>
               </div>
               
               <div className="flex flex-col mt-[var(--space-4)]">
                 <div className="flex justify-between mb-[var(--space-2)]">
                   <span className="text-xs font-semibold text-[var(--color-primary-500)] tracking-wide uppercase">Adjust</span>
                   <span className="text-xs font-bold text-[var(--color-primary-800)]">25% Max</span>
                 </div>
                 <Slider colorTheme="blue" value={[expectedReturn]} onValueChange={(v) => setExpectedReturn(v[0])} max={25} min={1} step={0.5} className="w-full cursor-pointer" />
               </div>
            </div>

          </div>

          {/* Large Chart Area Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-6 md:p-10 shadow-sm shadow-blue-900/5 border border-white/60">
            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-wide -mt-2">Investment Highlights</h3>
              
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 w-full">
              
              <div className="flex bg-white/60 p-1.5 rounded-full border border-slate-200/60 shadow-sm w-full md:w-auto overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setViewMode('predicted')} 
                  className={`px-6 py-2 text-[13px] font-bold tracking-wide rounded-full shadow-sm whitespace-nowrap transition-colors ${viewMode === 'predicted' ? 'bg-[var(--color-primary-900)] text-white' : 'text-[var(--color-primary-600)] hover:text-[var(--color-primary-900)] hover:bg-white/50 bg-transparent'}`}
                >
                  Predicted
                </button>
                <button 
                  onClick={() => setViewMode('method')} 
                  className={`px-6 py-2 text-[13px] font-bold tracking-wide rounded-full shadow-sm whitespace-nowrap transition-colors ${viewMode === 'method' ? 'bg-[var(--color-primary-900)] text-white' : 'text-[var(--color-primary-600)] hover:text-[var(--color-primary-900)] hover:bg-white/50 bg-transparent'}`}
                >
                  Breakdown
                </button>
                <button 
                  onClick={() => setViewMode('adjust')} 
                  className={`px-6 py-2 text-[13px] font-bold tracking-wide rounded-full shadow-sm whitespace-nowrap transition-colors ${viewMode === 'adjust' ? 'bg-[var(--color-primary-900)] text-white' : 'text-[var(--color-primary-600)] hover:text-[var(--color-primary-900)] hover:bg-white/50 bg-transparent'}`}
                >
                  Adjust Goals
                </button>
              </div>
                 
              {viewMode !== 'adjust' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto px-2">
                   <div className="flex-1 w-full min-w-[150px]">
                      <div className="flex justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">Total Invested</span>
                        <span className="text-[11px] font-bold text-slate-900">{formatCurrency(result.totalInvestment)}</span>
                      </div>
                       <div className="h-1.5 bg-[var(--color-primary-200)] rounded-full w-full relative overflow-hidden">
                           <div className="absolute top-0 left-0 h-full bg-[var(--color-primary-800)] rounded-full transition-all duration-700 ease-in-out" style={{ width: `${investedPercent}%` }}></div>
                       </div>
                   </div>

                   <div className="flex-1 w-full min-w-[150px]">
                      <div className="flex justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">Expected Wealth</span>
                        <span className="text-[11px] font-bold text-slate-900">{formatCurrency(result.wealthGain)}</span>
                      </div>
                       <div className="h-1.5 bg-[var(--color-primary-200)] rounded-full w-full relative overflow-hidden">
                           <div className="absolute top-0 left-0 h-full bg-[var(--color-primary-800)] rounded-full transition-all duration-700 ease-in-out" style={{ width: `${wealthPercent}%` }}></div>
                       </div>
                   </div>
                </div>
              )}
            </div>

            <div className="h-[320px] w-full mt-4 -ml-4 pr-4 transition-all duration-300">
              {viewMode === 'predicted' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent-400)" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="var(--color-accent-400)" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0 0" vertical={true} horizontal={false} stroke="#cbd5e1" strokeOpacity={0.4} />
                    <XAxis 
                      dataKey="year" 
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      tickLine={false}
                      tickFormatter={(val) => `Y${val}`}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                      dy={12}
                      minTickGap={20}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => {
                        if (val >= 10000000) return `\u20B9${(val / 10000000).toFixed(1)}Cr`;
                        if (val >= 100000) return `\u20B9${(val / 100000).toFixed(1)}L`;
                        if (val >= 1000) return `\u20B9${(val / 1000).toFixed(0)}k`;
                        return `\u20B9${val}`;
                      }}
                      tick={{ fill: 'var(--color-primary-600)', fontSize: 11, fontWeight: 500 }}
                      dx={-10}
                      width={55}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name === 'Total' ? 'Maturity Value' : name]}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 600, color: '#0f172a' }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Total" 
                      stroke="var(--color-accent-600)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {viewMode === 'method' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0 0" vertical={false} horizontal={true} stroke="#cbd5e1" strokeOpacity={0.4} />
                    <XAxis 
                      dataKey="year" 
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      tickLine={false}
                      tickFormatter={(val) => `Y${val}`}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                      dy={12}
                      minTickGap={20}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => {
                        if (val >= 10000000) return `\u20B9${(val / 10000000).toFixed(1)}Cr`;
                        if (val >= 100000) return `\u20B9${(val / 100000).toFixed(1)}L`;
                        if (val >= 1000) return `\u20B9${(val / 1000).toFixed(0)}k`;
                        return `\u20B9${val}`;
                      }}
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                      dx={-10}
                      width={55}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 600, color: '#0f172a' }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Investment" stackId="a" fill="var(--color-primary-800)" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Returns" stackId="a" fill="var(--color-accent-400)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {viewMode === 'adjust' && (
                <div className="w-full h-full bg-slate-50 rounded-2xl border border-slate-200 p-8 overflow-y-auto pl-8 flex flex-col items-center justify-center text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Want to change your target?</h3>
                    <p className="text-slate-600 mb-8 max-w-sm">Use the sliders above to fine-tune your monthly investment or duration to hit your financial goals.</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg text-left">
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-xs font-semibold text-slate-500 uppercase">You Invest</p>
                          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(result.totalInvestment)}</p>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-xs font-semibold text-slate-500 uppercase">You Gain</p>
                          <p className="text-lg font-bold text-[#10b981] mt-1">+{formatCurrency(result.wealthGain)}</p>
                       </div>
                    </div>
                </div>
              )}
            </div>
          </div>

          {/* Information Cards (Benefits & Tips) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 shadow-sm shadow-blue-900/5 border border-white/60">
               <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-wide">Benefits of SIP</h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                    <p className="text-slate-700 text-[15px] leading-relaxed"><span className="font-semibold text-slate-900">Power of Compounding:</span> Start early to maximize returns</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                    <p className="text-slate-700 text-[15px] leading-relaxed"><span className="font-semibold text-slate-900">Rupee Cost Averaging:</span> Reduces market timing risk</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                    <p className="text-slate-700 text-[15px] leading-relaxed"><span className="font-semibold text-slate-900">Financial Discipline:</span> Regular investing habit</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                    <p className="text-slate-700 text-[15px] leading-relaxed"><span className="font-semibold text-slate-900">Flexibility:</span> Start with as low as \u20B9500</p>
                  </div>
               </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-8 shadow-sm shadow-blue-900/5 border border-white/60">
               <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-wide">Smart SIP Tips</h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-lg">📈</span>
                    <p className="text-slate-700 text-[15px] leading-relaxed mt-0.5">Increase SIP amount with salary hikes</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-lg">📊</span>
                    <p className="text-slate-700 text-[15px] leading-relaxed mt-0.5">Diversify across fund categories</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-lg">🎯</span>
                    <p className="text-slate-700 text-[15px] leading-relaxed mt-0.5">Link SIPs to specific financial goals</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-lg">📆</span>
                    <p className="text-slate-700 text-[15px] leading-relaxed mt-0.5">Review portfolio performance annually</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:py-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-white mt-12 mb-12">
             <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold text-xl text-slate-800 tracking-wide">Start Your Financial Journey Today</h4>
                <p className="text-[13px] text-slate-600 font-medium flex flex-col justify-center md:justify-start gap-0.5">
                   <i>Calculations subject to market risks.</i>
                   <i>Results may vary over time.</i>
                </p>
             </div>
             
             <Link href="/auth/register">
               <button className="bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-xl shadow-slate-900/10 px-10 py-4 pt-[18px] rounded-[16px] font-bold tracking-wide transition-all transform hover:scale-[1.02] w-full md:w-auto -mt-2">
                 Start SIP Now
               </button>
             </Link>
             
             <div className="hidden md:flex text-slate-900 font-bold tracking-wide cursor-pointer hover:text-slate-600 items-center justify-end gap-1 group">
                <Link href="/services">
                   <div className="flex items-center">
                     Learn More <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                   </div>
                </Link>
             </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
