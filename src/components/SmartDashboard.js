import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AppleWalletCard from './ui/AppleWalletCard';
import AppleWalletButton from './ui/AppleWalletButton';

const SmartDashboard = ({ onQueryGenerated }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [cards, todos] = await Promise.all([api.getCreditCards(), api.getTodos()]);
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
      <AppleWalletCard className="text-center py-12 aw-fade-in">
        <div className="aw-loading mx-auto mb-4"></div>
        <p className="aw-text-body">Loading insights...</p>
      </AppleWalletCard>
    );
  }

  if (!insights) {
    return (
      <AppleWalletCard className="text-center aw-fade-in">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="aw-heading-md mb-2">No Data Available</h3>
        <p className="aw-text-body">Add some tasks or credit cards to see insights.</p>
      </AppleWalletCard>
    );
  }

  return (
    <div
      style={{
        padding: 'var(--aw-space-xl)',
        background: 'var(--aw-background)',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <AppleWalletCard className="mb-6 aw-fade-in">
        <h2 className="aw-heading-xl" style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
          <span style={{ marginRight: 'var(--aw-space-md)' }}>📊</span>
          Smart Insights
        </h2>
        <p className="aw-text-body" style={{ marginTop: 'var(--aw-space-sm)' }}>
          AI-powered financial and productivity insights
        </p>
      </AppleWalletCard>

      {/* Critical Issues - Only show if there are any */}
      {insights.criticalIssues.length > 0 && (
        <AppleWalletCard
          className="mb-6 aw-slide-in"
          style={{
            background: 'linear-gradient(135deg, var(--aw-error) 0%, #FF6B6B 100%)',
            color: 'white',
          }}
        >
          <h3
            className="aw-heading-lg"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 'var(--aw-space-lg)',
              color: 'white',
            }}
          >
            <span style={{ marginRight: 'var(--aw-space-sm)' }}>⚠️</span>Needs Attention
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--aw-space-md)' }}>
            {insights.criticalIssues.map((issue, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--aw-space-lg)',
                  borderRadius: 'var(--aw-radius-md)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--aw-space-md)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 className="aw-heading-md" style={{ color: 'white', margin: 0 }}>
                      {issue.title}
                    </h4>
                    <p
                      className="aw-text-body"
                      style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 'var(--aw-space-xs)' }}
                    >
                      {issue.description}
                    </p>
                  </div>
                  <AppleWalletButton
                    variant="ghost"
                    onClick={() => handleAction(issue.action)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {issue.action}
                  </AppleWalletButton>
                </div>
              </div>
            ))}
          </div>
        </AppleWalletCard>
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
