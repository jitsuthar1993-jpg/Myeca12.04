import { z } from 'zod';
import { FileText } from 'lucide-react';
import { DocumentGeneratorConfig } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  pan: z.string().length(10, 'PAN must be 10 characters'),
  dob: z.string().min(1, 'Date of Birth is required'),
  previousYear: z.string().default('2025-2026'),
  address: z.string().min(5, 'Address is required'),
  email: z.string().email('Valid email required'),
  mobile: z.string().min(10, 'Mobile is required'),
  assessedToTax: z.enum(['Yes', 'No']),
  estIncomeDecl: z.number().min(0, 'Income >= 0'),
  estTotalIncome: z.number().min(0, 'Total Income >= 0'),
  place: z.string().min(2, 'Place is required'),
  date: z.string().min(1, 'Date is required'),
});

const defaultValues = {
  fullName: '',
  pan: '',
  dob: '',
  previousYear: '2025-2026',
  address: '',
  email: '',
  mobile: '',
  assessedToTax: 'No',
  estIncomeDecl: 60000,
  estTotalIncome: 250000,
  place: 'Delhi',
  date: new Date().toISOString().split('T')[0],
};

const FormComponent = ({ register, errors, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Senior Citizen (Assessee) Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name</Label><Input {...register('fullName')} /></div>
        <div><Label>PAN</Label><Input {...register('pan')} placeholder="ABCDE1234F" className="uppercase" /></div>
        <div><Label>Date of Birth</Label><Input type="date" {...register('dob')} /></div>
        <div><Label>Previous Year (P.Y.)</Label><Input {...register('previousYear')} /></div>
        <div className="col-span-2"><Label>Complete Address</Label><Input {...register('address')} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div><Label>Email</Label><Input type="email" {...register('email')} /></div>
        <div><Label>Mobile / Phone</Label><Input {...register('mobile')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Tax Status & Income Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Whether assessed to tax under Income Tax Act, 1961?</Label>
          <Controller
            control={control}
            name="assessedToTax"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Yes/No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div><Label>Est. Income for this Declaration (\u20B9)</Label><Input type="number" {...register('estIncomeDecl', { valueAsNumber: true })} /></div>
        <div><Label>Total Est. Income (inc. this declaration) (\u20B9)</Label><Input type="number" {...register('estTotalIncome', { valueAsNumber: true })} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Verification Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Place</Label><Input {...register('place')} /></div>
        <div><Label>Date</Label><Input type="date" {...register('date')} /></div>
      </div>
    </div>
  );
};

const generateHTML = (data: any) => `
  <div style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; max-width: 800px; margin: 0 auto; padding: 20px;">
    
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 16px;">FORM NO. 15H</h2>
      <p style="margin: 5px 0 0 0;">[See section 197A(1C) and rule 29C]</p>
      <p style="margin: 5px 0 0 0; font-weight: bold; text-decoration: underline;">
        Declaration under section 197A(1C) to be made by an individual who is of the age of sixty years or more claiming certain incomes without deduction of tax.
      </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;">
      <tr>
        <td colspan="4" style="background-color: #f0f0f0; font-weight: bold; border: 1px solid #000; padding: 5px; text-align: center;">
          PART I
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #000; padding: 5px; width: 50%;">
          1. Name of Assessee (Declarant)<br/>
          <strong>${data.fullName}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px; width: 50%;">
          2. Permanent Account Number (PAN)<br/>
          <strong>${(data.pan || '').toUpperCase()}</strong>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px; width: 25%;">
          3. Date of Birth (DD/MM/YYYY)<br/>
          <strong>${data.dob.split('-').reverse().join('/')}</strong>
        </td>
        <td style="border: 1px solid #000; padding: 5px; width: 25%;">
          4. Previous year (P.Y.)<br/>
          <strong>${data.previousYear}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px; width: 50%;">
          5/6/7/8/9/10/11. Complete Address<br/>
          <strong>${data.address}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          12. Email ID<br/>
          <strong>${data.email}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          13. Telephone No. (with STD Code) and Mobile No.<br/>
          <strong>${data.mobile}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          14. (a) Whether assessed to tax under the Income-tax Act, 1961: <strong>${data.assessedToTax}</strong><br/>
          (b) If yes, latest assessment year for which assessed: <strong>___________</strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          15. Estimated income for which this declaration is made<br/>
          <strong>\u20B9 ${Number(data.estIncomeDecl).toLocaleString('en-IN')}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          16. Estimated total income of the P.Y. in which income mentioned in column 15 to be included<br/>
          <strong>\u20B9 ${Number(data.estTotalIncome).toLocaleString('en-IN')}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          17. Details of Form No. 15H other than this form filed during the previous year, if any<br/>
          Total No. of Form No. 15H filed: <strong>_____</strong> &nbsp; Aggregate amount of income for which Form 15H filed: <strong>__________</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          18. Details of income for which the declaration is filed<br/>
          <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
            <tr>
              <th style="border: 1px solid #000; padding: 2px;">Sl. No.</th>
              <th style="border: 1px solid #000; padding: 2px;">Identification number of relevant investment/account, etc.</th>
              <th style="border: 1px solid #000; padding: 2px;">Nature of income</th>
              <th style="border: 1px solid #000; padding: 2px;">Section under which tax is deductible</th>
              <th style="border: 1px solid #000; padding: 2px;">Amount of income</th>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 10px; text-align: center;">1</td>
              <td style="border: 1px solid #000; padding: 10px;"></td>
              <td style="border: 1px solid #000; padding: 10px;"></td>
              <td style="border: 1px solid #000; padding: 10px;"></td>
              <td style="border: 1px solid #000; padding: 10px;">${data.estIncomeDecl}</td>
            </tr>
            <tr><td colspan="5" style="border: 1px solid #000; padding: 8px;"></td></tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: right; margin-top: 30px;">
      <p style="margin-bottom: 50px;">________________________</p>
      <p style="margin: 0; font-weight: bold;">Signature of the Declarant</p>
    </div>

    <div style="margin-top: 30px;">
      <h3 style="text-align: center; text-decoration: underline; margin-bottom: 10px;">DECLARATION/VERIFICATION</h3>
      <p style="text-align: justify; text-indent: 40px;">
        I/We <strong>${data.fullName}</strong> do hereby declare that I am resident in India within the meaning of section 6 of the Income-tax Act, 1961. I also hereby declare that to the best of my knowledge and belief what is stated above is correct, complete and is truly stated and that the incomes referred to in this form are not includible in the total income of any other person under sections 60 to 64 of the Income-tax Act, 1961. I further declare that my estimated total income of the previous year <strong>${data.previousYear}</strong> will be nil.
      </p>
      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div>
          <p>Place: <strong>${data.place}</strong></p>
          <p>Date: <strong>${data.date}</strong></p>
        </div>
        <div style="text-align: right;">
          <p style="margin-bottom: 50px;">________________________</p>
          <p style="margin: 0; font-weight: bold;">Signature of the Declarant</p>
        </div>
      </div>
    </div>
  </div>
`;

const generateMarkdown = (data: any) => `# Form 15H generated via MyeCA.in`;

export const Form15hGenerator: DocumentGeneratorConfig = {
  id: 'form-15h',
  title: 'Form 15H (Senior Citizen TDS)',
  description: 'Self-declaration for individuals aged 60+ (Senior Citizens) to claim nil TDS deduction on interest income from banks and post offices.',
  icon: <FileText className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
