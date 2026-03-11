import { z } from 'zod';
import { ReactNode } from 'react';

export interface DocumentGeneratorConfig {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  schema: z.ZodSchema;
  defaultValues: Record<string, any>;
  generateHTML: (data: any) => string;
  generateMarkdown: (data: any) => string;
  FormComponent: React.FC<{
    register: any;
    errors: any;
    control: any;
    watch: any;
  }>;
}
