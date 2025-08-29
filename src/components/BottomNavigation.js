import React from 'react';

const BottomNavigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'chat', label: 'Ask FinBot', icon: '🧠' },
    { id: 'todos', label: 'Todos', icon: '✅' },
    { id: 'cards', label: 'Credit Cards', icon: '💳' },
    { id: 'insights', label: 'Insights', icon: '📊' },
  ];

  return (
    <nav
      className="aw-nav fixed bottom-0 left-0 right-0 z-50 pb-6"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
    >
      <div className="max-w-screen-sm mx-auto px-2">
        <div className="flex justify-around items-center h-12 pt-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`aw-nav-item ${activeTab === item.id ? 'active' : ''}`}
              aria-label={`Navigate to ${item.label}`}
              data-cy={`nav-${item.id === 'todos' ? 'todos' : item.id === 'cards' ? 'cards' : item.id}-tab`}
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
