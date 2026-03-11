import { z } from 'zod';
import { FileCheck } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  date: z.string().min(1, 'Date is required'),
  employeeName: z.string().min(2, 'Employee Name is required'),
  employeeId: z.string().optional(),
  managerName: z.string().min(2, 'Manager Name is required'),
  warningLevel: z.enum(['First Warning', 'Second Warning', 'Final Warning']),
  violationType: z.string().min(2, 'Type of violation required'),
  incidentDate: z.string().optional(),
  incidentDescription: z.string().min(10, 'Provide a detailed description'),
  improvementPlan: z.string().min(10, 'Improvement plan required'),
  consequences: z.string().optional(),
});

const defaultValues = {
  companyName: 'Acme Technologies Ltd.',
  date: new Date().toISOString().split('T')[0],
  employeeName: '',
  employeeId: 'EMP-',
  managerName: 'HR Department',
  warningLevel: 'First Warning',
  violationType: 'Unprofessional Conduct / Attendance',
  incidentDate: new Date().toISOString().split('T')[0],
  incidentDescription: 'Repeatedly arriving late to assigned shifts without prior intimation to the supervisor.',
  improvementPlan: 'Employee is required to strictly adhere to the company login times starting immediately.',
  consequences: 'Further violations will result in escalating disciplinary action, which may include suspension without pay or termination of employment.',
};

const FormComponent = ({ register, errors, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Notice Header</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Company Name</Label><Input {...register('companyName')} /></div>
        <div><Label>Date Issued</Label><Input type="date" {...register('date')} /></div>
        <div><Label>Employee Name</Label><Input {...register('employeeName')} /></div>
        <div><Label>Employee ID</Label><Input {...register('employeeId')} /></div>
        <div><Label>Issuing Manager / HR</Label><Input {...register('managerName')} /></div>
        <div>
          <Label>Warning Level</Label>
          <Controller
            control={control}
            name="warningLevel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Warning Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Warning">First Warning</SelectItem>
                  <SelectItem value="Second Warning">Second Warning</SelectItem>
                  <SelectItem value="Final Warning">Final Warning</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Violation Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Nature of Violation</Label><Input {...register('violationType')} /></div>
        <div><Label>Date of Incident(s)</Label><Input type="date" {...register('incidentDate')} /></div>
        <div className="col-span-2"><Label>Detailed Description</Label><Textarea rows={3} {...register('incidentDescription')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Corrective Action</h3>
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Expected Improvement Plan</Label><Textarea rows={2} {...register('improvementPlan')} /></div>
        <div><Label>Consequences of Non-Compliance</Label><Textarea rows={2} {...register('consequences')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #ddd; background: #fff;">
    
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #dc2626; padding-bottom: 20px;">
      <h1 style="color: #dc2626; margin: 0; font-size: 24px; text-transform: uppercase;">${data.companyName}</h1>
      <h2 style="margin: 10px 0 0 0; font-size: 20px; text-transform: uppercase; color: #1e293b;">EMPLOYEE WARNING NOTICE</h2>
      <p style="color: #dc2626; font-weight: bold; margin-top: 5px;">(${data.warningLevel.toUpperCase()})</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc; width: 25%; font-weight: bold; background: #f8fafc;">Employee Name:</td>
        <td style="padding: 8px; border: 1px solid #ccc; width: 25%;">${data.employeeName}</td>
        <td style="padding: 8px; border: 1px solid #ccc; width: 25%; font-weight: bold; background: #f8fafc;">Date:</td>
        <td style="padding: 8px; border: 1px solid #ccc; width: 25%;">${data.date.split('-').reverse().join('/')}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background: #f8fafc;">Employee ID:</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${data.employeeId}</td>
        <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background: #f8fafc;">Issued By:</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${data.managerName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold; background: #f8fafc;">Type of Violation:</td>
        <td colspan="3" style="padding: 8px; border: 1px solid #ccc;">${data.violationType}</td>
      </tr>
    </table>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #1e293b; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Description of Incident / Violation</h3>
      <p style="margin-top: 10px;"><strong>Date of Incident(s):</strong> ${data.incidentDate.split('-').reverse().join('/') || 'N/A'}</p>
      <div style="padding: 15px; background: #f9fafb; border: 1px solid #e2e8f0; border-radius: 4px; min-height: 80px;">
        ${data.incidentDescription}
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #1e293b; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Plan for Improvement</h3>
      <div style="padding: 15px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; min-height: 60px;">
        ${data.improvementPlan}
      </div>
    </div>

    <div style="margin-bottom: 40px;">
      <h3 style="color: #1e293b; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Consequences of Further Violations</h3>
      <div style="padding: 15px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; color: #991b1b; font-weight: 500;">
        ${data.consequences}
      </div>
    </div>

    <p style="margin-bottom: 40px; font-size: 13px; color: #666; font-style: italic;">
      By signing this document, the employee acknowledges that this warning has been received and discussed with management. Signing this document does not necessarily imply agreement with the violation, but rather acknowledges receipt of the notice.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
      <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; width: 40%;">
        <strong>${data.managerName}</strong><br/>
        <span style="font-size: 13px; color: #666;">Manager / HR Signature</span><br/>
        <span style="font-size: 13px;">Date: ______________</span>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; width: 40%;">
        <strong>${data.employeeName || 'Employee'}</strong><br/>
        <span style="font-size: 13px; color: #666;">Employee Signature</span><br/>
        <span style="font-size: 13px;">Date: ______________</span>
      </div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Warning Notice generated via MyeCA.in`;

export const WarningLetterGenerator: DocumentGeneratorConfig = {
  id: 'warning-letter',
  title: 'Employee Warning Notice',
  description: 'Formal documentation for performance issues or conduct violations to establish HR compliance trails.',
  icon: <FileCheck className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
