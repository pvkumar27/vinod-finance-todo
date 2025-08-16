import React from 'react';
import CreditCardManager from './CreditCardManager';
import ToDoTest from './ToDoTest';
import InsightsTab from './InsightsTab';

const TabNavigation = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'todos':
        return (
          <div className="finbot-card p-6" style={{ height: 'calc(100vh - 220px)' }}>
            <div
              className="finbot-inner p-6 overflow-y-auto"
              style={{ height: 'calc(100vh - 280px)' }}
            >
              <ToDoTest />
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className="finbot-card p-6">
            <div className="finbot-inner p-6">
              <CreditCardManager />
            </div>
          </div>
        );
      case 'insights':
        return (
          <div className="finbot-card p-6">
            <div className="finbot-inner p-6">
              <InsightsTab />
            </div>
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
