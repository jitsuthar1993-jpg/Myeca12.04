import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  executionPlace: z.string().min(2, 'Place is required'),
  executionDate: z.string().min(1, 'Date is required'),
  landlordName: z.string().min(2, 'Landlord name required'),
  landlordPan: z.string().optional(),
  landlordAddress: z.string().min(5, 'Landlord address required'),
  tenantName: z.string().min(2, 'Tenant name/company required'),
  tenantPanGst: z.string().optional(),
  tenantAddress: z.string().min(5, 'Tenant address required'),
  propertyDetails: z.string().min(10, 'Details of commercial property required'),
  leaseTermMonths: z.number().min(1, 'Lease term required'),
  lockInPeriod: z.number().min(0, 'Lock-in period required'),
  monthlyRent: z.number().min(1, 'Rent amount must be > 0'),
  securityDeposit: z.number().min(0, 'Security deposit required'),
  rentCommencementDate: z.string().min(1, 'Commencement date required'),
});

const defaultValues = {
  executionPlace: 'Mumbai',
  executionDate: new Date().toISOString().split('T')[0],
  landlordName: '',
  landlordPan: '',
  landlordAddress: '',
  tenantName: '',
  tenantPanGst: '',
  tenantAddress: '',
  propertyDetails: 'Office Premise No. 101, First Floor, Tech Park, IT Road, Mumbai, measuring approx. 1200 Sq. Ft. super built-up area.',
  leaseTermMonths: 36,
  lockInPeriod: 12,
  monthlyRent: 50000,
  securityDeposit: 300000,
  rentCommencementDate: new Date().toISOString().split('T')[0],
};

const FormComponent = ({ register, errors }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Agreement Header</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place of Execution</Label><Input {...register('executionPlace')} /></div>
        <div><Label>Date of Execution</Label><Input type="date" {...register('executionDate')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Lessor (Landlord) Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Lessor Name</Label><Input {...register('landlordName')} /></div>
        <div><Label>Lessor PAN / GST</Label><Input {...register('landlordPan')} placeholder="ABCDE1234F" className="uppercase" /></div>
        <div className="col-span-2"><Label>Lessor Address</Label><Textarea rows={2} {...register('landlordAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Lessee (Tenant) Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Lessee Name / Company</Label><Input {...register('tenantName')} /></div>
        <div><Label>Lessee PAN / GSTIN</Label><Input {...register('tenantPanGst')} className="uppercase" /></div>
        <div className="col-span-2"><Label>Lessee Address</Label><Textarea rows={2} {...register('tenantAddress')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Premises & Commercials</h3>
      <div className="grid grid-cols-1 gap-4 text-sm">
        <div><Label>Complete Property Details</Label><Textarea rows={3} {...register('propertyDetails')} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Lease Term (in Months)</Label><Input type="number" {...register('leaseTermMonths', { valueAsNumber: true })} /></div>
          <div><Label>Lock-in Period (in Months)</Label><Input type="number" {...register('lockInPeriod', { valueAsNumber: true })} /></div>
          <div><Label>Monthly Rent (\u20B9) &lsqb;excl. GST&rsqb;</Label><Input type="number" {...register('monthlyRent', { valueAsNumber: true })} /></div>
          <div><Label>Security Deposit (\u20B9)</Label><Input type="number" {...register('securityDeposit', { valueAsNumber: true })} /></div>
          <div><Label>Rent Commencement Date</Label><Input type="date" {...register('rentCommencementDate')} /></div>
        </div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: 'Times New Roman', serif; font-size: 15px; color: #000; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; text-align: justify;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 22px; text-decoration: underline; text-transform: uppercase;">COMMERCIAL LEASE AGREEMENT</h1>
    </div>

    <p style="text-indent: 40px;">
      This Commercial Lease Agreement (the "Agreement") is made and executed at <strong>${data.executionPlace}</strong> on this <strong>${data.executionDate.split('-').reverse().join('/')}</strong>, by and between:
    </p>

    <p style="margin-top: 20px;">
      <strong>${data.landlordName || '____________'}</strong>, having PAN/GSTIN '${data.landlordPan || 'N/A'}' and residing/operating at <strong>${data.landlordAddress || '____________'}</strong> (hereinafter referred to as the <strong>"Lessor"</strong>, which expression shall, unless repugnant to the context, include their heirs, legal representatives, successors, and assigns) of the <strong>FIRST PART</strong>.
    </p>

    <div style="text-align: center; font-weight: bold; margin: 20px 0;">AND</div>

    <p>
      <strong>${data.tenantName || '____________'}</strong>, having PAN/GSTIN '${data.tenantPanGst || 'N/A'}' and residing/operating at <strong>${data.tenantAddress || '____________'}</strong> (hereinafter referred to as the <strong>"Lessee"</strong>, which expression shall, unless repugnant to the context, include its successors, administrators, and permitted assigns) of the <strong>SECOND PART</strong>.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">1. DEMISED PREMISES</h3>
    <p>
      The Lessor is the absolute owner and in lawful possession of the commercial space described as: <em>${data.propertyDetails}</em> (hereinafter referred to as the "Demised Premises"). The Lessor has agreed to let out, and the Lessee has agreed to take on lease, the said Demised Premises for commercial/business purposes.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">2. TERM AND LOCK-IN PERIOD</h3>
    <p>
      The lease shall be for a period of <strong>${data.leaseTermMonths} months</strong> commencing from <strong>${data.rentCommencementDate.split('-').reverse().join('/')}</strong>. Both parties agree to a strictly binding <strong>lock-in period of ${data.lockInPeriod} months</strong>. During this lock-in period, neither party can terminate this Agreement except for breach of terms. If the Lessee vacates during the lock-in period, they shall be liable to pay rent for the unexpired lock-in period.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">3. MONTHLY RENT & TAXES</h3>
    <p>
      The Lessee shall pay a monthly rent of <strong>\u20B9 ${Number(data.monthlyRent).toLocaleString('en-IN')}/-</strong> to the Lessor. The rent shall be paid on or before the 7th day of each calendar month. The rent is exclusive of Goods and Services Tax (GST). If applicable, GST shall be paid extra by the Lessee as per prevalent rates. TDS, if applicable under the Income Tax Act, 1961, shall be deducted by the Lessee before payment of rent, and strict TDS certificates shall be provided to the Lessor.
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">4. SECURITY DEPOSIT</h3>
    <p>
      The Lessee has paid an interest-free refundable Security Deposit of <strong>\u20B9 ${Number(data.securityDeposit).toLocaleString('en-IN')}/-</strong> to the Lessor. This deposit shall be refunded to the Lessee simultaneously upon vacant handover of the Demised Premises, subject to deductions for unpaid rent, electricity bills, or damages to the property (excluding normal wear and tear).
    </p>

    <h3 style="margin-top: 30px; border-bottom: 1px solid #000; padding-bottom: 5px;">5. PERMITTED USE & MAINTENANCE</h3>
    <p>
      The Lessee shall use the Demised Premises exclusively for commercial/office purposes. The Lessee shall not sublet, assign, or part with the possession of the Demised Premises without the prior written consent of the Lessor. The Lessee shall bear all electricity and regular maintenance charges during the tenure of the lease.
    </p>

    <p style="margin-top: 40px;">
      IN WITNESS WHEREOF, the parties hereto have set their respective hands to this Agreement on the day, month, and year first above written.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
      <div style="width: 45%;">
        <strong>LESSOR</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.landlordName}
      </div>
      <div style="width: 45%;">
        <strong>LESSEE</strong><br /><br /><br />
        ___________________________<br />
        Name: ${data.tenantName}
      </div>
    </div>

    <div style="margin-top: 60px;">
      <p style="font-weight: bold;">WITNESSES:</p>
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <div style="width: 45%;">
          1. Signature: ________________<br /><br />
          Name & Address: ________________<br />
          ________________________________
        </div>
        <div style="width: 45%;">
          2. Signature: ________________<br /><br />
          Name & Address: ________________<br />
          ________________________________
        </div>
      </div>
    </div>

  </div>
`;

const generateMarkdown = (data: any) => `# Commercial Lease Agreement generated via MyeCA.in`;

export const CommercialLeaseGenerator: DocumentGeneratorConfig = {
  id: 'rent-agreement-comm',
  title: 'Commercial Lease Agreement',
  description: 'Comprehensive lease for office spaces or shops with provisions for lock-in periods, maintenance, and GST billing.',
  icon: <Building2 className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
