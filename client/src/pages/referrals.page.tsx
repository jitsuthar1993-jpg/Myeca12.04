import { useState, useRef } from "react";
import { m } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/authToken";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Gift, Users, Share2, TrendingUp, Star, Crown,
  Copy, QrCode, Mail, Trophy, Coins, Calendar,
  CheckCircle, Clock, XCircle, Loader2, Upload, Download,
  AlertCircle, BarChart, Send
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  availableRewards: number;
  redeemedRewards: number;
}

interface Referral {
  id: number;
  refereeEmail: string;
  refereeName: string;
  referralCode: string;
  status: string;
  serviceType: string;
  createdAt: string;
  rewardEarned?: number;
  conversionDate?: string;
}

interface Reward {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  expiryDate: string;
  earnedAt: string;
}

const statusColors: Record<string, string> = {
  pending: "yellow",
  converted: "green",
  expired: "gray"
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  converted: CheckCircle,
  expired: XCircle
};

export default function ReferralsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReferDialogOpen, setIsReferDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [bulkImportResults, setBulkImportResults] = useState<any>(null);
  const [sendEmailsOnImport, setSendEmailsOnImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referralData, setReferralData] = useState({
    refereeEmail: "",
    refereeName: "",
    serviceType: "all_services",
    message: ""
  });
  const [shareData, setShareData] = useState({
    referralCode: "",
    referralLink: "",
    qrCode: ""
  });

  // Fetch referral program overview
  const { data: overviewData } = useQuery<any>({
    queryKey: ["/api/referrals/overview"]
  });

  // Fetch user referral stats
  const { data: statsData, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/referrals/stats"]
  });

  // Fetch user referrals
  const { data: referralsData, isLoading: referralsLoading } = useQuery<any>({
    queryKey: ["/api/referrals"]
  });

  // Fetch user rewards
  const { data: rewardsData } = useQuery<any>({
    queryKey: ["/api/referrals/rewards"]
  });

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery<any>({
    queryKey: ["/api/referrals/leaderboard"]
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery<any>({
    queryKey: ["/api/referrals/analytics"]
  });

  // Create referral mutation
  const createReferralMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/referrals", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      toast({
        title: "Referral created successfully",
        description: "Your referral has been created. Share your code with the client."
      });
      setIsReferDialogOpen(false);
      setReferralData({ refereeEmail: "", refereeName: "", serviceType: "all_services", message: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create referral",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Generate link mutation
  const generateLinkMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/referrals/generate-link", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (response: any) => {
      setShareData({
        referralCode: response.referralCode || "",
        referralLink: response.referralLink || "",
        qrCode: response.qrCode || ""
      });
      setIsShareDialogOpen(true);
    }
  });

  // Redeem reward mutation
  const redeemRewardMutation = useMutation({
    mutationFn: (rewardId: number) => apiRequest(`/api/referrals/rewards/${rewardId}/redeem`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      toast({
        title: "Reward redeemed successfully",
        description: "Your reward has been processed."
      });
    }
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = await getAuthToken();
      const response = await fetch("/api/referrals/bulk-import", {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      if (!response.ok) {
        throw new Error("Failed to import referrals");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setBulkImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      toast({
        title: "Bulk import completed",
        description: `${data.summary.imported} referrals imported successfully`,
        variant: data.summary.failed > 0 ? "default" : "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import referrals",
        variant: "destructive"
      });
    }
  });

  const handleBulkImport = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sendEmails", sendEmailsOnImport.toString());
    bulkImportMutation.mutate(formData);
  };

  // Send reminder email
  const sendReminderEmail = async (referralId: number) => {
    try {
      await apiRequest(`/api/referrals/${referralId}/send-reminder`, {
        method: "POST"
      });
      toast({
        title: "Reminder sent",
        description: "Email reminder has been sent to the referral"
      });
    } catch (error) {
      toast({
        title: "Failed to send reminder",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const program = overviewData?.program || null;
  const stats: ReferralStats = statsData?.stats || {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    availableRewards: 0,
    redeemedRewards: 0
  };
  const referrals = referralsData?.referrals || [];
  const rewards = rewardsData?.rewards || [];
  const leaderboard = leaderboardData?.leaderboard || [];
  const analytics = analyticsData?.analytics || null;

  const conversionRate = stats.totalReferrals > 0 ? (stats.successfulReferrals / stats.totalReferrals) * 100 : 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`
    });
  };

  return (
    <Layout>
      <SEO
        title="Referral Program | MyeCA.in"
        description="Earn rewards by referring clients to our tax and business services"
        keywords="referral program, rewards, tax referrals, business referrals"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Fixed Left Summary Section */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-purple-500 to-indigo-600 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-4xl font-black text-purple-600 border border-purple-100">
                         <Gift className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Earning Hub</h2>
                      <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         ₹{stats.availableRewards} Available
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                   {[
                     { label: "Referrals", value: stats.totalReferrals, icon: Users, color: "blue" },
                     { label: "Converted", value: stats.successfulReferrals, icon: TrendingUp, color: "emerald" },
                     { label: "Earnings", value: `₹${stats.totalRewards}`, icon: Coins, color: "amber" },
                     { label: "Rank", value: "#04", icon: Trophy, color: "indigo" }
                   ].map((stat, i) => (
                     <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                        <stat.icon className={cn("h-4 w-4 mb-2", `text-${stat.color}-600`)} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                        <span className="text-sm font-black text-slate-900 leading-none">{stat.value}</span>
                     </div>
                   ))}
                </div>

                <div className="mt-10 space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referral Meta</p>
                   <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50 space-y-4">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Your Asset Code</p>
                         <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                            <span className="text-xs font-black text-slate-900 uppercase">MYECA25</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-indigo-600" onClick={() => copyToClipboard("MYECA25", "Referral Code")}>
                               <Copy className="h-3 w-3" />
                            </Button>
                         </div>
                      </div>
                      <div className="pt-2">
                         <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${conversionRate}%` }} />
                         </div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex justify-between">
                            <span>Conversion Yield</span>
                            <span className="text-indigo-600">{conversionRate.toFixed(1)}%</span>
                         </p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Button 
             onClick={() => setIsReferDialogOpen(true)}
             className="w-full h-16 rounded-[32px] bg-white border border-slate-100 text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm transition-all hover:-translate-y-1"
          >
             <Users className="h-5 w-5 mr-3 text-indigo-600" />
             Initiate Client Referral
          </Button>
        </div>

        {/* Main Content Area - Independently Scrollable */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Referral Management</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Earning Program</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Coordinate client referrals, track conversion yields, and liquidate your earned rewards via our secure payout engine.
              </p>
            </div>
            <div className="flex gap-4">
               <Button 
                 onClick={() => generateLinkMutation.mutate({ serviceType: "all_services" })}
                 className="h-16 px-10 rounded-3xl bg-slate-50 text-slate-900 hover:bg-slate-100 font-black text-xs uppercase tracking-widest border border-slate-100 transition-all shadow-sm"
               >
                 <Share2 className="h-5 w-5 mr-3" />
                 Share Link
               </Button>
               <Button 
                 onClick={() => setIsReferDialogOpen(true)}
                 className="h-16 px-10 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
               >
                 <Plus className="h-5 w-5 mr-3" />
                 New Referral
               </Button>
            </div>
          </div>

          <Tabs defaultValue="referrals" className="space-y-10">
            <TabsList className="h-16 p-2 bg-white rounded-[24px] shadow-sm border border-slate-100/50 overflow-x-auto no-scrollbar justify-start sm:justify-center">
               <TabsTrigger value="referrals" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Active Queue</TabsTrigger>
               <TabsTrigger value="rewards" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Reward Vault</TabsTrigger>
               <TabsTrigger value="leaderboard" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Leaderboard</TabsTrigger>
               <TabsTrigger value="bulk-import" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Batch Import</TabsTrigger>
               <TabsTrigger value="analytics" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Performance Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals" className="outline-none">
              <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50">
                <CardHeader className="p-12 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Referral History</CardTitle>
                    <CardDescription className="text-base font-medium text-slate-500">Trace your unit's outreach performance.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {referralsLoading ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    </div>
                  ) : referrals.length === 0 ? (
                    <div className="py-40 text-center bg-slate-50/20 px-10">
                      <Users className="h-20 w-20 text-slate-100 mx-auto mb-8" />
                      <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4">No Data in Queue</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mb-8">Initiate your first referral to begin tracking outreach conversions.</p>
                      <Button onClick={() => setIsReferDialogOpen(true)} className="rounded-2xl px-10 h-14 bg-indigo-600">Start Referring</Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {referrals.map((referral: Referral) => {
                        const StatusIcon = statusIcons[referral.status] || Clock;
                        return (
                          <div key={referral.id} className="p-10 flex items-center justify-between hover:bg-indigo-50/20 transition-colors group">
                            <div className="flex items-center gap-6">
                              <div className={cn("h-16 w-16 rounded-[24px] flex items-center justify-center border transition-all", `bg-${statusColors[referral.status]}-50 border-${statusColors[referral.status]}-100 text-${statusColors[referral.status]}-600`)}>
                                <StatusIcon className="h-7 w-7" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-900 mb-1">{referral.refereeName}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{referral.refereeEmail}</p>
                                <div className="flex items-center gap-4 mt-3">
                                   <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-500">{referral.serviceType.replace("_", " ")}</Badge>
                                   <span className="text-[9px] font-black text-slate-400 uppercase">Code: {referral.referralCode}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                               {referral.status === "pending" && (
                                 <Button variant="ghost" size="sm" onClick={() => sendReminderEmail(referral.id)} className="h-10 px-6 rounded-xl text-slate-400 hover:text-indigo-600 font-black text-[9px] uppercase tracking-widest">
                                    <Send className="h-3.5 w-3.5 mr-2" />
                                    Remind
                                 </Button>
                               )}
                               <div className="text-right">
                                  <Badge className={cn("border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-xl", `bg-${statusColors[referral.status]}-50 text-${statusColors[referral.status]}-600`)}>
                                     {referral.status}
                                  </Badge>
                                  {referral.rewardEarned && (
                                    <p className="text-sm font-black text-emerald-600 mt-2 tracking-tight">+₹{referral.rewardEarned}</p>
                                  )}
                               </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="outline-none">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <Card className="border-none shadow-sm rounded-[40px] bg-white p-10 flex flex-col items-center text-center">
                     <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                        <Coins className="h-8 w-8" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liquid Rewards</p>
                     <h4 className="text-4xl font-black text-slate-900 tracking-tighter">₹{stats.availableRewards}</h4>
                     <Button className="mt-8 w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest">Redeem to Bank</Button>
                  </Card>
                  <Card className="border-none shadow-sm rounded-[40px] bg-white p-10 flex flex-col items-center text-center">
                     <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                        <Gift className="h-8 w-8" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Minted</p>
                     <h4 className="text-4xl font-black text-slate-900 tracking-tighter">₹{stats.totalRewards}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Lifetime Yield</p>
                  </Card>
                  <Card className="border-none shadow-sm rounded-[40px] bg-white p-10 flex flex-col items-center text-center">
                     <div className="h-16 w-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                        <Trophy className="h-8 w-8" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rewards Claimed</p>
                     <h4 className="text-4xl font-black text-slate-900 tracking-tighter">₹{stats.redeemedRewards}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Verified Payouts</p>
                  </Card>
               </div>

               <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50">
                  <CardHeader className="p-12 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Reward Ledger</CardTitle>
                     <CardDescription className="text-base font-medium text-slate-500">Track and liquidate your individual earning units.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                     {rewards.length === 0 ? (
                        <div className="py-32 text-center bg-slate-50/20">
                           <Coins className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                           <p className="text-base font-black text-slate-400 uppercase tracking-widest">No individual rewards found</p>
                        </div>
                     ) : (
                        <div className="divide-y divide-slate-50">
                           {rewards.map((reward: Reward) => (
                              <div key={reward.id} className="p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                 <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                       <Coins className="h-7 w-7" />
                                    </div>
                                    <div>
                                       <h4 className="text-lg font-black text-slate-900 leading-none mb-2">₹{reward.amount} Credit</h4>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{reward.description}</p>
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Valid until: {format(new Date(reward.expiryDate), "MMM dd, yyyy")}</p>
                                    </div>
                                 </div>
                                 <div>
                                    {reward.status === "available" ? (
                                       <Button size="sm" onClick={() => redeemRewardMutation.mutate(reward.id)} className="h-11 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest">Redeem</Button>
                                    ) : (
                                       <Badge variant="outline" className="h-10 px-6 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest">{reward.status}</Badge>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="outline-none">
               <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-12">
                  <CardHeader className="px-0 pt-0 pb-12 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Referrer Leaderboard</CardTitle>
                     <CardDescription className="text-base font-medium text-slate-500">Benchmark your performance against the platform's top earners.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                     <div className="grid grid-cols-1 gap-6 mt-12">
                        {leaderboard.map((leader: any, index: number) => (
                           <div key={leader.userId} className={cn("p-8 rounded-[32px] border transition-all flex items-center justify-between", index === 0 ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]" : "bg-white border-slate-50 hover:border-slate-100")}>
                              <div className="flex items-center gap-8">
                                 <div className="flex items-center gap-4 min-w-[100px]">
                                    {index === 0 ? <Crown className="h-8 w-8 text-yellow-300" /> : index === 1 ? <Trophy className="h-6 w-6 text-slate-300" /> : <Star className="h-6 w-6 text-amber-100" />}
                                    <span className="text-2xl font-black">#{leader.rank}</span>
                                 </div>
                                 <Avatar className="h-16 w-16 rounded-[24px] border-4 border-white/10">
                                    <AvatarImage src={leader.avatar} />
                                    <AvatarFallback className="bg-white/20 text-xl font-black">{leader.userName[0]}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <h4 className="text-xl font-black tracking-tight">{leader.userName}</h4>
                                    <p className={cn("text-[10px] font-black uppercase tracking-widest", index === 0 ? "text-indigo-100" : "text-slate-400")}>{leader.successfulReferrals} Conversions</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className={cn("text-2xl font-black tracking-tighter", index === 0 ? "text-white" : "text-emerald-600")}>₹{leader.totalRewards}</p>
                                 <p className={cn("text-[10px] font-black uppercase tracking-widest", index === 0 ? "text-indigo-100" : "text-slate-400")}>Total Earnings</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="bulk-import" className="outline-none">
               <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-16">
                  <div className="max-w-3xl mx-auto text-center">
                     <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-blue-100">
                        <Upload className="h-10 w-10 text-blue-600" />
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Scale Your Outreach</h3>
                     <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">Import client databases in bulk to initiate wide-scale referral campaigns via our automated notification engine.</p>
                     
                     <div className="border-2 border-dashed border-slate-100 rounded-[48px] p-16 bg-slate-50/50 mb-12">
                        <Button 
                           onClick={() => document.getElementById('csv-upload')?.click()}
                           className="h-20 px-16 rounded-[32px] bg-white border border-slate-100 text-slate-900 hover:bg-slate-50 font-black text-lg uppercase tracking-widest shadow-xl shadow-slate-100 transition-all hover:-translate-y-1 mb-6"
                        >
                           <Upload className="h-6 w-6 mr-4 text-blue-600" />
                           Select CSV Dataset
                        </Button>
                        <Input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleBulkImport(file); }} />
                        <div className="flex items-center justify-center gap-8 mt-4">
                           <Button variant="link" onClick={() => {}} className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Download Template.csv</Button>
                           <div className="flex items-center gap-3">
                              <Checkbox id="send-emails" checked={sendEmailsOnImport} onCheckedChange={(checked) => setSendEmailsOnImport(checked as boolean)} />
                              <Label htmlFor="send-emails" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto-notify leads</Label>
                           </div>
                        </div>
                     </div>

                     {bulkImportResults && (
                        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm text-left">
                           <h4 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Import Audit</h4>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6" />
                                 </div>
                                 <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none mb-1">{bulkImportResults.summary.imported}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Successful</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                                    <XCircle className="h-6 w-6" />
                                 </div>
                                 <div>
                                    <p className="text-2xl font-black text-slate-900 leading-none mb-1">{bulkImportResults.summary.failed}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="analytics" className="outline-none">
               <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-16">
                  {!analytics ? (
                     <div className="py-20 text-center">
                        <BarChart className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-lg font-black text-slate-400 uppercase tracking-widest">Awaiting Conversion Data</p>
                     </div>
                  ) : (
                     <div className="space-y-16">
                        <div>
                           <div className="flex items-center gap-4 mb-10">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                 <TrendingUp className="h-6 w-6" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Conversion Funnel</h3>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outreach to Liquid Reward lifecycle</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              {[
                                 { label: "Total Outreach", value: analytics.conversionFunnel.total, color: "blue" },
                                 { label: "Active Pending", value: analytics.conversionFunnel.pending, color: "amber" },
                                 { label: "Successful Conversions", value: analytics.conversionFunnel.converted, color: "emerald" },
                                 { label: "Conversion Yield", value: `${analytics.conversionFunnel.conversionRate.toFixed(1)}%`, color: "indigo" }
                              ].map((f, i) => (
                                 <div key={i} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{f.label}</p>
                                    <p className={cn("text-3xl font-black tracking-tighter", `text-${f.color}-600`)}>{f.value}</p>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 uppercase tracking-widest">Service Unit Performance</h3>
                           <div className="grid grid-cols-1 gap-6">
                              {Object.entries(analytics.byService).map(([service, data]: [string, any]) => (
                                 <div key={service} className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                       <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                          <Star className="h-6 w-6" />
                                       </div>
                                       <div>
                                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{service.replace(/_/g, ' ')}</h4>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Vertical</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-12">
                                       <div className="text-center">
                                          <p className="text-xl font-black text-slate-900">{data.total}</p>
                                          <p className="text-[9px] font-black text-slate-400 uppercase">Leads</p>
                                       </div>
                                       <div className="text-center">
                                          <p className="text-xl font-black text-emerald-600">{data.converted}</p>
                                          <p className="text-[9px] font-black text-slate-400 uppercase">Converted</p>
                                       </div>
                                       <div className="text-center">
                                          <p className="text-xl font-black text-indigo-600">₹{data.revenue}</p>
                                          <p className="text-[9px] font-black text-slate-400 uppercase">Earned</p>
                                       </div>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900">{ref.refereeName}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ref.refereeEmail}</p>
                                 </div>
                              </div>
                              <Badge className={cn("border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-xl", getStatusColor(ref.status))}>
                                 {ref.status}
                              </Badge>
                           </div>
                         ))}
                      </div>
                   </CardContent>
                </Card>
             </div>
             <div className="space-y-10">
                <Card className="border-none shadow-sm rounded-[48px] bg-white p-10 border border-slate-100/50">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Program Mechanics</h3>
                   <div className="space-y-6">
                      {["Generate Link", "Recipient Sync", "Credit Yield"].map((text, i) => (
                        <div key={i} className="flex gap-4">
                           <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">{i+1}</div>
                           <p className="text-sm font-medium text-slate-600">{text}</p>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>
          </div>
        </div>
      </div>

      <Dialog open={isReferDialogOpen} onOpenChange={setIsReferDialogOpen}>
        <DialogContent className="max-w-xl p-12 rounded-[48px]">
           <DialogHeader><DialogTitle className="text-3xl font-black">Send Invite</DialogTitle></DialogHeader>
           <div className="space-y-4">
              <Input placeholder="Client Name" value={referralData.refereeName} onChange={(e) => setReferralData({...referralData, refereeName: e.target.value})} />
              <Input placeholder="Client Email" value={referralData.refereeEmail} onChange={(e) => setReferralData({...referralData, refereeEmail: e.target.value})} />
              <Button className="w-full h-14 bg-blue-600" onClick={() => sendReferralMutation.mutate(referralData)}>Send Invitation</Button>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md p-10 rounded-[48px]">
           <DialogHeader><DialogTitle className="text-2xl font-black">Broadcast Link</DialogTitle></DialogHeader>
           <div className="space-y-6">
              <Input value={shareData.referralLink} readOnly />
              <Button className="w-full" onClick={() => copyToClipboard(shareData.referralLink, "Link")}>Copy Link</Button>
           </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
