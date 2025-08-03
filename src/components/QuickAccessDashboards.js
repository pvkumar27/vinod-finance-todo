import React from 'react';

const QuickAccessDashboards = ({ onSelectTab }) => {
  const dashboards = [
    {
      id: 'todos',
      title: 'To-Do Tasks',
      icon: '✅',
      description: 'Manage your daily tasks and reminders',
      cta: 'View Tasks',
    },
    {
      id: 'cards',
      title: 'Credit Cards',
      icon: '💳',
      description: 'Manage your credit cards and promotions',
      cta: 'View Cards',
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Quick Access Dashboards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboards.map(dashboard => (
          <div
            key={dashboard.id}
            className="card-fancy rounded-lg p-5 transition-all duration-300 hover:translate-y-[-4px] cursor-pointer float"
            onClick={() => onSelectTab && onSelectTab(dashboard.id)}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{dashboard.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{dashboard.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{dashboard.description}</p>
                <p className="text-blue-600 text-sm mt-3 font-medium">{dashboard.cta} →</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessDashboards;
