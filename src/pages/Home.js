import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import CreditCardDashboard from '../components/CreditCardDashboard';
import ExpensesDashboard from '../components/ExpensesDashboard';
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
      component: CreditCardDashboard
    },
    {
      id: 'expenses',
      title: 'Expenses',
      description: 'Monitor your monthly spending patterns',
      icon: '💰',
      gradient: 'from-green-500 to-teal-600',
      component: ExpensesDashboard
    },
    {
      id: 'todos',
      title: 'To-Dos',
      description: 'Keep track of tasks and priorities',
      icon: '✅',
      gradient: 'from-orange-500 to-red-600',
      component: TodosDashboard
    }
  ];

  const ActiveDashboard = activeDashboard ? dashboardCards.find(card => card.id === activeDashboard)?.component : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Finance To-Dos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal finance companion for managing cards, expenses, and tasks all in one place
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveDashboard(card.id)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${card.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{card.icon}</div>
                  <div className="text-white/80 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{card.description}</p>
                <div className="mt-4 flex items-center text-sm text-white/80">
                  <span>View Dashboard</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main Application Modules */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <TabNavigation />
        </div>
        
        {/* Version Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Finance To-Dos PWA {APP_VERSION} • Built with React & Supabase
          </p>
        </div>
      </div>

      {/* Dashboard Modals */}
      {ActiveDashboard && (
        <ActiveDashboard onClose={() => setActiveDashboard(null)} />
      )}
    </div>
  );
};

export default Home;