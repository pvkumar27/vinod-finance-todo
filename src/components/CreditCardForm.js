import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CreditCardForm = ({ card, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    card_holder: '',
    bank: '',
    card_type: 'Credit',
    card_last4: '',
    amount_due: '',
    min_payment_due: '',
    due_date: '',
    promo_used: false,
    promo_amount_due: '',
    promo_expiry_date: '',
    promo_apr: '',
    apr_after: '',
    last_used_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (card) {
      setFormData({
        card_holder: card.card_holder || '',
        bank: card.bank || '',
        card_type: card.card_type || 'Credit',
        card_last4: card.card_last4 || '',
        amount_due: card.amount_due || '',
        min_payment_due: card.min_payment_due || '',
        due_date: card.due_date || '',
        promo_used: card.promo_used || false,
        promo_amount_due: card.promo_amount_due || '',
        promo_expiry_date: card.promo_expiry_date || '',
        promo_apr: card.promo_apr || '',
        apr_after: card.apr_after || '',
        last_used_date: card.last_used_date || '',
        notes: card.notes || '',
      });
    }
  }, [card]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate card_last4 uniqueness
      if (formData.card_last4) {
        const { data: existingCards } = await supabase
          .from('credit_cards_manual')
          .select('id')
          .eq('user_id', user.id)
          .eq('card_last4', formData.card_last4)
          .neq('id', card?.id || '');

        if (existingCards && existingCards.length > 0) {
          throw new Error('Card with this Last 4 digits already exists');
        }
      }

      const dataToSave = {
        ...formData,
        user_id: user.id,
        source: 'manual',
        amount_due: formData.amount_due ? parseFloat(formData.amount_due) : null,
        min_payment_due: formData.min_payment_due ? parseFloat(formData.min_payment_due) : null,
        promo_amount_due: formData.promo_amount_due ? parseFloat(formData.promo_amount_due) : null,
        promo_apr: formData.promo_apr ? parseFloat(formData.promo_apr) : null,
        apr_after: formData.apr_after ? parseFloat(formData.apr_after) : null,
        due_date: formData.due_date || null,
        promo_expiry_date: formData.promo_expiry_date || null,
        last_used_date: formData.last_used_date || null,
      };

      let result;
      if (card) {
        // Update existing card
        result = await supabase
          .from('credit_cards_manual')
          .update(dataToSave)
          .eq('id', card.id)
          .select();
      } else {
        // Insert new card
        result = await supabase.from('credit_cards_manual').insert([dataToSave]).select();
      }

      if (result.error) throw result.error;

      onSave(result.data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {card ? '✏️ Edit Card' : '➕ Add New Card'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder *</label>
              <input
                type="text"
                required
                value={formData.card_holder}
                onChange={e => handleChange('card_holder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank *</label>
              <input
                type="text"
                required
                value={formData.bank}
                onChange={e => handleChange('bank', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
              <select
                value={formData.card_type}
                onChange={e => handleChange('card_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Credit">Credit</option>
                <option value="Store">Store</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
              <input
                type="text"
                maxLength="4"
                pattern="[0-9]{4}"
                value={formData.card_last4}
                onChange={e => handleChange('card_last4', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1234"
              />
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Due</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount_due}
                onChange={e => handleChange('amount_due', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Payment Due
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.min_payment_due}
                onChange={e => handleChange('min_payment_due', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => handleChange('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Promo Section */}
          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="promo_used"
                checked={formData.promo_used}
                onChange={e => handleChange('promo_used', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="promo_used" className="text-sm font-medium text-gray-700">
                Using Promotional Rate
              </label>
            </div>

            {formData.promo_used && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo Amount Due
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.promo_amount_due}
                    onChange={e => handleChange('promo_amount_due', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.promo_expiry_date}
                    onChange={e => handleChange('promo_expiry_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo APR (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.promo_apr}
                    onChange={e => handleChange('promo_apr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    APR After (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.apr_after}
                    onChange={e => handleChange('apr_after', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Usage Info */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Usage Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Used Date
                </label>
                <input
                  type="date"
                  value={formData.last_used_date}
                  onChange={e => handleChange('last_used_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Cards unused for 90+ days are marked inactive
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>💾 Save Card</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;
