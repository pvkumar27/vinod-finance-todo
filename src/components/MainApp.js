import React, { useState, useRef, useEffect } from 'react';
import { mcpClient } from '../services/mcpClient';
import TabNavigation from './TabNavigation';
import ChatContainer from './chat/ChatContainer';
import ChatHeader from './chat/ChatHeader';
import BottomPanel from './BottomPanel';
import BottomNavigation from './BottomNavigation';
import useToneMode from '../hooks/useToneMode';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (activeTab !== 'chat' || initialized) return;

    setInitialized(true);

    const welcomeMessage = {
      id: 1,
      type: 'assistant',
      content:
        "👋 Hey! I'm FinBot, your sassy money coach! 💸\n\nI'm here to help you crush your financial goals, roast your spending habits (lovingly), and keep your tasks in check. What's on your mind today? 🤔",
      timestamp: new Date(),
      isWelcome: true,
    };
    setMessages([welcomeMessage]);

    const timeoutId = setTimeout(async () => {
      try {
        const alerts = await generateProactiveAlerts();
        if (alerts.length > 0) {
          const alertMessage = {
            id: Date.now(),
            type: 'assistant',
            content: `🚨 Heads up! I spotted ${alerts.length} thing${alerts.length > 1 ? 's' : ''} that need some TLC:\n\n${alerts.map(alert => `• ${alert.message}`).join('\n')}\n\nDon't worry, I've got your back! Want me to help fix these? 💪`,
            timestamp: new Date(),
            isProactive: true,
          };
          setMessages(prev => [...prev, alertMessage]);
        } else {
          const positiveMessage = {
            id: Date.now(),
            type: 'assistant',
            content:
              "You're crushing it today 💰 — zero overdue tasks and all cards active! Want a 🍪?",
            timestamp: new Date(),
            isPositive: true,
          };
          setMessages(prev => [...prev, positiveMessage]);
        }
      } catch (error) {
        console.error('Error checking proactive alerts:', error);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleQuickReply = event => {
      setInputValue(event.detail);
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }, 100);
    };

    window.addEventListener('quickReply', handleQuickReply);
    return () => window.removeEventListener('quickReply', handleQuickReply);
  }, []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const { getRoastReply, getHypeReply } = useToneMode();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      let errorContent;
      if (event.error === 'not-allowed') {
        errorContent =
          '🎤 Microphone access denied. Please allow microphone permissions in your browser settings and try again.';
      } else {
        errorContent = `❌ Voice recognition error: ${event.error}`;
      }
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: errorContent,
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
        processingMode: response.processingMode || 'fallback',
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
        content: error.message.includes('I can help with')
          ? error.message
          : `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Restore focus to input field
      setTimeout(() => {
        const input = document.querySelector('input[placeholder="Message FinBot..."]');
        if (input) input.focus();
      }, 100);
    }
  };

  const formatResponse = response => {
    if (response.todos) {
      const completedCount = response.todos.filter(t => t.completed).length;
      const pendingCount = response.count - completedCount;
      let intro =
        pendingCount === 0
          ? `🎉 Look at you, task master! All ${response.count} todos are done!`
          : `📋 Here's what's on your plate (${pendingCount} still need some love):`;

      return `${intro}\n\n${response.todos
        .map(
          todo =>
            `${todo.completed ? '✅' : '⏳'} ${todo.task} ${todo.priority ? `(${todo.priority} priority)` : ''}`
        )
        .join('\n')}`;
    }

    if (response.credit_cards) {
      const inactiveCount = response.credit_cards.filter(card => {
        if (!card.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince >= 90;
      }).length;

      let intro =
        inactiveCount > 0
          ? `💳 Your card collection! But ${inactiveCount} are gathering dust... 🕸️`
          : `💳 Your ${response.count} cards are all active and ready to spend! 💪`;

      return `${intro}\n\n${response.credit_cards
        .map(card => {
          const cardName =
            card.bank_name && card.last_four_digits
              ? `${card.bank_name} ••${card.last_four_digits}`
              : card.card_name || 'Mystery Card';
          const lastUsed = card.last_used_date
            ? `Last used: ${new Date(card.last_used_date).toLocaleDateString()}`
            : 'Never used (ouch! 😬)';
          return `💳 ${cardName}\n   ${lastUsed}`;
        })
        .join('\n\n')}`;
    }

    if (response.transactions) {
      const total = response.total_amount || 0;
      const emoji = total > 500 ? '💸' : total > 100 ? '💰' : '🪙';
      return `${emoji} Found ${response.count} transactions totaling $${total.toFixed(2)}\n\n${response.transactions
        .map(t => `• ${t.description} - $${t.amount} (${t.date})`)
        .join('\n')}`;
    }

    if (response.insights) {
      return `💡 Here's what I'm seeing in your finances:\n\n${response.insights.map(insight => `• ${insight}`).join('\n')}${
        response.recommendations
          ? `\n\n🎯 My recommendations (trust me, I'm good at this):\n${response.recommendations.map(rec => `• ${rec}`).join('\n')}`
          : ''
      }`;
    }

    if (response.urgentItems) {
      return `🚨 Okay, let's talk priorities! These need your attention ASAP:\n\n${response.urgentItems.map(item => `🎯 ${item}`).join('\n')}${
        response.insights
          ? `\n\n💭 Here's the tea:\n${response.insights.map(insight => `• ${insight}`).join('\n')}`
          : ''
      }`;
    }

    if (response.alerts) {
      return `🔔 Alert alert! I found some things that need a look:\n\n${response.alerts.map(alert => `• ${alert.message || alert}`).join('\n')}`;
    }

    if (response.suggestions) {
      return `🚀 Time for some financial glow-up! Here are my suggestions:\n\n${response.suggestions.map(suggestion => `✨ ${suggestion}`).join('\n')}${
        response.insights
          ? `\n\n📊 The breakdown:\n${response.insights.map(insight => `• ${insight}`).join('\n')}`
          : ''
      }`;
    }

    if (response.success && response.todo) {
      return `✅ Boom! Task added like a boss!\n\n📝 "${response.todo.task}"\n\nWhat's next on the agenda? 😎`;
    }

    if (response.success && (response.deletedCount || response.updatedCount)) {
      return `✅ ${response.message} 🎉\n\nFeeling productive yet? 😏`;
    }

    if (response.success && response.credit_card) {
      return `✅ ${response.message}\n\n💳 ${response.credit_card.card_name} is now in your wallet! 🎉`;
    }

    if (
      response.ui_action ||
      response.ui_guidance ||
      (response.success === false && response.message && !response.message.includes('Error'))
    ) {
      return `✅ ${response.message}`;
    }

    return response.message || response.summary || "Hmm, I'm not sure what happened there... 🤔";
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

  const handleRoast = () => {
    const roastMessage = {
      id: Date.now(),
      type: 'assistant',
      content: getRoastReply(),
      timestamp: new Date(),
      isRoast: true,
    };
    setMessages(prev => [...prev, roastMessage]);
  };

  const handleHype = () => {
    const hypeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: getHypeReply(),
      timestamp: new Date(),
      isHype: true,
    };
    setMessages(prev => [...prev, hypeMessage]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="fixed inset-0 bg-white z-30 flex flex-col">
            <ChatHeader onClose={() => setActiveTab('todos')} />
            <div className="flex-1 bg-gradient-to-b from-[#FDF3EE] to-[#FCE7E2] pb-40">
              <ChatContainer
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                onRoast={handleRoast}
                onHype={handleHype}
              />
            </div>
            <BottomPanel
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSubmit={handleSubmit}
              onVoiceInput={handleVoiceInput}
              isLoading={isLoading}
            />
          </div>
        );
      case 'todos':
        return (
          <div className="h-full overflow-auto">
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ To-Dos</h2>
              </div>
              <TabNavigation activeTab="todos" />
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
              <TabNavigation activeTab="cards" />
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
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default MainApp;
