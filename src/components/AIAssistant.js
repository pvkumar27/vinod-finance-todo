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
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
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

      // Trigger refresh if todo was added successfully
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
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Trigger refresh if todo was added successfully
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
        .map(
          card =>
            `• ${card.card_name || 'Card'} - ${card.card_type || 'Unknown'} ${card.last_transaction_date ? `(Last used: ${new Date(card.last_transaction_date).toLocaleDateString()})` : '(Never used)'}`
        )
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
      className="fixed bottom-4 left-4 right-4 h-96 sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto w-auto sm:w-96 sm:h-96 md:h-[500px] bg-white rounded-2xl shadow-2xl border-0 z-50 flex flex-col overflow-hidden backdrop-blur-sm"
      data-cy="ai-assistant-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <span className="font-semibold text-lg">Finbot</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          data-cy="ai-assistant-close"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <span className="text-white text-xs">🤖</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 text-sm whitespace-pre-line shadow-sm ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                  : message.isError
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-2xl rounded-bl-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md'
              }`}
            >
              {message.content}
              <div
                className={`text-xs mt-1 opacity-60 ${
                  message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 animate-fadeIn">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(action.query);
                  setShowQuickActions(false);
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
      <form onSubmit={handleSubmit} className="p-4 bg-white">
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
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all duration-200"
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
    </div>
  );
};

export default AIAssistant;
