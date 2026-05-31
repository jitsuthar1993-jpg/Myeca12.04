export type IncomeTaxFormDownload = {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'zip' | 'schema' | 'utility' | 'link';
  act: 'Income Tax Act 1961' | 'Income Tax Act 2025' | 'Unknown';
  version?: string;
  size?: string;
  latestReleaseDate?: string;
  downloadUrl?: string;
  officialUrl: string;
  tags: string[];
};

export const incomeTaxFormsSourceUrl = "https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns";
export const incomeTaxFormsLastSynced = "2026-05-31T08:11:42.270Z";
export const incomeTaxFormsAssessmentYear = "2026-27";
export const incomeTaxFormsFinancialYearLabel = "2025-26";

export const incomeTaxFormDownloads: IncomeTaxFormDownload[] = [
  {
    "id": "ay-2026-27-common-offline-utility-itr-1-2-and-itr-4-utility-itde-filing-2026-setup-1-1-0-zip",
    "title": "Common Offline Utility (ITR 1,2 and ITR 4) - Utility",
    "description": "Common Offline Utility for filing Income-tax Returns ITR 1, ITR 2 and ITR 4 for the AY 2026-27",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.0",
    "size": "47.3 MB",
    "latestReleaseDate": "29-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITDe-Filing-2026-Setup-1.1.0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "utility",
      "1",
      "2",
      "4"
    ]
  },
  {
    "id": "ay-2026-27-common-offline-utility-itr-1-2-and-itr-4-utility-for-mac-itde-filing-2026-1-1-0-dmg-zip",
    "title": "Common Offline Utility (ITR 1,2 and ITR 4) - Utility for MAC",
    "description": "Common Offline Utility for filing Income-tax Returns ITR 1, ITR 2 and ITR 4 for the AY 2026-27",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.0",
    "size": "73.4 MB",
    "latestReleaseDate": "29-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITDe-Filing-2026-1.1.0.dmg_.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "utility",
      "1",
      "2",
      "4"
    ]
  },
  {
    "id": "ay-2026-27-itr-1-utility-excel-based-itr1-ay-26-27-v1-0-zip",
    "title": "ITR 1 - Utility Excel Based",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, two house properties, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.0",
    "size": "4 MB",
    "latestReleaseDate": "15-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR1_AY_26-27_V1.0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "utility",
      "1"
    ]
  },
  {
    "id": "ay-2026-27-itr-1-schema-itr-1-2026-main-v1-0-0-json",
    "title": "ITR 1 - Schema",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, two house properties, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "schema",
    "act": "Unknown",
    "size": "145 KB",
    "latestReleaseDate": "15-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR-1_2026_Main_V1.0_0.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "schema",
      "1"
    ]
  },
  {
    "id": "ay-2026-27-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202026-27-pdf",
    "title": "ITR 1 - Validations",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, two house properties, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "543 KB",
    "latestReleaseDate": "15-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT_e-Filing_ITR%201_Validation%20Rules_AY%202026-27.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "pdf",
      "1",
      "validation"
    ],
    "downloadUrl": "/downloads/income-tax-forms/ay-2026-27-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202026-27-pdf"
  },
  {
    "id": "ay-2026-27-itr-2-utility-excel-based-itr2-ay-26-27-v1-0-zip",
    "title": "ITR 2 - Utility Excel Based",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.0",
    "size": "8.79 MB",
    "latestReleaseDate": "26-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR2_AY_26-27_V1.0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "utility",
      "2"
    ]
  },
  {
    "id": "ay-2026-27-itr-2-schema-itr-2-2026-main-v1-0-json",
    "title": "ITR 2 - Schema",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "schema",
    "act": "Unknown",
    "size": "380 KB",
    "latestReleaseDate": "26-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR-2_2026_Main_V1.0.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "schema",
      "2"
    ]
  },
  {
    "id": "ay-2026-27-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202026-27-v1-0-pdf",
    "title": "ITR 2 - Validations",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "723 KB",
    "latestReleaseDate": "26-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT__e-Filing_ITR%202_Validation%20Rules_AY%202026-27_V1.0.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "pdf",
      "2",
      "validation"
    ],
    "downloadUrl": "/downloads/income-tax-forms/ay-2026-27-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202026-27-v1-0-pdf"
  },
  {
    "id": "ay-2026-27-itr-4-utility-excel-based-itr4-ay-26-27-v1-0-zip",
    "title": "ITR 4 - Utility Excel Based",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.0",
    "size": "5 MB",
    "latestReleaseDate": "15-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR4_AY_26-27_V1.0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "utility",
      "4"
    ]
  },
  {
    "id": "ay-2026-27-itr-4-schema-itr-4-2026-main-v1-0-0-json",
    "title": "ITR 4 - Schema",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "schema",
    "act": "Unknown",
    "size": "245 KB",
    "latestReleaseDate": "15-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR-4_2026_Main_V1.0_0.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "schema",
      "4"
    ]
  },
  {
    "id": "ay-2026-27-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202026-27-pdf",
    "title": "ITR 4 - Validations",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "637 KB",
    "latestReleaseDate": "15-May-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT_e-Filing_ITR%204_Validation%20Rules_AY%202026-27.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2026-27",
      "fy 2025-26",
      "return",
      "pdf",
      "4",
      "validation"
    ],
    "downloadUrl": "/downloads/income-tax-forms/ay-2026-27-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202026-27-pdf"
  }
];
