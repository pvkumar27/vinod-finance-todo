import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const SmartDashboard = ({ onQueryGenerated }) => {
  const [data, setData] = useState({ cards: [], todos: [] });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cards, todos] = await Promise.all([api.getCreditCards(), api.getTodos()]);
      setData({ cards: cards || [], todos: todos || [] });
      generateInsights(cards || [], todos || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (cards, todos) => {
    const now = new Date();

    // Critical issues that need immediate attention
    const criticalIssues = [];

    // Overdue tasks
    const overdueTasks = todos.filter(
      t => !t.completed && t.due_date && new Date(t.due_date) < now
    );
    if (overdueTasks.length > 0) {
      criticalIssues.push({
        type: 'overdue_tasks',
        title: `${overdueTasks.length} Overdue Tasks`,
        description: 'Tasks past their due date need attention',
        action: 'View Tasks',
        severity: 'high',
      });
    }

    // Inactive cards (90+ days)
    const inactiveCards = cards.filter(card => {
      if (!card.last_used_date) return true;
      const daysSince = Math.floor((now - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24));
      return daysSince >= 90;
    });
    if (inactiveCards.length > 0) {
      criticalIssues.push({
        type: 'inactive_cards',
        title: `${inactiveCards.length} Inactive Cards`,
        description: 'Cards unused for 90+ days risk closure',
        action: 'Review Cards',
        severity: 'medium',
      });
    }

    // Expiring promos (30 days)
    const expiringPromos = [];
    cards.forEach(card => {
      if (Array.isArray(card.current_promos)) {
        card.current_promos.forEach(promo => {
          if (promo.promo_expiry_date) {
            const daysUntil = Math.ceil(
              (new Date(promo.promo_expiry_date) - now) / (1000 * 60 * 60 * 24)
            );
            if (daysUntil <= 30 && daysUntil > 0) {
              expiringPromos.push({ card: card.card_name, promo, daysUntil });
            }
          }
        });
      }
    });
    if (expiringPromos.length > 0) {
      criticalIssues.push({
        type: 'expiring_promos',
        title: `${expiringPromos.length} Promos Expiring Soon`,
        description: 'Promotional rates ending within 30 days',
        action: 'Check Promos',
        severity: 'medium',
      });
    }

    // Quick stats
    const stats = {
      totalTasks: todos.length,
      completedTasks: todos.filter(t => t.completed).length,
      totalCards: cards.length,
      activeCards: cards.filter(card => {
        if (!card.last_used_date) return false;
        const daysSince = Math.floor((now - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24));
        return daysSince < 90;
      }).length,
    };

    setInsights({ criticalIssues, stats, expiringPromos, overdueTasks, inactiveCards });
  };

  const handleAction = actionType => {
    switch (actionType) {
      case 'View Tasks':
        window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'todos' } }));
        break;
      case 'Review Cards':
        window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'cards' } }));
        break;
      case 'Check Promos':
        window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'cards' } }));
        break;
      default:
        if (onQueryGenerated) onQueryGenerated(actionType);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#632D1F]"></div>
        <span className="ml-2 text-[#8B4513]">Loading insights...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="finbot-card p-6 text-center">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-[#8B4513]">
          No data available. Add some tasks or credit cards to see insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Issues - Only show if there are any */}
      {insights.criticalIssues.length > 0 && (
        <div className="finbot-card p-6">
          <h3 className="finbot-heading-lg mb-4 flex items-center">
            <span className="mr-2">⚠️</span>Needs Attention
          </h3>
          <div className="space-y-3">
            {insights.criticalIssues.map((issue, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  issue.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4
                      className={`font-semibold ${
                        issue.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
                      }`}
                    >
                      {issue.title}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        issue.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    >
                      {issue.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction(issue.action)}
                    className={`finbot-button-secondary text-sm ${
                      issue.severity === 'high'
                        ? 'border-red-300 text-red-700 hover:bg-red-100'
                        : 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    {issue.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="finbot-card p-6">
        <h3 className="finbot-heading-lg mb-4 flex items-center">
          <span className="mr-2">📊</span>Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{insights.stats.totalTasks}</div>
            <div className="text-sm text-blue-700">Total Tasks</div>
            <div className="text-xs text-blue-600">{insights.stats.completedTasks} completed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{insights.stats.totalCards}</div>
            <div className="text-sm text-green-700">Credit Cards</div>
            <div className="text-xs text-green-600">{insights.stats.activeCards} active</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {insights.expiringPromos.length}
            </div>
            <div className="text-sm text-purple-700">Expiring Promos</div>
            <div className="text-xs text-purple-600">Next 30 days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{insights.overdueTasks.length}</div>
            <div className="text-sm text-red-700">Overdue Tasks</div>
            <div className="text-xs text-red-600">Need action</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="finbot-card p-6">
        <h3 className="finbot-heading-lg mb-4 flex items-center">
          <span className="mr-2">⚡</span>Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('View Tasks')}
            className="finbot-button-secondary text-left p-4 h-auto"
          >
            <div className="font-medium">📝 Manage Tasks</div>
            <div className="text-sm text-[#8B4513] mt-1">View and organize your to-dos</div>
          </button>
          <button
            onClick={() => handleAction('Review Cards')}
            className="finbot-button-secondary text-left p-4 h-auto"
          >
            <div className="font-medium">💳 Review Cards</div>
            <div className="text-sm text-[#8B4513] mt-1">Check card activity and promos</div>
          </button>
        </div>
      </div>

      {/* All Good Message */}
      {insights.criticalIssues.length === 0 && (
        <div className="finbot-card p-6 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="finbot-heading-lg text-green-700 mb-2">Everything Looks Good!</h3>
          <p className="text-[#8B4513]">
            No critical issues found. Keep up the great work managing your finances and tasks.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartDashboard;
