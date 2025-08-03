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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Holder
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bank
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last4
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount Due
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Promo End
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Used
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cards.map(card => (
            <tr key={card.id} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {card.card_holder || 'Unknown'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{card.bank}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {card.card_type}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {card.card_last4 ? `••••${card.card_last4}` : '-'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(card.due_date)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                {formatCurrency(card.amount_due)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(card.promo_expiry_date)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {card.last_used_date ? formatDate(card.last_used_date) : '❌ Never'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  {getInactivityBadge(card.last_used_date) && (
                    <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
                      ⚠️ {card.last_used_date ? 'Inactive' : 'Never Used'}
                    </span>
                  )}
                  {getPromoExpiryBadge(card.promo_expiry_date) && (
                    <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">
                      ⏳ Promo Soon
                    </span>
                  )}
                  {getCardReminders(card.id).length > 0 && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      🔔 {getCardReminders(card.id).length}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex gap-1">
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
