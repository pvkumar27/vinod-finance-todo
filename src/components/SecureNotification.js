import React, { useState, useEffect } from 'react';

const SecureNotification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handlePermissionNotification = event => {
      const { title, message } = event.detail;
      setNotification({ title, message });
    };

    window.addEventListener('showPermissionNotification', handlePermissionNotification);

    return () => {
      window.removeEventListener('showPermissionNotification', handlePermissionNotification);
    };
  }, []);

  const handleClose = () => {
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 mb-6">{notification.message}</p>
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecureNotification;
