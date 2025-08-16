import React from 'react';
import CreditCardManager from './CreditCardManager';
import ToDoTest from './ToDoTest';
import InsightsTab from './InsightsTab';

const TabNavigation = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'todos':
        return (
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
            <ToDoTest />
          </div>
        );
      case 'cards':
        return (
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
            <CreditCardManager />
          </div>
        );
      case 'insights':
        return (
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
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

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 180px)' }}>
      {renderContent()}
    </div>
  );
};

export default TabNavigation;
