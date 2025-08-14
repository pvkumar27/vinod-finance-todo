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
        "👋 Hi! I'm your AI finance assistant. Ask me about your todos, credit cards, or financial insights!",
      timestamp: new Date(),
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
        content: response.message || 'I processed your request!',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4">
              <h1 className="text-2xl font-bold text-gradient text-center">FinTask AI</h1>
              <p className="text-sm text-gray-500 text-center">Your AI money assistant</p>
            </div>
            <div className="flex-1 p-4">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 bg-white rounded-2xl p-6 mb-4 overflow-y-auto border border-gray-200 shadow-sm">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
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
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Ask me anything about your finances..."
                      className="flex-1 input"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="btn-primary px-6 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className="h-full overflow-auto">
            <TabNavigation />
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
