import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ProactiveDashboard = ({ onActionClick }) => {
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateProactiveInsights();
  }, []);

  const generateProactiveInsights = async () => {
    setLoading(true);
    try {
      const alertsData = [];
      const insightsData = [];

      // Check for overdue todos
      const overdueTodos = await api.getTodos({
        due_date_before: new Date().toISOString().split('T')[0],
        completed: false,
      });

      if (overdueTodos.length > 0) {
        alertsData.push({
          type: 'urgent',
          icon: '⚠️',
          title: 'Overdue Tasks',
          message: `${overdueTodos.length} task${overdueTodos.length > 1 ? 's are' : ' is'} overdue`,
          action: 'show overdue todos',
          priority: 'high',
        });
      }

      // Check for today's todos
      const todayTodos = await api.getTodos({
        due_date: new Date().toISOString().split('T')[0],
        completed: false,
      });

      if (todayTodos.length > 0) {
        insightsData.push({
          type: 'info',
          icon: '📅',
          title: "Today's Focus",
          message: `${todayTodos.length} task${todayTodos.length > 1 ? 's' : ''} due today`,
          action: "show today's todos",
        });
      }

      // Check for inactive cards
      const allCards = await api.getCreditCards({});
      const inactiveCards = allCards.filter(c => {
        if (!c.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(c.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince > 90;
      });

      if (inactiveCards.length > 0) {
        alertsData.push({
          type: 'warning',
          icon: '💳',
          title: 'Inactive Cards',
          message: `${inactiveCards.length} card${inactiveCards.length > 1 ? "s haven't" : " hasn't"} been used in 90+ days`,
          action: 'show inactive cards',
          priority: 'medium',
        });
      }

      // Check for expiring promos
      const expiringPromoCards = allCards.filter(c => {
        if (!c.current_promos || !Array.isArray(c.current_promos)) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return c.current_promos.some(promo => {
          if (!promo.promo_expiry_date) return false;
          const expiryDate = new Date(promo.promo_expiry_date);
          return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
        });
      });

      if (expiringPromoCards.length > 0) {
        alertsData.push({
          type: 'urgent',
          icon: '🔔',
          title: 'Expiring Promos',
          message: `${expiringPromoCards.length} promotional rate${expiringPromoCards.length > 1 ? 's' : ''} expiring soon`,
          action: 'show cards with expiring promos',
          priority: 'high',
        });
      }

      // Generate positive insights
      const completedTodos = await api.getTodos({ completed: true });
      if (completedTodos.length > 0) {
        insightsData.push({
          type: 'success',
          icon: '✅',
          title: 'Great Progress',
          message: `You've completed ${completedTodos.length} task${completedTodos.length > 1 ? 's' : ''} recently`,
          action: 'show completed todos',
        });
      }

      const activeCards = allCards.filter(c => {
        if (!c.last_used_date) return false;
        const daysSince = Math.floor(
          (new Date() - new Date(c.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince <= 30;
      });

      if (activeCards.length > 0) {
        insightsData.push({
          type: 'success',
          icon: '💪',
          title: 'Active Management',
          message: `${activeCards.length} card${activeCards.length > 1 ? 's' : ''} used recently`,
          action: 'show my credit cards',
        });
      }

      setAlerts(alertsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error generating proactive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = action => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  const AlertCard = ({ alert }) => (
    <div
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
        alert.type === 'urgent'
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:border-red-300'
          : alert.type === 'warning'
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300'
      }`}
      onClick={() => handleActionClick(alert.action)}
    >
      <div className="flex items-center space-x-3">
        <div className={`text-2xl ${alert.type === 'urgent' ? 'animate-pulse' : ''}`}>
          {alert.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{alert.title}</h4>
          <p className="text-sm text-gray-600">{alert.message}</p>
        </div>
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  const InsightCard = ({ insight }) => (
    <div
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
        insight.type === 'success'
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300'
      }`}
      onClick={() => handleActionClick(insight.action)}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{insight.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{insight.title}</h4>
          <p className="text-sm text-gray-600">{insight.message}</p>
        </div>
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  if (alerts.length === 0 && insights.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No urgent items need your attention right now.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Urgent Alerts */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            🚨 Needs Attention
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Positive Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">💡 Insights</h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleActionClick('give me financial insights')}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
          >
            📊 Full Analysis
          </button>
          <button
            onClick={() => handleActionClick('what needs my attention today?')}
            className="p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-200"
          >
            🎯 Priority Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProactiveDashboard;
