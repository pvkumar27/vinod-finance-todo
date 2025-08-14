import React, { useState, useRef, useEffect } from 'react';
import { mcpClient } from '../services/mcpClient';
import TabNavigation from './TabNavigation';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(true);

  useEffect(() => {
    // Add welcome message and check for proactive alerts
    const initializeChat = async () => {
      const welcomeMessage = {
        id: 1,
        type: 'assistant',
        content:
          "👋 Hey there! I'm FinBot, your AI-powered finance assistant. I'm here to help you stay on top of your money and tasks!",
        timestamp: new Date(),
        isWelcome: true,
      };
      setMessages([welcomeMessage]);

      // Check for proactive alerts after 2 seconds
      setTimeout(async () => {
        try {
          const alerts = await generateProactiveAlerts();
          if (alerts.length > 0) {
            const alertMessage = {
              id: Date.now(),
              type: 'assistant',
              content: `🔔 I noticed ${alerts.length} thing${alerts.length > 1 ? 's' : ''} that might need your attention:\n\n${alerts.map(alert => `• ${alert.message}`).join('\n')}\n\nWould you like me to help you with any of these?`,
              timestamp: new Date(),
              isProactive: true,
            };
            setMessages(prev => [...prev, alertMessage]);
          }
        } catch (error) {
          console.error('Error checking proactive alerts:', error);
        }
      }, 2000);
    };

    if (activeTab === 'chat') {
      initializeChat();
    }
  }, [activeTab]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Trigger refresh if needed
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
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

    if (response.insights) {
      return `Financial Insights:\n${response.insights.map(insight => `• ${insight}`).join('\n')}${
        response.recommendations
          ? `\n\nRecommendations:\n${response.recommendations.map(rec => `• ${rec}`).join('\n')}`
          : ''
      }`;
    }

    if (response.urgentItems) {
      return `🎯 Priority Items:\n${response.urgentItems.map(item => `• ${item}`).join('\n')}${
        response.insights
          ? `\n\n💡 Insights:\n${response.insights.map(insight => `• ${insight}`).join('\n')}`
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

    return response.message || response.summary || JSON.stringify(response, null, 2);
  };

  const generateProactiveAlerts = async () => {
    const alerts = [];
    try {
      const allCards = await mcpClient.callTool('get_credit_cards', {});
      const inactiveCards = allCards.credit_cards
        ? allCards.credit_cards.filter(card => {
            if (!card.last_used_date) return true;
            const daysSince = Math.floor(
              (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
            );
            return daysSince >= 90;
          })
        : [];

      if (inactiveCards.length > 0) {
        alerts.push({
          message: `${inactiveCards.length} credit card${inactiveCards.length > 1 ? "s haven't" : " hasn't"} been used in 90+ days`,
        });
      }

      const overdueTodos = await mcpClient.callTool('get_todos', {
        due_date_before: new Date().toISOString().split('T')[0],
        completed: false,
      });
      if (overdueTodos.todos && overdueTodos.todos.length > 0) {
        alerts.push({
          message: `${overdueTodos.todos.length} task${overdueTodos.todos.length > 1 ? 's are' : ' is'} overdue`,
        });
      }
    } catch (error) {
      console.error('Error generating proactive alerts:', error);
    }
    return alerts;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gradient text-center">
                FinTask AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Your AI money assistant
              </p>
            </div>
            <div className="flex-1 p-2 sm:p-4">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-4 overflow-y-auto border border-gray-200 shadow-sm">
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex animate-fadeIn ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'assistant' && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-1 shadow-lg border-2 bg-gradient-to-br from-purple-500 to-pink-500 border-white/30">
                            <span className="text-white text-xs sm:text-sm">🤖</span>
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-3 sm:px-4 py-2 sm:py-3 whitespace-pre-line shadow-lg transition-all duration-300 text-xs sm:text-sm ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-br-md ml-auto'
                              : message.isWelcome
                                ? 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border border-purple-200/60 rounded-2xl rounded-bl-md'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md'
                          }`}
                        >
                          {message.content}
                          <div
                            className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-500'}`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ml-2 sm:ml-3 flex-shrink-0 mt-1 shadow-lg border-2 bg-gradient-to-br from-gray-400 to-gray-500 border-white/30">
                            <span className="text-white text-xs sm:text-sm">👤</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Quick Actions */}
                {showQuickActions && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-200">
                    <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="mr-2">🚀</span>
                      Quick Actions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: '🎯 What needs attention?',
                          query: 'what needs my attention today?',
                        },
                        { label: '📊 Financial insights', query: 'give me financial insights' },
                        { label: '📋 Show todos', query: 'show me pending todos' },
                        { label: '💳 Show cards', query: 'show me my credit cards' },
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setInputValue(action.query);
                            setTimeout(() => {
                              const form = document.querySelector('form');
                              if (form) form.requestSubmit();
                            }, 100);
                          }}
                          className="text-xs px-3 py-2 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200 shadow-sm"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <form onSubmit={handleSubmit} className="flex space-x-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Message FinBot..."
                      className="flex-1 bg-gray-50 border-0 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
            </div>
          </div>
        );
      case 'todos':
        return (
          <div className="h-full overflow-auto">
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ To-Dos</h2>
              </div>
              <TabNavigation />
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className="h-full overflow-auto">
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">💳 Credit Cards</h2>
              </div>
              <TabNavigation />
            </div>
          </div>
        );
      case 'insights':
        return (
          <div className="p-4 text-center h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gradient mb-4">Coming Soon</h2>
            <p className="text-gray-600">AI-powered insights will be available here</p>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4">
              <h1 className="text-2xl font-bold text-gradient text-center">FinTask AI</h1>
              <p className="text-sm text-gray-500 text-center">Your AI money assistant</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 pb-16">{renderContent()}</div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-medium">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('todos')}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'todos'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl">✅</span>
                <span className="text-xs font-medium">Todos</span>
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'cards'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl">💳</span>
                <span className="text-xs font-medium">Cards</span>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'insights'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl">📊</span>
                <span className="text-xs font-medium">Insights</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MainApp;
