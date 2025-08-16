import React from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatContainer = ({ messages, isLoading, messagesEndRef, onRoast, onHype }) => {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 sm:px-4 sm:py-4 sm:space-y-2 -mr-2 pr-2">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          onRoast={onRoast}
          onHype={onHype}
        />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
