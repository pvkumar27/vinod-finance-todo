import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskItem = ({ task, onToggleComplete, onTogglePin, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
    // Reduce activation delay to make dragging more responsive
    activationConstraint: {
      delay: 100,
      tolerance: 5
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
  };

  const isPinned = task.pinned;
  const formattedDate = task.due_date 
    ? new Date(task.due_date).toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center p-3 mb-2 rounded-lg transition-all duration-200 min-h-[3rem]
        cursor-grab active:cursor-grabbing w-full
        ${isDragging ? `shadow-lg scale-[1.03] opacity-90 ${isPinned ? 'bg-yellow-100 border border-yellow-300' : 'bg-blue-100 border border-blue-300'} z-50` : 'shadow-sm hover:shadow'}
        ${isPinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50'}
      `}
      {...attributes}
    >
      {/* Checkbox */}
      <div className="mr-3">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task.id, task.completed)}
          className="w-4 h-4 rounded-full border-2 border-gray-300 text-blue-500"
          aria-label={`Mark "${task.task}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {/* Task Content - Apply drag listeners only to this part */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center" {...listeners}>
        <span className="text-sm text-gray-900 font-medium truncate">
          {task.task}
        </span>
        {formattedDate && (
          <span className="text-xs text-gray-500 sm:ml-2 whitespace-nowrap mt-0.5 sm:mt-0 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-1 inline-block sm:hidden"></span>
            Due: {formattedDate}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1 opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onTogglePin(task.id, task.pinned)}
          className={`p-1.5 rounded-full transition-colors ${
            isPinned 
              ? 'text-yellow-600 hover:bg-yellow-100' 
              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
          }`}
          title={isPinned ? "Unpin task" : "Pin task"}
        >
          <span className="text-sm">📌</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          aria-label={`Edit task: ${task.task}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          aria-label={`Delete task: ${task.task}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Visual indicator for drag state */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none"></div>
      )}
    </div>
  );
};

export default TaskItem;