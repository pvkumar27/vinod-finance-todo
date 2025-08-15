import React from 'react';

const ChatHeader = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <div className="fin-gradient-bg text-[#632D1F] p-4 flex items-center justify-between shadow-sm border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-[#632D1F] flex items-center justify-center shadow-sm">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#632D1F] tracking-tight antialiased">
            FinBot
          </h1>
          <p className="text-sm text-gray-600 font-medium antialiased">Your Money Coach</p>
        </div>
      </div>
      <button
        onClick={onToggleCollapse}
        className="w-8 h-8 rounded-full bg-white/50 hover:bg-gray-100 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#632D1F] text-[#632D1F]"
        aria-label={isCollapsed ? 'Expand chat' : 'Collapse chat'}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
