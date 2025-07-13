import React, { useState, useEffect } from 'react';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../services/todos';
import { parseInput } from '../utils/parseInput';

const ToDoTest = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTodo, setEditingTodo] = useState(null);
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
      <h2 className="text-2xl font-bold mb-6">To-Do Manager</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={editingTodo ? "Edit task..." : "Add a new task..."}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
        ) : (
          <div className="space-y-2">
            {todos.filter(t => !t.completed).map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white border-gray-300 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-gray-900">{todo.task}</span>
                    {todo.due_date && (
                      <div className="text-sm text-gray-500 mt-1">
                        Due: {new Date(todo.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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