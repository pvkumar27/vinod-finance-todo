import React, { useState, useEffect } from 'react';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '../services/expenses';

const ExpensesTest = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    owner: 'self',
    sync_source: 'Manual'
  });

  const expenseCategories = ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

  const loadExpenses = async () => {
    try {
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      type: expense.is_income ? 'income' : 'expense',
      category: expense.category,
      date: expense.date,
      owner: expense.owner || 'self',
      sync_source: expense.sync_source || 'Manual'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        is_income: formData.type === 'income'
      };
      
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        setMessage('✅ Entry updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        await addExpense(expenseData);
        setMessage('✅ Entry added successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
      
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        owner: 'self',
        sync_source: 'Manual'
      });
      setEditingExpense(null);
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setMessage('✅ Entry deleted!');
      setTimeout(() => setMessage(''), 4000);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center">
          <span className="mr-2">💰</span>
          My Finances
        </h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 rounded-full p-1 w-full sm:w-auto shadow-inner">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-full text-sm transition-all flex-1 sm:flex-auto ${
                viewMode === 'cards' 
                  ? 'bg-white shadow-md text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-full text-sm transition-all flex-1 sm:flex-auto ${
                viewMode === 'table' 
                  ? 'bg-white shadow-md text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Table
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm font-medium shadow-md flex items-center justify-center"
          >
            <span className="mr-1">{showForm ? '✖️' : '➕'}</span>
            {showForm ? 'Cancel' : 'Add Entry'}
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">{editingExpense ? 'Edit Entry' : 'Add New Entry'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Description"
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
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value, category: e.target.value === 'income' ? 'Salary' : 'Food'})}
            className="p-2 border rounded"
          >
            <option value="expense">💸 Expense</option>
            <option value="income">💰 Income</option>
          </select>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="p-2 border rounded"
          >
            {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Owner</label>
            <select
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="self">Self</option>
              <option value="spouse">Spouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Source</label>
            <select
              value={formData.sync_source}
              onChange={(e) => setFormData({...formData, sync_source: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="Manual">Manual</option>
              <option value="Plaid">Plaid</option>
              <option value="Apple">Apple</option>
            </select>
          </div>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="p-2 border rounded"
            required
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            {editingExpense ? 'Update Entry' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
          </button>
          {editingExpense && (
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setShowForm(false);
                setFormData({
                  description: '',
                  amount: '',
                  type: 'expense',
                  category: 'Food',
                  date: new Date().toISOString().split('T')[0],
                  owner: 'self',
                  sync_source: 'Manual'
                });
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
        </form>
      )}

      {/* Expenses List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions ({expenses.length})</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No transactions found</p>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.is_income ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {expense.is_income ? '💰 Income' : '💸 Expense'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium">{expense.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left capitalize">{expense.category}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <span className={`font-bold ${
                        expense.is_income ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {expense.is_income ? '+' : '-'}${expense.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses.map((expense) => (
              <div key={expense.id} className={`border rounded-lg p-4 ${
                expense.is_income ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-left">{expense.description}</h4>
                    <p className="text-gray-600 text-left capitalize">{expense.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      expense.is_income ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {expense.is_income ? '💰 Income' : '💸 Expense'}
                    </span>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="text-left">
                  <span className={`text-slate-700 font-bold bg-slate-100 px-2 py-1 rounded ${
                    expense.is_income ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                  }`}>
                    Amount: {expense.is_income ? '+' : '-'}${expense.amount.toLocaleString()}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm text-left mt-2">
                  Date: {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesTest;