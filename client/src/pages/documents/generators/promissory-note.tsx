import { z } from 'zod';
import { DollarSign } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  place: z.string().min(2, 'Place is required'),
  date: z.string().min(1, 'Date is required'),
  principalAmount: z.number().min(1, 'Amount must be > 0'),
  interestRate: z.number().min(0, 'Interest rate required'),
  makerName: z.string().min(2, 'Maker (Borrower) Name required'),
  makerAddress: z.string().min(5, 'Maker Address required'),
  payeeName: z.string().min(2, 'Payee (Lender) Name required'),
  payeeAddress: z.string().min(5, 'Payee Address required'),
  dueDate: z.string().optional(),
});

const defaultValues = {
  place: 'Mumbai',
  date: new Date().toISOString().split('T')[0],
  principalAmount: 100000,
  interestRate: 12,
  makerName: '',
  makerAddress: '',
  payeeName: '',
  payeeAddress: '',
  dueDate: 'On Demand',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Note Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Execution Place</Label><Input {...register('place')} /></div>
        <div><Label>Execution Date</Label><Input type="date" {...register('date')} /></div>
        <div><Label>Principal Amount (\u20B9)</Label><Input type="number" {...register('principalAmount', { valueAsNumber: true })} /></div>
        <div><Label>Interest Rate (% per annum)</Label><Input type="number" step="0.1" {...register('interestRate', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Due Date (or type "On Demand")</Label><Input {...register('dueDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Maker Details (Borrower)</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Maker Name</Label><Input {...register('makerName')} /></div>
        <div><Label>Maker Address</Label><Textarea rows={2} {...register('makerAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Payee Details (Lender)</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Payee Name</Label><Input {...register('payeeName')} /></div>
        <div><Label>Payee Address</Label><Textarea rows={2} {...register('payeeAddress')} /></div>
      </div>
    </div>
  );
};

const numberToWords = (num: number) => {
  return `Rupees ${num.toLocaleString('en-IN')} Only`;
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <h1 style="text-align: center; text-decoration: underline; text-transform: uppercase; letter-spacing: 2px;">PROMISSORY NOTE</h1>
    
    <div style="display: flex; justify-content: space-between; margin-top: 40px; font-weight: bold; font-size: 16px;">
      <div>Amount: \u20B9 ${Number(data.principalAmount).toLocaleString('en-IN')}/-</div>
      <div style="text-align: right;">
        Place: ${data.place}<br/>Date: ${data.date.split('-').reverse().join('/')}
      </div>
    </div>

    <p style="margin-top: 40px; text-indent: 40px; font-size: 16px; line-height: 2;">
      ${data.dueDate === 'On Demand' ? 'ON DEMAND' : `By <strong>${data.dueDate}</strong>`}, I, <strong>${data.makerName || '______________'}</strong>, residing at <strong>${data.makerAddress || '______________'}</strong> (the "Maker"), do hereby unconditionally promise to pay <strong>${data.payeeName || '______________'}</strong>, residing at <strong>${data.payeeAddress || '______________'}</strong> (the "Payee"), or order, the principal sum of <strong>Rs. ${Number(data.principalAmount).toLocaleString('en-IN')}/-</strong> (<strong>${numberToWords(data.principalAmount)}</strong>).
    </p>

    <p style="text-indent: 40px; font-size: 16px; line-height: 2;">
      The Maker further promises to pay interest on the principal amount remaining unpaid from the date hereof at a rate of <strong>${data.interestRate}%</strong> (${data.interestRate} percent) per annum, compounded annually, until the principal amount is paid in full.
    </p>

    <p style="text-indent: 40px; font-size: 16px; line-height: 2;">
      Value received in cash / bank transfer for business / personal necessity. I have received the consideration for this Promissory Note and it is binding upon my legal heirs, executors, administrators, and assigns.
    </p>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 80px;">
      <div>
        <div style="width: 120px; height: 120px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; transform: rotate(-5deg);">
          <span style="font-size: 12px; font-weight: bold; text-align: center;">REVENUE<br/>STAMP<br/><small>(Sign Across)</small></span>
        </div>
      </div>
      
      <div style="text-align: center; border-top: 1px dotted #000; padding-top: 10px; min-width: 250px;">
        <strong style="display: block; margin-bottom: 5px;">${data.makerName || '(Signature of Maker)'}</strong>
        <span style="font-size: 13px; color: #666;">Maker / Borrower</span>
      </div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Promissory Note generated via MyeCA.in`;

export const PromissoryNoteGenerator: DocumentGeneratorConfig = {
  id: 'promissory-note',
  title: 'Promissory Note Generator',
  description: 'A legally binding promise in writing to pay a specific sum of money to a specified person or bearer.',
  icon: <DollarSign className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
