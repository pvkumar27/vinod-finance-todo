import React, { useState, useEffect } from 'react';
import { getCreditCards, addCreditCard } from '../services';

const CreditCardTest = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCards = async () => {
    try {
      const data = await getCreditCards();
      setCards(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCard = async () => {
    try {
      await addCreditCard({
        card_name: 'Test Card',
        bank_name: 'Test Bank'
      });
      loadCards();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  if (loading) return <div className="p-4">Loading cards...</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold mb-4">Credit Cards RLS Test</h3>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <button
        onClick={handleAddTestCard}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Add Test Card
      </button>
      
      <div className="space-y-2">
        {cards.length === 0 ? (
          <p className="text-gray-600">No cards found</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="bg-white p-3 rounded shadow">
              <strong>{card.card_name}</strong> - {card.bank_name}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreditCardTest;