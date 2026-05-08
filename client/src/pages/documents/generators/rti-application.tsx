import { FileQuestion } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const RtiApplicationGenerator = createSimpleDocumentGenerator({
  id: 'rti-application',
  title: 'RTI Application',
  description: 'Prepare a Right to Information request for public records and government information.',
  icon: FileQuestion,
  documentTitle: 'Application Under the Right to Information Act, 2005',
  fields: [
    { name: 'senderName', label: 'Applicant Name', required: true },
    { name: 'documentDate', label: 'Application Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'New Delhi' },
    { name: 'senderAddress', label: 'Applicant Address', type: 'textarea', required: true, rows: 2 },
    { name: 'publicAuthority', label: 'Public Authority / Department', required: true },
    { name: 'pioAddress', label: 'PIO Address', type: 'textarea', required: true, rows: 2 },
    { name: 'informationRequested', label: 'Information Requested', type: 'textarea', required: true, rows: 5 },
    { name: 'periodCovered', label: 'Period Covered', required: true, defaultValue: 'latest available records' },
    { name: 'deliveryMode', label: 'Preferred Delivery Mode', required: true, defaultValue: 'email or speed post' },
    { name: 'feeDetails', label: 'Application Fee Details', required: true, defaultValue: 'IPO / online RTI fee as applicable' },
  ],
  paragraphs: [
    'To, The Public Information Officer, {{publicAuthority}}, {{pioAddress}}.',
    'I, {{senderName}}, request the following information under Section 6(1) of the Right to Information Act, 2005.',
    'Information requested: {{informationRequested}}',
    'The period for which information is requested is {{periodCovered}}.',
    'The prescribed application fee is being submitted through {{feeDetails}}. Please provide the information through {{deliveryMode}}.',
    'If the requested information is held by another public authority, kindly transfer this application under Section 6(3) of the Act and inform me accordingly.',
  ],
  note: 'Do not request personal information about third parties unless a public-interest basis exists.',
});
