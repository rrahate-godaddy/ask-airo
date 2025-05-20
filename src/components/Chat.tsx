import { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputBar from './InputBar';
import TypingIndicator from './TypingIndicator';
import responses from '../data/responses.json';
import '../styles/chat.css';

interface Message {
  text: string;
  isUser: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const findResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    const response = responses.find(r => {
      const regex = new RegExp(r.trigger, 'i');
      return regex.test(lowerMessage);
    });
    return response?.reply || "I'm not sure how to respond to that.";
  };

  const handleCanvasCommand = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'open canvas') {
      setShowCanvas(true);
      return true;
    } else if (lowerMessage === 'close canvas') {
      setShowCanvas(false);
      return true;
    }
    return false;
  };

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    
    // Check for canvas commands
    const isCanvasCommand = handleCanvasCommand(message);
    
    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking and typing
    setTimeout(() => {
      if (isCanvasCommand) {
        const response = message.toLowerCase().includes('open') 
          ? "Opening the canvas for you."
          : "Closing the canvas for you.";
        setMessages(prev => [...prev, { text: response, isUser: false }]);
      } else {
        const botResponse = findResponse(message);
        setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
      }
      setIsTyping(false);
    }, Math.random() * 300 + 500);
  };

  return (
    <div className="overlay">
      <div className="chat-container">
        <button className="close-button" aria-label="Close chat">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <ChatHeader />
        <div className="split-container">
          <div className="chat-section">
            <MessageList messages={messages} />
            {isTyping && <TypingIndicator />}
            <InputBar onSendMessage={handleSendMessage} />
          </div>
          {showCanvas && (
            <div className="canvas-section">
              {/* Canvas content will go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 