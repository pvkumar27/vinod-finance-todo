import React from 'react';

const DashboardCard = ({ title, value, subtitle, icon, color = 'primary', trend, onClick }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
  };

  return (
    <div 
      className={`p-6 rounded-xl card-fancy transition-all duration-300 cursor-pointer transform hover:scale-105 hover:translate-y-[-5px] ${colorClasses[color]}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-70 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                trend.direction === 'up' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
              }`}>
                {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;