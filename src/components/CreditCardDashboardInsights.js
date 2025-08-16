import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const CreditCardDashboardInsights = ({ cards = [] }) => {
  const [insights, setInsights] = useState({
    totalCards: 0,
    totalAmountDue: 0,
    promoUsage: [],
    promoExpiry: [],
    inactivity: [],
  });

  useEffect(() => {
    const computedInsights = computeInsights(cards);
    setInsights(computedInsights);
  }, [cards]);

  const computeInsights = cards => {
    const totalCards = cards.length;
    const totalPromos = cards.reduce((sum, card) => {
      return sum + (Array.isArray(card.current_promos) ? card.current_promos.length : 0);
    }, 0);

    // New promo availability breakdown
    const newPromoAvailable = cards.filter(card => card.new_promo_available).length;
    const noNewPromo = totalCards - newPromoAvailable;
    const promoUsage = [
      { name: 'New Promo Available', value: newPromoAvailable, color: '#10B981' },
      { name: 'No New Promo', value: noNewPromo, color: '#6B7280' },
    ];

    // Promo expiry breakdown
    const now = new Date();
    let expiringSoon = 0;
    let expiringMedium = 0;
    let expiringLater = 0;

    cards.forEach(card => {
      if (Array.isArray(card.current_promos)) {
        card.current_promos.forEach(promo => {
          if (promo.promo_expiry_date) {
            const expiryDate = new Date(promo.promo_expiry_date);
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry < 0) {
              // Already expired - don't count
            } else if (daysUntilExpiry <= 30) expiringSoon++;
            else if (daysUntilExpiry <= 90) expiringMedium++;
            else expiringLater++;
          }
        });
      }
    });

    const promoExpiry = [
      { name: '<30 days', value: expiringSoon, color: '#EF4444' },
      { name: '31-90 days', value: expiringMedium, color: '#F59E0B' },
      { name: '>90 days', value: expiringLater, color: '#10B981' },
    ].filter(item => item.value > 0);

    // Inactivity breakdown
    let activeCards = 0;
    let inactiveCards = 0;
    let neverUsed = 0;

    cards.forEach(card => {
      if (card.days_inactive) {
        if (card.days_inactive >= 90) inactiveCards++;
        else activeCards++;
      } else if (!card.last_used_date) {
        neverUsed++;
      } else {
        const lastUsed = new Date(card.last_used_date);
        const daysSinceUsed = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));

        if (daysSinceUsed < 90) activeCards++;
        else inactiveCards++;
      }
    });

    const inactivity = [
      { name: 'Active (<90 days)', value: activeCards, color: '#10B981' },
      { name: 'Inactive (≥90 days)', value: inactiveCards, color: '#EF4444' },
      { name: 'Never Used', value: neverUsed, color: '#6B7280' },
    ].filter(item => item.value > 0);

    return {
      totalCards,
      totalPromos,
      promoUsage,
      promoExpiry,
      inactivity,
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">📊 Dashboard Insights</h2>
          <p className="text-sm text-gray-600">Overview of your credit card portfolio</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-5 border border-blue-200">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-1 sm:p-2 mr-2 sm:mr-4 flex-shrink-0">
              <span className="text-sm sm:text-xl text-white">💳</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-blue-700">Total Cards</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">{insights.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-5 border border-green-200">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-1 sm:p-2 mr-2 sm:mr-4 flex-shrink-0">
              <span className="text-sm sm:text-xl text-white">🎯</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-green-700">Total Promos</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900">{insights.totalPromos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-5 border border-purple-200">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-1 sm:p-2 mr-2 sm:mr-4 flex-shrink-0">
              <span className="text-sm sm:text-xl text-white">🏷️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-purple-700">New Promos</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-900">
                {insights.promoUsage.find(p => p.name === 'New Promo Available')?.value || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-5 border border-red-200">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-1 sm:p-2 mr-2 sm:mr-4 flex-shrink-0">
              <span className="text-sm sm:text-xl text-white">⚠️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-red-700">Inactive</p>
              <p className="text-lg sm:text-2xl font-bold text-red-900">
                {insights.inactivity.find(i => i.name === 'Inactive (≥90 days)')?.value || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Promo Usage Chart */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4">New Promo Availability</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={insights.promoUsage}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {insights.promoUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {insights.promoUsage.map((item, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Expiry Chart */}
        {insights.promoExpiry.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Promo Expiry</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={insights.promoExpiry}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {insights.promoExpiry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Inactivity Chart */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Card Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={insights.inactivity}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {insights.inactivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {insights.inactivity.map((item, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDashboardInsights;
