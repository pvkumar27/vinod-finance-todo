import React from 'react';

const ModernButton = ({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'modern-button';

  const variantClasses = {
    primary: 'modern-button-primary',
    secondary: 'modern-button-secondary',
    ghost: 'modern-button-ghost',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm hover:shadow-md',
    warning: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm hover:shadow-md',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:shadow-md',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const handleClick = e => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="modern-loading mr-2" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default ModernButton;
