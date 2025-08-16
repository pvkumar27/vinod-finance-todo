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

  const checkInactiveCards = useCallback(async alerts => {
    const inactiveCards = await mcpClient.callTool('get_credit_cards', { inactive_only: true });
    const count = inactiveCards.credit_cards?.length || 0;
    if (count > 0) {
      alerts.push({
        type: 'credit_card_inactive',
        message: `${count} credit card${count > 1 ? "s haven't" : " hasn't"} been used in 90+ days`,
        priority: 'medium',
        action: 'show inactive cards',
      });
    }
  }, []);

  const checkExpiringPromos = useCallback(async alerts => {
    const expiringPromos = await mcpClient.callTool('get_credit_cards', { promo_expiring: true });
    const count = expiringPromos.credit_cards?.length || 0;
    if (count > 0) {
      alerts.push({
        type: 'promo_expiring',
        message: `${count} credit card promo${count > 1 ? 's are' : ' is'} expiring soon`,
        priority: 'high',
        action: 'show cards with expiring promos',
      });
    }
  }, []);

  const checkOverdueTodos = useCallback(async alerts => {
    const overdueTodos = await mcpClient.callTool('get_todos', {
      due_date_before: new Date().toISOString().split('T')[0],
      completed: false,
    });
    const count = overdueTodos.todos?.length || 0;
    if (count > 0) {
      alerts.push({
        type: 'todos_overdue',
        message: `${count} task${count > 1 ? 's are' : ' is'} overdue`,
        priority: 'high',
        action: 'show overdue todos',
      });
    }
  }, []);

  const checkTodayTodos = useCallback(async alerts => {
    const todayTodos = await mcpClient.callTool('get_todos', {
      due_date: new Date().toISOString().split('T')[0],
      completed: false,
    });
    const count = todayTodos.todos?.length || 0;
    if (count > 0) {
      alerts.push({
        type: 'todos_today',
        message: `${count} task${count > 1 ? 's are' : ' is'} due today`,
        priority: 'medium',
        action: "show today's todos",
      });
    }
  }, []);

  const generateProactiveAlerts = useCallback(async () => {
    const alerts = [];
    try {
      await checkInactiveCards(alerts);
      await checkExpiringPromos(alerts);
      await checkOverdueTodos(alerts);
      await checkTodayTodos(alerts);
    } catch (error) {
      console.error('Error generating proactive alerts:', error);
    }
    return alerts;
  }, [checkInactiveCards, checkExpiringPromos, checkOverdueTodos, checkTodayTodos]);

  const createProactiveMessage = useCallback(alerts => {
    return {
      id: Date.now() + 100,
      type: 'assistant',
      content: `🔔 I noticed ${alerts.length} thing${alerts.length > 1 ? 's' : ''} that might need your attention:\n\n${alerts.map(alert => '• ' + alert.message).join('\n')}\n\nWould you like me to help you with any of these?`,
      timestamp: new Date(),
      isProactive: true,
      alerts: alerts,
    };
  }, []);

  useEffect(() => {
    const checkProactiveAlerts = async () => {
      try {
        const alerts = await generateProactiveAlerts();
        setProactiveAlerts(alerts);
        if (alerts.length > 0) {
          const alertMessage = createProactiveMessage(alerts);
          setTimeout(() => {
            setMessages(prev => [...prev, alertMessage]);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking proactive alerts:', error);
      }
    };
    if (isExpanded) {
      checkProactiveAlerts();
    }
  }, [isExpanded, generateProactiveAlerts, createProactiveMessage]);

  const addErrorMessage = useCallback(content => {
    const errorMessage = {
      id: Date.now(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      isError: true,
    };
    setMessages(prev => [...prev, errorMessage]);
  }, []);

  const formatTodos = response => {
    const todoList = response.todos
      .map(todo => {
        const status = todo.completed ? '✅' : '⏳';
        const priority = todo.priority ? '(' + todo.priority + ')' : '';
        return '• ' + todo.task + ' ' + status + ' ' + priority;
      })
      .join('\n');
    return 'Found ' + response.count + ' todos:\n' + todoList;
  };

  const formatCreditCards = response => {
    const cardList = response.credit_cards
      .map(card => {
        const cardName =
          card.bank_name && card.last_four_digits
            ? card.bank_name + ' ' + card.last_four_digits
            : card.card_name || 'Card';
        const cardType = card.card_type || 'free';
        const lastUsed = card.last_used_date
          ? '(Last used: ' + new Date(card.last_used_date).toLocaleDateString() + ')'
          : '(Never used)';
        return '• ' + cardName + ' - ' + cardType + ' ' + lastUsed;
      })
      .join('\n');
    return 'Found ' + response.count + ' credit cards:\n' + cardList;
  };

  const formatTransactions = response => {
    const total = response.total_amount || 0;
    const transactionList = response.transactions
      .map(t => '• ' + t.description + ' - $' + t.amount + ' (' + t.date + ')')
      .join('\n');
    return (
      'Found ' +
      response.count +
      ' transactions (Total: $' +
      total.toFixed(2) +
      '):\n' +
      transactionList
    );
  };

  const formatResponse = useCallback(response => {
    if (response.todos) return formatTodos(response);
    if (response.credit_cards) return formatCreditCards(response);
    if (response.transactions) return formatTransactions(response);
    if (response.insights)
      return 'Financial Insights:\n' + response.insights.map(i => '• ' + i).join('\n');
    if (response.urgentItems)
      return '🎯 Priority Items:\n' + response.urgentItems.map(i => '• ' + i).join('\n');
    if (response.alerts)
      return '🔔 Alerts:\n' + response.alerts.map(a => '• ' + (a.message || a)).join('\n');
    if (response.suggestions)
      return '🚀 Suggestions:\n' + response.suggestions.map(s => '• ' + s).join('\n');
    if (response.success && response.todo)
      return '✅ ' + response.message + '\nTask: ' + response.todo.task;
    if (response.success && (response.deletedCount || response.updatedCount))
      return '✅ ' + response.message;
    if (response.success && response.credit_card)
      return '✅ ' + response.message + '\nCard: ' + response.credit_card.card_name;
    if (response.ui_action || response.ui_guidance) return '✅ ' + response.message;
    return response.message || response.summary || JSON.stringify(response, null, 2);
  }, []);

  const triggerDataRefresh = useCallback(response => {
    if (!response.success) return;
    const hasDataChanges =
      response.todo || response.credit_card || response.deletedCount || response.updatedCount;
    if (!hasDataChanges) return;
    window.dispatchEvent(new CustomEvent('todoAdded', { detail: response.todo || {} }));
    if (response.credit_card || response.deletedCount) {
      const eventDetail = response.deletedCard
        ? { deleted: true, cardId: response.deletedCard.id }
        : response.credit_card || {};
      window.dispatchEvent(new CustomEvent('creditCardAdded', { detail: eventDetail }));
    }
    if (response.ui_action === 'switch_view') {
      window.dispatchEvent(
        new CustomEvent('switchView', {
          detail: { viewMode: response.view_mode, source: 'ai' },
        })
      );
    }
  }, []);

  const processQuery = useCallback(
    async query => {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: query,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      try {
        const response = await mcpClient.processNaturalLanguageQuery(query);
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: formatResponse(response),
          timestamp: new Date(),
          data: response,
          processingMode: response.processingMode || 'fallback',
        };
        setMessages(prev => [...prev, assistantMessage]);
        triggerDataRefresh(response);
      } catch (error) {
        addErrorMessage(`Sorry, I encountered an error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [formatResponse, triggerDataRefresh, addErrorMessage]
  );

  useEffect(() => {
    const handleAiQuery = async event => {
      const { query } = event.detail;
      if (!query) return;
      if (!isExpanded) {
        setIsExpanded(true);
        setTimeout(() => processQuery(query), 300);
      } else {
        processQuery(query);
      }
    };
    window.addEventListener('aiQuery', handleAiQuery);
    return () => window.removeEventListener('aiQuery', handleAiQuery);
  }, [isExpanded, processQuery]);

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      const query = inputValue;
      setQueryHistory(prev => [query, ...prev.slice(0, 49)]);
      setHistoryIndex(-1);
      setInputValue('');
      await processQuery(query);
      setTimeout(() => {
        const input = document.querySelector('[data-cy="ai-assistant-input"]');
        if (input) input.focus();
      }, 100);
    },
    [inputValue, isLoading, processQuery]
  );

  const handleVoiceRecognitionResult = useCallback(
    async transcript => {
      setInputValue(transcript);
      await processQuery(transcript);
      setInputValue('');
    },
    [processQuery]
  );

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addErrorMessage('❌ Voice recognition not supported in this browser');
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
      await handleVoiceRecognitionResult(transcript);
    };
    recognition.onerror = event => {
      addErrorMessage(`❌ Voice recognition error: ${event.error}`);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  }, [addErrorMessage, handleVoiceRecognitionResult]);

  const getMessageClassName = message => {
    if (message.type === 'user') {
      return 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-[28px] rounded-bl-xl shadow-purple-300/40 text-sm font-medium border-white/20';
    }
    if (message.isError) {
      return 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100 text-red-800 border-red-200/60 rounded-[28px] rounded-bl-xl shadow-red-200/40 text-sm';
    }
    if (message.isWelcome) {
      return 'bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 text-gray-800 border-emerald-200/60 rounded-[28px] rounded-bl-xl shadow-emerald-200/50 text-sm';
    }
    if (message.isProactive) {
      return 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-800 border-amber-200/60 rounded-[28px] rounded-bl-xl shadow-amber-200/50 text-sm';
    }
    if (message.processingMode === 'gemini') {
      return 'bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 text-gray-800 border-violet-200/60 rounded-[28px] rounded-bl-xl shadow-violet-200/50 text-sm';
    }
    return 'bg-gradient-to-br from-white to-gray-50/80 text-gray-800 border-gray-200/60 rounded-[28px] rounded-bl-xl shadow-gray-200/50 text-sm';
  };

  const getMessageBadgeClassName = message => {
    if (message.isWelcome) return 'bg-emerald-100 text-emerald-700';
    if (message.isProactive) return 'bg-amber-100 text-amber-700';
    if (message.processingMode === 'gemini') return 'bg-violet-100 text-violet-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getMessageBadgeText = message => {
    if (message.isWelcome) return '👋 Welcome';
    if (message.isProactive) return '🔔 Alert';
    if (message.processingMode === 'gemini') return '🤖 AI';
    return '🔧 Rule';
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
          className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full p-5 shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-3xl group relative overflow-hidden border-2 border-white/20"
          data-cy="ai-assistant-toggle"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-3xl filter drop-shadow-lg">🤖</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></div>
          {proactiveAlerts.length > 0 && (
            <div className="absolute -top-3 -left-3 w-7 h-7 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce shadow-xl border-2 border-white">
              {proactiveAlerts.length}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto w-auto sm:w-[420px] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/30 z-50 flex flex-col overflow-hidden transition-all duration-500 ease-out ${
        isMinimized ? 'h-16' : 'h-[520px] md:h-[580px]'
      }`}
      data-cy="ai-assistant-chat"
    >
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden rounded-t-[32px]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
            <span className="text-2xl filter drop-shadow-sm">🤖</span>
          </div>
          <div>
            <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              FinBot
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm text-white/90 font-medium">AI Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative z-20">
          <button
            onClick={handleMinimize}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
            data-cy="ai-assistant-minimize"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d={isMinimized ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
              />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
            data-cy="ai-assistant-close"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/60 via-blue-50/20 to-purple-50/20 backdrop-blur-sm">
          {messages.map((message, index) => (
            <div key={message.id || index} className="flex justify-start animate-fadeIn">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-lg border-2 ${
                  message.type === 'assistant'
                    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-white/30'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 border-white/30'
                }`}
              >
                <span className="text-white text-sm filter drop-shadow-sm">
                  {message.type === 'assistant' ? '🤖' : '👤'}
                </span>
              </div>
              <div
                className={`max-w-[75%] px-6 py-4 whitespace-pre-line shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${getMessageClassName(message)}`}
              >
                {message.content}
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
                  className={`text-xs mt-2 opacity-70 flex justify-between items-center ${
                    message.type === 'user' ? 'text-white/80' : 'text-gray-600'
                  }`}
                >
                  <span className="font-medium">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {message.type === 'assistant' && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getMessageBadgeClassName(message)}`}
                    >
                      {getMessageBadgeText(message)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-lg border-2 border-white/30">
                <span className="text-white text-sm filter drop-shadow-sm">🤖</span>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/60 px-6 py-4 rounded-[28px] rounded-bl-xl text-sm shadow-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 font-medium">FinBot is thinking</span>
                  <div className="flex space-x-1.5 ml-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce shadow-sm"></div>
                    <div
                      className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm"
                      style={{ animationDelay: '0.15s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full animate-bounce shadow-sm"
                      style={{ animationDelay: '0.3s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {!isMinimized && showQuickActions && (
        <div className="px-6 py-4 bg-gradient-to-r from-white/80 via-blue-50/40 to-purple-50/40 border-t border-white/40 animate-fadeIn backdrop-blur-sm">
          <div className="text-xs text-gray-700 mb-3 font-semibold flex items-center">
            <span className="mr-2">🚀</span>
            Quick Actions
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(action => (
              <button
                key={action.query}
                onClick={() => {
                  setShowQuickActions(false);
                  processQuery(action.query);
                }}
                className={`text-xs px-3 py-2 rounded-full border transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 ${
                  action.priority === 'high'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-300/50 hover:from-orange-600 hover:to-red-600'
                    : 'bg-gradient-to-r from-white to-blue-50 text-blue-700 border-blue-200/60 hover:from-blue-50 hover:to-blue-100'
                }`}
                data-cy={`quick-action-${action.query.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isMinimized && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-gradient-to-r from-white/90 via-blue-50/30 to-purple-50/30 backdrop-blur-xl border-t border-white/30 rounded-b-[32px]"
        >
          <div className="flex items-end space-x-3">
            <button
              type="button"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                showQuickActions
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 hover:from-gray-300 hover:to-gray-400'
              }`}
              title="Quick actions"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${
                  showQuickActions ? 'rotate-45' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
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
                className="w-full px-6 py-4 pr-16 bg-gradient-to-r from-white/90 to-gray-50/80 backdrop-blur-sm border border-white/40 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300/50 focus:bg-white/95 text-sm transition-all duration-300 shadow-lg placeholder-gray-500"
                disabled={isLoading || isListening}
                data-cy="ai-assistant-input"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110'
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 hover:from-gray-300 hover:to-gray-400 hover:scale-105'
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
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 disabled:shadow-none disabled:scale-100 border-2 border-white/20"
              data-cy="ai-assistant-send"
            >
              <svg
                className="w-6 h-6 filter drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
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
