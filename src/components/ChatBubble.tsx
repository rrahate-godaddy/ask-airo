import React from 'react';

interface CTAButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ChatBubbleProps {
  text: string;
  isUser: boolean;
  ctaButtons?: CTAButton[];
}

export default function ChatBubble({ text, isUser, ctaButtons }: ChatBubbleProps) {
  // Check if the text contains HTML
  const containsHTML = text.includes('<') && text.includes('>');
  
  return (
    <div className="chat-bubble-wrapper">
      <div className={`message-bubble ${isUser ? 'user' : 'bot'}`}>
        {containsHTML ? (
          <div dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
          text
        )}
      </div>
      {!isUser && ctaButtons && ctaButtons.length > 0 && (
        <div className="nsb-buttons">
          {ctaButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className="nsb-button"
              data-action={button.label.toLowerCase()}
              data-variant={button.variant || 'primary'}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 