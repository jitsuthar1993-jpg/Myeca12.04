import { Scale } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const LegalNoticeGenerator = createSimpleDocumentGenerator({
  id: 'legal-notice',
  title: 'Legal Notice',
  description: 'Draft a formal notice before initiating recovery, contract, property, or service disputes.',
  icon: Scale,
  documentTitle: 'Legal Notice',
  fields: [
    { name: 'senderName', label: 'Sender Name', required: true },
    { name: 'documentDate', label: 'Notice Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'New Delhi' },
    { name: 'senderAddress', label: 'Sender Address', type: 'textarea', required: true, rows: 2 },
    { name: 'recipientName', label: 'Recipient Name', required: true },
    { name: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: true, rows: 2 },
    { name: 'matter', label: 'Matter / Subject', required: true, colSpan: 2 },
    { name: 'facts', label: 'Key Facts', type: 'textarea', required: true, rows: 4 },
    { name: 'demand', label: 'Demand / Relief Sought', type: 'textarea', required: true, rows: 3 },
    { name: 'responseDays', label: 'Response Period', required: true, defaultValue: '15 days' },
  ],
  paragraphs: [
    'To, {{recipientName}}, {{recipientAddress}}.',
    'Subject: {{matter}}.',
    'Under instructions from and on behalf of {{senderName}}, this notice is issued to record the following facts and demands.',
    '{{facts}}',
    'You are hereby called upon to comply with the following demand within {{responseDays}} from receipt of this notice: {{demand}}',
    'If you fail to comply within the stated period, the sender reserves the right to take appropriate civil, criminal, regulatory, or other legal remedies at your risk as to cost and consequences.',
  ],
  note: 'This is a drafting aid. Have a qualified professional review the notice before dispatch where legal rights or limitation periods are involved.',
});
