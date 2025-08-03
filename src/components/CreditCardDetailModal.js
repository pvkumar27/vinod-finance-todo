import React, { useEffect } from 'react';

const CreditCardDetailModal = ({ card, isOpen, onClose, onEdit }) => {
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  const formatCurrency = amount => (amount ? `$${amount.toLocaleString()}` : '-');
  const formatDate = date => (date ? new Date(date).toLocaleDateString() : '-');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">💳 Card Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Card Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📇 Card Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-blue-700">Card Holder:</span>
                <p className="font-medium">{card.card_holder || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Bank:</span>
                <p className="font-medium">{card.bank}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Card Type:</span>
                <p className="font-medium">{card.card_type}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Last 4 Digits:</span>
                <p className="font-medium">{card.card_last4 ? `••••${card.card_last4}` : '-'}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Credit Limit:</span>
                <p className="font-medium">{formatCurrency(card.credit_limit)}</p>
              </div>
            </div>
          </div>

          {/* Due Details */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-3">📅 Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-red-700">Amount Due:</span>
                <p className="font-medium text-red-800">{formatCurrency(card.amount_due)}</p>
              </div>
              <div>
                <span className="text-sm text-red-700">Minimum Payment:</span>
                <p className="font-medium">{formatCurrency(card.min_payment_due)}</p>
              </div>
              <div>
                <span className="text-sm text-red-700">Due Date:</span>
                <p className="font-medium">{formatDate(card.due_date)}</p>
              </div>
              <div>
                <span className="text-sm text-red-700">Interest Charge:</span>
                <p className="font-medium">{formatCurrency(card.interest_charge)}</p>
              </div>
            </div>
          </div>

          {/* Promo Info */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🧾 Promotional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-yellow-700">Promo Available:</span>
                <p className="font-medium">{card.promo_available ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <span className="text-sm text-yellow-700">Promo Used:</span>
                <p className="font-medium">{card.promo_used ? '✅ Yes' : '❌ No'}</p>
              </div>
              {card.promo_used && (
                <>
                  <div>
                    <span className="text-sm text-yellow-700">Promo Amount:</span>
                    <p className="font-medium">{formatCurrency(card.promo_amount_due)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-yellow-700">Promo APR:</span>
                    <p className="font-medium">{card.promo_apr ? `${card.promo_apr}%` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-yellow-700">Promo Expires:</span>
                    <p className="font-medium">{formatDate(card.promo_expiry_date)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-yellow-700">APR After Promo:</span>
                    <p className="font-medium">{card.apr_after ? `${card.apr_after}%` : '-'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">📊 Activity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-green-700">Last Used:</span>
                <p className="font-medium">
                  {card.last_used_date ? formatDate(card.last_used_date) : '❌ Never Used'}
                </p>
              </div>
              <div>
                <span className="text-sm text-green-700">Created:</span>
                <p className="font-medium">{formatDate(card.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-green-700">Last Updated:</span>
                <p className="font-medium">{formatDate(card.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {card.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Notes</h3>
              <p className="text-gray-700">{card.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(card)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ✏️ Edit Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDetailModal;
