import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  FileText, 
  Calculator, 
  Upload, 
  PlusCircle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  ArrowRight,
  Phone,
  MessageSquare,
  Bell,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import QuickActions from "@/components/ui/quick-actions";
import { useAuth } from "@/components/AuthProvider";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardPage() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Fetch user services
  const { data: userServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/user-services'],
    enabled: !!userId
  });

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      // Assuming apiRequest handles base URL
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      return data.notifications || [];
    },
    enabled: !!userId
  });

  // Fetch activity
  const { data: activityData } = useQuery({
    queryKey: ['/api/user/activity'],
    queryFn: async () => {
      const res = await fetch('/api/user/activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      return data.data?.activities || [];
    },
    enabled: !!userId
  });
  
  // Mock data for dashboard
  const profiles = [
    { id: 1, name: "Primary Profile", isActive: true, relation: "Self" }
  ];
  const activeProfile = profiles[0];
  
  const taxReturns = [
    { id: 1, assessmentYear: "2024-25", status: "draft", filingDate: null },
    { id: 2, assessmentYear: "2023-24", status: "filed", filingDate: "2024-07-30" }
  ];
  
  const documents = [
    { id: 1, name: "Form 16", category: "Salary", uploadDate: "2024-01-15" },
    { id: 2, name: "Bank Statement", category: "Banking", uploadDate: "2024-01-20" }
  ];

  // StatusChip handles status colors centrally.

  // StatusChip handles status icons centrally.
  
  const getServiceStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Payment Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold text-blue-600">{user?.username || user?.email || 'User'}</span>!
              </p>
            </div>
            <div className="flex items-center space-x-4">
               <Link href="/settings/account">
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5 text-gray-500" />
                  </Button>
               </Link>
               <Button variant="ghost" size="icon" className="relative">
                 <Bell className="h-5 w-5 text-gray-500" />
                 {notificationsData?.filter((n: any) => !n.read).length > 0 && (
                   <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                 )}
               </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tax Returns</p>
                  <p className="text-2xl font-bold text-gray-900">{taxReturns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Year</p>
                  <p className="text-2xl font-bold text-gray-900">2024-25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Notifications & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           {/* Notifications */}
           <div className="lg:col-span-2">
              <Card className="h-full">
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                       <Bell className="w-5 h-5 text-blue-600" />
                       Recent Notifications
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                       {notificationsData?.filter((n: any) => !n.read).length || 0} New
                    </Badge>
                 </CardHeader>
                 <CardContent>
                    <ScrollArea className="h-[250px] pr-4">
                       {notificationsData && notificationsData.length > 0 ? (
                          <div className="space-y-4">
                             {notificationsData.map((notification: any) => (
                                <div key={notification.id} className={`p-3 rounded-lg border ${notification.read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}>
                                   <div className="flex justify-between items-start mb-1">
                                      <h4 className={`text-sm font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                         {notification.title}
                                      </h4>
                                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                         {new Date(notification.createdAt).toLocaleDateString()}
                                      </span>
                                   </div>
                                   <p className="text-xs text-slate-600 line-clamp-2">{notification.message}</p>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                             <Bell className="w-8 h-8 mb-2 opacity-20" />
                             No new notifications
                          </div>
                       )}
                    </ScrollArea>
                 </CardContent>
              </Card>
           </div>

           {/* Activity Timeline */}
           <div>
              <Card className="h-full">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                       <Activity className="w-5 h-5 text-green-600" />
                       Recent Activity
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ScrollArea className="h-[250px] pr-4">
                       {activityData && activityData.length > 0 ? (
                          <div className="relative border-l border-slate-200 ml-2 space-y-6 py-2">
                             {activityData.map((activity: any, index: number) => (
                                <div key={activity.id} className="ml-6 relative">
                                   <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                                   <div className="flex flex-col">
                                      <span className="text-sm font-medium text-slate-900">{activity.action}</span>
                                      <span className="text-xs text-slate-500 mb-0.5">{activity.description}</span>
                                      <span className="text-[10px] text-slate-400">
                                         {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                             <Activity className="w-8 h-8 mb-2 opacity-20" />
                             No recent activity
                          </div>
                       )}
                    </ScrollArea>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* My Services Section - New! */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    My Services
                  </CardTitle>
                  <CardDescription>Track the status of your purchased services</CardDescription>
                </div>
                <Link href="/services">
                  <Button variant="outline" size="sm">
                    Browse Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : userServices.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No services yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by purchasing a service from our catalog.</p>
                  <div className="mt-6">
                    <Link href="/services">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Browse Services
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userServices.map((userService: any) => (
                    <div key={userService.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {userService.service?.name || 'Service'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Purchased on {new Date(userService.purchaseDate).toLocaleDateString()}
                          </p>
                          {userService.assignedTo && (
                            <p className="text-sm text-gray-600 mt-1">
                              Assigned to: {userService.assignedTo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <StatusChip status={userService.status} size="sm" />
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tax Returns */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tax Returns</CardTitle>
                <CardDescription>Your recent tax filings</CardDescription>
              </CardHeader>
              <CardContent>
                {taxReturns.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tax returns yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first tax return.</p>
                    <div className="mt-6">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Tax Return
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {taxReturns.map((taxReturn: any) => (
                      <div key={taxReturn.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {taxReturn.itrType} - {taxReturn.assessmentYear}
                            </p>
                            <p className="text-sm text-gray-500">
                              Created {new Date(taxReturn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StatusChip status={taxReturn.status} />
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Information */}
        {activeProfile && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Active Profile</CardTitle>
              <CardDescription>Currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeProfile.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {activeProfile.relation === 'self' ? 'Your Profile' : `${activeProfile.relation}'s Profile`}
                  </p>
                  {activeProfile.pan && (
                    <p className="text-sm text-gray-500">PAN: {activeProfile.pan}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}