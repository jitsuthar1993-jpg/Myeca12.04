import { Landmark } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const PensionRequestApplicationGenerator = createSimpleDocumentGenerator({
  id: 'pension-request-application',
  title: 'Pension Request Application',
  description: 'Draft a pension start, correction, life certificate, or arrears request application.',
  icon: Landmark,
  documentTitle: 'Pension Request Application',
  fields: [
    { name: 'senderName', label: 'Applicant / Pensioner Name', required: true },
    { name: 'documentDate', label: 'Application Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Lucknow' },
    { name: 'senderAddress', label: 'Applicant Address', type: 'textarea', required: true, rows: 2 },
    { name: 'recipientName', label: 'Office / Department', required: true },
    { name: 'recipientAddress', label: 'Office Address', type: 'textarea', required: true, rows: 2 },
    { name: 'pensionId', label: 'Pension PPO / Account No.', required: false },
    { name: 'requestType', label: 'Request Type', type: 'select', required: true, options: ['Start pension', 'Pension correction', 'Arrears request', 'Life certificate update', 'Other pension request'] },
    { name: 'requestDetails', label: 'Request Details', type: 'textarea', required: true, rows: 4 },
    { name: 'attachments', label: 'Attachments', type: 'textarea', required: false, rows: 2 },
  ],
  paragraphs: [
    'To, {{recipientName}}, {{recipientAddress}}.',
    'Subject: {{requestType}}.',
    'I, {{senderName}}, request your office to process the following pension-related request. Pension/PPO/account details: {{pensionId}}.',
    '{{requestDetails}}',
    'I am enclosing/submitting the following supporting documents: {{attachments}}.',
    'Kindly process the request and inform me if any additional information or verification is required.',
  ],
});
