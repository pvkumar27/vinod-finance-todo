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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message FinBot..."
              className="w-full bg-gray-100 border-0 rounded-full px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 pr-16"
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
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-full hover:shadow-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
