import { z } from 'zod';
import { FileText } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const rentSchema = z.object({
  executionPlace: z.string().min(2, 'Place of execution is required'),
  executionDate: z.string().min(1, 'Date is required'),
  landlord: z.object({
    name: z.string().min(2, 'Landlord name is required'),
    age: z.string().optional(),
    fatherName: z.string().optional(),
    address: z.string().min(5, 'Landlord address is required'),
    pan: z.string().optional(),
  }),
  tenant: z.object({
    name: z.string().min(2, 'Tenant name is required'),
    age: z.string().optional(),
    fatherName: z.string().optional(),
    address: z.string().min(5, 'Tenant permanent address is required'),
  }),
  property: z.object({
    address: z.string().min(5, 'Property address is required'),
    description: z.string().min(5, 'Property description is required'),
    fixtures: z.string().optional(),
  }),
  terms: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    durationMonths: z.number().min(1, 'Duration >= 1'),
    monthlyRent: z.number().min(1, 'Rent > 0'),
    securityDeposit: z.number().min(0),
    noticePeriodDays: z.number().min(0),
    rentIncreasePercent: z.number().min(0).optional(),
  }),
});

const defaultValues = {
  executionPlace: 'Mumbai, Maharashtra',
  executionDate: new Date().toISOString().split('T')[0],
  landlord: { name: '', age: '', fatherName: '', address: '', pan: '' },
  tenant: { name: '', age: '', fatherName: '', address: '' },
  property: {
    address: '',
    description: '1 BHK Residential Apartment',
    fixtures: '2 Ceiling Fans, 1 Geyser, 3 Tube Lights',
  },
  terms: {
    startDate: new Date().toISOString().split('T')[0],
    durationMonths: 11,
    monthlyRent: 15000,
    securityDeposit: 50000,
    noticePeriodDays: 30,
    rentIncreasePercent: 5,
  },
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold border-b pb-2">Agreement Execution</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Place of Execution (City, State)</Label>
            <Input {...register('executionPlace')} placeholder="Mumbai, Maharashtra" />
          </div>
          <div>
            <Label>Execution Date</Label>
            <Input type="date" {...register('executionDate')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Landlord Details</h3>
          <div>
            <Label>Name</Label>
            <Input {...register('landlord.name')} />
          </div>
          <div>
            <Label>Father/Husband Name</Label>
            <Input {...register('landlord.fatherName')} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" {...register('landlord.age')} />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea {...register('landlord.address')} rows={3} />
          </div>
          <div>
            <Label>PAN (for TDS)</Label>
            <Input {...register('landlord.pan')} placeholder="ABCDE1234F" />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Tenant Details</h3>
          <div>
            <Label>Name</Label>
            <Input {...register('tenant.name')} />
          </div>
          <div>
            <Label>Father/Husband Name</Label>
            <Input {...register('tenant.fatherName')} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" {...register('tenant.age')} />
          </div>
          <div>
            <Label>Permanent Address</Label>
            <Textarea {...register('tenant.address')} rows={3} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Property Details</h3>
        <div>
          <Label>Property Address</Label>
          <Textarea {...register('property.address')} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Description</Label>
            <Input {...register('property.description')} placeholder="e.g. 1 BHK on 2nd Floor" />
          </div>
          <div>
            <Label>Fittings & Fixtures</Label>
            <Input {...register('property.fixtures')} placeholder="Fans, Lights, etc." />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Lease Terms</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input type="date" {...register('terms.startDate')} />
          </div>
          <div>
            <Label>Duration (Months)</Label>
            <Input type="number" {...register('terms.durationMonths', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Notice Period (Days)</Label>
            <Input type="number" {...register('terms.noticePeriodDays', { valueAsNumber: true })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Monthly Rent (\u20B9)</Label>
            <Input type="number" {...register('terms.monthlyRent', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Security Deposit (\u20B9)</Label>
            <Input type="number" {...register('terms.securityDeposit', { valueAsNumber: true })} />
          </div>
          <div>
            <Label>Annual Increase (%)</Label>
            <Input
              type="number"
              {...register('terms.rentIncreasePercent', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Utilities for formatting numbers to words (simplified for template)
function numToWords(amount: number) {
  // A simplistic formatter or external library can go here. Returning string for now.
  return `Rupees ${amount.toLocaleString('en-IN')}`;
}

const generateHTML = (data: any) => {
  return `
    <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.6; text-align: justify; padding: 40px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="text-decoration: underline; text-transform: uppercase;">Rent Agreement</h1>
      </div>

      <p style="text-indent: 50px;">This Rent Agreement is made and executed at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate}</strong>.</p>
      
      <div style="text-align: center; font-weight: bold; margin: 20px 0;">BETWEEN</div>

      <p>
        <strong>${data.landlord?.name || '________________'}</strong>, aged about <strong>${data.landlord?.age || '____'}</strong> years, 
        ${data.landlord?.fatherName ? 'D/S/W of <strong>' + data.landlord.fatherName + '</strong>, ' : ''}
        residing at <strong>${data.landlord?.address || '________________'}</strong>
        ${data.landlord?.pan ? '(PAN: <strong>' + data.landlord.pan + '</strong>)' : ''}
        (Hereinafter called the <strong>"LANDLORD/LICENSOR"</strong> which expression shall, unless repugnant to the context and meaning, include his/her heirs, successors, legal representatives and assigns) of the Let-out premises of the <strong>ONE PART</strong>.
      </p>

      <div style="text-align: center; font-weight: bold; margin: 20px 0;">AND</div>

      <p>
        <strong>${data.tenant?.name || '________________'}</strong>, aged about <strong>${data.tenant?.age || '____'}</strong> years,
        ${data.tenant?.fatherName ? 'D/S/W of <strong>' + data.tenant.fatherName + '</strong>, ' : ''}
        permanent resident of <strong>${data.tenant?.address || '________________'}</strong>
        (Hereinafter called the <strong>"TENANT/LICENSEE"</strong> which expression shall, unless repugnant to the context and meaning, include his/her heirs, successors, legal representatives and assigns) of the Let-out premises of the <strong>SECOND PART</strong>.
      </p>

      <p style="text-indent: 50px; margin-top: 30px;">
        WHEREAS the Landlord is the absolute owner and in possession of the property bearing No: <strong>${data.property?.address}</strong> comprising of <strong>${data.property?.description}</strong> with fittings and fixtures: ${data.property?.fixtures} (hereinafter referred to as the "Demised Premises").
      </p>
      
      <p style="text-indent: 50px;">
        AND WHEREAS the Tenant has approached the Landlord with a request to let out the Demised Premises for residential purposes, and the Landlord has agreed to do so on the following terms and conditions:
      </p>

      <div style="margin-top: 30px;">
        <h3 style="text-decoration: underline;">NOW THIS AGREEMENT WITNESSETH AS UNDER:</h3>
        <ol style="margin-left: 20px;">
          <li style="margin-bottom: 10px;">That the tenancy shall be for a period of <strong>${data.terms?.durationMonths} months</strong> commencing from <strong>${data.terms?.startDate}</strong>.</li>
          <li style="margin-bottom: 10px;">That the Tenant shall pay a monthly rent of <strong>\u20B9${data.terms?.monthlyRent}</strong> (${numToWords(data.terms?.monthlyRent || 0)} Only) excluding electricity and water charges, which shall be paid separately according to consumption.</li>
          <li style="margin-bottom: 10px;">That the rent shall be paid in advance on or before the 5th day of every English calendar month.</li>
          <li style="margin-bottom: 10px;">That the Tenant has paid an interest-free security deposit of <strong>\u20B9${data.terms?.securityDeposit}</strong> (${numToWords(data.terms?.securityDeposit || 0)} Only) to the Landlord at the time of execution of this agreement. The said security deposit shall be refunded upon vacating the premises, after adjusting any pending dues or damages caused to the property.</li>
          <li style="margin-bottom: 10px;">That in case the Tenant wishes to vacate the premises before the expiry of the agreement period, or the Landlord wishes to have the premises vacated, either party must serve a <strong>${data.terms?.noticePeriodDays}-day notice</strong> in writing.</li>
          <li style="margin-bottom: 10px;">That the Tenant shall use the premises solely for residential purposes and shall not sublet or part with the possession of the premises to any third party.</li>
          <li style="margin-bottom: 10px;">That the Tenant shall not make any structural additions or alterations to the premises without the prior written consent of the Landlord.</li>
          <li style="margin-bottom: 10px;">That upon the expiry of the lease or its termination, the Tenant shall hand over vacant and peaceful possession of the premises to the Landlord in the same condition as it was handed over, normal wear and tear excepted.</li>
        </ol>
      </div>

      <p style="margin-top: 50px;">
        IN WITNESS WHEREOF both the parties have signed this Agreement on the day, month, and year first written above in the presence of the following witnesses.
      </p>

      <div style="display: flex; justify-content: space-between; margin-top: 80px;">
        <div style="text-align: left;">
          <br /><strong>WITNESS 1:</strong><br /><br /><br />
          Sign: ___________________<br />
          Name: _________________<br />
          Address: _______________
        </div>
        <div style="text-align: right;">
          <br /><br /><br /><br />
          <strong>LANDLORD:</strong> ___________________<br />
          (${data.landlord?.name || 'Name'})
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 60px;">
        <div style="text-align: left;">
          <br /><strong>WITNESS 2:</strong><br /><br /><br />
          Sign: ___________________<br />
          Name: _________________<br />
          Address: _______________
        </div>
        <div style="text-align: right;">
          <br /><br /><br /><br />
          <strong>TENANT:</strong> ___________________<br />
          (${data.tenant?.name || 'Name'})
        </div>
      </div>

    </div>
  `;
};

const generateMarkdown = (data: any) => {
  return `# Rent Agreement nnGenerated via MyeCA.in`;
};

export const RentAgreement: DocumentGeneratorConfig = {
  id: 'rent-agreement-rc',
  title: 'Residential Rent Agreement',
  description: 'Standard 11-month residential lease.',
  icon: <FileText className="w-5 h-5" />,
  schema: rentSchema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
