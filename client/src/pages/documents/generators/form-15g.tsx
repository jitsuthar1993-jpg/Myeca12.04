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
  status: z.string().default('Individual'),
  previousYear: z.string().default('2025-2026'),
  residentialStatus: z.string().default('Resident'),
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
  status: 'Individual',
  previousYear: '2025-2026',
  residentialStatus: 'Resident',
  address: '',
  email: '',
  mobile: '',
  assessedToTax: 'No',
  estIncomeDecl: 50000,
  estTotalIncome: 240000,
  place: 'Mumbai',
  date: new Date().toISOString().split('T')[0],
};

const FormComponent = ({ register, errors, control }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold border-b pb-2">Assessee Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full Name / Declarant</Label><Input {...register('fullName')} /></div>
        <div><Label>PAN of Assessee</Label><Input {...register('pan')} placeholder="ABCDE1234F" className="uppercase" /></div>
        <div>
          <Label>Status</Label>
          <Input {...register('status')} disabled />
        </div>
        <div>
          <Label>Previous Year</Label>
          <Input {...register('previousYear')} />
        </div>
        <div className="col-span-2"><Label>Complete Address</Label><Input {...register('address')} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div><Label>Email</Label><Input type="email" {...register('email')} /></div>
        <div><Label>Mobile / Phone</Label><Input {...register('mobile')} /></div>
      </div>

      <h3 className="text-lg font-bold border-b pb-2 mt-6">Tax Status & Income</h3>
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
      <h2 style="margin: 0; font-size: 16px;">FORM NO. 15G</h2>
      <p style="margin: 5px 0 0 0;">[See section 197A(1), 197A(1A) and rule 29C]</p>
      <p style="margin: 5px 0 0 0; font-weight: bold; text-decoration: underline;">
        Declaration under section 197A(1) and section 197A(1A) to be made by an individual or a person (not being a company or firm) claiming certain incomes without deduction of tax.
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
          2. PAN of the Assessee<br/>
          <strong>${(data.pan || '').toUpperCase()}</strong>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #000; padding: 5px; width: 25%;">
          3. Status<br/>
          <strong>${data.status}</strong>
        </td>
        <td style="border: 1px solid #000; padding: 5px; width: 25%;">
          4. Previous year (P.Y.)<br/>
          <strong>${data.previousYear}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px; width: 50%;">
          5. Residential Status<br/>
          <strong>${data.residentialStatus}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          6/7/8/9/10/11/12. Address details:<br/>
          <strong>${data.address}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          13. Email ID<br/>
          <strong>${data.email}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          14. Telephone No. (with STD Code) and Mobile No.<br/>
          <strong>${data.mobile}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          15. (a) Whether assessed to tax under the Income-tax Act, 1961: <strong>${data.assessedToTax}</strong><br/>
          (b) If yes, latest assessment year for which assessed: <strong>___________</strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          16. Estimated income for which this declaration is made<br/>
          <strong>\u20B9 ${Number(data.estIncomeDecl).toLocaleString('en-IN')}</strong>
        </td>
        <td colspan="2" style="border: 1px solid #000; padding: 5px;">
          17. Estimated total income of the P.Y. in which income mentioned in column 16 to be included<br/>
          <strong>\u20B9 ${Number(data.estTotalIncome).toLocaleString('en-IN')}</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          18. Details of Form No. 15G other than this form filed during the previous year, if any<br/>
          Total No. of Form No. 15G filed: <strong>_____</strong> &nbsp; Aggregate amount of income for which Form 15G filed: <strong>__________</strong>
        </td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #000; padding: 5px;">
          19. Details of income for which the declaration is filed<br/>
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
        I/We <strong>${data.fullName}</strong> do hereby declare that to the best of my/our knowledge and belief what is stated above is correct, complete and is truly stated. I/We declare that the incomes referred to in this form are not includible in the total income of any other person under sections 60 to 64 of the Income-tax Act, 1961. I/We further declare that my/our estimated total income of the previous year <strong>${data.previousYear}</strong> will be nil.
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

const generateMarkdown = (data: any) => `# Form 15G generated via MyeCA.in`;

export const Form15gGenerator: DocumentGeneratorConfig = {
  id: 'form-15g',
  title: 'Form 15G (Tax Exemption)',
  description: 'Submit this PF/EPF/FD tax exemption declaration for individuals under 60 years of age with total income below minimum exemption limits.',
  icon: <FileText className="w-5 h-5" />,
  schema,
  defaultValues,
  generateHTML,
  generateMarkdown,
  FormComponent,
};
