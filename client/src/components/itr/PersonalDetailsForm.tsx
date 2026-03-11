import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard } from "lucide-react";

const personalDetailsSchema = z.object({
  profileId: z.string().min(1, "Please select a profile"),
  pan: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits").max(6, "Pincode must be 6 digits"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be 10 digits").max(10, "Mobile number must be 10 digits"),
  aadhaar: z.string().min(12, "Aadhaar must be 12 digits").max(12, "Aadhaar must be 12 digits").optional(),
  bankAccount: z.string().min(1, "Bank account number is required"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters").max(11, "IFSC code must be 11 characters")
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  data: any;
  profiles: any[];
  onChange: (data: any) => void;
  onProfileSelect: (profileId: number) => void;
}

export default function PersonalDetailsForm({ 
  data, 
  profiles, 
  onChange, 
  onProfileSelect 
}: PersonalDetailsFormProps) {
  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      profileId: data.profileId || "",
      pan: data.pan || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      dateOfBirth: data.dateOfBirth || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      email: data.email || "",
      mobile: data.mobile || "",
      aadhaar: data.aadhaar || "",
      bankAccount: data.bankAccount || "",
      ifscCode: data.ifscCode || ""
    }
  });

  const handleFormChange = (fieldData: any) => {
    onChange(fieldData);
  };

  const handleProfileChange = (profileId: string) => {
    const selectedProfile = profiles.find(p => p.id.toString() === profileId);
    if (selectedProfile) {
      onProfileSelect(selectedProfile.id);
      // Pre-fill form with profile data
      const profileData = {
        profileId,
        pan: selectedProfile.pan || "",
        firstName: selectedProfile.name?.split(' ')[0] || "",
        lastName: selectedProfile.name?.split(' ').slice(1).join(' ') || "",
        dateOfBirth: selectedProfile.dateOfBirth || "",
        email: selectedProfile.email || "",
        mobile: selectedProfile.mobile || "",
        address: selectedProfile.address || "",
        city: selectedProfile.city || "",
        state: selectedProfile.state || "",
        pincode: selectedProfile.pincode || "",
        aadhaar: selectedProfile.aadhaar || "",
        bankAccount: "",
        ifscCode: ""
      };
      form.reset(profileData);
      onChange(profileData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Select Profile
          </CardTitle>
          <CardDescription>Choose the profile for this tax return</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleProfileChange} defaultValue={data.profileId?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id.toString()}>
                  {profile.name} ({profile.relation === 'self' ? 'Your Profile' : profile.relation})
                  {profile.pan && ` - ${profile.pan}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Personal Details Form */}
      <Form {...form}>
        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Personal details as per PAN card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCDE1234F" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                            handleFormChange({ ...form.getValues(), pan: e.target.value.toUpperCase() });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Permanent Account Number (PAN) is required for tax filing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aadhaar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234 5678 9012" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), aadhaar: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Linking Aadhaar is recommended for faster processing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First Name" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), firstName: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Last Name" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), lastName: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange({ ...form.getValues(), dateOfBirth: e.target.value });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Address and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Complete address" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange({ ...form.getValues(), address: e.target.value });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), city: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="State" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), state: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123456" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), pincode: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="email@example.com" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), email: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9876543210" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), mobile: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Bank Details
              </CardTitle>
              <CardDescription>For refund processing (if applicable)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Account Number" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), bankAccount: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ifscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCD0123456" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                            handleFormChange({ ...form.getValues(), ifscCode: e.target.value.toUpperCase() });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}