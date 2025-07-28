import React, { useState, useEffect } from 'react';

const IOSNotificationWorkaround = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  const enableIOSReminders = () => {
    // Store reminder preference
    localStorage.setItem('ios_reminders_enabled', 'true');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
    
    // Show iOS calendar/reminder instructions
    alert('iOS Reminder Setup:\n\n1. Open iPhone Calendar app\n2. Create new event: "FinTask Daily Check"\n3. Set time: 8:00 AM daily\n4. Set alert: At time of event\n\nThis will remind you to check FinTask daily!');
  };

  if (!isIOS) return null;

  return (
    <div className="mt-2">
      <button
        onClick={enableIOSReminders}
        className="px-4 py-2 text-sm rounded-lg border bg-orange-100 text-orange-800 border-orange-300 flex items-center space-x-2 transition-all shadow-sm hover:shadow"
      >
        <span>📅</span>
        <span>Set iOS Calendar Reminder</span>
      </button>
      
      {showAlert && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          ✅ iOS reminder instructions shown!
        </div>
      )}
    </div>
  );
};

export default IOSNotificationWorkaround;