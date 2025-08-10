import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CreditCardForm = ({ card, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    bank_name: '',
    last_four_digits: '',
    card_type: '',
    card_holder: '',
    last_used_date: '',
    new_promo_available: false,
    promo_used: false,
    interest_after_promo: '',
    notes: '',
  });

  const bankOptions = [
    'Amex',
    'Apple Card',
    'Bank of America',
    'BMO',
    'Capital One',
    'Chase',
    'Citizen',
    'Citi',
    'Discover',
    'RBFCU',
    'Synchrony',
    'US Bank',
    'Well Fargo',
  ];
  const [currentPromos, setCurrentPromos] = useState([
    {
      promo_apr: '0.00',
      promo_expiry_date: '',
      promo_amount: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (card) {
      setFormData({
        bank_name: card.bank_name || '',
        last_four_digits: card.last_four_digits || '',
        card_type: card.card_type || '',
        card_holder: card.card_holder || '',
        last_used_date: card.last_used_date || '',
        new_promo_available: card.new_promo_available || false,
        promo_used: card.promo_used || false,
        interest_after_promo: card.interest_after_promo || '',
        notes: card.notes || '',
      });
      // Load existing current promos
      if (
        card.current_promos &&
        Array.isArray(card.current_promos) &&
        card.current_promos.length > 0
      ) {
        setCurrentPromos(card.current_promos);
      } else {
        setCurrentPromos([
          {
            promo_apr: '0.00',
            promo_expiry_date: '',
            promo_amount: '',
          },
        ]);
      }
    } else {
      // Reset form for new card
      setFormData({
        bank_name: '',
        last_four_digits: '',
        card_type: '',
        card_holder: '',
        last_used_date: '',
        new_promo_available: false,
        promo_used: false,
        interest_after_promo: '',
        notes: '',
      });
      setCurrentPromos([
        {
          promo_apr: '0.00',
          promo_expiry_date: '',
          promo_amount: '',
        },
      ]);
    }
  }, [card, isOpen]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate days_inactive based on last_used_date
      let calculatedDaysInactive = null;
      if (formData.last_used_date) {
        const lastUsed = new Date(formData.last_used_date);
        const today = new Date();
        const diffTime = Math.abs(today - lastUsed);
        calculatedDaysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const dataToSave = {
        bank_name: formData.bank_name,
        card_type: formData.card_type,
        card_holder: formData.card_holder,
        last_four_digits: formData.last_four_digits,
        last_used_date: formData.last_used_date || null,
        days_inactive: calculatedDaysInactive ? parseInt(calculatedDaysInactive) : null,
        new_promo_available: formData.new_promo_available,
        promo_used: formData.promo_used,
        interest_after_promo: formData.interest_after_promo
          ? parseFloat(formData.interest_after_promo)
          : null,
        current_promos: currentPromos.filter(
          promo => promo.promo_apr || promo.promo_expiry_date || promo.promo_amount
        ),
        notes: formData.notes,
      };

      let result;
      if (card && card.id) {
        // Update existing card
        result = await api.updateCreditCard(card.id, dataToSave);
      } else {
        // Insert new card
        result = await api.addCreditCard(dataToSave);
      }

      onSave(result);
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
    setCurrentPromos(prev =>
      prev.map((promo, i) => (i === index ? { ...promo, [field]: value } : promo))
    );
  };

  const addPromo = () => {
    setCurrentPromos(prev => [
      ...prev,
      {
        promo_apr: '0.00',
        promo_expiry_date: '',
        promo_amount: '',
      },
    ]);
  };

  const removePromo = index => {
    if (currentPromos.length > 1) {
      setCurrentPromos(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              {card ? '✏️ Edit Credit Card' : '💳 Add New Credit Card'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Enter your credit card details below</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            ×
          </button>
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
              💳 Card Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <select
                  required
                  value={formData.bank_name}
                  onChange={e => handleChange('bank_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Bank</option>
                  {bankOptions.map(bank => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last 4 Digits *
                </label>
                <input
                  type="text"
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  value={formData.last_four_digits}
                  onChange={e =>
                    handleChange('last_four_digits', e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Type (Optional)
                </label>
                <input
                  type="text"
                  value={formData.card_type}
                  onChange={e => handleChange('card_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Freedom, Gold, Platinum, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder *
                </label>
                <select
                  required
                  value={formData.card_holder}
                  onChange={e => handleChange('card_holder', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Card Holder</option>
                  <option value="Vinod">Vinod</option>
                  <option value="Sreelatha">Sreelatha</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inactivity Details Section */}
          <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              📅 Inactivity Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Used Date</label>
              <input
                type="date"
                value={formData.last_used_date}
                onChange={e => handleChange('last_used_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                ⚠️ Cards unused for 90+ days are marked inactive. Days inactive will be calculated
                automatically from the last used date.
              </p>
            </div>
          </div>

          {/* New Promo Available Section */}
          <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🏷️ New Promo Available
            </h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                Does this card have new promotional offers available?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="new_promo_available"
                    checked={formData.new_promo_available === true}
                    onChange={() => handleChange('new_promo_available', true)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="new_promo_available"
                    checked={formData.new_promo_available === false}
                    onChange={() => handleChange('new_promo_available', false)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Promo Used Section */}
          <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🎯 Promo Used
            </h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                Are you currently using any promotional offers?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="promo_used"
                    checked={formData.promo_used === true}
                    onChange={() => handleChange('promo_used', true)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="promo_used"
                    checked={formData.promo_used === false}
                    onChange={() => handleChange('promo_used', false)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Current Promos Section - Only show if promo_used is true */}
          {formData.promo_used && (
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🎯 Current Promos
              </h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
                {currentPromos.map((promo, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold text-gray-700">Promo #{index + 1}</h4>
                      {currentPromos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePromo(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Promo APR (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={promo.promo_apr}
                          onChange={e => handlePromoChange(index, 'promo_apr', e.target.value)}
                          placeholder="0.00"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Promo Amount ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={promo.promo_amount}
                          onChange={e => handlePromoChange(index, 'promo_amount', e.target.value)}
                          placeholder="5000.00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPromo}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center font-medium text-sm"
                >
                  ➕ Add Another Promo
                </button>
              </div>
            </div>
          )}

          {/* Interest After Promo Section */}
          <div className="bg-green-50 rounded-lg p-5 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              💰 Interest After Promo
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate After Promo Expires (%) - Optional
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.interest_after_promo}
                onChange={e => handleChange('interest_after_promo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="29.99"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">📝 Notes</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about this card..."
              />
            </div>
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
