import { DocumentGeneratorConfig } from './types';

type GeneratorModule = Record<string, DocumentGeneratorConfig>;
type GeneratorLoader = () => Promise<GeneratorModule>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeDefinedPreviewValues(defaultValue: unknown, formValue: unknown): unknown {
  if (formValue === undefined) return defaultValue;
  if (!isRecord(defaultValue) || !isRecord(formValue)) return formValue;

  const keys = new Set([...Object.keys(defaultValue), ...Object.keys(formValue)]);
  return Object.fromEntries(
    [...keys].map((key) => [
      key,
      mergeDefinedPreviewValues(defaultValue[key], formValue[key]),
    ]),
  );
}

export function getDocumentGeneratorPreviewData<T extends Record<string, unknown>>(
  defaultValues: T,
  formData: Partial<T> | undefined,
): T {
  return mergeDefinedPreviewValues(defaultValues, formData ?? {}) as T;
}

const generatorLoaders: Record<string, GeneratorLoader> = {
  'invoice': () => import('./invoice'),
  'rent-agreement-rc': () => import('./rent-agreement-rc'),
  'resume': () => import('./resume'),
  'offer-letter': () => import('./offer-letter'),
  'experience-letter': () => import('./experience-letter'),
  'salary-slip': () => import('./salary-slip'),
  'contract-nda': () => import('./contract-nda'),
  'rent-receipt': () => import('./rent-receipt'),
  'form-15g': () => import('./form-15g'),
  'form-15h': () => import('./form-15h'),
  'promissory-note': () => import('./promissory-note'),
  'warning-letter': () => import('./warning-letter'),
  'board-resolution-bank': () => import('./board-resolution-bank'),
  'will': () => import('./will'),
  'huf-affidavit': () => import('./huf-affidavit'),
  'rent-agreement-comm': () => import('./rent-agreement-comm'),
  'affidavit-name': () => import('./affidavit-name'),
  'affidavit-address': () => import('./affidavit-address'),
  'poa-general': () => import('./poa-general'),
  'poa-special': () => import('./poa-special'),
  'gift-deed': () => import('./gift-deed'),
  'relinquishment-deed': () => import('./relinquishment-deed'),
  'board-resolution-gst': () => import('./board-resolution-gst'),
  'llp-agreement': () => import('./llp-agreement'),
  'partnership-deed': () => import('./partnership-deed'),
  'gst-auth': () => import('./gst-auth'),
  'msme-decl': () => import('./msme-decl'),
  'society-noc': () => import('./society-noc'),
  'possession-letter': () => import('./possession-letter'),
  'leave-license': () => import('./leave-license'),
  'lease-deed': () => import('./lease-deed'),
  'founder-agreement': () => import('./founder-agreement'),
  'contract-service': () => import('./contract-service'),
  'report': () => import('./report'),
  'certificate': () => import('./certificate'),
  'form-12bb': () => import('./form-12bb'),
  'noc': () => import('./noc'),
  'legal-notice': () => import('./legal-notice'),
  'rti-application': () => import('./rti-application'),
  'consumer-complaint-letter': () => import('./consumer-complaint-letter'),
  'police-complaint-lost-document': () => import('./police-complaint-lost-document'),
  'general-affidavit': () => import('./general-affidavit'),
  'one-same-person-affidavit': () => import('./one-same-person-affidavit'),
  'bonafide-certificate': () => import('./bonafide-certificate'),
  'transfer-certificate': () => import('./transfer-certificate'),
  'student-fee-receipt': () => import('./student-fee-receipt'),
  'invitation-letter': () => import('./invitation-letter'),
  'marriage-biodata': () => import('./marriage-biodata'),
  'pension-request-application': () => import('./pension-request-application'),
};

const generatorExportNames: Record<string, string> = {
  'invoice': 'InvoiceGenerator',
  'rent-agreement-rc': 'RentAgreement',
  'resume': 'ResumeGenerator',
  'offer-letter': 'OfferLetterGenerator',
  'experience-letter': 'ExperienceLetterGenerator',
  'salary-slip': 'SalarySlipGenerator',
  'contract-nda': 'NDAGenerator',
  'rent-receipt': 'RentReceiptGenerator',
  'form-15g': 'Form15gGenerator',
  'form-15h': 'Form15hGenerator',
  'promissory-note': 'PromissoryNoteGenerator',
  'warning-letter': 'WarningLetterGenerator',
  'board-resolution-bank': 'BoardResolutionBankGenerator',
  'will': 'WillGenerator',
  'huf-affidavit': 'HufAffidavitGenerator',
  'rent-agreement-comm': 'CommercialLeaseGenerator',
  'affidavit-name': 'NameChangeAffidavitGenerator',
  'affidavit-address': 'AddressProofAffidavitGenerator',
  'poa-general': 'GeneralPOAGenerator',
  'poa-special': 'SpecialPOAGenerator',
  'gift-deed': 'GiftDeedGenerator',
  'relinquishment-deed': 'RelinquishmentDeedGenerator',
  'board-resolution-gst': 'BoardResolutionGSTGenerator',
  'llp-agreement': 'LLPAgreementGenerator',
  'partnership-deed': 'PartnershipDeedGenerator',
  'gst-auth': 'GSTAuthGenerator',
  'msme-decl': 'MSMEDeclGenerator',
  'society-noc': 'SocietyNocGenerator',
  'possession-letter': 'PossessionLetterGenerator',
  'leave-license': 'LeaveLicenseGenerator',
  'lease-deed': 'LeaseDeedGenerator',
  'founder-agreement': 'FounderAgreementGenerator',
  'contract-service': 'ServiceAgreementGenerator',
  'report': 'ReportGenerator',
  'certificate': 'CertificateGenerator',
  'form-12bb': 'Form12bbGenerator',
  'noc': 'NocGenerator',
  'legal-notice': 'LegalNoticeGenerator',
  'rti-application': 'RtiApplicationGenerator',
  'consumer-complaint-letter': 'ConsumerComplaintLetterGenerator',
  'police-complaint-lost-document': 'PoliceComplaintLostDocumentGenerator',
  'general-affidavit': 'GeneralAffidavitGenerator',
  'one-same-person-affidavit': 'OneSamePersonAffidavitGenerator',
  'bonafide-certificate': 'BonafideCertificateGenerator',
  'transfer-certificate': 'TransferCertificateGenerator',
  'student-fee-receipt': 'StudentFeeReceiptGenerator',
  'invitation-letter': 'InvitationLetterGenerator',
  'marriage-biodata': 'MarriageBiodataGenerator',
  'pension-request-application': 'PensionRequestApplicationGenerator',
};

export const DOCUMENT_GENERATOR_IDS = Object.keys(generatorLoaders);

export async function loadDocumentGenerator(type: string) {
  const loader = generatorLoaders[type];
  const exportName = generatorExportNames[type];
  if (!loader || !exportName) return null;

  const module = await loader();
  return module[exportName] || null;
}
