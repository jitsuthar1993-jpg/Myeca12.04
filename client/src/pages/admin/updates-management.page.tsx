import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      toast({ title: "Success", description: "Daily update created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create update", variant: "destructive" });
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
      toast({ title: "Success", description: "Daily update modified successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to modify update", variant: "destructive" });
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
      toast({ title: "Success", description: "Update deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete update", variant: "destructive" });
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
    if (confirm("Are you sure you want to delete this update alert?")) {
      deleteUpdateMutation.mutate(id);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
  };

  if (user?.role !== 'admin' && user?.role !== 'super_admin' && user?.role !== 'editor') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Daily Updates Management">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Updates</h1>
          <p className="text-gray-600">Broadcast important news and compliance alerts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUpdate ? "Edit Alert" : "Create New Alert"}</DialogTitle>
              <DialogDescription>Create a short, urgent daily news flash to broadcast to users.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New GST Filing Deadline Announced!" {...field} value={field.value || ""} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide detailed information regarding this update." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Toggle Active</FormLabel>
                        <FormDescription>
                          Disable this to hide the alert immediately without deleting it.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4 space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createUpdateMutation.isPending || updateMutation.isPending}>
                    {editingUpdate ? "Update" : "Create"} Alert
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-12">Loading daily updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No active or archived daily updates found.</div>
        ) : (
          updates.map((update: any) => (
            <Card key={update.id} className={!update.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                       <h3 className="text-lg font-bold">{update.title}</h3>
                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[update.priority]}`}>
                         {update.priority}
                       </span>
                       {!update.isActive && (
                         <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                           INACTIVE
                         </span>
                       )}
                    </div>
                    <p className="text-gray-600 mb-2">{update.description}</p>
                    <p className="text-xs text-gray-400">Created: {new Date(update.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                     <Button size="sm" variant="outline" onClick={() => handleEdit(update)}>
                       <Edit className="w-4 h-4 mr-2" /> Edit
                     </Button>
                     <Button size="sm" variant="outline" onClick={() => handleDelete(update.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                       <Trash2 className="w-4 h-4 mr-2" /> Delete
                     </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </Layout>
  );
}
