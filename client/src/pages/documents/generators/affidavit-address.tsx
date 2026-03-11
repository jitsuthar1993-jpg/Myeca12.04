import { z } from 'zod';
import { HomeIcon } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  fullName: z.string().min(2, 'Full Name is required'),
  fatherOrHusbandName: z.string().min(2, 'Father/Husband name is required'),
  relationType: z.enum(['Son of', 'Wife of', 'Daughter of']),
  age: z.number().min(18, 'Must be an adult (18+)'),
  currentAddress: z.string().min(5, 'Current Address is required'),
  durationYears: z.number().min(0, 'Duration in years required'),
  oldAddress: z.string().optional(),
  purpose: z.string().min(3, 'Purpose is required'),
});

const defaultValues = {
  executionPlace: 'Delhi',
  executionDate: new Date().toISOString().split('T')[0],
  fullName: '',
  fatherOrHusbandName: '',
  relationType: 'Son of',
  age: 30,
  currentAddress: '',
  durationYears: 5,
  oldAddress: '',
  purpose: 'Applying for Bank Account / Passport / Gas Connection',
};

const FormComponent = ({ register, errors, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Execution Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Deponent (Your Details)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('fullName')} /></div>
        <div>
          <Label>Relation</Label>
          <Controller
            control={control}
            name="relationType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Son of">Son of</SelectItem>
                  <SelectItem value="Wife of">Wife of</SelectItem>
                  <SelectItem value="Daughter of">Daughter of</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div><Label>Father / Husband's Name</Label><Input {...register('fatherOrHusbandName')} /></div>
        
        <div><Label>Age (Years)</Label><Input type="number" {...register('age', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Residential Address</Label><Textarea rows={2} {...register('currentAddress')} /></div>
        <div><Label>Residing since (Years)</Label><Input type="number" {...register('durationYears', { valueAsNumber: true })} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Additional Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Previous Address (If any, else leave blank)</Label><Textarea rows={2} {...register('oldAddress')} /></div>
        <div><Label>Purpose of Affidavit</Label><Input {...register('purpose')} placeholder="e.g., Opening a Bank Account" /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #000; line-height: 2; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 50px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">AFFIDAVIT FOR PROOF OF ADDRESS</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic;">(To be executed on Non-Judicial Stamp Paper and Notarized)</p>
    </div>

    <p style="text-indent: 50px;">
      I, <strong>${data.fullName}</strong>, ${data.relationType.toLowerCase()} <strong>${data.fatherOrHusbandName}</strong>, aged about <strong>${data.age}</strong> years, do hereby solemnly affirm and declare on oath as under:
    </p>

    <ol style="margin-left: 20px; margin-top: 20px;">
      <li style="margin-bottom: 15px;">
        That I am a citizen of India and am competent to swear this affidavit.
      </li>
      <li style="margin-bottom: 15px;">
        That my current and permanent residential address is: <br/>
        <strong>${data.currentAddress}</strong>
      </li>
      <li style="margin-bottom: 15px;">
        That I have been peacefully residing at the above-mentioned address for the last <strong>${data.durationYears} years</strong>.
      </li>
      ${data.oldAddress ? `<li style="margin-bottom: 15px;">That prior to my current address, I was residing at: <strong>${data.oldAddress}</strong>.</li>` : ''}
      <li style="margin-bottom: 15px;">
        That I am swearing this solemn affidavit specifically for the purpose of submitting it as a valid proof of residence for: <strong>${data.purpose}</strong>.
      </li>
      <li style="margin-bottom: 15px;">
        That all the supporting documents submitted along with this affidavit, if any, are genuine and legally valid.
      </li>
    </ol>

    <div style="text-align: right; margin-top: 60px; margin-bottom: 20px;">
      <p style="margin: 0;">___________________________</p>
      <p style="margin: 5px 0 0 0; font-weight: bold;">DEPONENT</p>
      <p style="margin: 5px 0 0 0;">( ${data.fullName} )</p>
    </div>

    <h3 style="text-decoration: underline; margin-top: 40px; text-align: center;">VERIFICATION</h3>
    <p style="text-indent: 50px;">
      Verified at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, that the contents of paragraphs 1 to ${data.oldAddress ? '6' : '5'} of this affidavit are true and correct to the best of my personal knowledge and belief. No part of it is false and nothing material has been concealed therefrom.
    </p>

    <div style="text-align: right; margin-top: 60px; margin-bottom: 80px;">
      <p style="margin: 0;">___________________________</p>
      <p style="margin: 5px 0 0 0; font-weight: bold;">DEPONENT</p>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dotted #ccc; padding-top: 20px;">
      <div style="width: 45%;">
        <strong>IDENTIFIED BY:</strong><br /><br /><br />
        ___________________________<br />
        Advocate / Notary Public
      </div>
      <div style="width: 45%;">
        <strong>ATTESTED:</strong><br /><br /><br />
        ___________________________<br />
        Notary Public<br />
        Place: ${data.executionPlace}
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# Address Proof Affidavit generated via MyeCA.in`;

export const AddressProofAffidavitGenerator: DocumentGeneratorConfig = {
  id: 'affidavit-address',
  title: 'Address Proof Affidavit',
  description: 'Self-declaration affidavit generally used for passport, banking, or vehicle registration when standard proof is missing.',
  icon: <HomeIcon className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
