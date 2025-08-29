import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayDateString } from '../utils/dateUtils';
import { api } from '../services/api';
import TaskList from './TaskList';
import useSoundEffects from '../hooks/useSoundEffects';
import useHaptics from '../hooks/useHaptics';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [showCompleted, setShowCompleted] = useState(false);

  const { taskComplete, buttonPress, success, error: errorSound } = useSoundEffects();
  const { lightTap, success: successHaptic, error: errorHaptic } = useHaptics();

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data || []);
    } catch (error) {
      setMessage(`Error loading tasks: ${error.message}`);
      errorSound();
      errorHaptic();
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async e => {
    e.preventDefault();
    if (!newTask.trim()) return;

    buttonPress();
    lightTap();

    try {
      await api.addTodo({
        task: newTask.trim(),
        due_date: taskDate,
        pinned: false,
      });
      setMessage('✅ Task added successfully!');
      success();
      successHaptic();
      setTimeout(() => setMessage(''), 3000);
      setNewTask('');
      setTaskDate(getTodayDateString());
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      errorSound();
      errorHaptic();
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await api.updateTodo(id, { completed: !completed });

      if (!completed) {
        taskComplete();
        successHaptic();
        setMessage('🎉 Task completed! Great job!');
      } else {
        success();
        lightTap();
        setMessage('✅ Task updated!');
      }

      setTimeout(() => setMessage(''), 2000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      errorSound();
      errorHaptic();
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDelete = async id => {
    buttonPress();
    lightTap();

    try {
      await api.deleteTodo(id);
      setMessage('🗑️ Task deleted!');
      success();
      setTimeout(() => setMessage(''), 2000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      errorSound();
      errorHaptic();
      setTimeout(() => setMessage(''), 4000);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const completionRate =
    todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <motion.div
          className="modern-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <div className="modern-loading" style={{ margin: '0 auto var(--space-4)' }}></div>
          <div className="text-secondary">Loading tasks...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}
    >
      {/* Header */}
      <motion.div
        className="modern-card mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold text-primary">📝 Tasks</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-secondary">{completionRate}% Complete</div>
            <div
              className="rounded-full"
              style={{
                width: '40px',
                height: '40px',
                background: `conic-gradient(var(--color-primary) ${completionRate * 3.6}deg, var(--color-border-light) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--color-primary)',
                }}
              >
                {completionRate}%
              </div>
            </div>
          </div>
        </div>
        <p className="text-secondary">Manage your daily tasks and boost productivity</p>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`modern-card mb-6 ${message.includes('❌') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`font-medium ${message.includes('❌') ? 'text-red-700' : 'text-green-700'}`}
            >
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Form */}
      <motion.div
        className="modern-card mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <form onSubmit={handleAddTodo}>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <motion.input
                type="text"
                placeholder="What needs to be done?"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="modern-input"
                style={{ flex: 1 }}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <motion.input
                type="date"
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                className="modern-input"
                style={{ width: '150px' }}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <motion.button
                type="submit"
                className="modern-btn modern-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <span>➕</span>
                Add Task
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Tasks Overview */}
      <motion.div
        className="modern-card mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">Active Tasks</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-secondary">{pendingTodos.length} pending</div>
            {completedTodos.length > 0 && (
              <motion.button
                onClick={() => {
                  buttonPress();
                  lightTap();
                  setShowCompleted(!showCompleted);
                }}
                className="modern-btn modern-btn-ghost text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showCompleted ? 'Hide' : 'Show'} Completed ({completedTodos.length})
              </motion.button>
            )}
          </div>
        </div>

        {pendingTodos.length === 0 ? (
          <motion.div
            className="text-center"
            style={{ padding: 'var(--space-12) 0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              🎉
            </motion.div>
            <div className="text-lg font-medium text-primary mb-2">All caught up!</div>
            <div className="text-secondary">No pending tasks. Time to add some new goals!</div>
          </motion.div>
        ) : (
          <TaskList
            tasks={pendingTodos}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}
      </motion.div>

      {/* Completed Tasks */}
      <AnimatePresence>
        {showCompleted && completedTodos.length > 0 && (
          <motion.div
            className="modern-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <h3 className="text-lg font-semibold text-primary mb-4">
              ✅ Completed Tasks ({completedTodos.length})
            </h3>
            <TaskList
              tasks={completedTodos}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              completed={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;
