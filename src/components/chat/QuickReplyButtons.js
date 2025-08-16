import React from 'react';

const QuickReplyButtons = ({ replies, onReply }) => {
  const getButtonColor = index => {
    const colors = [
      'bg-gradient-to-r from-[#A3D5FF] to-[#6FB6F5] hover:shadow-md hover:brightness-105',
      'bg-gradient-to-r from-[#B7FBC2] to-[#63D28B] hover:shadow-md hover:brightness-105',
      'bg-gradient-to-r from-[#FFE199] to-[#FFB84A] hover:shadow-md hover:brightness-105',
      'bg-gradient-to-r from-[#A3D5FF] to-[#6FB6F5] hover:shadow-md hover:brightness-105',
      'bg-gradient-to-r from-[#B7FBC2] to-[#63D28B] hover:shadow-md hover:brightness-105',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReply(reply.query)}
          className={`px-4 py-2 rounded-2xl text-[#331B18] text-sm font-bold shadow-sm transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] focus:ring-offset-2 ${getButtonColor(index)}`}
        >
          {reply.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
