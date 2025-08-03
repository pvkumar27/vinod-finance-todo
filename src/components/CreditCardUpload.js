import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { generateUploadTemplate } from '../utils/templateGenerator';

const CreditCardUpload = () => {
  const [, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Header normalization mapping
  const headerMap = {
    bank: 'bank',
    'card type': 'card_type',
    'card holder': 'card_holder',
    'card last4': 'card_last4',
    'last 4': 'card_last4',
    'amount due': 'amount_due',
    'min payment due': 'min_payment_due',
    'due date': 'due_date',
    'last used date': 'last_used_date',
    'credit limit': 'credit_limit',
    'promo available': 'promo_available',
    'promo used': 'promo_used',
    'promo amount due': 'promo_amount_due',
    'promo expiry date': 'promo_expiry_date',
    'promo apr': 'promo_apr',
    'apr after': 'apr_after',
    'interest charge': 'interest_charge',
    notes: 'notes',
  };

  const normalizeHeader = header => {
    const normalized = header.toLowerCase().trim();
    return headerMap[normalized] || normalized.replace(/\s+/g, '_');
  };

  const parseDate = value => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  };

  const parseNumber = value => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  const parseBoolean = value => {
    if (!value) return false;
    return ['true', '1', 'yes', 'y'].includes(value.toString().toLowerCase());
  };

  const handleFileUpload = event => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setMessage('');

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setMessage('❌ No data found in the Excel file');
          return;
        }

        // Process and normalize data
        const processedData = jsonData.map((row, index) => {
          const normalizedRow = {};

          Object.keys(row).forEach(key => {
            const normalizedKey = normalizeHeader(key);
            let value = row[key];

            // Convert based on field type
            if (['due_date', 'last_used_date', 'promo_expiry_date'].includes(normalizedKey)) {
              value = parseDate(value);
            } else if (
              [
                'amount_due',
                'min_payment_due',
                'credit_limit',
                'promo_amount_due',
                'promo_apr',
                'apr_after',
                'interest_charge',
              ].includes(normalizedKey)
            ) {
              value = parseNumber(value);
            } else if (['promo_available', 'promo_used'].includes(normalizedKey)) {
              value = parseBoolean(value);
            }

            normalizedRow[normalizedKey] = value;
          });

          return { ...normalizedRow, _rowIndex: index + 1 };
        });

        setParsedData(processedData);
        setMessage(`✅ Successfully parsed ${processedData.length} rows`);
      } catch (error) {
        setMessage(`❌ Error parsing file: ${error.message}`);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) {
      setMessage('❌ No data to upload');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Prepare data for insertion
      const dataToInsert = parsedData.map(row => {
        const { _rowIndex, ...cleanRow } = row;
        return {
          ...cleanRow,
          user_id: user.id,
          source: 'manual',
        };
      });

      // Insert into Supabase
      const { error } = await supabase.from('credit_cards_manual').insert(dataToInsert);

      if (error) throw error;

      setMessage(`🎉 Successfully uploaded ${parsedData.length} credit cards!`);
      setParsedData([]);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
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
    XLSX.writeFile(wb, 'credit-cards-upload-template.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">📤</span>
          Upload Credit Cards
        </h2>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upload Form - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* File Upload Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    Select Excel File (.xlsx or .xls)
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    aria-describedby="file-upload-help"
                  />
                  <p id="file-upload-help" className="mt-2 text-xs text-gray-500">
                    Upload your Excel file with credit card data
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center"
                    aria-label="Download Excel template file"
                  >
                    <span className="mr-2">📥</span>
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('❌')
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}
                role="alert"
              >
                {message}
              </div>
            )}

            {/* Submit Button */}
            {parsedData.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
                  aria-label={loading ? 'Uploading data to database' : 'Submit data to database'}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Submit to Database
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Instructions - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Upload Instructions
              </h3>
              <div className="space-y-3 text-sm text-blue-700">
                <div>
                  <h4 className="font-medium mb-2">Required Fields:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Card Holder (text)</li>
                    <li>• Bank (text)</li>
                    <li>• Card Type (Credit/Store/Other)</li>
                    <li>• Card Last4 (4 digits)</li>
                    <li>• Amount Due (number)</li>
                    <li>• Due Date (YYYY-MM-DD)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Format Guidelines:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Dates: YYYY-MM-DD format</li>
                    <li>• Numbers: No currency symbols</li>
                    <li>• Booleans: true/false or yes/no</li>
                    <li>• Files: .xlsx or .xls only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Table */}
        {parsedData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Preview ({parsedData.length} rows)
            </h3>
            <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Row
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Bank
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Card Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Card Holder
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Last 4
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount Due
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Credit Limit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{row._rowIndex}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.bank || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.card_type || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.card_holder || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.card_last4 || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {row.amount_due ? `$${row.amount_due}` : '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.due_date || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {row.credit_limit ? `$${row.credit_limit}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardUpload;
