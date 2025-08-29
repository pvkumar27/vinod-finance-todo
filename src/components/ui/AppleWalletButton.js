import React from 'react';
import useSoundEffects from '../../hooks/useSoundEffects';

const AppleWalletButton = ({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  className = '',
  onClick,
  soundEnabled = true,
  ...props
}) => {
  const { buttonPress } = useSoundEffects();

  const baseClasses = 'aw-button';
  const variantClasses = {
    primary: 'aw-button-primary',
    secondary: 'aw-button-secondary',
    ghost: 'aw-button-ghost',
    success: 'aw-button-success',
    warning: 'aw-button-warning',
    error: 'aw-button-error',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    default: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = e => {
    if (disabled || loading) return;
    if (soundEnabled) buttonPress();
    onClick?.(e);
  };

  return (
    <button className={classes} onClick={handleClick} disabled={disabled || loading} {...props}>
      {loading && <div className="aw-loading mr-2" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default AppleWalletButton;
