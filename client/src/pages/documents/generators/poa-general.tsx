import { z } from 'zod';
import { Shield } from 'lucide-react';
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
  propertyScope: z.string().min(10, 'Briefly describe the assets or scope'),
});

const defaultValues = {
  executionPlace: 'Mumbai',
  executionDate: new Date().toISOString().split('T')[0],
  principalName: '',
  principalAge: 45,
  principalAddress: '',
  attorneyName: '',
  attorneyAge: 35,
  attorneyAddress: '',
  relation: 'Brother',
  propertyScope: 'All my movable and immovable properties, bank accounts, investments, and businesses situated in India.',
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

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Scope of Power</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Properties/Assets over which power is granted</Label><Textarea rows={3} {...register('propertyScope')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">GENERAL POWER OF ATTORNEY</h1>
    </div>

    <p style="text-indent: 50px;">
      TO ALL TO WHOM THESE PRESENTS SHALL COME, I, <strong>${data.principalName}</strong>, aged about <strong>${data.principalAge}</strong> years, residing at <strong>${data.principalAddress}</strong> (hereinafter referred to as the <strong>"Principal"</strong>), send greetings.
    </p>

    <p style="text-indent: 50px;">
      WHEREAS I am personally unable to attend to my day-to-day affairs, manage my properties, and conduct legal and financial matters due to my pre-occupations / ill-health / physical absence.
    </p>

    <p style="text-indent: 50px;">
      NOW KNOW YE ALL MEN BY THESE PRESENTS that I do hereby nominate, constitute, and appoint my ${data.relation ? `<strong>${data.relation}</strong>,` : ''} <strong>${data.attorneyName}</strong>, aged about <strong>${data.attorneyAge}</strong> years, residing at <strong>${data.attorneyAddress}</strong> (hereinafter referred to as the <strong>"Attorney"</strong>), to act as my true and lawful attorney in my name and on my behalf to do, execute, and perform all or any of the following acts, deeds, and things regarding:
    </p>

    <div style="padding-left: 20px; font-style: italic; border-left: 3px solid #ccc; margin: 15px 0;">
      ${data.propertyScope}
    </div>

    <ol style="margin-left: 20px; margin-top: 20px;">
      <li style="margin-bottom: 10px;">
        To manage, control, superintend, and oversee all my aforesaid properties and assets, to demand, recover, and receive rents, lease amounts, and profits thereof.
      </li>
      <li style="margin-bottom: 10px;">
        To operate my bank accounts, sign cheques, make deposits, withdrawals, and engage in financial transactions necessary for the proper management of my affairs.
      </li>
      <li style="margin-bottom: 10px;">
        To appear and represent me before any Court of Law, Tribunal, Tax Authorities, Sub-Registrar of Assurances, Municipal Corporations, and to sign, verify, and file plaints, written statements, appeals, and affidavits.
      </li>
      <li style="margin-bottom: 10px;">
        To apply for and obtain necessary mutations, clearances, and certificates from local bodies, electricity boards, and water departments.
      </li>
      <li style="margin-bottom: 10px;">
        To engage advocates, chartered accountants, and other professionals, and to pay their fees and charges out of my funds.
      </li>
    </ol>

    <p style="text-indent: 50px; font-weight: bold; margin-top: 20px;">
      AND I do hereby agree to ratify and confirm all and whatsoever my said Attorney shall lawfully do or cause to be done by virtue of these presents.
    </p>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, I have executed this General Power of Attorney at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
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

const generateMarkdown = (data: any) => `# General Power of Attorney generated via MyeCA.in`;

export const GeneralPOAGenerator: DocumentGeneratorConfig = {
  id: 'poa-general',
  title: 'General Power of Attorney',
  description: 'Authorize an agent or family member to handle broad financial, legal, and operational activities on your behalf.',
  icon: <Shield className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
