// Extended ITR Schema Types for ITR-2, ITR-3, and ITR-4

// ITR-2 Schema - For Individuals and HUFs not having income from business or profession
export interface ITR2Schema {
  ITR: {
    ITR2: {
      CreationInfo: any;
      Form_ITR2: any;
      PartA_GEN1: PartA_GEN1_ITR2;
      PartB_TI: PartB_TI_ITR2;
      PartB_TTI: PartB_TTI_ITR2;
      Schedule112A?: Schedule112A;
      Schedule115AD?: Schedule115AD;
      Schedule5A2014?: Schedule5A2014;
      Schedule80C?: any;
      Schedule80D?: any;
      Schedule80DD?: any;
      Schedule80E?: any;
      Schedule80EE?: any;
      Schedule80EEA?: any;
      Schedule80EEB?: any;
      Schedule80G?: any;
      Schedule80GGA?: any;
      Schedule80GGC?: any;
      Schedule80U?: any;
      ScheduleAL?: ScheduleAL;
      ScheduleAMT?: ScheduleAMT;
      ScheduleAMTC?: ScheduleAMTC;
      ScheduleBFLA?: ScheduleBFLA;
      ScheduleCFL?: ScheduleCFL;
      ScheduleCGFor23?: ScheduleCGFor23;
      ScheduleCYLA?: ScheduleCYLA;
      ScheduleEI?: ScheduleEI;
      ScheduleESOP?: ScheduleESOP;
      ScheduleFA?: ScheduleFA;
      ScheduleFSI?: ScheduleFSI;
      ScheduleHP?: ScheduleHP;
      ScheduleIT?: ScheduleIT;
      ScheduleOS?: ScheduleOS;
      SchedulePTI?: SchedulePTI;
      ScheduleS?: ScheduleS;
      ScheduleSI?: ScheduleSI;
      ScheduleSPI?: ScheduleSPI;
      ScheduleTCS?: any;
      ScheduleTDS1?: any;
      ScheduleTDS2?: any;
      ScheduleTDS3?: any;
      ScheduleTR1?: ScheduleTR1;
      ScheduleVDA?: ScheduleVDA;
      ScheduleVIA?: ScheduleVIA;
      TaxReturnPreparer?: any;
      Verification: any;
    };
  };
}

// ITR-3 Schema - For individuals and HUFs having income from business or profession
export interface ITR3Schema {
  ITR: {
    ITR3: {
      CreationInfo: any;
      Form_ITR3: any;
      PersonalInfo: any;
      FilingStatus: any;
      ScheduleS: ScheduleS_ITR3;
      ScheduleBP: ScheduleBP;
      Schedule44AD?: Schedule44AD;
      Schedule44ADA?: Schedule44ADA;
      Schedule44AE?: Schedule44AE;
      ScheduleHP?: any;
      ScheduleCGFor23?: any;
      ScheduleOS?: any;
      ScheduleEI?: any;
      ScheduleVIA?: any;
      Schedule80G?: any;
      Schedule80D?: any;
      Schedule80C?: any;
      ScheduleTDS1?: any;
      ScheduleTDS2?: any;
      ScheduleTDS3?: any;
      ScheduleTCS?: any;
      ScheduleIT?: any;
      ScheduleAMT?: any;
      ScheduleAMTC?: any;
      ScheduleSI?: any;
      ScheduleCFL?: any;
      ScheduleBFLA?: any;
      ScheduleCYLA?: any;
      ScheduleUD?: ScheduleUD;
      ScheduleICDS?: ScheduleICDS;
      ScheduleDPM?: ScheduleDPM;
      ScheduleDCG?: ScheduleDCG;
      ScheduleESR?: ScheduleESR;
      Verification: any;
    };
  };
}

// ITR-4 Schema - For Individuals, HUFs and Firms having presumptive income
export interface ITR4Schema {
  ITR: {
    ITR4: {
      CreationInfo: any;
      Form_ITR4: any;
      PersonalInfo: any;
      FilingStatus: any;
      IncomeDeductions: IncomeDeductions_ITR4;
      TaxComputation: TaxComputation_ITR4;
      TaxPaid: any;
      Refund?: any;
      Schedule44AD?: Schedule44AD_ITR4;
      Schedule44ADA?: Schedule44ADA_ITR4;
      Schedule44AE?: Schedule44AE_ITR4;
      ScheduleAL?: any;
      ScheduleQD?: ScheduleQD;
      ScheduleTDS?: any;
      ScheduleTCS?: any;
      ScheduleIT?: any;
      Schedule80G?: any;
      Schedule80D?: any;
      Schedule80C?: any;
      BankAccountDtls: any;
      Verification: any;
    };
  };
}

// ITR-2 Specific Types
interface PartA_GEN1_ITR2 {
  PersonalInfo: {
    AssesseeName: any;
    PAN: string;
    Address: any;
    DOB: string;
    EmployerCategory?: string;
    AadhaarCardNo?: string;
  };
  FilingStatus: {
    ReturnFileSec: string;
    ResidentialStatus: string;
    TaxStatus?: string;
    HeldUnlistedEqShrPrYr?: string;
    HeldUnlistedEqShrAnyTime?: string;
  };
}

interface PartB_TI_ITR2 {
  Salaries?: number;
  IncomeFromHP?: number;
  CapGain?: {
    ShortTerm?: {
      ShortTermCapGainFor23?: number;
    };
    LongTerm?: {
      LongTermCapGain23?: number;
    };
  };
  IncFromOS?: number;
  TotalIncome?: number;
}

interface PartB_TTI_ITR2 {
  ComputationOfTaxLiability?: {
    TaxAtNormalRatesOnAggrInc?: number;
    TaxAtSpecialRates?: number;
    TaxPayable?: number;
    Rebate87A?: number;
    TaxPayableOnRebate?: number;
    EducationCess?: number;
    GrossTaxLiability?: number;
    Section89?: number;
    NetTaxLiability?: number;
  };
  TaxPaid?: {
    AdvanceTax?: number;
    TDS?: number;
    TCS?: number;
    SelfAssessmentTax?: number;
    TotalTaxesPaid?: number;
  };
  BalTaxPayable?: number;
  RefundDue?: number;
}

// ITR-2 Schedule Types
interface Schedule112A {
  STCGWithoutIndexation?: {
    STCGWithoutIndexationItems?: Array<{
      TypeOfSTCGWithoutIndexation?: string;
      Amount?: number;
    }>;
  };
}

interface Schedule115AD {
  IncomeFromInvstmntInSecurities?: number;
  IncomeFromCapitalGains?: number;
  TotalIncome115AD?: number;
}

interface Schedule5A2014 {
  PassThroughIncome?: number;
  IncCapGain?: number;
  IncOthThanCapGain?: number;
}

interface ScheduleAL {
  ImmovableDetails?: Array<{
    DescriptionOfProperty?: string;
    AddressOfProperty?: string;
    TotalInvestment?: number;
  }>;
  MovableAsset?: {
    Deposits?: number;
    SharesAndSecurities?: number;
    InsurancePolicies?: number;
    LoansAndAdvancesGiven?: number;
    CashInHand?: number;
    OtherAssets?: number;
  };
}

interface ScheduleAMT {
  TotalIncomeAsPerITAct?: number;
  AdjustedUnderSec115JC?: number;
  TaxPayableUnderSec115JC?: number;
}

interface ScheduleAMTC {
  TaxSection115JC?: number;
  TaxSection115JCWithSurcharge?: number;
  TaxUnderNormalProvisions?: number;
  AmountCreditSetOff?: number;
  BalanceAMTCreditCarryForward?: number;
}

interface ScheduleBFLA {
  TotalBroughtFwdLossesSetoff?: number;
  CurrentYearLossesSetoff?: number;
  LossesCarriedForward?: number;
}

interface ScheduleCFL {
  LossFromHouseProperty?: number;
  LossFromCapitalGains?: number;
  LossFromBusinessProfession?: number;
  LossFromSpeculativeBusiness?: number;
  LossFromSpecifiedBusiness?: number;
  LossFromOtherSources?: number;
}

interface ScheduleCGFor23 {
  ShortTermCapGainFor23?: {
    SaleofLandBuildingItems?: Array<{
      DescriptionOfProperty?: string;
      DateOfAcquisition?: string;
      DateOfTransfer?: string;
      FullConsideration?: number;
      CostOfAcquisition?: number;
      ImprovementCost?: number;
      TotalDeductions?: number;
      CapitalGain?: number;
    }>;
  };
  LongTermCapGain23?: {
    SaleofLandBuildingItems?: Array<{
      DescriptionOfProperty?: string;
      DateOfAcquisition?: string;
      DateOfTransfer?: string;
      FullConsideration?: number;
      IndexedCostOfAcquisition?: number;
      IndexedImprovementCost?: number;
      TotalDeductions?: number;
      CapitalGain?: number;
    }>;
  };
}

interface ScheduleCYLA {
  Salary?: {
    IncCYLA?: number;
    HPlossCurYrSetoff?: number;
    OthSrcLossCurYrSetoff?: number;
    CYLAAfterSetOff?: number;
  };
  HP?: {
    IncCYLA?: number;
    OthSrcLossCurYrSetoff?: number;
    CYLAAfterSetOff?: number;
  };
  STCG?: {
    IncCYLA?: number;
    STCLossCurYrSetoff?: number;
    CYLAAfterSetOff?: number;
  };
  LTCG?: {
    IncCYLA?: number;
    LTCLossCurYrSetoff?: number;
    CYLAAfterSetOff?: number;
  };
  OthSrc?: {
    IncCYLA?: number;
    CYLAAfterSetOff?: number;
  };
}

interface ScheduleEI {
  TotalExemptInc?: number;
  AgricultureIncome?: number;
  OtherExemptIncome?: number;
}

interface ScheduleESOP {
  SecurityType?: string;
  DateOfExercise?: string;
  DateOfAllotment?: string;
  FairMarketValuePerShare?: number;
  SharesAllotted?: number;
  PricePerSharePaid?: number;
  TaxableIncome?: number;
}

interface ScheduleFA {
  DetailsOfForiegnBank?: Array<{
    CountryName?: string;
    BankName?: string;
    AccountNumber?: string;
    PeakBalance?: number;
  }>;
  DetailsOfFinancialInterest?: Array<{
    CountryName?: string;
    NatureOfEntity?: string;
    NameOfEntity?: string;
    NatureOfInterest?: string;
  }>;
  DetailsOfImmovableProperty?: Array<{
    CountryName?: string;
    AddressOfProperty?: string;
    OwnershipType?: string;
    DateOfAcquisition?: string;
    TotalInvestment?: number;
    IncDerivedFromProperty?: number;
  }>;
  DetailsOfOtherAssets?: Array<{
    CountryName?: string;
    NatureOfAsset?: string;
    DateOfAcquisition?: string;
    TotalInvestment?: number;
    IncFromAsset?: number;
  }>;
}

interface ScheduleFSI {
  CountryName?: string;
  CountryCodeExcludingIndia?: string;
  DTAAStatus?: string;
  TypeOfIncome?: string;
  AmountOfIncome?: number;
  TaxPaidOutsideIndia?: number;
  TaxReliefClaimed?: number;
}

interface ScheduleHP {
  TypeOfHP?: string;
  GrossRentReceived?: number;
  TaxPaidToLocalAuthorities?: number;
  AnnualValue?: number;
  StandardDeduction?: number;
  InterestPayable?: number;
  NetIncomeFromHP?: number;
}

interface ScheduleIT {
  DeductionUs234A?: number;
  DeductionUs234B?: number;
  DeductionUs234C?: number;
  TotalInterest234?: number;
  IntrstPayUs234D?: number;
  IntrstPayUs220?: number;
  TotalInterestPayable?: number;
}

interface ScheduleOS {
  Dividends?: number;
  InterestGross?: number;
  RentFromMachinery?: number;
  OthersGross?: number;
  TotalOtherSrcIncome?: number;
  Deductions?: number;
  IncomeFromOtherSources?: number;
}

interface SchedulePTI {
  PassThroughIncome?: number;
  BusinessTrustIncome?: number;
  InvestmentFundIncome?: number;
  TotalPTI?: number;
}

interface ScheduleS {
  Salaries?: {
    GrossSalary?: number;
    AllowanceExemptUs10?: number;
    NetSalary?: number;
    DeductionUs16?: number;
    DeductionUs16ia?: number;
    EntertainmentAlw16ii?: number;
    ProfessionalTaxUs16iii?: number;
    IncomeFromSalary?: number;
  };
}

interface ScheduleSI {
  SplRateIncTax?: Array<{
    NatureOfIncome?: string;
    SourceOfIncome?: string;
    AmountOfIncome?: number;
    TaxRate?: number;
    TaxAmount?: number;
  }>;
}

interface ScheduleSPI {
  SpecifiedPerson?: Array<{
    PersonName?: string;
    PAN?: string;
    AmtPaidToSpecPerson?: number;
    NatureOfPayment?: string;
  }>;
}

interface ScheduleTR1 {
  TaxReliefOutsideIndia?: {
    CountryCode?: string;
    CountryName?: string;
    IncomeOutsideIndia?: number;
    TaxPaidOutsideIndia?: number;
    TaxReliefAvailable?: number;
  };
}

interface ScheduleVDA {
  ConsiderationReceived?: number;
  DeductionUs115BBH?: number;
  IncomeFromVDA?: number;
}

interface ScheduleVIA {
  DeductionName?: string;
  GrossAmount?: number;
  DeductAmount?: number;
  UsrClaimDedDtls?: any;
}

// ITR-3 Specific Types
interface ScheduleS_ITR3 {
  Salaries?: {
    TypeOfSalary?: string;
    EmployerName?: string;
    NatureOfEmployment?: string;
    GrossSalary?: number;
    Allowances?: number;
    ValueOfPerquisites?: number;
    ProfitsInLieu?: number;
    DeductionUs16?: number;
    IncomeFromSalary?: number;
  };
}

interface ScheduleBP {
  BusinessIncOthThanSpec?: {
    NetPLFromSpecBus?: number;
    NetPLFromSpecifiedBus?: number;
    NetPLFromOthBus?: number;
    IncRecCredPLOthBus?: number;
  };
  SpecBusinessInc?: {
    NetPLFromSpecBus?: number;
    IncRecCredPLSpecBus?: number;
  };
  SpecifiedBusinessInc?: {
    NetPLFromSpecifiedBus?: number;
    IncRecCredPLSpecifiedBus?: number;
  };
}

interface Schedule44AD {
  GrossTurnOverOrReceipts?: number;
  TotalPresumptiveInc?: number;
  NetBusinessIncome?: number;
}

interface Schedule44ADA {
  GrossReceipts?: number;
  TotalPresumptiveInc?: number;
  NetProfessionalIncome?: number;
}

interface Schedule44AE {
  NumberOfVehicles?: number;
  TonnageCapacity?: number;
  PresumptiveIncome?: number;
}

interface ScheduleUD {
  UnabsorbedDepreciation?: number;
  BroughtForwardLosses?: number;
  CurrentYearDepreciation?: number;
  TotalDepreciation?: number;
}

interface ScheduleICDS {
  EffectOfICDS?: number;
  ProfitAsPerBooks?: number;
  ProfitAsPerITAct?: number;
}

interface ScheduleDPM {
  PlantAndMachinery?: {
    OpeningWDV?: number;
    AdditionsDuringYear?: number;
    DepreciationAllowable?: number;
    ClosingWDV?: number;
  };
}

interface ScheduleDCG {
  DepreciationOnGoodwill?: number;
  DepreciationOnBusinessRights?: number;
  TotalDepreciation?: number;
}

interface ScheduleESR {
  ExciseServiceRevenue?: number;
  ServiceTaxRevenue?: number;
  VATRevenue?: number;
  CentralGSTRevenue?: number;
  StateGSTRevenue?: number;
}

// ITR-4 Specific Types
interface IncomeDeductions_ITR4 {
  GrossSalary?: number;
  NetSalary?: number;
  IncomeFromSalary?: number;
  GrossIncomeFromHouseProperty?: number;
  NetIncomeFromHouseProperty?: number;
  IncomeFromBusinessProf?: number;
  CapitalGains?: number;
  IncomeFromOtherSources?: number;
  TotalIncome?: number;
  DeductionsUnderChapterVIA?: number;
  TotalIncomeAfterDeductions?: number;
}

interface TaxComputation_ITR4 {
  TaxPayableOnTotalIncome?: number;
  Rebate87A?: number;
  TaxAfterRebate?: number;
  Surcharge?: number;
  EducationCess?: number;
  GrossTaxPayable?: number;
  Section89Relief?: number;
  NetTaxPayable?: number;
}

interface Schedule44AD_ITR4 {
  NatureOfBusiness?: string;
  TradeName?: string;
  BusinessCode?: string;
  Description?: string;
  GrossTurnover?: number;
  GrossReceipts?: number;
  TotalPresumptiveIncome?: number;
}

interface Schedule44ADA_ITR4 {
  NatureOfProfession?: string;
  GrossReceipts?: number;
  TotalPresumptiveIncome?: number;
}

interface Schedule44AE_ITR4 {
  RegistrationNumberOfVehicle?: string;
  TypeOfVehicle?: string;
  OwnershipType?: string;
  TonnageCapacity?: number;
  HoldingPeriodInMonths?: number;
  PresumptiveIncome?: number;
}

interface ScheduleQD {
  GrossAmount?: number;
  TaxDeducted?: number;
  NetAmount?: number;
}

// Form Type Mapping
export const ITR_FORM_DESCRIPTIONS: Record<string, string> = {
  'ITR-1': 'For Individuals having Income from Salary, House Property & Other Sources',
  'ITR-2': 'For Individuals and HUFs not having income from Business or Profession',
  'ITR-3': 'For Individuals and HUFs having income from Business or Profession',
  'ITR-4': 'For Individuals, HUFs and Firms (other than LLP) having Presumptive Income'
};

// Income Source Requirements for each ITR Form
export const ITR_FORM_REQUIREMENTS: Record<string, {
  allowedSources: string[];
  restrictedSources: string[];
  maxIncome?: number;
  allowsCapitalGains?: boolean;
  allowsForeignAssets?: boolean;
  allowsPresumptive?: boolean;
}> = {
  'ITR-1': {
    allowedSources: ['salary', 'houseProperty', 'otherSources'],
    restrictedSources: ['business', 'capitalGains', 'foreignAssets'],
    maxIncome: 5000000,
    allowsCapitalGains: false,
    allowsForeignAssets: false,
    allowsPresumptive: false
  },
  'ITR-2': {
    allowedSources: ['salary', 'houseProperty', 'otherSources', 'capitalGains', 'foreignAssets'],
    restrictedSources: ['business'],
    allowsCapitalGains: true,
    allowsForeignAssets: true,
    allowsPresumptive: false
  },
  'ITR-3': {
    allowedSources: ['salary', 'houseProperty', 'business', 'capitalGains', 'otherSources', 'foreignAssets'],
    restrictedSources: [],
    allowsCapitalGains: true,
    allowsForeignAssets: true,
    allowsPresumptive: true
  },
  'ITR-4': {
    allowedSources: ['salary', 'houseProperty', 'business', 'otherSources'],
    restrictedSources: ['capitalGains', 'foreignAssets'],
    maxIncome: 5000000,
    allowsCapitalGains: false,
    allowsForeignAssets: false,
    allowsPresumptive: true
  }
};

// Helper function to determine appropriate ITR form
export function determineITRForm(income: {
  salary?: number;
  houseProperty?: number;
  business?: number;
  capitalGains?: number;
  otherSources?: number;
  hasForeignAssets?: boolean;
  isPresumptive?: boolean;
}): string {
  const totalIncome = (income.salary || 0) + (income.houseProperty || 0) + 
    (income.business || 0) + (income.capitalGains || 0) + (income.otherSources || 0);

  // ITR-4 for presumptive income
  if (income.isPresumptive && income.business && !income.capitalGains && 
      !income.hasForeignAssets && totalIncome <= 5000000) {
    return 'ITR-4';
  }

  // ITR-3 for business income
  if (income.business) {
    return 'ITR-3';
  }

  // ITR-2 for capital gains or foreign assets
  if (income.capitalGains || income.hasForeignAssets) {
    return 'ITR-2';
  }

  // ITR-1 for simple cases
  if (totalIncome <= 5000000 && !income.business && !income.capitalGains && !income.hasForeignAssets) {
    return 'ITR-1';
  }

  // Default to ITR-2 for other cases
  return 'ITR-2';
}