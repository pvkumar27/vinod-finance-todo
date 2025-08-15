import React from 'react';

const BottomPanel = ({ inputValue, setInputValue, onSubmit, onVoiceInput, isLoading }) => {
  return (
    <div className="fixed bottom-20 left-0 right-0 fin-gradient-bg border-t border-gray-200 px-4 py-3 z-40">
      <div className="max-w-screen-sm mx-auto">
        {/* Input field */}
        <form onSubmit={onSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything"
              className="fin-input pr-12"
              disabled={isLoading}
              aria-label="Ask FinBot anything"
            />
            <button
              type="button"
              onClick={onVoiceInput}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
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
