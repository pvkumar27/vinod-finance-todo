import React from 'react';

const ChatInputBar = ({
  inputValue,
  setInputValue,
  onSubmit,
  onVoiceInput,
  isLoading,
  isListening,
  onKeyDown,
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-t from-[#FCE7E2] to-[#FDF3EE] border-t border-[#EAD2C6] p-4 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message FinBot..."
              className="w-full bg-white border border-[#F4D9CE] rounded-lg px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] focus:bg-white transition-all duration-200 pr-16 text-[#331B18] placeholder-[#A78A7F] antialiased shadow-sm"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={onVoiceInput}
              disabled={isLoading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg scale-110 animate-pulse'
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              }`}
              title="Voice input"
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isListening}
            className="w-12 h-12 bg-[#5C2E27] text-white rounded-full hover:bg-[#4A241F] disabled:opacity-50 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInputBar;
