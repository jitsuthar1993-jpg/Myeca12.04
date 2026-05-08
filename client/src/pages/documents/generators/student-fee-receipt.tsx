import { ReceiptIndianRupee } from 'lucide-react';
import { createSimpleDocumentGenerator } from './simple-document-factory';

export const StudentFeeReceiptGenerator = createSimpleDocumentGenerator({
  id: 'student-fee-receipt',
  title: 'Student Fee Receipt',
  description: 'Prepare a clean education fee receipt for schools, coaching centers, and institutes.',
  icon: ReceiptIndianRupee,
  documentTitle: 'Student Fee Receipt',
  signatureLabel: 'Cashier / Accounts Officer',
  fields: [
    { name: 'senderName', label: 'Institution Name', required: true },
    { name: 'documentDate', label: 'Receipt Date', type: 'date', required: true },
    { name: 'place', label: 'Place', required: true, defaultValue: 'Hyderabad' },
    { name: 'senderAddress', label: 'Institution Address', type: 'textarea', required: true, rows: 2 },
    { name: 'receiptNumber', label: 'Receipt Number', required: true, defaultValue: 'FEE-001' },
    { name: 'studentName', label: 'Student Name', required: true },
    { name: 'classOrCourse', label: 'Class / Course', required: true },
    { name: 'feePeriod', label: 'Fee Period', required: true, defaultValue: 'Monthly fee' },
    { name: 'amount', label: 'Amount Received', required: true },
    { name: 'paymentMode', label: 'Payment Mode', type: 'select', required: true, options: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'] },
    { name: 'transactionReference', label: 'Transaction Reference', required: false },
  ],
  paragraphs: [
    'Receipt No.: {{receiptNumber}}.',
    'Received from {{studentName}}, enrolled in {{classOrCourse}}, a sum of Rs. {{amount}} towards {{feePeriod}}.',
    'Payment mode: {{paymentMode}}. Transaction reference: {{transactionReference}}.',
    'This receipt is issued by {{senderName}} on {{documentDate}} at {{place}}.',
  ],
});
