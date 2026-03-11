import { z } from 'zod';
import { Briefcase } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyAddress: z.string().min(5, 'Company address is required'),
  date: z.string().min(1, 'Date is required'),
  candidateName: z.string().min(2, 'Candidate name is required'),
  candidateAddress: z.string().min(5, 'Candidate address is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  workLocation: z.string().min(2, 'Work location is required'),
  reportingManager: z.string().min(2, 'Reporting manager is required'),
  startDate: z.string().min(1, 'Start date is required'),
  ctc: z.number().min(1, 'CTC must be > 0'),
  probationMonths: z.number().min(0, 'Probation >= 0'),
  noticePeriodDays: z.number().min(0, 'Notice Period >= 0'),
  signatoryName: z.string().min(2, 'Signatory name is required'),
  signatoryTitle: z.string().min(2, 'Signatory title is required'),
});

const defaultValues = {
  companyName: 'Acme Corporation Pvt Ltd',
  companyAddress: '123 Business Avenue, Tech Park, Bangalore 560001',
  date: new Date().toISOString().split('T')[0],
  candidateName: '',
  candidateAddress: '',
  jobTitle: 'Software Engineer',
  workLocation: 'Bangalore Office',
  reportingManager: 'Engineering Manager',
  startDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  ctc: 800000,
  probationMonths: 6,
  noticePeriodDays: 60,
  signatoryName: 'HR Director',
  signatoryTitle: 'Head of Human Resources',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Company Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Company Name</Label>
          <Input {...register('companyName')} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" {...register('date')} />
        </div>
        <div className="col-span-2">
          <Label>Company Address</Label>
          <Input {...register('companyAddress')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Candidate Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input {...register('candidateName')} />
        </div>
        <div className="col-span-2">
          <Label>Candidate Address</Label>
          <Input {...register('candidateAddress')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Offer Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Job Title / Designation</Label>
          <Input {...register('jobTitle')} />
        </div>
        <div>
          <Label>Work Location</Label>
          <Input {...register('workLocation')} />
        </div>
        <div>
          <Label>Joining Date</Label>
          <Input type="date" {...register('startDate')} />
        </div>
        <div>
          <Label>Reporting To</Label>
          <Input {...register('reportingManager')} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Annual CTC (\u20B9)</Label>
          <Input type="number" {...register('ctc', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Probation (Months)</Label>
          <Input type="number" {...register('probationMonths', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Notice Period (Days)</Label>
          <Input type="number" {...register('noticePeriodDays', { valueAsNumber: true })} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Signatory</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Authorised Signatory Name</Label>
          <Input {...register('signatoryName')} />
        </div>
        <div>
          <Label>Signatory Title</Label>
          <Input {...register('signatoryTitle')} />
        </div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: right; margin-bottom: 40px;">
        <h2 style="margin: 0; color: #1e3a8a;">${data.companyName}</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">${data.companyAddress}</p>
      </div>
      
      <p><strong>Date:</strong> ${data.date}</p>
      
      <div style="margin: 30px 0;">
        <p style="margin: 0; font-weight: bold;">To,</p>
        <p style="margin: 5px 0 0 0; font-weight: bold;">${data.candidateName || '[Candidate Name]'}</p>
        <p style="margin: 5px 0 0 0; white-space: pre-line;">${data.candidateAddress || '[Candidate Address]'}</p>
      </div>

      <h3 style="text-align: center; text-decoration: underline; margin: 30px 0;">Subject: Offer of Employment - ${data.jobTitle}</h3>

      <p>Dear <strong>${data.candidateName || 'Candidate'}</strong>,</p>
      
      <p>Following our recent discussions, we are delighted to offer you the position of <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>. We are confident that your skills and experience will be an ideal fit for our team.</p>

      <p>Your employment will commence on <strong>${data.startDate}</strong>. Your initial place of work will be the <strong>${data.workLocation}</strong> office, and you will be reporting directly to the <strong>${data.reportingManager}</strong>.</p>

      <div style="margin: 20px 0; padding-left: 20px;">
        <p style="margin-bottom: 5px;"><strong>1. Remuneration:</strong> Your Annual Cost to Company (CTC) will be <strong>\u20B9${Number(data.ctc || 0).toLocaleString('en-IN')}</strong>. A detailed salary breakdown will be provided in Annexure A at the time of joining.</p>
        <p style="margin-bottom: 5px;"><strong>2. Probation Period:</strong> You will be under probation for a period of <strong>${data.probationMonths} months</strong> from your date of joining. Upon satisfactory completion of your probation, your employment may be confirmed in writing.</p>
        <p style="margin-bottom: 5px;"><strong>3. Notice Period:</strong> After confirmation, either party may terminate this agreement by giving <strong>${data.noticePeriodDays} days</strong> written notice, or salary in lieu thereof.</p>
        <p style="margin-bottom: 5px;"><strong>4. Working Hours:</strong> You will be governed by the standard working hours and holiday schedule of the company.</p>
        <p style="margin-bottom: 5px;"><strong>5. Confidentiality:</strong> You will be required to sign a standard Non-Disclosure and Confidentiality Agreement as a condition of employment.</p>
      </div>

      <p>This offer is contingent upon successful verification of your educational and professional credentials. Kindly sign and return a duplicate copy of this letter as a token of your acceptance.</p>

      <p>We look forward to welcoming you aboard and anticipate a mutually rewarding professional relationship.</p>

      <div style="margin-top: 50px;">
        <p>Sincerely,</p>
        <p style="margin-bottom: 40px; font-weight: bold;">For ${data.companyName}</p>
        <p style="margin: 0; font-weight: bold;">${data.signatoryName}</p>
        <p style="margin: 0; color: #666;">${data.signatoryTitle}</p>
      </div>

      <div style="margin-top: 60px; border-top: 1px dashed #ccc; padding-top: 20px;">
        <p style="font-weight: bold;">Candidate's Acceptance:</p>
        <p>I have read and understood the terms and conditions outlined in this offer letter and I happily accept the offer of employment.</p>
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div><p style="margin: 0;">Name: ______________________</p></div>
          <div><p style="margin: 0;">Signature: ______________________</p></div>
          <div><p style="margin: 0;">Date: ______________</p></div>
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) => `# Employment Offer LetternnGenerated via MyeCA.in`;

export const OfferLetterGenerator: DocumentGeneratorConfig = {
  id: 'offer-letter',
  title: 'Employment Offer Letter',
  description: 'Formal HR employment offer with CTC, probationary, and notice period stipulations.',
  icon: <Briefcase className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
