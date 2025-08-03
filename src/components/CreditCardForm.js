import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CreditCardForm = ({ card, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    card_holder: '',
    bank: '',
    card_type: '',
    card_last4: '',
    amount_due: '',
    min_payment_due: '',
    due_date: '',
    credit_limit: '',
    promo_available: false,
    last_used_date: '',
    notes: '',
  });
  const [promos, setPromos] = useState([
    {
      promo_used: false,
      promo_amount_due: '',
      promo_expiry_date: '',
      promo_apr: '',
      apr_after: '',
      interest_charge: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (card) {
      setFormData({
        card_holder: card.card_holder || '',
        bank: card.bank || '',
        card_type: card.card_type || '',
        card_last4: card.card_last4 || '',
        amount_due: card.amount_due || '',
        min_payment_due: card.min_payment_due || '',
        due_date: card.due_date || '',
        credit_limit: card.credit_limit || '',
        promo_available: card.promo_available || false,
        last_used_date: card.last_used_date || '',
        notes: card.notes || '',
      });
      // Load existing promos or default
      if (card.promos && card.promos.length > 0) {
        setPromos(card.promos);
      } else {
        setPromos([
          {
            promo_used: card.promo_used || false,
            promo_amount_due: card.promo_amount_due || '',
            promo_expiry_date: card.promo_expiry_date || '',
            promo_apr: card.promo_apr || '',
            apr_after: card.apr_after || '',
            interest_charge: card.interest_charge || '',
          },
        ]);
      }
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

      // Use first promo for backward compatibility
      const firstPromo = promos[0] || {};
      const dataToSave = {
        ...formData,
        user_id: user.id,
        source: 'manual',
        amount_due: formData.amount_due ? parseFloat(formData.amount_due) : null,
        min_payment_due: formData.min_payment_due ? parseFloat(formData.min_payment_due) : null,
        credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null,
        promo_used: firstPromo.promo_used || false,
        promo_amount_due: firstPromo.promo_amount_due
          ? parseFloat(firstPromo.promo_amount_due)
          : null,
        promo_apr: firstPromo.promo_apr ? parseFloat(firstPromo.promo_apr) : null,
        apr_after: firstPromo.apr_after ? parseFloat(firstPromo.apr_after) : null,
        interest_charge: firstPromo.interest_charge ? parseFloat(firstPromo.interest_charge) : null,
        promo_expiry_date: firstPromo.promo_expiry_date || null,
        due_date: formData.due_date || null,
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

  const handlePromoChange = (index, field, value) => {
    setPromos(prev => prev.map((promo, i) => (i === index ? { ...promo, [field]: value } : promo)));
  };

  const addPromo = () => {
    setPromos(prev => [
      ...prev,
      {
        promo_used: false,
        promo_amount_due: '',
        promo_expiry_date: '',
        promo_apr: '',
        apr_after: '',
        interest_charge: '',
      },
    ]);
  };

  const removePromo = index => {
    if (promos.length > 1) {
      setPromos(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
            {card ? '✏️ Edit Credit Card' : '💳 Add New Credit Card'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Enter your credit card details below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Card Details Section */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🏦 Card Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder *
                </label>
                <input
                  type="text"
                  required
                  value={formData.card_holder}
                  onChange={e => handleChange('card_holder', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank *</label>
                <input
                  type="text"
                  required
                  value={formData.bank}
                  onChange={e => handleChange('bank', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Chase, Amex, Citi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
                <input
                  type="text"
                  value={formData.card_type}
                  onChange={e => handleChange('card_type', e.target.value)}
                  placeholder="e.g. Cashback, Travel, Store Card"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength="4"
                  pattern="[0-9]{4}"
                  value={formData.card_last4}
                  onChange={e => handleChange('card_last4', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234"
                />
              </div>
            </div>
          </div>

          {/* Financial Info Section */}
          <div className="bg-green-50 rounded-lg p-5 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              💰 Financial Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount_due}
                  onChange={e => handleChange('amount_due', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={e => handleChange('credit_limit', e.target.value)}
                  placeholder="25000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Payment Due
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_payment_due}
                  onChange={e => handleChange('min_payment_due', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={e => handleChange('due_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Promo Available Section */}
          <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🏷️ Promo Available
            </h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                Does this card have promotional offers available?
                <span
                  className="ml-2 text-gray-400 cursor-help"
                  title="Check if the card has any promotional offers"
                >
                  ℹ️
                </span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="promo_available"
                    checked={formData.promo_available === true}
                    onChange={() => handleChange('promo_available', true)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="promo_available"
                    checked={formData.promo_available === false}
                    onChange={() => handleChange('promo_available', false)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Promo Used Section */}
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🎯 Promo Used
            </h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
              {promos.map((promo, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-700">Promo #{index + 1}</h4>
                    {promos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePromo(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Are you currently using this promo?
                        <span
                          className="ml-2 text-gray-400 cursor-help"
                          title="Is this promo currently active on your account?"
                        >
                          ℹ️
                        </span>
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`promo_used_${index}`}
                            checked={promo.promo_used === true}
                            onChange={() => handlePromoChange(index, 'promo_used', true)}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-sm font-medium">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`promo_used_${index}`}
                            checked={promo.promo_used === false}
                            onChange={() => handlePromoChange(index, 'promo_used', false)}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-sm font-medium">No</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {promo.promo_used && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Promo Amount Due
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={promo.promo_amount_due}
                            onChange={e =>
                              handlePromoChange(index, 'promo_amount_due', e.target.value)
                            }
                            placeholder="5000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Promo Expiry Date
                          </label>
                          <input
                            type="date"
                            value={promo.promo_expiry_date}
                            onChange={e =>
                              handlePromoChange(index, 'promo_expiry_date', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            Promo APR
                            <span
                              className="ml-2 text-gray-400 cursor-help"
                              title="Current promotional interest rate"
                            >
                              ℹ️
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={promo.promo_apr}
                              onChange={e => handlePromoChange(index, 'promo_apr', e.target.value)}
                              placeholder="0"
                              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="absolute right-3 top-3 text-gray-500 text-sm font-medium">
                              %
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            APR After Promo
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={promo.apr_after}
                              onChange={e => handlePromoChange(index, 'apr_after', e.target.value)}
                              placeholder="29.99"
                              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="absolute right-3 top-3 text-gray-500 text-sm font-medium">
                              %
                            </span>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interest Charges (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={promo.interest_charge}
                            onChange={e =>
                              handlePromoChange(index, 'interest_charge', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current interest charges"
                          />
                        </div>
                      </div>

                      {index === promos.length - 1 && (
                        <button
                          type="button"
                          onClick={addPromo}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center font-medium text-sm"
                        >
                          ➕ Add Another Promo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Usage Info Section */}
          <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              📅 Usage Information
            </h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Used Date
                </label>
                <input
                  type="date"
                  value={formData.last_used_date}
                  onChange={e => handleChange('last_used_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    ⚠️ Cards unused for 90+ days are marked inactive
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">📝 Notes</h3>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="e.g., Card for groceries. Call before closing."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              title={loading ? 'Saving card...' : 'Save this credit card'}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>✅ Save Card</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;
