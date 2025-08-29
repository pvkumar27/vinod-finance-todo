import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayDateString } from '../utils/dateUtils';
import { api } from '../services/api';
import TaskList from './TaskList';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [showCompleted, setShowCompleted] = useState(false);

  const { taskComplete, buttonPress, success, error: errorSound } = useSoundEffects();

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data || []);
    } catch (error) {
      setMessage(`Error loading tasks: ${error.message}`);
      errorSound();
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async e => {
    e.preventDefault();
    if (!newTask.trim()) return;

    buttonPress();

    try {
      await api.addTodo({
        task: newTask.trim(),
        due_date: taskDate,
        pinned: false,
      });
      setMessage('✅ Task added successfully!');
      success();
      setTimeout(() => setMessage(''), 3000);
      setNewTask('');
      setTaskDate(getTodayDateString());
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      errorSound();
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await api.updateTodo(id, { completed: !completed });

      if (!completed) {
        taskComplete();
        setMessage('🎉 Task completed!');
      } else {
        success();
        setMessage('✅ Task updated!');
      }

      setTimeout(() => setMessage(''), 2000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      errorSound();
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDelete = async id => {
    buttonPress();

    try {
      await api.deleteTodo(id);
      setMessage('🗑️ Task deleted!');
      success();
      setTimeout(() => setMessage(''), 2000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      errorSound();
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
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div className="loading" style={{ margin: '0 auto var(--space-4)' }}></div>
            <div className="text-secondary">Loading tasks...</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="container"
      style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📝 Tasks</CardTitle>
              <CardDescription>Manage your daily tasks and boost productivity</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-secondary">{completionRate}% Complete</div>
              <div
                className="rounded-full"
                style={{
                  width: '40px',
                  height: '40px',
                  background: `conic-gradient(var(--primary) ${completionRate * 3.6}deg, var(--border-light) 0deg)`,
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
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--primary)',
                  }}
                >
                  {completionRate}%
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <Card className={`mb-6 ${message.includes('❌') ? 'border-error' : 'border-success'}`}>
              <div
                className={`font-medium ${message.includes('❌') ? 'text-error' : 'text-success'}`}
              >
                {message}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Form */}
      <Card className="mb-6">
        <form onSubmit={handleAddTodo}>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              style={{ flex: 1 }}
            />
            <Input
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              style={{ width: '150px' }}
            />
            <Button type="submit">➕ Add Task</Button>
          </div>
        </form>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Tasks</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-secondary">{pendingTodos.length} pending</div>
              {completedTodos.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    buttonPress();
                    setShowCompleted(!showCompleted);
                  }}
                >
                  {showCompleted ? 'Hide' : 'Show'} Completed ({completedTodos.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {pendingTodos.length === 0 ? (
            <motion.div
              className="text-center"
              style={{ padding: 'var(--space-8) 0' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
              <div className="section-header text-primary mb-2">All caught up!</div>
              <div className="body-text text-secondary">
                No pending tasks. Time to add some new goals!
              </div>
            </motion.div>
          ) : (
            <TaskList
              tasks={pendingTodos}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          )}

          {/* Completed Tasks */}
          <AnimatePresence>
            {showCompleted && completedTodos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  overflow: 'hidden',
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-6)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <h3 className="section-header text-primary mb-4">
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskManager;
