import { MessageSquareWarning } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const ConsumerComplaintLetterGenerator = createSimpleDocumentGenerator({
  id: 'consumer-complaint-letter',
  title: 'Consumer Complaint Letter',
  description: 'Write a formal complaint to a seller, service provider, or consumer support authority.',
  icon: MessageSquareWarning,
  documentTitle: 'Consumer Complaint Letter',
  fields: [
    { name: 'senderName', label: 'Consumer Name', required: true },
    { name: 'documentDate', label: 'Complaint Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Mumbai' },
    { name: 'senderAddress', label: 'Consumer Address', type: 'textarea', required: true, rows: 2 },
    { name: 'recipientName', label: 'Company / Seller Name', required: true },
    { name: 'recipientAddress', label: 'Company / Seller Address', type: 'textarea', required: true, rows: 2 },
    { name: 'productService', label: 'Product / Service', required: true },
    { name: 'invoiceDetails', label: 'Invoice / Order Details', required: true },
    { name: 'complaintDetails', label: 'Complaint Details', type: 'textarea', required: true, rows: 4 },
    { name: 'reliefRequested', label: 'Relief Requested', type: 'textarea', required: true, rows: 3 },
  ],
  paragraphs: [
    'To, {{recipientName}}, {{recipientAddress}}.',
    'Subject: Complaint regarding {{productService}}.',
    'I purchased/availed {{productService}} under {{invoiceDetails}}. I am writing to formally complain about the following issue: {{complaintDetails}}',
    'Despite reasonable expectation of quality, service, and fair dealing, the issue remains unresolved.',
    'I request you to provide the following relief: {{reliefRequested}}',
    'Please resolve this complaint within a reasonable time from receipt of this letter, failing which I may pursue appropriate remedies before the consumer helpline, consumer commission, or other competent authority.',
  ],
});
