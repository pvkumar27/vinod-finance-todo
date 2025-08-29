import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <motion.input
      type={type}
      className={cn('input', className)}
      ref={ref}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
