import { z } from 'zod';
import { Plus, Trash2, Users } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentGeneratorConfig } from './types';

const memberSchema = z.object({
  name: z.string().min(2, 'Member name is required'),
  fatherName: z.string().min(2, "Father's name is required"),
  address: z.string().min(5, 'Member address is required'),
  status: z.string().min(2, 'Member status is required'),
});

const schema = z.object({
  kartaName: z.string().min(2, 'Karta name is required'),
  kartaFatherName: z.string().min(2, "Karta father's name is required"),
  kartaAge: z.number().min(18, 'Karta must be at least 18 years old'),
  kartaAddress: z.string().min(5, 'Karta address is required'),
  hufName: z.string().min(2, 'HUF name is required'),
  coparcenerCount: z.number().min(1, 'At least one coparcener is required'),
  giftAmount: z.number().positive('Gift amount must be greater than zero'),
  giftMode: z.string().min(2, 'Gift mode is required'),
  donorRelation: z.string().min(2, 'Donor relation is required'),
  donorName: z.string().min(2, 'Donor name is required'),
  giftDate: z.string().min(1, 'Gift date is required'),
  existenceDate: z.string().min(1, 'HUF existence date is required'),
  affidavitDate: z.string().min(1, 'Affidavit date is required'),
  members: z.array(memberSchema).min(1, 'Add at least one HUF member'),
});

const today = new Date().toISOString().split('T')[0];

const defaultValues = {
  kartaName: '',
  kartaFatherName: '',
  kartaAge: 18,
  kartaAddress: '',
  hufName: '',
  coparcenerCount: 1,
  giftAmount: 100000,
  giftMode: 'CASH',
  donorRelation: 'FATHER',
  donorName: '',
  giftDate: '',
  existenceDate: '',
  affidavitDate: today,
  members: [
    {
      name: '',
      fatherName: '',
      address: '',
      status: 'Karta',
    },
  ],
};

const FormComponent = ({ register, control }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-lg font-bold">Karta and HUF Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Karta Full Name</Label>
          <Input {...register('kartaName')} placeholder="Full name of Karta" />
        </div>
        <div>
          <Label>Karta Father's Name</Label>
          <Input {...register('kartaFatherName')} placeholder="Father's full name" />
        </div>
        <div>
          <Label>Karta Age</Label>
          <Input type="number" {...register('kartaAge', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>HUF Name</Label>
          <Input {...register('hufName')} placeholder="Example: SUNIL SUTHAR HUF" />
        </div>
        <div>
          <Label>Number of Coparceners</Label>
          <Input type="number" {...register('coparcenerCount', { valueAsNumber: true })} />
        </div>
        <div className="col-span-2">
          <Label>Karta Residential Address</Label>
          <Textarea rows={2} {...register('kartaAddress')} placeholder="Complete residential address" />
        </div>
      </div>

      <h3 className="border-b pb-2 text-lg font-bold">Initial Corpus Gift</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Gift Amount (Rs.)</Label>
          <Input type="number" {...register('giftAmount', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Gift Mode</Label>
          <Input {...register('giftMode')} placeholder="CASH, CHEQUE, BANK TRANSFER" />
        </div>
        <div>
          <Label>Donor Relation</Label>
          <Input {...register('donorRelation')} placeholder="Example: FATHER" />
        </div>
        <div>
          <Label>Donor Full Name</Label>
          <Input {...register('donorName')} placeholder="Full name of donor" />
        </div>
        <div>
          <Label>Gift Date</Label>
          <Input type="date" {...register('giftDate')} />
        </div>
        <div>
          <Label>HUF Exists Since</Label>
          <Input type="date" {...register('existenceDate')} />
        </div>
      </div>

      <h3 className="border-b pb-2 text-lg font-bold">HUF Members</h3>
      <p className="text-sm text-slate-600">
        Include the Karta and every member who should appear in the affidavit table.
      </p>
      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <div>
              <Label>Member Name</Label>
              <Input {...register(`members.${index}.name`)} />
            </div>
            <div>
              <Label>Father's Name</Label>
              <Input {...register(`members.${index}.fatherName`)} />
            </div>
            <div>
              <Label>Status / Relation</Label>
              <Input {...register(`members.${index}.status`)} placeholder="Karta, Member (Wife), Member (Children)" />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Textarea rows={2} {...register(`members.${index}.address`)} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={fields.length === 1}
              className="absolute right-2 top-2 text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
              aria-label={`Remove member ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        className="flex w-full items-center justify-center gap-2"
        onClick={() => append({ name: '', fatherName: '', address: '', status: 'Member' })}
      >
        <Plus className="h-4 w-4" /> Add HUF Member
      </Button>

      <h3 className="border-b pb-2 text-lg font-bold">Affidavit Execution</h3>
      <div className="max-w-sm">
        <Label>Affidavit Date</Label>
        <Input type="date" {...register('affidavitDate')} />
      </div>
    </div>
  );
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function valueOrBlank(value: unknown) {
  if (typeof value === 'number' && !Number.isFinite(value)) return '____________';

  const normalized = String(value ?? '').trim();
  return escapeHtml(normalized || '____________');
}

function formatDate(value: unknown, long = false) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '____________';

  const date = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(normalized);

  return new Intl.DateTimeFormat('en-IN', long
    ? { day: '2-digit', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount.toLocaleString('en-IN') : '____________';
}

const generateHTML = (data: any) => {
  const members = Array.isArray(data.members) ? data.members : [];
  const memberRows = (members.length ? members : [{}])
    .map(
      (member: any) => `
        <tr>
          <td style="border: 1px solid #000; padding: 8px; vertical-align: top;">${valueOrBlank(member.name)}</td>
          <td style="border: 1px solid #000; padding: 8px; vertical-align: top;">${valueOrBlank(member.fatherName)}</td>
          <td style="border: 1px solid #000; padding: 8px; vertical-align: top;">${valueOrBlank(member.address)}</td>
          <td style="border: 1px solid #000; padding: 8px; vertical-align: top;">${valueOrBlank(member.status)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 48px; color: #000; font-family: 'Times New Roman', serif; font-size: 16px; line-height: 1.75; text-align: justify;">
      <h1 style="margin: 0 0 36px; text-align: center; text-decoration: underline; font-size: 24px; letter-spacing: 1px;">AFFIDAVIT</h1>

      <p>
        I, <strong>${valueOrBlank(data.kartaName)}</strong>, S/o Sh. <strong>${valueOrBlank(data.kartaFatherName)}</strong>,
        aged <strong>${valueOrBlank(data.kartaAge)}</strong> years, resident of <strong>${valueOrBlank(data.kartaAddress)}</strong>,
        do hereby declare that I am the Karta of <strong>${valueOrBlank(data.hufName)}</strong>. The HUF consists of
        <strong>${valueOrBlank(data.coparcenerCount)}</strong> coparcener(s).
      </p>

      <p>
        That I received on behalf of the HUF a gift of Rs. <strong>${formatAmount(data.giftAmount)}/-</strong> by way of
        <strong>${valueOrBlank(data.giftMode)}</strong> from my <strong>${valueOrBlank(data.donorRelation)}</strong>,
        Sh. <strong>${valueOrBlank(data.donorName)}</strong>, on <strong>${formatDate(data.giftDate)}</strong>.
        This formed the corpus of the HUF.
      </p>

      <p>Full details are mentioned as follows:</p>

      <table style="width: 100%; margin: 20px 0 28px; border-collapse: collapse; table-layout: fixed; font-size: 13px;">
        <thead>
          <tr>
            <th style="width: 20%; border: 1px solid #000; padding: 8px; text-align: left;">NAME</th>
            <th style="width: 22%; border: 1px solid #000; padding: 8px; text-align: left;">FATHER'S NAME</th>
            <th style="width: 38%; border: 1px solid #000; padding: 8px; text-align: left;">ADDRESS</th>
            <th style="width: 20%; border: 1px solid #000; padding: 8px; text-align: left;">STATUS</th>
          </tr>
        </thead>
        <tbody>${memberRows}</tbody>
      </table>

      <p>That the above said HUF is in existence since <strong>${formatDate(data.existenceDate, true)}</strong>.</p>
      <p>That the above statements are true to the best of my knowledge and belief.</p>

      <div style="display: flex; justify-content: space-between; gap: 32px; margin-top: 72px;">
        <div><strong>DATE:</strong> ${formatDate(data.affidavitDate)}</div>
        <div style="min-width: 240px; text-align: center;">
          <div style="margin-bottom: 48px;"><strong>Signature:</strong></div>
          <div><strong>(${valueOrBlank(data.kartaName)})</strong></div>
          <div>Karta</div>
        </div>
      </div>
    </div>
  `;
};

const generateMarkdown = (data: any) => `# AFFIDAVIT

I, ${data.kartaName || '____________'}, declare that I am the Karta of ${data.hufName || '____________'}.

The initial corpus gift was received from ${data.donorName || '____________'} on ${data.giftDate || '____________'}.
`;

export const HufAffidavitGenerator: DocumentGeneratorConfig = {
  id: 'huf-affidavit',
  title: 'HUF Affidavit',
  description: 'Create a Karta affidavit recording HUF formation, initial corpus gift, and family members.',
  icon: <Users className="h-5 w-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
