import React from 'react';

const TopBar = () => {
  const handleSignOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#632D1F] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <h1 className="text-xl font-bold text-[#632D1F]">FinTask</h1>
      </div>
      <button className="fin-button-primary text-xs px-4 py-2" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export default TopBar;
