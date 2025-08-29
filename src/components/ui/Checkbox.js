import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function Checkbox({ checked, onChange, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-5 h-5 rounded border-2 transition-colors ${
        checked ? 'bg-primary border-primary' : 'bg-white border-gray-300 hover:border-gray-400'
      } ${className}`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={checked ? { scale: 1, opacity: 1 } : { scale: 0.3, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </motion.div>
    </motion.button>
  );
}
