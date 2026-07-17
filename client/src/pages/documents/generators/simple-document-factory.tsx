import { z } from 'zod';
import { LucideIcon } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SimpleFieldType = 'text' | 'date' | 'email' | 'number' | 'textarea' | 'select';

interface SimpleField {
  name: string;
  label: string;
  required?: boolean;
  type?: SimpleFieldType;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  colSpan?: 1 | 2;
  options?: string[];
}

interface SimpleGeneratorDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  documentTitle: string;
  fields: SimpleField[];
  paragraphs: string[];
  sections?: Array<{ title: string; items: string[] }>;
  signatureLabel?: string;
  note?: string;
}

const formatDate = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const escapeHTML = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const createTokenRenderer = (fields: SimpleField[], data: Record<string, any>, markdown = false) => {
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));

  return (template: string) =>
    template.replace(/\{\{([^}]+)\}\}/g, (_, rawKey: string) => {
      const key = rawKey.trim();
      const field = fieldsByName.get(key);
      const rawValue = data[key] || '__________';
      const value = field?.type === 'date' ? formatDate(rawValue) : rawValue;
      return markdown ? String(value) : escapeHTML(value);
    });
};

const createSchema = (fields: SimpleField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    if (field.required) {
      shape[field.name] = z.string().min(1, `${field.label} is required`);
      return;
    }

    shape[field.name] = z.string().optional();
  });

  return z.object(shape);
};

const createDefaultValues = (fields: SimpleField[]) =>
  fields.reduce<Record<string, string>>((values, field) => {
    values[field.name] =
      field.defaultValue ?? (field.type === 'date' ? new Date().toISOString().split('T')[0] : '');
    return values;
  }, {});

export function createSimpleDocumentGenerator(
  definition: SimpleGeneratorDefinition
): DocumentGeneratorConfig {
  const schema = createSchema(definition.fields);
  const defaultValues = createDefaultValues(definition.fields);
  const Icon = definition.icon;

  const FormComponent = ({ register }: any) => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Document Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {definition.fields.map((field) => {
          const className = field.colSpan === 2 || field.type === 'textarea' ? 'col-span-2' : '';

          return (
            <div key={field.name} className={className}>
              <Label>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  rows={field.rows || 3}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                />
              ) : field.type === 'select' ? (
                <select
                  {...register(field.name)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const generateHTML = (data: any) => {
    const render = createTokenRenderer(definition.fields, data);
    const paragraphs = definition.paragraphs
      .map((paragraph) => `<p style="margin: 0 0 16px; text-align: justify;">${render(paragraph)}</p>`)
      .join('');
    const sections = (definition.sections || [])
      .map(
        (section) => `
          <h3 style="font-size: 15px; margin: 22px 0 10px; text-transform: uppercase;">${escapeHTML(section.title)}</h3>
          <ol style="margin: 0 0 18px 22px; padding: 0;">
            ${section.items.map((item) => `<li style="margin-bottom: 8px;">${render(item)}</li>`).join('')}
          </ol>
        `
      )
      .join('');

    return `
      <div class="mye-ca-document" style="font-family: 'Times New Roman', serif; font-size: 15px; color: #111; line-height: 1.75; max-width: 800px; margin: 0 auto; padding: 12px;">
        <div style="display: flex; justify-content: space-between; gap: 24px; margin-bottom: 34px;">
          <div>
            <div style="font-weight: bold;">From:</div>
            <div>${render('{{senderName}}')}</div>
            <div style="white-space: pre-line;">${render('{{senderAddress}}')}</div>
          </div>
          <div style="text-align: right;">
            <div>Date: <strong>${render('{{documentDate}}')}</strong></div>
            <div>Place: <strong>${render('{{place}}')}</strong></div>
          </div>
        </div>

        <h1 style="text-align: center; font-size: 20px; margin: 0 0 28px; text-transform: uppercase; text-decoration: underline;">
          ${escapeHTML(definition.documentTitle)}
        </h1>

        ${paragraphs}
        ${sections}

        ${
          definition.note
            ? `<p style="margin-top: 24px; font-size: 12px; color: #4b5563; border-top: 1px solid #d1d5db; padding-top: 12px;">${render(definition.note)}</p>`
            : ''
        }

        <div style="margin-top: 54px;">
          <div>Yours faithfully,</div>
          <div style="height: 58px;"></div>
          <div style="font-weight: bold;">${render('{{senderName}}')}</div>
          <div>${escapeHTML(definition.signatureLabel || 'Signature')}</div>
        </div>
      </div>
    `;
  };

  const generateMarkdown = (data: any) => {
    const render = createTokenRenderer(definition.fields, data, true);
    const sectionText = (definition.sections || [])
      .map(
        (section) =>
          `\n\n## ${section.title}\n${section.items
            .map((item, index) => `${index + 1}. ${render(item)}`)
            .join('\n')}`
      )
      .join('');

    return `# ${definition.documentTitle}\n\n${definition.paragraphs
      .map((paragraph) => render(paragraph))
      .join('\n\n')}${sectionText}`;
  };

  return {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    icon: <Icon className="w-5 h-5" />,
    schema,
    defaultValues,
    generateHTML,
    generateMarkdown,
    FormComponent,
  };
}
