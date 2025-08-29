import React from 'react';

const AppleWalletCard = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  elevated = false,
  stack = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'aw-card';
  const variantClasses = {
    default: '',
    elevated: 'aw-card-elevated',
    interactive: 'aw-card-interactive',
    stack: 'aw-card-stack',
  };

  const classes = [
    baseClasses,
    elevated && 'aw-card-elevated',
    interactive && 'aw-card-interactive',
    stack && 'aw-card-stack',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default AppleWalletCard;
