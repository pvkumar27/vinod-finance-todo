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
      <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ minWidth: '800px' }}>
        <thead className="bg-gray-50">
          <tr>
            <th className="w-[40px] text-center px-2 py-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </th>
            <th
              className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '180px' }}
            >
              Card Name
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '100px' }}
            >
              Type
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '90px' }}
            >
              Holder
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '80px' }}
            >
              Days
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '90px' }}
            >
              Last Used
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '70px' }}
            >
              Promos
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '80px' }}
            >
              New Promo
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '80px' }}
            >
              Interest
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '80px' }}
            >
              Status
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '120px' }}
            >
              Notes
            </th>
            <th
              className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
              style={{ width: '90px' }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cards.map(card => (
            <tr
              key={card.id}
              className={`transition-colors duration-150 ${
                selectedCards.includes(card.id)
                  ? 'bg-blue-100 border-l-4 border-blue-500 hover:bg-blue-150'
                  : getInactivityBadge(card.days_inactive, card.last_used_date) ||
                      getPromoExpiryBadge(card.current_promos)
                    ? 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100'
                    : 'bg-blue-50 border-l-4 border-transparent hover:bg-blue-100'
              }`}
            >
              <td className="w-[40px] text-center px-2 py-3">
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => onCardSelect && onCardSelect(card.id)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td
                className="px-3 py-3 text-left text-sm font-semibold text-gray-900 truncate"
                style={{ width: '180px' }}
              >
                {card.bank_name && card.last_four_digits
                  ? `${card.bank_name} ${card.last_four_digits}`
                  : card.card_name || 'Unknown Card'}
              </td>
              <td
                className="px-2 py-3 text-left text-sm text-gray-600 truncate"
                style={{ width: '100px' }}
              >
                {card.card_type || '-'}
              </td>
              <td
                className="px-2 py-3 text-left text-sm text-gray-600 truncate"
                style={{ width: '90px' }}
              >
                {card.card_holder || '-'}
              </td>
              <td
                className="px-2 py-3 text-left text-sm font-medium text-gray-900"
                style={{ width: '80px' }}
              >
                {card.days_inactive || 0}
              </td>
              <td
                className="px-2 py-3 text-left text-sm text-gray-600 truncate"
                style={{ width: '90px' }}
              >
                {formatDate(card.last_used_date)}
              </td>
              <td
                className="px-2 py-3 text-left text-sm font-medium text-gray-900"
                style={{ width: '70px' }}
              >
                {getPromoCount(card.current_promos)}
              </td>
              <td className="px-2 py-3 text-left text-sm text-gray-600" style={{ width: '80px' }}>
                {card.new_promo_available ? (
                  <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                    ✓
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-2 py-3 text-left text-sm text-gray-600" style={{ width: '80px' }}>
                {card.interest_after_promo ? `${card.interest_after_promo}%` : '-'}
              </td>
              <td className="px-2 py-3 text-left text-sm" style={{ width: '80px' }}>
                <div className="flex gap-1">
                  {getInactivityBadge(card.days_inactive, card.last_used_date) && (
                    <span
                      className="inline-flex w-5 h-5 items-center justify-center text-xs rounded-full bg-red-100 text-red-700"
                      title="Inactive"
                    >
                      ⚠
                    </span>
                  )}
                  {getPromoExpiryBadge(card.current_promos) && (
                    <span
                      className="inline-flex w-5 h-5 items-center justify-center text-xs rounded-full bg-yellow-100 text-yellow-700"
                      title="Promo Expiring"
                    >
                      ⏳
                    </span>
                  )}
                  {getCardReminders(card.id).length > 0 && (
                    <span
                      className="inline-flex w-5 h-5 items-center justify-center text-xs rounded-full bg-blue-100 text-blue-700"
                      title={`${getCardReminders(card.id).length} reminders`}
                    >
                      🔔
                    </span>
                  )}
                </div>
              </td>
              <td
                className="px-2 py-3 text-left text-sm text-gray-600 truncate"
                style={{ width: '120px' }}
                title={card.notes || ''}
              >
                {card.notes || '-'}
              </td>
              <td className="px-2 py-3 text-left text-sm" style={{ width: '90px' }}>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onViewCard(card)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                    title="View promos"
                  >
                    👁
                  </button>
                  <button
                    onClick={() => onEditCard(card)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                    title="Edit card"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCard(card)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                    title="Delete card"
                  >
                    🗑
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
