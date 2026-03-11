import { 
  ITR1Schema,
  STATE_CODES,
  EMPLOYER_CATEGORIES,
  RETURN_FILE_SECTIONS
} from '@shared/itr-schemas';

export interface CompactFormData {
  filingType: string;
  itrForm: string;
  taxRegime: string;
  personalInfo: {
    pan: string;
    aadhaar: string;
    name: string;
    dob: string;
    mobile: string;
    email: string;
    address: string;
    pincode: string;
    state?: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    employerCategory?: string;
  };
  income: {
    salary: string;
    houseProperty: string;
    business: string;
    capitalGains: string;
    otherSources: string;
    tdsOnSalary: string;
    tdsOther: string;
    advanceTax: string;
  };
  deductions: {
    section80C: string;
    section80CCD: string;
    section80D: string;
    section80G: string;
    homeLoanInterest: string;
    section80DD: string;
  };
}

export class ITRGenerator {
  private assessmentYear = '2025';
  private formVersion = '1.0';

  generateITR1(data: CompactFormData): ITR1Schema {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeStr = currentDate.toTimeString().split(' ')[0];

    // Parse name to first and last name
    const nameParts = data.personalInfo.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const surName = nameParts.slice(1).join(' ') || nameParts[0] || '';

    // Get state code
    const stateCode = data.personalInfo.state ? STATE_CODES[data.personalInfo.state] || '10' : '10'; // Default to Delhi

    // Get employer category
    const employerCategory = data.personalInfo.employerCategory ? 
      EMPLOYER_CATEGORIES[data.personalInfo.employerCategory] || 'OTH' : 'OTH';

    // Calculate incomes
    const salaryIncome = parseFloat(data.income.salary) || 0;
    const housePropertyIncome = parseFloat(data.income.houseProperty) || 0;
    const otherSourcesIncome = parseFloat(data.income.otherSources) || 0;
    const businessIncome = parseFloat(data.income.business) || 0;
    const capitalGainsIncome = parseFloat(data.income.capitalGains) || 0;

    // Calculate deductions
    const section80C = parseFloat(data.deductions.section80C) || 0;
    const section80CCD = parseFloat(data.deductions.section80CCD) || 0;
    const section80D = parseFloat(data.deductions.section80D) || 0;
    const section80G = parseFloat(data.deductions.section80G) || 0;
    const section80DD = parseFloat(data.deductions.section80DD) || 0;
    const homeLoanInterest = parseFloat(data.deductions.homeLoanInterest) || 0;

    // Total deductions under Chapter VI-A
    const totalChapterVIADeductions = section80C + section80CCD + section80D + 
      section80G + section80DD;

    // Calculate gross total income
    const grossTotalIncome = salaryIncome + housePropertyIncome + 
      otherSourcesIncome + businessIncome + capitalGainsIncome;

    // Calculate total income after deductions
    const totalIncome = Math.max(0, grossTotalIncome - totalChapterVIADeductions - homeLoanInterest);

    // Calculate tax based on regime
    const taxData = this.calculateTax(totalIncome, data.taxRegime);

    // Calculate TDS and advance tax
    const tdsOnSalary = parseFloat(data.income.tdsOnSalary) || 0;
    const tdsOther = parseFloat(data.income.tdsOther) || 0;
    const advanceTax = parseFloat(data.income.advanceTax) || 0;
    const totalTaxPaid = tdsOnSalary + tdsOther + advanceTax;

    const itr1: ITR1Schema = {
      ITR: {
        ITR1: {
          CreationInfo: {
            SWVersionNo: '25.1.0',
            SWProgrammeName: 'MyeCA_ITR',
            JSONCreatedDate: dateStr,
            JSONCreationTime: timeStr,
            IntermediaryCity: 'Delhi',
            Digest: ''
          },
          Form_ITR1: {
            FormName: 'ITR-1',
            Description: 'For Individuals having Income from Salary, House Property & Other Sources',
            AssessmentYear: this.assessmentYear,
            SchemaVer: 'Ver1.0',
            FormVer: this.formVersion
          },
          PersonalInfo: {
            AssesseeName: {
              FirstName: firstName,
              SurNameOrOrgName: surName
            },
            PAN: data.personalInfo.pan.toUpperCase(),
            Address: {
              ResidenceNo: data.personalInfo.address.substring(0, 25) || 'NA',
              LocalityOrArea: data.personalInfo.address || '',
              CityOrTownOrDistrict: 'Delhi', // You might want to parse this from address
              StateCode: stateCode,
              CountryCode: '91',
              PinCode: data.personalInfo.pincode,
              CountryCodeMobile: '91',
              MobileNo: data.personalInfo.mobile,
              EmailAddress: data.personalInfo.email
            },
            DOB: data.personalInfo.dob,
            EmployerCategory: employerCategory as any,
            AadhaarCardNo: data.personalInfo.aadhaar
          },
          FilingStatus: {
            ReturnFileSec: this.getReturnFileSection(data.filingType),
            ResidentialStatus: 'RES',
            BenefitUs115HFlg: 'N',
            AssesseeRepFlg: 'N'
          },
          ITR1_IncomeDeductions: {
            Salary: salaryIncome,
            AllwncExemptUs10: {
              TotalAllwncExemptUs10: 0
            },
            PerquisitesValue: 0,
            ProfitsInSalary: 0,
            DeductionUs16: 50000, // Standard deduction
            DeductionUs16ia: 50000,
            EntertainmentAlw16ii: 0,
            ProfessionalTaxUs16iii: 0,
            IncomeFromSal: Math.max(0, salaryIncome - 50000),
            GrossRentReceived: housePropertyIncome,
            TaxPaidlocalAuth: 0,
            AnnualValue: housePropertyIncome,
            StandardDeduction: Math.min(housePropertyIncome * 0.3, 200000),
            InterestPayable: homeLoanInterest,
            TotalIncomeOfHP: Math.max(0, housePropertyIncome - (housePropertyIncome * 0.3) - homeLoanInterest),
            IncomeOthSrc: otherSourcesIncome,
            OthersInc: {
              OthersIncDtls: otherSourcesIncome > 0 ? [{
                NatureDesc: 'Other Income',
                OthAmount: otherSourcesIncome
              }] : []
            },
            DeductionUs57iia: 0,
            GrossTotIncome: grossTotalIncome,
            UsrDeductUndChapVIA: {
              Section80C: section80C,
              Section80CCC: 0,
              Section80CCDEmployeeOrSE: section80CCD,
              Section80CCD1B: 0,
              Section80CCDEmployer: 0,
              Section80D: section80D,
              Section80DD: section80DD,
              Section80DDB: 0,
              Section80E: 0,
              Section80EE: 0,
              Section80EEA: 0,
              Section80EEB: 0,
              Section80G: section80G,
              Section80GG: 0,
              Section80GGA: 0,
              Section80GGC: 0,
              Section80U: 0,
              Section80TTA: 0,
              Section80TTB: 0,
              TotalChapVIADeductions: totalChapterVIADeductions
            },
            DeductUndChapVIA: totalChapterVIADeductions,
            TotalIncome: totalIncome,
            ExemptIncAgriOthUs10: {
              NetAgriIncOrOthrIncRule7: 0,
              OthersInc: 0
            }
          },
          ITR1_TaxComputation: {
            TotalTaxPayable: taxData.totalTax,
            Rebate87A: taxData.rebate87A,
            TaxPayableOnRebate: taxData.taxAfterRebate,
            EducationCess: taxData.educationCess,
            GrossTaxLiability: taxData.grossTaxLiability,
            Section89: 0,
            NetTaxLiability: taxData.grossTaxLiability,
            TotalIntrstPay: 0,
            IntrstPay234A: 0,
            IntrstPay234B: 0,
            IntrstPay234C: 0,
            LateFilingFee234F: 0,
            TotTaxPlusIntrstPay: taxData.grossTaxLiability
          },
          TaxPaid: {
            TaxesPaid: {
              AdvanceTax: advanceTax,
              TDS: tdsOnSalary + tdsOther,
              TCS: 0,
              SelfAssessmentTax: 0,
              TotalTaxesPaid: totalTaxPaid
            },
            BalTaxPayable: Math.max(0, taxData.grossTaxLiability - totalTaxPaid)
          },
          BankAccountDtls: {
            AddtnlBankDetails: [{
              IFSCCode: data.personalInfo.ifscCode.toUpperCase(),
              BankName: data.personalInfo.bankName,
              BankAccountNo: data.personalInfo.accountNumber,
              UseForRefund: 'true'
            }]
          },
          Verification: {
            Declaration: {
              AssesseeVerName: data.personalInfo.name,
              AssesseeVerPAN: data.personalInfo.pan.toUpperCase(),
              Capacity: 'S'
            }
          }
        }
      }
    };

    // Add refund section if applicable
    if (totalTaxPaid > taxData.grossTaxLiability) {
      itr1.ITR.ITR1.Refund = {
        RefundDue: totalTaxPaid - taxData.grossTaxLiability,
        BankAccountDtls: {
          AddtnlBankDetails: [{
            IFSCCode: data.personalInfo.ifscCode.toUpperCase(),
            BankName: data.personalInfo.bankName,
            BankAccountNo: data.personalInfo.accountNumber,
            UseForRefund: 'true'
          }]
        }
      };
    }

    // Add TDS details if present
    if (tdsOnSalary > 0) {
      itr1.ITR.ITR1.TDSonSalaries = {
        TDSonSalaryDtls: [{
          TAN: 'DELS12345', // You would need to collect this
          EmployerOrDeductorName: 'Employer Name', // You would need to collect this
          IncChrgSal: salaryIncome,
          TotalTDSSal: tdsOnSalary
        }],
        TotalTDSonSalaries: tdsOnSalary
      };
    }

    if (tdsOther > 0) {
      itr1.ITR.ITR1.TDSonOthThanSals = {
        TDSonOthThanSalDtls: [{
          TANOrPANOfDeductor: 'DELS12345', // You would need to collect this
          NameOfDeductor: 'Deductor Name', // You would need to collect this
          GrossAmount: otherSourcesIncome,
          HeadOfIncome: 'OS',
          AmtCarriedFwd: 0,
          DeductedYr: '2024',
          TotTDSOnAmtPaid: tdsOther,
          ClaimedThisYearFlg: 'Y'
        }],
        TotalTDSonOthThanSals: tdsOther
      };
    }

    // Add Schedule 80C if applicable
    if (section80C > 0) {
      itr1.ITR.ITR1.Schedule80C = {
        Sec80C: section80C
      };
    }

    // Add Schedule 80D if applicable
    if (section80D > 0) {
      itr1.ITR.ITR1.Schedule80D = {
        Sec80DHealthInsurancePremium: {
          SeniorCitizenSelf: 'N',
          SeniorCitizenParents: 'N',
          HlthInsPremSlfFam: section80D,
          PrevHlthChckUpSlfFam: 0,
          HlthInsPremParents: 0,
          PrevHlthChckUpParents: 0,
          MedicalExpenditure: 0,
          ParentsMedicalExpenditure: 0
        }
      };
    }

    // Add Schedule 80G if applicable
    if (section80G > 0) {
      itr1.ITR.ITR1.Schedule80G = {
        TotalDonationsUs80G: section80G,
        DonationDetails: [{
          DoneeWithoutPan: [{
            DoneeNameAndAddress: 'Charitable Organization',
            DonationAmtCash: 0,
            DonationAmtOtherMode: section80G,
            DonationAmt: section80G,
            EligibleDonationAmt: section80G
          }]
        }]
      };
    }

    return itr1;
  }

  private getReturnFileSection(filingType: string): any {
    const mapping: Record<string, string> = {
      'original': '11',
      'belated': '12',
      'revised': '13'
    };
    return mapping[filingType.toLowerCase()] || '11';
  }

  private calculateTax(totalIncome: number, regime: string): {
    totalTax: number;
    rebate87A: number;
    taxAfterRebate: number;
    educationCess: number;
    grossTaxLiability: number;
  } {
    let totalTax = 0;

    if (regime === 'new') {
      // New tax regime slabs for AY 2025-26
      if (totalIncome <= 300000) {
        totalTax = 0;
      } else if (totalIncome <= 600000) {
        totalTax = (totalIncome - 300000) * 0.05;
      } else if (totalIncome <= 900000) {
        totalTax = 15000 + (totalIncome - 600000) * 0.10;
      } else if (totalIncome <= 1200000) {
        totalTax = 45000 + (totalIncome - 900000) * 0.15;
      } else if (totalIncome <= 1500000) {
        totalTax = 90000 + (totalIncome - 1200000) * 0.20;
      } else {
        totalTax = 150000 + (totalIncome - 1500000) * 0.30;
      }
    } else {
      // Old tax regime slabs
      if (totalIncome <= 250000) {
        totalTax = 0;
      } else if (totalIncome <= 500000) {
        totalTax = (totalIncome - 250000) * 0.05;
      } else if (totalIncome <= 1000000) {
        totalTax = 12500 + (totalIncome - 500000) * 0.20;
      } else {
        totalTax = 112500 + (totalIncome - 1000000) * 0.30;
      }
    }

    // Rebate u/s 87A
    let rebate87A = 0;
    if (regime === 'new' && totalIncome <= 700000) {
      rebate87A = Math.min(totalTax, 25000);
    } else if (regime === 'old' && totalIncome <= 500000) {
      rebate87A = Math.min(totalTax, 12500);
    }

    const taxAfterRebate = Math.max(0, totalTax - rebate87A);
    const educationCess = Math.round(taxAfterRebate * 0.04);
    const grossTaxLiability = taxAfterRebate + educationCess;

    return {
      totalTax,
      rebate87A,
      taxAfterRebate,
      educationCess,
      grossTaxLiability
    };
  }

  downloadITRJSON(itrData: ITR1Schema, filename: string = 'ITR1_2025.json') {
    const jsonStr = JSON.stringify(itrData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) link.remove();
    URL.revokeObjectURL(url);
  }

  validateITR(itrData: ITR1Schema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    const personalInfo = itrData.ITR.ITR1.PersonalInfo;
    if (!personalInfo.PAN || !personalInfo.PAN.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
      errors.push('Invalid PAN format');
    }

    if (!personalInfo.AadhaarCardNo || !personalInfo.AadhaarCardNo.match(/^[0-9]{12}$/)) {
      errors.push('Invalid Aadhaar format');
    }

    if (!personalInfo.Address.MobileNo || !personalInfo.Address.MobileNo.match(/^[0-9]{10}$/)) {
      errors.push('Invalid mobile number format');
    }

    if (!personalInfo.Address.PinCode || !personalInfo.Address.PinCode.match(/^[0-9]{6}$/)) {
      errors.push('Invalid pincode format');
    }

    // Check if income is properly calculated
    const incomeDeductions = itrData.ITR.ITR1.ITR1_IncomeDeductions;
    if (incomeDeductions.TotalIncome && incomeDeductions.TotalIncome < 0) {
      errors.push('Total income cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
