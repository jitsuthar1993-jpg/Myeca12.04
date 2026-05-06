import { z } from 'zod';
import { Mail } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  issuerName: z.string().min(2, 'Issuer name is required'),
  issuerAddress: z.string().min(5, 'Issuer address is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  referenceNo: z.string().optional(),
  recipientType: z.enum(['To Whomsoever It May Concern', 'Named Recipient']),
  recipientName: z.string().optional(),
  applicantName: z.string().min(2, 'Applicant name is required'),
  applicantIdentifier: z.string().optional(),
  purpose: z.string().min(5, 'Purpose is required'),
  noObjectionText: z.string().min(10, 'No objection text is required'),
  validUntil: z.string().optional(),
  signatoryName: z.string().min(2, 'Signatory name is required'),
  signatoryDesignation: z.string().min(2, 'Signatory designation is required'),
  place: z.string().min(2, 'Place is required'),
});

const defaultValues = {
  issuerName: 'Acme Private Limited',
  issuerAddress: 'Registered Office, Mumbai, Maharashtra',
  issueDate: new Date().toISOString().split('T')[0],
  referenceNo: `NOC/${new Date().getFullYear()}/001`,
  recipientType: 'To Whomsoever It May Concern',
  recipientName: '',
  applicantName: '',
  applicantIdentifier: '',
  purpose: 'submission to the concerned authority',
  noObjectionText:
    'We have no objection to the applicant using this certificate for the stated purpose, subject to applicable laws, policies, and verification by the receiving authority.',
  validUntil: '',
  signatoryName: '',
  signatoryDesignation: 'Authorised Signatory',
  place: 'Mumbai',
};

const FormComponent = ({ register, control, watch }: any) => {
  const recipientType = watch?.('recipientType');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Issuer Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Issuer / Organization Name</Label>
          <Input {...register('issuerName')} />
        </div>
        <div className="col-span-2">
          <Label>Issuer Address</Label>
          <Textarea rows={2} {...register('issuerAddress')} />
        </div>
        <div>
          <Label>Issue Date</Label>
          <Input type="date" {...register('issueDate')} />
        </div>
        <div>
          <Label>Reference Number</Label>
          <Input {...register('referenceNo')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Recipient & Applicant</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Recipient Type</Label>
          <Controller
            control={control}
            name="recipientType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Whomsoever It May Concern">
                    To Whomsoever It May Concern
                  </SelectItem>
                  <SelectItem value="Named Recipient">Named Recipient</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Named Recipient</Label>
          <Input
            {...register('recipientName')}
            placeholder="Bank, authority, employer, etc."
            disabled={recipientType !== 'Named Recipient'}
          />
        </div>
        <div>
          <Label>Applicant / Beneficiary Name</Label>
          <Input {...register('applicantName')} />
        </div>
        <div>
          <Label>Applicant Identifier</Label>
          <Input {...register('applicantIdentifier')} placeholder="Employee ID, PAN, flat no., etc." />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">NOC Purpose</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Purpose</Label>
          <Input {...register('purpose')} />
        </div>
        <div className="col-span-2">
          <Label>No Objection Text</Label>
          <Textarea rows={4} {...register('noObjectionText')} />
        </div>
        <div>
          <Label>Valid Until (Optional)</Label>
          <Input type="date" {...register('validUntil')} />
        </div>
        <div>
          <Label>Place</Label>
          <Input {...register('place')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Signatory</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Signatory Name</Label>
          <Input {...register('signatoryName')} />
        </div>
        <div>
          <Label>Designation</Label>
          <Input {...register('signatoryDesignation')} />
        </div>
      </div>
    </div>
  );
};

const formatDate = (value: string) => {
  if (!value) return '';
  return value.split('-').reverse().join('/');
};

const generateHTML = (data: any) => {
  const recipient =
    data.recipientType === 'Named Recipient' && data.recipientName
      ? data.recipientName
      : 'To Whomsoever It May Concern';

  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111827; line-height: 1.7; max-width: 800px; margin: 0 auto; padding: 44px;">
      <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 18px; margin-bottom: 34px;">
        <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">${data.issuerName}</h1>
        <p style="margin: 6px 0 0; color: #4b5563;">${data.issuerAddress}</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 42px;">
        <div>Ref No: <strong>${data.referenceNo || '__________'}</strong></div>
        <div>Date: <strong>${formatDate(data.issueDate)}</strong></div>
      </div>

      <h2 style="text-align: center; font-size: 20px; text-decoration: underline; margin: 0 0 38px; text-transform: uppercase;">
        No Objection Certificate
      </h2>

      <p style="font-weight: bold; margin-bottom: 26px;">${recipient}</p>

      <p style="text-align: justify;">
        This is to certify that <strong>${data.applicantName}</strong>${
          data.applicantIdentifier ? ` (${data.applicantIdentifier})` : ''
        } has requested this No Objection Certificate for <strong>${data.purpose}</strong>.
      </p>

      <p style="text-align: justify; margin-top: 20px;">
        ${data.noObjectionText}
      </p>

      ${
        data.validUntil
          ? `<p style="text-align: justify; margin-top: 20px;">This certificate shall remain valid until <strong>${formatDate(data.validUntil)}</strong>, unless withdrawn earlier in writing by the issuer.</p>`
          : ''
      }

      <p style="text-align: justify; margin-top: 20px;">
        This certificate is issued at the request of the applicant and does not create any financial, statutory, or legal liability on the issuer beyond the statement expressly made above.
      </p>

      <div style="display: flex; justify-content: space-between; margin-top: 74px;">
        <div>
          <p>Place: <strong>${data.place}</strong></p>
          <p>Date: <strong>${formatDate(data.issueDate)}</strong></p>
        </div>
        <div style="width: 280px; text-align: center;">
          <div style="height: 70px;"></div>
          <div style="border-top: 1px solid #111827; padding-top: 8px; font-weight: bold;">${data.signatoryName}</div>
          <div style="font-size: 12px; color: #4b5563;">${data.signatoryDesignation}</div>
          <div style="font-size: 12px; color: #4b5563; margin-top: 8px;">For ${data.issuerName}</div>
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) =>
  `# No Objection Certificate\n\nIssuer: ${data.issuerName}\n\nApplicant: ${data.applicantName}\n\nPurpose: ${data.purpose}\n\n${data.noObjectionText}`;

export const NocGenerator: DocumentGeneratorConfig = {
  id: 'noc',
  title: 'NOC Letter',
  description:
    'Flexible No Objection Certificate for employers, companies, institutions, and general authority submissions.',
  icon: <Mail className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
