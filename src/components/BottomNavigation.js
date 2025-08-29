import React from 'react';

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
          className="flex justify-around items-center h-14 pt-1 rounded-2xl border border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
          }}
        >
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`aw-nav-item ${activeTab === item.id ? 'active' : ''}`}
              aria-label={`Navigate to ${item.label}`}
              data-cy={`nav-${item.id}-tab`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: 'var(--aw-primary)' }}
                ></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
