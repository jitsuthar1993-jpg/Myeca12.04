import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  societyName: z.string().min(2, 'Society Name is required'),
  societyAddress: z.string().min(5, 'Society Address is required'),
  date: z.string().min(1, 'Date is required'),
  membername: z.string().min(2, 'Member Name is required'),
  flatNumber: z.string().min(1, 'Flat Number is required'),
  purpose: z.string().min(5, 'Purpose of NOC is required'),
  bankName: z.string().optional(),
});

const defaultValues = {
  societyName: 'Silver Oaks Co-operative Housing Society Ltd.',
  societyAddress: 'Plot No. 45, Sector 12, Vashi, Navi Mumbai',
  date: new Date().toISOString().split('T')[0],
  membername: '',
  flatNumber: '',
  purpose: 'Sale / Transfer of Flat',
  bankName: '',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Society Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label>Society Name & Reg. No</Label><Input {...register('societyName')} /></div>
        <div className="col-span-2"><Label>Society Address</Label><Textarea rows={2} {...register('societyAddress')} /></div>
        <div><Label>Issue Date</Label><Input type="date" {...register('date')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Member & Flat Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name of the Member/Owner</Label><Input {...register('membername')} /></div>
        <div><Label>Flat / Unit Number</Label><Input {...register('flatNumber')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">NOC Details</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Purpose (e.g., Sale, Mortgage, Passport, Bank Loan)</Label><Input {...register('purpose')} /></div>
        <div><Label>Bank / Institution Name (Optional, if for loan)</Label><Input {...register('bankName')} placeholder="e.g. State Bank of India" /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Arial', sans-serif; font-size: 14px; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">
    
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 22px; text-transform: uppercase;">${data.societyName}</h1>
      <p style="margin: 5px 0 0 0;">${data.societyAddress}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
      <div>Ref No: ${data.societyName.substring(0, 3).toUpperCase()}/NOC/${new Date().getFullYear()}/__</div>
      <div>Date: <strong>${data.date.split('-').reverse().join('/')}</strong></div>
    </div>

    <div style="text-align: center; margin-bottom: 40px;">
      <h2 style="margin: 0; font-size: 18px; text-decoration: underline; text-transform: uppercase;">NO OBJECTION CERTIFICATE</h2>
    </div>

    <div style="margin-bottom: 30px;">
      <strong>To Whomsoever It May Concern</strong>
      ${data.bankName ? `<br/><strong>${data.bankName}</strong>` : ''}
    </div>

    <p style="text-align: justify; margin-bottom: 20px;">
      This is to certify that <strong>${data.membername}</strong> is a bonafide member of <strong>${data.societyName}</strong>. They are the absolute owner and in possession of Flat/Unit No. <strong>${data.flatNumber}</strong> within the society premises located at ${data.societyAddress}.
    </p>

    <p style="text-align: justify; margin-bottom: 20px;">
      The society hereby confirms that:
      <ol style="margin-top: 10px; margin-left: 20px;">
        <li style="margin-bottom: 10px;">The said member has paid all the society maintenance charges, dues, and clear assessments up to date.</li>
        <li style="margin-bottom: 10px;">The society does not have any lien, claim, charge, or encumbrance of any nature whatsoever against the said flat/unit.</li>
        <li style="margin-bottom: 10px;">The society has <strong>No Objection</strong> to the member utilizing this certificate for the purpose of: <strong>${data.purpose}</strong>.</li>
      </ol>
    </p>

    <p style="text-align: justify; margin-bottom: 40px;">
      This certificate is being issued unconditionally at the specific request of the member ${data.bankName ? `for submission to ${data.bankName}` : ''} without any financial commitment or liability on the part of the Society or its Managing Committee.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 80px;">
      <div style="width: 30%; text-align: center;">
        _____________________<br/><br/>
        <strong>Secretary</strong>
      </div>
      <div style="width: 30%; text-align: center;">
        (Society Seal)<br/><br/>
      </div>
      <div style="width: 30%; text-align: center;">
        _____________________<br/><br/>
        <strong>Chairman / President</strong>
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# Society NOC generated via MyeCA.in`;

export const SocietyNocGenerator: DocumentGeneratorConfig = {
  id: 'society-noc',
  title: 'Housing Society NOC',
  description: 'No Objection Certificate templates required from RWAs for bank loans, renovations, or tenant approvals.',
  icon: <Building2 className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
