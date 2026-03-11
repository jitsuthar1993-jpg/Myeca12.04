import { z } from 'zod';
import { FileCheck } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  companyName: z.string().min(2, 'Company Name is required'),
  panNumber: z.string().min(10, 'Valid PAN required'),
  meetingDate: z.string().min(1, 'Meeting date required'),
  meetingLocation: z.string().min(2, 'Meeting location required'),
  authorizedPersonName: z.string().min(2, 'Authorized Person Name is required'),
  authorizedPersonDesignation: z.string().min(2, 'Designation required'),
  authorizedPersonPan: z.string().min(10, 'Valid PAN required'),
  director1Name: z.string().min(2, 'Director 1 name required'),
  director2Name: z.string().optional(),
});

const defaultValues = {
  companyName: '',
  panNumber: '',
  meetingDate: new Date().toISOString().split('T')[0],
  meetingLocation: 'Corporate Office, Mumbai',
  authorizedPersonName: '',
  authorizedPersonDesignation: 'Accountant / Manager',
  authorizedPersonPan: '',
  director1Name: '',
  director2Name: '',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Company Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label>Company Name</Label><Input {...register('companyName')} /></div>
        <div><Label>Company PAN</Label><Input {...register('panNumber')} className="uppercase" /></div>
        <div><Label>Meeting Room / Location</Label><Input {...register('meetingLocation')} /></div>
        <div><Label>Date of Board Meeting</Label><Input type="date" {...register('meetingDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Authorized Signatory Appointed</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name of Appointee</Label><Input {...register('authorizedPersonName')} /></div>
        <div><Label>Their Designation</Label><Input {...register('authorizedPersonDesignation')} /></div>
        <div><Label>Their PAN Number</Label><Input {...register('authorizedPersonPan')} className="uppercase" /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Certifying Directors</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Director 1 Name (Required)</Label><Input {...register('director1Name')} /></div>
        <div><Label>Director 2 Name (Optional)</Label><Input {...register('director2Name')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 18px; text-decoration: underline; text-transform: uppercase;">
        EXTRACT OF THE RESOLUTION PASSED IN THE MEETING OF THE BOARD OF DIRECTORS OF ${data.companyName.toUpperCase()} HELD ON ${data.meetingDate.split('-').reverse().join('/')} AT ${data.meetingLocation.toUpperCase()}
      </h1>
    </div>

    <p style="margin-top: 30px; font-weight: bold; text-decoration: underline;">AUTHORIZATION FOR GST REGISTRATION AND COMPLIANCES</p>

    <p style="text-align: justify; margin-top: 20px;">
      "<strong>RESOLVED THAT</strong> the Board of Directors of the Company do hereby appoint and authorize <strong>Mr./Ms. ${data.authorizedPersonName}</strong> (${data.authorizedPersonDesignation}), holding PAN <strong>${data.authorizedPersonPan.toUpperCase()}</strong>, as the Authorized Signatory on behalf of the Company."
    </p>

    <p style="text-align: justify; margin-top: 15px;">
      "<strong>RESOLVED FURTHER THAT</strong> the above-named Authorized Signatory is hereby conferred with the authority to digitally sign, upload, submit, and physical present all required documents, applications, returns, and communications related to the Goods and Services Tax (GST) Act on behalf of the Company."
    </p>
    
    <p style="text-align: justify; margin-top: 15px;">
      "<strong>RESOLVED FURTHER THAT</strong> the said Authorized Signatory is empowered to represent the Company before the GST Department and proper officers, and take all necessary actions including amendments, cancellations, or correspondences pertaining to GST compliance."
    </p>

    <p style="text-align: justify; margin-top: 15px;">
      "<strong>RESOLVED FURTHER THAT</strong> the acts, deeds, and things done or caused to be done by the said Authorized Signatory shall be binding upon the Company."
    </p>

    <div style="margin-top: 50px;">
      <strong>Specimen Signature of the Authorized Signatory:</strong><br/><br/><br/>
      _________________________________<br/>
      ( ${data.authorizedPersonName} )
    </div>

    <p style="text-align: center; margin-top: 50px; font-weight: bold;">// CERTIFIED TRUE COPY //</p>

    <div style="margin-top: 30px;">
      <strong>For ${data.companyName}</strong>
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        ___________________________<br />
        <strong>${data.director1Name}</strong><br />
        Director
      </div>
      ${data.director2Name ? `<div style="width: 45%;">
        ___________________________<br />
        <strong>${data.director2Name}</strong><br />
        Director
      </div>` : ''}
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# GST Board Resolution generated via MyeCA.in`;

export const BoardResolutionGSTGenerator: DocumentGeneratorConfig = {
  id: 'board-resolution-gst',
  title: 'Board Resolution (GST User)',
  description: 'Authorize an individual to file GST returns and represent the company before the tax authorities.',
  icon: <FileCheck className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
