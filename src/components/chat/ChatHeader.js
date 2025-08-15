import React from 'react';

const ChatHeader = ({ onClose }) => {
  return (
    <div className="bg-white text-[#222222] p-4 flex items-center justify-between shadow-md border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7300FF] to-[#D100FF] flex items-center justify-center shadow-md">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#222222]">FinBot</h1>
          <p className="text-sm text-gray-600">Your Money Coach</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-600"
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
