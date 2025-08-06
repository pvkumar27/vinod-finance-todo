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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">💳 Card Details</h2>
            <p className="text-sm text-gray-600">Complete information about your credit card</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Card Info */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-5 flex items-center">
              💳 Card Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-sm font-medium text-blue-700">Card Name:</span>
                <p className="font-semibold text-gray-900 text-lg">
                  {card.bank_name && card.last_four_digits
                    ? `${card.bank_name} ${card.last_four_digits}`
                    : card.card_name || 'Unknown Card'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-blue-700">Days Inactive:</span>
                <p className="font-semibold text-gray-900 text-lg">{card.days_inactive || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-blue-700">Last Used:</span>
                <p className="font-semibold text-gray-900">
                  {card.last_used_date ? formatDate(card.last_used_date) : '❌ Never Used'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-blue-700">New Promo Available:</span>
                <p className="font-semibold">
                  <span className={card.new_promo_available ? 'text-green-600' : 'text-gray-600'}>
                    {card.new_promo_available ? '✅ Yes' : '❌ No'}
                  </span>
                </p>
              </div>
              {card.interest_after_promo && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-blue-700">Interest After Promo:</span>
                  <p className="font-semibold text-gray-900">{card.interest_after_promo}%</p>
                </div>
              )}
              {card.notes && (
                <div className="space-y-1 md:col-span-2">
                  <span className="text-sm font-medium text-blue-700">Notes:</span>
                  <p className="font-medium text-gray-700 bg-white rounded-lg p-3 border border-blue-200">
                    {card.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Current Promos */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-xl font-semibold text-yellow-900 mb-5 flex items-center">
              🎯 Current Promos
              <span className="ml-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold">
                {Array.isArray(card.current_promos) ? card.current_promos.length : 0}
              </span>
            </h3>
            {Array.isArray(card.current_promos) && card.current_promos.length > 0 ? (
              <div className="space-y-4">
                {card.current_promos.map((promo, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm"
                  >
                    <h4 className="font-semibold text-yellow-900 mb-4 text-lg">
                      Promo #{index + 1}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-yellow-700">APR:</span>
                        <p className="font-semibold text-gray-900 text-lg">
                          {promo.promo_apr ? `${promo.promo_apr}%` : '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-yellow-700">Amount:</span>
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(promo.promo_amount)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-yellow-700">Expires:</span>
                        <p className="font-semibold text-gray-900">
                          {formatDate(promo.promo_expiry_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🚫</div>
                <p className="text-yellow-700 font-medium">No active promos</p>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-900 mb-5 flex items-center">
              📊 Activity Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-sm font-medium text-green-700">Created:</span>
                <p className="font-semibold text-gray-900">{formatDate(card.created_at)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-green-700">Last Updated:</span>
                <p className="font-semibold text-gray-900">{formatDate(card.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(card)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            ✏️ Edit Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDetailModal;
