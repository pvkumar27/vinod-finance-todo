import React from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatContainer = ({ messages, isLoading, messagesEndRef, onRoast, onHype }) => {
  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
      style={{ height: 'calc(100vh - 200px)', paddingBottom: '2rem' }}
    >
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
