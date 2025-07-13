import React, { useState, useEffect } from 'react';
import { fetchExpenses } from '../services/expenses';
import DashboardCard from './DashboardCard';

const ExpensesDashboard = ({ onClose }) => {
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
  
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
  });

  const stats = {
    totalExpenses: expenses.length,
    thisMonthTotal: thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    lastMonthTotal: lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    avgExpense: expenses.length > 0 ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length : 0,
  };

  const monthlyChange = stats.lastMonthTotal > 0 
    ? ((stats.thisMonthTotal - stats.lastMonthTotal) / stats.lastMonthTotal * 100).toFixed(1)
    : 0;

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
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
            <h2 className="text-2xl font-bold text-gray-900">💰 Expenses Dashboard</h2>
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
              title="This Month"
              value={`$${stats.thisMonthTotal.toLocaleString()}`}
              icon="📅"
              color="primary"
              trend={{
                direction: monthlyChange >= 0 ? 'up' : 'down',
                value: `${Math.abs(monthlyChange)}%`
              }}
            />
            <DashboardCard
              title="Total Expenses"
              value={stats.totalExpenses}
              icon="📊"
              color="warning"
            />
            <DashboardCard
              title="Average"
              value={`$${stats.avgExpense.toFixed(0)}`}
              subtitle="per expense"
              icon="📈"
              color="success"
            />
            <DashboardCard
              title="Last Month"
              value={`$${stats.lastMonthTotal.toLocaleString()}`}
              icon="📋"
              color="primary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
              {topCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💰</div>
                  <p>No expenses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCategories.map(([category, amount], index) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                        </span>
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <span className="font-bold text-gray-900">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No recent expenses</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${expense.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
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

export default ExpensesDashboard;