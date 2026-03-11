import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Layout } from "@/components/admin/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function CategoriesManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async (): Promise<{ categories: any[] }> => {
      const res = await apiRequest("/api/admin/categories");
      return res.json() as Promise<{ categories: any[] }>;
    },
  });
  
  const categories = response?.categories || [];

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      // Auto-generate slug if it's empty
      if (!data.slug) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      return await apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'super_admin' && user?.role !== 'editor') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage categories.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Categories Management">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage blog categories and taxonomies</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>Add a new category for organizing your content.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tax Filing" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="tax-filing" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4 space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createCategoryMutation.isPending}>Create Category</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-1">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No categories found. Create one to get started.</div>
        ) : (
          <div className="divide-y">
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500 font-mono hidden md:block">{cat.slug}</p>
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
