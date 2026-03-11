import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Coins, Target, FileText, Download, Calendar, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import TaxSummaryDashboard from "@/components/itr/TaxSummaryDashboard";

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
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  const years = ['2024-25', '2023-24', '2022-23', 'all'];

  // Get tax optimization score
  const getTaxOptimizationScore = () => {
    const maxDeductions = 150000; // Section 80C limit
    const utilizationRate = (analytics.totalDeductions / maxDeductions) * 100;
    
    if (utilizationRate >= 80) return { score: 90, label: 'Excellent', color: 'text-green-600' };
    if (utilizationRate >= 60) return { score: 70, label: 'Good', color: 'text-blue-600' };
    if (utilizationRate >= 40) return { score: 50, label: 'Average', color: 'text-yellow-600' };
    return { score: 30, label: 'Needs Improvement', color: 'text-red-600' };
  };

  const optimizationScore = getTaxOptimizationScore();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your tax filing and optimization opportunities</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>
                        {year === 'all' ? 'All Years' : `AY ${year}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile</label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Profiles</SelectItem>
                    {profiles.map((profile: any) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.firstName} {profile.lastName} ({profile.relation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalIncome)}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last year</p>
                </div>
                <Coins className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tax Liability</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.totalTax)}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {((analytics.totalTax / analytics.totalIncome) * 100).toFixed(1)}% of income
                  </p>
                </div>
                <Target className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalDeductions)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {analytics.taxEfficiency.toFixed(1)}% efficiency
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filed Returns</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.filedReturns}</p>
                  <p className="text-xs text-gray-600 mt-1">{analytics.draftReturns} drafts pending</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Optimization Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Tax Optimization Score
            </CardTitle>
            <CardDescription>Based on your deduction utilization and tax planning strategies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${optimizationScore.color} mb-2`}>
                {optimizationScore.score}
              </div>
              <div className="text-lg font-semibold text-gray-700">{optimizationScore.label}</div>
              <Progress value={optimizationScore.score} className="mt-4 h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {((analytics.totalDeductions / 150000) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-blue-600">Deduction Utilization</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(analytics.totalDeductions * 0.3)}
                </div>
                <div className="text-sm text-green-600">Tax Saved</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency((150000 - analytics.totalDeductions) * 0.3)}
                </div>
                <div className="text-sm text-purple-600">Potential Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filing History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Filing History
            </CardTitle>
            <CardDescription>Your tax return filing activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReturns.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tax returns found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start filing your tax returns to see analytics here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReturns.map((return_: any) => (
                  <div key={return_.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {return_.itrType} - {return_.assessmentYear}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(return_.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={return_.status === 'filed' ? 'default' : 'secondary'}>
                        {return_.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Tax Summary */}
        {filteredReturns.length > 0 && (
          <TaxSummaryDashboard formData={filteredReturns[0]?.formData || {}} />
        )}

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Steps to optimize your tax planning for next year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Investment Planning</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Maximize your Section 80C investments before the financial year ends.
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Health Insurance</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Consider increasing health insurance coverage for additional Section 80D benefits.
                </p>
                <Button size="sm" variant="outline">Explore Options</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">House Property</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Review home loan interest deductions and rental income declarations.
                </p>
                <Button size="sm" variant="outline">Review Setup</Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Business Expenses</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Ensure all legitimate business expenses are properly documented and claimed.
                </p>
                <Button size="sm" variant="outline">Expense Tracker</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}