import { z } from 'zod';
import { BarChart3 } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  reportTitle: z.string().min(2, 'Report Title required'),
  reportDate: z.string().min(1, 'Date required'),
  preparedBy: z.string().min(2, 'Prepared by required'),
  preparedFor: z.string().min(2, 'Prepared for required'),
  executiveSummary: z.string().min(10, 'Executive summary required'),
  keyInsights: z.string().min(5, 'Key insights required'),
  revenueAmount: z.number().min(0, 'Revenue required'),
  expenseAmount: z.number().min(0, 'Expenses required'),
  growthRate: z.number().optional(),
});

const defaultValues = {
  reportTitle: 'Q3 Financial & Analytics Performance Review',
  reportDate: new Date().toISOString().split('T')[0],
  preparedBy: 'Financial Analysis Team, MyeCA',
  preparedFor: 'Board of Directors, TechSolutions Pvt. Ltd.',
  executiveSummary: 'This quarter saw significant growth in recurring revenue driven by successful product launches in the APAC region. Operational expenses were optimized leading to a higher EBITDA margin than initially projected.',
  keyInsights: '- 15% increase in customer lifetime value (CLV)n- Customer Acquisition Cost (CAC) reduced by 8%n- Net Promoter Score up by 6 points',
  revenueAmount: 12500000,
  expenseAmount: 8400000,
  growthRate: 18.5,
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Report Metadata</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label>Report Title</Label><Input {...register('reportTitle')} /></div>
        <div><Label>Report Date</Label><Input type="date" {...register('reportDate')} /></div>
        <div><Label>Growth Rate y-o-y (%)</Label><Input type="number" {...register('growthRate', { valueAsNumber: true })} /></div>
        <div className="col-span-2"><Label>Prepared For (Client/Management)</Label><Input {...register('preparedFor')} /></div>
        <div className="col-span-2"><Label>Prepared By (Author/Team)</Label><Input {...register('preparedBy')} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Financial Metrics Snapshot</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Total Revenue For Period (\u20B9)</Label><Input type="number" {...register('revenueAmount', { valueAsNumber: true })} /></div>
        <div><Label>Total Expenses For Period (\u20B9)</Label><Input type="number" {...register('expenseAmount', { valueAsNumber: true })} /></div>
      </div>
      <h3 className="text-lg font-bold border-b pb-2 mt-6">Insights & Summary</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Executive Summary</Label><Textarea rows={3} {...register('executiveSummary')} /></div>
        <div><Label>Key Quantitative Insights (List format)</Label><Textarea rows={3} {...register('keyInsights')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #333; max-width: 800px; margin: 0 auto; padding: 40px;">
    
    <div style="border-bottom: 3px solid #1f2937; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px;">${data.reportTitle}</h1>
      <div style="display: flex; justify-content: space-between; color: #6b7280; font-size: 13px;">
        <span style="font-weight: bold;">Date: ${data.reportDate.split('-').reverse().join('/')}</span>
        <span>CONFIDENTIAL DRAFT</span>
      </div>
    </div>

    <div style="display: flex; gap: 20px; margin-bottom: 40px; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="flex: 1;">
        <strong style="color: #111827; display: block; margin-bottom: 5px;">Prepared For:</strong>
        <p style="margin: 0; color: #4b5563;">${data.preparedFor}</p>
      </div>
      <div style="flex: 1;">
        <strong style="color: #111827; display: block; margin-bottom: 5px;">Prepared By:</strong>
        <p style="margin: 0; color: #4b5563;">${data.preparedBy}</p>
      </div>
    </div>

    <h2 style="color: #1f2937; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px;">Executive Summary</h2>
    <p style="line-height: 1.7; text-align: justify; margin-bottom: 30px; font-size: 15px;">
      ${data.executiveSummary}
    </p>

    <h2 style="color: #1f2937; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 20px;">Financial Snapshot</h2>
    <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 40px;">
      
      <div style="flex: 1; background-color: #ecfdf5; padding: 20px; border-radius: 8px; border: 1px solid #d1fae5; text-align: center;">
        <span style="display: block; color: #065f46; font-size: 13px; font-weight: bold; text-transform: uppercase;">Total Revenue</span>
        <span style="display: block; color: #059669; font-size: 24px; font-weight: 800; margin-top: 10px;">\u20B9 ${Number(data.revenueAmount).toLocaleString('en-IN')}</span>
      </div>

      <div style="flex: 1; background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fee2e2; text-align: center;">
        <span style="display: block; color: #991b1b; font-size: 13px; font-weight: bold; text-transform: uppercase;">Total Expenses</span>
        <span style="display: block; color: #dc2626; font-size: 24px; font-weight: 800; margin-top: 10px;">\u20B9 ${Number(data.expenseAmount).toLocaleString('en-IN')}</span>
      </div>
      
      <div style="flex: 1; background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #dbeafe; text-align: center;">
        <span style="display: block; color: #1e40af; font-size: 13px; font-weight: bold; text-transform: uppercase;">Net Income</span>
        <span style="display: block; color: #2563eb; font-size: 24px; font-weight: 800; margin-top: 10px;">\u20B9 ${(Number(data.revenueAmount) - Number(data.expenseAmount)).toLocaleString('en-IN')}</span>
      </div>

    </div>

    <h2 style="color: #1f2937; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 20px;">Key Analytics & Insights</h2>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8;">
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        ${data.keyInsights.split('n').map((item: string) => `<li style="margin-bottom: 10px;">${item.replace(/^- /, '')}</li>`).join('')}
        ${data.growthRate ? `<li style="margin-bottom: 10px; font-weight: bold; color: #047857;">Overall Growth Rate (Y-o-Y): ${data.growthRate}%</li>` : ''}
      </ul>
    </div>

    <div style="margin-top: 60px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px;">
      This report was algorithmically generated via MyeCA.in analytical tools. The information is based on user-provided data and should be independently verified before corporate filing.
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Business Report generated via MyeCA.in`;

export const ReportGenerator: DocumentGeneratorConfig = {
  id: 'report',
  title: 'Business & Analytics Report',
  description: 'Generate polished corporate reports with data visualizations, executive summaries, and structured layouts.',
  icon: <BarChart3 className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
