import { DocumentGeneratorConfig } from './types';
import { InvoiceGenerator } from './invoice';
import { RentAgreement } from './rent-agreement-rc';
import { ResumeGenerator } from './resume';
import { OfferLetterGenerator } from './offer-letter';
import { ExperienceLetterGenerator } from './experience-letter';
import { SalarySlipGenerator } from './salary-slip';
import { NDAGenerator } from './contract-nda';
import { RentReceiptGenerator } from './rent-receipt';
import { Form15gGenerator } from './form-15g';
import { Form15hGenerator } from './form-15h';
import { PromissoryNoteGenerator } from './promissory-note';
import { WarningLetterGenerator } from './warning-letter';
import { BoardResolutionBankGenerator } from './board-resolution-bank';
import { WillGenerator } from './will';
import { CommercialLeaseGenerator } from './rent-agreement-comm';
import { NameChangeAffidavitGenerator } from './affidavit-name';
import { AddressProofAffidavitGenerator } from './affidavit-address';
import { GeneralPOAGenerator } from './poa-general';
import { SpecialPOAGenerator } from './poa-special';
import { GiftDeedGenerator } from './gift-deed';
import { RelinquishmentDeedGenerator } from './relinquishment-deed';
import { BoardResolutionGSTGenerator } from './board-resolution-gst';
import { LLPAgreementGenerator } from './llp-agreement';
import { PartnershipDeedGenerator } from './partnership-deed';
import { GSTAuthGenerator } from './gst-auth';
import { MSMEDeclGenerator } from './msme-decl';
import { SocietyNocGenerator } from './society-noc';
import { PossessionLetterGenerator } from './possession-letter';
import { LeaveLicenseGenerator } from './leave-license';
import { LeaseDeedGenerator } from './lease-deed';
import { FounderAgreementGenerator } from './founder-agreement';
import { ServiceAgreementGenerator } from './contract-service';
import { ReportGenerator } from './report';
// Mapping of document type ID to its respective Generator Config
export const DOCUMENT_GENERATORS: Record<string, DocumentGeneratorConfig> = {
  'invoice': InvoiceGenerator,
  'rent-agreement-rc': RentAgreement,
  'resume': ResumeGenerator,
  'offer-letter': OfferLetterGenerator,
  'experience-letter': ExperienceLetterGenerator,
  'salary-slip': SalarySlipGenerator,
  'contract-nda': NDAGenerator,
  'rent-receipt': RentReceiptGenerator,
  'form-15g': Form15gGenerator,
  'form-15h': Form15hGenerator,
  'promissory-note': PromissoryNoteGenerator,
  'warning-letter': WarningLetterGenerator,
  'board-resolution-bank': BoardResolutionBankGenerator,
  'will': WillGenerator,
  'rent-agreement-comm': CommercialLeaseGenerator,
  'affidavit-name': NameChangeAffidavitGenerator,
  'affidavit-address': AddressProofAffidavitGenerator,
  'poa-general': GeneralPOAGenerator,
  'poa-special': SpecialPOAGenerator,
  'gift-deed': GiftDeedGenerator,
  'relinquishment-deed': RelinquishmentDeedGenerator,
  'board-resolution-gst': BoardResolutionGSTGenerator,
  'llp-agreement': LLPAgreementGenerator,
  'partnership-deed': PartnershipDeedGenerator,
  'gst-auth': GSTAuthGenerator,
  'msme-decl': MSMEDeclGenerator,
  'society-noc': SocietyNocGenerator,
  'possession-letter': PossessionLetterGenerator,
  'leave-license': LeaveLicenseGenerator,
  'lease-deed': LeaseDeedGenerator,
  'founder-agreement': FounderAgreementGenerator,
  'contract-service': ServiceAgreementGenerator,
  'report': ReportGenerator,
  // Add more modular exports here as you build them.
};
