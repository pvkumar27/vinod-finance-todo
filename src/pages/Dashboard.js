import React from 'react';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Credit Cards</h3>
          <p className="text-2xl font-bold text-gray-400">-</p>
          <p className="text-xs text-gray-500 mt-1">Migration in progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-green-600">$2,450</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
          <p className="text-2xl font-bold text-orange-600">8</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
