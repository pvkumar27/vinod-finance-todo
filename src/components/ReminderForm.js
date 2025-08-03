import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ReminderForm = ({ card, isOpen, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'Payment Due',
    date: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const reminderData = {
        user_id: user.id,
        card_id: card.id,
        type: formData.type,
        date: formData.date,
        note: formData.note || null,
      };

      const { data, error } = await supabase
        .from('credit_card_reminders')
        .insert([reminderData])
        .select();

      if (error) throw error;

      onSave(data[0]);
      setFormData({ type: 'Payment Due', date: '', note: '' });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">🔔 Set Reminder</h2>
          <p className="text-sm text-gray-600 mt-1">
            {card.card_holder} • {card.bank} ••••{card.card_last4}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Type *</label>
            <select
              required
              value={formData.type}
              onChange={e => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Payment Due">Payment Due</option>
              <option value="Promo Expiry">Promo Expiry</option>
              <option value="Inactivity Warning">Inactivity Warning</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea
              rows="3"
              value={formData.note}
              onChange={e => handleChange('note', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Additional reminder details..."
            />
          </div>

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
                  Setting...
                </>
              ) : (
                <>🔔 Set Reminder</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;
