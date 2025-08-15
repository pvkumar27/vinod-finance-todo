import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CreditCardDashboardInsights from './CreditCardDashboardInsights';

const InsightsTab = () => {
  const [cards, setCards] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cardsData, todosData] = await Promise.all([api.getCreditCards(), api.getTodos()]);
        setCards(cardsData || []);
        setTodos(todosData || []);
      } catch (error) {
        console.error('Error fetching insights data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTodoInsights = () => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.completed).length;
    const pendingTodos = totalTodos - completedTodos;
    const overdueTodos = todos.filter(t => {
      if (t.completed || !t.due_date) return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const pinnedTodos = todos.filter(t => t.pinned && !t.completed).length;

    return {
      totalTodos,
      completedTodos,
      pendingTodos,
      overdueTodos,
      pinnedTodos,
      completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#632D1F]"></div>
        <span className="ml-2 text-gray-600">Loading insights...</span>
      </div>
    );
  }

  const todoInsights = getTodoInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#632D1F] text-white rounded-xl p-4 flex items-center space-x-3">
        <span className="text-2xl">📊</span>
        <div>
          <h2 className="text-xl font-bold">Financial Insights</h2>
          <p className="text-sm opacity-90">Your complete financial overview</p>
        </div>
      </div>

      {/* Credit Card Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#632D1F] flex items-center space-x-2">
          <span>💳</span>
          <span>Credit Card Portfolio</span>
        </h3>
        <CreditCardDashboardInsights cards={cards} />
      </div>

      {/* Todo Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#632D1F] flex items-center space-x-2">
          <span>✅</span>
          <span>Task Management</span>
        </h3>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-2 mr-3">
                  <span className="text-lg text-white">📝</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Tasks</p>
                  <p className="text-xl font-bold text-blue-900">{todoInsights.totalTodos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-2 mr-3">
                  <span className="text-lg text-white">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Completed</p>
                  <p className="text-xl font-bold text-green-900">{todoInsights.completedTodos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center">
                <div className="bg-yellow-500 rounded-lg p-2 mr-3">
                  <span className="text-lg text-white">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-xl font-bold text-yellow-900">{todoInsights.pendingTodos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-lg p-2 mr-3">
                  <span className="text-lg text-white">⚠️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">Overdue</p>
                  <p className="text-xl font-bold text-red-900">{todoInsights.overdueTodos}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-semibold text-gray-800">Completion Rate</h4>
              <span className="text-sm font-bold text-[#632D1F]">
                {todoInsights.completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#632D1F] to-[#8B4513] h-3 rounded-full transition-all duration-500"
                style={{ width: `${todoInsights.completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{todoInsights.completedTodos} completed</span>
              <span>{todoInsights.pendingTodos} remaining</span>
            </div>
          </div>

          {/* Additional Stats */}
          {todoInsights.pinnedTodos > 0 && (
            <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📌</span>
                <span className="text-sm font-medium text-yellow-700">
                  {todoInsights.pinnedTodos} pinned task{todoInsights.pinnedTodos !== 1 ? 's' : ''}{' '}
                  need attention
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#FDF3EE] to-[#FCE7E2] rounded-xl p-6 border border-[#632D1F]/20">
        <h3 className="text-lg font-semibold text-[#632D1F] mb-4 flex items-center space-x-2">
          <span>🚀</span>
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-lg p-4 border border-[#632D1F]/10">
            <h4 className="font-medium text-[#632D1F] mb-2">💳 Credit Cards</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check for inactive cards (90+ days)</li>
              <li>• Review promo expiration dates</li>
              <li>• Set up payment reminders</li>
            </ul>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-[#632D1F]/10">
            <h4 className="font-medium text-[#632D1F] mb-2">✅ Tasks</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete overdue tasks</li>
              <li>• Review pinned priorities</li>
              <li>• Plan upcoming deadlines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsTab;
