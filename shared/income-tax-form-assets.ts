export type IncomeTaxFormAsset = {
  slug: string;
  fileName: string;
  officialUrl: string;
};

export const incomeTaxFormAssets: Record<string, IncomeTaxFormAsset> = {
  "ay-2026-27-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202026-27-pdf": {
    "slug": "ay-2026-27-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202026-27-pdf",
    "fileName": "ay-2026-27-itr-1-validations-cbdt-e-filing-itr-201-validation-20rules-ay-202026-27-pdf.pdf",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT_e-Filing_ITR%201_Validation%20Rules_AY%202026-27.pdf"
  },
  "ay-2026-27-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202026-27-v1-0-pdf": {
    "slug": "ay-2026-27-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202026-27-v1-0-pdf",
    "fileName": "ay-2026-27-itr-2-validations-cbdt-e-filing-itr-202-validation-20rules-ay-202026-27-v1-0-pdf.pdf",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT__e-Filing_ITR%202_Validation%20Rules_AY%202026-27_V1.0.pdf"
  },
  "ay-2026-27-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202026-27-pdf": {
    "slug": "ay-2026-27-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202026-27-pdf",
    "fileName": "ay-2026-27-itr-4-validations-cbdt-e-filing-itr-204-validation-20rules-ay-202026-27-pdf.pdf",
    "officialUrl": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT_e-Filing_ITR%204_Validation%20Rules_AY%202026-27.pdf"
  }
};

export function getIncomeTaxFormAsset(slug: string) {
  return incomeTaxFormAssets[slug] || null;
}
