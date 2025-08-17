import SmartDashboard from './SmartDashboard';

const InsightsTab = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="mb-4">
        <h2
          className="finbot-heading-xl finbot-responsive-heading flex items-center"
          data-cy="insights-heading"
        >
          <span className="mr-3 text-2xl">🧠</span>
          Smart Insights
        </h2>
        <p className="finbot-responsive-text text-[#8B4513] mt-1">
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
