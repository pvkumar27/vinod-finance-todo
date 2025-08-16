import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#5C2E27] flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div className="bg-white border border-[#EAD2C6] text-[#331B18] px-4 py-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#A15B49] rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#A15B49] rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-[#A15B49] rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
