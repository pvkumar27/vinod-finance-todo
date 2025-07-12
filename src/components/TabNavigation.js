import React, { useState } from 'react';
import CreditCardManager from './CreditCardManager';
import ExpensesTest from './ExpensesTest';
import ToDoTest from './ToDoTest';
import NaturalInput from './NaturalInput';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('natural');

  const tabs = [
    { id: 'natural', label: 'Natural Input', component: NaturalInput },
    { id: 'cards', label: 'Credit Cards', component: CreditCardManager },
    { id: 'expenses', label: 'Expenses', component: ExpensesTest },
    { id: 'todos', label: 'To-Dos', component: ToDoTest }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
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