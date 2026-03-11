import { z } from 'zod';
import { Mail } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  businessName: z.string().min(2, 'Business Name is required'),
  businessPan: z.string().min(10, 'Business PAN is required'),
  gstin: z.string().optional(),
  authorizerName: z.string().min(2, 'Authorizer Name is required'),
  authorizerDesignation: z.string().min(2, 'Authorizer Designation is required'),
  authorizedName: z.string().min(2, 'Authorized Person Name is required'),
  authorizedDesignation: z.string().min(2, 'Authorized Designation is required'),
  authorizedPan: z.string().min(10, 'Authorized PAN is required'),
  authorizedAadhaar: z.string().optional(),
});

const defaultValues = {
  executionPlace: 'Mumbai',
  executionDate: new Date().toISOString().split('T')[0],
  businessName: '',
  businessPan: '',
  gstin: '',
  authorizerName: '',
  authorizerDesignation: 'Director / Proprietor / Partner',
  authorizedName: '',
  authorizedDesignation: 'Manager / Accountant',
  authorizedPan: '',
  authorizedAadhaar: '',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Business Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('executionDate')} /></div>
        <div className="col-span-2"><Label>Business Name</Label><Input {...register('businessName')} /></div>
        <div><Label>Business PAN</Label><Input {...register('businessPan')} className="uppercase" /></div>
        <div><Label>GSTIN (If already registered)</Label><Input {...register('gstin')} className="uppercase" /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Authorizer (Who is giving power)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name</Label><Input {...register('authorizerName')} /></div>
        <div><Label>Designation</Label><Input {...register('authorizerDesignation')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Authorized Signatory (Who is receiving power)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name</Label><Input {...register('authorizedName')} /></div>
        <div><Label>Designation</Label><Input {...register('authorizedDesignation')} /></div>
        <div><Label>PAN</Label><Input {...register('authorizedPan')} className="uppercase" /></div>
        <div><Label>Aadhaar (Optional)</Label><Input {...register('authorizedAadhaar')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: right; margin-bottom: 20px;">
      Date: <strong>${data.executionDate.split('-').reverse().join('/')}</strong><br />
      Place: <strong>${data.executionPlace}</strong>
    </div>

    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0; font-size: 20px; text-decoration: underline; text-transform: uppercase;">DECLARATION FOR AUTHORIZED SIGNATORY</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic;">(Under Goods and Services Tax Rules)</p>
    </div>

    <p style="text-indent: 50px;">
      We/I, <strong>${data.authorizerName}</strong>, acting in the capacity of <strong>${data.authorizerDesignation}</strong> of the business <strong>${data.businessName}</strong>, having PAN <strong>${data.businessPan.toUpperCase()}</strong> ${data.gstin ? `and GSTIN <strong>${data.gstin.toUpperCase()}</strong>` : ''}, do hereby solemnly affirm and declare that:
    </p>

    <p style="text-indent: 50px; margin-top: 20px;">
      <strong>Mr./Ms. ${data.authorizedName}</strong>, holding the position of <strong>${data.authorizedDesignation}</strong> in our organization, with PAN <strong>${data.authorizedPan.toUpperCase()}</strong> ${data.authorizedAadhaar ? `and Aadhaar <strong>${data.authorizedAadhaar}</strong>` : ''}, is hereby appointed as an Authorized Signatory for our business under the Central Goods and Services Tax Act, 2017.
    </p>

    <p style="text-indent: 50px; margin-top: 20px;">
      We/I hereby declare that the said Authorized Signatory is authorized to sign, submit, execute, and deliver all applications, documents, returns, statements, and other necessary papers required for GST registration, compliance, and correspondence with the Goods and Services Tax Network (GSTN) and related authorities on our behalf.
    </p>

    <p style="text-indent: 50px; margin-top: 20px;">
      All actions, deeds, and things done by the said Authorized Signatory shall be binding on the business <strong>${data.businessName}</strong>.
    </p>

    <div style="margin-top: 50px;">
      <p style="font-weight: bold; text-decoration: underline;">Acceptance as an Authorized Signatory</p>
      <p>I, <strong>${data.authorizedName}</strong>, hereby solemnly accord my acceptance to act as the Authorized Signatory for the above-mentioned business and hold myself responsible for the acts done by me in this capacity.</p>
    </div>

    <div style="margin-top: 40px;">
      <strong>Signature of Authorized Signatory:</strong><br/><br/><br/>
      _________________________________<br/>
      ( ${data.authorizedName} )
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>Authorizing Person:</strong><br /><br /><br />
        ___________________________<br />
        Name: <strong>${data.authorizerName}</strong><br />
        Designation: ${data.authorizerDesignation}
      </div>
      <div style="width: 45%; text-align: right;">
        <strong>For ${data.businessName}</strong><br /><br /><br />
        ___________________________<br />
        (Seal / Stamp)
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# GST Authorization Letter generated via MyeCA.in`;

export const GSTAuthGenerator: DocumentGeneratorConfig = {
  id: 'gst-auth',
  title: 'GST Authorization Letter',
  description: 'Letter for authorizing a CA, Agent, or Employee to act as an authorized signatory on the GST portal.',
  icon: <Mail className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
