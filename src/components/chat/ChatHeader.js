import React from 'react';

const ChatHeader = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-[#7300FF] to-[#D100FF] text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-lg border-2 border-white/30">
          <span className="text-3xl">🤖</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">FinBot</h1>
          <p className="text-sm opacity-90">Your Money Coach</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
