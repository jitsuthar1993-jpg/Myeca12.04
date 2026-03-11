import { z } from 'zod';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFieldArray } from 'react-hook-form';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  from: z.object({
    name: z.string().min(2, 'Your name/business is required'),
    address: z.string().min(5, 'Your address is required'),
    gstin: z.string().optional(),
    pan: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
  }),
  to: z.object({
    name: z.string().min(2, 'Client name is required'),
    address: z.string().min(5, 'Client address is required'),
    gstin: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(3, 'Item description is required'),
        hsnCode: z.string().optional(),
        quantity: z.number().min(1, 'Quantity >= 1'),
        rate: z.number().min(0.01, 'Rate > 0'),
        taxRate: z.number().min(0),
        amount: z.number(),
      })
    )
    .min(1, 'At least one item is required'),
  placeOfSupply: z.string().optional(),
  notes: z.string().optional(),
  bankDetails: z
    .object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifsc: z.string().optional(),
      bankName: z.string().optional(),
    })
    .optional(),
  terms: z.string().optional(),
});

const defaultValues = {
  invoiceNumber: 'INV-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  from: { name: '', address: '', gstin: '', pan: '', email: '', phone: '' },
  to: { name: '', address: '', gstin: '', email: '' },
  items: [{ description: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18, amount: 0 }],
  placeOfSupply: '',
  notes: 'Thank you for your business.',
  bankDetails: { accountName: '', accountNumber: '', ifsc: '', bankName: '' },
  terms: 'Payment due within 15 days.',
};

const FormComponent = ({ register, errors, control, watch }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  return (
    <div className="space-y-6">
      {/* Invoice Details */}
      <h3 className="text-lg font-bold border-b pb-2">Invoice Details</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Invoice #</Label>
          <Input {...register('invoiceNumber')} placeholder="INV-001" />
          {errors.invoiceNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber.message}</p>
          )}
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" {...register('invoiceDate')} />
          {errors.invoiceDate && (
            <p className="text-red-500 text-xs mt-1">{errors.invoiceDate.message}</p>
          )}
        </div>
        <div>
          <Label>Due Date</Label>
          <Input type="date" {...register('dueDate')} />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* From Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Billed By (Your Details)</h3>
          <div>
            <Label>Business Name</Label>
            <Input {...register('from.name')} placeholder="Company Name" />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea {...register('from.address')} placeholder="Full Address" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GSTIN</Label>
              <Input {...register('from.gstin')} placeholder="27XXXX" />
            </div>
            <div>
              <Label>PAN</Label>
              <Input {...register('from.pan')} placeholder="ABCDE1234F" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register('from.email')} placeholder="email@ext.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register('from.phone')} placeholder="9876543210" />
            </div>
          </div>
        </div>

        {/* To Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Billed To (Client Details)</h3>
          <div>
            <Label>Client Name</Label>
            <Input {...register('to.name')} placeholder="Client Company" />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea {...register('to.address')} placeholder="Client Address" rows={3} />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input {...register('to.gstin')} placeholder="Client GSTIN" />
          </div>
          <div>
            <Label>Place of Supply (State)</Label>
            <Input {...register('placeOfSupply')} placeholder="Maharashtra" />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <h3 className="text-lg font-bold border-b pb-2 mt-8">Line Items</h3>
      {fields.map((field, index) => {
        const qty = parseFloat(watchItems?.[index]?.quantity || 0);
        const rate = parseFloat(watchItems?.[index]?.rate || 0);
        const amt = qty * rate;

        return (
          <Card key={field.id} className="relative mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <Label>Item Description</Label>
                  <Input
                    {...register(`items.${index}.description`)}
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>HSN/SAC</Label>
                  <Input {...register(`items.${index}.hsnCode`)} placeholder="998311" />
                </div>
                <div className="col-span-1">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    step="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Rate (\u20B9)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.rate`, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Tax (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                  />
                </div>
                <div className="col-span-1 pt-8 text-right font-medium text-gray-700">
                  \u20B9{amt.toFixed(2)}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={() =>
          append({ description: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18, amount: 0 })
        }
      >
        <Plus className="w-4 h-4" /> Add Item
      </Button>

      {/* Bank Details & Notes */}
      <h3 className="text-lg font-bold border-b pb-2 mt-8">Footer & Payment</h3>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label>Bank Account Details</Label>
          <Input {...register('bankDetails.accountName')} placeholder="A/c Holder Name" />
          <div className="grid grid-cols-2 gap-2">
            <Input {...register('bankDetails.accountNumber')} placeholder="Account Number" />
            <Input {...register('bankDetails.ifsc')} placeholder="IFSC Code" />
          </div>
          <Input {...register('bankDetails.bankName')} placeholder="Bank Name & Branch" />
        </div>
        <div className="space-y-4">
          <div>
            <Label>Notes</Label>
            <Textarea {...register('notes')} rows={2} />
          </div>
          <div>
            <Label>Terms & Conditions</Label>
            <Textarea {...register('terms')} rows={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => {
  const items = data.items || [];
  let subtotal = 0;
  let totalTax = 0;

  const itemRows = items
    .map((item: any) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      const taxAmt = (amount * (item.taxRate || 0)) / 100;
      subtotal += amount;
      totalTax += taxAmt;

      return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.hsnCode || '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">\u20B9${parseFloat(item.rate || 0).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.taxRate}%</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">\u20B9${amount.toFixed(2)}</td>
      </tr>
    `;
    })
    .join('');

  const totalAmount = subtotal + totalTax;

  // Determine if IGST or CGST/SGST based on POS matching State. (Assuming a simple split if not specifically handling state logic)
  const isInterState =
    data.from.gstin &&
    data.to.gstin &&
    data.from.gstin.substring(0, 2) !== data.to.gstin.substring(0, 2);

  let taxRows = '';
  if (isInterState) {
    taxRows = `
      <tr>
        <td colspan="5" style="text-align: right; padding: 10px; font-weight: bold;">IGST:</td>
        <td style="text-align: right; padding: 10px;">\u20B9${totalTax.toFixed(2)}</td>
      </tr>
    `;
  } else {
    taxRows = `
      <tr>
        <td colspan="5" style="text-align: right; padding: 10px; font-weight: bold;">CGST:</td>
        <td style="text-align: right; padding: 10px;">\u20B9${(totalTax / 2).toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="5" style="text-align: right; padding: 10px; font-weight: bold;">SGST:</td>
        <td style="text-align: right; padding: 10px;">\u20B9${(totalTax / 2).toFixed(2)}</td>
      </tr>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TAX INVOICE</h1>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Original for Recipient</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-weight: bold;">Invoice #: ${data.invoiceNumber}</p>
          <p style="margin: 5px 0;">Date: ${data.invoiceDate}</p>
          <p style="margin: 5px 0;">Due Date: ${data.dueDate}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div style="width: 45%;">
          <h3 style="color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Billed By</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">${data.from?.name || 'Your Company'}</p>
          <p style="margin: 5px 0; font-size: 14px; white-space: pre-line;">${data.from?.address || 'Your Address'}</p>
          ${data.from?.gstin ? `<p style="margin: 5px 0; font-size: 14px;"><strong>GSTIN:</strong> ${data.from.gstin}</p>` : ''}
          ${data.from?.pan ? `<p style="margin: 5px 0; font-size: 14px;"><strong>PAN:</strong> ${data.from.pan}</p>` : ''}
          ${data.from?.email ? `<p style="margin: 5px 0; font-size: 14px;">${data.from.email}</p>` : ''}
          ${data.from?.phone ? `<p style="margin: 5px 0; font-size: 14px;">${data.from.phone}</p>` : ''}
        </div>
        <div style="width: 45%;">
          <h3 style="color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Billed To</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">${data.to?.name || 'Client Name'}</p>
          <p style="margin: 5px 0; font-size: 14px; white-space: pre-line;">${data.to?.address || 'Client Address'}</p>
          ${data.to?.gstin ? `<p style="margin: 5px 0; font-size: 14px;"><strong>GSTIN:</strong> ${data.to.gstin}</p>` : ''}
          ${data.placeOfSupply ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Place of Supply:</strong> ${data.placeOfSupply}</p>` : ''}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Description</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">HSN/SAC</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Rate</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Tax</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr>
            <td colspan="5" style="text-align: right; padding: 10px; font-weight: bold;">Subtotal:</td>
            <td style="text-align: right; padding: 10px;">\u20B9${subtotal.toFixed(2)}</td>
          </tr>
          ${taxRows}
          <tr style="background-color: #f1f5f9;">
            <td colspan="5" style="text-align: right; padding: 15px; font-weight: bold; font-size: 18px;">Total:</td>
            <td style="text-align: right; padding: 15px; font-weight: bold; font-size: 18px; color: #2563eb;">\u20B9${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <div style="width: 50%;">
          ${
            data.bankDetails?.accountNumber
              ? `
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 5px 0; color: #666;">Bank Details</h4>
              <p style="margin: 2px 0;"><strong>Bank Name:</strong> ${data.bankDetails.bankName}</p>
              <p style="margin: 2px 0;"><strong>A/c Name:</strong> ${data.bankDetails.accountName}</p>
              <p style="margin: 2px 0;"><strong>A/c No:</strong> ${data.bankDetails.accountNumber}</p>
              <p style="margin: 2px 0;"><strong>IFSC Code:</strong> ${data.bankDetails.ifsc}</p>
            </div>
          `
              : ''
          }
          ${
            data.notes
              ? `
            <div style="margin-bottom: 10px;">
              <h4 style="margin: 0 0 5px 0; color: #666;">Notes</h4>
              <p style="margin: 0; white-space: pre-line;">${data.notes}</p>
            </div>
          `
              : ''
          }
          ${
            data.terms
              ? `
            <div>
              <h4 style="margin: 0 0 5px 0; color: #666;">Terms & Conditions</h4>
              <p style="margin: 0; white-space: pre-line;">${data.terms}</p>
            </div>
          `
              : ''
          }
        </div>
        <div style="width: 40%; text-align: right; display: flex; flex-direction: column; justify-content: flex-end;">
          <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 60px;">
            <p style="margin: 0; font-weight: bold;">Authorized Signatory</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">For ${data.from?.name}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) => {
  return `# Tax Invoice ${data.invoiceNumber}nnGenerated via MyeCA.in`;
};

export const InvoiceGenerator: DocumentGeneratorConfig = {
  id: 'invoice',
  title: 'GST Compliant Tax Invoice',
  description:
    'Generate professional B2B or B2C invoices with correct HSN/SAC codes and automated matching.',
  icon: <DollarSign className="w-5 h-5" />,
  schema: invoiceSchema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
