import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '../supabaseClient';

const CreditCardDashboardInsights = () => {
  const [insights, setInsights] = useState({
    totalCards: 0,
    totalAmountDue: 0,
    promoUsage: [],
    promoExpiry: [],
    inactivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { data: cards, error } = await supabase.from('credit_cards_manual').select('*');

      if (error) throw error;

      const computedInsights = computeInsights(cards || []);
      setInsights(computedInsights);
    } catch (err) {
      setError(`Failed to fetch insights: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const computeInsights = cards => {
    const totalCards = cards.length;
    const totalAmountDue = cards.reduce((sum, card) => sum + (card.amount_due || 0), 0);

    // Promo usage breakdown
    const promoUsed = cards.filter(card => card.promo_used).length;
    const promoNotUsed = totalCards - promoUsed;
    const promoUsage = [
      { name: 'Using Promo', value: promoUsed, color: '#10B981' },
      { name: 'Not Using Promo', value: promoNotUsed, color: '#6B7280' },
    ];

    // Promo expiry breakdown
    const now = new Date();
    let expiringSoon = 0;
    let expiringMedium = 0;
    let expiringLater = 0;

    cards.forEach(card => {
      if (card.promo_used && card.promo_expiry_date) {
        const expiryDate = new Date(card.promo_expiry_date);
        const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 30) expiringSoon++;
        else if (daysUntilExpiry <= 90) expiringMedium++;
        else expiringLater++;
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
      if (!card.last_used_date) {
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
      totalAmountDue,
      promoUsage,
      promoExpiry,
      inactivity,
    };
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">📊 Dashboard Insights</h2>
        <button
          onClick={fetchInsights}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💳</span>
            <div>
              <p className="text-sm text-blue-600">Total Cards</p>
              <p className="text-2xl font-bold text-blue-900">{insights.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💵</span>
            <div>
              <p className="text-sm text-red-600">Total Amount Due</p>
              <p className="text-xl font-bold text-red-900">
                {formatCurrency(insights.totalAmountDue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <p className="text-sm text-green-600">Using Promos</p>
              <p className="text-2xl font-bold text-green-900">
                {insights.promoUsage.find(p => p.name === 'Using Promo')?.value || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="text-sm text-yellow-600">Inactive Cards</p>
              <p className="text-2xl font-bold text-yellow-900">
                {insights.inactivity.find(i => i.name === 'Inactive (≥90 days)')?.value || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Promo Usage Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Promo Usage</h3>
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Promo Expiry</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={insights.promoExpiry}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
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
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Card Activity</h3>
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
