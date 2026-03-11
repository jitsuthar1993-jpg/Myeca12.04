import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import {
  Building2,
  FileText,
  Calendar,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  Plus,
  Settings,
  TrendingUp,
  Receipt,
  Users,
  Shield,
  BarChart3,
  FolderOpen,
  AlertCircle,
  ChevronRight,
  IndianRupee,
  Percent
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Mock data for compliance items
const COMPLIANCE_ITEMS = [
  { id: 1, name: 'GST Return - GSTR-3B', type: 'gst', dueDate: '2024-12-20', status: 'pending', priority: 'high' },
  { id: 2, name: 'GST Return - GSTR-1', type: 'gst', dueDate: '2024-12-11', status: 'completed', priority: 'medium' },
  { id: 3, name: 'TDS Return - Q3', type: 'tds', dueDate: '2025-01-31', status: 'pending', priority: 'medium' },
  { id: 4, name: 'Advance Tax - Q4', type: 'income-tax', dueDate: '2025-03-15', status: 'pending', priority: 'high' },
  { id: 5, name: 'Annual ROC Filing', type: 'roc', dueDate: '2024-12-30', status: 'pending', priority: 'high' },
  { id: 6, name: 'Director KYC', type: 'roc', dueDate: '2024-09-30', status: 'completed', priority: 'medium' },
  { id: 7, name: 'PF Payment', type: 'payroll', dueDate: '2024-12-15', status: 'pending', priority: 'high' },
  { id: 8, name: 'ESI Payment', type: 'payroll', dueDate: '2024-12-15', status: 'pending', priority: 'medium' },
];

// Mock company data
const COMPANY_DATA = {
  name: 'TechStart Solutions Pvt Ltd',
  cin: 'U72200KA2020PTC123456',
  gstin: '29AABCT1234A1ZA',
  pan: 'AABCT1234A',
  tan: 'BLRT12345A',
  incorporationDate: '2020-05-15',
  financialYear: '2024-25',
  complianceScore: 78,
  pendingFilings: 5,
  upcomingDeadlines: 3,
};

export default function BusinessDashboardPage() {
  const [companyData, setCompanyData] = useState(COMPANY_DATA);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  // Days until deadline
  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Pending and upcoming items
  const pendingItems = COMPLIANCE_ITEMS.filter(item => item.status === 'pending');
  const urgentItems = pendingItems.filter(item => getDaysUntil(item.dueDate) <= 7);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Business Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{companyData.name}</h1>
                <p className="text-slate-300 text-sm">CIN: {companyData.cin}</p>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
              <Settings className="h-4 w-4 mr-2" />
              Company Settings
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Compliance Score</p>
                    <p className="text-2xl font-bold">{companyData.complianceScore}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
                <Progress value={companyData.complianceScore} className="mt-2 h-1.5 bg-white/20" />
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Pending Filings</p>
                    <p className="text-2xl font-bold">{companyData.pendingFilings}</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Upcoming (7 days)</p>
                    <p className="text-2xl font-bold">{urgentItems.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Financial Year</p>
                    <p className="text-2xl font-bold">{companyData.financialYear}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for urgent items */}
        {urgentItems.length > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Urgent Action Required</AlertTitle>
            <AlertDescription className="text-red-700">
              You have {urgentItems.length} compliance item(s) due within the next 7 days. 
              Review and complete them to avoid penalties.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Calendar</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Info */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">GSTIN</p>
                      <p className="font-medium">{companyData.gstin}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">PAN</p>
                      <p className="font-medium">{companyData.pan}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">TAN</p>
                      <p className="font-medium">{companyData.tan}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Incorporated</p>
                      <p className="font-medium">{companyData.incorporationDate}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Filings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      Pending Filings
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingItems.slice(0, 5).map((item) => {
                      const daysUntil = getDaysUntil(item.dueDate);
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 border-l-4 ${getPriorityColor(item.priority)} bg-gray-50 rounded-r-lg`}
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              className={daysUntil <= 7 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                            >
                              {daysUntil} days left
                            </Badge>
                            <Button size="sm">File Now</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Receipt className="h-6 w-6 text-orange-600" />
                    <span>File GST Return</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>File TDS Return</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Users className="h-6 w-6 text-green-600" />
                    <span>Process Payroll</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-purple-600" />
                    <span>Upload Documents</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100">
                      <Receipt className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4/12</p>
                      <p className="text-sm text-gray-500">GST Returns Filed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2/4</p>
                      <p className="text-sm text-gray-500">TDS Returns Filed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">3/4</p>
                      <p className="text-sm text-gray-500">Advance Tax Paid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">1/3</p>
                      <p className="text-sm text-gray-500">ROC Filings Done</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Calendar Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Compliance Calendar</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminders
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {COMPLIANCE_ITEMS.map((item) => {
                    const daysUntil = getDaysUntil(item.dueDate);
                    return (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          item.status === 'completed' ? 'bg-green-50 border-green-200' : 
                          daysUntil <= 7 ? 'bg-red-50 border-red-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {item.status === 'completed' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : daysUntil <= 7 ? (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          ) : (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.type.toUpperCase()} • Due: {new Date(item.dueDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(item.status)}
                          {item.status !== 'completed' && (
                            <Button size="sm">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Document Vault</CardTitle>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Incorporation Documents', count: 5, icon: Building2 },
                    { name: 'GST Certificates', count: 2, icon: Receipt },
                    { name: 'PAN & TAN', count: 2, icon: FileText },
                    { name: 'Board Resolutions', count: 8, icon: Users },
                    { name: 'Financial Statements', count: 3, icon: BarChart3 },
                    { name: 'Tax Returns', count: 4, icon: IndianRupee },
                  ].map((folder) => (
                    <Card key={folder.name} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-blue-100">
                            <folder.icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{folder.name}</p>
                            <p className="text-sm text-gray-500">{folder.count} files</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Coming soon - Connect with your accounting software</CardDescription>
              </CardHeader>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Virtual CFO Dashboard</h3>
                <p className="text-gray-500 mb-4">
                  Get real-time financial insights, P&L statements, and cash flow analysis.
                </p>
                <Button asChild>
                  <Link href="/services/marketplace">Explore Virtual CFO Services</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

