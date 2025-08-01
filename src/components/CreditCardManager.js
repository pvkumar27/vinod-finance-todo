import React, { useState, useEffect } from 'react';
import {
  getCreditCards,
  addCreditCard,
  updateCreditCard,
  deleteCreditCard,
} from '../services/creditCards';
import PlaidLink from './PlaidLink';

const CreditCardManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [formData, setFormData] = useState({
    bank_name: '',
    card_type: '',
    last4: '',
    account_nickname: '',
    account_owner: 'self',
    opened_date: '',
    due_date: '',
    closing_date: '',
    credit_limit: '',
    current_balance: '',
    minimum_due: '',
    purchase_apr: '',
    promo_apr: false,
    promo_end_date: '',
    sync_source: 'Manual',
    owner: 'self',
    autopay: false,
    last_transaction_date: '',
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

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const cardData = {
        ...formData,
        current_balance: formData.current_balance ? parseFloat(formData.current_balance) : 0,
        credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null,
        minimum_due: formData.minimum_due ? parseFloat(formData.minimum_due) : null,
        purchase_apr: formData.purchase_apr ? parseFloat(formData.purchase_apr) : null,
        opened_date: formData.opened_date || null,
        due_date: formData.due_date || null,
        closing_date: formData.closing_date || null,
        promo_end_date: formData.promo_end_date || null,
        last_transaction_date: formData.last_transaction_date || null,
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
        bank_name: '',
        card_type: '',
        last4: '',
        account_nickname: '',
        account_owner: 'self',
        opened_date: '',
        due_date: '',
        closing_date: '',
        credit_limit: '',
        current_balance: '',
        minimum_due: '',
        purchase_apr: '',
        promo_apr: false,
        promo_end_date: '',
        sync_source: 'Manual',
        owner: 'self',
        autopay: false,
        last_transaction_date: '',
      });
      setShowForm(false);
      setEditingCard(null);
      loadCards();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleEdit = card => {
    setEditingCard(card);
    setFormData({
      bank_name: card.bank_name || '',
      card_type: card.card_type || '',
      last4: card.last4 || '',
      account_nickname: card.account_nickname || '',
      account_owner: card.account_owner || 'self',
      opened_date: card.opened_date || '',
      due_date: card.due_date || '',
      closing_date: card.closing_date || '',
      credit_limit: card.credit_limit || '',
      current_balance: card.current_balance || '',
      minimum_due: card.minimum_due || '',
      purchase_apr: card.purchase_apr || '',
      promo_apr: card.promo_apr || false,
      promo_end_date: card.promo_end_date || '',
      sync_source: card.sync_source || 'Manual',
      owner: card.owner || 'self',
      autopay: card.autopay || false,
      last_transaction_date: card.last_transaction_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async id => {
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
              onSuccess={cards => {
                setMessage(`✅ Successfully synced ${cards.length} credit card(s) from Plaid!`);
                setTimeout(() => setMessage(''), 4000);
                loadCards();
              }}
              onError={error => {
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
        <div
          className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {message}
        </div>
      )}

      {/* Add Card Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
          </h3>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Bank name (e.g., Chase)"
              value={formData.bank_name}
              onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Card type (e.g., Freedom Unlimited)"
              value={formData.card_type}
              onChange={e => setFormData({ ...formData, card_type: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Last 4 digits"
              value={formData.last4}
              onChange={e => setFormData({ ...formData, last4: e.target.value })}
              className="p-2 border rounded"
              maxLength="4"
            />
            <input
              type="text"
              placeholder="Account nickname (optional)"
              value={formData.account_nickname}
              onChange={e => setFormData({ ...formData, account_nickname: e.target.value })}
              className="p-2 border rounded"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Owner
              </label>
              <select
                value={formData.owner}
                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
              </select>
            </div>
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="number"
              step="0.01"
              placeholder="Current balance"
              value={formData.current_balance}
              onChange={e => setFormData({ ...formData, current_balance: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Credit limit"
              value={formData.credit_limit}
              onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Purchase APR (%)"
              value={formData.purchase_apr}
              onChange={e => setFormData({ ...formData, purchase_apr: e.target.value })}
              className="p-2 border rounded"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Closing Date
              </label>
              <input
                type="date"
                value={formData.closing_date}
                onChange={e => setFormData({ ...formData, closing_date: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Last Transaction
              </label>
              <input
                type="date"
                value={formData.last_transaction_date}
                onChange={e => setFormData({ ...formData, last_transaction_date: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Promo Info */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Promo End Date
              </label>
              <input
                type="date"
                value={formData.promo_end_date}
                onChange={e => setFormData({ ...formData, promo_end_date: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.promo_apr}
                onChange={e => setFormData({ ...formData, promo_apr: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Has Promo APR</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.autopay}
                onChange={e => setFormData({ ...formData, autopay: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Autopay Setup</span>
            </label>
          </div>

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
                    bank_name: '',
                    card_type: '',
                    last4: '',
                    account_nickname: '',
                    account_owner: 'self',
                    opened_date: '',
                    due_date: '',
                    closing_date: '',
                    credit_limit: '',
                    current_balance: '',
                    minimum_due: '',
                    purchase_apr: '',
                    promo_apr: false,
                    promo_end_date: '',
                    sync_source: 'Manual',
                    owner: 'self',
                    autopay: false,
                    last_transaction_date: '',
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
            {cards.map(card => (
              <div key={card.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-left">
                      {card.bank_name} {card.card_type}
                      {card.last4 && <span className="text-gray-500 ml-2">••••{card.last4}</span>}
                    </h4>
                    {card.account_nickname && (
                      <p className="text-gray-600 text-left text-sm">{card.account_nickname}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
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

                {card.current_balance > 0 && (
                  <p className="text-left">
                    <span className="text-slate-700 font-bold bg-slate-100 px-2 py-1 rounded">
                      Balance: ${card.current_balance.toLocaleString()}
                    </span>
                    {card.credit_limit && (
                      <span className="text-gray-500 text-sm ml-2">
                        / ${card.credit_limit.toLocaleString()} limit
                      </span>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {card.sync_source === 'Plaid' && (
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-medium">
                      🏦 Plaid Synced
                    </span>
                  )}
                  {card.promo_apr && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Promo APR
                    </span>
                  )}
                  {card.autopay && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      Autopay
                    </span>
                  )}
                  {card.owner === 'spouse' && (
                    <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                      Spouse
                    </span>
                  )}
                </div>

                {card.promo_end_date && (
                  <p className="text-orange-600 text-sm mt-1 text-left">
                    Promo ends: {new Date(card.promo_end_date).toLocaleDateString()}
                  </p>
                )}

                {card.last_transaction_date && (
                  <p className="text-gray-500 text-sm text-left">
                    Last transaction: {new Date(card.last_transaction_date).toLocaleDateString()}
                  </p>
                )}

                {card.due_date && (
                  <p className="text-blue-600 text-sm text-left">
                    Due date: {new Date(card.due_date).toLocaleDateString()}
                  </p>
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
                  <th className="border border-gray-300 px-4 py-2 text-left">Card</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Balance</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Limit</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">APR</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Features</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Due Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium">
                      <div>
                        <div>
                          {card.bank_name} {card.card_type}
                        </div>
                        {card.last4 && (
                          <div className="text-xs text-gray-500">••••{card.last4}</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {card.current_balance > 0 ? (
                        <span className="text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          ${card.current_balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">$0</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {card.credit_limit ? `$${card.credit_limit.toLocaleString()}` : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {card.purchase_apr ? `${card.purchase_apr}%` : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex flex-wrap gap-1">
                        {card.sync_source === 'Plaid' && (
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-1 py-0.5 rounded font-medium">
                            🏦
                          </span>
                        )}
                        {card.promo_apr && (
                          <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                            Promo
                          </span>
                        )}
                        {card.autopay && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded">
                            Auto
                          </span>
                        )}
                        {card.owner === 'spouse' && (
                          <span className="bg-pink-100 text-pink-800 text-xs px-1 py-0.5 rounded">
                            Spouse
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left text-sm">
                      {card.due_date ? new Date(card.due_date).toLocaleDateString() : '-'}
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
