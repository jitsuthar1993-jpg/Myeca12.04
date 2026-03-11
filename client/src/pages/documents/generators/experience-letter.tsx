import { z } from 'zod';
import { Award } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyAddress: z.string().min(5, 'Company address is required'),
  issueDate: z.string().min(1, 'Date is required'),
  employeeName: z.string().min(2, 'Employee name is required'),
  employeeId: z.string().min(2, 'Employee ID is required'),
  lastDesignation: z.string().min(2, 'Designation is required'),
  dateOfJoining: z.string().min(1, 'Joining date is required'),
  dateOfLeaving: z.string().min(1, 'Leaving date is required'),
  reasonForLeaving: z.string().optional(),
  signatoryName: z.string().min(2, 'Signatory name is required'),
  signatoryDesignation: z.string().min(2, 'Signatory designation is required'),
});

const defaultValues = {
  companyName: 'Acme Technologies Ltd.',
  companyAddress: '404 Innovation Drive, Pune 411014',
  issueDate: new Date().toISOString().split('T')[0],
  employeeName: '',
  employeeId: 'EMP-',
  lastDesignation: 'Senior Developer',
  dateOfJoining: '2023-01-15',
  dateOfLeaving: new Date().toISOString().split('T')[0],
  reasonForLeaving: 'resignation',
  signatoryName: 'Jane Smith',
  signatoryDesignation: 'HR Manager',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Company Information</h3>
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

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Employee Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input {...register('employeeName')} />
        </div>
        <div>
          <Label>Employee ID</Label>
          <Input {...register('employeeId')} />
        </div>
        <div className="col-span-2">
          <Label>Last Designation / Title</Label>
          <Input {...register('lastDesignation')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Tenure details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date of Joining</Label>
          <Input type="date" {...register('dateOfJoining')} />
        </div>
        <div>
          <Label>Date of Relieving</Label>
          <Input type="date" {...register('dateOfLeaving')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Document Footer</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Issue Date</Label>
          <Input type="date" {...register('issueDate')} />
        </div>
        <div>
          <Label>HR Signatory Name</Label>
          <Input {...register('signatoryName')} />
        </div>
        <div>
          <Label>Signatory Designation</Label>
          <Input {...register('signatoryDesignation')} />
        </div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px;">
      
      <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px;">
        <h1 style="margin: 0; color: #1e3a8a; font-size: 28px; text-transform: uppercase;">${data.companyName}</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">${data.companyAddress}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <p style="margin: 0; font-weight: bold;">Date: ${data.issueDate}</p>
        <p style="margin: 0; font-weight: bold;">Ref: HR/REL/${new Date(data.issueDate).getFullYear()}/${data.employeeId || '000'}</p>
      </div>

      <h2 style="text-align: center; text-decoration: underline; text-transform: uppercase; margin-bottom: 40px;">EXPERIENCE & RELIEVING CERTIFICATE</h2>
      
      <p style="text-align: justify; margin-bottom: 20px;">
        **TO WHOMSOEVER IT MAY CONCERN**
      </p>

      <p style="text-align: justify; margin-bottom: 20px;">
        This is to certify that <strong>Mr./Ms. ${data.employeeName || '[Employee Name]'}</strong> (Employee ID: ${data.employeeId || '[ID]'}) was employed with <strong>${data.companyName}</strong> from <strong>${data.dateOfJoining}</strong> to <strong>${data.dateOfLeaving}</strong>.
      </p>

      <p style="text-align: justify; margin-bottom: 20px;">
        At the time of leaving the organization, their last held designation was <strong>${data.lastDesignation}</strong>.
      </p>

      <p style="text-align: justify; margin-bottom: 20px;">
        This letter further confirms that they have successfully completed their notice period and have been relieved from the services of the company at the close of working hours on <strong>${data.dateOfLeaving}</strong>, pursuant to their resignation.
      </p>

      <p style="text-align: justify; margin-bottom: 40px;">
        During the tenure with our organization, we found their conduct and performance to be satisfactory. We would like to take this opportunity to thank them for their contributions to the company and wish them all the best in their future endeavors.
      </p>

      <div style="margin-top: 80px;">
        <p style="margin: 0;">Sincerely,</p>
        <p style="margin: 5px 0 60px 0; font-weight: bold;">For ${data.companyName}</p>
        
        <p style="margin: 0; font-weight: bold; border-top: 1px solid #333; display: inline-block; padding-top: 5px; min-width: 200px;">
          ${data.signatoryName}
        </p>
        <p style="margin: 0; color: #666;">${data.signatoryDesignation}</p>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) => `# Experience CertificatennGenerated via MyeCA.in`;

export const ExperienceLetterGenerator: DocumentGeneratorConfig = {
  id: 'experience-letter',
  title: 'Experience & Relieving Certificate',
  description: 'Provide exiting employees with official tenure verification and final clearance.',
  icon: <Award className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
