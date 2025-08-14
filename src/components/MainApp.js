import React, { useState } from 'react';
import AIAssistant from './AIAssistantEnhanced';
import TabNavigation from './TabNavigation';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4">
              <h1 className="text-2xl font-bold text-gradient text-center">FinTask AI</h1>
              <p className="text-sm text-gray-500 text-center">Your AI money assistant</p>
            </div>
            <div className="flex-1 p-4">
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                {/* Chat Messages Area */}
                <div className="flex-1 bg-white rounded-2xl p-6 mb-4 overflow-y-auto border border-gray-200 shadow-sm">
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                    <p className="text-gray-400">
                      Ask me about your finances, todos, or credit cards!
                    </p>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Ask me anything about your finances..."
                      className="flex-1 input"
                    />
                    <button className="btn-primary px-6">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className="p-4">
            <TabNavigation />
          </div>
        );
      case 'insights':
        return (
          <div className="p-4 text-center">
            <h2 className="text-2xl font-bold text-gradient mb-4">Coming Soon</h2>
            <p className="text-gray-600">AI-powered insights will be available here</p>
          </div>
        );
      default:
        return <AIAssistant />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 pb-16">{renderContent()}</div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'chat' ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-medium">Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'cards' ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">💳</span>
                <span className="text-xs font-medium">Cards</span>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex flex-col items-center space-y-1 ${
                  activeTab === 'insights' ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">📊</span>
                <span className="text-xs font-medium">Insights</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MainApp;
