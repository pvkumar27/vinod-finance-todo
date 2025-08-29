import React, { useState, useRef, useEffect } from 'react';
import { mcpClient } from '../services/mcpClient';
import TabNavigation from './TabNavigation';
import ChatContainer from './chat/ChatContainer';
import ChatHeader from './chat/ChatHeader';
import BottomPanel from './BottomPanel';
import BottomNavigation from './BottomNavigation';
import FloatingChatBubble from './FloatingChatBubble';
import TopBar from './shared/TopBar';
import useToneMode from '../hooks/useToneMode';
import { motion, AnimatePresence } from 'framer-motion';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('todos');
  const [messages, setMessages] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { getRoastReply, getHypeReply } = useToneMode();

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && !initialized) {
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
    }
  }, [isChatOpen, initialized]);

  useEffect(() => {
    const handleQuickReply = event => {
      setInputValue(event.detail);
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }, 100);
    };

    const handleSwitchTab = event => {
      setActiveTab(event.detail.tab);
    };

    window.addEventListener('quickReply', handleQuickReply);
    window.addEventListener('switchTab', handleSwitchTab);
    return () => {
      window.removeEventListener('quickReply', handleQuickReply);
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, []);

  const createMessage = (type, content, extra = {}) => ({
    id: Date.now() + (type === 'assistant' ? 1 : 0),
    type,
    content,
    timestamp: new Date(),
    ...extra,
  });

  const addMessage = (type, content, extra = {}) => {
    setMessages(prev => [...prev, createMessage(type, content, extra)]);
  };

  const triggerDataRefresh = response => {
    if (!response.success) return;
    if (!(response.todo || response.credit_card || response.deletedCount || response.updatedCount))
      return;

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
  };

  const processQuery = async (query, addUserMsg = true) => {
    if (addUserMsg) addMessage('user', query);
    setIsLoading(true);

    try {
      const response = await mcpClient.processNaturalLanguageQuery(query);
      addMessage('assistant', formatResponse(response), {
        data: response,
        processingMode: response.processingMode || 'fallback',
      });
      triggerDataRefresh(response);
    } catch (error) {
      const content = error.message.includes('I can help with')
        ? error.message
        : `Sorry, I encountered an error: ${error.message}`;
      addMessage('assistant', content, { isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addMessage('assistant', '❌ Voice recognition not supported in this browser', {
        isError: true,
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      addMessage('assistant', '🎤 Listening... Speak your command');
    };

    recognition.onresult = async event => {
      const transcript = event.results[0][0].transcript;
      await processQuery(transcript);
      setInputValue('');
    };

    recognition.onerror = event => {
      const errorContent =
        event.error === 'not-allowed'
          ? "🎤 Microphone access denied. Click the microphone icon in your browser's address bar or go to Settings > Privacy & Security > Site Settings > Microphone to allow access."
          : `❌ Voice recognition error: ${event.error}`;
      addMessage('assistant', errorContent, { isError: true });
    };

    recognition.onend = () => {
      // Voice recognition ended
    };

    recognition.start();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const query = inputValue;
    setInputValue('');
    await processQuery(query);

    // Restore focus to input field
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Message FinBot..."]');
      if (input) input.focus();
    }, 100);
  };

  const formatTodos = response => {
    const completedCount = response.todos.filter(t => t.completed).length;
    const pendingCount = response.count - completedCount;
    const intro =
      pendingCount === 0
        ? `🎉 Look at you, task master! All ${response.count} todos are done!`
        : `📋 Here's what's on your plate (${pendingCount} still need some love):`;
    const todoList = response.todos
      .map(todo => {
        const status = todo.completed ? '✅' : '⏳';
        const priority = todo.priority ? `(${todo.priority} priority)` : '';
        return `${status} ${todo.task} ${priority}`;
      })
      .join('\n');
    return `${intro}\n\n${todoList}`;
  };

  const formatCreditCards = response => {
    const inactiveCount = response.credit_cards.filter(card => {
      if (!card.last_used_date) return true;
      const daysSince = Math.floor(
        (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
      );
      return daysSince >= 90;
    }).length;
    const intro =
      inactiveCount > 0
        ? `💳 Your card collection! But ${inactiveCount} are gathering dust... 🕸️`
        : `💳 Your ${response.count} cards are all active and ready to spend! 💪`;
    const cardList = response.credit_cards
      .map(card => {
        const cardName =
          card.bank_name && card.last_four_digits
            ? card.bank_name + ' ••' + card.last_four_digits
            : card.card_name || 'Mystery Card';
        const lastUsed = card.last_used_date
          ? 'Last used: ' + new Date(card.last_used_date).toLocaleDateString()
          : 'Never used (ouch! 😬)';
        return '💳 ' + cardName + '\n   ' + lastUsed;
      })
      .join('\n\n');
    return `${intro}\n\n${cardList}`;
  };

  const formatTransactions = response => {
    const total = response.total_amount || 0;
    let emoji = '🪙';
    if (total > 500) emoji = '💸';
    else if (total > 100) emoji = '💰';
    const transactionList = response.transactions
      .map(t => '• ' + t.description + ' - $' + t.amount + ' (' + t.date + ')')
      .join('\n');
    return (
      emoji +
      ' Found ' +
      response.count +
      ' transactions totaling $' +
      total.toFixed(2) +
      '\n\n' +
      transactionList
    );
  };

  const formatInsights = response => {
    const insightsList = response.insights.map(insight => '• ' + insight).join('\n');
    const recommendations = response.recommendations
      ? "\n\n🎯 My recommendations (trust me, I'm good at this):\n" +
        response.recommendations.map(rec => '• ' + rec).join('\n')
      : '';
    return "💡 Here's what I'm seeing in your finances:\n\n" + insightsList + recommendations;
  };

  const formatUrgentItems = response => {
    const urgentList = response.urgentItems.map(item => '🎯 ' + item).join('\n');
    const insights = response.insights
      ? "\n\n💭 Here's the tea:\n" + response.insights.map(insight => '• ' + insight).join('\n')
      : '';
    return (
      "🚨 Okay, let's talk priorities! These need your attention ASAP:\n\n" + urgentList + insights
    );
  };

  const formatSuggestions = response => {
    const suggestionsList = response.suggestions.map(suggestion => '✨ ' + suggestion).join('\n');
    const insights = response.insights
      ? '\n\n📊 The breakdown:\n' + response.insights.map(insight => '• ' + insight).join('\n')
      : '';
    return (
      '🚀 Time for some financial glow-up! Here are my suggestions:\n\n' +
      suggestionsList +
      insights
    );
  };

  const formatResponse = response => {
    if (response.todos) return formatTodos(response);
    if (response.credit_cards) return formatCreditCards(response);
    if (response.transactions) return formatTransactions(response);
    if (response.insights) return formatInsights(response);
    if (response.urgentItems) return formatUrgentItems(response);
    if (response.alerts)
      return (
        '🔔 Alert alert! I found some things that need a look:\n\n' +
        response.alerts.map(alert => '• ' + (alert.message || alert)).join('\n')
      );
    if (response.suggestions) return formatSuggestions(response);
    if (response.success && response.todo)
      return `✅ Boom! Task added like a boss!\n\n📝 "${response.todo.task}"\n\nWhat's next on the agenda? 😎`;
    if (response.success && (response.deletedCount || response.updatedCount))
      return `✅ ${response.message} 🎉\n\nFeeling productive yet? 😏`;
    if (response.success && response.credit_card)
      return `✅ ${response.message}\n\n💳 ${response.credit_card.card_name} is now in your wallet! 🎉`;
    if (
      response.ui_action ||
      response.ui_guidance ||
      (response.success === false && response.message && !response.message.includes('Error'))
    )
      return `✅ ${response.message}`;
    return response.message || response.summary || "Hmm, I'm not sure what happened there... 🤔";
  };

  const handleRoast = () => {
    addMessage('assistant', getRoastReply(), { isRoast: true });
  };

  const handleHype = () => {
    addMessage('assistant', getHypeReply(), { isHype: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'todos':
        return (
          <motion.div
            className="h-full"
            style={{ background: 'var(--color-background)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TopBar />
            <div className="overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
              <TabNavigation activeTab="todos" />
            </div>
          </motion.div>
        );
      case 'cards':
        return (
          <motion.div
            className="h-full overflow-auto"
            style={{ background: 'var(--color-background)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TopBar />
            <div className="overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
              <TabNavigation activeTab="cards" />
            </div>
          </motion.div>
        );
      case 'insights':
        return (
          <motion.div
            className="h-full overflow-auto"
            style={{ background: 'var(--color-background)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TopBar />
            <div className="overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
              <TabNavigation activeTab="insights" />
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            className="h-full flex flex-col"
            style={{ background: 'var(--color-background)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TopBar />
            <div className="p-4">
              <div className="card text-center">
                <div className="bg-primary text-white rounded-xl p-3 mb-4 flex items-center justify-center space-x-2">
                  <span className="text-xl">🤖</span>
                  <h1 className="text-lg font-bold">FinTask AI</h1>
                </div>
                <p className="text-secondary">Your AI money assistant</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'var(--color-background)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Main Content */}
      <div className="flex-1 pb-16">{renderContent()}</div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating Chat Bubble */}
      <FloatingChatBubble onClick={() => setIsChatOpen(!isChatOpen)} isActive={isChatOpen} />

      {/* Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col"
            style={{ background: 'var(--color-background)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TopBar />
            <ChatHeader isCollapsed={false} onToggleCollapse={() => setIsChatOpen(false)} />
            <div className="flex-1 p-4 overflow-hidden pb-36">
              <div className="card h-full">
                <div className="p-4 h-full flex flex-col">
                  <ChatContainer
                    messages={messages}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                    onRoast={handleRoast}
                    onHype={handleHype}
                  />
                </div>
              </div>
            </div>
            <div className="fixed bottom-16 left-0 right-0 z-50">
              <BottomPanel
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSubmit={handleSubmit}
                onVoiceInput={handleVoiceInput}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainApp;
