import React, { useState } from 'react';
import CreditCardManager from './CreditCardManager';
import ExpensesTest from './ExpensesTest';
import ToDoTest from './ToDoTest';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('todos');

  const tabs = [
    { 
      id: 'todos', 
      label: 'To-Dos', 
      icon: '✅',
      shortLabel: 'To-Dos',
      component: ToDoTest 
    },
    { 
      id: 'expenses', 
      label: 'Finances', 
      icon: '💰',
      shortLabel: 'Finances',
      component: ExpensesTest 
    },
    { 
      id: 'cards', 
      label: 'Credit Cards', 
      icon: '💳',
      shortLabel: 'Cards',
      component: CreditCardManager 
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Headers - Now more prominent */}
      <div className="overflow-x-auto mb-2">
        <nav className="flex flex-nowrap min-w-full bg-gray-50 rounded-lg p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center space-x-2 py-4 px-4 sm:px-8 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-lg flex-1 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden sm:inline font-medium">{tab.label}</span>
              <span className="sm:hidden text-xs font-medium">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default TabNavigation;