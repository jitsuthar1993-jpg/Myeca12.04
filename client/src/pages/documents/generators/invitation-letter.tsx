import { MailPlus } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const InvitationLetterGenerator = createSimpleDocumentGenerator({
  id: 'invitation-letter',
  title: 'Invitation Letter',
  description: 'Draft an invitation for visa, business, event, or personal visit purposes.',
  icon: MailPlus,
  documentTitle: 'Invitation Letter',
  fields: [
    { name: 'senderName', label: 'Inviter Name', required: true },
    { name: 'documentDate', label: 'Letter Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Ahmedabad' },
    { name: 'senderAddress', label: 'Inviter Address', type: 'textarea', required: true, rows: 2 },
    { name: 'recipientName', label: 'Invitee / Recipient Name', required: true },
    { name: 'recipientAddress', label: 'Invitee Address', type: 'textarea', required: false, rows: 2 },
    { name: 'eventPurpose', label: 'Purpose / Event', required: true },
    { name: 'eventDate', label: 'Event / Visit Date', type: 'date', required: true },
    { name: 'eventVenue', label: 'Venue / Destination', required: true },
    { name: 'relationship', label: 'Relationship / Business Context', required: true },
    { name: 'supportDetails', label: 'Support / Responsibility Details', type: 'textarea', required: false, rows: 3 },
  ],
  paragraphs: [
    'To, {{recipientName}}, {{recipientAddress}}.',
    'I, {{senderName}}, residing at {{senderAddress}}, am pleased to invite you for {{eventPurpose}} scheduled on {{eventDate}} at {{eventVenue}}.',
    'The invitee is known to me as {{relationship}}.',
    '{{supportDetails}}',
    'This letter is issued to support the stated visit/event and may be submitted to the concerned authority or organization if required.',
  ],
});
