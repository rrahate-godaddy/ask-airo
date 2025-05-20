import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import NSBButton from './NSBButton';
import Canvas from './Canvas';

interface Message {
  text: string;
  sender: 'bot' | 'user';
  actions?: {
    primary?: string;
    secondary?: string;
  };
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([{
    text: "Welcome to APMC! I'm here to help you optimize your marketing strategy.",
    sender: 'bot',
    actions: {
      primary: 'Get Started',
      secondary: 'Learn More'
    }
  }]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    industry: '',
    productsServices: [] as string[],
    market: '',
    primaryPointOfSale: '',
    notifications: {
      sms: {
        enabled: false,
        phone: ''
      },
      email: {
        enabled: false,
        address: ''
      }
    }
  });

  const handleAction = (action: string) => {
    if (action === 'Get Started') {
      setShowCanvas(true);
      setMessages(prev => [...prev, {
        text: "Great! Let's get started with collecting some information about your business.",
        sender: 'bot'
      }]);
    } else if (action === 'Learn More') {
      setMessages(prev => [...prev, {
        text: "APMC helps businesses optimize their marketing strategy using advanced AI and data analytics.",
        sender: 'bot',
        actions: {
          primary: 'Get Started'
        }
      }]);
    }
  };

  const handleSendMessage = (message: string) => {
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    
    // Get the last bot message with buttons
    const lastBotMessageWithButtons = [...messages].reverse().find(msg => 
      msg.sender === 'bot' && msg.actions && (msg.actions.primary || msg.actions.secondary)
    );
    
    // Check if message matches any button action and trigger it
    if (lastBotMessageWithButtons?.actions) {
      const { primary, secondary } = lastBotMessageWithButtons.actions;
      if (primary && primary.toLowerCase() === message.toLowerCase().trim()) {
        handleAction(primary);
        return;
      }
      if (secondary && secondary.toLowerCase() === message.toLowerCase().trim()) {
        handleAction(secondary);
        return;
      }
    }
    
    // Add bot response based on the current state
    if (!formData.businessName) {
      setFormData(prev => ({ ...prev, businessName: message }));
      setMessages(prev => [...prev, {
        text: "Great business name! What's your website URL?",
        sender: 'bot'
      }]);
    } else if (!formData.websiteUrl) {
      setFormData(prev => ({ ...prev, websiteUrl: message }));
      setMessages(prev => [...prev, {
        text: "Perfect! What industry are you in?",
        sender: 'bot'
      }]);
    } else if (!formData.industry) {
      setFormData(prev => ({ ...prev, industry: message }));
      setMessages(prev => [...prev, {
        text: "Now, let's list your products or services. What's your main offering?",
        sender: 'bot'
      }]);
    } else if (formData.productsServices.length === 0) {
      setFormData(prev => ({ 
        ...prev, 
        productsServices: [...prev.productsServices, message]
      }));
      setMessages(prev => [...prev, {
        text: "Would you like to add another product/service? Or type 'done' to continue.",
        sender: 'bot'
      }]);
    } else if (message.toLowerCase() !== 'done') {
      setFormData(prev => ({ 
        ...prev, 
        productsServices: [...prev.productsServices, message]
      }));
      setMessages(prev => [...prev, {
        text: "Got it! Any other products/services? Type 'done' when finished.",
        sender: 'bot'
      }]);
    } else {
      setMessages(prev => [...prev, {
        text: "Great! I have all the information I need. Let me analyze your business profile and suggest some marketing strategies.",
        sender: 'bot'
      }]);
    }
  };

  return (
    <div className="fixed inset-0 flex">
      <div className={`flex-1 flex flex-col ${showCanvas ? 'w-1/2' : 'w-full'} bg-gradient-to-br from-purple-50 via-white to-purple-100 transition-all duration-300`}>
        <div className="message-list h-[calc(100vh-5rem)] overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 max-w-[80%] ${
                  message.sender === 'bot'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white ml-0'
                    : 'bg-white border border-purple-200 ml-auto'
                }`}
              >
                <p>{message.text}</p>
                {message.actions && (
                  <div className="flex justify-end mt-4 space-x-2">
                    {message.actions.secondary && (
                      <NSBButton
                        variant="secondary"
                        onClick={() => handleAction(message.actions.secondary!)}
                      >
                        {message.actions.secondary}
                      </NSBButton>
                    )}
                    {message.actions.primary && (
                      <NSBButton
                        variant="primary"
                        onClick={() => handleAction(message.actions.primary!)}
                      >
                        {message.actions.primary}
                      </NSBButton>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="h-20 shrink-0 p-4 border-t border-purple-100 bg-white">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>
      <AnimatePresence>
        {showCanvas && (
          <Canvas
            formData={formData}
            setFormData={setFormData}
            onClose={() => setShowCanvas(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 