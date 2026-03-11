import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  ShoppingBag, Plus, Search, Edit, Trash2, Eye, Star, 
  TrendingUp, Package, FileText, Calculator, Building,
  Target, DollarSign, Clock, Users, BarChart3, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const serviceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.number().min(0, "Price must be 0 or greater"),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  features: z.string().optional(),
  estimatedDuration: z.string().optional(),
  requirements: z.string().optional()
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: "tax-filing", label: "Tax Filing" },
  { value: "business-registration", label: "Business Registration" },
  { value: "compliance", label: "Compliance" },
  { value: "consultation", label: "Consultation" },
  { value: "certification", label: "Certification" },
  { value: "other", label: "Other" }
];

export default function ServicesManagementPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
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

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      window.location.href = '/auth/login';
    }
  }, [currentUser, authLoading]);

  // Form setup
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
      requirements: ""
    }
  });

  // Fetch services
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/services"],
    enabled: !!currentUser && currentUser.role === 'admin',
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceFormData) => apiRequest("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(data)
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
        variant: "destructive"
      });
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceFormData }) => 
      apiRequest(`/api/admin/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
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
        variant: "destructive"
      });
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/services/${id}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete service",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  // Handle edit
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
      requirements: service.requirements || ""
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

  // Filter services
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate service statistics
  const serviceStats = {
    total: services.length,
    active: services.filter((s: Service) => s.isActive).length,
    popular: services.filter((s: Service) => s.isPopular).length,
    totalBookings: services.reduce((sum: number, s: Service) => sum + (s.bookingsCount || 0), 0),
    avgPrice: services.length > 0 ? services.reduce((sum: number, s: Service) => sum + s.price, 0) / services.length : 0
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors = {
      "tax-filing": "bg-blue-100 text-blue-800 border-blue-200",
      "business-registration": "bg-green-100 text-green-800 border-green-200",
      "compliance": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "consultation": "bg-purple-100 text-purple-800 border-purple-200",
      "certification": "bg-orange-100 text-orange-800 border-orange-200",
      "other": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <div className="ml-4 text-gray-600">Loading services...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600 mt-1">Manage your service catalog and pricing</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingService(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
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
                          <Textarea 
                            placeholder="Enter service description"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                          <FormLabel>Price (\u20B9)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
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
                          <Textarea 
                            placeholder="List key features (one per line)"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each feature on a new line
                        </FormDescription>
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
                          <Textarea 
                            placeholder="List required documents or information"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="isPopular"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Popular Service</FormLabel>
                            <FormDescription>
                              Mark as popular to highlight
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Active Service</FormLabel>
                            <FormDescription>
                              Enable for public access
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    >
                      {editingService ? "Update Service" : "Create Service"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">{serviceStats.total}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold text-green-600">{serviceStats.active}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Popular Services</p>
                  <p className="text-2xl font-bold text-yellow-600">{serviceStats.popular}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-purple-600">{serviceStats.totalBookings}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold text-orange-600">\u20B9{Math.round(serviceStats.avgPrice)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search services by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
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
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Services ({filteredServices.length})</CardTitle>
            <CardDescription>
              Manage your service catalog and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service: Service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              {service.name}
                              {service.isPopular && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(service.category)}>
                          {categories.find(c => c.value === service.category)?.label || service.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">\u20B9{service.price.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge className={service.isActive ? 
                            "bg-green-100 text-green-800 border-green-200" : 
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={service.isActive}
                            onCheckedChange={() => toggleActive(service)}
                            aria-label="Toggle Active"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {service.bookingsCount || 0} bookings
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(service.updatedAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" aria-label="More actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
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
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{service.name}"? 
                                  This action cannot be undone.
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No services found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Wizard Dialog */}
        <Dialog open={isConfigWizardOpen} onOpenChange={setIsConfigWizardOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Service</DialogTitle>
              <DialogDescription>
                Guided wizard to configure service settings
              </DialogDescription>
            </DialogHeader>
            {configService && wizardData && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button variant={wizardStep === 0 ? "default" : "outline"} onClick={() => setWizardStep(0)}>Basics</Button>
                  <Button variant={wizardStep === 1 ? "default" : "outline"} onClick={() => setWizardStep(1)}>Features</Button>
                  <Button variant={wizardStep === 2 ? "default" : "outline"} onClick={() => setWizardStep(2)}>Requirements</Button>
                </div>

                {wizardStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel>Category</FormLabel>
                        <Select value={wizardData.category} onValueChange={(v) => setWizardData((prev) => ({ ...prev!, category: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Price</FormLabel>
                        <Input type="number" value={wizardData.price} onChange={(e) => setWizardData((prev) => ({ ...prev!, price: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
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
                )}

                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <FormLabel>Features</FormLabel>
                    <Textarea rows={4} value={wizardData.features || ""} onChange={(e) => setWizardData((prev) => ({ ...prev!, features: e.target.value }))} />
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel>Estimated Duration</FormLabel>
                        <Input value={wizardData.estimatedDuration || ""} onChange={(e) => setWizardData((prev) => ({ ...prev!, estimatedDuration: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Requirements</FormLabel>
                        <Textarea rows={4} value={wizardData.requirements || ""} onChange={(e) => setWizardData((prev) => ({ ...prev!, requirements: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsConfigWizardOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    if (configService && wizardData) {
                      updateServiceMutation.mutate({ id: configService.id, data: wizardData });
                      setIsConfigWizardOpen(false);
                    }
                  }}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Service Details</DialogTitle>
            </DialogHeader>
            {viewService && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{viewService.name}</span>
                </div>
                <p className="text-sm text-gray-600">{viewService.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span> {viewService.category}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span> \u20B9{viewService.price.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> {viewService.isActive ? "Active" : "Inactive"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Popular:</span> {viewService.isPopular ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}