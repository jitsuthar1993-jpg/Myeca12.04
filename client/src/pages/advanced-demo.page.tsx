import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, Brain, Shield, Mail, Send, CheckCircle, 
  AlertCircle, Loader2, RefreshCw, TestTube
} from "lucide-react";
import SEO from "@/components/SEO";

export default function AdvancedDemoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const testNotifications = async () => {
    setLoading("notifications");
    try {
      // Test creating a notification
      const createResult = await apiRequest("/api/notifications/test", {
        method: "POST"
      });
      
      // Test fetching notifications
      const fetchResult = await apiRequest("/api/notifications");
      
      setResults(prev => ({
        ...prev,
        notifications: {
          created: createResult,
          fetched: fetchResult
        }
      }));
      
      toast({
        title: "Notifications API tested successfully",
        description: `Found ${(fetchResult as any).notifications?.length || 0} notifications`,
      });
    } catch (error) {
      toast({
        title: "Notifications API test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const testAIOptimizer = async () => {
    setLoading("ai");
    try {
      const result = await apiRequest("/api/ai-optimizer/optimize", {
        method: "POST",
        body: JSON.stringify({
          income: 1000000,
          age: 35,
          currentDeductions: {
            section80C: 100000,
            section80D: 25000,
            hra: 150000
          }
        })
      });
      
      setResults(prev => ({
        ...prev,
        aiOptimizer: result
      }));
      
      toast({
        title: "AI Optimizer tested successfully",
        description: `Recommended regime: ${(result as any).analysis?.recommendedRegime}`,
      });
    } catch (error) {
      toast({
        title: "AI Optimizer test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const test2FA = async () => {
    setLoading("2fa");
    try {
      const result = await apiRequest("/api/2fa/status");
      
      setResults(prev => ({
        ...prev,
        twoFactor: result
      }));
      
      toast({
        title: "2FA API tested successfully",
        description: `2FA is ${(result as any).enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "2FA API test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const testEmail = async () => {
    setLoading("email");
    try {
      const templatesResult = await apiRequest("/api/email/templates");
      
      setResults(prev => ({
        ...prev,
        email: templatesResult
      }));
      
      toast({
        title: "Email API tested successfully",
        description: `Found ${(templatesResult as any).templates?.length || 0} email templates`,
      });
    } catch (error) {
      toast({
        title: "Email API test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const apiTests = [
    {
      id: "notifications",
      title: "Notifications API",
      description: "Real-time notification system",
      icon: Bell,
      color: "blue",
      test: testNotifications
    },
    {
      id: "ai",
      title: "AI Tax Optimizer",
      description: "Smart tax recommendations",
      icon: Brain,
      color: "purple",
      test: testAIOptimizer
    },
    {
      id: "2fa",
      title: "Two-Factor Authentication",
      description: "Enhanced security features",
      icon: Shield,
      color: "green",
      test: test2FA
    },
    {
      id: "email",
      title: "Email Service",
      description: "Automated email system",
      icon: Mail,
      color: "orange",
      test: testEmail
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Advanced Features API Demo | MyeCA.in"
        description="Test and explore the advanced API features of MyeCA platform"
        keywords="api demo, advanced features, testing, development"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <TestTube className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Advanced Features API Demo</h1>
          </div>
          <p className="text-xl text-gray-600">Test the backend API integration for advanced features</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {apiTests.map((api, index) => {
            const Icon = api.icon;
            const isLoading = loading === api.id;
            const hasResult = results[api.id];
            
            return (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${api.color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${api.color}-600`} />
                        </div>
                        <div>
                          <CardTitle>{api.title}</CardTitle>
                          <CardDescription>{api.description}</CardDescription>
                        </div>
                      </div>
                      {hasResult && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={api.test}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Test {api.title}
                        </>
                      )}
                    </Button>
                    
                    {hasResult && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(results[api.id], null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Integration Status</CardTitle>
            <CardDescription>
              All advanced features are now connected to backend APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Notifications API: /api/notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>AI Optimizer API: /api/ai-optimizer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>2FA API: /api/2fa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Email Service API: /api/email</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}