import React from 'react';
import DashboardCard from './DashboardCard';

// To be replaced by credit_cards_manual UI after table creation
const CreditCardDashboard = ({ onClose }) => {
  const cards = []; // Empty array - no cards during migration

  const stats = {
    totalCards: 0,
    activeCards: 0,
    totalLimit: 0,
    totalBalance: 0,
  };

  const utilizationRate = 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">💳 Credit Cards Dashboard</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard title="Total Cards" value={stats.totalCards} icon="💳" color="primary" />
            <DashboardCard
              title="Active Cards"
              value={stats.activeCards}
              icon="✅"
              color="success"
            />
            <DashboardCard
              title="Total Limit"
              value={`$${stats.totalLimit.toLocaleString()}`}
              icon="💰"
              color="warning"
            />
            <DashboardCard
              title="Utilization"
              value={`${utilizationRate}%`}
              subtitle={`$${stats.totalBalance.toLocaleString()} used`}
              icon="📊"
              color={utilizationRate > 80 ? 'danger' : utilizationRate > 50 ? 'warning' : 'success'}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Credit Cards</h3>
            {/* To be replaced by credit_cards_manual UI after table creation */}
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💳</div>
              <p>No cards added yet. Upload to begin.</p>
              <p className="text-sm mt-2">
                Credit card functionality will be available after manual upload migration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDashboard;
