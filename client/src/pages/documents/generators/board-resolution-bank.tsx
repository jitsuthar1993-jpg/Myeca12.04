import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  cin: z.string().optional(),
  companyAddress: z.string().min(5, 'Address is required'),
  meetingDate: z.string().min(1, 'Meeting date required'),
  meetingPlace: z.string().min(2, 'Meeting place required'),
  bankName: z.string().min(2, 'Bank name required'),
  bankBranch: z.string().min(2, 'Bank branch required'),
  signatory1: z.string().min(2, 'Signatory 1 name required'),
  signatory1Desig: z.string().min(2, 'Signatory 1 designation required'),
  signatory2: z.string().optional(),
  signatory2Desig: z.string().optional(),
  chairmanName: z.string().min(2, 'Chairman name required'),
});

const defaultValues = {
  companyName: 'Acme Technologies Pvt Ltd',
  cin: 'U72900MH2024PTC123456',
  companyAddress: '123 Business Avenue, Tech Park, Mumbai 400001',
  meetingDate: new Date().toISOString().split('T')[0],
  meetingPlace: 'Registered Office',
  bankName: 'HDFC Bank Ltd',
  bankBranch: 'Nariman Point Branch',
  signatory1: 'John Doe',
  signatory1Desig: 'Director',
  signatory2: 'Jane Smith',
  signatory2Desig: 'Director',
  chairmanName: 'Alice Green',
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Company Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Company Name</Label><Input {...register('companyName')} /></div>
        <div><Label>CIN (Corporate Identity Number)</Label><Input {...register('cin')} /></div>
        <div className="col-span-2"><Label>Registered Office Address</Label><Textarea rows={2} {...register('companyAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Board Meeting Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Date of Board Meeting</Label><Input type="date" {...register('meetingDate')} /></div>
        <div><Label>Place of Meeting</Label><Input {...register('meetingPlace')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Bank Account Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name of the Bank</Label><Input {...register('bankName')} /></div>
        <div><Label>Branch Name / Location</Label><Input {...register('bankBranch')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Authorized Signatories</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Signatory 1 Name</Label><Input {...register('signatory1')} /></div>
        <div><Label>Signatory 1 Designation</Label><Input {...register('signatory1Desig')} /></div>
        <div><Label>Signatory 2 Name (Optional)</Label><Input {...register('signatory2')} /></div>
        <div><Label>Signatory 2 Designation</Label><Input {...register('signatory2Desig')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Certification</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Name of Chairman / Managing Director issuing CTC</Label><Input {...register('chairmanName')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">${data.companyName}</h1>
      <p style="margin: 5px 0 0 0; font-size: 13px;">CIN: ${data.cin || '______________'}</p>
      <p style="margin: 5px 0 0 0; font-size: 13px;">Regd. Office: ${data.companyAddress}</p>
    </div>

    <h2 style="text-align: center; text-decoration: underline; text-transform: uppercase; font-size: 16px; margin-bottom: 30px;">
      CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${data.companyName} HELD ON ${data.meetingDate.split('-').reverse().join('/')} AT ${data.meetingPlace.toUpperCase()}
    </h2>

    <p style="margin-bottom: 20px;">
      <strong>"RESOLVED THAT</strong> a Current Account in the name of the Company be opened with <strong>${data.bankName}</strong>, <strong>${data.bankBranch}</strong> and that the said Bank be and is hereby authorized to honor cheques, bills of exchange, and promissory notes drawn, accepted or made on behalf of the Company by:
    </p>

    <ol style="margin-left: 20px; margin-bottom: 20px;">
      <li style="margin-bottom: 10px;"><strong>${data.signatory1}</strong>, ${data.signatory1Desig}</li>
      ${data.signatory2 ? `<li style="margin-bottom: 10px;"><strong>${data.signatory2}</strong>, ${data.signatory2Desig}</li>` : ''}
    </ol>

    <p style="margin-bottom: 20px;">
      ${data.signatory2 ? 'acting jointly/severally' : 'acting singularly'} on behalf of the Company; and to act on any instructions so given relating to the account, whether the same be overdrawn or not or relating to the transactions of the Company.
    </p>

    <p style="margin-bottom: 20px;">
      <strong>RESOLVED FURTHER THAT</strong> the aforesaid authorized signatory/ies be and are hereby authorized to sign the account opening form, apply for internet banking, corporate credit/debit cards, and execute any such documents, agreements, or indemnities as may be required by the Bank from time to time in connection with the operation of the said account.
    </p>

    <p style="margin-bottom: 20px;">
      <strong>RESOLVED FURTHER THAT</strong> a copy of this resolution certified by any one Director or the Company Secretary be provided to the Bank, and the Bank is hereby requested to act upon it until written notice of its revocation is received by the Bank."
    </p>

    <div style="margin-top: 60px;">
      <p style="margin-bottom: 40px; font-weight: bold;">CERTIFIED TRUE COPY</p>
      <p style="margin: 0; font-weight: bold;">For ${data.companyName}</p>
      
      <div style="margin-top: 50px;">
        <p style="margin: 0;">_______________________</p>
        <p style="margin: 5px 0 0 0; font-weight: bold;">${data.chairmanName}</p>
        <p style="margin: 0; color: #666;">Director / Chairman</p>
      </div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Board Resolution generated via MyeCA.in`;

export const BoardResolutionBankGenerator: DocumentGeneratorConfig = {
  id: 'board-resolution-bank',
  title: 'Board Resolution (Bank A/c)',
  description: 'Required corporate draft to authorize the opening and operation of a current bank account by directors.',
  icon: <Building2 className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
