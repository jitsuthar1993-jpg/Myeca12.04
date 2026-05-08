import { HeartHandshake } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const MarriageBiodataGenerator = createSimpleDocumentGenerator({
  id: 'marriage-biodata',
  title: 'Marriage Biodata',
  description: 'Create a simple, printable matrimonial profile with family and contact details.',
  icon: HeartHandshake,
  documentTitle: 'Marriage Biodata',
  signatureLabel: 'Profile Contact',
  fields: [
    { name: 'senderName', label: 'Candidate Name', required: true },
    { name: 'documentDate', label: 'Prepared On', type: 'date', required: true },
    { name: 'place', label: 'Current City', required: true, defaultValue: 'Jaipur' },
    { name: 'senderAddress', label: 'Current Address', type: 'textarea', required: true, rows: 2 },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'height', label: 'Height', required: true },
    { name: 'education', label: 'Education', required: true },
    { name: 'profession', label: 'Profession', required: true },
    { name: 'familyDetails', label: 'Family Details', type: 'textarea', required: true, rows: 3 },
    { name: 'partnerPreference', label: 'Partner Preference', type: 'textarea', required: false, rows: 3 },
    { name: 'contactDetails', label: 'Contact Details', type: 'textarea', required: true, rows: 2 },
  ],
  paragraphs: [
    'Name: {{senderName}}.',
    'Date of Birth: {{dateOfBirth}}. Height: {{height}}. Current City: {{place}}.',
    'Education: {{education}}.',
    'Profession: {{profession}}.',
    'Family Details: {{familyDetails}}',
    'Partner Preference: {{partnerPreference}}',
    'Contact Details: {{contactDetails}}',
  ],
});
