import { z } from 'zod';
import { Briefcase } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place required'),
  executionDate: z.string().min(1, 'Date required'),
  startupName: z.string().min(2, 'Startup Name required'),
  businessIdea: z.string().min(10, 'Idea description required'),
  founder1Name: z.string().min(2, 'Founder 1 name required'),
  founder1Equity: z.number().min(1, 'Equity > 0'),
  founder1Role: z.string().min(2, 'Role required'),
  founder2Name: z.string().min(2, 'Founder 2 name required'),
  founder2Equity: z.number().min(1, 'Equity > 0'),
  founder2Role: z.string().min(2, 'Role required'),
});

const defaultValues = {
  executionPlace: 'Bengaluru',
  executionDate: new Date().toISOString().split('T')[0],
  startupName: 'NextGen AI Solutions',
  businessIdea: 'Developing an AI-driven accounting SaaS platform for Indian MSMEs.',
  founder1Name: '',
  founder1Equity: 60,
  founder1Role: 'CEO (Chief Executive Officer)',
  founder2Name: '',
  founder2Equity: 40,
  founder2Role: 'CTO (Chief Technology Officer)',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Execution & Project</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('executionDate')} /></div>
        <div className="col-span-2"><Label>Proposed Startup/Company Name</Label><Input {...register('startupName')} /></div>
        <div className="col-span-2"><Label>Core Business Idea / Project</Label><Textarea rows={2} {...register('businessIdea')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Founder 1 (Primary)</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Full Name</Label><Input {...register('founder1Name')} /></div>
        <div><Label>Equity (%)</Label><Input type="number" {...register('founder1Equity', { valueAsNumber: true })} /></div>
        <div><Label>Primary Role</Label><Input {...register('founder1Role')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Founder 2 (Co-founder)</h3>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Full Name</Label><Input {...register('founder2Name')} /></div>
        <div><Label>Equity (%)</Label><Input type="number" {...register('founder2Equity', { valueAsNumber: true })} /></div>
        <div><Label>Primary Role</Label><Input {...register('founder2Role')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">CO-FOUNDERS AGREEMENT</h1>
    </div>
    <p>This Founders Agreement is made at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and among:</p>
    <p><strong>1. ${data.founder1Name}</strong> (hereinafter referred to as the "Founder 1").</p>
    <div style="text-align: center; font-weight: bold; margin: 10px 0;">AND</div>
    <p><strong>2. ${data.founder2Name}</strong> (hereinafter referred to as the "Founder 2").</p>
    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">WHEREAS:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;">The Founders have agreed to pool their resources, knowledge, and efforts to build a business entity under the proposed name <strong>"${data.startupName}"</strong>.</li>
      <li style="margin-bottom: 10px;">The core project involves: <em>${data.businessIdea}</em>.</li>
    </ol>
    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">NOW THEREFORE IT IS AGREED:</h3>
    <ol style="margin-left: 20px; margin-top: 15px;">
      <li style="margin-bottom: 10px;"><strong>Equity Ownership:</strong> Upon incorporation, the equity shares shall be distributed as: Founder 1: <strong>${data.founder1Equity}%</strong>, Founder 2: <strong>${data.founder2Equity}%</strong>.</li>
      <li style="margin-bottom: 10px;"><strong>Roles & Responsibilities:</strong> Founder 1 will act as <strong>${data.founder1Role}</strong>. Founder 2 will act as <strong>${data.founder2Role}</strong>. All major operational decisions shall require mutual consensus.</li>
      <li style="margin-bottom: 10px;"><strong>Vesting & Cliff:</strong> The Founders' equity shares shall be subject to a standard 4-year vesting schedule, with a 1-year cliff attached to the issuance of common stock.</li>
      <li style="margin-bottom: 10px;"><strong>Intellectual Property:</strong> Any intellectual property (code, designs, patents) created by the Founders for the project shall be assigned entirely to the Company.</li>
      <li style="margin-bottom: 10px;"><strong>Non-Compete:</strong> The Founders agree not to participate in any competing business during their association with the Company and for a period of 12 months thereafter.</li>
    </ol>
    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;"><strong>FOUNDER 1</strong><br /><br /><br />___________________________<br />${data.founder1Name}</div>
      <div style="width: 45%; text-align: right;"><strong>FOUNDER 2</strong><br /><br /><br />___________________________<br />${data.founder2Name}</div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Founders Agreement generated via MyeCA.in`;

export const FounderAgreementGenerator: DocumentGeneratorConfig = {
  id: 'founder-agreement',
  title: 'Founders Agreement',
  description: 'Crucial document for startups outlining equity distribution, vesting schedules, and co-founder roles.',
  icon: <Briefcase className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
