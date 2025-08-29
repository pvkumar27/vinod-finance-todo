import { motion } from 'framer-motion';

export default function Toggle({ checked, onChange, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-300'
      } ${className}`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
