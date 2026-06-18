import { z } from 'zod';
import { ReactNode } from 'react';
import type {
  FinancialDocumentDraft,
  FinancialDocumentKind,
} from '../financial';

export type DocumentExportFormat = 'pdf' | 'word';
export type LegacyDocumentExportFormat = DocumentExportFormat | 'html' | 'markdown';

export interface DocumentGeneratorSEO {
  keywords: string[];
  requiredInputs: string[];
  limitations: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export interface DocumentGeneratorConfig {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  schema: z.ZodSchema;
  defaultValues: Record<string, any>;
  generateHTML: (data: any) => string;
  generateMarkdown: (data: any) => string;
  exportFormats?: LegacyDocumentExportFormat[];
  complianceNotice?: string;
  conversionTargets?: Array<{ kind: FinancialDocumentKind; label: string }>;
  relatedLinks?: Array<{ href: string; label: string }>;
  buildFinancialDraft?: (data: any, existingId?: string | null) => FinancialDocumentDraft;
  applyFinancialDraft?: (draft: FinancialDocumentDraft) => Record<string, unknown>;
  exportBlockReason?: (data: any) => string | null;
  seo?: DocumentGeneratorSEO;
  FormComponent: React.FC<{
    register: any;
    errors: any;
    control: any;
    watch: any;
  }>;
}
