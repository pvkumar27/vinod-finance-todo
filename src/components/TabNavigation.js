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
      {/* Modern Tab Navigation */}
      <div className="w-full overflow-x-auto">
        <nav className="flex w-full rounded-xl p-2 card-fancy">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center justify-center space-x-2 py-3 px-4 
                font-medium text-sm font-['Segoe UI',system-ui,sans-serif]
                transition-all duration-300 ease-in-out
                rounded-lg flex-1 min-w-[100px]
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 shadow-sm transform scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-800'}
              `}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default TabNavigation;