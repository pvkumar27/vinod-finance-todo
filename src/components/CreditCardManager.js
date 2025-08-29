import React from 'react';
import { motion } from 'framer-motion';
import CreditCardList from './CreditCardList';

const CreditCardManager = () => {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <CreditCardList />
    </motion.div>
  );
};

export default CreditCardManager;
