import { useState } from 'react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
}

export default function InputBar({ onSendMessage }: InputBarProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-bar">
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Airo..."
          className="message-input"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="send-button"
        >
          <span className="material-symbols-outlined" data-icon="send">send</span>
        </button>
      </div>
    </form>
  );
} 