import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const BottomPanel = ({ inputValue, setInputValue, onSubmit, onVoiceInput, isLoading }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const saved = localStorage.getItem('finbot_command_history');
    if (saved) {
      setCommandHistory(JSON.parse(saved));
    }
  }, []);

  const handleKeyDown = e => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newHistory = [
        ...commandHistory.filter(cmd => cmd !== inputValue.trim()),
        inputValue.trim(),
      ];
      if (newHistory.length > 50) newHistory.shift();
      setCommandHistory(newHistory);
      localStorage.setItem('finbot_command_history', JSON.stringify(newHistory));
      setHistoryIndex(-1);
    }
    onSubmit(e);
  };
  return (
    <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-4 shadow-2xl">
      <div className="max-w-screen-sm mx-auto">
        {/* Input field */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Ask FinBot anything"
            />
            <button
              type="button"
              onClick={onVoiceInput}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
              title="Voice input"
              aria-label="Voice input"
            >
              <span className="text-lg">🎤</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <span className="text-sm">{isLoading ? '⏳' : '🚀'}</span>
            <span className="hidden sm:inline text-sm font-medium">
              {isLoading ? 'Sending...' : 'Send'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

BottomPanel.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onVoiceInput: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default BottomPanel;
