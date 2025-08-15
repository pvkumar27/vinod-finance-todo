import React from 'react';
import CreditCardManager from './CreditCardManager';
import ToDoTest from './ToDoTest';
import InsightsTab from './InsightsTab';

const TabNavigation = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'todos':
        return (
          <div className="fin-card p-6">
            <ToDoTest />
          </div>
        );
      case 'cards':
        return (
          <div className="fin-card p-6">
            <CreditCardManager />
          </div>
        );
      case 'insights':
        return (
          <div className="fin-card p-6">
            <InsightsTab />
          </div>
        );
      default:
        return (
          <div className="fin-card p-6">
            <ToDoTest />
          </div>
        );
    }
  };

  return <div className="w-full">{renderContent()}</div>;
};

export default TabNavigation;
