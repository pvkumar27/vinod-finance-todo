import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';
import { Button } from './ui/Button';
import Checkbox from './ui/Checkbox';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskList = ({
  tasks,
  onToggleComplete,
  onDelete,
  onStartPomodoro,
  onEdit,
  onTogglePin,
  completed = false,
}) => {
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
      overdue: { text: 'Overdue', bg: 'bg-red-100', textColor: 'text-red-600' },
      today: { text: 'Today', bg: 'bg-amber-100', textColor: 'text-amber-600' },
      completed: { text: 'Done', bg: 'bg-green-100', textColor: 'text-green-600' },
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.textColor}`}>
        {badge.text}
      </span>
    );
  };

  const getTaskCardStyle = task => {
    const status = getTaskStatus(task);
    let bgColor = 'rgba(255, 255, 255, 0.9)';

    // Age-based color coding
    if (task.created_at) {
      const daysSince = Math.floor(
        (new Date() - new Date(task.created_at)) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 7) bgColor = 'rgba(254, 243, 199, 0.9)'; // amber tint for old tasks
      if (daysSince > 30) bgColor = 'rgba(254, 226, 226, 0.9)'; // red tint for very old tasks
    }

    // Pinned tasks get blue tint
    if (task.pinned) bgColor = 'rgba(219, 234, 254, 0.9)';

    return {
      background: bgColor,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '8px',
      boxShadow: task.pinned ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: task.pinned ? '2px solid #3B82F6' : 'none',
      padding: '12px',
      position: 'relative',
      overflow: 'hidden',
    };
  };

  // Sort tasks by pinned status, then by creation date (newest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
  });

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {sortedTasks.map((task, index) => {
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
              {/* Pin indicator */}
              {task.pinned && (
                <div className="absolute top-2 right-2 text-blue-500 text-sm" title="Pinned">
                  📌
                </div>
              )}

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
                  <div className="flex items-center gap-1">{getStatusBadge(status)}</div>
                  <div className="flex items-center gap-1">
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
                    {onTogglePin && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          buttonPress();
                          onTogglePin(task.id, task.pinned);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 text-xs"
                        title={task.pinned ? 'Unpin' : 'Pin'}
                      >
                        {task.pinned ? '📌' : '📍'}
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          buttonPress();
                          onEdit(task);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 text-xs"
                        title="Edit"
                      >
                        ✏️
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        buttonPress();
                        onDelete(task.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
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
