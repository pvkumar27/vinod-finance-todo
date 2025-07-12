import React, { useState, useEffect } from 'react';
import { fetchExpenses, addExpense, deleteExpense } from '../services/expenses';

const ExpensesTest = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Other'];

  const loadExpenses = async () => {
    try {
      const data = await fetchExpenses();
      setExpenses(data);
      setMessage('');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
      setMessage('✅ Expense added successfully!');
      loadExpenses();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setMessage('✅ Expense deleted!');
      loadExpenses();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  if (loading) return <div className="p-4">Loading expenses...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Expenses Manager</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Expense Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Expense description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="p-2 border rounded"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Add Expense
        </button>
      </form>

      {/* Expenses List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Expenses ({expenses.length})</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-600">No expenses found</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    {expense.category} • {expense.date}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-green-600">
                    ${expense.amount}
                  </span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesTest;