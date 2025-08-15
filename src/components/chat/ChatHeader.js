import React from 'react';

const ChatHeader = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-b from-[#FDF3EE] to-[#FCE7E2] text-[#331B18] p-4 flex items-center justify-between shadow-sm border-b border-[#EAD2C6]">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-[#5C2E27] flex items-center justify-center shadow-sm">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#331B18] tracking-tight antialiased">
            FinBot
          </h1>
          <p className="text-sm text-[#6F3D32] font-medium antialiased">Your Money Coach</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-white hover:bg-[#F4D9CE] flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] text-[#6F3D32]"
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
