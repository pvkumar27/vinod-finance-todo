import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateString, getTodayDateString } from '../utils/dateUtils';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskList = ({ tasks, onToggleComplete, onTogglePin, onEdit, onDelete, onStartPomodoro }) => {
  const { buttonPress } = useSoundEffects();
  const todayStr = getTodayDateString();

  // Sort tasks by pinned status, then by due date (oldest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    return new Date(a.created_at || a.id) - new Date(b.created_at || b.id);
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-gray-500 text-sm">No tasks here. Great job!</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <AnimatePresence>
        {sortedTasks.map((task, index) => {
          const isPinned = task.pinned;
          const formattedDate = task.due_date ? formatDateString(task.due_date) : null;
          const isToday = task.due_date === todayStr;
          const isOverdue = task.due_date < todayStr;
          const isFuture = task.due_date > todayStr;

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
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className={`group flex items-center py-1 px-1 sm:p-2 mb-1 rounded-lg transition-all duration-200 min-h-[2.25rem] w-full shadow-sm hover:shadow ${bgColor} ${borderColor}`}
            >
              <div className="mr-1 sm:mr-3">
                <input
                  type="checkbox"
                  checked={task.completed || false}
                  onChange={() => {
                    buttonPress();
                    onToggleComplete(task.id, task.completed);
                  }}
                  className="w-3 h-3 text-blue-500 border border-gray-300 rounded-full sm:w-4 sm:h-4"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center pl-1 pr-0.5">
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
                        {Math.floor(
                          (new Date(todayStr) - new Date(task.due_date)) / (1000 * 60 * 60 * 24)
                        )}{' '}
                        days overdue)
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex flex-row items-center flex-shrink-0 ml-auto mr-0 space-x-0.5 sm:space-x-1">
                {onStartPomodoro && !task.completed && (
                  <button
                    type="button"
                    onClick={() => {
                      buttonPress();
                      onStartPomodoro(task);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                    title="Start Pomodoro session"
                  >
                    <span className="text-xs sm:text-sm">🍅</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    buttonPress();
                    onTogglePin(task.id, task.pinned);
                  }}
                  className={`w-8 h-8 flex items-center justify-center transition-colors ${isPinned ? 'text-yellow-600' : 'text-gray-400'}`}
                  title={isPinned ? 'Unpin task' : 'Pin task'}
                >
                  <span className="text-sm">📌</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    buttonPress();
                    onEdit(task);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  onClick={() => {
                    buttonPress();
                    onDelete(task.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
