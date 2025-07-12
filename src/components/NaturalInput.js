import React, { useState } from 'react';
import { parseInput } from '../utils/parseInput';
import { addExpense } from '../services/expenses';
import { addTodo } from '../services/todos';
import { addCreditCard } from '../services/creditCards';

const NaturalInput = () => {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const examples = [
    "Add $20 for groceries today",
    "Remind me to pay Discover on July 5",
    "Create a to-do: fix kitchen sink tomorrow",
    "Log $25 as medicine expense",
    "Add credit card: Citi Custom Cash, 0% until Dec 2025"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const parsed = parseInput(input);
      
      if (parsed.intent === 'unknown') {
        setMessage('❓ Sorry, I couldn\'t understand that. Try one of the examples below.');
        setLoading(false);
        return;
      }

      // Show preview
      setPreview(parsed);
      
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async () => {
    if (!preview) return;

    setLoading(true);
    try {
      switch (preview.intent) {
        case 'add_expense':
          await addExpense(preview.payload);
          setMessage('✅ Expense added successfully!');
          break;
          
        case 'add_todo':
          await addTodo(preview.payload);
          setMessage('✅ To-do added successfully!');
          break;
          
        case 'add_credit_card':
          await addCreditCard(preview.payload);
          setMessage('✅ Credit card added successfully!');
          break;
          
        case 'reminder':
          await addTodo({
            task: preview.payload.task,
            due_date: preview.payload.due_date,
            notes: `Reminder for ${preview.payload.card_name}`
          });
          setMessage('✅ Reminder added to your to-dos!');
          break;
          
        default:
          setMessage('❌ Action not supported yet.');
      }
      
      setInput('');
      setPreview(null);
      
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setPreview(null);
    setMessage('');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Natural Language Input</h2>
      <p className="text-gray-600 mb-6">
        Type commands in plain English to add expenses, todos, or credit cards.
      </p>

      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('❌') || message.includes('❓') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Preview Action:</h3>
          <div className="text-sm text-blue-700 mb-3">
            <strong>Intent:</strong> {preview.intent.replace('_', ' ')}
            <br />
            <strong>Details:</strong> {JSON.stringify(preview.payload, null, 2)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={executeAction}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm & Execute'}
            </button>
            <button
              onClick={cancelAction}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try typing: 'Add $20 for groceries today'"
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Parsing...' : 'Parse'}
          </button>
        </div>
      </form>

      {/* Examples */}
      <div>
        <h3 className="font-semibold mb-3">Try these examples:</h3>
        <div className="grid grid-cols-1 gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setInput(example)}
              className="text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NaturalInput;