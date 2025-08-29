import React from 'react';
import { motion } from 'framer-motion';
import CreditCardManager from './CreditCardManager';
import TaskManager from './TaskManager';
import SmartDashboard from './SmartDashboard';

const TabNavigation = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'todos':
        return (
          <motion.div
            className="h-full overflow-y-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <TaskManager />
          </motion.div>
        );
      case 'cards':
        return (
          <motion.div
            className="h-full overflow-y-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CreditCardManager />
          </motion.div>
        );
      case 'insights':
        return (
          <motion.div
            className="h-full overflow-y-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SmartDashboard />
          </motion.div>
        );
      default:
        return (
          <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TaskManager />
          </motion.div>
        );
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};

export default TabNavigation;
