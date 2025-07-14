import React, { useState } from 'react';
import CreditCardManager from './CreditCardManager';
import ExpensesTest from './ExpensesTest';
import ToDoTest from './ToDoTest';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('cards');

  const tabs = [
    { 
      id: 'cards', 
      label: 'Credit Cards', 
      icon: '💳',
      component: CreditCardManager 
    },
    { 
      id: 'expenses', 
      label: 'My Finances', 
      icon: '💰',
      component: ExpensesTest 
    },
    { 
      id: 'todos', 
      label: 'To-Dos', 
      icon: '✅',
      component: ToDoTest 
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-gray-100">
        <nav className="flex flex-wrap sm:flex-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-4 sm:px-6 border-b-3 font-medium text-sm transition-all duration-200 flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
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