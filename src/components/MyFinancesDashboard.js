import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/expenses';
import DashboardCard from './DashboardCard';

const MyFinancesDashboard = ({ onClose }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await fetchExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthTransactions = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const thisMonthIncome = thisMonthTransactions.filter(t => t.is_income).reduce((sum, t) => sum + t.amount, 0);
  const thisMonthExpenses = thisMonthTransactions.filter(t => !t.is_income).reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = expenses.filter(t => t.is_income).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.filter(t => !t.is_income).reduce((sum, t) => sum + t.amount, 0);

  const stats = {
    totalTransactions: expenses.length,
    thisMonthIncome,
    thisMonthExpenses,
    thisMonthNet: thisMonthIncome - thisMonthExpenses,
    netWorth: totalIncome - totalExpenses,
  };

  const categoryTotals = expenses.filter(t => !t.is_income).reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const incomeSources = expenses.filter(t => t.is_income).reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

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
            <h2 className="text-2xl font-bold text-gray-900">💰 My Finances Dashboard</h2>
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
              title="This Month Income"
              value={`$${stats.thisMonthIncome.toLocaleString()}`}
              icon="💰"
              color="success"
            />
            <DashboardCard
              title="This Month Expenses"
              value={`$${stats.thisMonthExpenses.toLocaleString()}`}
              icon="💸"
              color="danger"
            />
            <DashboardCard
              title="This Month Net"
              value={`$${stats.thisMonthNet.toLocaleString()}`}
              subtitle={stats.thisMonthNet >= 0 ? 'Surplus' : 'Deficit'}
              icon="📈"
              color={stats.thisMonthNet >= 0 ? 'success' : 'danger'}
            />
            <DashboardCard
              title="Total Net Worth"
              value={`$${stats.netWorth.toLocaleString()}`}
              subtitle="All time"
              icon="📊"
              color={stats.netWorth >= 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
              {topCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💸</div>
                  <p>No expenses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCategories.map(([category, amount], index) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '💸'}
                        </span>
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <span className="font-bold text-red-600">-${amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
              {Object.keys(incomeSources).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💰</div>
                  <p>No income recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(incomeSources)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([source, amount], index) => (
                    <div key={source} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '💰'}
                        </span>
                        <span className="font-medium capitalize">{source}</span>
                      </div>
                      <span className="font-bold text-green-600">+${amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFinancesDashboard;