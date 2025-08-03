import React, { useState } from 'react';
import CreditCardUpload from './CreditCardUpload';

const CreditCardManager = () => {
  const [activeView, setActiveView] = useState('upload');

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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
      </div>

      {/* Content */}
      {activeView === 'upload' ? (
        <CreditCardUpload />
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-xl font-medium mb-2">Card management coming soon</p>
            <p className="text-sm">Upload cards first to see them here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardManager;
