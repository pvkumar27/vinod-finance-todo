import React from 'react';
import { motion } from 'framer-motion';

const BottomNavigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'todos', label: 'Tasks', icon: '✅' },
    { id: 'cards', label: 'Cards', icon: '💳' },
    { id: 'insights', label: 'Insights', icon: '📊' },
  ];

  return (
    <nav
      className="aw-nav fixed bottom-0 left-0 right-0 z-50 pb-6"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
    >
      <div className="max-w-screen-sm mx-auto px-4">
        <div
          className="flex justify-around items-center h-14 pt-1 rounded-2xl border-t border-gray-200"
          style={{
            background: 'rgba(248, 250, 252, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {navItems.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`aw-nav-item ${activeTab === item.id ? 'active' : ''} relative flex flex-col items-center justify-center p-2 rounded-lg transition-all`}
              aria-label={`Navigate to ${item.label}`}
              data-cy={`nav-${item.id}-tab`}
              animate={{
                scale: activeTab === item.id ? 1.1 : 1,
                y: activeTab === item.id ? -2 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: activeTab === item.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                boxShadow:
                  activeTab === item.id
                    ? '0 0 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : 'none',
                borderBottom: activeTab === item.id ? '2px solid #2563EB' : '2px solid transparent',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
