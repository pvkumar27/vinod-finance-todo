import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import CreditCardDashboard from '../components/CreditCardDashboard';
import MyFinancesDashboard from '../components/MyFinancesDashboard';
import TodosDashboard from '../components/TodosDashboard';
import { APP_VERSION } from '../constants/version';

const Home = () => {
  const [activeDashboard, setActiveDashboard] = useState(null);

  const dashboardCards = [
    {
      id: 'cards',
      title: 'Credit Cards',
      description: 'Track your credit card usage and payments',
      icon: '💳',
      gradient: 'from-blue-500 to-purple-600',
      component: CreditCardDashboard,
    },
    {
      id: 'expenses',
      title: 'My Finances',
      description: 'Track income and expenses overview',
      icon: '💰',
      gradient: 'from-green-500 to-teal-600',
      component: MyFinancesDashboard,
    },
    {
      id: 'todos',
      title: 'To-Dos',
      description: 'Keep track of tasks and priorities',
      icon: '✅',
      gradient: 'from-orange-500 to-red-600',
      component: TodosDashboard,
    },
  ];

  const ActiveDashboard = activeDashboard
    ? dashboardCards.find(card => card.id === activeDashboard)?.component
    : null;

  return (
    <div>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section removed */}

        {/* Main Application Modules - Now more prominent */}
        <div className="card-fancy rounded-2xl p-6 mb-8 hover-lift">
          <h2 className="section-header text-xl font-semibold mb-6">Task Management</h2>
          <div className="card-content">
            <TabNavigation />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div>
          <h2 className="section-header text-xl font-semibold mb-6">Quick Access Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardCards.map(card => (
              <div
                key={card.id}
                onClick={() => setActiveDashboard(card.id)}
                className="group cursor-pointer card-fancy rounded-lg p-5 hover-lift float"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`text-2xl p-3 rounded-full bg-gradient-to-r ${card.gradient} text-white shadow-md`}
                    style={{boxShadow: `0 4px 10px -1px rgba(0,0,0,0.1), 0 2px 6px -2px rgba(0,0,0,0.1)`}}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{card.title}</h3>
                    <p className="text-gray-500 text-sm">{card.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">View Dashboard</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-all duration-300 text-blue-600 group-hover:text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version Footer with Notification Button */}
        <div className="mt-8 text-center pb-2">
          <div className="flex flex-col items-center space-y-4">
            {/* App info */}
            
            {/* Version Info */}
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100">
              <p className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
                FinTask {APP_VERSION} • Built with React & Supabase • Auto-Release Enabled
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Modals */}
      {ActiveDashboard && <ActiveDashboard onClose={() => setActiveDashboard(null)} />}
    </div>
  );
};

export default Home;
