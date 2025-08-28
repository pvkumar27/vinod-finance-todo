import SmartDashboard from './SmartDashboard';
import AppleWalletCard from './ui/AppleWalletCard';

const InsightsTab = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <AppleWalletCard className="aw-fade-in">
        <h2 className="aw-heading-xl flex items-center" data-cy="insights-heading">
          <span className="mr-3 text-2xl">🧠</span>
          Smart Insights
        </h2>
        <p className="aw-text-body mt-2">AI-powered financial overview and recommendations</p>
      </AppleWalletCard>

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
