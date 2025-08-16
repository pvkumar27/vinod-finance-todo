import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';

const TaskItem = ({ task, onToggleComplete, onTogglePin, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
    // Reduce activation delay to make dragging more responsive
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
  };

  const isPinned = task.pinned;
  const formattedDate = task.due_date ? formatDateString(task.due_date) : null;

  // Visual indicators similar to email
  const todayStr = getTodayDateString();
  const isToday = task.due_date === todayStr;
  const isOverdue = task.due_date < todayStr;
  const isFuture = task.due_date > todayStr;

  // Calculate visual styling
  let bgColor, borderColor;

  if (isPinned) {
    bgColor = 'bg-yellow-50';
    borderColor = 'border-l-2 border-yellow-400';
  } else if (isToday) {
    bgColor = 'bg-green-50';
    borderColor = 'border-l-4 border-green-500';
  } else if (isOverdue) {
    const daysOverdue = Math.floor(
      (new Date(todayStr) - new Date(task.due_date)) / (1000 * 60 * 60 * 24)
    );
    if (daysOverdue > 14) {
      bgColor = 'bg-red-100';
      borderColor = 'border-l-4 border-red-600';
    } else if (daysOverdue > 7) {
      bgColor = 'bg-red-75';
      borderColor = 'border-l-4 border-red-500';
    } else {
      bgColor = 'bg-red-50';
      borderColor = 'border-l-4 border-red-400';
    }
  } else if (isFuture) {
    bgColor = 'bg-blue-50';
    borderColor = 'border-l-4 border-blue-400';
  } else {
    bgColor = 'bg-gray-50';
    borderColor = 'border-l-2 border-gray-300';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center py-1 px-1 sm:p-2 mb-1 rounded-lg transition-all duration-200 min-h-[2.25rem]
        cursor-grab active:cursor-grabbing w-full
        ${isDragging ? `shadow-lg scale-[1.03] opacity-90 ${bgColor} border border-gray-300 z-50` : 'shadow-sm hover:shadow'}
        ${bgColor} ${borderColor}
      `}
      {...attributes}
    >
      {/* Checkbox */}
      <div className="mr-1 sm:mr-3">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task.id, task.completed)}
          className="w-3 h-3 text-blue-500 border border-gray-300 rounded-full sm:w-4 sm:h-4"
          aria-label={`Mark "${task.task}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {/* Task Content - Apply drag listeners only to this part */}
      <div
        className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center pl-1 pr-0.5"
        {...listeners}
      >
        <span className="max-w-full text-sm font-medium text-left text-gray-900 truncate">
          {task.task}
        </span>
        {formattedDate && (
          <span className="text-[10px] sm:text-xs text-gray-500 sm:ml-2 whitespace-nowrap mt-0.5 sm:mt-0 flex items-center text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-0.5 inline-block sm:hidden"></span>
            Due: {formattedDate}
            {isOverdue && (
              <span className="ml-1 text-red-600 font-medium">
                (
                {Math.floor((new Date(todayStr) - new Date(task.due_date)) / (1000 * 60 * 60 * 24))}{' '}
                days overdue)
              </span>
            )}
          </span>
        )}
      </div>

      {/* Actions - Smaller buttons for iPhone 16 Pro Max */}
      <div className="flex flex-row items-center flex-shrink-0 ml-auto mr-0 space-x-1">
        <button
          type="button"
          onClick={() => onTogglePin(task.id, task.pinned)}
          className={`w-8 h-8 flex items-center justify-center transition-colors touch-manipulation ${
            isPinned ? 'text-yellow-600' : 'text-gray-400'
          }`}
          title={isPinned ? 'Unpin task' : 'Pin task'}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <span className="text-sm">📌</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="w-8 h-8 flex items-center justify-center text-gray-400 touch-manipulation"
          aria-label={`Edit task: ${task.task}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="w-8 h-8 flex items-center justify-center text-gray-400 touch-manipulation"
          aria-label={`Delete task: ${task.task}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Visual indicator for drag state */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 rounded-lg pointer-events-none bg-opacity-10"></div>
      )}
    </div>
  );
};

export default TaskItem;
