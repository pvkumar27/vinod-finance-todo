import React from 'react';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';
import AppleWalletCard from './ui/AppleWalletCard';
import AppleWalletButton from './ui/AppleWalletButton';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskItem = ({ task, onToggleComplete, onTogglePin, onEdit, onDelete, onStartPomodoro }) => {
  const { taskComplete, buttonPress, success, cardFlip } = useSoundEffects();
  const isPinned = task.pinned;
  const formattedDate = task.due_date ? formatDateString(task.due_date) : null;

  // Visual indicators
  const todayStr = getTodayDateString();
  const isToday = task.due_date === todayStr;
  const isOverdue = task.due_date < todayStr;
  const isFuture = task.due_date > todayStr;

  // Apple Wallet style states
  const getTaskStyle = () => {
    if (task.completed) {
      return {
        background:
          'linear-gradient(135deg, var(--aw-secondary) 0%, var(--aw-secondary-light) 100%)',
        borderLeft: '4px solid var(--aw-secondary)',
      };
    }
    if (isPinned) {
      return {
        background: 'linear-gradient(135deg, var(--aw-accent) 0%, var(--aw-accent-light) 100%)',
        borderLeft: '4px solid var(--aw-accent)',
      };
    }
    if (isOverdue) {
      return {
        background: 'linear-gradient(135deg, var(--aw-error) 0%, #FF6B6B 100%)',
        borderLeft: '4px solid var(--aw-error)',
      };
    }
    if (isToday) {
      return {
        background: 'linear-gradient(135deg, var(--aw-primary) 0%, var(--aw-primary-light) 100%)',
        borderLeft: '4px solid var(--aw-primary)',
      };
    }
    return {
      background: 'var(--aw-surface)',
      borderLeft: '4px solid var(--aw-border)',
    };
  };

  const handleComplete = () => {
    if (!task.completed) {
      taskComplete();
    } else {
      success();
    }
    onToggleComplete(task.id, task.completed);
  };

  const handleAction = action => {
    buttonPress();
    action();
  };

  return (
    <AppleWalletCard
      className={`aw-fade-in mb-2 ${task.completed ? 'aw-scale-in' : ''}`}
      interactive
      style={getTaskStyle()}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={task.completed || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded-full border-2 transition-all"
            style={{
              borderColor: task.completed ? 'var(--aw-secondary)' : 'var(--aw-border)',
              backgroundColor: task.completed ? 'var(--aw-secondary)' : 'transparent',
            }}
            aria-label={`Mark "${task.task}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`aw-text-body font-medium ${task.completed ? 'line-through opacity-70' : ''}`}
          >
            {task.task}
          </div>
          {formattedDate && (
            <div className="aw-text-caption mt-1 flex items-center gap-2">
              <span>Due: {formattedDate}</span>
              {isOverdue && (
                <span className="aw-badge aw-badge-error">
                  {Math.floor(
                    (new Date(todayStr) - new Date(task.due_date)) / (1000 * 60 * 60 * 24)
                  )}{' '}
                  days overdue
                </span>
              )}
              {isToday && <span className="aw-badge aw-badge-primary">Today</span>}
              {isPinned && <span className="aw-badge aw-badge-warning">Pinned</span>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onStartPomodoro && !task.completed && (
            <AppleWalletButton
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onStartPomodoro(task))}
              className="w-10 h-10 p-0 min-h-0"
              title="Start Pomodoro session"
            >
              🍅
            </AppleWalletButton>
          )}
          <AppleWalletButton
            variant="ghost"
            size="sm"
            onClick={() => handleAction(() => onTogglePin(task.id, task.pinned))}
            className={`w-10 h-10 p-0 min-h-0 ${isPinned ? 'text-orange-600' : ''}`}
            title={isPinned ? 'Unpin task' : 'Pin task'}
          >
            📌
          </AppleWalletButton>
          <AppleWalletButton
            variant="ghost"
            size="sm"
            onClick={() => handleAction(() => onEdit(task))}
            className="w-10 h-10 p-0 min-h-0"
            title="Edit task"
          >
            ✏️
          </AppleWalletButton>
          <AppleWalletButton
            variant="ghost"
            size="sm"
            onClick={() => handleAction(() => onDelete(task.id))}
            className="w-10 h-10 p-0 min-h-0 text-red-500 hover:text-red-600"
            title="Delete task"
          >
            🗑️
          </AppleWalletButton>
        </div>
      </div>
    </AppleWalletCard>
  );
};

export default TaskItem;
