import React from 'react';

const CreditCardTable = ({
  cards,
  reminders,
  onEditCard,
  onDeleteCard,
  onSetReminder,
  getInactivityBadge,
  getPromoExpiryBadge,
  formatCurrency,
  formatDate,
}) => {
  const getCardReminders = cardId => {
    return reminders.filter(r => r.card_id === cardId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Holder
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Bank
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Last4
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Due Date
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Amount Due
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Promo End
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Last Used
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cards.map(card => (
            <tr key={card.id} className="hover:bg-gray-50">
              <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-left">
                {card.card_holder || 'Unknown'}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-left">
                {card.bank}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-left">
                {card.card_type}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-left">
                {card.card_last4 ? `••••${card.card_last4}` : '-'}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-left">
                {formatDate(card.due_date)}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-red-600 text-left">
                {formatCurrency(card.amount_due)}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-left">
                {formatDate(card.promo_expiry_date)}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 text-left">
                {card.last_used_date ? formatDate(card.last_used_date) : '❌ Never'}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-left">
                <div className="flex flex-wrap gap-1">
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
              <td className="px-2 py-2 whitespace-nowrap text-xs text-left">
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onSetReminder(card)}
                    className="p-0.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded text-xs"
                    title="Set reminder"
                  >
                    🔔
                  </button>
                  <button
                    onClick={() => onEditCard(card)}
                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded text-xs"
                    title="Edit card"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCard(card)}
                    className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded text-xs"
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
