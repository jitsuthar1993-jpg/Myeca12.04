import { z } from 'zod';
import { ScrollText } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  testatorName: z.string().min(2, 'Name is required'),
  testatorSowDoW: z.string().min(2, 'Son/Wife/Daughter of is required'),
  testatorAge: z.number().min(18, 'Must be 18 or older'),
  testatorReligion: z.string().min(2, 'Religion is required (for succession law)'),
  testatorAddress: z.string().min(5, 'Address is required'),
  executorName: z.string().min(2, 'Executor name is required'),
  executorRelation: z.string().min(2, 'Executor relation is required'),
  beneficiaryName: z.string().min(2, 'Beneficiary name is required'),
  beneficiaryRelation: z.string().min(2, 'Beneficiary relation is required'),
  assetsDescription: z.string().min(10, 'Describe assets briefly'),
  executionPlace: z.string().min(2, 'Place of execution required'),
  executionDate: z.string().min(1, 'Date is required'),
});

const defaultValues = {
  testatorName: '',
  testatorSowDoW: '',
  testatorAge: 65,
  testatorReligion: 'Hindu',
  testatorAddress: '',
  executorName: '',
  executorRelation: 'Son',
  beneficiaryName: '',
  beneficiaryRelation: 'Wife',
  assetsDescription: 'All my movable and immovable properties, including bank accounts, fixed deposits, mutual funds, and residential house situated at the above address.',
  executionPlace: 'Mumbai',
  executionDate: new Date().toISOString().split('T')[0],
};

const FormComponent = ({ register, errors, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Testator (Your Details)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('testatorName')} /></div>
        <div><Label>Son/Wife/Daughter of</Label><Input {...register('testatorSowDoW')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('testatorAge', { valueAsNumber: true })} /></div>
        <div><Label>Religion (Crucial for Succession Law)</Label><Input {...register('testatorReligion')} placeholder="e.g., Hindu, Muslim, Christian" /></div>
        <div className="col-span-2"><Label>Current Residential Address</Label><Textarea rows={2} {...register('testatorAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Executor Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name of Executor</Label><Input {...register('executorName')} /></div>
        <div><Label>Relation to Testator</Label><Input {...register('executorRelation')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Beneficiary & Assets</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name of Primary Beneficiary</Label><Input {...register('beneficiaryName')} /></div>
        <div><Label>Relation to Testator</Label><Input {...register('beneficiaryRelation')} /></div>
        <div className="col-span-2"><Label>Description of Assets to Bequeath</Label><Textarea rows={3} {...register('assetsDescription')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Execution Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('executionDate')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #000; line-height: 2; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <h1 style="text-align: center; text-decoration: underline; text-transform: uppercase; font-size: 24px; margin-bottom: 40px; letter-spacing: 2px;">LAST WILL AND TESTAMENT</h1>

    <p style="text-indent: 50px;">
      I, <strong>${data.testatorName}</strong>, Son/Wife/Daughter of <strong>${data.testatorSowDoW}</strong>, aged <strong>${data.testatorAge}</strong> years, by religion <strong>${data.testatorReligion}</strong>, residing at <strong>${data.testatorAddress}</strong>, being of sound mind and memory, and not acting under any duress, coercion, or undue influence, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking any and all prior Wills, codicils, and testamentary dispositions made by me.
    </p>

    <h3 style="text-decoration: underline; margin-top: 30px;">1. APPOINTMENT OF EXECUTOR</h3>
    <p>
      I hereby name, constitute, and appoint my ${data.executorRelation}, <strong>${data.executorName}</strong>, to serve as the Executor of this my Last Will. If the aforesaid Executor is unable or unwilling to act, I direct that my heirs may appoint a suitable administrator under law. My Executor shall have full power to administer my estate and execute this Will in accordance with its provisions.
    </p>

    <h3 style="text-decoration: underline; margin-top: 30px;">2. DECLARATION OF ASSETS</h3>
    <p>
      At present, I am the absolute owner and possessor of the following movable and immovable properties, which are self-acquired/inherited, free from all encumbrances:
    </p>
    <div style="padding-left: 20px; font-style: italic; border-left: 3px solid #ccc; margin: 15px 0;">
      ${data.assetsDescription}
    </div>

    <h3 style="text-decoration: underline; margin-top: 30px;">3. BEQUEST TO BENEFICIARY</h3>
    <p>
      It is my sincere wish and desire that after my demise, all my movable and immovable properties, including but not limited to those described above, shall devolve absolutely and unconditionally upon my ${data.beneficiaryRelation}, <strong>${data.beneficiaryName}</strong>. 
    </p>
    <p>
      They shall become the absolute owner of my estate with full rights of ownership, mutation, and enjoyment. No other person, heir, or relative shall have any right, title, or interest in my properties unless specifically stated in a subsequent codicil.
    </p>

    <h3 style="text-decoration: underline; margin-top: 30px;">4. SIGNATURE AND EXECUTION</h3>
    <p>
      IN WITNESS WHEREOF, I, <strong>${data.testatorName}</strong>, the Testator, have set my hand to this my Last Will and Testament at <strong>${data.executionPlace}</strong> on this date <strong>${data.executionDate.split('-').reverse().join('/')}</strong>.
    </p>

    <div style="text-align: right; margin-top: 50px; margin-bottom: 50px;">
      <p style="margin-bottom: 40px;">_____________________________</p>
      <p style="margin: 0; font-weight: bold;">( ${data.testatorName} )</p>
      <p style="margin: 0; color: #666;">TESTATOR</p>
    </div>

    <h3 style="text-decoration: underline; margin-top: 30px;">ATTESTATION BY WITNESSES</h3>
    <p>
      SIGNED AND ACKNOWLEDGED by the said Testator, <strong>${data.testatorName}</strong>, as and for their Last Will and Testament, in our presence, who, at their request, in their presence, and in the presence of each other, have hereunto subscribed our names as witnesses on the day and year first above written. We further declare that the Testator appeared to be of sound mind and signed this Will voluntarily.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>Witness 1</strong><br /><br />
        Signature: ________________<br /><br />
        Name: _____________________<br /><br />
        Address: __________________<br />
        ___________________________
      </div>
      <div style="width: 45%;">
        <strong>Witness 2</strong><br /><br />
        Signature: ________________<br /><br />
        Name: _____________________<br /><br />
        Address: __________________<br />
        ___________________________
      </div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Last Will and Testament generated via MyeCA.in`;

export const WillGenerator: DocumentGeneratorConfig = {
  id: 'will',
  title: 'Simple WILL (Testament)',
  description: 'Clear and legally sound declaration of your intentions regarding the distribution of your assets after death.',
  icon: <ScrollText className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
