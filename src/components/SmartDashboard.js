import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const SmartDashboard = ({ onQueryGenerated }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadData();
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

    setInsights({ criticalIssues, stats, overdueTasks, inactiveCards });
  };

  const handleAction = actionType => {
    switch (actionType) {
      case 'View Tasks':
        window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'todos' } }));
        break;
      case 'Review Cards':
        window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: 'cards' } }));
        break;
      default:
        if (onQueryGenerated) onQueryGenerated(actionType);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div className="loading" style={{ margin: '0 auto var(--space-4)' }}></div>
            <div className="text-secondary">Loading insights...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>📊</div>
            <CardTitle className="mb-2">No Data Available</CardTitle>
            <CardDescription>Add some tasks or credit cards to see insights.</CardDescription>
          </div>
        </Card>
      </div>
    );
  }

  const completionRate =
    insights.stats.totalTasks > 0
      ? Math.round((insights.stats.completedTasks / insights.stats.totalTasks) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        className="p-4 md:p-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <Card className="mb-6 bg-white rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">📊 Smart Insights</CardTitle>
            <CardDescription className="text-sm md:text-base">
              AI-powered financial and productivity insights
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Critical Issues */}
        {insights.criticalIssues.length > 0 && (
          <Card
            className="mb-6 bg-white rounded-2xl shadow-md border-error"
            style={{ background: 'rgb(239 68 68 / 0.02)' }}
          >
            <CardHeader>
              <CardTitle className="text-error">⚠️ Needs Attention</CardTitle>
              <CardDescription>Issues that require immediate action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.criticalIssues.map((issue, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-error"
                    style={{ background: 'rgb(239 68 68 / 0.05)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div>
                      <div className="font-semibold text-error">{issue.title}</div>
                      <div className="text-sm text-secondary">{issue.description}</div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleAction(issue.action)}
                      className="text-error border-error"
                    >
                      {issue.action}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {insights.stats.totalTasks}
                </div>
                <div className="text-sm font-medium text-primary">Total Tasks</div>
                <div className="text-xs text-secondary">
                  {insights.stats.completedTasks} completed
                </div>
                <div
                  className="mt-3 h-2 rounded-full"
                  style={{ background: 'var(--border-light)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #34C759 0%, #007AFF 100%)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {insights.stats.totalCards}
                </div>
                <div className="text-sm font-medium text-secondary">Credit Cards</div>
                <div className="text-xs text-secondary">{insights.stats.activeCards} active</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-warning mb-2">
                  {insights.inactiveCards.length}
                </div>
                <div className="text-sm font-medium text-warning">Inactive Cards</div>
                <div className="text-xs text-secondary">90+ days unused</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="text-center p-6">
                <div className="text-3xl font-bold text-error mb-2">
                  {insights.overdueTasks.length}
                </div>
                <div className="text-sm font-medium text-error">Overdue Tasks</div>
                <div className="text-xs text-secondary">Need attention</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>⚡ Quick Actions</CardTitle>
            <CardDescription>Jump to important sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => handleAction('View Tasks')}
                className="justify-start p-4 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">📝 Manage Tasks</div>
                  <div className="text-sm text-secondary">View and organize your to-dos</div>
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleAction('Review Cards')}
                className="justify-start p-4 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">💳 Review Cards</div>
                  <div className="text-sm text-secondary">Check card activity and promos</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Good Message */}
        {insights.criticalIssues.length === 0 && (
          <Card
            className="mt-6 bg-white rounded-2xl shadow-md border-success"
            style={{ background: 'rgb(34 197 94 / 0.02)' }}
          >
            <CardContent className="text-center p-8">
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>✅</div>
              <CardTitle className="text-success mb-2">Everything Looks Good!</CardTitle>
              <CardDescription>
                No critical issues found. Keep up the great work managing your finances and tasks.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default SmartDashboard;
