import React, { useState } from 'react';
import Papa from 'papaparse';

const CreditCardExport = ({ cards, reminders, activeTab, onMessage }) => {
  const [loading, setLoading] = useState(false);

  const getFilteredCards = () => {
    if (activeTab === 'promo') {
      return cards.filter(card => {
        if (!card.promo_expiry_date) return false;
        const daysUntil = Math.floor(
          (new Date(card.promo_expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 30 && daysUntil >= 0;
      });
    }
    if (activeTab === 'inactive') {
      return cards.filter(card => {
        if (!card.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince > 90;
      });
    }
    return cards;
  };

  const getCardReminders = cardId => {
    return reminders.filter(r => r.card_id === cardId);
  };

  const exportToCSV = () => {
    if (cards.length === 0) {
      onMessage('❌ No cards to export');
      return;
    }

    setLoading(true);
    try {
      const filteredCards = getFilteredCards();

      // Prepare CSV data
      const csvData = filteredCards.map(card => ({
        'Card Holder': card.card_holder || '',
        Bank: card.bank || '',
        'Card Type': card.card_type || '',
        'Last 4': card.card_last4 || '',
        'Amount Due': card.amount_due || '',
        'Min Payment Due': card.min_payment_due || '',
        'Due Date': card.due_date || '',
        'Last Used Date': card.last_used_date || '',
        'Credit Limit': card.credit_limit || '',
        'Promo Used': card.promo_used ? 'Yes' : 'No',
        'Promo Amount Due': card.promo_amount_due || '',
        'Promo Expiry Date': card.promo_expiry_date || '',
        'Promo APR': card.promo_apr || '',
        'APR After': card.apr_after || '',
        'Interest Charge': card.interest_charge || '',
        Notes: card.notes || '',
        'Active Reminders': getCardReminders(card.id)
          .map(r => `${r.type} (${r.date})`)
          .join('; '),
        'Created At': card.created_at || '',
        'Updated At': card.updated_at || '',
      }));

      // Generate CSV
      const csv = Papa.unparse(csvData);

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `credit-cards-backup-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onMessage(`📤 Exported ${filteredCards.length} cards to CSV`);
    } catch (error) {
      onMessage(`❌ Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    if (cards.length === 0) {
      onMessage('❌ No cards to export');
      return;
    }

    setLoading(true);
    try {
      const filteredCards = getFilteredCards();

      // Prepare JSON data with embedded reminders
      const jsonData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalCards: filteredCards.length,
          filter: activeTab,
          version: '1.0',
        },
        cards: filteredCards.map(card => ({
          ...card,
          reminders: getCardReminders(card.id),
        })),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `credit-cards-backup-${new Date().toISOString().split('T')[0]}.json`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onMessage(`🧾 Exported ${filteredCards.length} cards to JSON`);
    } catch (error) {
      onMessage(`❌ Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = getFilteredCards();
  const hasData = filteredCards.length > 0;

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        disabled={!hasData || loading}
        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
        title="Export to CSV"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
        ) : (
          <span className="mr-1">📤</span>
        )}
        CSV
      </button>

      <button
        onClick={exportToJSON}
        disabled={!hasData || loading}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
        title="Export to JSON"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
        ) : (
          <span className="mr-1">🧾</span>
        )}
        JSON
      </button>
    </div>
  );
};

export default CreditCardExport;
