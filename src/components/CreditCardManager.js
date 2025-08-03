import React from 'react';

// To be replaced by credit_cards_manual UI after table creation
const CreditCardManager = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center">
          <span className="mr-2">💳</span>
          Credit Cards
        </h2>
      </div>

      {/* To be replaced by credit_cards_manual UI after table creation */}
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">💳</div>
        <p className="text-xl font-medium mb-2">No cards added yet. Upload to begin.</p>
        <p className="text-sm">
          Credit card functionality will be available after manual upload migration.
        </p>
      </div>
    </div>
  );
};

export default CreditCardManager;
