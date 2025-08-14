import React, { useState } from 'react';
import ProactiveDashboard from '../components/ProactiveDashboard';
import VisualInsights from '../components/VisualInsights';
import AIAssistant from '../components/AIAssistant';

const Dashboard = () => {
  const [aiExpanded, setAiExpanded] = useState(false);

  const handleProactiveAction = action => {
    // Trigger AI assistant with the action
    setAiExpanded(true);
    // Dispatch custom event to trigger AI query
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('aiQuery', { detail: { query: action } }));
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* AI-First Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          FinTask AI Dashboard
        </h1>
        <p className="text-gray-600">Your AI-powered finance assistant is here to help</p>
      </div>

      {/* Proactive Insights - Main Feature */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center">
            🤖 AI Insights
            <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">Live</span>
          </h2>
          <p className="text-blue-100 mt-1">Personalized recommendations based on your data</p>
        </div>
        <ProactiveDashboard onActionClick={handleProactiveAction} />
      </div>

      {/* Visual Analytics */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center">
            📊 Visual Analytics
            <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">AI Generated</span>
          </h2>
          <p className="text-green-100 mt-1">
            Dynamic charts and insights from your financial data
          </p>
        </div>
        <div className="p-6">
          <VisualInsights type="overview" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">AI Assistant</h3>
              <p className="text-sm text-gray-600">Ready to help</p>
            </div>
            <div className="text-3xl">🤖</div>
          </div>
          <button
            onClick={() => setAiExpanded(true)}
            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            Ask FinBot
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Smart Insights</h3>
              <p className="text-sm text-gray-600">AI-powered analysis</p>
            </div>
            <div className="text-3xl">💡</div>
          </div>
          <button
            onClick={() => handleProactiveAction('give me financial insights')}
            className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-colors font-medium"
          >
            Get Insights
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Priority Focus</h3>
              <p className="text-sm text-gray-600">What needs attention</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
          <button
            onClick={() => handleProactiveAction('what needs my attention today?')}
            className="mt-4 w-full bg-purple-500 text-white py-2 px-4 rounded-xl hover:bg-purple-600 transition-colors font-medium"
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
