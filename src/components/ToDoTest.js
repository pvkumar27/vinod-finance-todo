import React, { useState, useEffect } from 'react';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../services/todos';
import { parseInput } from '../utils/parseInput';

const ToDoTest = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
      setMessage('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setNewTask(todo.task);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, { task: newTask.trim() });
        setMessage('✅ Task updated successfully!');
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
          todoData = { task: newTask.trim() };
        }
        
        await addTodo(todoData);
        setMessage('✅ Task added successfully!');
      }
      
      setNewTask('');
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await updateTodo(id, { completed: !completed });
      setMessage('✅ Task updated!');
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setMessage('✅ Task deleted!');
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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={editingTodo ? "Edit task..." : "Add a new task..."}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Todos List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tasks ({todos.filter(t => !t.completed).length} pending, {todos.filter(t => t.completed).length} completed)
        </h3>
        
        {todos.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No tasks yet. Add one above!</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={todo.completed || false}
                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`${
                      todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {todo.task}
                  </span>
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
    </div>
  );
};

export default ToDoTest;