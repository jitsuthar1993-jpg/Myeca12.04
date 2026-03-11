import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Calculator, TrendingUp } from "lucide-react";

const businessIncomeSchema = z.object({
  businessType: z.string().min(1, "Business type is required"),
  turnover: z.string().min(1, "Turnover is required"),
  presumptiveTaxation: z.boolean().default(false),
  presumptiveRate: z.string().default("8"),
  grossReceipts: z.string().default("0"),
  expenses: z.object({
    rawMaterials: z.string().default("0"),
    directLabor: z.string().default("0"),
    powerFuel: z.string().default("0"),
    factoryExpenses: z.string().default("0"),
    administrativeExpenses: z.string().default("0"),
    sellingExpenses: z.string().default("0"),
    financialExpenses: z.string().default("0"),
    depreciation: z.string().default("0"),
    otherExpenses: z.string().default("0")
  }),
  netProfit: z.string().default("0"),
  bookProfit: z.string().default("0")
});

type BusinessIncomeFormData = z.infer<typeof businessIncomeSchema>;

interface BusinessIncomeFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function BusinessIncomeForm({ data, onChange }: BusinessIncomeFormProps) {
  const form = useForm<BusinessIncomeFormData>({
    resolver: zodResolver(businessIncomeSchema),
    defaultValues: {
      businessType: data.businessType || "",
      turnover: data.turnover || "0",
      presumptiveTaxation: data.presumptiveTaxation || false,
      presumptiveRate: data.presumptiveRate || "8",
      grossReceipts: data.grossReceipts || "0",
      expenses: {
        rawMaterials: data.expenses?.rawMaterials || "0",
        directLabor: data.expenses?.directLabor || "0",
        powerFuel: data.expenses?.powerFuel || "0",
        factoryExpenses: data.expenses?.factoryExpenses || "0",
        administrativeExpenses: data.expenses?.administrativeExpenses || "0",
        sellingExpenses: data.expenses?.sellingExpenses || "0",
        financialExpenses: data.expenses?.financialExpenses || "0",
        depreciation: data.expenses?.depreciation || "0",
        otherExpenses: data.expenses?.otherExpenses || "0"
      },
      netProfit: data.netProfit || "0",
      bookProfit: data.bookProfit || "0"
    }
  });

  const handleFormChange = (fieldData: any) => {
    onChange(fieldData);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? "0" : num.toLocaleString('en-IN');
  };

  const calculateTotalExpenses = () => {
    const expenses = form.watch('expenses');
    return Object.values(expenses).reduce((total, expense) => 
      total + parseFloat(expense || "0"), 0
    );
  };

  const calculateNetProfit = () => {
    const grossReceipts = parseFloat(form.watch('grossReceipts') || "0");
    const totalExpenses = calculateTotalExpenses();
    return Math.max(0, grossReceipts - totalExpenses);
  };

  const calculatePresumptiveIncome = () => {
    const turnover = parseFloat(form.watch('turnover') || "0");
    const rate = parseFloat(form.watch('presumptiveRate') || "8");
    return (turnover * rate) / 100;
  };

  const isPresumptive = form.watch('presumptiveTaxation');

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Details
              </CardTitle>
              <CardDescription>Basic information about your business or profession</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business/Profession Type *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleFormChange({ ...form.getValues(), businessType: value });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail Business</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="services">Professional Services</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="trading">Trading</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="turnover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Turnover *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="5000000" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                            handleFormChange({ ...form.getValues(), turnover: value });
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Total business receipts during the year
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="presumptiveTaxation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleFormChange({ ...form.getValues(), presumptiveTaxation: checked });
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Opt for Presumptive Taxation (Section 44AD/44ADA)
                      </FormLabel>
                      <FormDescription>
                        Available for turnover up to \u20B92 crores. Presume 8% of turnover as profit.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {isPresumptive && (
                <FormField
                  control={form.control}
                  name="presumptiveRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presumptive Rate (%)</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleFormChange({ ...form.getValues(), presumptiveRate: value });
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="8%" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8">8% (Normal)</SelectItem>
                          <SelectItem value="6">6% (Digital payments)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        6% if 95% or more receipts are through digital mode
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Income & Expenses or Presumptive Income */}
          {isPresumptive ? (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Presumptive Income Calculation</CardTitle>
                <CardDescription className="text-green-700">
                  Using presumptive taxation scheme under Section 44AD/44ADA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-600">Annual Turnover</p>
                    <p className="text-xl font-bold text-green-900">
                      \u20B9{formatCurrency(form.watch('turnover'))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600">Presumptive Rate</p>
                    <p className="text-xl font-bold text-green-900">
                      {form.watch('presumptiveRate')}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600">Presumptive Income</p>
                    <p className="text-xl font-bold text-green-900">
                      \u20B9{formatCurrency(calculatePresumptiveIncome().toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Gross Receipts */}
              <Card>
                <CardHeader>
                  <CardTitle>Gross Receipts</CardTitle>
                  <CardDescription>Total income from business operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="grossReceipts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Receipts *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="5000000" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                              handleFormChange({ ...form.getValues(), grossReceipts: value });
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Total receipts from business/profession
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Business Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Business Expenses
                  </CardTitle>
                  <CardDescription>Deductible business expenses incurred during the year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expenses.rawMaterials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raw Materials</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.rawMaterials = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.directLabor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Direct Labor</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.directLabor = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.powerFuel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Power & Fuel</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.powerFuel = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.factoryExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Factory Expenses</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.factoryExpenses = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.administrativeExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Administrative Expenses</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.administrativeExpenses = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.sellingExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling & Distribution</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.sellingExpenses = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.financialExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financial Expenses</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.financialExpenses = value;
                                handleFormChange(formData);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expenses.depreciation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Depreciation</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const formData = form.getValues();
                                formData.expenses.depreciation = value;
                                handleFormChange(formData);
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

              {/* Profit Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Business Profit Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Gross Receipts</p>
                      <p className="text-xl font-bold text-blue-900">
                        \u20B9{formatCurrency(form.watch('grossReceipts'))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">
                        \u20B9{formatCurrency(calculateTotalExpenses().toString())}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Net Profit</p>
                      <p className="text-xl font-bold text-green-600">
                        \u20B9{formatCurrency(calculateNetProfit().toString())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}