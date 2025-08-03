import React, { useState } from 'react';
import CreditCardUpload from './CreditCardUpload';
import CreditCardList from './CreditCardList';

const CreditCardManager = () => {
  const [activeView, setActiveView] = useState('manage');

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveView('manage')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'manage'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          💳 Manage Cards
        </button>
        <button
          onClick={() => setActiveView('upload')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📤 Upload Cards
        </button>
      </div>

      {/* Content */}
      {activeView === 'manage' ? <CreditCardList /> : <CreditCardUpload />}
    </div>
  );
};

export default CreditCardManager;
