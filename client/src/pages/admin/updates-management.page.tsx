import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Layout } from "@/components/admin/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, ShieldAlert, Zap, Clock, Search, BookOpen, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const updateFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  isActive: z.boolean().default(true),
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

export default function UpdatesManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      isActive: true,
    },
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-updates"],
    queryFn: async (): Promise<{ updates: any[] }> => {
      const res = await apiRequest("/api/admin/updates");
      return res.json() as Promise<{ updates: any[] }>;
    },
  });
  
  const updates = response?.updates || [];

  const filteredUpdates = updates.filter(u => 
    u.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createUpdateMutation = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      return await apiRequest("/api/admin/updates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-updates"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Intelligence Stream Updated", description: "The new alert has been successfully broadcast." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UpdateFormData> }) => {
      return await apiRequest(`/api/admin/updates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-updates"] });
      setIsDialogOpen(false);
      setEditingUpdate(null);
      form.reset();
      toast({ title: "Alert Synchronized", description: "Broadcast parameters have been updated." });
    },
  });

  const deleteUpdateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/updates/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-updates"] });
      toast({ title: "Signal Redacted", description: "The intelligence alert has been purged from streams." });
    },
  });

  const onSubmit = (data: UpdateFormData) => {
    if (editingUpdate) {
      updateMutation.mutate({ id: editingUpdate.id, data });
    } else {
      createUpdateMutation.mutate(data);
    }
  };

  const handleEdit = (update: any) => {
    setEditingUpdate(update);
    form.reset({
      title: update.title,
      description: update.description,
      priority: update.priority,
      isActive: update.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingUpdate(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you certain you wish to redact this broadcast?")) {
      deleteUpdateMutation.mutate(id);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'team_member') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl">
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Security Protocol Violation</h1>
            <p className="text-slate-500 font-medium">Elevated privileges required for signal modulation.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Signal Management">
      <div className="max-w-6xl mx-auto py-12 px-8">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <m.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4">
              <Zap className="w-4 h-4" />
              Intelligence Broadcasts
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Daily <span className="text-blue-600">Signals</span></h1>
            <p className="text-slate-500 font-medium mt-6 text-lg max-w-xl leading-relaxed">Broadcast high-priority compliance alerts and orbital intelligence directly to all endpoints.</p>
          </m.div>

          <m.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={handleNew}
              className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl px-10 h-16 font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-3" strokeWidth={3} />
              New Signal
            </Button>
          </m.div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm mb-12 flex items-center gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Query signal registry..." 
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 transition-all font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
               <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Querying Streams...</span>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[4rem] border border-slate-200 shadow-sm">
               <h3 className="text-2xl font-black text-slate-900 mb-2">No signals detected</h3>
               <p className="text-slate-500 font-medium">Broadcast frequency is currently silent.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredUpdates.map((update: any, i: number) => (
                <m.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn(
                    "group relative overflow-hidden bg-white border border-slate-200/60 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 p-8",
                    !update.isActive && "opacity-40 grayscale"
                  )}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                              update.priority === "CRITICAL" ? "bg-red-600 shadow-red-500/20" : 
                              update.priority === "HIGH" ? "bg-orange-500 shadow-orange-500/20" : 
                              update.priority === "MEDIUM" ? "bg-blue-600 shadow-blue-500/20" : 
                              "bg-slate-400 shadow-slate-400/20"
                            )}>
                              {update.priority === "CRITICAL" ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6" />}
                            </div>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full",
                              update.priority === "CRITICAL" ? "bg-red-50 text-red-600" : 
                              update.priority === "HIGH" ? "bg-orange-50 text-orange-600" : 
                              update.priority === "MEDIUM" ? "bg-blue-50 text-blue-600" : 
                              "bg-slate-50 text-slate-600"
                            )}>
                              {update.priority} Frequency
                            </span>
                            {!update.isActive && (
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-blue-700 text-white">
                                Redacted
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight">
                            {update.title}
                          </h3>
                          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-3xl">
                            {update.description}
                          </p>
                          <div className="flex items-center gap-6 mt-6">
                             <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                <Clock className="w-4 h-4" />
                                Created {new Date(update.createdAt).toLocaleDateString()}
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(update)} className="w-14 h-14 rounded-2xl hover:bg-blue-50 hover:text-blue-600 group/edit">
                             <Edit className="w-6 h-6 transition-transform group-hover/edit:scale-110" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(update.id)} className="w-14 h-14 rounded-2xl hover:bg-red-50 hover:text-red-600 group/trash">
                             <Trash2 className="w-6 h-6 transition-transform group-hover/trash:rotate-12" />
                          </Button>
                       </div>
                    </div>
                  </Card>
                </m.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 border-none bg-slate-50 overflow-hidden rounded-[3rem]">
          <div className="p-10 bg-white border-b">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingUpdate ? "Modulate Signal" : "Encoded New Signal"}</h2>
                   <p className="text-slate-500 font-medium mt-2">Adjusting broadcast parameters for global distribution.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)} className="rounded-2xl">
                   <X className="w-6 h-6" />
                </Button>
             </div>
          </div>
          
          <div className="p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Signal Header</FormLabel>
                      <FormControl>
                        <Input placeholder="Priority Alert Narrative..." className="h-14 rounded-2xl bg-white border-slate-200 font-bold text-lg focus:border-blue-500" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Intelligence Payload</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Deploy detailed intelligence parameters..." className="min-h-[160px] rounded-2xl bg-white border-slate-200 font-medium text-lg focus:border-blue-500" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Frequency Band</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-200 font-bold">
                              <SelectValue placeholder="Priority Class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                            <SelectItem value="LOW" className="rounded-xl font-bold">Low Priority</SelectItem>
                            <SelectItem value="MEDIUM" className="rounded-xl font-bold">Medium Priority</SelectItem>
                            <SelectItem value="HIGH" className="rounded-xl font-bold">High Priority</SelectItem>
                            <SelectItem value="CRITICAL" className="rounded-xl font-bold text-red-600">Critical Frequency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-3xl border border-slate-200 bg-white p-6">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Stream</FormLabel>
                          <FormDescription className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Toggle signal visibility</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100">Aboundon</Button>
                  <Button type="submit" className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">
                    {editingUpdate ? "Update Broadcast" : "Initiate Signal"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
