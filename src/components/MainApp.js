import React, { useState, useRef, useEffect } from 'react';
import { mcpClient } from '../services/mcpClient';
import TabNavigation from './TabNavigation';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content:
        '👋 Hey there! I\'m FinBot, your AI-powered finance assistant. I\'m here to help you stay on top of your money and tasks!\n\n💡 Try asking me:\n• "What needs my attention today?"\n• "Show me inactive credit cards"\n• "Add a task to pay rent"\n• "Analyze my spending patterns"',
      timestamp: new Date(),
      isWelcome: true,
    },
  ]);
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
                      <div key={message.id} className="flex justify-start">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-1 shadow-lg border-2 ${
                            message.type === 'assistant'
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-white/30'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500 border-white/30'
                          }`}
                        >
                          <span className="text-white text-xs sm:text-sm">
                            {message.type === 'assistant' ? '🤖' : '👤'}
                          </span>
                        </div>
                        <div
                          className={`max-w-[75%] px-3 sm:px-6 py-2 sm:py-4 whitespace-pre-line shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl text-xs sm:text-sm ${
                            message.type === 'user'
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-[20px] sm:rounded-[28px] rounded-bl-xl shadow-purple-300/40 font-medium border-white/20'
                              : message.isWelcome
                                ? 'bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 text-gray-800 border-emerald-200/60 rounded-[20px] sm:rounded-[28px] rounded-bl-xl shadow-emerald-200/50'
                                : 'bg-gradient-to-br from-white to-gray-50/80 text-gray-800 border-gray-200/60 rounded-[20px] sm:rounded-[28px] rounded-bl-xl shadow-gray-200/50'
                          }`}
                        >
                          {message.content}
                          <div
                            className={`text-xs mt-1 sm:mt-2 opacity-70 flex justify-between items-center ${
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
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  message.isWelcome
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {message.isWelcome ? '👋 Welcome' : '🤖 AI'}
                              </span>
                            )}
                          </div>
                        </div>
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

                {/* Chat Input */}
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex space-x-2 sm:space-x-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Ask me anything about your finances..."
                      className="flex-1 input text-sm sm:text-base"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="btn-primary px-4 sm:px-6 text-sm sm:text-base disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      case 'todos':
        return (
          <div className="h-full overflow-auto p-4">
            <TabNavigation />
          </div>
        );
      case 'cards':
        return (
          <div className="h-full overflow-auto p-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gradient mb-4">Credit Cards</h2>
              <p className="text-gray-600">Credit card management coming soon</p>
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
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'chat' ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-medium">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('todos')}
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'todos' ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">✅</span>
                <span className="text-xs font-medium">Todos</span>
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'cards' ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">💳</span>
                <span className="text-xs font-medium">Cards</span>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'insights' ? 'text-purple-600' : 'text-gray-400'
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
