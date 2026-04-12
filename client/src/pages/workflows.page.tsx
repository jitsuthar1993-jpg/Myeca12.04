import { useState } from "react";
import { m } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Zap, Plus, Play, Pause, Edit2, Trash2, Clock,
  Mail, Bell, FileText, Shield, TrendingUp, Calendar,
  CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";
import SEO from "@/components/SEO";

interface Workflow {
  id: number;
  name: string;
  description?: string;
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  enabled: boolean;
  status: string;
  lastRun?: string;
  nextRun?: string;
  runs: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: any;
  actions: any[];
}

const triggerIcons: Record<string, any> = {
  schedule: Clock,
  event: Zap,
  manual: Play,
  condition: Shield
};

const actionIcons: Record<string, any> = {
  email: Mail,
  notification: Bell,
  document: FileText,
  compliance_check: Shield,
  reminder: Clock,
  report: TrendingUp
};

export default function WorkflowsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  // Fetch workflows
  const { data: workflowsData, isLoading } = useQuery<any>({
    queryKey: ["/api/workflows"]
  });

  // Fetch templates
  const { data: templatesData } = useQuery<any>({
    queryKey: ["/api/workflows/templates"]
  });

  // Create workflow mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/workflows", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow created successfully",
        description: "Your automation is now active."
      });
      setIsCreateDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({
        title: "Failed to create workflow",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Toggle workflow mutation
  const toggleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/workflows/${id}/toggle`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow updated",
        description: "The workflow status has been changed."
      });
    }
  });

  // Delete workflow mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/workflows/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow deleted",
        description: "The automation has been removed."
      });
    }
  });

  const workflows = workflowsData?.workflows || [];
  const templates = templatesData?.templates || [];

  const handleCreateFromTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsCreateDialogOpen(true);
  };

  const handleCreateWorkflow = () => {
    if (!selectedTemplate) return;
    
    createMutation.mutate({
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      trigger: selectedTemplate.trigger,
      actions: selectedTemplate.actions,
      enabled: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Workflow Automation | MyeCA.in"
        description="Automate your tax and compliance processes"
        keywords="workflow automation, tax automation, compliance automation"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Workflow Automation</h1>
            <p className="text-xl text-gray-600">Automate repetitive tasks and never miss a deadline</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </m.div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : workflows.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Zap className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No workflows created yet</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create your first workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {workflows.map((workflow: Workflow) => {
                  const TriggerIcon = triggerIcons[workflow.trigger.type] || Zap;
                  
                  return (
                    <m.div
                      key={workflow.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <TriggerIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                                  <Badge variant={workflow.enabled ? "default" : "secondary"}>
                                    {workflow.enabled ? "Active" : "Paused"}
                                  </Badge>
                                </div>
                                {workflow.description && (
                                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                                )}
                                
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {workflow.nextRun ? (
                                      <span>Next run: {new Date(workflow.nextRun).toLocaleString()}</span>
                                    ) : (
                                      <span>Manual trigger</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Play className="h-4 w-4" />
                                    <span>{workflow.runs} runs</span>
                                  </div>
                                  {workflow.lastRun && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span>Last run: {new Date(workflow.lastRun).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-3">
                                  {workflow.actions.map((action, index) => {
                                    const ActionIcon = actionIcons[action.type] || Zap;
                                    return (
                                      <div
                                        key={index}
                                        className="bg-gray-100 p-1.5 rounded"
                                        title={action.type}
                                      >
                                        <ActionIcon className="h-3.5 w-3.5 text-gray-600" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={workflow.enabled}
                                onCheckedChange={() => toggleMutation.mutate(workflow.id)}
                              />
                              <Button variant="ghost" size="icon">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteMutation.mutate(workflow.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </m.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: WorkflowTemplate) => {
                const TriggerIcon = triggerIcons[template.trigger.type] || Zap;
                
                return (
                  <m.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <TriggerIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {template.actions.map((action, index) => {
                              const ActionIcon = actionIcons[action.type] || Zap;
                              return (
                                <div
                                  key={index}
                                  className="bg-gray-100 p-1.5 rounded"
                                  title={action.type}
                                >
                                  <ActionIcon className="h-3.5 w-3.5 text-gray-600" />
                                </div>
                              );
                            })}
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleCreateFromTemplate(template)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? 
                `Create a workflow based on "${selectedTemplate.name}" template` : 
                "Choose a template to get started"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <Label>Workflow Name</Label>
                <Input 
                  value={selectedTemplate.name} 
                  readOnly 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Trigger Type</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge>{selectedTemplate.trigger.type}</Badge>
                  <span className="text-sm text-gray-600">
                    {JSON.stringify(selectedTemplate.trigger.config)}
                  </span>
                </div>
              </div>
              
              <div>
                <Label>Actions</Label>
                <div className="space-y-2 mt-1">
                  {selectedTemplate.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{action.type}</Badge>
                      <span className="text-sm text-gray-600">
                        {JSON.stringify(action.config)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateWorkflow}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workflow"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Please select a template from the Templates tab</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
