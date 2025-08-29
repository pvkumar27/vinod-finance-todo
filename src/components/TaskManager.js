import React, { useState, useEffect } from 'react';
import { getTodayDateString } from '../utils/dateUtils';
import { api } from '../services/api';
import TaskList from './TaskList';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(getTodayDateString());

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data || []);
    } catch (error) {
      setMessage(`Error loading tasks: ${error.message}`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async e => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await api.addTodo({
        task: newTask.trim(),
        due_date: taskDate,
        pinned: false,
      });
      setMessage('Task added successfully!');
      setTimeout(() => setMessage(''), 3000);
      setNewTask('');
      setTaskDate(getTodayDateString());
      loadTodos();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await api.updateTodo(id, { completed: !completed });
      setMessage('Task updated!');
      setTimeout(() => setMessage(''), 2000);
      loadTodos();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDelete = async id => {
    try {
      await api.deleteTodo(id);
      setMessage('Task deleted!');
      setTimeout(() => setMessage(''), 2000);
      loadTodos();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  if (loading) {
    return (
      <div className="modern-container">
        <div className="modern-card text-center">
          <div className="modern-text">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-container">
      {/* Header */}
      <div className="modern-card">
        <h1 className="modern-h1">📝 Tasks</h1>
        <p className="modern-text">Manage your daily tasks</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`modern-card ${message.includes('Error') ? 'modern-badge-error' : 'modern-badge-success'}`}
        >
          <div className="modern-text">{message}</div>
        </div>
      )}

      {/* Add Task Form */}
      <div className="modern-card">
        <form onSubmit={handleAddTodo} className="modern-flex-col">
          <div className="modern-flex">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              className="modern-input"
              style={{ flex: 1 }}
            />
            <input
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="modern-input"
              style={{ width: '150px' }}
            />
            <button type="submit" className="modern-btn modern-btn-primary">
              Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Tasks */}
      <div className="modern-card">
        <div
          className="modern-flex"
          style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}
        >
          <h2 className="modern-h2">Tasks</h2>
          <div className="modern-text-sm">
            {pendingTodos.length} pending • {completedTodos.length} completed
          </div>
        </div>

        {pendingTodos.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🎉</div>
            <div className="modern-text">No pending tasks. Great job!</div>
          </div>
        ) : (
          <TaskList
            tasks={pendingTodos}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}

        {completedTodos.length > 0 && (
          <div
            style={{
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <h3 className="modern-h3" style={{ marginBottom: 'var(--space-4)' }}>
              ✅ Completed ({completedTodos.length})
            </h3>
            <TaskList
              tasks={completedTodos}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
