import React, { useState, useEffect } from 'react';
import { getCreditCards } from '../services/creditCards';
import DashboardCard from './DashboardCard';

const CreditCardDashboard = ({ onClose }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await getCreditCards();
      setCards(data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalCards: cards.length,
    activeCards: cards.filter(card => card.status === 'active').length,
    totalLimit: cards.reduce((sum, card) => sum + (card.credit_limit || 0), 0),
    totalBalance: cards.reduce((sum, card) => sum + (card.current_balance || 0), 0),
  };

  const utilizationRate = stats.totalLimit > 0 ? ((stats.totalBalance / stats.totalLimit) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">💳 Credit Cards Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard
              title="Total Cards"
              value={stats.totalCards}
              icon="💳"
              color="primary"
            />
            <DashboardCard
              title="Active Cards"
              value={stats.activeCards}
              icon="✅"
              color="success"
            />
            <DashboardCard
              title="Total Limit"
              value={`$${stats.totalLimit.toLocaleString()}`}
              icon="💰"
              color="warning"
            />
            <DashboardCard
              title="Utilization"
              value={`${utilizationRate}%`}
              subtitle={`$${stats.totalBalance.toLocaleString()} used`}
              icon="📊"
              color={utilizationRate > 80 ? 'danger' : utilizationRate > 50 ? 'warning' : 'success'}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cards</h3>
            {cards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💳</div>
                <p>No credit cards added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.slice(0, 4).map((card) => (
                  <div key={card.id} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm opacity-80">{card.bank_name}</p>
                        <p className="font-semibold">{card.card_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        card.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-80">Balance</p>
                        <p className="font-bold">${(card.current_balance || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-80">Limit</p>
                        <p className="font-bold">${(card.credit_limit || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDashboard;