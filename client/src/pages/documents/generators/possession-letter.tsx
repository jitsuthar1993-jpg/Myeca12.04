import { z } from 'zod';
import { Key } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  builderName: z.string().min(2, 'Builder/Seller name required'),
  buyerName: z.string().min(2, 'Buyer name required'),
  propertyDetails: z.string().min(5, 'Property details required'),
  agreementDate: z.string().min(1, 'Date of agreement required'),
});

const defaultValues = {
  executionPlace: 'Gurugram',
  executionDate: new Date().toISOString().split('T')[0],
  builderName: 'DLF Promoters Pvt. Ltd.',
  buyerName: '',
  propertyDetails: 'Unit No. 12B, Tower C, Horizon Heights, DLF Phase 5, Gurugram',
  agreementDate: '',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Execution Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Possession Date</Label><Input type="date" {...register('executionDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Parties</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Seller / Builder / Promotor Name</Label><Input {...register('builderName')} /></div>
        <div><Label>Buyer / Purchaser Name</Label><Input {...register('buyerName')} /></div>
        <div><Label>Date of Sale/Builder Agreement</Label><Input type="date" {...register('agreementDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Property Details</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Full Property Identification (Unit/Tower/Project)</Label><Textarea rows={2} {...register('propertyDetails')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 22px; text-decoration: underline; text-transform: uppercase;">POSSESSION LETTER</h1>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
      <div>Place: <strong>${data.executionPlace}</strong></div>
      <div>Date: <strong>${data.executionDate.split('-').reverse().join('/')}</strong></div>
    </div>

    <div style="margin-bottom: 20px;">
      <strong>To,</strong><br/>
      <strong>${data.buyerName}</strong><br/>
      (Hereinafter referred to as the Allottee/Purchaser)
    </div>

    <div style="font-weight: bold; margin-bottom: 20px;">
      Sub: Handing over physical possession of property bearing ${data.propertyDetails}.
    </div>

    <p style="margin-bottom: 15px;">Dear Sir/Madam,</p>

    <p>
      In reference to the Agreement for Sale / Builder Buyer Agreement executed on <strong>${data.agreementDate.split('-').reverse().join('/')}</strong>, we, <strong>${data.builderName}</strong>, are pleased to formally hand over the peaceable and vacant physical possession of the property described as:
    </p>

    <div style="padding: 15px; border: 1px solid #ccc; margin: 20px 0; font-weight: bold;">
      ${data.propertyDetails}
    </div>

    <ol style="margin-left: 20px; margin-top: 20px;">
      <li style="margin-bottom: 15px;">
        The keys (_______ sets) of the said property are hereby handed over to you today, i.e., ${data.executionDate.split('-').reverse().join('/')}.
      </li>
      <li style="margin-bottom: 15px;">
        You have inspected the said property, including the fixtures, fittings, civil works, electricals, and finishing, and confirm being completely satisfied with the construction quality and specifications, which are in accordance with the Agreement.
      </li>
      <li style="margin-bottom: 15px;">
        From the date of this Possession Letter, you shall be fully responsible for the maintenance of the property, including payment of all electricity, water, municipal taxes, and society maintenance charges.
      </li>
      <li style="margin-bottom: 15px;">
        We hold no further liability towards any pending civil/interior works in the said unit, except as covered under the defect liability clause of the Agreement for Sale.
      </li>
    </ol>

    <p style="margin-top: 30px;">
      We congratulate you and wish you all the very best in your new property.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 80px;">
      <div style="width: 45%;">
        <strong>Handed Over By:</strong><br /><br /><br />
        ___________________________<br />
        For <strong>${data.builderName}</strong><br />
        (Authorized Signatory)
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>Taken Over & Accepted By:</strong><br /><br /><br />
        ___________________________<br />
        <strong>${data.buyerName}</strong><br />
        (Purchaser / Allottee)
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# Possession Letter generated via MyeCA.in`;

export const PossessionLetterGenerator: DocumentGeneratorConfig = {
  id: 'possession-letter',
  title: 'Possession/Handover Letter',
  description: 'Official letter to document the transfer of physical possession of a property from builder to buyer.',
  icon: <Key className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
