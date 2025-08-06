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
  formatDate,
  selectedCards = [],
  onCardSelect,
  selectAll,
  onSelectAll,
}) => {
  const getCardReminders = cardId => {
    return reminders.filter(r => r.card_id === cardId);
  };

  const getPromoCount = currentPromos => {
    return Array.isArray(currentPromos) ? currentPromos.length : 0;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ minWidth: '600px' }}>
        <thead className="bg-gray-50">
          <tr>
            <th className="w-[50px] text-center px-3 py-4">
              <div className="flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onSelectAll}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Card Name
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Card Type
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Days Inactive
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Last Used
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Promo Count
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              New Promo Available
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Interest After Promo
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cards.map(card => (
            <tr
              key={card.id}
              className={`hover:bg-gray-50 transition-colors duration-150 ${
                selectedCards.includes(card.id)
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'border-l-4 border-transparent'
              }`}
            >
              <td className="w-[50px] text-center px-3 py-4">
                <div className="flex justify-center items-center">
                  <input
                    type="checkbox"
                    checked={selectedCards.includes(card.id)}
                    onChange={() => onCardSelect && onCardSelect(card.id)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-left">
                {card.bank_name && card.last_four_digits
                  ? `${card.bank_name} ${card.last_four_digits}`
                  : card.card_name || 'Unknown Card'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {card.card_type || '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {card.days_inactive || 0}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(card.last_used_date)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {getPromoCount(card.current_promos)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {card.new_promo_available ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Yes
                  </span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                {card.interest_after_promo ? `${card.interest_after_promo}%` : '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <div className="flex gap-1.5">
                  {getInactivityBadge(card.days_inactive, card.last_used_date) && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      ⚠️
                    </span>
                  )}
                  {getPromoExpiryBadge(card.current_promos) && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                      ⏳
                    </span>
                  )}
                  {getCardReminders(card.id).length > 0 && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      🔔{getCardReminders(card.id).length}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                {card.notes || '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewCard(card)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="View promos"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => onEditCard(card)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit card"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCard(card)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
