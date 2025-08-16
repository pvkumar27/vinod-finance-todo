import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  emoji,
  title,
  className = '',
  headerColor = 'bg-[#632D1F]',
  onClick,
}) => {
  const CardElement = onClick ? 'button' : 'div';

  return (
    <CardElement
      className={`fin-card ${className} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
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
    </CardElement>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  emoji: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  headerColor: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
