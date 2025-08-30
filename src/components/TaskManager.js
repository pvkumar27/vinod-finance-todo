import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';
import { api } from '../services/api';
import TaskList from './TaskList';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import Toggle from './ui/Toggle';
import useSoundEffects from '../hooks/useSoundEffects';
import useAudioCues from '../hooks/useAudioCues';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [showCompleted, setShowCompleted] = useState(false);

  const { taskComplete, buttonPress, success, error: errorSound } = useSoundEffects();
  const { taskComplete: taskCompleteAudio, error: errorAudio } = useAudioCues();

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data || []);
    } catch (error) {
      setMessage(`Error loading tasks: ${error.message}`);
      errorSound();
      errorAudio();
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
      errorAudio();
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await api.updateTodo(id, { completed: !completed });

      if (!completed) {
        taskComplete();
        taskCompleteAudio();
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
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
              <div className="relative" style={{ width: '40px', height: '40px' }}>
                <svg className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34C759" />
                      <stop offset="100%" stopColor="#007AFF" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="var(--border-light)"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - completionRate / 100) }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
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
            transition={{ type: 'spring', duration: 0.25, bounce: 0.3 }}
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
            <Button type="submit">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Task
            </Button>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">Show Completed</span>
                  <Toggle
                    checked={showCompleted}
                    onChange={() => {
                      buttonPress();
                      setShowCompleted(!showCompleted);
                    }}
                  />
                </div>
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
