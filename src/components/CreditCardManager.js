import React, { useState, useEffect } from 'react';
import { getCreditCards, addCreditCard, deleteCreditCard } from '../services';

const CreditCardManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    card_name: '',
    bank_name: '',
    promo_apr: '',
    promo_expiry: '',
    last_activity: new Date().toISOString().split('T')[0]
  });

  const loadCards = async () => {
    try {
      const data = await getCreditCards();
      setCards(data);
      setMessage('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCreditCard({
        ...formData,
        promo_apr: formData.promo_apr ? parseFloat(formData.promo_apr) : null
      });
      setFormData({
        card_name: '',
        bank_name: '',
        promo_apr: '',
        promo_expiry: '',
        last_activity: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      setMessage('✅ Credit card added successfully!');
      loadCards();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCreditCard(id);
      setMessage('✅ Credit card deleted!');
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Credit Cards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Card'}
        </button>
      </div>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Card Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Credit Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Promo APR % (optional)"
              value={formData.promo_apr}
              onChange={(e) => setFormData({...formData, promo_apr: e.target.value})}
              className="p-2 border rounded"
            />
            <input
              type="date"
              placeholder="Promo expiry date"
              value={formData.promo_expiry}
              onChange={(e) => setFormData({...formData, promo_expiry: e.target.value})}
              className="p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Add Credit Card
          </button>
        </form>
      )}

      {/* Cards List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Credit Cards ({cards.length})</h3>
        {cards.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No credit cards added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{card.card_name}</h4>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-600 mb-1">Bank: {card.bank_name}</p>
                {card.promo_apr && (
                  <p className="text-green-600 text-sm">Promo APR: {card.promo_apr}%</p>
                )}
                {card.promo_expiry && (
                  <p className="text-orange-600 text-sm">Expires: {card.promo_expiry}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Added: {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardManager;