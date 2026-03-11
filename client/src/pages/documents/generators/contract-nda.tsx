import { z } from 'zod';
import { Shield } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  executionDate: z.string().min(1, 'Date is required'),
  executionPlace: z.string().min(2, 'Place of execution is required'),
  ndaType: z.enum(['Mutual', 'Unilateral']),
  disclosingParty: z.object({
    name: z.string().min(2, 'Name is required'),
    type: z.string().min(2, 'Type (e.g. Private Limited Company) is required'),
    address: z.string().min(5, 'Address is required'),
    representative: z.string().min(2, 'Representative is required'),
  }),
  receivingParty: z.object({
    name: z.string().min(2, 'Name is required'),
    type: z.string().min(2, 'Type (e.g. Individual / Company) is required'),
    address: z.string().min(5, 'Address is required'),
    representative: z.string().min(2, 'Representative is required'),
  }),
  purpose: z.string().min(10, 'Specific purpose required to protect scope'),
  durationYears: z.number().min(1, 'Duration must be at least 1 year'),
  jurisdiction: z.string().min(2, 'Jurisdiction is required (City/State)'),
});

const defaultValues = {
  executionDate: new Date().toISOString().split('T')[0],
  executionPlace: 'Mumbai, Maharashtra',
  ndaType: 'Mutual',
  disclosingParty: { name: '', type: 'Private Limited Company', address: '', representative: '' },
  receivingParty: { name: '', type: 'Private Limited Company', address: '', representative: '' },
  purpose: 'Evaluating a potential business relationship or investment opportunity.',
  durationYears: 3,
  jurisdiction: 'Mumbai',
};

const FormComponent = ({ register, errors, control, watch }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Agreement Structure</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Type of NDA</Label>
          <Controller
            control={control}
            name="ndaType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mutual">Mutual (Two-way)</SelectItem>
                  <SelectItem value="Unilateral">Unilateral (One-way)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Execution Date</Label>
          <Input type="date" {...register('executionDate')} />
        </div>
        <div>
          <Label>Execution Place (City)</Label>
          <Input {...register('executionPlace')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-blue-800">First Party (Disclosing)</h3>
          <div>
            <Label>Legal Name</Label>
            <Input {...register('disclosingParty.name')} />
          </div>
          <div>
            <Label>Entity Type (Individual/Company..)</Label>
            <Input {...register('disclosingParty.type')} />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea rows={2} {...register('disclosingParty.address')} />
          </div>
          <div>
            <Label>Authorised Representative</Label>
            <Input {...register('disclosingParty.representative')} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-orange-800">Second Party (Receiving)</h3>
          <div>
            <Label>Legal Name</Label>
            <Input {...register('receivingParty.name')} />
          </div>
          <div>
            <Label>Entity Type</Label>
            <Input {...register('receivingParty.type')} />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea rows={2} {...register('receivingParty.address')} />
          </div>
          <div>
            <Label>Authorised Representative</Label>
            <Input {...register('receivingParty.representative')} />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Terms & Scope</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label>Purpose of Disclosure</Label>
          <Input {...register('purpose')} placeholder="e.g. Discussing project Titan" />
        </div>
        <div>
          <Label>Duration (Years)</Label>
          <Input type="number" {...register('durationYears', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Jurisdiction (Courts of)</Label>
          <Input {...register('jurisdiction')} placeholder="Mumbai" />
        </div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => {
  const isMutual = data.ndaType === 'Mutual';

  return `
    <div style="font-family: 'Times New Roman', serif; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
      
      <h1 style="text-align: center; text-decoration: underline; text-transform: uppercase;">NON-DISCLOSURE AGREEMENT</h1>
      
      <p style="text-indent: 50px;">
        This ${data.ndaType} Non-Disclosure Agreement (the "Agreement") is made and entered into at <strong>${data.executionPlace}</strong> on this date <strong>${data.executionDate}</strong>.
      </p>

      <div style="text-align: center; font-weight: bold; margin: 20px 0;">BY AND BETWEEN</div>

      <p>
        <strong>${data.disclosingParty?.name || '[Party 1]'}</strong>, a <strong>${data.disclosingParty?.type}</strong>, having its principal place of business at <strong>${data.disclosingParty?.address}</strong>, represented by its authorized signator <strong>${data.disclosingParty?.representative}</strong> (hereinafter referred to as the "<strong>${isMutual ? 'Party A' : 'Disclosing Party'}</strong>", which expression shall, unless contrary to the context thereof, be deemed to include its successors and permitted assigns);
      </p>

      <div style="text-align: center; font-weight: bold; margin: 20px 0;">AND</div>

      <p>
        <strong>${data.receivingParty?.name || '[Party 2]'}</strong>, a <strong>${data.receivingParty?.type}</strong>, having its principal place/residence at <strong>${data.receivingParty?.address}</strong>, represented by <strong>${data.receivingParty?.representative}</strong> (hereinafter referred to as the "<strong>${isMutual ? 'Party B' : 'Receiving Party'}</strong>", which expression shall, unless contrary to the context thereof, be deemed to include its successors and permitted assigns).
      </p>

      <p style="margin-top: 30px;">
        ${isMutual ? 'Party A and Party B' : 'The Disclosing Party and the Receiving Party'} are hereinafter individually referred to as a "Party" and collectively as the "Parties".
      </p>

      <h3 style="margin-top: 30px; text-decoration: underline;">WHEREAS:</h3>
      <p style="text-indent: 50px;">
        The Parties intend to engage in discussions regarding <strong>${data.purpose}</strong> (the "Purpose"). In the course of such communications, ${isMutual ? 'both Parties' : 'the Disclosing Party'} may disclose certain proprietary and confidential information to ${isMutual ? 'the other Party' : 'the Receiving Party'}.
      </p>
      <p style="text-indent: 50px;">
        The Parties desire to outline the terms and conditions governing the protection and use of such Confidential Information.
      </p>

      <h3 style="margin-top: 30px; text-decoration: underline;">NOW, THEREFORE, IT IS AGREED AS FOLLOWS:</h3>
      
      <ol style="margin-left: 20px;">
        <li style="margin-bottom: 15px;">
          <strong>Definition of Confidential Information:</strong> "Confidential Information" shall mean all information ${isMutual ? 'disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party")' : 'disclosed by the Disclosing Party to the Receiving Party'}, whether oral, written, or electronic, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information. This includes, but is not limited to, business plans, financial data, technical specifications, software code, customer lists, and trade secrets.
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Obligations of the Receiving Party:</strong> The Receiving Party shall hold the Confidential Information in strict confidence and shall restrict disclosure of such Confidential Information solely to its employees, agents, or advisors who have a need to know such information for the Purpose and who are bound by confidentiality obligations as restrictive as those in this Agreement. The Receiving Party shall not use the Confidential Information for any reason other than the Purpose.
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Exclusions:</strong> Confidential Information shall not include information that: (a) is or becomes publicly known through no wrongful act of the Receiving Party; (b) was lawfully known to the Receiving Party prior to disclosure; (c) is lawfully received from a third party without breach of any confidentiality obligation; or (d) is independently developed by the Receiving Party.
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Term:</strong> This Agreement shall remain in effect for a period of <strong>${data.durationYears} year(s)</strong> from the Effective Date. The obligations of confidentiality shall survive the termination of this Agreement.
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Return of Materials:</strong> Upon written request of the Disclosing Party, the Receiving Party shall promptly return or destroy all documents and materials containing Confidential Information and certify such destruction in writing.
        </li>
        <li style="margin-bottom: 15px;">
          <strong>Governing Law and Jurisdiction:</strong> This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent courts at <strong>${data.jurisdiction}</strong>.
        </li>
      </ol>

      <p style="margin-top: 40px;">
        IN WITNESS WHEREOF, the Parties hereto have executed this Non-Disclosure Agreement on the date first above written.
      </p>

      <div style="display: flex; justify-content: space-between; margin-top: 80px;">
        <div style="text-align: left; width: 45%;">
          <strong>For and on behalf of:</strong><br/>
          <span style="font-weight: bold;">${data.disclosingParty?.name}</span><br /><br /><br /><br />
          Sign: __________________________<br /><br />
          Name: ${data.disclosingParty?.representative}<br />
          Title: Authorized Signatory
        </div>
        <div style="text-align: left; width: 45%;">
          <strong>For and on behalf of:</strong><br/>
          <span style="font-weight: bold;">${data.receivingParty?.name}</span><br /><br /><br /><br />
          Sign: __________________________<br /><br />
          Name: ${data.receivingParty?.representative}<br />
          Title: Authorized Signatory
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) => `# Non-Disclosure AgreementnnGenerated via MyeCA.in`;

export const NDAGenerator: DocumentGeneratorConfig = {
  id: 'contract-nda',
  title: 'Non-Disclosure Agreement (NDA)',
  description:
    'Mutually or unilaterally protect your intellectual property, trade secrets, and ongoing discussions.',
  icon: <Shield className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
