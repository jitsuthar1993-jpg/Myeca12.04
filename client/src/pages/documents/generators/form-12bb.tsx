import { z } from 'zod';
import { FileCheck } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  employeeNameAddress: z.string().min(5, 'Employee name and address are required'),
  panOrAadhaar: z.string().min(10, 'PAN or Aadhaar is required'),
  financialYear: z.string().min(4, 'Financial year is required'),
  employerName: z.string().optional(),
  hra: z.object({
    amount: z.number().min(0),
    rentPaid: z.number().min(0),
    landlordName: z.string().optional(),
    landlordAddress: z.string().optional(),
    landlordPan: z.string().optional(),
    evidence: z.string().optional(),
  }),
  ltc: z.object({
    amount: z.number().min(0),
    evidence: z.string().optional(),
  }),
  homeLoan: z.object({
    amount: z.number().min(0),
    lenderNameAddress: z.string().optional(),
    lenderPan: z.string().optional(),
    evidence: z.string().optional(),
  }),
  deductions: z.object({
    section80C: z.number().min(0),
    section80CCC: z.number().min(0),
    section80CCD: z.number().min(0),
    otherSections: z.string().optional(),
    otherAmount: z.number().min(0),
    evidence: z.string().optional(),
  }),
  verificationFullName: z.string().min(2, 'Full name is required'),
  parentName: z.string().optional(),
  designation: z.string().optional(),
  place: z.string().min(2, 'Place is required'),
  date: z.string().min(1, 'Date is required'),
});

const defaultValues = {
  employeeNameAddress: '',
  panOrAadhaar: '',
  financialYear: '2025-26',
  employerName: '',
  hra: {
    amount: 0,
    rentPaid: 0,
    landlordName: '',
    landlordAddress: '',
    landlordPan: '',
    evidence: 'Rent receipts / rent agreement',
  },
  ltc: {
    amount: 0,
    evidence: 'Travel bills and tickets',
  },
  homeLoan: {
    amount: 0,
    lenderNameAddress: '',
    lenderPan: '',
    evidence: 'Interest certificate from lender',
  },
  deductions: {
    section80C: 0,
    section80CCC: 0,
    section80CCD: 0,
    otherSections: '80D / 80E / 80G',
    otherAmount: 0,
    evidence: 'Investment proofs, premium receipts, donation receipts, loan certificates',
  },
  verificationFullName: '',
  parentName: '',
  designation: '',
  place: 'Mumbai',
  date: new Date().toISOString().split('T')[0],
};

const FormComponent = ({ register }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Employee Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Name and Address of Employee</Label>
          <Textarea rows={3} {...register('employeeNameAddress')} />
        </div>
        <div>
          <Label>PAN or Aadhaar Number</Label>
          <Input {...register('panOrAadhaar')} className="uppercase" />
        </div>
        <div>
          <Label>Financial Year</Label>
          <Input {...register('financialYear')} placeholder="2025-26" />
        </div>
        <div className="col-span-2">
          <Label>Employer Name (Optional)</Label>
          <Input {...register('employerName')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">House Rent Allowance</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>HRA Claim Amount (Rs.)</Label>
          <Input type="number" {...register('hra.amount', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Rent Paid to Landlord (Rs.)</Label>
          <Input type="number" {...register('hra.rentPaid', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Landlord Name</Label>
          <Input {...register('hra.landlordName')} />
        </div>
        <div>
          <Label>Landlord PAN / Aadhaar</Label>
          <Input {...register('hra.landlordPan')} />
        </div>
        <div className="col-span-2">
          <Label>Landlord Address</Label>
          <Textarea rows={2} {...register('hra.landlordAddress')} />
        </div>
        <div className="col-span-2">
          <Label>Evidence / Proof</Label>
          <Input {...register('hra.evidence')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">LTC and Home Loan</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>LTC Claim Amount (Rs.)</Label>
          <Input type="number" {...register('ltc.amount', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>LTC Evidence</Label>
          <Input {...register('ltc.evidence')} />
        </div>
        <div>
          <Label>Home Loan Interest Claim (Rs.)</Label>
          <Input type="number" {...register('homeLoan.amount', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Lender PAN / Aadhaar</Label>
          <Input {...register('homeLoan.lenderPan')} />
        </div>
        <div className="col-span-2">
          <Label>Name and Address of Lender</Label>
          <Textarea rows={2} {...register('homeLoan.lenderNameAddress')} />
        </div>
        <div className="col-span-2">
          <Label>Home Loan Evidence</Label>
          <Input {...register('homeLoan.evidence')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Chapter VI-A Deductions</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Section 80C / 80CCC / 80CCD(1) (Rs.)</Label>
          <Input type="number" {...register('deductions.section80C', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Section 80CCC (Rs.)</Label>
          <Input type="number" {...register('deductions.section80CCC', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Section 80CCD (Rs.)</Label>
          <Input type="number" {...register('deductions.section80CCD', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Other Deductions Amount (Rs.)</Label>
          <Input type="number" {...register('deductions.otherAmount', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Other Sections</Label>
          <Input {...register('deductions.otherSections')} />
        </div>
        <div>
          <Label>Evidence</Label>
          <Input {...register('deductions.evidence')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Verification</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name for Signature</Label>
          <Input {...register('verificationFullName')} />
        </div>
        <div>
          <Label>Son/Daughter of</Label>
          <Input {...register('parentName')} />
        </div>
        <div>
          <Label>Designation</Label>
          <Input {...register('designation')} />
        </div>
        <div>
          <Label>Place</Label>
          <Input {...register('place')} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" {...register('date')} />
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const formatDate = (value: string) => {
  if (!value) return '';
  return value.split('-').reverse().join('/');
};

const generateHTML = (data: any) => {
  const hra = data.hra || {};
  const ltc = data.ltc || {};
  const homeLoan = data.homeLoan || {};
  const deductions = data.deductions || {};
  const chapterSixTotal =
    (deductions.section80C || 0) +
    (deductions.section80CCC || 0) +
    (deductions.section80CCD || 0) +
    (deductions.otherAmount || 0);

  return `
    <div style="font-family: Arial, sans-serif; font-size: 11px; color: #000; line-height: 1.35; max-width: 800px; margin: 0 auto; padding: 22px;">
      <div style="text-align: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 16px;">FORM NO. 12BB</h2>
        <p style="margin: 4px 0 0;">[See rule 26C]</p>
        <p style="margin: 6px 0 0; font-weight: bold;">
          Statement showing particulars of claims by an employee for deduction of tax under section 192
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="border: 1px solid #000; padding: 6px; width: 55%;">
            1. Name and address of the employee:<br />
            <strong>${data.employeeNameAddress}</strong>
          </td>
          <td style="border: 1px solid #000; padding: 6px;">
            2. Permanent Account Number or Aadhaar Number:<br />
            <strong>${(data.panOrAadhaar || '').toUpperCase()}</strong>
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 6px;">
            3. Financial year:<br />
            <strong>${data.financialYear}</strong>
          </td>
          <td style="border: 1px solid #000; padding: 6px;">
            Employer:<br />
            <strong>${data.employerName || '________________'}</strong>
          </td>
        </tr>
      </table>

      <div style="font-weight: bold; text-align: center; border: 1px solid #000; border-bottom: 0; padding: 6px;">
        DETAILS OF CLAIMS AND EVIDENCE THEREOF
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; padding: 5px; width: 28%;">Nature of claim</th>
            <th style="border: 1px solid #000; padding: 5px; width: 18%;">Amount (Rs.)</th>
            <th style="border: 1px solid #000; padding: 5px;">Evidence / particulars</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">House Rent Allowance</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top; text-align: right;">${formatCurrency(hra.amount)}</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
              Rent paid: Rs. ${formatCurrency(hra.rentPaid)}<br />
              Landlord: ${hra.landlordName || '__________'}<br />
              Address: ${hra.landlordAddress || '__________'}<br />
              PAN/Aadhaar: ${hra.landlordPan || '__________'}<br />
              Evidence: ${hra.evidence || '__________'}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">Leave Travel Concession or Assistance</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top; text-align: right;">${formatCurrency(ltc.amount)}</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
              Evidence: ${ltc.evidence || '__________'}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">Deduction of interest on borrowing</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top; text-align: right;">${formatCurrency(homeLoan.amount)}</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
              Name and address of lender: ${homeLoan.lenderNameAddress || '__________'}<br />
              PAN/Aadhaar of lender: ${homeLoan.lenderPan || '__________'}<br />
              Evidence: ${homeLoan.evidence || '__________'}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">Deduction under Chapter VI-A</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top; text-align: right;">${formatCurrency(chapterSixTotal)}</td>
            <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
              Section 80C / 80CCC / 80CCD(1): Rs. ${formatCurrency(deductions.section80C)}<br />
              Section 80CCC: Rs. ${formatCurrency(deductions.section80CCC)}<br />
              Section 80CCD: Rs. ${formatCurrency(deductions.section80CCD)}<br />
              Other sections (${deductions.otherSections || '__________'}): Rs. ${formatCurrency(deductions.otherAmount)}<br />
              Evidence: ${deductions.evidence || '__________'}
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 22px;">
        <p style="text-align: justify;">
          I, <strong>${data.verificationFullName}</strong>${
            data.parentName ? ` son/daughter of <strong>${data.parentName}</strong>` : ''
          }, do hereby certify that the information given above is complete and correct.
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 36px;">
        <div>
          <p>Place: <strong>${data.place}</strong></p>
          <p>Date: <strong>${formatDate(data.date)}</strong></p>
          <p>Designation: <strong>${data.designation || '__________'}</strong></p>
          <p>Full Name: <strong>${data.verificationFullName}</strong></p>
        </div>
        <div style="width: 260px; text-align: center;">
          <div style="height: 58px;"></div>
          <div style="border-top: 1px solid #000; padding-top: 6px; font-weight: bold;">Signature of the employee</div>
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) =>
  `# Form 12BB\n\nEmployee: ${data.employeeNameAddress}\n\nFinancial Year: ${data.financialYear}\n\nGenerated via MyeCA.in`;

export const Form12bbGenerator: DocumentGeneratorConfig = {
  id: 'form-12bb',
  title: 'Form 12BB (Investment Declaration)',
  description:
    'Prepare employee investment declaration details for deduction claims under section 192 and rule 26C.',
  icon: <FileCheck className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
