import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import CreditCardDashboard from '../components/CreditCardDashboard';
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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold finbot-text-gradient mb-4">Welcome to FinTask</h1>
          <p className="text-lg text-gray-300">Your AI-powered financial companion</p>
        </div>

        {/* Main Application Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            Task Management
          </h2>
          <TabNavigation />
        </div>

        {/* Version Footer */}
        <div className="text-center">
          <div className="finbot-card inline-flex items-center px-6 py-3">
            <p className="text-sm finbot-text-gradient font-medium">
              FinTask {APP_VERSION} • Built with React & Supabase
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Modals */}
      {ActiveDashboard && <ActiveDashboard onClose={() => setActiveDashboard(null)} />}
    </div>
  );
};

export default Home;
