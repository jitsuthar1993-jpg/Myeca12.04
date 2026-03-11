import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Building, Banknote, TrendingUp } from "lucide-react";

const incomeDetailsSchema = z.object({
  salaryIncome: z.string().default("0"),
  bonusIncome: z.string().default("0"),
  interestIncome: z.string().default("0"),
  dividendIncome: z.string().default("0"),
  otherIncome: z.string().default("0"),
  exemptIncome: z.string().default("0"),
  employerName: z.string().optional(),
  employerTAN: z.string().optional(),
  salaryMonth: z.string().default("12")
});

type IncomeDetailsFormData = z.infer<typeof incomeDetailsSchema>;

interface IncomeDetailsFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function IncomeDetailsForm({ data, onChange }: IncomeDetailsFormProps) {
  const form = useForm<IncomeDetailsFormData>({
    resolver: zodResolver(incomeDetailsSchema),
    defaultValues: {
      salaryIncome: data.salaryIncome || "0",
      bonusIncome: data.bonusIncome || "0",
      interestIncome: data.interestIncome || "0",
      dividendIncome: data.dividendIncome || "0",
      otherIncome: data.otherIncome || "0",
      exemptIncome: data.exemptIncome || "0",
      employerName: data.employerName || "",
      employerTAN: data.employerTAN || "",
      salaryMonth: data.salaryMonth || "12"
    }
  });

  const handleFormChange = (fieldData: any) => {
    onChange(fieldData);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? "0" : num.toLocaleString('en-IN');
  };

  const calculateTotalIncome = () => {
    const values = form.getValues();
    const total = 
      parseFloat(values.salaryIncome || "0") +
      parseFloat(values.bonusIncome || "0") +
      parseFloat(values.interestIncome || "0") +
      parseFloat(values.dividendIncome || "0") +
      parseFloat(values.otherIncome || "0");
    return total;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Salary Income */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Salary Income
              </CardTitle>
              <CardDescription>Income from employment (Form 16)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Company Name" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleFormChange({ ...form.getValues(), employerName: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employerTAN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer TAN</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCD12345E" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                            handleFormChange({ ...form.getValues(), employerTAN: e.target.value.toUpperCase() });
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
                  name="salaryIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Salary *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="500000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), salaryIncome: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Total salary as per Form 16
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bonusIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus & Incentives</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="50000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), bonusIncome: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Annual bonus and incentives received
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Income */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="h-5 w-5 mr-2" />
                Other Income
              </CardTitle>
              <CardDescription>Income from savings, investments, and other sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interestIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Income</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="25000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), interestIncome: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Interest from savings account, FD, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dividendIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dividend Income</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), dividendIncome: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Dividend from shares, mutual funds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="otherIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Income</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), otherIncome: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Rental income, capital gains, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exemptIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exempt Income</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), exemptIncome: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        LTA, gratuity, etc. (non-taxable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Income Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <TrendingUp className="h-5 w-5 mr-2" />
                Income Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600">Salary Income</p>
                  <p className="text-lg font-semibold text-blue-900">
                    \u20B9{formatCurrency(form.watch("salaryIncome") || "0")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Other Income</p>
                  <p className="text-lg font-semibold text-blue-900">
                    \u20B9{formatCurrency(
                      (parseFloat(form.watch("interestIncome") || "0") + 
                       parseFloat(form.watch("dividendIncome") || "0") + 
                       parseFloat(form.watch("otherIncome") || "0")).toString()
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Exempt Income</p>
                  <p className="text-lg font-semibold text-blue-900">
                    \u20B9{formatCurrency(form.watch("exemptIncome") || "0")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Total Income</p>
                  <p className="text-xl font-bold text-blue-900">
                    \u20B9{formatCurrency(calculateTotalIncome().toString())}
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