import React, { useState } from 'react';
import QuickReplyButtons from './QuickReplyButtons';
import InsightCard from './InsightCard';
import RoastOrHypeButtons from './RoastOrHypeButtons';

const MessageBubble = ({ message, isLast, onRoast, onHype }) => {
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const isBot = message.type === 'assistant';
  const hasInsights =
    message.data?.insights || message.data?.urgentItems || message.data?.suggestions;
  const hasQuickReplies = isBot && isLast;

  const getQuickReplies = () => {
    if (message.isWelcome) {
      return [
        { text: "What's my spending? 💸", query: 'show me my spending this month' },
        { text: 'Any overdue tasks? ⏰', query: 'show me overdue todos' },
        { text: 'Roast my finances 🔥', query: 'roast my financial habits' },
      ];
    }
    if (message.isProactive) {
      return [
        { text: 'Tell me more 👀', query: 'give me more details about these alerts' },
        { text: 'Fix it for me ✨', query: 'help me fix these issues' },
        { text: "I'll handle it 💪", query: 'mark these as acknowledged' },
      ];
    }
    if (hasInsights) {
      return [
        { text: 'More insights 📊', query: 'give me more financial insights' },
        { text: 'What should I do? 🤔', query: 'what actions should I take based on this' },
        { text: 'Show me trends 📈', query: 'show me spending trends and patterns' },
      ];
    }
    // Default quick replies for any bot response
    return [
      { text: 'Tell me more 💬', query: 'tell me more about this' },
      { text: 'What else? 🤔', query: 'what else can you help me with' },
      { text: 'Show summary 📋', query: 'give me a summary of my finances' },
    ];
  };

  return (
    <div className={`flex animate-fade-in ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto'}`}>
        {/* Avatar for bot messages */}
        {isBot && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#5C2E27] flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <div
                className={`p-4 max-w-[80%] rounded-lg shadow-sm border border-[#EAD2C6] ${
                  message.isWelcome
                    ? 'bg-white text-[#331B18]'
                    : message.isProactive
                      ? 'bg-[#C47A65] text-white'
                      : message.isRoast
                        ? 'bg-[#5C2E27] text-white'
                        : message.isHype
                          ? 'bg-[#5C2E27] text-white'
                          : 'bg-white text-[#331B18]'
                }`}
              >
                <div className="whitespace-pre-line text-base font-medium leading-relaxed antialiased">
                  {message.content}
                </div>
                <div className="flex justify-between items-center mt-2 text-xs opacity-80">
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                    {message.isWelcome
                      ? '👋 Welcome'
                      : message.isProactive
                        ? '🔔 Alert'
                        : message.processingMode === 'gemini'
                          ? '🤖 AI'
                          : '🔧 Rule'}
                  </span>
                </div>
              </div>

              {/* Insight Cards */}
              {hasInsights && (
                <div className="mt-3">
                  <InsightCard data={message.data} />
                </div>
              )}

              {/* Roast or Hype Buttons for Welcome Messages */}
              {message.isWelcome && <RoastOrHypeButtons onRoast={onRoast} onHype={onHype} />}

              {/* Quick Reply Buttons */}
              {hasQuickReplies && showQuickReplies && (
                <div className="mt-3">
                  <QuickReplyButtons
                    replies={getQuickReplies()}
                    onReply={query => {
                      setShowQuickReplies(false);
                      // Trigger query
                      const event = new CustomEvent('quickReply', { detail: query });
                      window.dispatchEvent(event);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* User message */}
        {!isBot && (
          <div className="flex items-start space-x-3 justify-end">
            <div className="bg-[#FFFFFF] text-[#331B18] px-4 py-3 rounded-lg shadow-sm max-w-xs border border-[#F4D9CE]">
              <div className="whitespace-pre-line text-base font-normal leading-relaxed antialiased">
                {message.content}
              </div>
              <div className="text-xs text-[#A78A7F] mt-2 text-right">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6F3D32] flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-lg">👤</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
