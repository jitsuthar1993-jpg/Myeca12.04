import { z } from 'zod';
import { Award } from 'lucide-react';
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
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationTagline: z.string().optional(),
  recipientName: z.string().min(2, 'Recipient name is required'),
  certificateTitle: z.string().min(2, 'Certificate title is required'),
  achievement: z.string().min(8, 'Achievement description is required'),
  issuerName: z.string().min(2, 'Issuer name is required'),
  issuerTitle: z.string().min(2, 'Issuer title is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  certificateId: z.string().optional(),
  layoutStyle: z.enum(['classic', 'modern', 'formal']),
  accentColor: z.enum(['#2563eb', '#7c3aed', '#047857', '#b45309']),
});

const defaultValues = {
  organizationName: 'MyeCA Learning Academy',
  organizationTagline: 'Professional Excellence & Continuous Learning',
  recipientName: '',
  certificateTitle: 'Certificate of Excellence',
  achievement:
    'outstanding performance, dedication, and successful completion of the professional development program',
  issuerName: '',
  issuerTitle: 'Program Director',
  issueDate: new Date().toISOString().split('T')[0],
  certificateId: `CERT-${new Date().getFullYear()}-001`,
  layoutStyle: 'classic',
  accentColor: '#2563eb',
};

const FormComponent = ({ register, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Certificate Identity</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Organization / Institution Name</Label>
          <Input {...register('organizationName')} />
        </div>
        <div className="col-span-2">
          <Label>Tagline or Subtitle</Label>
          <Input {...register('organizationTagline')} />
        </div>
        <div>
          <Label>Certificate Title</Label>
          <Input {...register('certificateTitle')} />
        </div>
        <div>
          <Label>Certificate ID</Label>
          <Input {...register('certificateId')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Recipient & Recognition</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Recipient Name</Label>
          <Input {...register('recipientName')} />
        </div>
        <div className="col-span-2">
          <Label>Achievement / Reason</Label>
          <Textarea rows={3} {...register('achievement')} />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Issuer & Styling</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Issuer Name</Label>
          <Input {...register('issuerName')} />
        </div>
        <div>
          <Label>Issuer Title</Label>
          <Input {...register('issuerTitle')} />
        </div>
        <div>
          <Label>Issue Date</Label>
          <Input type="date" {...register('issueDate')} />
        </div>
        <div>
          <Label>Layout Style</Label>
          <Controller
            control={control}
            name="layoutStyle"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic Border</SelectItem>
                  <SelectItem value="modern">Modern Minimal</SelectItem>
                  <SelectItem value="formal">Formal Seal</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Accent Color</Label>
          <Controller
            control={control}
            name="accentColor"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#2563eb">Blue</SelectItem>
                  <SelectItem value="#7c3aed">Violet</SelectItem>
                  <SelectItem value="#047857">Emerald</SelectItem>
                  <SelectItem value="#b45309">Amber</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
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
  const accent = data.accentColor || '#2563eb';
  const isModern = data.layoutStyle === 'modern';
  const isFormal = data.layoutStyle === 'formal';

  const borderStyle = isModern
    ? `border-left: 12px solid ${accent}; border-top: 1px solid #d1d5db; border-right: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db;`
    : `border: ${isFormal ? '10px double' : '6px solid'} ${accent};`;

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #111827; max-width: 800px; min-height: 880px; margin: 0 auto; padding: 48px; ${borderStyle} background: #ffffff; position: relative;">
      <div style="border: 1px solid ${accent}; min-height: 780px; padding: 44px 40px; text-align: center;">
        <div style="letter-spacing: 3px; text-transform: uppercase; color: ${accent}; font-size: 13px; font-weight: bold;">
          ${data.organizationName}
        </div>
        ${
          data.organizationTagline
            ? `<div style="margin-top: 8px; color: #6b7280; font-size: 13px;">${data.organizationTagline}</div>`
            : ''
        }

        <div style="margin: 54px auto 28px; width: 92px; height: 92px; border-radius: 50%; border: 3px solid ${accent}; display: flex; align-items: center; justify-content: center; color: ${accent}; font-size: 38px; font-weight: bold;">
          ${isFormal ? 'SEAL' : 'AWD'}
        </div>

        <h1 style="margin: 0; font-size: 34px; line-height: 1.2; color: #111827; text-transform: uppercase;">
          ${data.certificateTitle}
        </h1>

        <p style="margin: 36px 0 12px; color: #4b5563; font-size: 16px;">This certificate is proudly presented to</p>

        <div style="font-size: 42px; line-height: 1.2; color: ${accent}; font-weight: bold; border-bottom: 2px solid ${accent}; display: inline-block; min-width: 420px; padding: 0 24px 12px;">
          ${data.recipientName || 'Recipient Name'}
        </div>

        <p style="margin: 32px auto 0; max-width: 620px; font-size: 18px; line-height: 1.8; color: #374151;">
          In recognition of ${data.achievement}.
        </p>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 92px; text-align: left;">
          <div style="width: 38%; text-align: center;">
            <div style="border-top: 1px solid #111827; padding-top: 10px; font-weight: bold;">${data.issuerName || 'Issuer Name'}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${data.issuerTitle}</div>
          </div>
          <div style="width: 24%; text-align: center; color: #6b7280; font-size: 12px;">
            <div style="font-weight: bold; color: #111827;">Date</div>
            <div>${formatDate(data.issueDate)}</div>
            ${data.certificateId ? `<div style="margin-top: 14px;">ID: ${data.certificateId}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) =>
  `# ${data.certificateTitle}\n\nPresented to **${data.recipientName}** for ${data.achievement}.\n\nIssued by ${data.issuerName}, ${data.issuerTitle} on ${data.issueDate}.`;

export const CertificateGenerator: DocumentGeneratorConfig = {
  id: 'certificate',
  title: 'Award / Excellence Certificate',
  description:
    'Design high-resolution certificates for employee appreciation, training completion, or excellence awards.',
  icon: <Award className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
