import React, { useState } from 'react';

const SmartQuickActions = ({ onAddTask, onAddExpense, recentPatterns }) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      id: 'add-task',
      label: 'Add Task',
      icon: '✅',
      action: () => onAddTask(),
      color: 'bg-blue-500',
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: '💸',
      action: () => onAddExpense(),
      color: 'bg-red-500',
    },
    {
      id: 'add-income',
      label: 'Add Income',
      icon: '💰',
      action: () => onAddExpense('income'),
      color: 'bg-green-500',
    },
  ];

  // Add smart suggestions based on patterns
  if (recentPatterns?.frequentTask) {
    quickActions.unshift({
      id: 'frequent-task',
      label: `Add "${recentPatterns.frequentTask}"`,
      icon: '🔄',
      action: () => onAddTask(recentPatterns.frequentTask),
      color: 'bg-purple-500',
    });
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Quick Action Items */}
      {isOpen && (
        <div className="mb-4 space-y-2">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className={`${action.color} text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-all duration-200 flex items-center space-x-2 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-all duration-300 ${
          isOpen ? 'bg-gray-500 rotate-45' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isOpen ? '×' : '+'}
      </button>
    </div>
  );
};

export default SmartQuickActions;
