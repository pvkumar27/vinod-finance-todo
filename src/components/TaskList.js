import React from 'react';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';

const TaskList = ({ tasks, onToggleComplete, onDelete }) => {
  const todayStr = getTodayDateString();

  const getTaskStatus = task => {
    if (task.completed) return 'completed';
    if (!task.due_date) return 'normal';
    if (task.due_date < todayStr) return 'overdue';
    if (task.due_date === todayStr) return 'today';
    return 'normal';
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'overdue':
        return <span className="modern-badge modern-badge-error">Overdue</span>;
      case 'today':
        return <span className="modern-badge modern-badge-warning">Today</span>;
      case 'completed':
        return <span className="modern-badge modern-badge-success">Done</span>;
      default:
        return null;
    }
  };

  return (
    <div className="modern-flex-col">
      {tasks.map(task => {
        const status = getTaskStatus(task);
        return (
          <div
            key={task.id}
            className="modern-flex"
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)',
              background: task.completed ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
            }}
          >
            <input
              type="checkbox"
              checked={task.completed || false}
              onChange={() => onToggleComplete(task.id, task.completed)}
              style={{ marginRight: 'var(--space-3)' }}
            />

            <div style={{ flex: 1 }}>
              <div
                className={task.completed ? 'modern-text' : 'modern-text'}
                style={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  fontWeight: task.completed ? 'normal' : '500',
                }}
              >
                {task.task}
              </div>
              {task.due_date && (
                <div className="modern-text-sm" style={{ marginTop: 'var(--space-1)' }}>
                  Due: {formatDateString(task.due_date)}
                </div>
              )}
            </div>

            <div className="modern-flex">
              {getStatusBadge(status)}
              <button
                onClick={() => onDelete(task.id)}
                className="modern-btn modern-btn-ghost"
                style={{ padding: 'var(--space-2)', color: 'var(--error)' }}
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
