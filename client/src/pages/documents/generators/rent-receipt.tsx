import { z } from 'zod';
import { IndianRupee } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  receiptNo: z.string().min(1, 'Receipt No is required'),
  receiptDate: z.string().min(1, 'Date is required'),
  tenantName: z.string().min(2, 'Tenant name is required'),
  landlordName: z.string().min(2, 'Landlord name is required'),
  landlordPan: z.string().optional(),
  propertyAddress: z.string().min(5, 'Property address is required'),
  rentAmount: z.number().min(1, 'Rent amount must be > 0'),
  rentPeriodStart: z.string().min(1, 'Start period required'),
  rentPeriodEnd: z.string().min(1, 'End period required'),
  paymentMode: z.string().min(2, 'Mode of payment is required'),
  paymentRef: z.string().optional(),
});

const defaultValues = {
  receiptNo: 'RR-001',
  receiptDate: new Date().toISOString().split('T')[0],
  tenantName: '',
  landlordName: '',
  landlordPan: '',
  propertyAddress: '',
  rentAmount: 15000,
  rentPeriodStart: 'April 2026',
  rentPeriodEnd: 'March 2027',
  paymentMode: 'Bank Transfer / UPI',
  paymentRef: 'UPI Ref: 1234567890',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Receipt Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Receipt Number</Label><Input {...register('receiptNo')} /></div>
        <div><Label>Date of Issue</Label><Input type="date" {...register('receiptDate')} /></div>
        <div><Label>Rent Period From (Month Year)</Label><Input {...register('rentPeriodStart')} placeholder="April 2026" /></div>
        <div><Label>Rent Period To (Month Year)</Label><Input {...register('rentPeriodEnd')} placeholder="March 2027" /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Parties & Property</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Received from (Tenant Name)</Label><Input {...register('tenantName')} /></div>
        <div><Label>Received by (Landlord Name)</Label><Input {...register('landlordName')} /></div>
        <div className="col-span-2"><Label>Property Address</Label><Textarea rows={2} {...register('propertyAddress')} /></div>
        <div><Label>Landlord PAN (Required if Rent &gt; \u20B91L/yr)</Label><Input {...register('landlordPan')} placeholder="ABCDE1234F" /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Payment Details</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Rent Amount (\u20B9)</Label><Input type="number" {...register('rentAmount', { valueAsNumber: true })} /></div>
        <div><Label>Mode of Payment</Label><Input {...register('paymentMode')} placeholder="Cash/Cheque/UPI" /></div>
        <div><Label>Payment Reference</Label><Input {...register('paymentRef')} placeholder="Cheque No / UPI Ref" /></div>
      </div>
    </div>
  );
};

const numberToWords = (num: number) => {
  // Mock Indian style words converter for the template visual
  return `Rupees ${num.toLocaleString('en-IN')} Only`;
};

const generateHTML = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
      
      <!-- Print two identical receipts on one A4 page to save paper -->
      
      ${[1, 2].map((i) => `
        <div style="border: 2px solid #1e3a8a; padding: 30px; margin-bottom: 40px; border-radius: 8px; position: relative;">
          
          <div style="text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #1e3a8a; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">RENT RECEIPT</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">(Under Section 10(13A) of Income Tax Act)</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold; font-size: 14px;">Receipt No: <span style="font-weight: normal; color: #d97706;">${data.receiptNo}</span></p>
            <p style="margin: 0; font-weight: bold; font-size: 14px;">Date: <span style="font-weight: normal;">${data.receiptDate}</span></p>
          </div>

          <p style="font-size: 16px; text-align: justify; line-height: 2;">
            Received with thanks from Mr./Ms. <strong style="border-bottom: 1px dotted #000; padding: 0 10px;">${data.tenantName || '__________________'}</strong>, 
            a sum of <strong>\u20B9${Number(data.rentAmount || 0).toLocaleString('en-IN')}</strong> 
            ( <span style="font-style: italic; border-bottom: 1px dotted #000; padding: 0 10px;">${numberToWords(data.rentAmount || 0)}</span> )<br/>
            towards the rent for the period from <strong>${data.rentPeriodStart}</strong> to <strong>${data.rentPeriodEnd}</strong><br/>
            for the residential property situated at:
          </p>

          <div style="background-color: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; margin: 15px 0 25px 0;">
            <strong style="display: block; margin-bottom: 5px;">Property Address:</strong>
            ${data.propertyAddress || '____________________________________________________________________________________'}
          </div>

          <div style="display: flex; gap: 40px; margin-bottom: 30px; font-size: 15px;">
            <div>
              <p style="margin: 0 0 5px 0;"><strong>Payment Mode:</strong> ${data.paymentMode}</p>
              <p style="margin: 0;"><strong>Reference No:</strong> ${data.paymentRef || 'N/A'}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0;"><strong>Landlord PAN:</strong> ${data.landlordPan || 'Not Provided'}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px;">
            <div style="width: 120px; height: 60px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; transform: rotate(-5deg);">
              <span style="font-size: 12px; font-weight: bold; text-align: center;">REVENUE<br/>STAMP<br/><small>(Sign Across)</small></span>
            </div>
            
            <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; min-width: 250px;">
              <strong style="display: block; margin-bottom: 5px;">${data.landlordName || 'Landlord Signature'}</strong>
              <span style="font-size: 13px; color: #666;">(Signature & Name of Landlord)</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

const generateMarkdown = (data: any) => `# Rent ReceiptnnGenerated via MyeCA.in`;

export const RentReceiptGenerator: DocumentGeneratorConfig = {
  id: 'rent-receipt',
  title: 'HRA Rent Receipt Generator',
  description: 'Generate monthly or annual rent receipts with landlord PAN provisions for submitting exact HRA proofs.',
  icon: <IndianRupee className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
