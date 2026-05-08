import { BadgeCheck } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const BonafideCertificateGenerator = createSimpleDocumentGenerator({
  id: 'bonafide-certificate',
  title: 'Bonafide Certificate',
  description: 'Generate a school, college, or organization bonafide certificate format.',
  icon: BadgeCheck,
  documentTitle: 'Bonafide Certificate',
  signatureLabel: 'Authorised Signatory',
  fields: [
    { name: 'senderName', label: 'Institution / Organization Name', required: true },
    { name: 'documentDate', label: 'Issue Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Pune' },
    { name: 'senderAddress', label: 'Institution Address', type: 'textarea', required: true, rows: 2 },
    { name: 'studentName', label: 'Student / Member Name', required: true },
    { name: 'identifier', label: 'Roll No. / Employee ID', required: false },
    { name: 'courseOrRole', label: 'Course / Class / Role', required: true },
    { name: 'period', label: 'Period', required: true, defaultValue: 'current academic year' },
    { name: 'purpose', label: 'Purpose', required: true, defaultValue: 'official submission' },
    { name: 'signatoryName', label: 'Signatory Name', required: true },
    { name: 'designation', label: 'Designation', required: true, defaultValue: 'Principal / Authorised Signatory' },
  ],
  paragraphs: [
    'This is to certify that {{studentName}}, bearing identifier {{identifier}}, is a bonafide student/member of {{senderName}}, {{senderAddress}}.',
    'The student/member is enrolled/associated as {{courseOrRole}} for {{period}}.',
    'This certificate is issued upon request for {{purpose}}.',
    'Issued by {{signatoryName}}, {{designation}}, at {{place}} on {{documentDate}}.',
  ],
});
