import React, { useState, useRef, useEffect } from 'react';
import { mcpClient } from '../services/mcpClient';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content:
        "Hi! I'm Finbot, your FinTask assistant. I can help you with your todos and credit cards!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(false);
    setIsMinimized(false);
  };

  const handleMinimize = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQueryHistory(prev => [inputValue, ...prev.slice(0, 49)]); // Keep last 50 queries
    setHistoryIndex(-1);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await mcpClient.processNaturalLanguageQuery(inputValue);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: formatResponse(response),
        timestamp: new Date(),
        data: response,
        processingMode: response.processingMode || 'fallback',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Trigger refresh if todo or credit card was modified successfully
      if (
        response.success &&
        (response.todo || response.credit_card || response.deletedCount || response.updatedCount)
      ) {
        window.dispatchEvent(new CustomEvent('todoAdded', { detail: response.todo || {} }));
        if (response.credit_card || response.deletedCount) {
          const eventDetail = response.deletedCard
            ? { deleted: true, cardId: response.deletedCard.id }
            : response.credit_card || {};
          window.dispatchEvent(new CustomEvent('creditCardAdded', { detail: eventDetail }));
        }
      }

      // Handle UI actions
      if (response.ui_action === 'switch_view') {
        window.dispatchEvent(
          new CustomEvent('switchView', {
            detail: { viewMode: response.view_mode, source: 'ai' },
          })
        );
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Restore focus to input field
      setTimeout(() => {
        const input = document.querySelector('[data-cy="ai-assistant-input"]');
        if (input) input.focus();
      }, 100);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '❌ Voice recognition not supported in this browser',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      const listeningMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '🎤 Listening... Speak your command',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, listeningMessage]);
    };

    recognition.onresult = async event => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);

      // Auto-submit the voice command
      try {
        const response = await mcpClient.processNaturalLanguageQuery(transcript);

        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: formatResponse(response),
          timestamp: new Date(),
          data: response,
          processingMode: response.processingMode || 'fallback',
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Trigger refresh if todo or credit card was modified successfully
        if (
          response.success &&
          (response.todo || response.credit_card || response.deletedCount || response.updatedCount)
        ) {
          window.dispatchEvent(new CustomEvent('todoAdded', { detail: response.todo || {} }));
          if (response.credit_card || response.deletedCount) {
            const eventDetail = response.deletedCard
              ? { deleted: true, cardId: response.deletedCard.id }
              : response.credit_card || {};
            window.dispatchEvent(new CustomEvent('creditCardAdded', { detail: eventDetail }));
          }
        }

        // Handle UI actions
        if (response.ui_action === 'switch_view') {
          window.dispatchEvent(
            new CustomEvent('switchView', {
              detail: { viewMode: response.view_mode, source: 'ai' },
            })
          );
        }
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date(),
          isError: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      }

      setInputValue('');
    };

    recognition.onerror = event => {
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `❌ Voice recognition error: ${event.error}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const formatResponse = response => {
    if (response.todos) {
      return `Found ${response.count} todos:\n${response.todos
        .map(
          todo =>
            `• ${todo.task} ${todo.completed ? '✅' : '⏳'} ${todo.priority ? `(${todo.priority})` : ''}`
        )
        .join('\n')}`;
    }

    if (response.credit_cards) {
      return `Found ${response.count} credit cards:\n${response.credit_cards
        .map(card => {
          const cardName =
            card.bank_name && card.last_four_digits
              ? `${card.bank_name} ${card.last_four_digits}`
              : card.card_name || 'Card';
          const cardType = card.card_type || 'free';
          const lastUsed = card.last_used_date
            ? `(Last used: ${new Date(card.last_used_date).toLocaleDateString()})`
            : '(Never used)';
          return `• ${cardName} - ${cardType} ${lastUsed}`;
        })
        .join('\n')}`;
    }

    if (response.transactions) {
      const total = response.total_amount || 0;
      return `Found ${response.count} transactions (Total: $${total.toFixed(2)}):\n${response.transactions
        .map(t => `• ${t.description} - $${t.amount} (${t.date})`)
        .join('\n')}`;
    }

    if (response.insights) {
      return `Financial Insights:\n${response.insights.map(insight => `• ${insight}`).join('\n')}${
        response.recommendations
          ? `\n\nRecommendations:\n${response.recommendations.map(rec => `• ${rec}`).join('\n')}`
          : ''
      }`;
    }

    if (response.success && response.todo) {
      return `✅ ${response.message}\nTask: ${response.todo.task}`;
    }

    if (response.success && (response.deletedCount || response.updatedCount)) {
      return `✅ ${response.message}`;
    }

    if (response.success && response.credit_card) {
      return `✅ ${response.message}\nCard: ${response.credit_card.card_name}`;
    }

    if (
      response.ui_action ||
      response.ui_guidance ||
      (response.success === false && response.message && !response.message.includes('Error'))
    ) {
      return `✅ ${response.message}`;
    }

    return response.summary || JSON.stringify(response, null, 2);
  };

  const quickActions = [
    { label: 'Show pending todos', query: 'show me pending todos' },
    { label: 'Show completed todos', query: 'show me completed todos' },
    { label: 'Show credit cards', query: 'show me my credit cards' },
    { label: 'Inactive cards', query: 'which cards are inactive?' },
  ];

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group relative overflow-hidden"
          data-cy="ai-assistant-toggle"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto w-auto sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-96 md:h-[500px]'
      }`}
      data-cy="ai-assistant-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide">FinBot</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-xs text-blue-100/90 font-medium">AI Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative z-20">
          <button
            onClick={handleMinimize}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            data-cy="ai-assistant-minimize"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMinimized ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
              />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            data-cy="ai-assistant-close"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/80">
          {messages.map(message => (
            <div key={message.id} className="flex justify-start animate-fadeIn">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1 ${
                  message.type === 'assistant'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gray-400'
                }`}
              >
                <span className="text-white text-xs">
                  {message.type === 'assistant' ? '🤖' : '👤'}
                </span>
              </div>
              <div
                className={`max-w-[80%] px-5 py-4 whitespace-pre-line shadow-lg backdrop-blur-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl rounded-bl-lg shadow-blue-200/50 text-sm font-medium'
                    : message.isError
                      ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200/50 rounded-3xl rounded-bl-lg shadow-red-200/30 text-sm'
                      : message.processingMode === 'gemini'
                        ? 'bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 text-gray-800 border border-purple-200/50 rounded-3xl rounded-bl-lg italic shadow-purple-200/40 text-sm'
                        : 'bg-white/90 text-gray-800 border border-gray-200/50 rounded-3xl rounded-bl-lg shadow-gray-200/40 text-sm'
                }`}
              >
                {message.content}
                <div
                  className={`text-xs mt-1 opacity-60 flex justify-between items-center ${
                    message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {message.type === 'assistant' && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        message.processingMode === 'gemini'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {message.processingMode === 'gemini' ? '🤖 AI' : '🔧 Rule'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-white text-xs">🤖</span>
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md text-sm shadow-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600">Finbot is typing</span>
                  <div className="flex space-x-1 ml-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      style={{ animationDelay: '0.2s', animation: 'bounce 1s infinite 0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick Actions */}
      {!isMinimized && showQuickActions && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 animate-fadeIn">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={async () => {
                  setShowQuickActions(false);
                  setIsLoading(true);

                  const userMessage = {
                    id: Date.now(),
                    type: 'user',
                    content: action.query,
                    timestamp: new Date(),
                  };

                  setMessages(prev => [...prev, userMessage]);

                  try {
                    const response = await mcpClient.processNaturalLanguageQuery(action.query);

                    const assistantMessage = {
                      id: Date.now() + 1,
                      type: 'assistant',
                      content: formatResponse(response),
                      timestamp: new Date(),
                      data: response,
                    };

                    setMessages(prev => [...prev, assistantMessage]);

                    if (response.success && response.todo) {
                      window.dispatchEvent(new CustomEvent('todoAdded', { detail: response.todo }));
                    }
                  } catch (error) {
                    const errorMessage = {
                      id: Date.now() + 1,
                      type: 'assistant',
                      content: `Sorry, I encountered an error: ${error.message}`,
                      timestamp: new Date(),
                      isError: true,
                    };

                    setMessages(prev => [...prev, errorMessage]);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-xs bg-white text-blue-700 px-2.5 py-1.5 rounded-full border border-blue-200 hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm"
                data-cy={`quick-action-${index}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {!isMinimized && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white/80 backdrop-blur-sm border-t border-white/20"
        >
          <div className="flex items-end space-x-2">
            <button
              type="button"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                showQuickActions
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title="Quick actions"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showQuickActions ? 'rotate-45' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  setHistoryIndex(-1);
                }}
                onKeyDown={e => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (queryHistory.length > 0) {
                      const newIndex = Math.min(historyIndex + 1, queryHistory.length - 1);
                      setHistoryIndex(newIndex);
                      setInputValue(queryHistory[newIndex]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIndex > 0) {
                      const newIndex = historyIndex - 1;
                      setHistoryIndex(newIndex);
                      setInputValue(queryHistory[newIndex]);
                    } else if (historyIndex === 0) {
                      setHistoryIndex(-1);
                      setInputValue('');
                    }
                  }
                }}
                placeholder="Ask me anything about your finances..."
                className="w-full px-5 py-4 pr-14 bg-gray-50/80 backdrop-blur-sm border-0 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/90 text-sm transition-all duration-300 shadow-inner"
                disabled={isLoading || isListening}
                data-cy="ai-assistant-input"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Voice input"
                data-cy="ai-assistant-voice"
              >
                {isListening ? '🔴' : '🎤'}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading || isListening || !inputValue.trim()}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
              data-cy="ai-assistant-send"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AIAssistant;
