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

  const getStatusBadge = (status, task) => {
    if (status === 'overdue' && task.due_date) {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
          {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
        </span>
      );
    }

    const badges = {
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
    let bgColor = 'rgba(255, 255, 255, 0.9)';

    // Due date based color coding (red = overdue/urgent, green = future)
    if (task.due_date) {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

      if (daysDiff < 0) {
        // Overdue - red
        bgColor = 'rgba(254, 226, 226, 0.9)';
      } else if (daysDiff === 0) {
        // Due today - orange
        bgColor = 'rgba(254, 243, 199, 0.9)';
      } else if (daysDiff <= 3) {
        // Due soon - yellow
        bgColor = 'rgba(254, 249, 195, 0.9)';
      } else if (daysDiff <= 7) {
        // Due this week - light green
        bgColor = 'rgba(240, 253, 244, 0.9)';
      } else {
        // Future - green
        bgColor = 'rgba(220, 252, 231, 0.9)';
      }
    }

    // Pinned tasks get blue tint
    if (task.pinned) bgColor = 'rgba(219, 234, 254, 0.9)';

    return {
      background: bgColor,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '6px',
      boxShadow: task.pinned ? '0 2px 4px rgb(0 0 0 / 0.1)' : '0 1px 2px rgb(0 0 0 / 0.05)',
      border: task.pinned ? '1px solid #3B82F6' : '1px solid rgba(0, 0, 0, 0.1)',
      padding: '10px 12px',
      position: 'relative',
      overflow: 'hidden',
    };
  };

  // Sort tasks by pinned status, then by due date (oldest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // Sort by due date - oldest first (most urgent)
    if (a.due_date && b.due_date) {
      return new Date(a.due_date) - new Date(b.due_date);
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;

    // Fallback to creation date
    return new Date(a.created_at || a.id) - new Date(b.created_at || b.id);
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

              {/* Left edge gradient for all cards */}
              {!task.completed && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    background: task.due_date
                      ? (() => {
                          const today = new Date();
                          const dueDate = new Date(task.due_date);
                          const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

                          if (daysDiff < 0) return 'linear-gradient(to bottom, #ef4444, #f87171)'; // red
                          if (daysDiff === 0) return 'linear-gradient(to bottom, #f59e0b, #fbbf24)'; // orange
                          if (daysDiff <= 3) return 'linear-gradient(to bottom, #eab308, #facc15)'; // yellow
                          if (daysDiff <= 7) return 'linear-gradient(to bottom, #22c55e, #4ade80)'; // light green
                          return 'linear-gradient(to bottom, #16a34a, #22c55e)'; // green
                        })()
                      : 'linear-gradient(to bottom, #6b7280, #9ca3af)', // gray for no due date
                  }}
                />
              )}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={task.completed ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <Checkbox
                    checked={task.completed || false}
                    onChange={() => {
                      buttonPress();
                      onToggleComplete(task.id, task.completed);
                    }}
                    style={{ width: '16px', height: '16px' }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.div
                    animate={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.7 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-medium text-gray-900"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.task}
                    {task.due_date && (
                      <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        Due: {formatDateString(task.due_date)}
                      </span>
                    )}
                  </motion.div>
                </div>

                <div className="flex items-center gap-1">
                  {getStatusBadge(status, task)}
                  <div className="flex items-center gap-0.5">
                    {!task.completed && onStartPomodoro && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          buttonPress();
                          onStartPomodoro(task);
                        }}
                        className="p-0.5 text-gray-400 hover:text-red-500 text-xs w-6 h-6"
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
                        className="p-0.5 text-gray-400 hover:text-blue-500 text-xs w-6 h-6"
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
                        className="p-0.5 text-gray-400 hover:text-blue-500 text-xs w-6 h-6"
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
                      className="p-0.5 text-gray-400 hover:text-red-500 text-xs w-6 h-6"
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
