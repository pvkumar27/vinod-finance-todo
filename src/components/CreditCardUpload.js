import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

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
    'apr after promo': 'apr_after',
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
    if (isNaN(date.getTime())) return null;
    const dateStr = date.toISOString().split('T')[0];
    // Treat 1970-01-01 as invalid date (Unix epoch)
    if (dateStr === '1970-01-01') return null;
    return dateStr;
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

      // Prepare data for insertion - only include known columns
      const allowedColumns = [
        'bank',
        'card_type',
        'card_holder',
        'card_last4',
        'amount_due',
        'min_payment_due',
        'due_date',
        'last_used_date',
        'credit_limit',
        'promo_available',
        'promo_used',
        'promo_amount_due',
        'promo_expiry_date',
        'promo_apr',
        'apr_after',
        'interest_charge',
        'notes',
      ];

      const dataToInsert = parsedData.map(row => {
        const { _rowIndex, ...cleanRow } = row;
        const filteredRow = {};

        // Only include allowed columns
        allowedColumns.forEach(col => {
          if (cleanRow[col] !== undefined) {
            filteredRow[col] = cleanRow[col];
          }
        });

        return {
          ...filteredRow,
          user_id: user.id,
          source: 'manual',
        };
      });

      // Insert into Supabase
      const { error } = await supabase.from('credit_cards_manual').insert(dataToInsert);

      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Data being inserted:', dataToInsert[0]);
        throw error;
      }

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
        'Promo Available': 'true',
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">📤</span>
            Upload Credit Cards
          </h2>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="mt-4">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
              {/* Upload Form - Left Side */}
              <div className="flex-1">
                {/* File Upload Section */}
                <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200 shadow-md h-full min-h-[280px] flex flex-col justify-center">
                  <div className="flex flex-col gap-4">
                    <div>
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center justify-center mb-4"
                        aria-label="Download Excel template file"
                      >
                        <span className="mr-2">📥</span>
                        Download Template
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor="file-upload"
                        className="block text-lg font-semibold text-gray-700 flex items-center mb-4"
                      >
                        <span className="mr-2">📂</span>
                        Select Excel File (.xlsx or .xls)
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="block w-full text-base text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        aria-describedby="file-upload-help"
                      />
                      <p id="file-upload-help" className="mt-3 text-sm text-gray-500">
                        Upload your Excel file with credit card data
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message - Only show error messages */}
                {message && message.includes('❌') && (
                  <div
                    className="bg-red-100 text-red-700 border border-red-200 p-3 rounded-lg text-sm mt-6"
                    role="alert"
                  >
                    {message}
                  </div>
                )}
              </div>

              {/* Instructions - Right Side */}
              <div className="flex-1 mt-6 md:mt-0">
                <div className="bg-blue-50 rounded-lg p-5 md:p-6 border border-blue-200 shadow-sm h-full">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Upload Instructions
                  </h3>
                  <div className="space-y-4 text-sm text-blue-700 text-left">
                    <div>
                      <h4 className="font-medium mb-2">Required Fields:</h4>
                      <ul className="space-y-1 text-xs pl-2">
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
                      <ul className="space-y-1 text-xs pl-2">
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
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="mt-6">
              {/* Success Message */}
              <div className="bg-green-100 text-green-800 border-l-4 border-green-600 rounded-md px-4 py-2">
                ✅ Successfully parsed {parsedData.length}{' '}
                {parsedData.length === 1 ? 'row' : 'rows'}
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-md shadow-sm p-4 mt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Row</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Bank
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Card Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Card Holder
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Last 4
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                          Amount Due
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                          Credit Limit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'even:bg-gray-50'}`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900">{row._rowIndex}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{row.bank || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row.card_type || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row.card_holder || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {row.card_last4 || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {row.amount_due ? `$${row.amount_due}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {row.due_date || '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {row.credit_limit ? `$${row.credit_limit}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-right text-sm font-semibold text-gray-700">
                    Total Due: $
                    {parsedData.reduce((sum, row) => sum + (row.amount_due || 0), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Submit Button and Clear Link */}
              <div className="mt-4 flex justify-between items-center">
                <div className="flex justify-center flex-1">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 font-semibold rounded-md shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
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

                <button
                  onClick={() => {
                    setParsedData([]);
                    setFile(null);
                    const fileInput = document.getElementById('file-upload');
                    if (fileInput) fileInput.value = '';
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditCardUpload;
