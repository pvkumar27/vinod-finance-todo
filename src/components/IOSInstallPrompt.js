import React, { useState, useEffect } from 'react';

const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    const installed = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
    setIsInstalled(installed);

    // Show prompt if iOS and not installed
    if (iOS && !installed) {
      // Show after a short delay to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isIOS || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50 animate-slide-up">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            📱
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            Install FinTask for the best experience
          </h3>
          <p className="mt-1 text-xs text-blue-700">
            Add FinTask to your home screen to enable notifications and offline access.
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <button
              onClick={() => setShowPrompt(false)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-shrink-0 ml-2 text-blue-400 hover:text-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;