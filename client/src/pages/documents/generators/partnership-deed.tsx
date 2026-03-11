import { z } from 'zod';
import { Scale } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  firmName: z.string().min(2, 'Firm Name is required'),
  firmAddress: z.string().min(5, 'Firm Address is required'),
  partner1Name: z.string().min(2, 'Partner 1 Name required'),
  partner1Address: z.string().min(5, 'Partner 1 Address required'),
  partner1Capital: z.number().min(1, 'Capital must be > 0'),
  partner2Name: z.string().min(2, 'Partner 2 Name required'),
  partner2Address: z.string().min(5, 'Partner 2 Address required'),
  partner2Capital: z.number().min(1, 'Capital must be > 0'),
  businessNature: z.string().min(10, 'Business nature required'),
});

const defaultValues = {
  executionPlace: 'Chennai',
  executionDate: new Date().toISOString().split('T')[0],
  firmName: 'A&B Enterprises',
  firmAddress: '12, Mount Road, Chennai',
  partner1Name: '',
  partner1Address: '',
  partner1Capital: 100000,
  partner2Name: '',
  partner2Address: '',
  partner2Capital: 100000,
  businessNature: 'Trading, wholesale, and retail distribution of FMCG products and any other business mutually agreed upon.',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Partnership Firm details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
        <div className="col-span-2"><Label>Firm Trade Name</Label><Input {...register('firmName')} /></div>
        <div className="col-span-2"><Label>Principal Place of Business</Label><Textarea rows={2} {...register('firmAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Partner 1</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('partner1Name')} /></div>
        <div><Label>Capital Brought In (\u20B9)</Label><Input type="number" {...register('partner1Capital', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('partner1Address')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Partner 2</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('partner2Name')} /></div>
        <div><Label>Capital Brought In (\u20B9)</Label><Input type="number" {...register('partner2Capital', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('partner2Address')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Business Operations</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Nature of Business Operations</Label><Textarea rows={3} {...register('businessNature')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 22px; text-decoration: underline; text-transform: uppercase;">DEED OF PARTNERSHIP</h1>
    </div>

    <p style="text-indent: 40px;">
      This Instrument/Deed of Partnership is executed at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and between:
    </p>

    <p style="margin-top: 20px;">
      <strong>1. ${data.partner1Name || '____________'}</strong>, residing at <strong>${data.partner1Address || '____________'}</strong> (hereinafter referred to as the "FIRST PARTNER").
    </p>

    <div style="text-align: center; font-weight: bold; margin: 10px 0;">AND</div>

    <p>
      <strong>2. ${data.partner2Name || '____________'}</strong>, residing at <strong>${data.partner2Address || '____________'}</strong> (hereinafter referred to as the "SECOND PARTNER").
    </p>

    <p style="margin-top: 30px; text-indent: 40px;">
      <strong>WHEREAS</strong> the parties hereto have decided to join their hands, intellect, capital, and labor to carry on business in a partnership under the Indian Partnership Act, 1932.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">NOW THIS DEED WITNESSETH AS FOLLOWS:</h3>

    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 15px;">
        <strong>Firm Name:</strong> The business of the partnership shall go on under the name and style of <strong>${data.firmName}</strong>. 
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Registered Office:</strong> The principal place of business shall be at <strong>${data.firmAddress}</strong>. However, from time to time, the partners may open branches elsewhere upon mutual consent.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Nature of Business:</strong> The general nature of the partnership business shall be: <em>${data.businessNature}</em>.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Commencement:</strong> The partnership business shall be deemed to have commenced on ${data.executionDate.split('-').reverse().join('/')} and shall be a partnership 'At Will'.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Capital Contribution:</strong> The initial capital infused by the partners amounts to \u20B9 ${Number(data.partner1Capital + data.partner2Capital).toLocaleString('en-IN')}/-, shared as follows:
        <ul style="margin-top: 5px;">
          <li>First Partner: \u20B9 ${Number(data.partner1Capital).toLocaleString('en-IN')}/-</li>
          <li>Second Partner: \u20B9 ${Number(data.partner2Capital).toLocaleString('en-IN')}/-</li>
        </ul>
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Profit & Loss Sharing:</strong> The net profit and losses of the firm, after deducting all expenses, taxes, salaries to working partners, and interest on capital, shall be divided between the First and Second partners in the following ratio: <br/>
        First Partner: ${((data.partner1Capital / (data.partner1Capital + data.partner2Capital)) * 100).toFixed(2)}% | Second Partner: ${((data.partner2Capital / (data.partner1Capital + data.partner2Capital)) * 100).toFixed(2)}%
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Remuneration and Interest:</strong> Both partners shall be "Working Partners." Remuneration shall be dynamically decided as per the maximum limits prescribed under Section 40(b) of the Income Tax Act, 1961. The partners shall be entitled to simple interest on their capital account at 12% p.a.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Banking:</strong> The bank accounts shall be operated jointly/severally as may be mutually agreed upon from time to time.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Dispute Resolution:</strong> If any dispute arises between the partners relating to the business, it shall be resolved under the provisions of the Arbitration and Conciliation Act, 1996.
      </li>
    </ol>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, the Partners have set their hands and affirmed this Partnership Deed on the date mentioned above.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>FIRST PARTNER:</strong><br /><br /><br />
        ___________________________<br />
        ${data.partner1Name}
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>SECOND PARTNER:</strong><br /><br /><br />
        ___________________________<br />
        ${data.partner2Name}
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

const generateMarkdown = (data: any) => `# Partnership Deed generated via MyeCA.in`;

export const PartnershipDeedGenerator: DocumentGeneratorConfig = {
  id: 'partnership-deed',
  title: 'Partnership Deed',
  description: 'Formal agreement among partners outlining profit sharing, capital, and operational responsibilities.',
  icon: <Scale className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
