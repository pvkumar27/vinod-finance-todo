import React, { useState, useEffect } from 'react';
import { getCreditCards, addCreditCard, updateCreditCard, deleteCreditCard } from '../services';
import PlaidLink from './PlaidLink';

const CreditCardManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [formData, setFormData] = useState({
    card_name: '',
    bank_name: '',
    is_active: true,
    last_used_date: '',
    bt_promo_available: false,
    purchase_promo_available: false,
    promo_end_date: '',
    reminder_days_before: 7,
    is_autopay_setup: false,
    balance: '',
    notes: '',
    owner: 'self',
    sync_source: 'Manual'
  });

  const loadCards = async () => {
    try {
      const data = await getCreditCards();
      setCards(data);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cardData = {
        ...formData,
        balance: formData.balance ? parseFloat(formData.balance) : 0,
        last_used_date: formData.last_used_date || null,
        promo_end_date: formData.promo_end_date || null
      };
      
      if (editingCard) {
        await updateCreditCard(editingCard.id, cardData);
        setMessage('✅ Credit card updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        await addCreditCard(cardData);
        setMessage('✅ Credit card added successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
      
      setFormData({
        card_name: '',
        bank_name: '',
        is_active: true,
        last_used_date: '',
        bt_promo_available: false,
        purchase_promo_available: false,
        promo_end_date: '',
        reminder_days_before: 7,
        is_autopay_setup: false,
        balance: '',
        notes: '',
        owner: 'self',
        sync_source: 'Manual'
      });
      setShowForm(false);
      setEditingCard(null);
      loadCards();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      card_name: card.card_name,
      bank_name: card.bank_name,
      is_active: card.is_active,
      last_used_date: card.last_used_date || '',
      bt_promo_available: card.bt_promo_available,
      purchase_promo_available: card.purchase_promo_available,
      promo_end_date: card.promo_end_date || '',
      reminder_days_before: card.reminder_days_before,
      is_autopay_setup: card.is_autopay_setup,
      balance: card.balance || '',
      notes: card.notes || '',
      owner: card.owner || 'self',
      sync_source: card.sync_source || 'Manual'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCreditCard(id);
      setMessage('✅ Credit card deleted!');
      setTimeout(() => setMessage(''), 4000);
      loadCards();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  if (loading) return <div className="p-4">Loading credit cards...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center">
          <span className="mr-2">💳</span>
          Credit Cards
        </h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 rounded-full p-1 w-full sm:w-auto shadow-inner">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-full text-sm transition-all flex-1 sm:flex-auto ${
                viewMode === 'cards' 
                  ? 'bg-white shadow-md text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-full text-sm transition-all flex-1 sm:flex-auto ${
                viewMode === 'table' 
                  ? 'bg-white shadow-md text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Table
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <PlaidLink
              onSuccess={(cards) => {
                setMessage(`✅ Successfully synced ${cards.length} credit card(s) from Plaid!`);
                setTimeout(() => setMessage(''), 4000);
                loadCards();
              }}
              onError={(error) => {
                setMessage(`❌ Plaid sync error: ${error.message}`);
                setTimeout(() => setMessage(''), 6000);
              }}
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-auto text-sm font-medium shadow-md flex items-center justify-center"
            >
              <span className="mr-1">{showForm ? '✖️' : '➕'}</span>
              {showForm ? 'Cancel' : 'Add Card'}
            </button>
          </div>
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Card Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}</h3>
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Card name (e.g., Chase Freedom)"
              value={formData.card_name}
              onChange={(e) => setFormData({...formData, card_name: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Bank name"
              value={formData.bank_name}
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Current balance"
              value={formData.balance}
              onChange={(e) => setFormData({...formData, balance: e.target.value})}
              className="p-2 border rounded"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Owner</label>
              <select
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Last Used Date</label>
              <input
                type="date"
                value={formData.last_used_date}
                onChange={(e) => setFormData({...formData, last_used_date: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Promo Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Promo End Date</label>
              <input
                type="date"
                value={formData.promo_end_date}
                onChange={(e) => setFormData({...formData, promo_end_date: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Reminder Days Before</label>
              <input
                type="number"
                placeholder="7"
                value={formData.reminder_days_before}
                onChange={(e) => setFormData({...formData, reminder_days_before: parseInt(e.target.value) || 7})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.bt_promo_available}
                onChange={(e) => setFormData({...formData, bt_promo_available: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">BT Promo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.purchase_promo_available}
                onChange={(e) => setFormData({...formData, purchase_promo_available: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Purchase Promo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_autopay_setup}
                onChange={(e) => setFormData({...formData, is_autopay_setup: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Autopay</span>
            </label>
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full p-2 border rounded mb-4"
            rows="2"
          />

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              {editingCard ? 'Update Credit Card' : 'Add Credit Card'}
            </button>
            {editingCard && (
              <button
                type="button"
                onClick={() => {
                  setEditingCard(null);
                  setShowForm(false);
                  setFormData({
                    card_name: '',
                    bank_name: '',
                    is_active: true,
                    last_used_date: '',
                    bt_promo_available: false,
                    purchase_promo_available: false,
                    promo_end_date: '',
                    reminder_days_before: 7,
                    is_autopay_setup: false,
                    balance: '',
                    notes: '',
                    owner: 'self',
                    sync_source: 'Manual'
                  });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {/* Cards List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Credit Cards ({cards.length})</h3>
        {cards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No credit cards added yet.</p>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-left">{card.card_name}</h4>
                    <p className="text-gray-600 text-left">{card.bank_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!card.is_active && <span className="text-red-500 text-xs">Inactive</span>}
                    <button
                      onClick={() => handleEdit(card)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {card.balance > 0 && (
                  <p className="text-left">
                    <span className="text-slate-700 font-bold bg-slate-100 px-2 py-1 rounded">
                      Balance: ${card.balance.toLocaleString()}
                    </span>
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {card.sync_source === 'Plaid' && <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-medium">🏦 Plaid Synced</span>}
                  {card.bt_promo_available && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">BT Promo</span>}
                  {card.purchase_promo_available && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Purchase Promo</span>}
                  {card.is_autopay_setup && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Autopay</span>}
                </div>
                
                {card.promo_end_date && (
                  <p className="text-orange-600 text-sm mt-1 text-left">Promo ends: {card.promo_end_date}</p>
                )}
                
                {card.last_used_date && (
                  <p className="text-gray-500 text-sm text-left">Last used: {card.last_used_date}</p>
                )}
                
                {card.notes && (
                  <p className="text-gray-600 text-sm mt-2 italic text-left">{card.notes}</p>
                )}
                
                <p className="text-gray-400 text-xs mt-2 text-left">
                  Added: {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Card Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Bank</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Balance</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Promos</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Last Used</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium">{card.card_name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left">{card.bank_name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        card.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {card.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {card.balance > 0 ? (
                        <span className="text-slate-700 bg-slate-100 px-2 py-1 rounded">${card.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400">$0</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex flex-wrap gap-1">
                        {card.sync_source === 'Plaid' && <span className="bg-indigo-100 text-indigo-800 text-xs px-1 py-0.5 rounded font-medium">🏦</span>}
                        {card.bt_promo_available && <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">BT</span>}
                        {card.purchase_promo_available && <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">Purchase</span>}
                        {card.is_autopay_setup && <span className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded">Autopay</span>}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left text-sm">
                      {card.last_used_date ? new Date(card.last_used_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(card)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardManager;