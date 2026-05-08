import { ShieldAlert } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const PoliceComplaintLostDocumentGenerator = createSimpleDocumentGenerator({
  id: 'police-complaint-lost-document',
  title: 'Police Complaint for Lost Document',
  description: 'Create a concise police intimation for lost IDs, certificates, or official records.',
  icon: ShieldAlert,
  documentTitle: 'Police Complaint for Lost Document',
  fields: [
    { name: 'senderName', label: 'Complainant Name', required: true },
    { name: 'documentDate', label: 'Complaint Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Bengaluru' },
    { name: 'senderAddress', label: 'Complainant Address', type: 'textarea', required: true, rows: 2 },
    { name: 'policeStation', label: 'Police Station', required: true },
    { name: 'lostDocument', label: 'Lost Document Name', required: true, placeholder: 'PAN card, marksheet, passport, etc.' },
    { name: 'documentNumber', label: 'Document Number', required: false },
    { name: 'lostDate', label: 'Date of Loss', type: 'date', required: true },
    { name: 'lostLocation', label: 'Approximate Place of Loss', required: true },
    { name: 'circumstances', label: 'Circumstances', type: 'textarea', required: true, rows: 3 },
  ],
  paragraphs: [
    'To, The Station House Officer, {{policeStation}}.',
    'Subject: Complaint regarding loss of {{lostDocument}}.',
    'I, {{senderName}}, residing at {{senderAddress}}, wish to report that my {{lostDocument}} bearing number {{documentNumber}} was lost on or around {{lostDate}} at/near {{lostLocation}}.',
    'The circumstances of loss are as follows: {{circumstances}}',
    'I request you to kindly record this complaint/intimation and issue an acknowledgement so that I may apply for duplicate/replacement documents with the concerned authority.',
    'I confirm that the information stated above is true to the best of my knowledge and belief.',
  ],
});
