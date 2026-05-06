export type IncomeTaxFormDownload = {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'zip' | 'schema' | 'utility' | 'link';
  act: 'Income Tax Act 1961' | 'Income Tax Act 2025' | 'Unknown';
  version?: string;
  size?: string;
  latestReleaseDate?: string;
  localPath?: string;
  officialUrl: string;
  tags: string[];
};

export const incomeTaxFormsSourceUrl = "https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns";
export const incomeTaxFormsLastSynced = "2026-05-06T19:03:26.040Z";
export const incomeTaxFormsAssessmentYear = "2025-26";
export const incomeTaxFormsFinancialYearLabel = "2025-26";

export const incomeTaxFormDownloads: IncomeTaxFormDownload[] = [
  {
    "id": "ay-2025-26-common-offline-utility-itr-1-to-itr-4-utility-itde-filing-2025-setup-1-2-9-zip",
    "title": "Common Offline Utility (ITR 1 to ITR 4) - Utility",
    "description": "Common Offline Utility for filing Income-tax Returns ITR 1, ITR 2, ITR 3 and ITR 4 for the AY 2025-26.",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.2.9",
    "size": "31.6 MB",
    "latestReleaseDate": "27-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITDe-Filing-2025-Setup-1.2.9.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "1",
      "4"
    ]
  },
  {
    "id": "ay-2025-26-common-offline-utility-itr-1-to-itr-4-utility-for-mac-itde-filing-2025-1-2-9-zip",
    "title": "Common Offline Utility (ITR 1 to ITR 4) - Utility for MAC",
    "description": "Common Offline Utility for filing Income-tax Returns ITR 1, ITR 2, ITR 3 and ITR 4 for the AY 2025-26.",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.2.9",
    "size": "55.5 MB",
    "latestReleaseDate": "27-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITDe-Filing-2025-1.2.9.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "1",
      "4"
    ]
  },
  {
    "id": "ay-2025-26-itr-1-utility-excel-based-itr1-ay-25-26-v1-7-zip",
    "title": "ITR 1 - Utility Excel Based",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, one house property, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.7",
    "size": "3.36 MB",
    "latestReleaseDate": "09-Apr-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-04/ITR1_AY_25-26_V1.7.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "1"
    ]
  },
  {
    "id": "ay-2025-26-itr-1-schema-itr-1-2025-main-v1-2-json",
    "title": "ITR 1 - Schema",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, one house property, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.2",
    "size": "129 KB",
    "latestReleaseDate": "30-May-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-1_2025_Main_V1.2.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "1"
    ]
  },
  {
    "id": "ay-2025-26-itr-1-schema-change-document-itr-201-schema-20change-20document-ay2025-26-v1-2-pdf",
    "title": "ITR 1 - Schema Change Document",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, one house property, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.2",
    "size": "188 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%201_Schema%20change%20document_AY2025-26_V1.2.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "1",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-1-schema-change-document-itr-201-schema-20change-20document-ay2025-26-v1-2-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202025-26-v1-1-pdf",
    "title": "ITR 1 - Validations",
    "description": "For individuals being a resident (other than not ordinarily resident) having total income upto Rs.50 lakh and having Income from Salaries, one house property, other sources (Interest etc.), long-term capital gains under section 112A up to Rs. 1.25 lakh, and agricultural income up to Rs.5 thousand",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "506 KB",
    "latestReleaseDate": "11-Jul-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-07/CBDT_e-Filing_ITR%201_Validation%20Rules_AY%202025-26_V1.1.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "1",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202025-26-v1-1-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-2-utility-excel-based-itr2-ay-25-26-v1-5-0-zip",
    "title": "ITR 2 - Utility Excel Based",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.5",
    "size": "9.14 MB",
    "latestReleaseDate": "24-Feb-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-04/ITR2_AY_25-26_V1.5_0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "2"
    ]
  },
  {
    "id": "ay-2025-26-itr-2-schema-itr-2-2025-main-v1-2-json",
    "title": "ITR 2 - Schema",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.2",
    "size": "413 KB",
    "latestReleaseDate": "11-Jul-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-2_2025_Main_V1.2.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "2"
    ]
  },
  {
    "id": "ay-2025-26-itr-2-schema-change-document-itr-202-schema-20change-20document-ay2025-26-v1-2-pdf",
    "title": "ITR 2 - Schema Change Document",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.2",
    "size": "204 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%202_Schema%20change%20document_AY2025-26_V1.2.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "2",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-2-schema-change-document-itr-202-schema-20change-20document-ay2025-26-v1-2-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202025-26-v1-0-pdf",
    "title": "ITR 2 - Validations",
    "description": "For Individuals and HUFs not having income from profits and gains of business or profession.",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "711 KB",
    "latestReleaseDate": "11-Jul-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-07/CBDT__e-Filing_ITR%202_Validation%20Rules_AY%202025-26_V1.0.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "2",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202025-26-v1-0-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-3-utility-excel-based-itr3-ay-25-26-v1-11-0-zip",
    "title": "ITR 3 - Utility Excel Based",
    "description": "For individuals and HUFs having income from profits and gains of business or profession.",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.11",
    "size": "11.3 MB",
    "latestReleaseDate": "27-Feb-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-04/ITR3_AY_25-26_V1.11_0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "3"
    ]
  },
  {
    "id": "ay-2025-26-itr-3-schema-itr-3-2025-main-v1-3-json",
    "title": "ITR 3 - Schema",
    "description": "For individuals and HUFs having income from profits and gains of business or profession.",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.3",
    "size": "1.01 MB",
    "latestReleaseDate": "11-Jul-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-3_2025_Main_V1.3.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "3"
    ]
  },
  {
    "id": "ay-2025-26-itr-3-schema-change-document-itr-203-schema-20change-20document-ay2025-26-v1-3-pdf",
    "title": "ITR 3 - Schema Change Document",
    "description": "For individuals and HUFs having income from profits and gains of business or profession.",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.3",
    "size": "215 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%203_Schema%20change%20document_AY2025-26_V1.3.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "3",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-3-schema-change-document-itr-203-schema-20change-20document-ay2025-26-v1-3-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-3-validations-cbdt-e-filing-itr-3-validation-20rules-v1-0-ay-2025-26-pdf",
    "title": "ITR 3 - Validations",
    "description": "For individuals and HUFs having income from profits and gains of business or profession.",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "1.05 MB",
    "latestReleaseDate": "11-Jul-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-07/CBDT_e-filing_ITR-3_Validation%20Rules_V1.0_AY%2025-26.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "3",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-3-validations-cbdt-e-filing-itr-3-validation-20rules-v1-0-ay-2025-26-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-4-utility-excel-based-itr4-ay-25-26-v1-6-zip",
    "title": "ITR 4 - Utility Excel Based",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.6",
    "size": "4.66 MB",
    "latestReleaseDate": "06-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR4_AY_25-26_V1.6.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "4"
    ]
  },
  {
    "id": "ay-2025-26-itr-4-schema-itr-4-2025-main-v1-3-0-json",
    "title": "ITR 4 - Schema",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.3",
    "size": "248 KB",
    "latestReleaseDate": "30-May-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-4_2025_Main_V1.3_0.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "4"
    ]
  },
  {
    "id": "ay-2025-26-itr-4-schema-change-document-itr-204-schema-20change-20document-ay2025-26-v1-3-1-pdf",
    "title": "ITR 4 - Schema Change Document",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.3",
    "size": "197 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%204_Schema%20change%20document_AY2025-26_V1.3_1.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "4",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-4-schema-change-document-itr-204-schema-20change-20document-ay2025-26-v1-3-1-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202025-26-v1-1-pdf",
    "title": "ITR 4 - Validations",
    "description": "For Individuals, HUFs and Firms (other than LLP) being a resident having total income upto Rs.50 lakh and having income from business and profession which is computed under sections 44AD, 44ADA or 44AE, and having long-term capital gains under section 112A upto Rs. 1.25 lakh",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "566 KB",
    "latestReleaseDate": "11-Jul-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-07/CBDT_e-Filing_ITR%204_Validation%20Rules_AY%202025-26_V1.1.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "4",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202025-26-v1-1-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-5-utility-itde-filing-5-2025-20setup-201-1-7-0-zip",
    "title": "ITR 5 - Utility",
    "description": "For persons other than- (i) individual, (ii) HUF, (iii) company and (iv) person filing Form ITR-7",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.7",
    "size": "50.2 MB",
    "latestReleaseDate": "23-Dec-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-12/ITDe-Filing_5-2025%20Setup%201.1.7_0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "5"
    ]
  },
  {
    "id": "ay-2025-26-itr-5-utility-for-mac-itde-filing-2025-5-v1-1-7-zip",
    "title": "ITR 5 - Utility for MAC",
    "description": "For persons other than- (i) individual, (ii) HUF, (iii) company and (iv) person filing Form ITR-7",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.7",
    "size": "50.2 MB",
    "latestReleaseDate": "23-Dec-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-12/ITDe-filing_2025_5_v1.1.7.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "5"
    ]
  },
  {
    "id": "ay-2025-26-itr-5-utility-excel-based-itr5-ay-2025-26-v1-9-0-zip",
    "title": "ITR 5 - Utility Excel Based",
    "description": "For persons other than- (i) individual, (ii) HUF, (iii) company and (iv) person filing Form ITR-7",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.9",
    "size": "1.02 MB",
    "latestReleaseDate": "02-Mar-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-04/ITR5_AY_2025-26_V1.9_0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "5"
    ]
  },
  {
    "id": "ay-2025-26-itr-5-schema-itr-5-2025-main-v1-2-json",
    "title": "ITR 5 - Schema",
    "description": "For persons other than- (i) individual, (ii) HUF, (iii) company and (iv) person filing Form ITR-7",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.2",
    "size": "1.02 MB",
    "latestReleaseDate": "08-Aug-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-5_2025_Main_V1.2.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "5"
    ]
  },
  {
    "id": "ay-2025-26-itr-5-schema-change-document-itr-205-schema-20change-20document-ay2025-26-v1-2-pdf",
    "title": "ITR 5 - Schema Change Document",
    "description": "For persons other than- (i) individual, (ii) HUF, (iii) company and (iv) person filing Form ITR-7",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.2",
    "size": "204 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%205_Schema%20change%20document_AY2025-26_V1.2.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "5",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-5-schema-change-document-itr-205-schema-20change-20document-ay2025-26-v1-2-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-5-validations-cbdt-e-filing-itr-205-validation-20rules-v-201-0-pdf",
    "title": "ITR 5 - Validations",
    "description": "For persons other than- (i) individual, (ii) HUF, (iii) company and (iv) person filing Form ITR-7",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "887 KB",
    "latestReleaseDate": "14-Aug-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-09/CBDT_e-Filing_ITR%205_Validation%20Rules_V%201.0.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "5",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-5-validations-cbdt-e-filing-itr-205-validation-20rules-v-201-0-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-6-utility-itde-filing-6-2025-20setup-201-1-7-0-zip",
    "title": "ITR 6 - Utility",
    "description": "For Companies other than companies claiming exemption under section 11",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.7",
    "size": "54.6 MB",
    "latestReleaseDate": "23-Dec-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-12/ITDe-Filing_6-2025%20Setup%201.1.7_0.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "6"
    ]
  },
  {
    "id": "ay-2025-26-itr-6-utility-for-mac-itde-filing-2025-6-v1-1-7-zip",
    "title": "ITR 6 - Utility for MAC",
    "description": "For Companies other than companies claiming exemption under section 11",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.7",
    "size": "54.6 MB",
    "latestReleaseDate": "23-Dec-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-12/ITDe-filing_2025_6_v1.1.7.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "6"
    ]
  },
  {
    "id": "ay-2025-26-itr-6-utility-excel-based-itr-206-ay-2025-26-v1-9-zip",
    "title": "ITR 6 - Utility Excel Based",
    "description": "For Companies other than companies claiming exemption under section 11",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.9",
    "size": "13.7 MB",
    "latestReleaseDate": "06-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%206_AY%2025-26_V1.9.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "6"
    ]
  },
  {
    "id": "ay-2025-26-itr-6-schema-itr-6-2025-main-v1-3-json",
    "title": "ITR 6 - Schema",
    "description": "For Companies other than companies claiming exemption under section 11",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.3",
    "size": "761 KB",
    "latestReleaseDate": "14-Aug-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-6_2025_Main_V1.3.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "6"
    ]
  },
  {
    "id": "ay-2025-26-itr-6-schema-change-document-itr-206-schema-20change-20document-ay2025-26-v1-3-pdf",
    "title": "ITR 6 - Schema Change Document",
    "description": "For Companies other than companies claiming exemption under section 11",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.3",
    "size": "207 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%206_Schema%20change%20document_AY2025-26_V1.3.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "6",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-6-schema-change-document-itr-206-schema-20change-20document-ay2025-26-v1-3-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-6-validations-cbdt-e-filing-itr-6-validation-20rules-version-201-0-20-281-29-pdf",
    "title": "ITR 6 - Validations",
    "description": "For Companies other than companies claiming exemption under section 11",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "1.16 MB",
    "latestReleaseDate": "14-Aug-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-09/CBDT__e-Filing_ITR-6_Validation%20Rules_Version%201.0%20%281%29.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "6",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-6-validations-cbdt-e-filing-itr-6-validation-20rules-version-201-0-20-281-29-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-7-utility-itde-filing-7-2025-20setup-201-1-5-zip",
    "title": "ITR 7 - Utility",
    "description": "For persons including companies required to furnish return under sections 139(4A) or 139(4B) or 139(4C) or 139(4D) only",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.5",
    "size": "49.5 MB",
    "latestReleaseDate": "01-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITDe-Filing_7-2025%20Setup%201.1.5.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "7"
    ]
  },
  {
    "id": "ay-2025-26-itr-7-utility-for-mac-itde-filing-2025-7-v1-1-5-1-zip",
    "title": "ITR 7 - Utility for MAC",
    "description": "For persons including companies required to furnish return under sections 139(4A) or 139(4B) or 139(4C) or 139(4D) only",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.1.5",
    "size": "49.5 MB",
    "latestReleaseDate": "01-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITDe-filing_2025_7_v1.1.5-1.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "7"
    ]
  },
  {
    "id": "ay-2025-26-itr-7-utility-excel-based-itr7-ay-25-26-v1-5-zip",
    "title": "ITR 7 - Utility Excel Based",
    "description": "For persons including companies required to furnish return under sections 139(4A) or 139(4B) or 139(4C) or 139(4D) only",
    "fileType": "utility",
    "act": "Unknown",
    "version": "1.5",
    "size": "5.64 MB",
    "latestReleaseDate": "06-Jan-2026",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR7_AY_25-26_V1.5.zip",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "utility",
      "7"
    ]
  },
  {
    "id": "ay-2025-26-itr-7-schema-itr-7-2025-main-v1-1-json",
    "title": "ITR 7 - Schema",
    "description": "For persons including companies required to furnish return under sections 139(4A) or 139(4B) or 139(4C) or 139(4D) only",
    "fileType": "schema",
    "act": "Unknown",
    "version": "1.1",
    "size": "449 KB",
    "latestReleaseDate": "21-Aug-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR-7_2025_Main_V1.1.json",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "schema",
      "7"
    ]
  },
  {
    "id": "ay-2025-26-itr-7-schema-change-document-itr-207-schema-20change-20document-ay2025-26-v1-1-pdf",
    "title": "ITR 7 - Schema Change Document",
    "description": "For persons including companies required to furnish return under sections 139(4A) or 139(4B) or 139(4C) or 139(4D) only",
    "fileType": "pdf",
    "act": "Unknown",
    "version": "1.1",
    "size": "181 KB",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-01/ITR%207_Schema%20change%20document_AY2025-26_V1.1.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "7",
      "schema",
      "schema change"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-7-schema-change-document-itr-207-schema-20change-20document-ay2025-26-v1-1-pdf.pdf"
  },
  {
    "id": "ay-2025-26-itr-7-validations-cbdt-e-filing-itr-7-validation-20rules-v-201-0-ay-2025-26-pdf",
    "title": "ITR 7 - Validations",
    "description": "For persons including companies required to furnish return under sections 139(4A) or 139(4B) or 139(4C) or 139(4D) only",
    "fileType": "pdf",
    "act": "Unknown",
    "size": "831 KB",
    "latestReleaseDate": "21-Aug-2025",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-09/CBDT_e-Filing_ITR-7_Validation%20Rules_V%201.0_AY%2025-26.pdf",
    "tags": [
      "income tax",
      "income tax return",
      "ay 2025-26",
      "fy 2025-26",
      "return",
      "pdf",
      "7",
      "validation"
    ],
    "localPath": "/assets/income-tax-forms/ay-2025-26-itr-7-validations-cbdt-e-filing-itr-7-validation-20rules-v-201-0-ay-2025-26-pdf.pdf"
  }
];
