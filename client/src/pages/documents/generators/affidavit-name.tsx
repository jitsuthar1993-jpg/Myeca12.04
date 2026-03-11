import { z } from 'zod';
import { User } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  oldName: z.string().min(2, 'Old Name is required'),
  newName: z.string().min(2, 'New Name is required'),
  fatherOrHusbandName: z.string().min(2, 'Father/Husband name is required'),
  relationType: z.enum(['Son of', 'Wife of', 'Daughter of']),
  age: z.number().min(18, 'Must be an adult (18+)'),
  address: z.string().min(5, 'Address is required'),
  reason: z.string().min(5, 'Reason is required'),
});

const defaultValues = {
  executionPlace: 'Delhi',
  executionDate: new Date().toISOString().split('T')[0],
  oldName: '',
  newName: '',
  fatherOrHusbandName: '',
  relationType: 'Son of',
  age: 30,
  address: '',
  reason: 'Numerology / Personal preference',
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
        <div><Label>Old Full Name (Current/Existing)</Label><Input {...register('oldName')} /></div>
        <div><Label>New Full Name (Desired)</Label><Input {...register('newName')} /></div>
        
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
        <div className="col-span-2"><Label>Complete Permanent Address</Label><Textarea rows={2} {...register('address')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Reason for Change</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Why are you changing your name?</Label><Input {...register('reason')} placeholder="e.g., Spelling correction, Marriage, Numerology" /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #000; line-height: 2; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 50px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">AFFIDAVIT FOR CHANGE OF NAME</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic;">(To be executed on Non-Judicial Stamp Paper of Rs. 20/- or Rs. 100/- and Notarized)</p>
    </div>

    <p style="text-indent: 50px;">
      I, <strong>${data.oldName}</strong>, ${data.relationType.toLowerCase()} <strong>${data.fatherOrHusbandName}</strong>, aged about <strong>${data.age}</strong> years, currently residing at <strong>${data.address}</strong>, do hereby solemnly affirm and declare on oath as under:
    </p>

    <ol style="margin-left: 20px; margin-top: 20px;">
      <li style="margin-bottom: 15px;">
        That my actual and existing name is <strong>${data.oldName}</strong>, and I am a citizen of India residing at the address mentioned above.
      </li>
      <li style="margin-bottom: 15px;">
        That for personal reasons, specifically <strong>${data.reason}</strong>, I have decided to formally change my name from <strong>${data.oldName}</strong> to <strong>${data.newName}</strong>.
      </li>
      <li style="margin-bottom: 15px;">
        That going forward, I shall at all times, in all my records, deeds, and dealings, and on all occasions whatsoever, use and sign the name <strong>${data.newName}</strong> as my sole and absolute name.
      </li>
      <li style="margin-bottom: 15px;">
        That I am executing this solemn affidavit to declare the change of my name and to be produced before consequence authorities, including but not limited to the Passport Office, Banks, PAN/Aadhaar Authorities, and the Department of Publication for publishing the name change in the Official Gazette of India.
      </li>
      <li style="margin-bottom: 15px;">
        That <strong>${data.oldName}</strong> and <strong>${data.newName}</strong> pertain to one and the same person, i.e., myself.
      </li>
    </ol>

    <div style="text-align: right; margin-top: 60px; margin-bottom: 20px;">
      <p style="margin: 0; font-weight: bold;">DEPONENT</p>
      <p style="margin: 10px 0 0 0;">(Old Name: ${data.oldName})</p>
      <p style="margin: 0;">(New Name: ${data.newName})</p>
    </div>

    <h3 style="text-decoration: underline; margin-top: 40px; text-align: center;">VERIFICATION</h3>
    <p style="text-indent: 50px;">
      Verified at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, that the contents of the above affidavit are true and correct to the best of my knowledge and belief, and that nothing material has been concealed therefrom.
    </p>

    <div style="text-align: right; margin-top: 60px; margin-bottom: 80px;">
      <p style="margin: 0; font-weight: bold;">DEPONENT</p>
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

const generateMarkdown = (data: any) => `# Name Change Affidavit generated via MyeCA.in`;

export const NameChangeAffidavitGenerator: DocumentGeneratorConfig = {
  id: 'affidavit-name',
  title: 'Name Change Affidavit',
  description: 'Legally required document for publishing name change notifications in state and national gazettes.',
  icon: <User className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
