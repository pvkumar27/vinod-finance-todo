import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';
import useSoundEffects from '../hooks/useSoundEffects';
import useHaptics from '../hooks/useHaptics';

const TaskList = ({ tasks, onToggleComplete, onDelete, completed = false }) => {
  const todayStr = getTodayDateString();
  const { buttonPress } = useSoundEffects();
  const { lightTap } = useHaptics();

  const getTaskStatus = task => {
    if (task.completed) return 'completed';
    if (!task.due_date) return 'normal';
    if (task.due_date < todayStr) return 'overdue';
    if (task.due_date === todayStr) return 'today';
    return 'normal';
  };

  const getStatusBadge = status => {
    const badges = {
      overdue: { text: 'Overdue', color: 'var(--color-error)', bg: 'rgba(255, 59, 48, 0.1)' },
      today: { text: 'Today', color: 'var(--color-warning)', bg: 'rgba(255, 149, 0, 0.1)' },
      completed: { text: 'Done', color: 'var(--color-success)', bg: 'rgba(52, 199, 89, 0.1)' },
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span
        style={{
          padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-medium)',
          color: badge.color,
          backgroundColor: badge.bg,
        }}
      >
        {badge.text}
      </span>
    );
  };

  const getTaskCardStyle = task => {
    const status = getTaskStatus(task);
    const baseStyle = {
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border-light)',
      background: 'var(--color-surface)',
      transition: 'all var(--transition-fast)',
    };

    if (task.completed) {
      return {
        ...baseStyle,
        background: 'var(--color-surface-secondary)',
        opacity: 0.7,
      };
    }

    if (status === 'overdue') {
      return {
        ...baseStyle,
        borderColor: 'rgba(255, 59, 48, 0.2)',
        background: 'rgba(255, 59, 48, 0.02)',
      };
    }

    if (status === 'today') {
      return {
        ...baseStyle,
        borderColor: 'rgba(255, 149, 0, 0.2)',
        background: 'rgba(255, 149, 0, 0.02)',
      };
    }

    return baseStyle;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <AnimatePresence>
        {tasks.map((task, index) => {
          const status = getTaskStatus(task);
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                layout: { duration: 0.3 },
              }}
              whileHover={{
                scale: 1.01,
                boxShadow: 'var(--shadow-md)',
              }}
              style={getTaskCardStyle(task)}
            >
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => {
                      buttonPress();
                      lightTap();
                      onToggleComplete(task.id, task.completed);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${task.completed ? 'var(--color-success)' : 'var(--color-border)'}`,
                      backgroundColor: task.completed ? 'var(--color-success)' : 'transparent',
                      cursor: 'pointer',
                      accentColor: 'var(--color-success)',
                    }}
                  />
                </motion.div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: task.completed
                        ? 'var(--font-weight-normal)'
                        : 'var(--font-weight-medium)',
                      color: task.completed
                        ? 'var(--color-text-tertiary)'
                        : 'var(--color-text-primary)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      marginBottom: task.due_date ? 'var(--space-1)' : 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.task}
                  </div>
                  {task.due_date && (
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                      }}
                    >
                      Due: {formatDateString(task.due_date)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(status)}
                  <motion.button
                    onClick={() => {
                      buttonPress();
                      lightTap();
                      onDelete(task.id);
                    }}
                    className="modern-btn modern-btn-ghost"
                    style={{
                      padding: 'var(--space-2)',
                      minHeight: 'auto',
                      color: 'var(--color-error)',
                      fontSize: '16px',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete task"
                  >
                    🗑️
                  </motion.button>
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
