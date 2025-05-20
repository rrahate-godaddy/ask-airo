interface MessageBubbleProps {
  message: string;
  isUser: boolean;
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'bot'}`}>
      {message}
    </div>
  );
} 