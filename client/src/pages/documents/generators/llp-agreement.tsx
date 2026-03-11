import { z } from 'zod';
import { Users } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  llpName: z.string().min(2, 'LLP Name is required'),
  llpAddress: z.string().min(5, 'LLP Address is required'),
  partner1Name: z.string().min(2, 'Partner 1 Name required'),
  partner1Address: z.string().min(5, 'Partner 1 Address required'),
  partner1Capital: z.number().min(1, 'Capital must be > 0'),
  partner2Name: z.string().min(2, 'Partner 2 Name required'),
  partner2Address: z.string().min(5, 'Partner 2 Address required'),
  partner2Capital: z.number().min(1, 'Capital must be > 0'),
  businessScope: z.string().min(10, 'Business activities required'),
});

const defaultValues = {
  executionPlace: 'Bengaluru',
  executionDate: new Date().toISOString().split('T')[0],
  llpName: 'TechSolutions LLP',
  llpAddress: '404, Tech Park, Whitefield, Bengaluru',
  partner1Name: '',
  partner1Address: '',
  partner1Capital: 50000,
  partner2Name: '',
  partner2Address: '',
  partner2Capital: 50000,
  businessScope: 'To carry on the business of software development, IT consulting, and related services globally.',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Firm & execution</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
        <div className="col-span-2"><Label>LLP Registered Name</Label><Input {...register('llpName')} /></div>
        <div className="col-span-2"><Label>LLP Registered Office Address</Label><Textarea rows={2} {...register('llpAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Designated Partner 1</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('partner1Name')} /></div>
        <div><Label>Capital Contribution (\u20B9)</Label><Input type="number" {...register('partner1Capital', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('partner1Address')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Designated Partner 2</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('partner2Name')} /></div>
        <div><Label>Capital Contribution (\u20B9)</Label><Input type="number" {...register('partner2Capital', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Current Address</Label><Textarea rows={2} {...register('partner2Address')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Business Operations</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Main Object / Scope of Business</Label><Textarea rows={3} {...register('businessScope')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 22px; text-decoration: underline; text-transform: uppercase;">LIMITED LIABILITY PARTNERSHIP AGREEMENT</h1>
    </div>

    <p style="text-indent: 40px;">
      This Agreement of Limited Liability Partnership (the "LLP Agreement") is made and executed at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and between:
    </p>

    <p style="margin-top: 20px;">
      <strong>1. ${data.partner1Name || '____________'}</strong>, residing at <strong>${data.partner1Address || '____________'}</strong> (hereinafter referred to as the "First Party").
    </p>

    <div style="text-align: center; font-weight: bold; margin: 10px 0;">AND</div>

    <p>
      <strong>2. ${data.partner2Name || '____________'}</strong>, residing at <strong>${data.partner2Address || '____________'}</strong> (hereinafter referred to as the "Second Party").
    </p>

    <p style="margin-top: 30px; text-indent: 40px;">
      (Both the First and Second Parties shall be collectively referred to as "Partners" or "Designated Partners", which expression shall, unless repugnant to the context, include their heirs, successors, and assigns).
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">WHEREAS:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;">The Partners aforesaid are desirous of forming a Limited Liability Partnership (LLP) under the Limited Liability Partnership Act, 2008.</li>
      <li style="margin-bottom: 10px;">The Partners wish to reduce to writing the terms and conditions governing their mutual rights, duties, and obligations in the said LLP.</li>
    </ol>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">NOW IT IS HEREBY AGREED AS FOLLOWS:</h3>

    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 15px;">
        <strong>Name & Registered Office:</strong> The business of the LLP shall be carried on under the name and style of <strong>${data.llpName}</strong>. The principal place of business shall be situated at <strong>${data.llpAddress}</strong>, or such other place(s) as the Partners may mutually decide.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Business Object:</strong> The general nature of the LLP's business shall be: <em>${data.businessScope}</em>.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Initial Contribution:</strong> The initial capital contribution of the LLP shall be \u20B9 ${Number(data.partner1Capital + data.partner2Capital).toLocaleString('en-IN')}/-, contributed as follows:
        <ul style="margin-top: 5px;">
          <li>First Party (${data.partner1Name}): \u20B9 ${Number(data.partner1Capital).toLocaleString('en-IN')}/-</li>
          <li>Second Party (${data.partner2Name}): \u20B9 ${Number(data.partner2Capital).toLocaleString('en-IN')}/-</li>
        </ul>
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Profit & Loss Ratio:</strong> The net profits of the LLP arrived at after providing for and deducting all costs, charges, and expenses (including remuneration to Partners) shall be divided between the Partners in proportion to their respective capital contributions unless agreed otherwise: <br/>
        First Party: ${((data.partner1Capital / (data.partner1Capital + data.partner2Capital)) * 100).toFixed(2)}% | Second Party: ${((data.partner2Capital / (data.partner1Capital + data.partner2Capital)) * 100).toFixed(2)}%
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Remuneration and Interest:</strong> It is agreed that both Designated Partners shall be working partners and entitled to remuneration as permissible under the Income Tax Act, 1961. The LLP may also pay interest on capital contributed at a rate not exceeding 12% p.a., subject to mutual agreement.
      </li>
      <li style="margin-bottom: 15px;">
        <strong>Bank Accounts:</strong> The bank account(s) of the LLP shall be opened in its name and may be operated jointly or severally as decided by the mutual consent of the Designated Partners.
      </li>
    </ol>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, the Partners have set their hands and seals onto this Agreement on the day, month, and year first above written.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>FIRST PARTY:</strong><br /><br /><br />
        ___________________________<br />
        ${data.partner1Name}
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>SECOND PARTY:</strong><br /><br /><br />
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

const generateMarkdown = (data: any) => `# LLP Agreement Draft generated via MyeCA.in`;

export const LLPAgreementGenerator: DocumentGeneratorConfig = {
  id: 'llp-agreement',
  title: 'LLP Agreement Draft',
  description: 'The primary document governing the mutual rights and duties of partners in a Limited Liability Partnership.',
  icon: <Users className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
