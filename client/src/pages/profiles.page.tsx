import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@shared/schema";
import { z } from "zod";
import { 
  User, 
  PlusCircle, 
  Edit, 
  Trash2, 
  UserCheck,
  Users,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = insertProfileSchema.extend({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  aadhaar: z.string().regex(/^[0-9]{12}$/, "Aadhaar must be 12 digits").optional().or(z.literal("")),
}).omit({ userId: true });

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      relation: "self",
      pan: "",
      aadhaar: "",
      dateOfBirth: "",
      address: "",
    },
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await apiRequest("/api/profiles", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response;
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("/api/profiles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProfileFormData> }) => {
      return await apiRequest(`/api/profiles/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setIsDialogOpen(false);
      setEditingProfile(null);
      form.reset();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, data });
    } else {
      createProfileMutation.mutate(data);
    }
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    form.reset({
      name: profile.name,
      relation: profile.relation,
      pan: profile.pan || "",
      aadhaar: profile.aadhaar || "",
      dateOfBirth: profile.dateOfBirth || "",
      address: profile.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getRelationLabel = (relation: string) => {
    const labels: Record<string, string> = {
      self: "Self",
      spouse: "Spouse",
      father: "Father",
      mother: "Mother",
      child: "Child",
    };
    return labels[relation] || relation;
  };

  const getRelationIcon = (relation: string) => {
    switch (relation) {
      case "self":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Profiles</h1>
          <p className="text-gray-600">Create and manage tax profiles for family members</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProfile} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? "Edit Profile" : "Create New Profile"}
              </DialogTitle>
              <DialogDescription>
                {editingProfile 
                  ? "Update the profile information below."
                  : "Add a new family member profile for tax filing."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCDE1234F" 
                          {...field} 
                          style={{ textTransform: 'uppercase' }}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  >
                    {editingProfile ? "Update" : "Create"} Profile
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile: any) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRelationIcon(profile.relation)}
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                </div>
                {profile.isActive && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription>
                <Badge variant="outline">{getRelationLabel(profile.relation)}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.pan && (
                <div>
                  <p className="text-sm font-medium text-gray-700">PAN</p>
                  <p className="text-sm text-gray-600">{profile.pan}</p>
                </div>
              )}
              {profile.dateOfBirth && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                  <p className="text-sm text-gray-600">
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProfile(profile)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    id={`upload-${profile.id}`}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, profile.id)}
                    accept=".pdf,.jpg,.png"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    disabled={uploadingDoc}
                    onClick={() => document.getElementById(`upload-${profile.id}`)?.click()}
                  >
                    {uploadingDoc ? (
                      <span className="animate-spin mr-1">⏳</span>
                    ) : (
                      <Upload className="w-3 h-3 mr-1" />
                    )}
                    Upload Docs
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                >
                  <FileCheck className="w-3 h-3 mr-1" />
                  View Vault
                </Button>
              </div>

              {/* Verification Status Badge */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-600">KYC Pending Verification</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {profiles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first profile to start filing tax returns
            </p>
            <Button onClick={handleNewProfile} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}