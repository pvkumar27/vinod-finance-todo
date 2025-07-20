import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import CreditCardDashboard from '../components/CreditCardDashboard';
import MyFinancesDashboard from '../components/MyFinancesDashboard';
import TodosDashboard from '../components/TodosDashboard';
import NotificationSettings from '../components/NotificationSettings';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your cards, expenses, and tasks in one place
          </p>
        </div>

        {/* Main Application Modules - Now more prominent */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-blue-100">
          <TabNavigation />
        </div>

        {/* Dashboard Cards - Now less prominent */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Quick Access Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardCards.map(card => (
              <div
                key={card.id}
                onClick={() => setActiveDashboard(card.id)}
                className="group cursor-pointer border border-gray-200 hover:border-gray-300 bg-white rounded-lg p-4 shadow-sm hover:shadow transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`text-2xl p-2 rounded-full bg-gradient-to-r ${card.gradient} text-white`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{card.title}</h3>
                    <p className="text-gray-500 text-sm">{card.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                  <span>View Dashboard</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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

        {/* Notification Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Settings</h2>
          <NotificationSettings />
        </div>

        {/* Version Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            FinTask {APP_VERSION} • Built with React & Supabase
          </p>
        </div>
      </div>

      {/* Dashboard Modals */}
      {ActiveDashboard && <ActiveDashboard onClose={() => setActiveDashboard(null)} />}
    </div>
  );
};

export default Home;
