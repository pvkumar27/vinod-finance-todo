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
  const baseClasses =
    'font-semibold rounded-xl border-0 cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 select-none active:scale-95';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    secondary:
      'bg-white text-gray-800 border border-gray-300 shadow-md hover:bg-gray-50 hover:shadow-lg',
    ghost: 'bg-transparent text-blue-600 border border-transparent hover:bg-blue-50',
    success:
      'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    warning:
      'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    error:
      'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
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
