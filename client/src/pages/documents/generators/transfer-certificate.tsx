import { GraduationCap } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const TransferCertificateGenerator = createSimpleDocumentGenerator({
  id: 'transfer-certificate',
  title: 'Transfer Certificate',
  description: 'Create a structured school or college transfer certificate draft.',
  icon: GraduationCap,
  documentTitle: 'Transfer Certificate',
  signatureLabel: 'Principal / Authorised Signatory',
  fields: [
    { name: 'senderName', label: 'Institution Name', required: true },
    { name: 'documentDate', label: 'Issue Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Chennai' },
    { name: 'senderAddress', label: 'Institution Address', type: 'textarea', required: true, rows: 2 },
    { name: 'studentName', label: 'Student Name', required: true },
    { name: 'admissionNumber', label: 'Admission Number', required: true },
    { name: 'parentName', label: 'Parent / Guardian Name', required: true },
    { name: 'classLastStudied', label: 'Class / Course Last Studied', required: true },
    { name: 'dateOfAdmission', label: 'Date of Admission', type: 'date', required: true },
    { name: 'dateOfLeaving', label: 'Date of Leaving', type: 'date', required: true },
    { name: 'reasonForLeaving', label: 'Reason for Leaving', required: true },
    { name: 'conduct', label: 'Conduct', required: true, defaultValue: 'Good' },
  ],
  paragraphs: [
    'This is to certify that {{studentName}}, son/daughter of {{parentName}}, bearing admission number {{admissionNumber}}, was admitted to {{senderName}} on {{dateOfAdmission}}.',
    'The student last studied in {{classLastStudied}} and left the institution on {{dateOfLeaving}} due to {{reasonForLeaving}}.',
    'As per the records of the institution, the conduct of the student was {{conduct}}.',
    'This certificate is issued on request for further education/admission purposes.',
  ],
});
