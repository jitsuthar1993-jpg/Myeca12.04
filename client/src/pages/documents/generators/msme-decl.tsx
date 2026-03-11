import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  companyName: z.string().min(2, 'Company name is required'),
  companyAddress: z.string().min(5, 'Address is required'),
  udyamNumber: z.string().min(5, 'Udyam Registration Number is required'),
  enterpriseType: z.enum(['Micro', 'Small', 'Medium']),
  panNumber: z.string().min(10, 'Valid PAN required'),
  vendorName: z.string().min(2, 'Vendor/Client name required'),
});

const defaultValues = {
  date: new Date().toISOString().split('T')[0],
  companyName: '',
  companyAddress: '',
  udyamNumber: 'UDYAM-',
  enterpriseType: 'Micro',
  panNumber: '',
  vendorName: 'To Whomsoever It May Concern',
};

const FormComponent = ({ register, errors, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Your Enterprise Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label>Enterprise Name</Label><Input {...register('companyName')} /></div>
        <div className="col-span-2"><Label>Registered Address</Label><Textarea rows={2} {...register('companyAddress')} /></div>
        <div><Label>Udyam Registration Number</Label><Input {...register('udyamNumber')} className="uppercase" /></div>
        <div><Label>PAN</Label><Input {...register('panNumber')} className="uppercase" /></div>
        <div>
          <Label>Enterprise Classification</Label>
          <Controller
            control={control}
            name="enterpriseType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Micro">Micro Enterprise</SelectItem>
                  <SelectItem value="Small">Small Enterprise</SelectItem>
                  <SelectItem value="Medium">Medium Enterprise</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Recipient Details</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Client / Vendor Name (Leave as 'To Whomsoever It May Concern' for general use)</Label><Input {...register('vendorName')} /></div>
        <div><Label>Letter Date</Label><Input type="date" {...register('date')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px;">
    
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; font-weight: bold;">${data.companyName}</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px;">${data.companyAddress}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">PAN: ${data.panNumber.toUpperCase()}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>Ref: MSME/DECL/${new Date().getFullYear()}/01</div>
      <div>Date: <strong>${data.date.split('-').reverse().join('/')}</strong></div>
    </div>

    <div style="margin-bottom: 30px;">
      <strong>To,</strong><br/>
      <strong>${data.vendorName}</strong>
    </div>

    <div style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 30px; text-transform: uppercase;">
      Sub: Declaration regarding MSME Status under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006.
    </div>

    <p style="margin-bottom: 15px;">Dear Sir/Madam,</p>

    <p style="text-align: justify; margin-bottom: 20px;">
      With reference to the above subject, we wish to bring to your kind attention that our enterprise, <strong>${data.companyName}</strong>, is registered under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006.
    </p>

    <p style="text-align: justify; margin-bottom: 20px;">
      Based on the revised criteria for classification of MSMEs notified by the Ministry of Micro, Small and Medium Enterprises, Govt. of India, our enterprise classification is a <strong>${data.enterpriseType.toUpperCase()} ENTERPRISE</strong>.
    </p>

    <div style="margin: 30px 0; background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd;">
      <p style="margin: 0 0 10px 0;"><strong>Our Registration Details:</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px; width: 40%;">Udyam Registration Number:</td>
          <td style="padding: 5px; font-weight: bold;">${data.udyamNumber.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding: 5px; width: 40%;">Enterprise Category:</td>
          <td style="padding: 5px; font-weight: bold;">${data.enterpriseType}</td>
        </tr>
      </table>
    </div>

    <p style="text-align: justify; margin-bottom: 20px;">
      As a registered ${data.enterpriseType} enterprise, we are entitled to the benefits under the MSMED Act, 2006, including the provisions relating to delayed payments as specified in Section 15 of the Act, which mandates payments from buyers to be made within 45 days.
    </p>

    <p style="text-align: justify; margin-bottom: 30px;">
      We kindly request you to update our MSME status in your vendor master records. We are enclosing a copy of our Udyam Registration Certificate for your reference and records.
    </p>

    <p style="margin-bottom: 50px;">Thanking you,</p>

    <div>
      <p style="margin: 0;">Yours faithfully,</p>
      <div style="margin-top: 50px;">
        ___________________________<br />
        <strong>For ${data.companyName}</strong><br />
        Authorized Signatory
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# MSME Declaration generated via MyeCA.in`;

export const MSMEDeclGenerator: DocumentGeneratorConfig = {
  id: 'msme-decl',
  title: 'MSME Declaration (Udyam)',
  description: 'A formal letter confirming enterprise classification to claim MSME delayed payment benefits from vendors.',
  icon: <CheckCircle className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
