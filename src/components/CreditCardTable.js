import React from 'react';

const CreditCardTable = ({
  cards,
  reminders,
  onEditCard,
  onDeleteCard,
  onSetReminder,
  onViewCard,
  getInactivityBadge,
  getPromoExpiryBadge,
  formatCurrency,
  formatDate,
  selectedCards = [],
  onCardSelect,
  selectAll,
  onSelectAll,
  onBulkDelete,
}) => {
  const getCardReminders = cardId => {
    return reminders.filter(r => r.card_id === cardId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ minWidth: '800px' }}>
        <thead className="bg-gray-50">
          <tr>
            <th className="w-[40px] text-center px-2 py-2">
              <div className="flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onSelectAll}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Card Holder
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Bank
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Last 4
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Amount Due
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Promo Expiry
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Last Used
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cards.map(card => (
            <tr
              key={card.id}
              className={`hover:bg-gray-50 ${selectedCards.includes(card.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <td className="w-[40px] text-center px-2 py-2">
                <div className="flex justify-center items-center">
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(card.id)}
                    onChange={() => onCardSelect && onCardSelect(card.id)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                {(card.card_holder || 'Unknown').split(' ')[0]}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{card.bank}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                {card.card_type}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                {card.card_last4 ? `••••${card.card_last4}` : '-'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-red-600">
                {formatCurrency(card.amount_due)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                {formatDate(card.promo_expiry_date)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                {card.last_used_date ? formatDate(card.last_used_date) : '❌ Never'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm">
                <div className="flex gap-1">
                  {getInactivityBadge(card.last_used_date) && (
                    <span className="inline-flex px-1 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700">
                      ⚠️
                    </span>
                  )}
                  {getPromoExpiryBadge(card.promo_expiry_date) && (
                    <span className="inline-flex px-1 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-700">
                      ⏳
                    </span>
                  )}
                  {getCardReminders(card.id).length > 0 && (
                    <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                      🔔{getCardReminders(card.id).length}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm">
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewCard(card)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="View details"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => onSetReminder(card)}
                    className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Set reminder"
                  >
                    🔔
                  </button>
                  <button
                    onClick={() => onEditCard(card)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit card"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCard(card)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete card"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreditCardTable;
