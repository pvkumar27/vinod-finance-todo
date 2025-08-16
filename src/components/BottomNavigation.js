import React from 'react';

const BottomNavigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'chat', label: 'Ask FinBot', icon: '🧠' },
    { id: 'todos', label: 'Todos', icon: '✅' },
    { id: 'cards', label: 'Credit Cards', icon: '💳' },
    { id: 'insights', label: 'Insights', icon: '📊' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-t border-gray-200 shadow-lg rounded-t-2xl">
      <div className="max-w-screen-sm mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-[#632D1F] transform scale-105'
                  : 'text-gray-500 hover:text-[#632D1F]'
              }`}
              aria-label={`Navigate to ${item.label}`}
              data-cy={`nav-${item.id === 'todos' ? 'todos' : item.id === 'cards' ? 'cards' : item.id}-tab`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeTab === item.id && <div className="w-1 h-1 bg-[#632D1F] rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
