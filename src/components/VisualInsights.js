import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const VisualInsights = ({ data, type = 'overview' }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateVisualInsights();
  }, [data, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateVisualInsights = async () => {
    setLoading(true);
    try {
      let visualData = {};

      if (type === 'overview') {
        const todos = await api.getTodos({});
        const cards = await api.getCreditCards({});

        // Todo completion stats
        const completedTodos = todos.filter(t => t.completed).length;
        const pendingTodos = todos.filter(t => !t.completed).length;
        const overdueTodos = todos.filter(
          t => !t.completed && t.due_date && new Date(t.due_date) < new Date()
        ).length;

        // Card activity stats
        const activeCards = cards.filter(c => {
          if (!c.last_used_date) return false;
          const daysSince = Math.floor(
            (new Date() - new Date(c.last_used_date)) / (1000 * 60 * 60 * 24)
          );
          return daysSince <= 90;
        }).length;

        const inactiveCards = cards.length - activeCards;

        visualData = {
          todoStats: {
            completed: completedTodos,
            pending: pendingTodos,
            overdue: overdueTodos,
            total: todos.length,
          },
          cardStats: {
            active: activeCards,
            inactive: inactiveCards,
            total: cards.length,
          },
        };
      }

      setInsights(visualData);
    } catch (error) {
      console.error('Error generating visual insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-20 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const TodoCompletionChart = ({ stats }) => {
    const total = stats.total || 1;
    const completedPercentage = (stats.completed / total) * 100;
    const pendingPercentage = (stats.pending / total) * 100;
    const overduePercentage = (stats.overdue / total) * 100;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center">📋 Task Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Completed
            </span>
            <span className="font-medium">
              {stats.completed} ({Math.round(completedPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completedPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Pending
            </span>
            <span className="font-medium">
              {stats.pending} ({Math.round(pendingPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>

          {stats.overdue > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Overdue
                </span>
                <span className="font-medium">
                  {stats.overdue} ({Math.round(overduePercentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overduePercentage}%` }}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const CardActivityChart = ({ stats }) => {
    const total = stats.total || 1;
    const activePercentage = (stats.active / total) * 100;
    const inactivePercentage = (stats.inactive / total) * 100;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center">💳 Card Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Active (90 days)
            </span>
            <span className="font-medium">
              {stats.active} ({Math.round(activePercentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${activePercentage}%` }}
            ></div>
          </div>

          {stats.inactive > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  Inactive (90+ days)
                </span>
                <span className="font-medium">
                  {stats.inactive} ({Math.round(inactivePercentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${inactivePercentage}%` }}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl border border-blue-200/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center">📊 Financial Overview</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          AI Generated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.todoStats && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <TodoCompletionChart stats={insights.todoStats} />
          </div>
        )}

        {insights.cardStats && insights.cardStats.total > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <CardActivityChart stats={insights.cardStats} />
          </div>
        )}
      </div>

      {/* AI Insights Summary */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">🤖 AI Insights</h4>
        <div className="text-sm text-gray-700 space-y-1">
          {insights.todoStats && (
            <div>
              {insights.todoStats.completed > insights.todoStats.pending ? (
                <p className="text-green-700">
                  ✅ Great job! You're completing more tasks than you have pending.
                </p>
              ) : insights.todoStats.overdue > 0 ? (
                <p className="text-red-700">⚠️ Focus on overdue tasks to get back on track.</p>
              ) : (
                <p className="text-blue-700">📈 Keep up the momentum with your current tasks.</p>
              )}
            </div>
          )}

          {insights.cardStats && insights.cardStats.total > 0 && (
            <div>
              {insights.cardStats.inactive > 0 ? (
                <p className="text-orange-700">
                  💳 Consider using or closing {insights.cardStats.inactive} inactive card
                  {insights.cardStats.inactive > 1 ? 's' : ''}.
                </p>
              ) : (
                <p className="text-green-700">💳 All your credit cards are being used regularly!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualInsights;
