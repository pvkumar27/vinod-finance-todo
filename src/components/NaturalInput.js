import React, { useState } from 'react';
import { parseInput } from '../utils/parseInput';
import { addTodo } from '../services/todos';

const NaturalInput = () => {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Removed examples as requested

  const handleSubmit = async e => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const parsed = parseInput(input);

      if (parsed.intent === 'unknown') {
        setMessage("❓ Sorry, I couldn't understand that. Try one of the examples below.");
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
        case 'add_todo':
        case 'reminder':
          const todoData =
            preview.intent === 'add_todo'
              ? preview.payload
              : {
                  task: preview.payload.task,
                  due_date: preview.payload.due_date,
                  notes: `Reminder for ${preview.payload.card_name}`,
                };
          await addTodo(todoData);
          setMessage('✅ To-do added successfully!');
          break;

        default:
          setMessage('❌ Only to-do commands are supported here.');
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
        Type commands in plain English to add to-dos and reminders.
      </p>

      {message && (
        <div
          className={`p-3 rounded mb-4 ${
            message.includes('❌') || message.includes('❓')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
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
            onChange={e => setInput(e.target.value)}
            placeholder="Try: 'Remind me to pay bills tomorrow' or 'Create task: fix sink'"
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
    </div>
  );
};

export default NaturalInput;
