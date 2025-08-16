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
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="finbot-heading-xl finbot-responsive-heading flex items-center">
          <span className="mr-3 text-2xl">📊</span>
          Financial Insights
        </h2>
        <p className="finbot-responsive-text text-[#8B4513] mt-1">
          Your complete financial overview
        </p>
      </div>

      {/* Credit Card Insights */}
      <div className="space-y-4">
        <h3 className="finbot-heading-lg finbot-responsive-text mb-4">
          <span className="mr-2">💳</span>Credit Card Portfolio
        </h3>
        <CreditCardDashboardInsights cards={cards} />
      </div>

      {/* Todo Insights */}
      <div className="space-y-4">
        <h3 className="finbot-heading-lg finbot-responsive-text mb-4">
          <span className="mr-2">✅</span>Task Management
        </h3>

        <div className="finbot-card p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                  <span className="text-sm sm:text-lg text-white">📝</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-700">Total Tasks</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900">
                    {todoInsights.totalTodos}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border border-green-200">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                  <span className="text-sm sm:text-lg text-white">✅</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-700">Completed</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900">
                    {todoInsights.completedTodos}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 sm:p-4 border border-yellow-200">
              <div className="flex items-center">
                <div className="bg-yellow-500 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                  <span className="text-sm sm:text-lg text-white">⏳</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-900">
                    {todoInsights.pendingTodos}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 border border-red-200">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                  <span className="text-sm sm:text-lg text-white">⚠️</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-700">Overdue</p>
                  <p className="text-lg sm:text-xl font-bold text-red-900">
                    {todoInsights.overdueTodos}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="finbot-card p-4 bg-white/5 backdrop-blur-sm">
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
      <div className="finbot-card p-6">
        <h3 className="finbot-heading-lg finbot-responsive-text mb-4">
          <span className="mr-2">🚀</span>Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="finbot-card p-4 bg-white/5 backdrop-blur-sm">
            <h4 className="font-medium text-gray-800 mb-2">💳 Credit Cards</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check for inactive cards (90+ days)</li>
              <li>• Review promo expiration dates</li>
              <li>• Set up payment reminders</li>
            </ul>
          </div>
          <div className="finbot-card p-4 bg-white/5 backdrop-blur-sm">
            <h4 className="font-medium text-gray-800 mb-2">✅ Tasks</h4>
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
