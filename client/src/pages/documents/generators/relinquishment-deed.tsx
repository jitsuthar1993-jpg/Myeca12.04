import { z } from 'zod';
import { Users } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  releasorName: z.string().min(2, 'Releasor name required'),
  releasorAge: z.number().min(18, 'Age must be 18+'),
  releasorAddress: z.string().min(5, 'Releasor address required'),
  releaseeName: z.string().min(2, 'Releasee name required'),
  releaseeAge: z.number().min(18, 'Age must be 18+'),
  releaseeAddress: z.string().min(5, 'Releasee address required'),
  relation: z.string().min(2, 'Relation between parties required'),
  deceasedName: z.string().min(2, 'Name of deceased required'),
  dateOfDeath: z.string().min(1, 'Date of death required'),
  propertyDetails: z.string().min(10, 'Details of the property required'),
});

const defaultValues = {
  executionPlace: 'Delhi',
  executionDate: new Date().toISOString().split('T')[0],
  releasorName: '',
  releasorAge: 40,
  releasorAddress: '',
  releaseeName: '',
  releaseeAge: 45,
  releaseeAddress: '',
  relation: 'Brother',
  deceasedName: '',
  dateOfDeath: '',
  propertyDetails: 'House No. 42, Civil Lines, occupying 200 Sq. Yards land area, together with all rights and appurtenances.',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Header & Heritage</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
        <div><Label>Original Owner (Deceased)</Label><Input {...register('deceasedName')} /></div>
        <div><Label>Date of Death</Label><Input type="date" {...register('dateOfDeath')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Releasor (Giving up Rights)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('releasorName')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('releasorAge', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('releasorAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Releasee (Acquiring Rights)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('releaseeName')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('releaseeAge', { valueAsNumber: true })} /></div>
        <div><Label>Relation to Releasor</Label><Input {...register('relation')} placeholder="e.g. Brother, Sister, Mother" /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('releaseeAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Property Being Relinquished</h3>
      <div className="grid grid-cols-1 gap-4 text-sm">
        <div><Label>Complete Property Identification</Label><Textarea rows={3} {...register('propertyDetails')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 22px; text-decoration: underline; text-transform: uppercase;">RELINQUISHMENT DEED / RELEASE DEED</h1>
    </div>

    <p style="text-indent: 40px;">
      This Deed of Relinquishment is made and executed at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and between:
    </p>

    <p style="margin-top: 20px;">
      <strong>${data.releasorName || '____________'}</strong>, aged about <strong>${data.releasorAge}</strong> years, residing at <strong>${data.releasorAddress || '____________'}</strong> (hereinafter referred to as the <strong>"RELEASOR"</strong>, which expression shall, unless repugnant to the context, mean and include their heirs, legal representatives, and assigns) of the <strong>FIRST PART</strong>.
    </p>

    <div style="text-align: center; font-weight: bold; margin: 20px 0;">IN FAVOUR OF</div>

    <p>
      <strong>${data.releaseeName || '____________'}</strong>, aged about <strong>${data.releaseeAge}</strong> years, being the <strong>${data.relation.toLowerCase()}</strong> of the Releasor, residing at <strong>${data.releaseeAddress || '____________'}</strong> (hereinafter referred to as the <strong>"RELEASEE"</strong>, which expression shall, unless repugnant to the context, mean and include their heirs, administrators, and assigns) of the <strong>SECOND PART</strong>.
    </p>

    <p style="text-indent: 40px; margin-top: 30px;">
      <strong>WHEREAS</strong> the property described in the Schedule below (hereinafter referred to as the "Scheduled Property") was originally acquired and owned absolutely by late <strong>${data.deceasedName}</strong>.
    </p>
    <p style="text-indent: 40px;">
      <strong>AND WHEREAS</strong> the said <strong>${data.deceasedName}</strong> died intestate (without leaving a Will) on <strong>${data.dateOfDeath.split('-').reverse().join('/')}</strong>, leaving behind the Releasor, the Releasee, and potentially other legal heirs, successfully inheriting proportional, undivided shares in the Scheduled Property under the Hindu Succession Act / prevailing laws.
    </p>
    <p style="text-indent: 40px;">
      <strong>AND WHEREAS</strong> the Releasor desires to release, relinquish, and give up all their undivided right, title, and share in the Scheduled Property absolutely in favour of the Releasee out of natural love and affection, and without any monetary consideration or compensation.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">NOW THIS DEED WITNESSETH AS FOLLOWS:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;">
        The Releasor doth hereby absolutely and forever release, relinquish, and surrender all their right, title, interest, and share in the Scheduled Property unto and in favour of the Releasee.
      </li>
      <li style="margin-bottom: 10px;">
        The Releasor declares that they, their heirs, and assigns shall henceforth have no right, claim, or demand whatsoever against the Scheduled Property. The Releasee shall become the absolute owner of the relinquished share.
      </li>
      <li style="margin-bottom: 10px;">
        The Releasee is at full liberty to have the property mutated or transferred exclusively in their name in the records of the local municipal corporation, revenue office, or any other concerned statutory department based on this document.
      </li>
      <li style="margin-bottom: 10px;">
        The Releasor affirms that they have not previously encumbered, alienated, or mortgaged their share in the Scheduled Property.
      </li>
    </ol>

    <h3 style="margin-top: 30px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; text-align: center;">SCHEDULE OF THE PROPERTY</h3>
    <div style="padding: 15px; border: 1px solid #000; margin-top: 15px; font-style: italic;">
      All that piece, parcel, and undivided share in the property known as: <br/><br/>
      ${data.propertyDetails}
    </div>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, the parties hereto have set their respective hands to this Relinquishment Deed out of their own free will and volition, without any fraud or coercion, on the day, month, and year first above written.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>RELEASOR</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.releasorName}
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>RELEASEE</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.releaseeName}
      </div>
    </div>

    <div style="margin-top: 60px;">
      <p style="font-weight: bold;">WITNESSES:</p>
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <div style="width: 45%;">
          1. Signature: ________________<br /><br />
          Name: ________________________<br /><br />
          Address: _____________________<br />
          ______________________________
        </div>
        <div style="width: 45%;">
          2. Signature: ________________<br /><br />
          Name: ________________________<br /><br />
          Address: _____________________<br />
          ______________________________
        </div>
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# Relinquishment Deed generated via MyeCA.in`;

export const RelinquishmentDeedGenerator: DocumentGeneratorConfig = {
  id: 'relinquishment-deed',
  title: 'Relinquishment Deed',
  description: 'Document for legal heirs to transfer or give up their claim over inherited ancestral property to co-heirs.',
  icon: <Users className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
