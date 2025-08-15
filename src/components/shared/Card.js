import React from 'react';

const Card = ({
  children,
  emoji,
  title,
  className = '',
  headerColor = 'bg-[#632D1F]',
  onClick,
}) => {
  return (
    <div
      className={`fin-card ${className} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      {(emoji || title) && (
        <div
          className={`${headerColor} text-white rounded-xl p-3 mb-4 flex items-center space-x-2`}
        >
          {emoji && <span className="text-xl">{emoji}</span>}
          {title && <h3 className="font-semibold text-sm">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
