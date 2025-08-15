import React from 'react';

const InsightCard = ({ data }) => {
  const getCards = () => {
    const cards = [];

    if (data.urgentItems) {
      cards.push({
        title: 'Priority Items 🎯',
        value: `${data.urgentItems.length} items`,
        message: 'Need your attention right now!',
        color: 'from-red-500 to-orange-500',
      });
    }

    if (data.insights) {
      cards.push({
        title: 'Financial Insights 💡',
        value: `${data.insights.length} insights`,
        message: 'Smart recommendations for you',
        color: 'from-blue-500 to-purple-500',
      });
    }

    if (data.suggestions) {
      cards.push({
        title: 'Optimization Tips 🚀',
        value: `${data.suggestions.length} tips`,
        message: 'Ways to improve your finances',
        color: 'from-green-500 to-teal-500',
      });
    }

    if (data.todos) {
      cards.push({
        title: 'Tasks This Week 📋',
        value: `${data.count || data.todos.length}`,
        message:
          data.todos.filter(t => !t.completed).length > 0
            ? `${data.todos.filter(t => !t.completed).length} still pending`
            : 'All caught up! 🎉',
        color: 'from-indigo-500 to-purple-500',
      });
    }

    if (data.credit_cards) {
      const inactiveCount = data.credit_cards.filter(card => {
        if (!card.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
        return daysSince >= 90;
      }).length;

      cards.push({
        title: 'Credit Cards 💳',
        value: `${data.count || data.credit_cards.length} cards`,
        message:
          inactiveCount > 0
            ? `${inactiveCount} haven't been used recently`
            : 'All cards are active! 💪',
        color: 'from-yellow-500 to-orange-500',
      });
    }

    return cards;
  };

  const cards = getCards();

  if (cards.length === 0) return null;

  return (
    <div className="flex space-x-3 overflow-x-auto pb-2 animate-fade-in">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`flex-shrink-0 w-48 p-4 rounded-3xl shadow-lg bg-gradient-to-br ${card.color} text-white transform transition-all duration-300 hover:scale-105`}
        >
          <h3 className="text-lg font-bold mb-2">{card.title}</h3>
          <div className="text-2xl font-extrabold mb-1">{card.value}</div>
          <p className="text-sm opacity-90 leading-relaxed">{card.message}</p>
        </div>
      ))}
    </div>
  );
};

export default InsightCard;
