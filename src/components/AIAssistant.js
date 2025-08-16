import React, { useState, useRef, useEffect, useCallback } from 'react';
import { mcpClient } from '../services/mcpClient';
import VisualInsights from './VisualInsights';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content:
        '👋 Hey there! I\'m Finbot, your AI-powered finance assistant. I\'m here to help you stay on top of your money and tasks!\n\n💡 Try asking me:\n• "What needs my attention today?"\n• "Show me inactive credit cards"\n• "Add a task to pay rent"\n• "Analyze my spending patterns"',
      timestamp: new Date(),
      isWelcome: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [proactiveAlerts, setProactiveAlerts] = useState([]);
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

  const generateProactiveAlerts = useCallback(async () => {
    const alerts = [];
    try {
      const inactiveCards = await mcpClient.callTool('get_credit_cards', { inactive_only: true });
      if (inactiveCards.credit_cards && inactiveCards.credit_cards.length > 0) {
        const count = inactiveCards.credit_cards.length;
        alerts.push({
          type: 'credit_card_inactive',
          message:
            count +
            ' credit card' +
            (count > 1 ? "s haven't" : " hasn't") +
            ' been used in 90+ days',
          priority: 'medium',
          action: 'show inactive cards',
        });
      }
    } catch (error) {
      console.error('Error generating proactive alerts:', error);
    }
    return alerts;
  }, []);

  const checkProactiveAlerts = useCallback(async () => {
    try {
      const alerts = await generateProactiveAlerts();
      setProactiveAlerts(alerts);

      if (alerts.length > 0) {
        const alertMessage = {
          id: Date.now() + 100,
          type: 'assistant',
          content:
            '🔔 I noticed ' +
            alerts.length +
            ' thing' +
            (alerts.length > 1 ? 's' : '') +
            ' that might need your attention:\n\n' +
            alerts.map(alert => '• ' + alert.message).join('\n') +
            '\n\nWould you like me to help you with any of these?',
          timestamp: new Date(),
          isProactive: true,
          alerts: alerts,
        };

        setTimeout(() => {
          setMessages(prev => [...prev, alertMessage]);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking proactive alerts:', error);
    }
  }, [generateProactiveAlerts]);

  useEffect(() => {
    if (isExpanded) {
      checkProactiveAlerts();
    }
  }, [isExpanded, checkProactiveAlerts]);

  const handleDataRefresh = useCallback(response => {
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
  }, []);

  const handleUIActions = useCallback(response => {
    if (response.ui_action === 'switch_view') {
      window.dispatchEvent(
        new CustomEvent('switchView', {
          detail: { viewMode: response.view_mode, source: 'ai' },
        })
      );
    }
  }, []);

  const restoreInputFocus = useCallback(() => {
    setTimeout(() => {
      const input = document.querySelector('[data-cy="ai-assistant-input"]');
      if (input) input.focus();
    }, 100);
  }, []);

  const formatters = {
    todos: response => {
      const todoList = response.todos
        .map(
          todo =>
            `• ${todo.task} ${todo.completed ? '✅' : '⏳'} ${todo.priority ? `(${todo.priority})` : ''}`
        )
        .join('\n');
      return `Found ${response.count} todos:\n${todoList}`;
    },
    credit_cards: response => {
      const cardList = response.credit_cards
        .map(card => {
          const cardName =
            card.bank_name && card.last_four_digits
              ? `${card.bank_name} ${card.last_four_digits}`
              : card.card_name || 'Card';
          const lastUsed = card.last_used_date
            ? `(Last used: ${new Date(card.last_used_date).toLocaleDateString()})`
            : '(Never used)';
          return `• ${cardName} - ${card.card_type || 'free'} ${lastUsed}`;
        })
        .join('\n');
      return `Found ${response.count} credit cards:\n${cardList}`;
    },
    transactions: response => {
      const total = response.total_amount || 0;
      const transactionList = response.transactions
        .map(t => `• ${t.description} - $${t.amount} (${t.date})`)
        .join('\n');
      return `Found ${response.count} transactions (Total: $${total.toFixed(2)}):\n${transactionList}`;
    },
  };

  const formatResponse = useCallback(response => {
    const formatMap = {
      todos: () => formatters.todos(response),
      credit_cards: () => formatters.credit_cards(response),
      transactions: () => formatters.transactions(response),
      insights: () => `Financial Insights:\n${response.insights.map(i => `• ${i}`).join('\n')}`,
      urgentItems: () =>
        `🎯 Priority Items:\n${response.urgentItems.map(i => `• ${i}`).join('\n')}`,
      alerts: () => `🔔 Alerts:\n${response.alerts.map(a => `• ${a.message || a}`).join('\n')}`,
      suggestions: () => `🚀 Suggestions:\n${response.suggestions.map(s => `• ${s}`).join('\n')}`,
    };

    for (const [key, formatter] of Object.entries(formatMap)) {
      if (response[key]) return formatter();
    }

    if (response.success && response.todo)
      return `✅ ${response.message}\nTask: ${response.todo.task}`;
    if (response.success && (response.deletedCount || response.updatedCount))
      return `✅ ${response.message}`;
    if (response.success && response.credit_card)
      return `✅ ${response.message}\nCard: ${response.credit_card.card_name}`;
    if (response.ui_action || response.ui_guidance) return `✅ ${response.message}`;
    return response.message || response.summary || JSON.stringify(response, null, 2);
  }, []);

  const createMessage = useCallback(
    (type, content, extra = {}) => ({
      id: Date.now() + (type === 'assistant' ? 1 : 0),
      type,
      content,
      timestamp: new Date(),
      ...extra,
    }),
    []
  );

  const processQuery = useCallback(
    async (query, addUserMessage = true) => {
      if (addUserMessage) {
        setMessages(prev => [...prev, createMessage('user', query)]);
      }
      setIsLoading(true);

      try {
        const response = await mcpClient.processNaturalLanguageQuery(query);
        const assistantMessage = createMessage('assistant', formatResponse(response), {
          data: response,
          processingMode: response.processingMode || 'fallback',
        });
        setMessages(prev => [...prev, assistantMessage]);
        handleDataRefresh(response);
        handleUIActions(response);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          createMessage('assistant', 'Sorry, I encountered an error: ' + error.message, {
            isError: true,
          }),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [createMessage, formatResponse, handleDataRefresh, handleUIActions]
  );

  // Listen for AI queries from dashboard
  const handleAiQuery = useCallback(
    async event => {
      const { query } = event.detail;
      if (!query) return;

      if (!isExpanded) {
        setIsExpanded(true);
        setTimeout(() => processQuery(query), 300);
      } else {
        processQuery(query);
      }
    },
    [isExpanded, processQuery]
  );

  useEffect(() => {
    window.addEventListener('aiQuery', handleAiQuery);
    return () => window.removeEventListener('aiQuery', handleAiQuery);
  }, [handleAiQuery]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue;
    setQueryHistory(prev => [query, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setInputValue('');

    await processQuery(query);
    restoreInputFocus();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMessages(prev => [
        ...prev,
        createMessage('assistant', '❌ Voice recognition not supported in this browser', {
          isError: true,
        }),
      ]);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const handleRecognitionStart = () => {
      setIsListening(true);
      setMessages(prev => [
        ...prev,
        createMessage('assistant', '🎤 Listening... Speak your command'),
      ]);
    };

    const handleRecognitionResult = async event => {
      const transcript = event.results[0][0].transcript;
      await processQuery(transcript);
    };

    const handleRecognitionError = event => {
      setMessages(prev => [
        ...prev,
        createMessage('assistant', '❌ Voice recognition error: ' + event.error, { isError: true }),
      ]);
    };

    recognition.onstart = handleRecognitionStart;
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const messageStyles = {
    user: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl rounded-bl-lg shadow-blue-200/50 text-sm font-medium',
    error:
      'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200/50 rounded-3xl rounded-bl-lg shadow-red-200/30 text-sm',
    welcome:
      'bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 text-gray-800 border border-green-200/50 rounded-3xl rounded-bl-lg shadow-green-200/40 text-sm',
    proactive:
      'bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 text-gray-800 border border-orange-200/50 rounded-3xl rounded-bl-lg shadow-orange-200/40 text-sm',
    gemini:
      'bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 text-gray-800 border border-purple-200/50 rounded-3xl rounded-bl-lg italic shadow-purple-200/40 text-sm',
    default:
      'bg-white/90 text-gray-800 border border-gray-200/50 rounded-3xl rounded-bl-lg shadow-gray-200/40 text-sm',
  };

  const badgeStyles = {
    welcome: { class: 'bg-green-100 text-green-600', text: '👋 Welcome' },
    proactive: { class: 'bg-orange-100 text-orange-600', text: '🔔 Alert' },
    gemini: { class: 'bg-purple-100 text-purple-600', text: '🤖 AI' },
    default: { class: 'bg-gray-100 text-gray-600', text: '🔧 Rule' },
  };

  const getMessageClassName = message => {
    if (message.type === 'user') return messageStyles.user;
    if (message.isError) return messageStyles.error;
    if (message.isWelcome) return messageStyles.welcome;
    if (message.isProactive) return messageStyles.proactive;
    if (message.processingMode === 'gemini') return messageStyles.gemini;
    return messageStyles.default;
  };

  const getMessageBadge = message => {
    if (message.isWelcome) return badgeStyles.welcome;
    if (message.isProactive) return badgeStyles.proactive;
    if (message.processingMode === 'gemini') return badgeStyles.gemini;
    return badgeStyles.default;
  };

  const quickActions = [
    {
      label: '🎯 What needs attention?',
      query: 'what needs my attention today?',
      priority: 'high',
    },
    { label: '📊 Financial insights', query: 'give me financial insights', priority: 'high' },
    { label: '📋 Show pending todos', query: 'show me pending todos' },
    { label: '💳 Show credit cards', query: 'show me my credit cards' },
    { label: '⚠️ Inactive cards', query: 'which cards are inactive?' },
    { label: '🔔 Promo alerts', query: 'show cards with expiring promos' },
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
          {proactiveAlerts.length > 0 && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
              {proactiveAlerts.length}
            </div>
          )}
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
          {messages.map((message, index) => (
            <div key={message.id || 'msg-' + index} className="flex justify-start animate-fadeIn">
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
                className={`max-w-[80%] px-5 py-4 whitespace-pre-line shadow-lg backdrop-blur-sm ${getMessageClassName(message)}`}
              >
                {message.content}

                {/* Visual Insights for AI responses */}
                {message.type === 'assistant' &&
                  message.data &&
                  (message.data.insights ||
                    message.data.urgentItems ||
                    message.data.suggestions) && (
                    <div className="mt-3">
                      <VisualInsights data={message.data} type="overview" />
                    </div>
                  )}

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
                      className={`text-xs px-1.5 py-0.5 rounded-full ${getMessageBadge(message).class}`}
                    >
                      {getMessageBadge(message).text}
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
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 animate-fadeIn">
          <div className="text-xs text-gray-600 mb-2 font-medium">🚀 Quick Actions</div>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action, index) => (
              <button
                key={'action-' + index}
                onClick={() => {
                  setShowQuickActions(false);
                  processQuery(action.query);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-all duration-200 font-medium shadow-sm ${
                  action.priority === 'high'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-300 hover:from-orange-600 hover:to-red-600'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
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
                    return;
                  }
                  if (e.key === 'ArrowDown') {
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
