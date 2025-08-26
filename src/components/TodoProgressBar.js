import React from 'react';

const TodoProgressBar = ({ todos }) => {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getProgressColor = rate => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressMessage = rate => {
    if (rate === 100) return 'All done! 🎉';
    if (rate >= 80) return 'Almost there! 💪';
    if (rate >= 60) return 'Great progress! 🚀';
    if (rate >= 40) return 'Keep going! 📈';
    if (rate > 0) return 'Getting started! 🌱';
    return 'Ready to begin! ✨';
  };

  return (
    <div className="finbot-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Today's Progress</h3>
        <span className="text-sm text-gray-600">
          {completedTasks}/{totalTasks} tasks
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(completionRate)}`}
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Progress Message */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{getProgressMessage(completionRate)}</span>
        <span className="text-xs font-medium text-gray-700">{Math.round(completionRate)}%</span>
      </div>
    </div>
  );
};

export default TodoProgressBar;
