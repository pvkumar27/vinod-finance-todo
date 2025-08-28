import SmartDashboard from './SmartDashboard';

const InsightsTab = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
        <h2
          className="text-2xl sm:text-3xl font-bold flex items-center text-gray-900"
          data-cy="insights-heading"
        >
          <span className="mr-3 text-2xl">🧠</span>
          Smart Insights
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          AI-powered financial overview and recommendations
        </p>
      </div>

      {/* Unified Smart Dashboard */}
      <SmartDashboard
        onQueryGenerated={query => {
          window.dispatchEvent(new CustomEvent('aiQuery', { detail: { query } }));
        }}
      />
    </div>
  );
};

export default InsightsTab;
