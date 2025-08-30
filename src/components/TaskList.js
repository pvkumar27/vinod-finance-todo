import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';
import { Button } from './ui/Button';
import Checkbox from './ui/Checkbox';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskList = ({ tasks, onToggleComplete, onDelete, onStartPomodoro, completed = false }) => {
  const todayStr = getTodayDateString();
  const { buttonPress } = useSoundEffects();

  const getTaskStatus = task => {
    if (task.completed) return 'completed';
    if (!task.due_date) return 'normal';
    if (task.due_date < todayStr) return 'overdue';
    if (task.due_date === todayStr) return 'today';
    return 'normal';
  };

  const getStatusBadge = status => {
    const badges = {
      overdue: { text: 'Overdue', bg: 'bg-red-100', text: 'text-red-600' },
      today: { text: 'Today', bg: 'bg-amber-100', text: 'text-amber-600' },
      completed: { text: 'Done', bg: 'bg-green-100', text: 'text-green-600' },
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.text}
      </span>
    );
  };

  const getTaskCardStyle = task => {
    return {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      border: 'none',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
    };
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {tasks.map((task, index) => {
          const status = getTaskStatus(task);
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: task.completed ? 0.7 : 1,
                scale: 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.8, x: -100 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.05,
              }}
              whileHover={{ scale: 1.02 }}
              style={getTaskCardStyle(task)}
            >
              {/* Left edge gradient for overdue */}
              {status === 'overdue' && !task.completed && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    background: 'linear-gradient(to bottom, #ef4444, #f87171)',
                  }}
                />
              )}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={task.completed ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Checkbox
                    checked={task.completed || false}
                    onChange={() => {
                      buttonPress();
                      onToggleComplete(task.id, task.completed);
                    }}
                  />
                </motion.div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <motion.div
                    animate={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.7 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-base font-medium text-gray-900 mb-1"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {task.task}
                  </motion.div>
                  {task.due_date && (
                    <div className="text-xs text-gray-400 mb-2">
                      Due: {formatDateString(task.due_date)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    {!task.completed && onStartPomodoro && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          buttonPress();
                          onStartPomodoro(task);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 text-xs"
                        title="Start Pomodoro"
                      >
                        🍅
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      buttonPress();
                      onDelete(task.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
