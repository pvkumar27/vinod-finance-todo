import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle } from 'lucide-react';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';
import { Button } from './ui/Button';
import Checkbox from './ui/Checkbox';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskList = ({ tasks, onToggleComplete, onDelete, completed = false }) => {
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
      overdue: { text: 'Overdue', className: 'badge badge-error', icon: AlertCircle },
      today: { text: 'Today', className: 'badge badge-warning' },
      completed: { text: 'Done', className: 'badge badge-success' },
    };

    const badge = badges[status];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <span className={badge.className}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {badge.text}
      </span>
    );
  };

  const getTaskCardStyle = task => {
    const status = getTaskStatus(task);
    let borderColor = 'var(--border-light)';
    let backgroundColor = 'var(--surface)';

    if (task.completed) {
      backgroundColor = 'var(--surface-secondary)';
    } else if (status === 'overdue') {
      borderColor = 'var(--error)';
      backgroundColor = 'rgb(239 68 68 / 0.02)';
    } else if (status === 'today') {
      borderColor = 'var(--warning)';
      backgroundColor = 'rgb(245 158 11 / 0.02)';
    }

    return {
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${borderColor}`,
      background: backgroundColor,
      transition: 'all var(--transition)',
    };
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
              animate={{
                opacity: task.completed ? 0.6 : 1,
                y: 0,
                scale: status === 'overdue' && !task.completed ? [1, 1.02, 1] : 1,
              }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                layout: { duration: 0.3 },
                scale:
                  status === 'overdue' && !task.completed ? { repeat: Infinity, duration: 2 } : {},
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              }}
              style={getTaskCardStyle(task)}
            >
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
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: task.completed ? 'normal' : '500',
                      color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      marginBottom: task.due_date ? 'var(--space-1)' : 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.task}
                  </motion.div>
                  {task.due_date && (
                    <div className="body-text text-secondary">
                      Due: {formatDateString(task.due_date)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(status)}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      buttonPress();
                      onDelete(task.id);
                    }}
                    style={{
                      padding: 'var(--space-2)',
                      minHeight: 'auto',
                      color: 'var(--error)',
                    }}
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
