import React, { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';

const TaskPomodoroIntegration = ({ task, onTaskComplete, onClose }) => {
  const [showTimer, setShowTimer] = useState(false);
  const [pomodoroStats, setPomodoroStats] = useState({
    totalPomodoros: 0,
    completedToday: 0,
  });

  const handleStartPomodoro = () => {
    setShowTimer(true);
  };

  const handlePomodoroComplete = (completedTask, pomodoroCount, isEarlyCompletion = false) => {
    setPomodoroStats(prev => ({
      ...prev,
      totalPomodoros: prev.totalPomodoros + 1,
      completedToday: pomodoroCount,
    }));

    // Show completion notification
    if (window.Notification && Notification.permission === 'granted') {
      const message = isEarlyCompletion
        ? `Task completed early! Great efficiency 🚀`
        : `Great focus session on: ${completedTask.task}`;

      new Notification(isEarlyCompletion ? 'Task Done Early! ✅' : 'Pomodoro Complete! 🍅', {
        body: message,
        icon: '/icons/official-logo.png',
      });
    }

    // Handle early completion
    if (isEarlyCompletion && onTaskComplete) {
      onTaskComplete(completedTask.id);
      setShowTimer(false);
      return;
    }

    // Auto-complete task after 4 pomodoros (optional)
    if (pomodoroCount >= 4 && onTaskComplete) {
      const shouldComplete = window.confirm(
        `You've completed 4 pomodoros on "${completedTask.task}"! Mark as complete?`
      );
      if (shouldComplete) {
        onTaskComplete(completedTask.id);
        setShowTimer(false);
      }
    }
  };

  const handleCancelTimer = () => {
    setShowTimer(false);
  };

  if (showTimer) {
    return (
      <PomodoroTimer
        selectedTask={task}
        onComplete={handlePomodoroComplete}
        onCancel={handleCancelTimer}
      />
    );
  }

  return (
    <div className="finbot-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="finbot-heading-md flex items-center">
          <span className="mr-2">🍅</span>
          Pomodoro Focus
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {/* Task Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-800 mb-2">{task.task}</p>
        {task.due_date && (
          <p className="text-sm text-gray-600">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Pomodoro Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{pomodoroStats.completedToday}</div>
          <div className="text-xs text-red-500">Today</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{pomodoroStats.totalPomodoros}</div>
          <div className="text-xs text-blue-500">Total</div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartPomodoro}
        className="finbot-button-primary w-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
      >
        <span className="mr-2">🍅</span>
        Start 25-min Focus Session
      </button>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🍅 25 min work → ☕ 5 min break → 🍅 25 min work</p>
        <p>Every 4th break is 15 minutes long</p>
      </div>
    </div>
  );
};

export default TaskPomodoroIntegration;
