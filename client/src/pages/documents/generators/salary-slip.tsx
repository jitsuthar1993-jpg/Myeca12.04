import { z } from 'zod';
import { IndianRupee } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyAddress: z.string().min(5, 'Company address is required'),
  monthYear: z.string().min(2, 'Pay Period is required'),
  employeeName: z.string().min(2, 'Employee name is required'),
  employeeId: z.string().min(2, 'Employee ID is required'),
  designation: z.string().min(2, 'Designation is required'),
  pan: z.string().optional(),
  bankAcc: z.string().optional(),
  uan: z.string().optional(),
  workingDays: z.number().min(0, 'Days >= 0'),
  lopDays: z.number().min(0, 'LOP >= 0'),
  earnings: z.object({
    basic: z.number().min(0),
    hra: z.number().min(0),
    conveyance: z.number().min(0),
    medical: z.number().min(0),
    special: z.number().min(0),
  }),
  deductions: z.object({
    pf: z.number().min(0),
    esi: z.number().min(0),
    pt: z.number().min(0),
    tds: z.number().min(0),
    other: z.number().min(0),
  }),
});

const defaultValues = {
  companyName: 'Acme Corporation',
  companyAddress: 'IT Park Phase 2, Pune',
  monthYear: 'March 2026',
  employeeName: '',
  employeeId: 'EMP-',
  designation: 'Software Engineer',
  pan: '',
  bankAcc: 'XXXX-XXXX-1234',
  uan: '',
  workingDays: 31,
  lopDays: 0,
  earnings: { basic: 40000, hra: 16000, conveyance: 1600, medical: 1250, special: 21150 },
  deductions: { pf: 1800, esi: 0, pt: 200, tds: 5000, other: 0 },
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Employment Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Company Name</Label>
          <Input {...register('companyName')} />
        </div>
        <div className="col-span-2">
          <Label>Company Address</Label>
          <Input {...register('companyAddress')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <Label>Full Name</Label>
          <Input {...register('employeeName')} />
        </div>
        <div>
          <Label>Employee ID</Label>
          <Input {...register('employeeId')} />
        </div>
        <div>
          <Label>Designation</Label>
          <Input {...register('designation')} />
        </div>
        <div>
          <Label>Pay Period (Month Year)</Label>
          <Input {...register('monthYear')} placeholder="March 2026" />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Tax & Bank Identifiers</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Employee PAN</Label>
          <Input {...register('pan')} />
        </div>
        <div>
          <Label>Bank Account Number</Label>
          <Input {...register('bankAcc')} />
        </div>
        <div>
          <Label>UAN (PF Number)</Label>
          <Input {...register('uan')} />
        </div>
        <div>
          <Label>Working Days</Label>
          <Input type="number" {...register('workingDays', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Loss Of Pay (LOP) Days</Label>
          <Input type="number" {...register('lopDays', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-green-700">Earnings (\u20B9)</h3>
          <div>
            <Label>Basic</Label>
            <Input type="number" {...register('earnings.basic', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>HRA</Label>
            <Input type="number" {...register('earnings.hra', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Conveyance Allowance</Label>
            <Input type="number" {...register('earnings.conveyance', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Medical Allowance</Label>
            <Input type="number" {...register('earnings.medical', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Special Allowance</Label>
            <Input type="number" {...register('earnings.special', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-red-700">Deductions (\u20B9)</h3>
          <div>
            <Label>Provident Fund (EPF)</Label>
            <Input type="number" {...register('deductions.pf', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Professional Tax (PT)</Label>
            <Input type="number" {...register('deductions.pt', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Income Tax (TDS)</Label>
            <Input type="number" {...register('deductions.tds', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>ESI Contribution</Label>
            <Input type="number" {...register('deductions.esi', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Other Deductions</Label>
            <Input type="number" {...register('deductions.other', { valueAsNumber: true })} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Extremely basic Number to Words mock. Standard Indian style formatter required in prod.
const numberToWords = (num: number) => {
  return `Rupees ${num.toLocaleString('en-IN')} Only`;
};

const generateHTML = (data: any) => {
  const e = data.earnings || {};
  const d = data.deductions || {};

  const grossEarnings =
    (e.basic || 0) + (e.hra || 0) + (e.conveyance || 0) + (e.medical || 0) + (e.special || 0);
  const totalDeductions = (d.pf || 0) + (d.pt || 0) + (d.tds || 0) + (d.esi || 0) + (d.other || 0);
  const netPay = grossEarnings - totalDeductions;

  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 30px; border: 1px solid #ddd; background: #fff;">
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #1e3a8a; font-size: 26px; text-transform: uppercase;">${data.companyName}</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">${data.companyAddress}</p>
        <h3 style="margin: 15px 0 0 0; font-size: 16px; font-weight: bold;">PAYSLIP FOR ${data.monthYear.toUpperCase()}</h3>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
        <tbody>
          <tr>
            <td style="padding: 6px; width: 25%;"><strong>Employee Name:</strong></td>
            <td style="padding: 6px; width: 25%;">${data.employeeName}</td>
            <td style="padding: 6px; width: 25%;"><strong>Pay Period:</strong></td>
            <td style="padding: 6px; width: 25%;">${data.monthYear}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><strong>Employee ID:</strong></td>
            <td style="padding: 6px;">${data.employeeId}</td>
            <td style="padding: 6px;"><strong>Worked Days:</strong></td>
            <td style="padding: 6px;">${data.workingDays}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><strong>Designation:</strong></td>
            <td style="padding: 6px;">${data.designation}</td>
            <td style="padding: 6px;"><strong>LOP Days:</strong></td>
            <td style="padding: 6px;">${data.lopDays}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><strong>PAN Number:</strong></td>
            <td style="padding: 6px;">${data.pan || 'N/A'}</td>
            <td style="padding: 6px;"><strong>UAN No:</strong></td>
            <td style="padding: 6px;">${data.uan || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><strong>Bank A/c No:</strong></td>
            <td style="padding: 6px;">${data.bankAcc || 'N/A'}</td>
            <td style="padding: 6px;"></td>
            <td style="padding: 6px;"></td>
          </tr>
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc; line-height: 1.8;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid #ccc;">
            <th style="padding: 10px; text-align: left; width: 35%; border-right: 1px solid #ccc;">Earnings</th>
            <th style="padding: 10px; text-align: right; width: 15%; border-right: 1px solid #ccc;">Amount (\u20B9)</th>
            <th style="padding: 10px; text-align: left; width: 35%; border-right: 1px solid #ccc;">Deductions</th>
            <th style="padding: 10px; text-align: right; width: 15%;">Amount (\u20B9)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Basic Salary</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc; text-align: right;">${Number(e.basic).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Provident Fund (PF)</td>
            <td style="padding: 8px 10px; text-align: right;">${Number(d.pf).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">House Rent Allowance (HRA)</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc; text-align: right;">${Number(e.hra).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Professional Tax (PT)</td>
            <td style="padding: 8px 10px; text-align: right;">${Number(d.pt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Conveyance Allowance</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc; text-align: right;">${Number(e.conveyance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">TDS / Income Tax</td>
            <td style="padding: 8px 10px; text-align: right;">${Number(d.tds).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Medical Allowance</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc; text-align: right;">${Number(e.medical).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">ESI</td>
            <td style="padding: 8px 10px; text-align: right;">${Number(d.esi).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Special Allowance</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc; text-align: right;">${Number(e.special).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; border-right: 1px solid #ccc;">Other Deductions</td>
            <td style="padding: 8px 10px; text-align: right;">${Number(d.other).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr style="border-top: 1px solid #ccc; font-weight: bold; background-color: #f8fafc;">
            <td style="padding: 10px; border-right: 1px solid #ccc;">Total Earnings</td>
            <td style="padding: 10px; border-right: 1px solid #ccc; text-align: right; color: #16a34a;">\u20B9${grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 10px; border-right: 1px solid #ccc;">Total Deductions</td>
            <td style="padding: 10px; text-align: right; color: #dc2626;">\u20B9${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 25px; padding: 15px; background-color: #e0f2fe; border: 1px solid #bae6fd; border-radius: 4px;">
        <h2 style="margin: 0 0 5px 0; font-size: 20px; color: #0284c7; text-align: center;">Net Take-Home Pay: \u20B9${netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
        <p style="margin: 0; text-align: center; font-style: italic; font-size: 13px;">( ${numberToWords(netPay)} )</p>
      </div>

      <p style="text-align: center; margin-top: 50px; font-size: 12px; color: #999;">
        This is a system-generated document and does not require a physical signature.
      </p>
    </div>
  `;
};

const generateMarkdown = (data: any) => `# Salary SlipnnGenerated via MyeCA.in`;

export const SalarySlipGenerator: DocumentGeneratorConfig = {
  id: 'salary-slip',
  title: 'Standard Salary Slip / Certificate',
  description:
    'Detailed monthly pay slips with automated basic pay, HRA calculations, and standard deductions.',
  icon: <IndianRupee className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
