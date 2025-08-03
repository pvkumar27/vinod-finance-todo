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

        {/* Version Footer with Notification Button */}
        <div className="mt-8 text-center pb-2">
          <div className="flex flex-col items-center space-y-4">
            {/* App info */}

            {/* Version Info */}
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100">
              <p className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
                FinTask {APP_VERSION} • Built with React & Supabase
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
