import React from 'react';

const BottomNavigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'spend', label: 'Spend', icon: '➡️' },
    { id: 'chat', label: 'Ask FinBot', icon: '🧠' },
    { id: 'save', label: 'Save', icon: '💾' },
    { id: 'request', label: 'Request', icon: '💲' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#EAD2C6] shadow-lg rounded-t-2xl">
      <div className="max-w-screen-sm mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-[#5C2E27] transform scale-105'
                  : 'text-[#A78A7F] hover:text-[#6F3D32]'
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeTab === item.id && <div className="w-1 h-1 bg-[#5C2E27] rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
