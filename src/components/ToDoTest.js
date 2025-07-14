import React, { useState, useEffect } from 'react';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../services/todos';
import { parseInput } from '../utils/parseInput';

const ToDoTest = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [editingTodo, setEditingTodo] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setNewTask(todo.task);
    setTaskDate(todo.due_date || new Date().toISOString().split('T')[0]);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMessage('❌ Voice recognition not supported in this browser');
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setMessage('🎤 Listening... Speak your task');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Parse the voice input for natural language
      const parsed = parseInput(transcript);
      
      if (parsed.intent === 'add_todo') {
        // Auto-submit the parsed task
        try {
          await addTodo(parsed.payload);
          setMessage(`✅ Task added via voice: "${parsed.payload.task}"`);
          setTimeout(() => setMessage(''), 4000);
          loadTodos();
        } catch (err) {
          setMessage(`❌ Error: ${err.message}`);
          setTimeout(() => setMessage(''), 4000);
        }
      } else {
        // Just fill the input field for manual submission
        setNewTask(transcript);
        setMessage(`✅ Voice input captured: "${transcript}" - Click Add to submit`);
        setTimeout(() => setMessage(''), 4000);
      }
    };

    recognition.onerror = (event) => {
      setMessage(`❌ Voice recognition error: ${event.error}`);
      setTimeout(() => setMessage(''), 4000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, { 
          task: newTask.trim(),
          due_date: taskDate
        });
        setMessage('✅ Task updated successfully!');
        setTimeout(() => setMessage(''), 4000);
        setEditingTodo(null);
      } else {
        const parsed = parseInput(newTask);
        let todoData;
        
        if (parsed.intent === 'add_todo' || parsed.intent === 'reminder') {
          todoData = parsed.intent === 'add_todo' 
            ? parsed.payload 
            : {
                task: parsed.payload.task,
                due_date: parsed.payload.due_date,
                notes: `Reminder for ${parsed.payload.card_name}`
              };
        } else {
          todoData = { 
            task: newTask.trim(),
            due_date: taskDate
          };
        }
        
        await addTodo(todoData);
        setMessage('✅ Task added successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
      
      setNewTask('');
      setTaskDate(new Date().toISOString().split('T')[0]);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await updateTodo(id, { completed: !completed });
      setMessage('✅ Task updated!');
      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setMessage('✅ Task deleted!');
      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  if (loading) return <div className="p-4">Loading todos...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">To-Do Manager</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={editingTodo ? "Edit task..." : "Add a new task..."}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
              title="Voice input"
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-40"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {editingTodo ? 'Update' : 'Add'}
          </button>
          {editingTodo && (
            <button
              type="button"
              onClick={() => {
                setEditingTodo(null);
                setNewTask('');
                setTaskDate(new Date().toISOString().split('T')[0]);
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: You can use natural language like "Remind me to pay bills tomorrow" or "Create task: fix sink"
        </p>
      </form>

      {/* Pending Tasks */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">
          Tasks ({todos.filter(t => !t.completed).length} pending, {todos.filter(t => t.completed).length} completed)
        </h3>
        
        {todos.filter(t => !t.completed).length === 0 ? (
          <p className="text-gray-600 text-center py-8">No pending tasks. Great job! 🎉</p>
        ) : viewMode === 'cards' ? (
          <div className="space-y-1">
            {todos.filter(t => !t.completed).map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2 bg-blue-50 rounded"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="text-sm">
                    <span className="text-gray-900">{todo.task}</span>
                    <span className="text-gray-500 ml-2">
                      {todo.due_date && `Due: ${new Date(todo.due_date).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 px-2 py-1 rounded text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Task</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Due Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.filter(t => !t.completed).map((todo) => (
                  <tr key={todo.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium">{todo.task}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(todo)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
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
        )}
      </div>

      {/* Completed Tasks - Collapsible */}
      {todos.filter(t => t.completed).length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-700">
              Completed Tasks ({todos.filter(t => t.completed).length})
            </h3>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showCompleted && (
            <div className="space-y-1">
              {todos.filter(t => t.completed).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-2 bg-green-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleComplete(todo.id, todo.completed)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <div className="text-sm">
                      <span className="line-through text-gray-600">{todo.task}</span>
                      <span className="text-gray-500 ml-2">
                        Added: {new Date(todo.created_at).toLocaleDateString()}
                        {todo.updated_at && ` • Completed: ${new Date(todo.updated_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToDoTest;