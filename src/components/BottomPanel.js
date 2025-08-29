import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppleWalletButton from './ui/AppleWalletButton';

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
    <div className="aw-nav px-4 py-4">
      <div className="max-w-screen-sm mx-auto">
        {/* Input field */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="aw-input pr-12"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Ask FinBot anything"
            />
            <AppleWalletButton
              variant="ghost"
              size="sm"
              onClick={onVoiceInput}
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 min-h-0"
              title="Voice input"
              soundEnabled={false}
            >
              🎤
            </AppleWalletButton>
          </div>
          <AppleWalletButton
            type="submit"
            variant="primary"
            disabled={isLoading || !inputValue.trim()}
            loading={isLoading}
            icon={isLoading ? '⏳' : '🚀'}
            title="Send message"
          >
            <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
          </AppleWalletButton>
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
