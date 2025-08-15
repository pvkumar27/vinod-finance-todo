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
    <div className={`flex animate-slide-up ${isBot ? 'justify-start' : 'justify-end'} mb-1`}>
      <div className={`max-w-[90%] sm:max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto'}`}>
        {/* Avatar for bot messages */}
        {isBot && (
          <div className="flex items-end space-x-2 justify-start">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#632D1F] to-[#5C2E27] flex items-center justify-center shadow-lg flex-shrink-0 animate-bounce-subtle">
              <span className="text-white text-xs sm:text-base">🤖</span>
            </div>
            <div className="max-w-[85%]">
              <div
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-bl-md shadow-lg transform hover:scale-[1.02] transition-all duration-200 ${
                  message.isWelcome
                    ? 'bg-gradient-to-r from-white to-[#FDF3EE] text-[#331B18] border border-[#EAD2C6]'
                    : message.isProactive
                      ? 'bg-gradient-to-r from-[#A15B49] to-[#8B4513] text-white shadow-[#A15B49]/30'
                      : message.isRoast
                        ? 'bg-gradient-to-r from-[#5C2E27] to-[#632D1F] text-white shadow-[#5C2E27]/30'
                        : message.isHype
                          ? 'bg-gradient-to-r from-[#5C2E27] to-[#632D1F] text-white shadow-[#5C2E27]/30'
                          : 'bg-gradient-to-r from-white to-[#FDF3EE] text-[#331B18] border border-[#EAD2C6]'
                }`}
              >
                <div className="whitespace-pre-line text-sm sm:text-base font-normal leading-snug sm:leading-relaxed antialiased">
                  {message.content}
                </div>
                <div className="flex justify-between items-center mt-1 text-xs opacity-70">
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                    {message.isWelcome
                      ? '👋 Welcome'
                      : message.isProactive
                        ? 'Spotted ⚠️'
                        : message.processingMode === 'gemini'
                          ? '🤖 AI'
                          : message.processingMode === 'learned-pattern'
                            ? '🧠 Learned'
                            : message.processingMode === 'similar-pattern'
                              ? '🔍 Similar'
                              : message.processingMode === 'enhanced-fallback'
                                ? '⚡ Smart'
                                : '🔧 Rule'}
                  </span>
                  <span className="text-[#AAA] text-xs">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
          <div className="flex items-end space-x-2 justify-end ml-auto">
            <div className="bg-gradient-to-r from-[#632D1F] to-[#8B4513] text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-br-md shadow-lg max-w-[85%] transform hover:scale-[1.02] transition-all duration-200">
              <div className="whitespace-pre-line text-sm sm:text-base font-normal leading-snug sm:leading-relaxed antialiased">
                {message.content}
              </div>
              <div className="text-xs text-white/70 mt-1 text-right">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#8B4513] to-[#632D1F] flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-xs sm:text-base">👤</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
