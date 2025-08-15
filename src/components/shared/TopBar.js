import React from 'react';

const TopBar = () => {
  const handleSignOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src="/icons/official-logo.png" alt="FinTask Logo" className="w-8 h-8 rounded-lg" />
        <h1 className="text-xl font-bold text-[#632D1F]">FinTask</h1>
      </div>
      <button className="fin-button-primary text-xs px-4 py-2" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export default TopBar;
