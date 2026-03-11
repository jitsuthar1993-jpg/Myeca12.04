import { z } from 'zod';
import { FileText } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  donorName: z.string().min(2, 'Donor name required'),
  donorAge: z.number().min(18, 'Age must be 18+'),
  donorAddress: z.string().min(5, 'Donor address required'),
  doneeName: z.string().min(2, 'Donee name required'),
  doneeAge: z.number().min(1, 'Age required'),
  doneeAddress: z.string().min(5, 'Donee address required'),
  relation: z.string().min(2, 'Relation is required'),
  propertyDetails: z.string().min(10, 'Details of the property required'),
  propertyValue: z.number().min(1, 'Estimated value required'),
});

const defaultValues = {
  executionPlace: 'Mumbai',
  executionDate: new Date().toISOString().split('T')[0],
  donorName: '',
  donorAge: 60,
  donorAddress: '',
  doneeName: '',
  doneeAge: 30,
  doneeAddress: '',
  relation: 'Son',
  propertyDetails: 'Flat No. 101, measuring approx 1000 sq. ft., situated at Green Meadows, Andheri East, Mumbai, Maharashtra.',
  propertyValue: 5000000,
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Header</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Donor (The Giver)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('donorName')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('donorAge', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('donorAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Donee (The Receiver)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('doneeName')} /></div>
        <div><Label>Age (Years)</Label><Input type="number" {...register('doneeAge', { valueAsNumber: true })} /></div>
        <div><Label>Relation to Donor</Label><Input {...register('relation')} placeholder="e.g. Son, Daughter, Wife, Brother" /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('doneeAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Property to be Gifted</h3>
      <div className="grid grid-cols-1 gap-4 text-sm">
        <div><Label>Detailed Property Description</Label><Textarea rows={3} {...register('propertyDetails')} /></div>
        <div><Label>Estimated Market Value (\u20B9)</Label><Input type="number" {...register('propertyValue', { valueAsNumber: true })} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 22px; text-decoration: underline; text-transform: uppercase;">GIFT DEED</h1>
    </div>

    <p style="text-indent: 40px;">
      This Deed of Gift is made and executed at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and between:
    </p>

    <p style="margin-top: 20px;">
      <strong>${data.donorName || '____________'}</strong>, aged about <strong>${data.donorAge}</strong> years, residing at <strong>${data.donorAddress || '____________'}</strong> (hereinafter referred to as the <strong>"DONOR"</strong>, which expression shall, unless repugnant to the context, include their heirs, executors, administrators, and assigns) of the <strong>FIRST PART</strong>.
    </p>

    <div style="text-align: center; font-weight: bold; margin: 20px 0;">AND</div>

    <p>
      <strong>${data.doneeName || '____________'}</strong>, aged about <strong>${data.doneeAge}</strong> years, being the <strong>${data.relation.toLowerCase()}</strong> of the Donor, residing at <strong>${data.doneeAddress || '____________'}</strong> (hereinafter referred to as the <strong>"DONEE"</strong>, which expression shall, unless repugnant to the context, include their heirs, executors, administrators, and assigns) of the <strong>SECOND PART</strong>.
    </p>

    <p style="text-indent: 40px; margin-top: 30px;">
      <strong>WHEREAS</strong> the Donor is the absolute owner and in lawful possession of the property described in the Schedule below (hereinafter referred to as the "Scheduled Property").
    </p>
    <p style="text-indent: 40px;">
      <strong>AND WHEREAS</strong> out of natural love and affection towards the Donee, the Donor is desirous of gifting the Scheduled Property absolutely and forever unto the Donee, without any monetary consideration.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">NOW THIS DEED WITNESSETH AS FOLLOWS:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;">
        In consideration of natural love and affection, the Donor hereby voluntarily, out of their own free will and without any coercion or undue influence, transfers, conveys, and assigns unto the Donee, all their right, title, and interest in the Scheduled Property.
      </li>
      <li style="margin-bottom: 10px;">
        The Donee hereby joyfully accepts the gift of the Scheduled Property from the Donor, represented by accepting physical possession and the title deeds of the property.
      </li>
      <li style="margin-bottom: 10px;">
        The Donee shall henceforth peacefully hold, use, and enjoy the Scheduled Property as the absolute owner without any hindrance, interruption, or claim by the Donor or any person claiming under them.
      </li>
      <li style="margin-bottom: 10px;">
        The Donee is entitled to get the Scheduled Property mutated in their name in the records of the Municipal Corporation, Revenue Department, or any other relevant authority.
      </li>
      <li style="margin-bottom: 10px;">
        The estimated market value of the Scheduled Property for the purpose of computing stamp duty is <strong>\u20B9 ${Number(data.propertyValue).toLocaleString('en-IN')}/-</strong>.
      </li>
    </ol>

    <h3 style="margin-top: 30px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; text-align: center;">SCHEDULE OF THE PROPERTY</h3>
    <div style="padding: 15px; border: 1px solid #000; margin-top: 15px; font-style: italic;">
      All that piece and parcel of the property being: <br/><br/>
      ${data.propertyDetails}
    </div>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, the absolute Donor and the welcoming Donee have set their respective hands to this Gift Deed on the day, month, and year first above written.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>DONOR</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.donorName}
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>DONEE (Accepted)</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.doneeName}
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

const generateMarkdown = (data: any) => `# Gift Deed generated via MyeCA.in`;

export const GiftDeedGenerator: DocumentGeneratorConfig = {
  id: 'gift-deed',
  title: 'Gift Deed',
  description: 'Legally transfer movable or immovable property to a family member or third party without monetary exchange.',
  icon: <FileText className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
