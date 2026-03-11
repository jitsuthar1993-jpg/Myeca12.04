import { useState, useRef } from "react";
import { motion } from "framer-motion";
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
  const { data: overviewData } = useQuery({
    queryKey: ["/api/referrals/overview"]
  });

  // Fetch user referral stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/referrals/stats"]
  });

  // Fetch user referrals
  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"]
  });

  // Fetch user rewards
  const { data: rewardsData } = useQuery({
    queryKey: ["/api/referrals/rewards"]
  });

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery({
    queryKey: ["/api/referrals/leaderboard"]
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
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
      const response = await fetch("/api/referrals/bulk-import", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
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
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Referral Program | MyeCA.in"
        description="Earn rewards by referring clients to our tax and business services"
        keywords="referral program, rewards, tax referrals, business referrals"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Referral Program</h1>
            <p className="text-xl text-gray-600">Earn rewards by referring clients to our services</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => generateLinkMutation.mutate({ serviceType: "all_services" })}>
              <Share2 className="h-4 w-4 mr-2" />
              Generate Link
            </Button>
            <Button onClick={() => setIsReferDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Refer Client
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <span className="text-2xl font-bold">{stats.totalReferrals}</span>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <span className="text-2xl font-bold">{conversionRate.toFixed(1)}%</span>
                  <p className="text-xs text-gray-500">{stats.successfulReferrals} converted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-8 w-8 text-yellow-600" />
                <div>
                  <span className="text-2xl font-bold">\u20B9{stats.availableRewards}</span>
                  <p className="text-xs text-gray-500">Ready to redeem</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-8 w-8 text-purple-600" />
                <div>
                  <span className="text-2xl font-bold">\u20B9{stats.totalRewards}</span>
                  <p className="text-xs text-gray-500">Lifetime earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="program">Program Details</TabsTrigger>
            <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
                <CardDescription>Track your referrals and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {referralsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No referrals yet</p>
                    <Button onClick={() => setIsReferDialogOpen(true)}>
                      Create your first referral
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral: Referral) => {
                      const StatusIcon = statusIcons[referral.status] || Clock;
                      
                      return (
                        <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 bg-${statusColors[referral.status]}-100 rounded-lg`}>
                              <StatusIcon className={`h-5 w-5 text-${statusColors[referral.status]}-600`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{referral.refereeName}</h4>
                              <p className="text-sm text-gray-500">{referral.refereeEmail}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-400">Code: {referral.referralCode}</span>
                                <Badge variant="outline" className="text-xs">
                                  {referral.serviceType.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {referral.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminderEmail(referral.id)}
                                className="mr-2"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Remind
                              </Button>
                            )}
                            <div className="text-right">
                              <Badge variant={referral.status === "converted" ? "default" : "secondary"}>
                                {referral.status}
                              </Badge>
                              {referral.rewardEarned && (
                                <p className="text-sm font-medium text-green-600 mt-1">
                                  +\u20B9{referral.rewardEarned}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(referral.createdAt).toLocaleDateString()}
                              </p>
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

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Rewards</CardTitle>
                <CardDescription>Manage and redeem your earned rewards</CardDescription>
              </CardHeader>
              <CardContent>
                {rewards.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rewards earned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rewards.map((reward: Reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Coins className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">\u20B9{reward.amount} {reward.type}</h4>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                            <p className="text-xs text-gray-400">
                              Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {reward.status === "available" ? (
                            <Button 
                              size="sm"
                              onClick={() => redeemRewardMutation.mutate(reward.id)}
                              disabled={redeemRewardMutation.isPending}
                            >
                              {redeemRewardMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Redeem"
                              )}
                            </Button>
                          ) : (
                            <Badge variant="outline">{reward.status}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>See how you compare with other top referrers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((leader: any, index: number) => (
                    <div key={leader.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Crown className="h-5 w-5 text-yellow-600" />}
                          {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                          {index === 2 && <Star className="h-5 w-5 text-orange-600" />}
                          <span className="font-bold text-lg">#{leader.rank}</span>
                        </div>
                        <Avatar>
                          <AvatarImage src={leader.avatar} />
                          <AvatarFallback>{leader.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{leader.userName}</h4>
                          <p className="text-sm text-gray-500">
                            {leader.successfulReferrals} successful referrals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">\u20B9{leader.totalRewards}</p>
                        <p className="text-xs text-gray-500">Total earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="program" className="space-y-6">
            {program && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{program.programName}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Reward Structure</h3>
                        <div className="grid gap-3">
                          {program.benefits.map((benefit: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium">{benefit.service}</span>
                                <p className="text-sm text-gray-600">Your reward: {benefit.referrerReward}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-green-600">Client gets: {benefit.refereeDiscount}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">How It Works</h3>
                        <div className="grid gap-2">
                          {program.howItWorks.map((step: string, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {program.terms.map((term: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{term}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="bulk-import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import Referrals</CardTitle>
                <CardDescription>Upload a CSV file to import multiple referrals at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a CSV file with columns: name, email, service (optional), message (optional)
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = 'data:text/csv;charset=utf-8,name,email,service,message\nJohn Doe,john@example.com,itr_filing,Looking forward to working with you\nJane Smith,jane@example.com,gst_registration,';
                          link.download = 'referral_template.csv';
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                      <Input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        id="csv-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Handle file upload
                            handleBulkImport(file);
                          }
                        }}
                      />
                      <Button onClick={() => document.getElementById('csv-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="send-emails" 
                      checked={sendEmailsOnImport}
                      onCheckedChange={(checked) => setSendEmailsOnImport(checked as boolean)}
                    />
                    <Label htmlFor="send-emails" className="text-sm font-normal">
                      Send invitation emails to all imported referrals
                    </Label>
                  </div>

                  {/* Import Results */}
                  {bulkImportResults && (
                    <div>
                      <h4 className="font-medium mb-2">Import Results</h4>
                      <div className="space-y-2">
                        {bulkImportResults.summary.imported > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{bulkImportResults.summary.imported} referrals imported successfully</span>
                          </div>
                        )}
                        {bulkImportResults.summary.failed > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>{bulkImportResults.summary.failed} referrals failed to import</span>
                          </div>
                        )}
                        {bulkImportResults.errors.length > 0 && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                            <p className="font-medium mb-1">Errors:</p>
                            {bulkImportResults.errors.slice(0, 3).map((error: any, idx: number) => (
                              <p key={idx}>Row {error.row}: {error.error}</p>
                            ))}
                            {bulkImportResults.errors.length > 3 && (
                              <p>...and {bulkImportResults.errors.length - 3} more errors</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Analytics</CardTitle>
                <CardDescription>Track your referral performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="space-y-6">
                    {/* Conversion Funnel */}
                    <div>
                      <h3 className="font-medium mb-3">Conversion Funnel</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-lg p-4 mb-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {analytics.conversionFunnel.total}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Total Referrals</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-yellow-100 rounded-lg p-4 mb-2">
                            <span className="text-2xl font-bold text-yellow-600">
                              {analytics.conversionFunnel.pending}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Pending</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-green-100 rounded-lg p-4 mb-2">
                            <span className="text-2xl font-bold text-green-600">
                              {analytics.conversionFunnel.converted}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Converted</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-purple-100 rounded-lg p-4 mb-2">
                            <span className="text-2xl font-bold text-purple-600">
                              {analytics.conversionFunnel.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Conversion Rate</p>
                        </div>
                      </div>
                    </div>

                    {/* By Service Type */}
                    <div>
                      <h3 className="font-medium mb-3">Performance by Service</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.byService).map(([service, data]: [string, any]) => (
                          <div key={service} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium capitalize">{service.replace(/_/g, ' ')}</h4>
                              <Badge>{data.total} referrals</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Converted:</span>
                                <span className="ml-1 font-medium">{data.converted}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Pending:</span>
                                <span className="ml-1 font-medium">{data.pending}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Revenue:</span>
                                <span className="ml-1 font-medium text-green-600">\u20B9{data.revenue}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Performing Services */}
                    {analytics.topPerformingServices.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Top Performing Services</h3>
                        <div className="space-y-2">
                          {analytics.topPerformingServices.map((service: any, index: number) => (
                            <div key={service.service} className="flex items-center gap-3">
                              <Trophy className={`h-5 w-5 ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 
                                'text-orange-500'
                              }`} />
                              <span className="font-medium capitalize">
                                {service.service.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({service.converted} conversions, \u20B9{service.revenue} earned)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No analytics data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Refer Client Dialog */}
      <Dialog open={isReferDialogOpen} onOpenChange={setIsReferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refer a Client</DialogTitle>
            <DialogDescription>Create a new referral and earn rewards</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="referee-name">Client Name</Label>
              <Input
                id="referee-name"
                value={referralData.refereeName}
                onChange={(e) => setReferralData(prev => ({ ...prev, refereeName: e.target.value }))}
                placeholder="Enter client's full name"
              />
            </div>
            <div>
              <Label htmlFor="referee-email">Client Email</Label>
              <Input
                id="referee-email"
                type="email"
                value={referralData.refereeEmail}
                onChange={(e) => setReferralData(prev => ({ ...prev, refereeEmail: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="service-type">Service Type</Label>
              <Select 
                value={referralData.serviceType} 
                onValueChange={(value) => setReferralData(prev => ({ ...prev, serviceType: value }))}
              >
                <SelectTrigger id="service-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_services">All Services</SelectItem>
                  <SelectItem value="itr_filing">ITR Filing</SelectItem>
                  <SelectItem value="gst_registration">GST Registration</SelectItem>
                  <SelectItem value="company_registration">Company Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={referralData.message}
                onChange={(e) => setReferralData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal note for your referral"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsReferDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createReferralMutation.mutate(referralData)}
                disabled={!referralData.refereeName || !referralData.refereeEmail || createReferralMutation.isPending}
              >
                {createReferralMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Referral"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Referral</DialogTitle>
            <DialogDescription>Share your unique referral link and code</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Referral Code</Label>
              <div className="flex gap-2 mt-1">
                <Input value={shareData.referralCode} readOnly />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => copyToClipboard(shareData.referralCode, "Referral code")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Referral Link</Label>
              <div className="flex gap-2 mt-1">
                <Input value={shareData.referralLink} readOnly className="text-xs" />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => copyToClipboard(shareData.referralLink, "Referral link")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {shareData.qrCode && (
              <div className="text-center">
                <Label>QR Code</Label>
                <div className="mt-2">
                  <img src={shareData.qrCode} alt="QR Code" className="mx-auto border rounded" />
                </div>
              </div>
            )}
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => copyToClipboard(shareData.referralLink, "Referral link")}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}