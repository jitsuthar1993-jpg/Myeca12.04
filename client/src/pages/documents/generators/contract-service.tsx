import { z } from 'zod';
import { Briefcase } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  clientName: z.string().min(2, 'Client Name is required'),
  clientAddress: z.string().min(5, 'Client Address is required'),
  freelancerName: z.string().min(2, 'Freelancer Name is required'),
  freelancerAddress: z.string().min(5, 'Freelancer Address is required'),
  servicesDetails: z.string().min(5, 'Services details required'),
  feeAmount: z.number().min(1, 'Fee required'),
  timelineDeadline: z.string().min(1, 'Timeline/Deadline required'),
});

const defaultValues = {
  executionPlace: 'New Delhi',
  executionDate: new Date().toISOString().split('T')[0],
  clientName: '',
  clientAddress: '',
  freelancerName: '',
  freelancerAddress: '',
  servicesDetails: 'Design, development, and deployment of a full-stack web application including UI/UX design and database integration.',
  feeAmount: 50000,
  timelineDeadline: '4 weeks from the date of execution',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Execution</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('executionDate')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Client (Receiving Services)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name / Company Name</Label><Input {...register('clientName')} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} {...register('clientAddress')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Freelancer/Contractor (Providing Services)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name / Agency Name</Label><Input {...register('freelancerName')} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} {...register('freelancerAddress')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Project Terms</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Scope of Services</Label><Textarea rows={3} {...register('servicesDetails')} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Total Fee (\u20B9)</Label><Input type="number" {...register('feeAmount', { valueAsNumber: true })} /></div>
          <div><Label>Timeline / Deadline</Label><Input {...register('timelineDeadline')} placeholder="e.g. 2 months" /></div>
        </div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">FREELANCE & SERVICE AGREEMENT</h1>
    </div>

    <p style="text-indent: 40px;">
      This Freelance & Service Agreement (the "Agreement") is entered into at <strong>${data.executionPlace}</strong> on the <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and between:
    </p>

    <p style="margin-top: 20px;">
      <strong>${data.clientName || '____________'}</strong>, having its principal place of business/residence at <strong>${data.clientAddress || '____________'}</strong> (hereinafter referred to as the <strong>"Client"</strong>).
    </p>

    <div style="text-align: center; font-weight: bold; margin: 10px 0;">AND</div>

    <p>
      <strong>${data.freelancerName || '____________'}</strong>, having their principal place of business/residence at <strong>${data.freelancerAddress || '____________'}</strong> (hereinafter referred to as the <strong>"Contractor"</strong>).
    </p>

    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 30px;">1. SERVICES & SCOPE</h3>
    <p style="margin-left: 20px;">
      The Client hereby engages the Contractor to perform the following services (the "Services"):<br/>
      <em>${data.servicesDetails}</em>
    </p>

    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 20px;">2. COMPENSATION</h3>
    <p style="margin-left: 20px;">
      In consideration for the full, satisfactory performance of the Services, the Client shall pay the Contractor a total fee of <strong>\u20B9 ${Number(data.feeAmount).toLocaleString('en-IN')}/-</strong>. Payment shall be subject to applicable tax deductions at source (TDS).
    </p>

    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 20px;">3. TIMELINE</h3>
    <p style="margin-left: 20px;">
      The Contractor agrees to complete the Services in accordance with the following timeline: <strong>${data.timelineDeadline}</strong>. Time is of the essence in the performance of this Agreement.
    </p>

    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 20px;">4. INTELLECTUAL PROPERTY</h3>
    <p style="margin-left: 20px;">
      Any work product, designs, code, or deliverables created by the Contractor under this Agreement shall automatically become the exclusive intellectual property of the Client upon full payment of the agreed compensation. The Contractor waives any moral rights in the deliverables.
    </p>

    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 20px;">5. CONFIDENTIALITY</h3>
    <p style="margin-left: 20px;">
      The Contractor agrees to keep all information relating to the Client's business, finances, and trade secrets strictly confidential and not disclose it to any third party without prior written consent.
    </p>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the day and year first above written.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>For CLIENT:</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.clientName}
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>For CONTRACTOR:</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.freelancerName}
      </div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Freelance & Service Agreement generated via MyeCA.in`;

export const ServiceAgreementGenerator: DocumentGeneratorConfig = {
  id: 'contract-service',
  title: 'Freelance & Service Agreement',
  description: 'Clear contract defining deliverables, payment milestones, and intellectual property rights for contractors.',
  icon: <Briefcase className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
