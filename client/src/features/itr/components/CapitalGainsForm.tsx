import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Plus, Trash2 } from "lucide-react";

const capitalGainSchema = z.object({
  gains: z.array(z.object({
    assetType: z.string().min(1, "Asset type is required"),
    gainType: z.enum(['STCG', 'LTCG']),
    saleDate: z.string().min(1, "Sale date is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    saleValue: z.string().min(1, "Sale value is required"),
    purchaseValue: z.string().min(1, "Purchase value is required"),
    improvementCost: z.string().default("0"),
    exemptionClaimed: z.string().default("0"),
    taxPaid: z.string().default("0")
  }))
});

type CapitalGainsFormData = z.infer<typeof capitalGainSchema>;

interface CapitalGainsFormProps {
  data: any;
  onChange: (data: any) => void;
}

export default function CapitalGainsForm({ data, onChange }: CapitalGainsFormProps) {
  const form = useForm<CapitalGainsFormData>({
    resolver: zodResolver(capitalGainSchema),
    defaultValues: {
      gains: data.gains || [{
        assetType: '',
        gainType: 'LTCG',
        saleDate: '',
        purchaseDate: '',
        saleValue: '0',
        purchaseValue: '0',
        improvementCost: '0',
        exemptionClaimed: '0',
        taxPaid: '0'
      }]
    }
  });

  const addGain = () => {
    const currentGains = form.getValues('gains');
    const newGains = [...currentGains, {
      assetType: '',
      gainType: 'LTCG' as const,
      saleDate: '',
      purchaseDate: '',
      saleValue: '0',
      purchaseValue: '0',
      improvementCost: '0',
      exemptionClaimed: '0',
      taxPaid: '0'
    }];
    form.setValue('gains', newGains);
    handleFormChange(newGains);
  };

  const removeGain = (index: number) => {
    const currentGains = form.getValues('gains');
    const newGains = currentGains.filter((_, i) => i !== index);
    form.setValue('gains', newGains);
    handleFormChange(newGains);
  };

  const handleFormChange = (gains: any) => {
    onChange({ gains });
  };

  const calculateGain = (gain: any) => {
    const saleValue = parseFloat(gain.saleValue || "0");
    const purchaseValue = parseFloat(gain.purchaseValue || "0");
    const improvementCost = parseFloat(gain.improvementCost || "0");
    const exemption = parseFloat(gain.exemptionClaimed || "0");
    
    const grossGain = saleValue - purchaseValue - improvementCost;
    const netGain = Math.max(0, grossGain - exemption);
    
    return { grossGain, netGain };
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  const getTotalGains = () => {
    const gains = form.watch('gains');
    let totalSTCG = 0;
    let totalLTCG = 0;
    
    gains.forEach(gain => {
      const { netGain } = calculateGain(gain);
      if (gain.gainType === 'STCG') {
        totalSTCG += netGain;
      } else {
        totalLTCG += netGain;
      }
    });
    
    return { totalSTCG, totalLTCG };
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Capital Gains
              </CardTitle>
              <CardDescription>
                Report your capital gains from sale of assets like shares, property, etc.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Capital Gains Entries */}
          {form.watch('gains').map((gain, index) => {
            const { grossGain, netGain } = calculateGain(gain);
            
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Capital Gain #{index + 1}</CardTitle>
                    {form.watch('gains').length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeGain(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`gains.${index}.assetType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type *</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            const gains = form.getValues('gains');
                            gains[index].assetType = value;
                            handleFormChange(gains);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity_shares">Equity Shares</SelectItem>
                              <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
                              <SelectItem value="property">Real Estate</SelectItem>
                              <SelectItem value="bonds">Bonds/Debentures</SelectItem>
                              <SelectItem value="gold">Gold/Jewelry</SelectItem>
                              <SelectItem value="other">Other Assets</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`gains.${index}.gainType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gain Type *</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            const gains = form.getValues('gains');
                            gains[index].gainType = value as 'STCG' | 'LTCG';
                            handleFormChange(gains);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gain type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STCG">Short Term (STCG)</SelectItem>
                              <SelectItem value="LTCG">Long Term (LTCG)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {gain.gainType === 'STCG' ? 'Held for ≤ 12 months (≤ 36 months for property)' : 'Held for > 12 months (> 36 months for property)'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`gains.${index}.purchaseDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                const gains = form.getValues('gains');
                                gains[index].purchaseDate = e.target.value;
                                handleFormChange(gains);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`gains.${index}.saleDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                const gains = form.getValues('gains');
                                gains[index].saleDate = e.target.value;
                                handleFormChange(gains);
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
                      name={`gains.${index}.purchaseValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Value *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="100000" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const gains = form.getValues('gains');
                                gains[index].purchaseValue = value;
                                handleFormChange(gains);
                              }}
                            />
                          </FormControl>
                          <FormDescription>Cost of acquisition</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`gains.${index}.saleValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Value *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="150000" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const gains = form.getValues('gains');
                                gains[index].saleValue = value;
                                handleFormChange(gains);
                              }}
                            />
                          </FormControl>
                          <FormDescription>Sale consideration received</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`gains.${index}.improvementCost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Improvement Cost</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const gains = form.getValues('gains');
                                gains[index].improvementCost = value;
                                handleFormChange(gains);
                              }}
                            />
                          </FormControl>
                          <FormDescription>Cost of improvement (if any)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`gains.${index}.exemptionClaimed`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exemption Claimed</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                field.onChange(value);
                                const gains = form.getValues('gains');
                                gains[index].exemptionClaimed = value;
                                handleFormChange(gains);
                              }}
                            />
                          </FormControl>
                          <FormDescription>Section 54/54F exemption</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Calculated Gain Display */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Gross Gain</p>
                        <p className="font-semibold text-gray-900">₹{formatCurrency(grossGain)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Net Gain</p>
                        <p className="font-semibold text-green-600">₹{formatCurrency(netGain)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tax Rate</p>
                        <p className="font-semibold text-blue-600">
                          {gain.gainType === 'STCG' ? '15-30%' : '10-20%'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add More Button */}
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={addGain}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Capital Gain
            </Button>
          </div>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Capital Gains Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600">Short Term Capital Gains</p>
                  <p className="text-xl font-bold text-blue-900">
                    ₹{formatCurrency(getTotalGains().totalSTCG)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Long Term Capital Gains</p>
                  <p className="text-xl font-bold text-blue-900">
                    ₹{formatCurrency(getTotalGains().totalLTCG)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Total Capital Gains</p>
                  <p className="text-xl font-bold text-blue-900">
                    ₹{formatCurrency(getTotalGains().totalSTCG + getTotalGains().totalLTCG)}
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
