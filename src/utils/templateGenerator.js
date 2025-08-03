import * as XLSX from 'xlsx';

export const generateUploadTemplate = () => {
  const templateData = [
    {
      'Card Holder': 'John Doe',
      Bank: 'Chase',
      'Card Type': 'Credit',
      'Card Last4': '1234',
      'Amount Due': '150.00',
      'Min Payment Due': '25.00',
      'Due Date': '2025-02-15',
      'Last Used Date': '2025-01-20',
      'Credit Limit': '5000.00',
      'Promo Used': 'true',
      'Promo Amount Due': '100.00',
      'Promo Expiry Date': '2025-06-30',
      'Promo APR': '0.00',
      'APR After': '18.99',
      'Interest Charge': '0.00',
      Notes: 'Sample card entry',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Credit Cards Template');

  // Generate file and download
  XLSX.writeFile(wb, 'credit-cards-upload-template.xlsx');
};
