import React from 'react';
import { Button } from '../components';
import TabNavigation from '../components/TabNavigation';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Vinod PWA
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your cards, expenses, and todos all in one place
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Credit Cards</h3>
              <p className="text-gray-600 mb-4">Track your credit card usage and payments</p>
              <Button>Manage Cards</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Expenses</h3>
              <p className="text-gray-600 mb-4">Monitor your monthly spending</p>
              <Button>View Expenses</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">To-Dos</h3>
              <p className="text-gray-600 mb-4">Keep track of home chores and tasks</p>
              <Button>Manage Tasks</Button>
            </div>
          </div>
        </div>
        
        {/* Main Application Modules */}
        <div className="mt-12">
          <TabNavigation />
        </div>
      </div>
    </div>
  );
};

export default Home;