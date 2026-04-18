import { useState } from "react";
import { m } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Zap, Plus, Edit2, Trash2, Clock,
  Mail, Bell, FileText, Shield, 
  Loader2, Activity, Cpu, Settings
} from "lucide-react";
import SEO from "@/components/SEO";
import { Layout } from "@/components/admin/Layout";
import { cn } from "@/lib/utils";

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

export default function WorkflowsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch workflows
  const { data: workflowsData = { workflows: [
    { id: 1, name: "GST Return Reminder", enabled: true, status: "idle", runs: 45, trigger: { type: "schedule" }, nextRun: "2025-05-10T10:00:00Z" },
    { id: 2, name: "Auto-Archive Documents", enabled: true, status: "running", runs: 128, trigger: { type: "event" }, nextRun: "Live" },
    { id: 3, name: "ITR Optimization Scan", enabled: false, status: "disabled", runs: 12, trigger: { type: "manual" }, nextRun: "-" }
  ] }, isLoading } = useQuery<any>({
    queryKey: ["/api/workflows"]
  });

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
    <Layout>
      <SEO
        title="Workflow Automation | MyeCA.in"
        description="Automate your tax and compliance processes"
        keywords="workflow automation, tax automation, compliance automation"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Sidebar - Navigation & Quick Stats */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-purple-500 to-indigo-500 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-4xl font-black text-purple-600 border border-purple-100">
                         <Zap className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Automation Engine</h2>
                      <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         {workflows.length} Active Workflows
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 space-y-2">
                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workflow Status</Label>
                   <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Healthy", value: "08", color: "emerald" },
                        { label: "Warning", value: "01", color: "orange" },
                        { label: "Failed", value: "00", color: "red" },
                        { label: "Paused", value: "02", color: "slate" }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center text-center">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                           <span className={cn("text-sm font-black leading-none", `text-${stat.color}-600`)}>{stat.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </CardContent>
          </Card>

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/50 relative overflow-hidden group cursor-pointer shadow-xl shadow-purple-50">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2" />
             <Plus className="h-8 w-8 text-purple-500 mb-6" />
             <h3 className="font-black text-xl leading-tight mb-3 text-slate-900">New Automation</h3>
             <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-6">Create a bespoke workflow from scratch or use our high-conversion templates.</p>
             <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full bg-purple-600 text-white hover:bg-purple-700 font-black text-[10px] uppercase tracking-widest h-11 rounded-2xl shadow-lg shadow-purple-100 border-none">Initialize Creation</Button>
          </div>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Operations Control</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Workflow Orchestrator</h1>
              <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                Automate repetitive tasks, synchronize data across platforms, and ensure zero-latency compliance monitoring.
              </p>
            </div>
          </div>

          <Tabs defaultValue="active" className="space-y-10">
            <TabsList className="h-16 p-2 bg-white rounded-[24px] shadow-sm border border-slate-100/50 overflow-x-auto no-scrollbar justify-start sm:justify-center">
               <TabsTrigger value="active" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Active Engines</TabsTrigger>
               <TabsTrigger value="templates" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Template Library</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="outline-none space-y-6">
              {isLoading ? (
                <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[48px] border border-slate-100">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-200" />
                  <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warming up engines...</p>
                </div>
              ) : workflows.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[48px] border border-dashed border-slate-100">
                   <Zap className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                   <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase tracking-tighter">Zero Automations Detected</h3>
                   <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed mb-8">Start your automation journey by deploying your first workflow from our template library.</p>
                   <Button onClick={() => setIsCreateDialogOpen(true)} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest border-none">Deploy First Engine</Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {workflows.map((workflow: Workflow) => {
                    const TriggerIcon = triggerIcons[workflow.trigger.type] || Zap;
                    return (
                      <Card key={workflow.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white group hover:shadow-xl transition-all">
                        <CardContent className="p-8">
                           <div className="flex items-start justify-between">
                             <div className="flex items-start gap-6">
                               <div className="w-16 h-16 bg-purple-50 rounded-[24px] flex items-center justify-center border border-purple-100 shrink-0">
                                 <TriggerIcon className="h-7 w-7 text-purple-600" />
                               </div>
                               <div className="space-y-4">
                                 <div className="flex items-center gap-4">
                                   <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-tighter">{workflow.name}</h3>
                                   <Badge className={cn("rounded-full px-3 h-6 border-none text-[9px] font-black uppercase tracking-widest", workflow.enabled ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}>
                                     {workflow.enabled ? "Operational" : "Standby"}
                                   </Badge>
                                 </div>
                                 {workflow.description && (
                                   <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg">{workflow.description}</p>
                                 )}
                                 
                                 <div className="flex flex-wrap items-center gap-6 pt-2">
                                   <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                         <Clock className="h-4 w-4 text-slate-300" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Schedule</span>
                                         <span className="text-[10px] font-black text-slate-700 uppercase">{workflow.nextRun ? new Date(workflow.nextRun).toLocaleDateString() : "Manual"}</span>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                         <Play className="h-4 w-4 text-slate-300" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Execution</span>
                                         <span className="text-[10px] font-black text-slate-700 uppercase">{workflow.runs} Cycles</span>
                                      </div>
                                   </div>
                                   {workflow.lastRun && (
                                     <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                           <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div className="flex flex-col">
                                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                                           <span className="text-[10px] font-black text-slate-700 uppercase">Success</span>
                                        </div>
                                     </div>
                                   )}
                                 </div>
                                 
                                 <div className="flex items-center gap-2 pt-2">
                                   {workflow.actions.map((action, index) => {
                                     const ActionIcon = actionIcons[action.type] || Zap;
                                     return (
                                       <div key={index} className="px-4 h-9 bg-slate-50 rounded-xl flex items-center gap-2 border border-slate-100 hover:border-purple-200 transition-colors">
                                         <ActionIcon className="h-3.5 w-3.5 text-purple-600" />
                                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{action.type}</span>
                                       </div>
                                     );
                                   })}
                                 </div>
                               </div>
                             </div>
                             
                             <div className="flex items-center gap-4">
                               <Switch
                                 checked={workflow.enabled}
                                 onCheckedChange={() => toggleMutation.mutate(workflow.id)}
                                 className="data-[state=checked]:bg-purple-600"
                               />
                               <div className="flex items-center gap-1 border border-slate-100 rounded-2xl p-1 bg-white">
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-600">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <div className="w-px h-4 bg-slate-100 mx-1" />
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => deleteMutation.mutate(workflow.id)}
                                    className="h-10 w-10 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                               </div>
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template: WorkflowTemplate) => {
                  const TriggerIcon = triggerIcons[template.trigger.type] || Zap;
                  return (
                    <Card key={template.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white p-8 group hover:shadow-xl transition-all cursor-pointer border border-slate-100/50">
                       <div className="flex items-center justify-between mb-8">
                          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:border-none transition-all">
                             <TriggerIcon className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                          </div>
                          <Badge variant="outline" className="border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-0.5">{template.category}</Badge>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase tracking-tighter">{template.name}</h3>
                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-8">{template.description}</p>
                       <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                          <div className="flex -space-x-2">
                            {template.actions.map((action, index) => {
                              const ActionIcon = actionIcons[action.type] || Zap;
                              return (
                                <div key={index} className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm">
                                  <ActionIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              );
                            })}
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleCreateFromTemplate(template)}
                            className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest border-none hover:bg-purple-600 transition-colors"
                          >
                            Deploy
                          </Button>
                       </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
