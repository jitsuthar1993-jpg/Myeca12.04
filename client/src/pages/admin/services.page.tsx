import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Box,
  DollarSign,
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/admin/Layout";
import {
  DashboardEmptyState,
  DashboardIconButton,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/admin/DashboardPrimitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { normalizeAppRole } from "@shared/app-roles";

const serviceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.number().min(0, "Price must be 0 or greater"),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  features: z.string().optional(),
  estimatedDuration: z.string().optional(),
  requirements: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service {
  id: number | string;
  name: string;
  description: string;
  category: string;
  price: number;
  isPopular: boolean;
  isActive: boolean;
  features?: string;
  estimatedDuration?: string;
  requirements?: string;
  bookingsCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const categories = [
  { value: "tax-filing", label: "Tax Filing" },
  { value: "business-registration", label: "Business Registration" },
  { value: "compliance", label: "Compliance" },
  { value: "consultation", label: "Consultation" },
  { value: "certification", label: "Certification" },
  { value: "other", label: "Other" },
];

function priceLabel(value: number) {
  return `Rs ${Math.round(value).toLocaleString("en-IN")}`;
}

function categoryLabel(category: string) {
  return categories.find((item) => item.value === category)?.label || category;
}

function getCategoryColor(category: string) {
  const colors = {
    "tax-filing": "bg-blue-50 text-blue-700 border-blue-100",
    "business-registration": "bg-emerald-50 text-emerald-700 border-emerald-100",
    compliance: "bg-amber-50 text-amber-700 border-amber-100",
    consultation: "bg-indigo-50 text-indigo-700 border-indigo-100",
    certification: "bg-orange-50 text-orange-700 border-orange-100",
    other: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return colors[category as keyof typeof colors] || colors.other;
}

export default function ServicesManagementPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const role = normalizeAppRole(currentUser?.role);
  const isAdmin = !!currentUser && role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isConfigWizardOpen, setIsConfigWizardOpen] = useState(false);
  const [configService, setConfigService] = useState<Service | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<ServiceFormData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewService, setViewService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      window.location.href = "/auth/login";
    }
  }, [authLoading, isAdmin]);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      isPopular: false,
      isActive: true,
      features: "",
      estimatedDuration: "",
      requirements: "",
    },
  });

  const { data: services = [], isLoading, error } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    enabled: isAdmin,
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceFormData) => apiRequest("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service created successfully" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ServiceFormData }) =>
      apiRequest(`/api/admin/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service updated successfully" });
      setEditingService(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number | string) => apiRequest(`/api/admin/services/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      isPopular: service.isPopular,
      isActive: service.isActive,
      features: service.features || "",
      estimatedDuration: service.estimatedDuration || "",
      requirements: service.requirements || "",
    });
    setIsAddDialogOpen(true);
  };

  const openConfigWizard = (service: Service) => {
    setConfigService(service);
    setWizardData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      isPopular: service.isPopular,
      isActive: service.isActive,
      features: service.features || "",
      estimatedDuration: service.estimatedDuration || "",
      requirements: service.requirements || "",
    });
    setWizardStep(0);
    setIsConfigWizardOpen(true);
  };

  const toggleActive = (service: Service) => {
    const data: ServiceFormData = {
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      isPopular: service.isPopular,
      isActive: !service.isActive,
      features: service.features || "",
      estimatedDuration: service.estimatedDuration || "",
      requirements: service.requirements || "",
    };
    updateServiceMutation.mutate({ id: service.id, data });
  };

  const togglePopular = (service: Service) => {
    const data: ServiceFormData = {
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      isPopular: !service.isPopular,
      isActive: service.isActive,
      features: service.features || "",
      estimatedDuration: service.estimatedDuration || "",
      requirements: service.requirements || "",
    };
    updateServiceMutation.mutate({ id: service.id, data });
  };

  const duplicateService = (service: Service) => {
    const data: ServiceFormData = {
      name: `${service.name} Copy`,
      description: service.description,
      category: service.category,
      price: service.price,
      isPopular: service.isPopular,
      isActive: service.isActive,
      features: service.features || "",
      estimatedDuration: service.estimatedDuration || "",
      requirements: service.requirements || "",
    };
    createServiceMutation.mutate(data);
  };

  const openViewDialog = (service: Service) => {
    setViewService(service);
    setIsViewDialogOpen(true);
  };

  const filteredServices = services.filter((service: Service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const serviceStats = {
    total: services.length,
    active: services.filter((service: Service) => service.isActive).length,
    popular: services.filter((service: Service) => service.isPopular).length,
    totalBookings: services.reduce((sum: number, service: Service) => sum + (service.bookingsCount || 0), 0),
    avgPrice: services.length > 0
      ? services.reduce((sum: number, service: Service) => sum + service.price, 0) / services.length
      : 0,
  };

  const renderServiceDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-10 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
          onClick={() => {
            setEditingService(null);
            form.reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>
            {editingService ? "Update service details" : "Create a new service offering"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name" {...field} />
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
                    <Textarea placeholder="Enter service description" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (Rs)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3-5 business days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Features</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List key features (one per line)" rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Enter each feature on a new line</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List required documents or information" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Popular Service</FormLabel>
                      <FormDescription>Mark as popular to highlight</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Service</FormLabel>
                      <FormDescription>Enable for public access</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800"
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const pageContent = (
    <div className="space-y-5 pb-12">
      <DashboardPageHeader
        eyebrow="Catalog"
        title="Services Management"
        description="Manage service availability, pricing, highlights, and customer-facing catalog details."
        action={renderServiceDialog()}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          Services could not be loaded: {error instanceof Error ? error.message : "Request failed"}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <DashboardMetricTile label="Total Services" value={serviceStats.total} icon={ShoppingBag} tone="blue" />
        <DashboardMetricTile label="Active Services" value={serviceStats.active} icon={Box} tone="emerald" />
        <DashboardMetricTile label="Popular Services" value={serviceStats.popular} icon={Star} tone="amber" />
        <DashboardMetricTile label="Total Bookings" value={serviceStats.totalBookings} icon={Users} tone="indigo" />
        <DashboardMetricTile label="Avg Price" value={priceLabel(serviceStats.avgPrice)} icon={DollarSign} tone="slate" />
      </div>

      <DashboardPanel contentClassName="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_170px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search services by name or description..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm font-medium"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DashboardPanel>

      <DashboardPanel
        title={`Services (${filteredServices.length})`}
        description="Compact catalog rows with status, booking, and pricing controls."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Service</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Category</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Price</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Status</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Bookings</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredServices.map((service: Service) => (
                <tr key={service.id} className="transition-colors hover:bg-blue-50/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                          {service.name}
                          {service.isPopular ? <Star className="h-3.5 w-3.5 fill-current text-amber-500" /> : null}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs font-medium text-slate-500">{service.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline" className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]", getCategoryColor(service.category))}>
                      {categoryLabel(service.category)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">{priceLabel(service.price)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                          service.isActive
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600",
                        )}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch checked={service.isActive} onCheckedChange={() => toggleActive(service)} aria-label="Toggle Active" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-600">{service.bookingsCount || 0} bookings</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">
                    {service.updatedAt ? format(new Date(service.updatedAt), "MMM dd, yyyy") : "Code catalog"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <DashboardIconButton label="Edit service" onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4" />
                      </DashboardIconButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <DashboardIconButton label="More actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </DashboardIconButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openConfigWizard(service)}>
                            Configure Wizard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateService(service)}>
                            Duplicate Service
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleActive(service)}>
                            {service.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePopular(service)}>
                            {service.isPopular ? "Unmark Popular" : "Mark as Popular"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openViewDialog(service)}>
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DashboardIconButton label="Delete service" className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </DashboardIconButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Service</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{service.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteServiceMutation.mutate(service.id)}
                              disabled={deleteServiceMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Service
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredServices.length ? (
            <DashboardEmptyState
              icon={ShoppingBag}
              title="No services found"
              description="Adjust your filters or add a catalog service."
              action={renderServiceDialog()}
            />
          ) : null}
        </div>
      </DashboardPanel>

      <Dialog open={isConfigWizardOpen} onOpenChange={setIsConfigWizardOpen}>
        <DialogContent className="max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle>Configure Service</DialogTitle>
            <DialogDescription>Guided wizard to configure service settings</DialogDescription>
          </DialogHeader>
          {configService && wizardData ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {["Basics", "Features", "Requirements"].map((label, index) => (
                  <Button
                    key={label}
                    variant={wizardStep === index ? "default" : "outline"}
                    className="h-9 rounded-lg text-xs font-bold"
                    onClick={() => setWizardStep(index)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {wizardStep === 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FormLabel>Category</FormLabel>
                      <Select value={wizardData.category} onValueChange={(value) => setWizardData((prev) => ({ ...prev!, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Price</FormLabel>
                      <Input
                        type="number"
                        value={wizardData.price}
                        onChange={(event) => setWizardData((prev) => ({ ...prev!, price: Number(event.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2">
                      <FormLabel>Active</FormLabel>
                      <Switch checked={wizardData.isActive} onCheckedChange={(checked) => setWizardData((prev) => ({ ...prev!, isActive: checked }))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <FormLabel>Popular</FormLabel>
                      <Switch checked={wizardData.isPopular} onCheckedChange={(checked) => setWizardData((prev) => ({ ...prev!, isPopular: checked }))} />
                    </div>
                  </div>
                </div>
              ) : null}

              {wizardStep === 1 ? (
                <div className="space-y-3">
                  <FormLabel>Features</FormLabel>
                  <Textarea rows={4} value={wizardData.features || ""} onChange={(event) => setWizardData((prev) => ({ ...prev!, features: event.target.value }))} />
                </div>
              ) : null}

              {wizardStep === 2 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel>Estimated Duration</FormLabel>
                    <Input value={wizardData.estimatedDuration || ""} onChange={(event) => setWizardData((prev) => ({ ...prev!, estimatedDuration: event.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Requirements</FormLabel>
                    <Textarea rows={4} value={wizardData.requirements || ""} onChange={(event) => setWizardData((prev) => ({ ...prev!, requirements: event.target.value }))} />
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="rounded-lg" onClick={() => setIsConfigWizardOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800"
                  onClick={() => {
                    updateServiceMutation.mutate({ id: configService.id, data: wizardData });
                    setIsConfigWizardOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {viewService ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-slate-950">{viewService.name}</span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{viewService.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Category:</span> {viewService.category}
                </div>
                <div>
                  <span className="text-slate-500">Price:</span> {priceLabel(viewService.price)}
                </div>
                <div>
                  <span className="text-slate-500">Status:</span> {viewService.isActive ? "Active" : "Inactive"}
                </div>
                <div>
                  <span className="text-slate-500">Popular:</span> {viewService.isPopular ? "Yes" : "No"}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );

  if (authLoading || isLoading) {
    return (
      <Layout title="Services">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center text-sm font-bold text-slate-400">
          Loading services...
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Services">
        <DashboardEmptyState
          icon={ShoppingBag}
          title="Access Denied"
          description="You need admin privileges to access this page."
        />
      </Layout>
    );
  }

  return <Layout title="Services">{pageContent}</Layout>;
}
