import { UserCheck } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const OneSamePersonAffidavitGenerator = createSimpleDocumentGenerator({
  id: 'one-same-person-affidavit',
  title: 'One & Same Person Affidavit',
  description: 'Declare that differently written names in records belong to the same person.',
  icon: UserCheck,
  documentTitle: 'One and the Same Person Affidavit',
  signatureLabel: 'Deponent',
  fields: [
    { name: 'senderName', label: 'Correct Full Name', required: true },
    { name: 'documentDate', label: 'Execution Date', type: 'date', required: true },
    { name: 'place', label: 'Execution Place', required: true, defaultValue: 'Mumbai' },
    { name: 'senderAddress', label: 'Address', type: 'textarea', required: true, rows: 2 },
    { name: 'age', label: 'Age', required: true },
    { name: 'fatherOrSpouse', label: 'Father / Spouse Name', required: true },
    { name: 'alternateNames', label: 'Alternate Name Spellings', type: 'textarea', required: true, rows: 3 },
    { name: 'records', label: 'Records Where Variations Appear', type: 'textarea', required: true, rows: 3 },
    { name: 'purpose', label: 'Purpose', required: true, defaultValue: 'record correction and official verification' },
  ],
  paragraphs: [
    'I, {{senderName}}, aged about {{age}} years, son/daughter/spouse of {{fatherOrSpouse}}, residing at {{senderAddress}}, do hereby solemnly affirm and declare as under:',
  ],
  sections: [
    {
      title: 'Declaration',
      items: [
        'That my correct full name is {{senderName}}.',
        'That the following name variations appearing in documents also refer to me and to no other person: {{alternateNames}}.',
        'That the name variations appear in the following records: {{records}}.',
        'That this affidavit is executed for {{purpose}}.',
        'That all statements made above are true and correct to the best of my knowledge and belief.',
      ],
    },
  ],
  note: 'Attach copies of the relevant records when submitting this affidavit.',
});
