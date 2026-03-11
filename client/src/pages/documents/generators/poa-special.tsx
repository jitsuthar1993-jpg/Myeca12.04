import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  principalName: z.string().min(2, 'Principal Name is required'),
  principalAge: z.number().min(18, 'Age must be 18+'),
  principalAddress: z.string().min(5, 'Principal Address is required'),
  attorneyName: z.string().min(2, 'Attorney Name is required'),
  attorneyAge: z.number().min(18, 'Age must be 18+'),
  attorneyAddress: z.string().min(5, 'Attorney Address is required'),
  relation: z.string().optional(),
  specificTask: z.string().min(10, 'Briefly describe the single specific task'),
});

const defaultValues = {
  executionPlace: 'Delhi',
  executionDate: new Date().toISOString().split('T')[0],
  principalName: '',
  principalAge: 40,
  principalAddress: '',
  attorneyName: '',
  attorneyAge: 35,
  attorneyAddress: '',
  relation: 'Brother',
  specificTask: 'To appear before the Sub-Registrar of Assurances, Delhi, and execute, present, and register the Sale Deed in respect of my property bearing Flat No. 402, Green Park, South Delhi.',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Header</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">The Principal (Grantor)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('principalName')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('principalAge', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('principalAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">The Attorney (Agent)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('attorneyName')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('attorneyAge', { valueAsNumber: true })} /></div>
        <div><Label>Relation (e.g., Brother, Wife, Friend)</Label><Input {...register('relation')} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('attorneyAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Specific Power / Task</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Describe the SINGLE task authorized (e.g., Property Sale, Tax Filing)</Label><Textarea rows={3} {...register('specificTask')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">SPECIAL POWER OF ATTORNEY</h1>
    </div>

    <p style="text-indent: 50px;">
      TO ALL TO WHOM THESE PRESENTS SHALL COME, I, <strong>${data.principalName}</strong>, aged about <strong>${data.principalAge}</strong> years, residing at <strong>${data.principalAddress}</strong> (hereinafter referred to as the <strong>"Principal"</strong>), send greetings.
    </p>

    <p style="text-indent: 50px;">
      WHEREAS I am unable to be personally present and execute a specific legal and administrative task due to my pre-occupations / physical absence from the location.
    </p>

    <p style="text-indent: 50px;">
      NOW KNOW YE ALL BY THESE PRESENTS that I do hereby nominate, constitute, and appoint my ${data.relation ? `<strong>${data.relation}</strong>,` : ''} <strong>${data.attorneyName}</strong>, aged about <strong>${data.attorneyAge}</strong> years, residing at <strong>${data.attorneyAddress}</strong> (hereinafter referred to as the <strong>"Attorney"</strong>), to act as my true and lawful attorney in my name and on my behalf to do, execute, and perform the following specific acts, deeds, and things regarding:
    </p>

    <div style="padding-left: 20px; font-style: italic; border-left: 3px solid #ccc; margin: 15px 0;">
      ${data.specificTask}
    </div>

    <p style="text-indent: 50px; margin-top: 20px;">
      AND in connection with the above specific task:
    </p>

    <ol style="margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 10px;">
        To appear before any Sub-Registrar, Tax Authority, Bank, Court, or Government body as may be required.
      </li>
      <li style="margin-bottom: 10px;">
        To sign, execute, and deliver all necessary applications, affidavits, deeds, receipts, or forms connected entirely with the specific task aforementioned.
      </li>
      <li style="margin-bottom: 10px;">
        To pay any requisite fees, stamp duties, or penalties that may be required for the successful completion of the said task.
      </li>
    </ol>

    <p style="text-indent: 50px; font-weight: bold; margin-top: 20px;">
      AND I do hereby agree to ratify and confirm all and whatsoever my said Attorney shall lawfully do or cause to be done by virtue of these presents, restricted exclusively to the task described above.
    </p>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, I have executed this Special Power of Attorney at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
      <div style="width: 45%;">
        <strong>ACCEPTED BY:</strong><br /><br /><br />
        ___________________________<br />
        <strong>${data.attorneyName}</strong><br />
        (Attorney)
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>EXECUTED BY:</strong><br /><br /><br />
        ___________________________<br />
        <strong>${data.principalName}</strong><br />
        (Principal)
      </div>
    </div>

    <div style="margin-top: 60px;">
      <p style="font-weight: bold;">WITNESSES:</p>
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <div style="width: 45%;">
          1. Signature: ________________<br /><br />
          Name & Address: ________________<br />
          ________________________________
        </div>
        <div style="width: 45%;">
          2. Signature: ________________<br /><br />
          Name & Address: ________________<br />
          ________________________________
        </div>
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# Special Power of Attorney generated via MyeCA.in`;

export const SpecialPOAGenerator: DocumentGeneratorConfig = {
  id: 'poa-special',
  title: 'Special Power of Attorney',
  description: 'Grant limited powers to a representative for a specific task, such as property registration or tax filing.',
  icon: <CheckCircle className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
