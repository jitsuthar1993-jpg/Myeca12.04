import { z } from 'zod';
import { ScrollText } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place required'),
  executionDate: z.string().min(1, 'Date required'),
  lessorName: z.string().min(2, 'Lessor name required'),
  lessorAddress: z.string().min(5, 'Address required'),
  lesseeName: z.string().min(2, 'Lessee name required'),
  lesseeAddress: z.string().min(5, 'Address required'),
  propertyDetails: z.string().min(5, 'Property details required'),
  leaseYears: z.number().min(1, 'Years required'),
  monthlyRent: z.number().min(0, 'Rent required'),
  securityDeposit: z.number().min(0, 'Deposit required'),
});

const defaultValues = {
  executionPlace: 'New Delhi',
  executionDate: new Date().toISOString().split('T')[0],
  lessorName: '',
  lessorAddress: '',
  lesseeName: '',
  lesseeAddress: '',
  propertyDetails: 'Entire Ground Floor, B-42, Greater Kailash, New Delhi',
  leaseYears: 5,
  monthlyRent: 80000,
  securityDeposit: 300000,
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Execution details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('executionDate')} /></div>
        <div className="col-span-2"><Label>Demised Premises (Property Details)</Label><Textarea rows={2} {...register('propertyDetails')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Lessor (Landlord)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('lessorName')} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} {...register('lessorAddress')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Lessee (Tenant)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('lesseeName')} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} {...register('lesseeAddress')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Specifics</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Term (Years)</Label><Input type="number" {...register('leaseYears', { valueAsNumber: true })} /></div>
        <div><Label>Monthly Rent (\u20B9)</Label><Input type="number" {...register('monthlyRent', { valueAsNumber: true })} /></div>
        <div><Label>Security Deposit (\u20B9)</Label><Input type="number" {...register('securityDeposit', { valueAsNumber: true })} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">LONG TERM LEASE DEED</h1>
    </div>
    <p>This Lease Deed is made at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, between:</p>
    <p><strong>${data.lessorName}</strong>, residing at <strong>${data.lessorAddress}</strong> (hereinafter referred to as the "LESSOR").</p>
    <div style="text-align: center; font-weight: bold; margin: 10px 0;">AND</div>
    <p><strong>${data.lesseeName}</strong>, residing at <strong>${data.lesseeAddress}</strong> (hereinafter referred to as the "LESSEE").</p>
    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">NOW THEREFORE THIS LEASE DEED WITNESSETH AS FOLLOWS:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;">The Lessor agrees to let out and the Lessee agrees to take on lease the premises strictly for a firm period of <strong>${data.leaseYears} years</strong>.</li>
      <li style="margin-bottom: 10px;">The monthly lease rent shall be <strong>\u20B9 ${Number(data.monthlyRent).toLocaleString('en-IN')}/-</strong>, payable in advance by the 5th of each month, subject to TDS (if applicable).</li>
      <li style="margin-bottom: 10px;">The Lessee has deposited <strong>\u20B9 ${Number(data.securityDeposit).toLocaleString('en-IN')}/-</strong> as an interest-free Security Deposit.</li>
      <li style="margin-bottom: 10px;">This Lease Deed is subject to mandatory registration with the Sub-Registrar under the Registration Act. The stamp duty and registration fee shall be borne equally or as mutually agreed.</li>
      <li style="margin-bottom: 10px;">The Lessee shall not sublet, assign, or part with possession of the premises to any third party.</li>
    </ol>
    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;"><strong>LESSOR</strong><br /><br /><br />___________________________<br />${data.lessorName}</div>
      <div style="width: 45%; text-align: right;"><strong>LESSEE</strong><br /><br /><br />___________________________<br />${data.lesseeName}</div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Lease Deed generated via MyeCA.in`;

export const LeaseDeedGenerator: DocumentGeneratorConfig = {
  id: 'lease-deed',
  title: 'Long Term Lease Deed',
  description: 'For leases spanning over 11 months, requiring mandatory registration with the sub-registrar office.',
  icon: <ScrollText className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
