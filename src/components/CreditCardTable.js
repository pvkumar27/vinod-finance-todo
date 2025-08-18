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
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full divide-y divide-gray-200 text-sm bg-white">
        <thead className="bg-[#FDF3EE] border-b border-[#632D1F]/20">
          <tr>
            <th className="w-12 text-center px-3 py-4">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="form-checkbox h-4 w-4 text-[#632D1F] rounded focus:ring-2 focus:ring-[#632D1F]/50"
              />
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[200px]">
              Card Name
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[120px]">
              Type
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[100px]">
              Holder
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[80px]">
              Days
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[110px]">
              Last Used
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[80px]">
              Promos
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[100px]">
              New Promo
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[90px]">
              Interest
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[90px]">
              Status
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[140px]">
              Notes
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-[#632D1F] uppercase tracking-wider min-w-[100px]">
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
              <td className="w-12 text-center px-3 py-4">
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => onCardSelect && onCardSelect(card.id)}
                  className="form-checkbox h-4 w-4 text-[#632D1F] rounded focus:ring-2 focus:ring-[#632D1F]/50"
                />
              </td>
              <td className="px-4 py-4 text-left text-sm font-semibold text-[#632D1F] min-w-[200px]">
                <div className="truncate">
                  {card.bank_name && card.last_four_digits
                    ? `${card.bank_name} ••${card.last_four_digits}`
                    : card.card_name || 'Unknown Card'}
                </div>
              </td>
              <td className="px-4 py-4 text-left text-sm text-[#8B4513] min-w-[120px]">
                <div className="truncate">{card.card_type || '-'}</div>
              </td>
              <td className="px-4 py-4 text-left text-sm text-[#8B4513] min-w-[100px]">
                <div className="truncate">{card.card_holder || '-'}</div>
              </td>
              <td className="px-4 py-4 text-left text-sm font-medium text-[#632D1F] min-w-[80px]">
                {card.days_inactive || 0}
              </td>
              <td className="px-4 py-4 text-left text-sm text-[#8B4513] min-w-[110px]">
                <div className="truncate">{formatDate(card.last_used_date)}</div>
              </td>
              <td className="px-4 py-4 text-left text-sm font-medium text-[#632D1F] min-w-[80px]">
                {getPromoCount(card.current_promos)}
              </td>
              <td className="px-4 py-4 text-left text-sm text-[#8B4513] min-w-[100px]">
                {card.new_promo_available ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    ✓ Yes
                  </span>
                ) : (
                  <span className="text-[#8B4513]/60">-</span>
                )}
              </td>
              <td className="px-4 py-4 text-left text-sm text-[#8B4513] min-w-[90px]">
                {card.interest_after_promo ? `${card.interest_after_promo}%` : '-'}
              </td>
              <td className="px-4 py-4 text-left text-sm min-w-[90px]">
                <div className="flex gap-1.5">
                  {getInactivityBadge(card.days_inactive, card.last_used_date) && (
                    <span
                      className="inline-flex w-6 h-6 items-center justify-center text-xs rounded-full bg-red-100 text-red-700 font-medium"
                      title="Inactive"
                    >
                      ⚠
                    </span>
                  )}
                  {getPromoExpiryBadge(card.current_promos) && (
                    <span
                      className="inline-flex w-6 h-6 items-center justify-center text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium"
                      title="Promo Expiring"
                    >
                      ⏳
                    </span>
                  )}
                  {getCardReminders(card.id).length > 0 && (
                    <span
                      className="inline-flex w-6 h-6 items-center justify-center text-xs rounded-full bg-[#632D1F]/10 text-[#632D1F] font-medium"
                      title={`${getCardReminders(card.id).length} reminders`}
                    >
                      🔔
                    </span>
                  )}
                </div>
              </td>
              <td
                className="px-4 py-4 text-left text-sm text-[#8B4513] min-w-[140px]"
                title={card.notes || ''}
              >
                <div className="truncate max-w-[120px]">{card.notes || '-'}</div>
              </td>
              <td className="px-4 py-4 text-left text-sm min-w-[100px]">
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewCard(card)}
                    className="p-2 text-[#8B4513]/60 hover:text-[#632D1F] hover:bg-[#632D1F]/10 rounded-lg transition-all duration-200"
                    title="View promos"
                  >
                    👁
                  </button>
                  <button
                    onClick={() => onEditCard(card)}
                    className="p-2 text-[#8B4513] hover:text-[#632D1F] hover:bg-[#632D1F]/10 rounded-lg transition-all duration-200"
                    title="Edit card"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCard(card)}
                    className="p-2 text-[#8B4513]/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
