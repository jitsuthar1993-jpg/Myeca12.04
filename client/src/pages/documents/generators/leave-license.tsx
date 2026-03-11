import { z } from 'zod';
import { FileText } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place required'),
  executionDate: z.string().min(1, 'Date required'),
  licensorName: z.string().min(2, 'Licensor name required'),
  licensorAddress: z.string().min(5, 'Address required'),
  licenseeName: z.string().min(2, 'Licensee name required'),
  licenseeAddress: z.string().min(5, 'Address required'),
  propertyDetails: z.string().min(5, 'Property details required'),
  licensePeriod: z.number().min(1, 'Period required'),
  monthlyFee: z.number().min(0, 'Monthly fee required'),
  depositAmount: z.number().min(0, 'Deposit required'),
});

const defaultValues = {
  executionPlace: 'Mumbai, Maharashtra',
  executionDate: new Date().toISOString().split('T')[0],
  licensorName: '',
  licensorAddress: '',
  licenseeName: '',
  licenseeAddress: '',
  propertyDetails: 'Flat No. 101, A Wing, Crystal Apartments, Andheri West, Mumbai',
  licensePeriod: 11,
  monthlyFee: 30000,
  depositAmount: 100000,
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Execution & Property</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('executionDate')} /></div>
        <div className="col-span-2"><Label>Licensed Premises Details</Label><Textarea rows={2} {...register('propertyDetails')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Licensor (Owner)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('licensorName')} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} {...register('licensorAddress')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Licensee (Tenant)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('licenseeName')} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} {...register('licenseeAddress')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Terms</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Period (Months)</Label><Input type="number" {...register('licensePeriod', { valueAsNumber: true })} /></div>
        <div><Label>Monthly License Fee (\u20B9)</Label><Input type="number" {...register('monthlyFee', { valueAsNumber: true })} /></div>
        <div><Label>Security Deposit (\u20B9)</Label><Input type="number" {...register('depositAmount', { valueAsNumber: true })} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">LEAVE AND LICENSE AGREEMENT</h1>
    </div>
    <p>This Leave and License Agreement is made at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, between:</p>
    <p><strong>${data.licensorName}</strong>, residing at <strong>${data.licensorAddress}</strong> (hereinafter referred to as the "LICENSOR").</p>
    <div style="text-align: center; font-weight: bold; margin: 10px 0;">AND</div>
    <p><strong>${data.licenseeName}</strong>, residing at <strong>${data.licenseeAddress}</strong> (hereinafter referred to as the "LICENSEE").</p>
    <p><strong>WHEREAS</strong> the Licensor is the lawful owner of <strong>${data.propertyDetails}</strong> (hereinafter referred to as the "Premises"). AND WHEREAS the Licensee has requested a temporary leave and license to use the Premises for residential purposes.</p>
    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">NOW IT IS AGREED AS FOLLOWS:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;">The Licensor grants permission to the Licensee to occupy the Premises for a period of <strong>${data.licensePeriod} months</strong>. No tenancy rights are created.</li>
      <li style="margin-bottom: 10px;">The Licensee shall pay a monthly License Fee of <strong>\u20B9 ${Number(data.monthlyFee).toLocaleString('en-IN')}/-</strong> in advance.</li>
      <li style="margin-bottom: 10px;">An interest-free Security Deposit of <strong>\u20B9 ${Number(data.depositAmount).toLocaleString('en-IN')}/-</strong> has been paid, refundable upon vacant handover.</li>
      <li style="margin-bottom: 10px;">The Licensee shall bear electricity and water charges during the period.</li>
    </ol>
    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;"><strong>LICENSOR</strong><br /><br /><br />___________________________<br />${data.licensorName}</div>
      <div style="width: 45%; text-align: right;"><strong>LICENSEE</strong><br /><br /><br />___________________________<br />${data.licenseeName}</div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Leave and License Agreement generated via MyeCA.in`;

export const LeaveLicenseGenerator: DocumentGeneratorConfig = {
  id: 'leave-license',
  title: 'Leave & License Agreement',
  description: 'Specific to select states, securely transferring temporary operational rights without granting tenancy.',
  icon: <FileText className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
