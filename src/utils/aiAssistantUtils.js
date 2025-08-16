// Shared utilities for AI Assistant components
export const MESSAGE_STYLES = {
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

export const ENHANCED_MESSAGE_STYLES = {
  user: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-[28px] rounded-bl-xl shadow-purple-300/40 text-sm font-medium border-white/20',
  error:
    'bg-gradient-to-br from-red-50 via-pink-50 to-red-100 text-red-800 border-red-200/60 rounded-[28px] rounded-bl-xl shadow-red-200/40 text-sm',
  welcome:
    'bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 text-gray-800 border-emerald-200/60 rounded-[28px] rounded-bl-xl shadow-emerald-200/50 text-sm',
  proactive:
    'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-800 border-amber-200/60 rounded-[28px] rounded-bl-xl shadow-amber-200/50 text-sm',
  gemini:
    'bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 text-gray-800 border-violet-200/60 rounded-[28px] rounded-bl-xl shadow-violet-200/50 text-sm',
  default:
    'bg-gradient-to-br from-white to-gray-50/80 text-gray-800 border-gray-200/60 rounded-[28px] rounded-bl-xl shadow-gray-200/50 text-sm',
};

export const BADGE_STYLES = {
  welcome: { class: 'bg-green-100 text-green-600', text: '👋 Welcome' },
  proactive: { class: 'bg-orange-100 text-orange-600', text: '🔔 Alert' },
  gemini: { class: 'bg-purple-100 text-purple-600', text: '🤖 AI' },
  default: { class: 'bg-gray-100 text-gray-600', text: '🔧 Rule' },
};

export const ENHANCED_BADGE_STYLES = {
  welcome: { class: 'bg-emerald-100 text-emerald-700', text: '👋 Welcome' },
  proactive: { class: 'bg-amber-100 text-amber-700', text: '🔔 Alert' },
  gemini: { class: 'bg-violet-100 text-violet-700', text: '🤖 AI' },
  default: { class: 'bg-gray-100 text-gray-700', text: '🔧 Rule' },
};

export const QUICK_ACTIONS = [
  { label: '🎯 What needs attention?', query: 'what needs my attention today?', priority: 'high' },
  { label: '📊 Financial insights', query: 'give me financial insights', priority: 'high' },
  { label: '📋 Show pending todos', query: 'show me pending todos' },
  { label: '💳 Show credit cards', query: 'show me my credit cards' },
  { label: '⚠️ Inactive cards', query: 'which cards are inactive?' },
  { label: '🔔 Promo alerts', query: 'show cards with expiring promos' },
];

export const FORMATTERS = {
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

export const formatResponse = response => {
  const formatMap = {
    todos: () => FORMATTERS.todos(response),
    credit_cards: () => FORMATTERS.credit_cards(response),
    transactions: () => FORMATTERS.transactions(response),
    insights: () => `Financial Insights:\n${response.insights.map(i => `• ${i}`).join('\n')}`,
    urgentItems: () => `🎯 Priority Items:\n${response.urgentItems.map(i => `• ${i}`).join('\n')}`,
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
};

export const createMessage = (type, content, extra = {}) => ({
  id: Date.now() + (type === 'assistant' ? 1 : 0),
  type,
  content,
  timestamp: new Date(),
  ...extra,
});

export const getMessageClassName = (message, styleSet = MESSAGE_STYLES) => {
  if (message.type === 'user') return styleSet.user;
  if (message.isError) return styleSet.error;
  if (message.isWelcome) return styleSet.welcome;
  if (message.isProactive) return styleSet.proactive;
  if (message.processingMode === 'gemini') return styleSet.gemini;
  return styleSet.default;
};

export const getMessageBadge = (message, badgeSet = BADGE_STYLES) => {
  if (message.isWelcome) return badgeSet.welcome;
  if (message.isProactive) return badgeSet.proactive;
  if (message.processingMode === 'gemini') return badgeSet.gemini;
  return badgeSet.default;
};

export const handleDataRefresh = response => {
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
};

export const handleUIActions = response => {
  if (response.ui_action === 'switch_view') {
    window.dispatchEvent(
      new CustomEvent('switchView', {
        detail: { viewMode: response.view_mode, source: 'ai' },
      })
    );
  }
};

export const focusInput = () => {
  setTimeout(() => {
    const input = document.querySelector('[data-cy="ai-assistant-input"]');
    if (input) input.focus();
  }, 100);
};
