import React from 'react';

const QuickReplyButtons = ({ replies, onReply }) => {
  const getButtonColor = index => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
      'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReply(reply.query)}
          className={`px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${getButtonColor(index)}`}
        >
          {reply.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
