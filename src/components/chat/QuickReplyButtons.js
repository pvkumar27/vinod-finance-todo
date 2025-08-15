import React from 'react';

const QuickReplyButtons = ({ replies, onReply }) => {
  const getButtonColor = index => {
    const colors = [
      'bg-gradient-to-r from-[#9ED2F6] to-[#B3E3FF] hover:brightness-110',
      'bg-gradient-to-r from-[#A0EAC9] to-[#C4F7D0] hover:brightness-110',
      'bg-gradient-to-r from-[#FAD37B] to-[#FBB47C] hover:brightness-110',
      'bg-gradient-to-r from-[#9ED2F6] to-[#B3E3FF] hover:brightness-110',
      'bg-gradient-to-r from-[#A0EAC9] to-[#C4F7D0] hover:brightness-110',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReply(reply.query)}
          className={`px-4 py-2 rounded-2xl text-white text-sm font-bold shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] focus:ring-offset-2 ${getButtonColor(index)}`}
        >
          {reply.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
