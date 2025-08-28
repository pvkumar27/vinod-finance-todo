import React from 'react';

const ModernCard = ({
  children,
  className = '',
  hover = true,
  padding = 'default',
  variant = 'default',
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200 rounded-2xl shadow-lg',
    elevated: 'bg-white border border-gray-200 rounded-2xl shadow-2xl',
    flat: 'bg-white border border-gray-200 rounded-2xl',
    gradient:
      'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg',
  };

  const baseClasses = `
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hover ? 'hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default ModernCard;
