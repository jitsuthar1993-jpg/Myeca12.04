// ITR Schema Types based on official ITR JSON schemas
export interface ITR1Schema {
  ITR: {
    ITR1: {
      CreationInfo: CreationInfo;
      Form_ITR1: Form_ITR1;
      PersonalInfo: PersonalInfo;
      FilingStatus: FilingStatus;
      ITR1_IncomeDeductions: ITR1_IncomeDeductions;
      ITR1_TaxComputation: ITR1_TaxComputation;
      TaxPaid: TaxPaid;
      Refund?: Refund;
      Schedule80G?: Schedule80G;
      Schedule80D?: Schedule80D;
      Schedule80C?: Schedule80C;
      ScheduleEA10_13A?: ScheduleEA10_13A;
      TDSonSalaries?: TDSonSalaries;
      TDSonOthThanSals?: TDSonOthThanSals;
      ScheduleTCS?: ScheduleTCS;
      BankAccountDtls: BankAccountDtls;
      Verification: Verification;
    };
  };
}

export interface CreationInfo {
  SWVersionNo: string;
  SWProgrammeName: string;
  JSONCreatedDate: string;
  JSONCreationTime: string;
  IntermediaryCity: string;
  Digest: string;
}

export interface Form_ITR1 {
  FormName: string;
  Description: string;
  AssessmentYear: string;
  SchemaVer: string;
  FormVer: string;
}

export interface PersonalInfo {
  AssesseeName: {
    FirstName: string;
    SurNameOrOrgName: string;
  };
  PAN: string;
  Address: {
    ResidenceNo: string;
    RoadOrStreet?: string;
    LocalityOrArea?: string;
    CityOrTownOrDistrict: string;
    StateCode: string;
    CountryCode: string;
    PinCode: string;
    CountryCodeMobile: string;
    MobileNo: string;
    EmailAddress: string;
  };
  DOB: string;
  EmployerCategory: 'CGOV' | 'SGOV' | 'PSU' | 'PE' | 'PESG' | 'PEPS' | 'PEO' | 'OTH' | 'NA';
  AadhaarCardNo?: string;
}

export interface FilingStatus {
  ReturnFileSec: '11' | '12' | '13' | '15' | '16' | '18' | '19' | '20' | '21';
  SeventhProviso139?: string;
  ReturnType?: 'O' | 'R';
  PortugalCivilCode?: string;
  ResidentialStatus: 'RES' | 'NRI';
  ConditionsResStatus?: string;
  BenefitUs115HFlg?: 'Y' | 'N';
  AssesseeRepFlg?: 'Y' | 'N';
  RepresentativeDetails?: {
    RepName?: string;
    RepAddress?: string;
    RepPAN?: string;
  };
}

export interface ITR1_IncomeDeductions {
  Salary?: number;
  AllwncExemptUs10: {
    TotalAllwncExemptUs10?: number;
  };
  PerquisitesValue?: number;
  ProfitsInSalary?: number;
  DeductionUs16?: number;
  DeductionUs16ia?: number;
  EntertainmentAlw16ii?: number;
  ProfessionalTaxUs16iii?: number;
  IncomeFromSal?: number;
  GrossRentReceived?: number;
  TaxPaidlocalAuth?: number;
  AnnualValue?: number;
  StandardDeduction?: number;
  InterestPayable?: number;
  ArrearsUnrealizedRentRcvd?: number;
  TotalIncomeOfHP?: number;
  IncomeOthSrc?: number;
  OthersInc?: {
    OthersIncDtls?: Array<{
      NatureDesc?: string;
      OthAmount?: number;
    }>;
  };
  DeductionUs57iia?: number;
  GrossTotIncome?: number;
  UsrDeductUndChapVIA?: {
    Section80C?: number;
    Section80CCC?: number;
    Section80CCDEmployeeOrSE?: number;
    Section80CCD1B?: number;
    Section80CCDEmployer?: number;
    Section80D?: number;
    Section80DD?: number;
    Section80DDB?: number;
    Section80E?: number;
    Section80EE?: number;
    Section80EEA?: number;
    Section80EEB?: number;
    Section80G?: number;
    Section80GG?: number;
    Section80GGA?: number;
    Section80GGC?: number;
    Section80U?: number;
    Section80TTA?: number;
    Section80TTB?: number;
    TotalChapVIADeductions?: number;
  };
  DeductUndChapVIA?: number;
  TotalIncome?: number;
  ExemptIncAgriOthUs10?: {
    NetAgriIncOrOthrIncRule7?: number;
    OthersInc?: number;
  };
}

export interface ITR1_TaxComputation {
  TotalTaxPayable?: number;
  Rebate87A?: number;
  TaxPayableOnRebate?: number;
  EducationCess?: number;
  GrossTaxLiability?: number;
  Section89?: number;
  NetTaxLiability?: number;
  TotalIntrstPay?: number;
  IntrstPay234A?: number;
  IntrstPay234B?: number;
  IntrstPay234C?: number;
  LateFilingFee234F?: number;
  TotTaxPlusIntrstPay?: number;
}

export interface TaxPaid {
  TaxesPaid?: {
    AdvanceTax?: number;
    TDS?: number;
    TCS?: number;
    SelfAssessmentTax?: number;
    TotalTaxesPaid?: number;
  };
  BalTaxPayable?: number;
}

export interface Refund {
  RefundDue?: number;
  BankAccountDtls?: {
    AddtnlBankDetails?: Array<{
      IFSCCode?: string;
      BankName?: string;
      BankAccountNo?: string;
      UseForRefund?: 'true' | 'false';
    }>;
  };
}

export interface Schedule80G {
  TotalDonationsUs80G?: number;
  DonationDetails?: Array<{
    DoneeWithPan?: Array<{
      DoneePAN?: string;
      DoneeNameAndAddress?: string;
      DonationAmtCash?: number;
      DonationAmtOtherMode?: number;
      DonationAmt?: number;
      EligibleDonationAmt?: number;
    }>;
    DoneeWithoutPan?: Array<{
      DoneeNameAndAddress?: string;
      DonationAmtCash?: number;
      DonationAmtOtherMode?: number;
      DonationAmt?: number;
      EligibleDonationAmt?: number;
    }>;
  }>;
}

export interface Schedule80D {
  Sec80DHealthInsurancePremium?: {
    SeniorCitizenSelf?: 'Y' | 'N';
    SeniorCitizenParents?: 'Y' | 'N';
    HlthInsPremSlfFam?: number;
    PrevHlthChckUpSlfFam?: number;
    HlthInsPremParents?: number;
    PrevHlthChckUpParents?: number;
    MedicalExpenditure?: number;
    ParentsMedicalExpenditure?: number;
  };
}

export interface Schedule80C {
  Sec80C?: number;
}

export interface ScheduleEA10_13A {
  PensionDtls?: {
    TotalUncommutedPension?: number;
    TotalCommutedPension?: number;
    StandardDeduction?: number;
    TaxablePension?: number;
  };
  Allowances?: {
    Gratuity?: number;
    TotalNotTaxableGratuity?: number;
    TaxableGratuity?: number;
    LeaveEncashment?: number;
    TotalNotTaxableLeaveEncash?: number;
    TaxableLeaveEncash?: number;
  };
}

export interface TDSonSalaries {
  TDSonSalaryDtls?: Array<{
    TAN?: string;
    EmployerOrDeductorName?: string;
    IncChrgSal?: number;
    TotalTDSSal?: number;
  }>;
  TotalTDSonSalaries?: number;
}

export interface TDSonOthThanSals {
  TDSonOthThanSalDtls?: Array<{
    TANOrPANOfDeductor?: string;
    NameOfDeductor?: string;
    GrossAmount?: number;
    HeadOfIncome?: string;
    AmtCarriedFwd?: number;
    DeductedYr?: string;
    TotTDSOnAmtPaid?: number;
    ClaimedThisYearFlg?: 'Y' | 'N';
  }>;
  TotalTDSonOthThanSals?: number;
}

export interface ScheduleTCS {
  TCS?: Array<{
    TANOrPANOfCollector?: string;
    NameOfCollector?: string;
    AmtTaxCollected?: number;
    CollectedYr?: string;
    AmtCarriedFwd?: number;
    TotTCS?: number;
    ClaimedThisYearFlg?: 'Y' | 'N';
  }>;
  TotalScheduleTCS?: number;
}

export interface BankAccountDtls {
  AddtnlBankDetails?: Array<{
    IFSCCode?: string;
    BankName?: string;
    BankAccountNo?: string;
    UseForRefund?: 'true' | 'false';
  }>;
}

export interface Verification {
  Declaration?: {
    AssesseeVerName?: string;
    AssesseeVerPAN?: string;
    Capacity?: string;
  };
  TaxReturnPreparer?: {
    IdentificationNoOfTRP?: string;
    NameOfTRP?: string;
    ReImbFrmGov?: number;
  };
}

// State code mapping
export const STATE_CODES: Record<string, string> = {
  'Andaman and Nicobar Islands': '01',
  'Andhra Pradesh': '02',
  'Arunachal Pradesh': '03',
  'Assam': '04',
  'Bihar': '05',
  'Chandigarh': '06',
  'Chattisgarh': '07',
  'Dadra and Nagar Haveli': '08',
  'Daman and Diu': '09',
  'Delhi': '10',
  'Goa': '11',
  'Gujarat': '12',
  'Haryana': '13',
  'Himachal Pradesh': '14',
  'Jammu and Kashmir': '15',
  'Jharkhand': '16',
  'Karnataka': '17',
  'Kerala': '18',
  'Lakshadweep': '19',
  'Madhya Pradesh': '20',
  'Maharashtra': '21',
  'Manipur': '22',
  'Meghalaya': '23',
  'Mizoram': '24',
  'Nagaland': '25',
  'Odisha': '26',
  'Puducherry': '27',
  'Punjab': '28',
  'Rajasthan': '29',
  'Sikkim': '30',
  'Tamil Nadu': '31',
  'Telangana': '32',
  'Tripura': '33',
  'Uttar Pradesh': '34',
  'Uttarakhand': '35',
  'West Bengal': '36',
  'Ladakh': '37'
};

// Employer category mapping
export const EMPLOYER_CATEGORIES: Record<string, string> = {
  'Central Government': 'CGOV',
  'State Government': 'SGOV',
  'Public Sector Unit': 'PSU',
  'Pensioners - Central Government': 'PE',
  'Pensioners - State Government': 'PESG',
  'Pensioners - Public Sector': 'PEPS',
  'Pensioners - Others': 'PEO',
  'Others': 'OTH',
  'Not Applicable': 'NA'
};

// Return filing section mapping
export const RETURN_FILE_SECTIONS: Record<string, string> = {
  'Normal': '11',
  'Belated': '12',
  'Revised': '13',
  'Updated': '15'
};