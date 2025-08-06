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
  const formatDate = date => {
    if (!date || date === '1970-01-01') return '-';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? '-' : parsedDate.toLocaleDateString();
  };

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
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💳 Card Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-blue-700">Card Name:</span>
                <p className="font-medium">
                  {card.bank_name && card.last_four_digits
                    ? `${card.bank_name} ${card.last_four_digits}`
                    : card.card_name || 'Unknown Card'}
                </p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Days Inactive:</span>
                <p className="font-medium">{card.days_inactive || 0}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Last Used:</span>
                <p className="font-medium">
                  {card.last_used_date ? formatDate(card.last_used_date) : '❌ Never Used'}
                </p>
              </div>
              <div>
                <span className="text-sm text-blue-700">New Promo Available:</span>
                <p className="font-medium">{card.new_promo_available ? '✅ Yes' : '❌ No'}</p>
              </div>
              {card.interest_after_promo && (
                <div>
                  <span className="text-sm text-blue-700">Interest After Promo:</span>
                  <p className="font-medium">{card.interest_after_promo}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Promos */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🎯 Current Promos (
              {Array.isArray(card.current_promos) ? card.current_promos.length : 0})
            </h3>
            {Array.isArray(card.current_promos) && card.current_promos.length > 0 ? (
              <div className="space-y-4">
                {card.current_promos.map((promo, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">Promo #{index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-sm text-yellow-700">APR:</span>
                        <p className="font-medium">
                          {promo.promo_apr ? `${promo.promo_apr}%` : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-yellow-700">Amount:</span>
                        <p className="font-medium">{formatCurrency(promo.promo_amount)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-yellow-700">Expires:</span>
                        <p className="font-medium">{formatDate(promo.promo_expiry_date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-700">No active promos</p>
            )}
          </div>

          {/* Activity */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">📊 Activity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
