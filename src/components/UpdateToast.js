import React, { useState, useEffect } from 'react';

const UpdateToast = ({ show, onUpdate, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleUpdate = () => {
    setVisible(false);
    onUpdate();
  };

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm w-full flex items-center space-x-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            🔄 New version available
          </p>
          <p className="text-xs text-gray-500">
            Tap to refresh and get the latest features
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateToast;