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
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl pb-6"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
    >
      <div className="max-w-screen-sm mx-auto px-2">
        <div className="flex justify-around items-center h-12 pt-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-blue-600 bg-blue-50 transform scale-105'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              aria-label={`Navigate to ${item.label}`}
              data-cy={`nav-${item.id === 'todos' ? 'todos' : item.id === 'cards' ? 'cards' : item.id}-tab`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeTab === item.id && <div className="w-1 h-1 bg-blue-600 rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
