import React from 'react';

const BottomPanel = ({ inputValue, setInputValue, onSubmit, onVoiceInput, isLoading }) => {
  return (
    <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-[#FCE7E2] to-[#FDF3EE] border-t border-[#EAD2C6] px-4 py-3 z-40">
      <div className="max-w-screen-sm mx-auto">
        {/* Input field */}
        <form onSubmit={onSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything"
              className="w-full bg-white border border-[#F4D9CE] rounded-full px-6 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] transition-all duration-200 pr-12 text-[#331B18] placeholder-[#A78A7F] shadow-sm"
              disabled={isLoading}
              aria-label="Ask FinBot anything"
            />
            <button
              type="button"
              onClick={onVoiceInput}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#F4D9CE]"
              title="Voice input"
              aria-label="Voice input"
            >
              <span className="text-lg">🎤</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BottomPanel;
