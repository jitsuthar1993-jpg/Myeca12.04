import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Heart, GraduationCap, Calculator } from "lucide-react";

const deductionsSchema = z.object({
  section80C: z.string().default("0"),
  section80D: z.string().default("0"),
  section80G: z.string().default("0"),
  section80E: z.string().default("0"),
  section24: z.string().default("0"),
  standardDeduction: z.string().default("50000"),
  professionalTax: z.string().default("0"),
  nps: z.string().default("0"),
  otherDeductions: z.string().default("0")
});

type DeductionsFormData = z.infer<typeof deductionsSchema>;

interface DeductionsFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function DeductionsForm({ data, onChange }: DeductionsFormProps) {
  const form = useForm<DeductionsFormData>({
    resolver: zodResolver(deductionsSchema),
    defaultValues: {
      section80C: data.section80C || "0",
      section80D: data.section80D || "0",
      section80G: data.section80G || "0",
      section80E: data.section80E || "0",
      section24: data.section24 || "0",
      standardDeduction: data.standardDeduction || "50000",
      professionalTax: data.professionalTax || "0",
      nps: data.nps || "0",
      otherDeductions: data.otherDeductions || "0"
    }
  });

  const handleFormChange = (fieldData: any) => {
    onChange(fieldData);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? "0" : num.toLocaleString('en-IN');
  };

  const calculateTotalDeductions = () => {
    const values = form.getValues();
    const total = 
      parseFloat(values.section80C || "0") +
      parseFloat(values.section80D || "0") +
      parseFloat(values.section80G || "0") +
      parseFloat(values.section80E || "0") +
      parseFloat(values.section24 || "0") +
      parseFloat(values.standardDeduction || "0") +
      parseFloat(values.professionalTax || "0") +
      parseFloat(values.nps || "0") +
      parseFloat(values.otherDeductions || "0");
    return total;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Section 80C Deductions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Section 80C Deductions
              </CardTitle>
              <CardDescription>Investment and insurance deductions (Max: \u20B91,50,000)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="section80C"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section 80C Deductions *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="150000" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                          handleFormChange({ ...form.getValues(), section80C: value });
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      PPF, ELSS, Life Insurance Premium, Principal repayment on Home Loan, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Health Insurance & Medical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Health Insurance & Medical
              </CardTitle>
              <CardDescription>Medical insurance and health-related deductions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="section80D"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section 80D - Health Insurance</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="25000" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                          handleFormChange({ ...form.getValues(), section80D: value });
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Health insurance premiums for self, family & parents (Max: \u20B925,000 for self+family, \u20B950,000 for parents)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Education & Other Deductions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education & Other Deductions
              </CardTitle>
              <CardDescription>Education loan interest and charitable donations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="section80E"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section 80E - Education Loan Interest</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="50000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), section80E: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Interest paid on education loan (No limit)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="section80G"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section 80G - Donations</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), section80G: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Donations to approved charitable institutions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Home Loan & Standard Deductions */}
          <Card>
            <CardHeader>
              <CardTitle>Home Loan & Standard Deductions</CardTitle>
              <CardDescription>House property and standard deductions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="section24"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section 24 - Home Loan Interest</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="200000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), section24: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Interest on home loan (Max: \u20B92,00,000 for self-occupied property)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standardDeduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Deduction</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="50000" 
                          disabled
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Standard deduction for salaried employees (Fixed: \u20B950,000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="professionalTax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Tax</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="2500" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), professionalTax: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Professional tax paid during the year (Max: \u20B92,500)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPS (Section 80CCD)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="50000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), nps: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional NPS contribution (Max: \u20B950,000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Deductions */}
          <Card>
            <CardHeader>
              <CardTitle>Other Deductions</CardTitle>
              <CardDescription>Any other eligible deductions</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="otherDeductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Deductions</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                          handleFormChange({ ...form.getValues(), otherDeductions: value });
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Any other eligible deductions under Chapter VI-A
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Deductions Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-900">
                <Calculator className="h-5 w-5 mr-2" />
                Deductions Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-green-600">Section 80C</p>
                  <p className="text-lg font-semibold text-green-900">
                    \u20B9{formatCurrency(form.watch("section80C") || "0")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Health Insurance</p>
                  <p className="text-lg font-semibold text-green-900">
                    \u20B9{formatCurrency(form.watch("section80D") || "0")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Home Loan Interest</p>
                  <p className="text-lg font-semibold text-green-900">
                    \u20B9{formatCurrency(form.watch("section24") || "0")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Total Deductions</p>
                  <p className="text-xl font-bold text-green-900">
                    \u20B9{formatCurrency(calculateTotalDeductions().toString())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}