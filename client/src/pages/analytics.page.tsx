import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Coins, Target, FileText, Download, Calendar, Users, Filter, ChevronRight, Activity } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/admin/Layout";
import TaxSummaryDashboard from "@/features/itr/components/TaxSummaryDashboard";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  relation: string;
}

interface TaxReturn {
  id: number;
  profileId: number;
  assessmentYear: string;
  itrType: string;
  status: string;
  formData: any;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [selectedProfile, setSelectedProfile] = useState('all');

  // Fetch user profiles
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user
  });

  // Fetch tax returns data
  const { data: taxReturns = [] } = useQuery<TaxReturn[]>({
    queryKey: ['/api/tax-returns'],
    enabled: !!user
  });

  // Filter data based on selections
  const filteredReturns = taxReturns.filter((return_) => {
    const yearMatch = selectedYear === 'all' || return_.assessmentYear === selectedYear;
    const profileMatch = selectedProfile === 'all' || return_.profileId.toString() === selectedProfile;
    return yearMatch && profileMatch;
  });

  const calculateAnalytics = () => {
    const analytics = {
      totalIncome: 0,
      totalTax: 0,
      totalDeductions: 0,
      filedReturns: 0,
      draftReturns: 0,
      averageRefund: 0,
      taxEfficiency: 0,
      yearOverYearGrowth: 0
    };

    filteredReturns.forEach((return_: any) => {
      if (return_.formData) {
        const data = typeof return_.formData === 'string' ? JSON.parse(return_.formData) : return_.formData;
        
        // Calculate income
        const salary = parseFloat(data.incomeDetails?.salary || '0');
        const businessIncome = parseFloat(data.businessIncome?.netProfit || '0');
        const capitalGains = data.capitalGains?.gains?.reduce((total: number, gain: any) => {
          return total + (parseFloat(gain.saleValue || '0') - parseFloat(gain.purchaseValue || '0'));
        }, 0) || 0;
        
        analytics.totalIncome += salary + businessIncome + capitalGains;
        
        // Calculate deductions
        const deductions = parseFloat(data.deductions?.section80C || '0') + 
                          parseFloat(data.deductions?.section80D || '0');
        analytics.totalDeductions += deductions;
        
        // Calculate estimated tax
        const taxableIncome = Math.max(0, analytics.totalIncome - analytics.totalDeductions);
        analytics.totalTax += calculateEstimatedTax(taxableIncome);
      }
      
      if (return_.status === 'filed') analytics.filedReturns++;
      if (return_.status === 'draft') analytics.draftReturns++;
    });

    analytics.taxEfficiency = analytics.totalIncome > 0 ? 
      ((analytics.totalDeductions / analytics.totalIncome) * 100) : 0;

    return analytics;
  };

  const calculateEstimatedTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = 75000 + 112500 + (taxableIncome - 1500000) * 0.3;
    } else if (taxableIncome > 1200000) {
      tax = 75000 + (taxableIncome - 1200000) * 0.2;
    } else if (taxableIncome > 900000) {
      tax = 30000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome > 600000) {
      tax = (taxableIncome - 600000) * 0.1;
    } else if (taxableIncome > 300000) {
      tax = (taxableIncome - 300000) * 0.05;
    }
    return tax * 1.04; // Add cess
  };

  const analytics = calculateAnalytics();
  
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const years = ['2024-25', '2023-24', '2022-23', 'all'];

  // Get tax optimization score
  const getTaxOptimizationScore = () => {
    const maxDeductions = 150000; // Section 80C limit
    const utilizationRate = (analytics.totalDeductions / maxDeductions) * 100;
    
    if (utilizationRate >= 80) return { score: 90, label: 'Excellent', color: 'emerald' };
    if (utilizationRate >= 60) return { score: 70, label: 'Good', color: 'blue' };
    if (utilizationRate >= 40) return { score: 50, label: 'Average', color: 'amber' };
    return { score: 30, label: 'Needs Improvement', color: 'red' };
  };

  const optimizationScore = getTaxOptimizationScore();

  return (
    <Layout>
      <SEO
        title="Tax Analytics | MyeCA.in"
        description="Comprehensive insights into your tax filing and optimization opportunities"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start h-[calc(100vh-200px)] lg:h-[calc(100vh-240px)] overflow-hidden bg-slate-50/50 rounded-[48px] p-2">
        {/* Fixed Left Summary Section */}
        <div className="lg:w-96 h-full overflow-y-auto pr-2 shrink-0 w-full scrollbar-none pb-10 space-y-6">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl font-black text-blue-600 border border-blue-100">
                         <BarChart3 className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Analytics Hub</h2>
                      <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         {optimizationScore.label} Efficiency
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Context</p>
                   <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assessment Year</label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="rounded-2xl border-none shadow-sm bg-white font-black text-xs h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {years.map(year => (
                              <SelectItem key={year} value={year} className="rounded-xl font-bold">
                                {year === 'all' ? 'All Years' : `AY ${year}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target Profile</label>
                        <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                          <SelectTrigger className="rounded-2xl border-none shadow-sm bg-white font-black text-xs h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="all" className="rounded-xl font-bold">All Profiles</SelectItem>
                            {profiles.map((profile: any) => (
                              <SelectItem key={profile.id} value={profile.id.toString()} className="rounded-xl font-bold">
                                {profile.firstName} {profile.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </div>

                <div className="mt-8 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Health Score</p>
                    <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{optimizationScore.score}</span>
                            <Badge className={cn("border-none font-black text-[9px] uppercase px-2 py-0.5 rounded-full", `bg-${optimizationScore.color}-50 text-${optimizationScore.color}-600`)}>
                                {optimizationScore.label}
                            </Badge>
                        </div>
                        <Progress value={optimizationScore.score} className="h-2 bg-slate-200" indicatorClassName={cn(`bg-${optimizationScore.color}-600`)} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-relaxed">
                            Based on your deduction utilization vs the maximum allowable ₹1.5L cap.
                        </p>
                    </div>
                </div>
             </CardContent>
          </Card>

          <Button 
             className="w-full h-16 rounded-[32px] bg-white border border-slate-100 text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm transition-all hover:-translate-y-1"
          >
             <Download className="h-5 w-5 mr-3 text-blue-600" />
             Export Tax Report
          </Button>
        </div>

        {/* Main Content Area - Independently Scrollable */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl h-full overflow-y-auto pr-4 pb-20 scroll-smooth custom-scrollbar space-y-10">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Statistical Analysis</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Tax Analytics</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Comprehensive visualization of your income distribution, tax liability, and optimization yields.
              </p>
            </div>
            <div className="flex gap-4">
               <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tax Saved</p>
                    <p className="text-sm font-black text-slate-900 leading-none">{formatCurrency(analytics.totalDeductions * 0.3)}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Income", value: formatCurrency(analytics.totalIncome), icon: Coins, color: "blue", trend: "+12%" },
              { label: "Tax Liability", value: formatCurrency(analytics.totalTax), icon: Target, color: "red", trend: `${((analytics.totalTax / analytics.totalIncome) * 100).toFixed(1)}%` },
              { label: "Total Deductions", value: formatCurrency(analytics.totalDeductions), icon: TrendingUp, color: "emerald", trend: `${analytics.taxEfficiency.toFixed(1)}% eff.` },
              { label: "Returns Filed", value: analytics.filedReturns, icon: FileText, color: "indigo", trend: `${analytics.draftReturns} drafts` }
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm rounded-[40px] bg-white p-8 group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-colors", `bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white`)}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <Badge variant="outline" className="border-slate-100 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full text-slate-400 group-hover:text-slate-600">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Tax Summary Dashboard */}
          {filteredReturns.length > 0 ? (
            <div className="space-y-10">
               <TaxSummaryDashboard formData={filteredReturns[0]?.formData || {}} />
               
               {/* Filing History */}
               <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50">
                  <CardHeader className="p-12 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Filing Ledger</CardTitle>
                     <CardDescription className="text-base font-medium text-slate-500">Historical audit of your tax return submissions.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-slate-50">
                        {filteredReturns.map((return_) => (
                           <div key={return_.id} className="p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                              <div className="flex items-center gap-6">
                                 <div className="h-16 w-16 rounded-[24px] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                    <FileText className="h-7 w-7 text-slate-400 group-hover:text-blue-600" />
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-black text-slate-900 mb-1">{return_.itrType} — {return_.assessmentYear}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted on {new Date(return_.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <Badge className={cn("border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-xl", return_.status === "filed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                    {return_.status}
                                 </Badge>
                                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50">
                                    <ChevronRight className="h-5 w-5" />
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               {/* Recommended Actions */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { title: "Investment Strategy", desc: "Maximize your Section 80C units before the current fiscal deadline.", icon: Activity },
                    { title: "Health Coverage", desc: "Evaluate Section 80D limits for enhanced medical insurance premiums.", icon: Shield },
                    { title: "Asset Planning", desc: "Audit home loan interest units for maximum capital preservation.", icon: Target },
                    { title: "Expense Audit", desc: "Verify all deductible operational expenditures for compliance yield.", icon: BarChart3 }
                  ].map((action, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[40px] bg-white p-10 flex items-start gap-6 hover:shadow-xl transition-all border border-slate-100/50">
                       <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <action.icon className="h-7 w-7" />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-slate-900 mb-2">{action.title}</h4>
                          <p className="text-slate-500 font-medium mb-6 leading-relaxed">{action.desc}</p>
                          <Button variant="link" className="p-0 h-auto font-black text-[10px] uppercase tracking-widest text-blue-600 hover:no-underline">Execute Strategy →</Button>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          ) : (
            <div className="py-40 text-center bg-white rounded-[48px] border border-slate-100 shadow-sm px-10">
               <div className="h-32 w-32 rounded-[48px] bg-slate-50 flex items-center justify-center mx-auto mb-10 border border-slate-100">
                  <Activity className="h-14 w-14 text-slate-200" />
               </div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">No Data in Context</h3>
               <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Initiate your first tax return filing to begin generating statistical insights and optimization strategies.</p>
               <Button className="rounded-2xl px-12 h-14 bg-blue-600 font-black text-xs uppercase tracking-widest">Start Filing</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}