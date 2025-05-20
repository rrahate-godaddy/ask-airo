import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

interface Message {
  text: string;
  isUser: boolean;
  ctaButtons?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list h-[calc(100vh-250px)] max-h-[calc(100vh-250px)] overflow-y-auto p-6" role="log" aria-live="polite">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            text={message.text}
            isUser={message.isUser}
            ctaButtons={message.ctaButtons}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 