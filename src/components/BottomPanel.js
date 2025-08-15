import React, { useState, useEffect } from 'react';

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
    <div className="fixed bottom-20 left-0 right-0 fin-gradient-bg border-t border-gray-200 px-4 py-3 z-40">
      <div className="max-w-screen-sm mx-auto">
        {/* Input field */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything"
              className="fin-input pr-12"
              onKeyDown={handleKeyDown}
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
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="fin-button-primary px-4 py-2 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default BottomPanel;
