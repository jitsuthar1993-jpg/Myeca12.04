import { FileSignature } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const GeneralAffidavitGenerator = createSimpleDocumentGenerator({
  id: 'general-affidavit',
  title: 'General Affidavit',
  description: 'Prepare a sworn statement for common administrative, banking, and legal submissions.',
  icon: FileSignature,
  documentTitle: 'General Affidavit',
  signatureLabel: 'Deponent',
  fields: [
    { name: 'senderName', label: 'Deponent Name', required: true },
    { name: 'documentDate', label: 'Execution Date', type: 'date', required: true },
    { name: 'place', label: 'Execution Place', required: true, defaultValue: 'Delhi' },
    { name: 'senderAddress', label: 'Deponent Address', type: 'textarea', required: true, rows: 2 },
    { name: 'age', label: 'Age', required: true },
    { name: 'fatherOrSpouse', label: 'Father / Spouse Name', required: true },
    { name: 'purpose', label: 'Purpose of Affidavit', required: true },
    { name: 'statementOne', label: 'Statement 1', type: 'textarea', required: true, rows: 2 },
    { name: 'statementTwo', label: 'Statement 2', type: 'textarea', required: false, rows: 2 },
    { name: 'statementThree', label: 'Statement 3', type: 'textarea', required: false, rows: 2 },
  ],
  paragraphs: [
    'I, {{senderName}}, aged about {{age}} years, son/daughter/spouse of {{fatherOrSpouse}}, residing at {{senderAddress}}, do hereby solemnly affirm and declare as under:',
  ],
  sections: [
    {
      title: 'Declaration',
      items: [
        'That this affidavit is made for {{purpose}}.',
        '{{statementOne}}',
        '{{statementTwo}}',
        '{{statementThree}}',
        'That the contents of this affidavit are true and correct to the best of my knowledge and belief.',
      ],
    },
  ],
  note: 'Execute on appropriate stamp paper and notarise where required by the receiving authority.',
});
