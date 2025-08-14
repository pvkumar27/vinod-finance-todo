import React, { useState } from 'react';
import CreditCardManager from './CreditCardManager';
import ToDoTest from './ToDoTest';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('todos');

  const tabs = [
    {
      id: 'todos',
      label: 'To-Dos',
      icon: '✅',
      shortLabel: 'To-Dos',
      component: ToDoTest,
    },
    {
      id: 'cards',
      label: 'Credit Cards',
      icon: '💳',
      shortLabel: 'Cards',
      component: CreditCardManager,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Cleo-style Tab Navigation */}
      <div className="w-full mb-6">
        <nav className="cleo-card p-2 flex space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-cy={`nav-${tab.id}-tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                cleo-tab flex-1 flex items-center justify-center space-x-2 py-4 px-6
                font-medium text-sm transition-all duration-300 ease-in-out
                ${activeTab === tab.id ? 'active' : ''}
              `}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="hidden sm:inline font-semibold">{tab.label}</span>
              <span className="sm:hidden text-xs font-semibold">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="cleo-card p-6">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
};

export default TabNavigation;
