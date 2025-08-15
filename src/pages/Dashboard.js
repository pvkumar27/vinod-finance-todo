import React from 'react';
import ProactiveDashboard from '../components/ProactiveDashboard';
import VisualInsights from '../components/VisualInsights';
import AIAssistant from '../components/AIAssistantEnhanced';

const Dashboard = () => {
  const handleProactiveAction = action => {
    // Trigger AI assistant with the action
    // Dispatch custom event to trigger AI query
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('aiQuery', { detail: { query: action } }));
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* AI-First Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold finbot-text-gradient mb-4">FinTask AI Dashboard</h1>
        <p className="text-gray-300 text-lg">Your AI-powered finance assistant is here to help</p>
        <div className="flex justify-center items-center space-x-2 mt-3">
          <div className="w-2 h-2 bg-green-500 rounded-full finbot-animate-pulse"></div>
          <span className="text-sm text-gray-400">AI Assistant Active</span>
        </div>
      </div>

      {/* Proactive Insights - Main Feature */}
      <div className="finbot-card overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white p-6">
          <h2 className="text-3xl font-bold flex items-center">
            🤖 AI Insights
            <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full finbot-animate-pulse">
              Live
            </span>
          </h2>
          <p className="text-purple-100 mt-2 text-lg">
            Personalized recommendations based on your data
          </p>
        </div>
        <ProactiveDashboard onActionClick={handleProactiveAction} />
      </div>

      {/* Visual Analytics */}
      <div className="finbot-card overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-6">
          <h2 className="text-3xl font-bold flex items-center">
            📊 Visual Analytics
            <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full finbot-animate-pulse">
              AI Generated
            </span>
          </h2>
          <p className="text-green-100 mt-2 text-lg">
            Dynamic charts and insights from your financial data
          </p>
        </div>
        <div className="p-6">
          <VisualInsights type="overview" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="finbot-card p-6 hover:transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">AI Assistant</h3>
              <p className="text-gray-300">Ready to help</p>
            </div>
            <div className="text-4xl finbot-animate-float">🤖</div>
          </div>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent('aiQuery', { detail: { query: 'Hi FinBot!' } }))
            }
            className="finbot-button-primary w-full"
          >
            Ask FinBot
          </button>
        </div>

        <div className="finbot-card p-6 hover:transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Insights</h3>
              <p className="text-gray-300">AI-powered analysis</p>
            </div>
            <div className="text-4xl finbot-animate-float" style={{ animationDelay: '0.5s' }}>
              💡
            </div>
          </div>
          <button
            onClick={() => handleProactiveAction('give me financial insights')}
            className="finbot-button-primary w-full"
          >
            Get Insights
          </button>
        </div>

        <div className="finbot-card p-6 hover:transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Priority Focus</h3>
              <p className="text-gray-300">What needs attention</p>
            </div>
            <div className="text-4xl finbot-animate-float" style={{ animationDelay: '1s' }}>
              🎯
            </div>
          </div>
          <button
            onClick={() => handleProactiveAction('what needs my attention today?')}
            className="finbot-button-primary w-full"
          >
            Check Priority
          </button>
        </div>
      </div>

      {/* AI Assistant - Always Available */}
      <AIAssistant />
    </div>
  );
};

export default Dashboard;
