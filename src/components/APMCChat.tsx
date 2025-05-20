import { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputBar from './InputBar';
import TypingIndicator from './TypingIndicator';
import SaveButton from './SaveButton';
import LoadingOverlay from './LoadingOverlay';
import responses from '../data/responses.json';
import '../styles/chat.css';

interface Message {
  text: string;
  isUser: boolean;
  ctaButtons?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface BusinessDetails {
  business: {
    name: string;
    domain: string;
    categories: string[];
    services?: string[];
    market?: {
      type: string;
      location?: string;
    };
    pointOfSale?: string[];
  };
}

type CanvasContext = 'business-name' | 'industry' | 'services' | 'market' | 'point-of-sale' | null;

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function APMCChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasContext>(null);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    business: {
      name: '',
      domain: '',
      categories: [],
      pointOfSale: ['storefront', 'mobile']
    }
  });

  // Show welcome message on mount
  useEffect(() => {
    const welcomeMessage = "Hi! I'm Airo, your personal marketing consultant. Before I create your plan, I want to make sure I have a good understanding of your business.";
    
    setMessages([{ 
      text: welcomeMessage,
      isUser: false,
      ctaButtons: [
        {
          label: 'Get Started',
          onClick: () => handleGetStarted(),
          variant: 'primary'
        },
        {
          label: 'Learn More',
          onClick: () => handleLearnMore(),
          variant: 'secondary'
        }
      ]
    }]);
  }, []);

  const addBotMessages = async (messages: Message[]) => {
    setIsTyping(true);
    
    // Ensure typing indicator shows for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessages(prev => [...prev, ...messages]);
    setIsTyping(false);
  };

  const handleGetStarted = async () => {
    // Add user message showing their selection
    setMessages(prev => [...prev, { 
      text: "Get Started",
      isUser: true 
    }]);

    // Pre-fill business details
    setBusinessDetails(prev => ({
      ...prev,
      business: {
        ...prev.business,
        name: "Yngwie's Guitars",
        domain: "yngwiesfrets.com",
        categories: ['Music Shop'],
        services: [
          'Guitar repair',
          'Guitar setup',
          'Amp and pedal fix'
        ],
        market: {
          type: 'local',
          location: 'Chicago, IL'
        }
      }
    }));

    // Open canvas with default view
    setShowCanvas(true);
    setCanvasContext(null);

    // Ask to confirm business name
    await addBotMessages([{
      text: "I see from your profile that your business is called 'Yngwie's Guitars'. Is this correct?",
      isUser: false,
      ctaButtons: [
        {
          label: 'Yes, that\'s correct',
          onClick: () => handleBusinessNameConfirmed(),
          variant: 'primary'
        },
        {
          label: 'No, edit name',
          onClick: () => handleBusinessNameEdit(),
          variant: 'secondary'
        }
      ]
    }]);
  };

  const handleBusinessNameConfirmed = async () => {
    setMessages(prev => [...prev, { text: "Yes, that's correct", isUser: true }]);
    // Ask to confirm industry next
    await addBotMessages([{
      text: `Great! I see you're in the ${businessDetails.business.categories[0] || 'Music Shop'} industry. Is this correct?`,
      isUser: false,
      ctaButtons: [
        {
          label: "Yes, that's correct",
          onClick: () => handleIndustryConfirmed(),
          variant: 'primary'
        },
        {
          label: 'No, change industry',
          onClick: () => handleIndustryEdit(),
          variant: 'secondary'
        }
      ]
    }]);
  };

  const handleBusinessNameEdit = async () => {
    setCanvasContext('business-name');
    setMessages(prev => [...prev, { text: "No, edit name", isUser: true }]);
    
    await addBotMessages([{
      text: "No problem! You can either type your business name here in the chat, or use the form on the right to edit it. Both options work the same way.",
      isUser: false
    }]);
  };

  const handleIndustryEdit = async () => {
    setCanvasContext('industry');
    setMessages(prev => [...prev, { text: "No, change industry", isUser: true }]);
    
    await addBotMessages([{
      text: "No problem! You can either type your industry here in the chat, or select it from the dropdown on the right. Feel free to use whichever method you prefer.",
      isUser: false
    }]);
  };

  const handleIndustryConfirmed = async () => {
    setMessages(prev => [...prev, { text: "Yes, that's correct", isUser: true }]);
    // Now confirm services
    await addBotMessages([{
      text: "Great! I can see you offer the following services:\n• Guitar repair\n• Guitar setup\n• Amp and pedal fix\n\nIs this list correct?",
      isUser: false,
      ctaButtons: [
        {
          label: "Yes, that's correct",
          onClick: () => handleServicesConfirmed(),
          variant: 'primary'
        },
        {
          label: 'No, edit services',
          onClick: () => handleServicesEdit(),
          variant: 'secondary'
        }
      ]
    }]);
  };

  const handleServicesEdit = async () => {
    setCanvasContext('services');
    setMessages(prev => [...prev, { text: "No, edit services", isUser: true }]);
    
    await addBotMessages([{
      text: "No problem! You can either type your services here in the chat, or use the form on the right to edit them. Both options work the same way.",
      isUser: false
    }]);
  };

  const handleServicesConfirmed = async () => {
    setMessages(prev => [...prev, { text: "Yes, that's all", isUser: true }]);
    
    await addBotMessages([{
      text: "Perfect! Now, where do you primarily do business?",
      isUser: false,
      ctaButtons: [
        {
          label: 'Confirm Market',
          onClick: () => handleMarketConfirmed(),
          variant: 'primary'
        },
        {
          label: 'Edit Market',
          onClick: () => handleMarketEdit(),
          variant: 'secondary'
        }
      ]
    }]);
  };

  const handleMarketEdit = async () => {
    setCanvasContext('market');
    setMessages(prev => [...prev, { text: "Edit Market", isUser: true }]);
    
    await addBotMessages([{
      text: "No problem! You can edit your market details in the form on the right.",
      isUser: false
    }]);
  };

  const handleMarketConfirmed = async () => {
    setMessages(prev => [...prev, { text: "Confirm Market", isUser: true }]);
    
    await addBotMessages([{
      text: "Great! Now, I see you primarily sell in-person at your storefront and through pop-up markets. Is this correct?",
      isUser: false,
      ctaButtons: [
        {
          label: 'Yes, that\'s correct',
          onClick: () => handlePointOfSaleConfirmed(),
          variant: 'primary'
        },
        {
          label: 'Edit point of sale',
          onClick: () => handlePointOfSaleEdit(),
          variant: 'secondary'
        }
      ]
    }]);
  };

  const handlePointOfSaleConfirmed = async () => {
    setMessages(prev => [...prev, { text: "Confirm", isUser: true }]);
    setShowCanvas(false);
    await addBotMessages([{
      text: "Perfect! I have all the information I need to help you with your marketing strategy.",
      isUser: false
    }]);
  };

  const handlePointOfSaleEdit = () => {
    setCanvasContext('point-of-sale');
    setMessages(prev => [...prev, { text: "Edit point of sale", isUser: true }]);
  };

  const handleLearnMore = async () => {
    setMessages(prev => [...prev, { text: "Learn More", isUser: true }]);
    
    await addBotMessages([{ 
      text: "As your Advanced Marketing Consultant, I can help you:\n\n• Develop effective marketing strategies\n• Analyze your target audience\n• Track campaign performance\n• Optimize your marketing efforts\n\nWould you like to get started now?",
      isUser: false,
      ctaButtons: [
        {
          label: 'Get Started',
          onClick: () => handleGetStarted(),
          variant: 'primary'
        }
      ]
    }]);
  };

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    
    // Listen for edit commands to bring back the canvas and go to the right section
    const editSectionCommands: { keywords: string[]; context: CanvasContext }[] = [
      { keywords: ['edit industry', 'change industry'], context: 'industry' },
      { keywords: ['edit services', 'change services', 'edit products', 'change products'], context: 'services' },
      { keywords: ['edit market', 'change market'], context: 'market' },
      { keywords: ['edit point of sale', 'change point of sale', 'edit sales', 'change sales'], context: 'point-of-sale' },
      { keywords: ['edit business name', 'change business name'], context: 'business-name' },
    ];
    for (const section of editSectionCommands) {
      if (section.keywords.some(cmd => message.toLowerCase().includes(cmd))) {
        setShowCanvas(true);
        setCanvasContext(section.context!);
        setMessages(prev => [...prev, { text: `Opening the ${(section.context || '').replace('-', ' ')} editor for you.`, isUser: false }]);
        return;
      }
    }
    // General business info edit
    const editCommands = [
      'edit business',
      'edit business info',
      'change business',
      'change business info',
      'edit my business',
      'edit my business info',
      'change my business',
      'change my business info'
    ];
    if (editCommands.some(cmd => message.toLowerCase().includes(cmd))) {
      setShowCanvas(true);
      setCanvasContext(null);
      setMessages(prev => [...prev, { text: "Opening the business info editor for you.", isUser: false }]);
      return;
    }
    
    // Get the last bot message with buttons
    const lastBotMessageWithButtons = [...messages].reverse().find(msg => !msg.isUser && msg.ctaButtons && msg.ctaButtons.length > 0);
    
    // Check if message matches any button label and trigger the corresponding action
    if (lastBotMessageWithButtons?.ctaButtons) {
      const matchingButton = lastBotMessageWithButtons.ctaButtons.find(
        button => button.label.toLowerCase() === message.toLowerCase().trim()
      );
      
      if (matchingButton) {
        matchingButton.onClick();
        return;
      }
    }
    
    // Check for canvas commands
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'open canvas') {
      setShowCanvas(true);
      setMessages(prev => [...prev, { 
        text: "Opening the canvas for you.",
        isUser: false 
      }]);
      return;
    } else if (lowerMessage === 'close canvas') {
      setShowCanvas(false);
      setMessages(prev => [...prev, { 
        text: "Closing the canvas for you.",
        isUser: false 
      }]);
      return;
    }

    // Check if we're in business name edit context
    const lastBotMessage = [...messages].reverse().find(msg => !msg.isUser);
    if (lastBotMessage?.text.includes("You can either type your business name here")) {
      // Update business name in state
      setBusinessDetails(prev => ({
        ...prev,
        business: { ...prev.business, name: message }
      }));

      // Show confirmation and proceed to industry confirmation
      await addBotMessages([{
        text: `Thanks! I've updated your business name to '${message}'. Now, I see you're in the Music Shop industry. Is this correct?`,
        isUser: false,
        ctaButtons: [
          {
            label: 'Yes, correct',
            onClick: () => handleIndustryConfirmed(),
            variant: 'primary'
          },
          {
            label: 'No, change industry',
            onClick: () => handleIndustryEdit(),
            variant: 'secondary'
          }
        ]
      }]);
      return;
    }

    // Check if we're in industry edit context
    if (lastBotMessage?.text.includes("You can either type your industry here")) {
      // Update industry in state
      setBusinessDetails(prev => ({
        ...prev,
        business: { ...prev.business, categories: [message] }
      }));

      // Show confirmation and proceed to services
      await addBotMessages([{
        text: `Perfect! I've updated your industry to '${message}'. Now, let's confirm your services.`,
        isUser: false,
        ctaButtons: [
          {
            label: "Yes, that's correct",
            onClick: () => handleServicesConfirmed(),
            variant: 'primary'
          },
          {
            label: 'No, edit services',
            onClick: () => handleServicesEdit(),
            variant: 'secondary'
          }
        ]
      }]);
      return;
    }

    // Handle other business detail collection
    if (!businessDetails.business.name) {
      setBusinessDetails(prev => ({
        ...prev,
        business: { ...prev.business, name: message }
      }));
      await addBotMessages([{
        text: "Great business name! I also see that you're in the Music Shop industry. Is this correct?",
        isUser: false,
        ctaButtons: [
          {
            label: 'Yes, correct',
            onClick: () => handleIndustryConfirmed(),
            variant: 'primary'
          },
          {
            label: 'No, change industry',
            onClick: () => handleIndustryEdit(),
            variant: 'secondary'
          }
        ]
      }]);
    } else if (!businessDetails.business.domain) {
      setBusinessDetails(prev => ({
        ...prev,
        business: { ...prev.business, domain: message }
      }));
      await addBotMessages([{
        text: "Perfect! Last step - please select your business categories in the form on the right.",
        isUser: false
      }]);
    }
  };

  const renderCanvasContent = () => {
    switch (canvasContext) {
      case 'business-name':
        return (
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-6">Business Name</h2>
            <div className="flex gap-2">
              <input
                type="text"
                className="form-input flex-1"
                value={businessDetails.business.name}
                onChange={(e) => setBusinessDetails(prev => ({
                  ...prev,
                  business: { ...prev.business, name: e.target.value }
                }))}
                placeholder="Enter your business name"
              />
            </div>
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={() => setCanvasContext(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <SaveButton
                disabled={businessDetails.business.name === "Yngwie's Guitars"}
                onClick={() => handleBusinessNameConfirmed()}
                label="Save"
              />
            </div>
            {isTyping && <LoadingOverlay />}
          </div>
        );

      case 'industry':
        return (
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-6">Industry</h2>
            <div className="flex gap-2">
              <select
                className="form-select flex-1"
                value={businessDetails.business.categories[0] || ''}
                onChange={(e) => setBusinessDetails(prev => ({
                  ...prev,
                  business: { ...prev.business, categories: [e.target.value] }
                }))}
              >
                <option value="">Select Industry</option>
                <option value="Music Shop">Music Shop</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Food & Beverage">Food & Beverage</option>
              </select>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={() => setCanvasContext(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <SaveButton
                disabled={businessDetails.business.categories[0] === 'Music Shop'}
                onClick={() => handleIndustryConfirmed()}
                label="Save"
              />
            </div>
            {isTyping && <LoadingOverlay />}
          </div>
        );

      case 'services':
        return (
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-6">Products and Services</h2>
            <div className="space-y-2">
              {businessDetails.business.services?.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={service}
                    onChange={(e) => {
                      const newServices = [...(businessDetails.business.services || [])];
                      newServices[index] = e.target.value;
                      setBusinessDetails(prev => ({
                        ...prev,
                        business: { ...prev.business, services: newServices }
                      }));
                    }}
                  />
                  <button
                    onClick={() => {
                      const newServices = businessDetails.business.services?.filter((_, i) => i !== index);
                      setBusinessDetails(prev => ({
                        ...prev,
                        business: { ...prev.business, services: newServices }
                      }));
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Remove service"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newServices = [...(businessDetails.business.services || []), ''];
                  setBusinessDetails(prev => ({
                    ...prev,
                    business: { ...prev.business, services: newServices }
                  }));
                }}
                className="text-sm text-purple-600 hover:text-purple-700 mt-2"
              >
                + Add Service
              </button>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={() => setCanvasContext(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <SaveButton
                onClick={() => handleServicesConfirmed()}
                label="Save"
              />
            </div>
            {isTyping && <LoadingOverlay />}
          </div>
        );

      case 'market':
        return (
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-6">Market</h2>
            <div className="space-y-6">
              <h3 className="text-base text-gray-700">Where do you primarily do business?</h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="market"
                    checked={businessDetails.business.market?.type === 'local'}
                    onChange={() => setBusinessDetails(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        market: { type: 'local', location: prev.business.market?.location || '' }
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Local Business</div>
                    <div className="text-sm text-gray-500">I only serve customers in my town or city</div>
                    {businessDetails.business.market?.type === 'local' && (
                      <input
                        type="text"
                        value={businessDetails.business.market.location}
                        onChange={(e) => setBusinessDetails(prev => ({
                          ...prev,
                          business: {
                            ...prev.business,
                            market: { type: 'local', location: e.target.value }
                          }
                        }))}
                        placeholder="Enter your city, state"
                        className="mt-2 w-full p-2 border rounded"
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="market"
                    checked={businessDetails.business.market?.type === 'regional'}
                    onChange={() => setBusinessDetails(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        market: { type: 'regional' }
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Regional Business</div>
                    <div className="text-sm text-gray-500">I serve customers across nearby cities or states</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="market"
                    checked={businessDetails.business.market?.type === 'national'}
                    onChange={() => setBusinessDetails(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        market: { type: 'national' }
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">National Business</div>
                    <div className="text-sm text-gray-500">I serve customers across the country</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="market"
                    checked={businessDetails.business.market?.type === 'international'}
                    onChange={() => setBusinessDetails(prev => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        market: { type: 'international' }
                      }
                    }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">International Business</div>
                    <div className="text-sm text-gray-500">I serve customers in multiple countries</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={() => setCanvasContext(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
              <SaveButton
                onClick={() => handleMarketConfirmed()}
                label="Save"
              />
            </div>
            {isTyping && <LoadingOverlay />}
          </div>
        );

      case 'point-of-sale':
        return (
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-6">Point of Sale</h2>
            <div className="space-y-4">
              <h3 className="text-base text-gray-700">How do you primarily sell your product?</h3>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDetails.business.pointOfSale?.includes('website')}
                  onChange={(e) => {
                    const newPointOfSale = e.target.checked
                      ? [...(businessDetails.business.pointOfSale || []), 'website']
                      : businessDetails.business.pointOfSale?.filter(pos => pos !== 'website');
                    setBusinessDetails(prev => ({
                      ...prev,
                      business: { ...prev.business, pointOfSale: newPointOfSale }
                    }));
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Website</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDetails.business.pointOfSale?.includes('marketplace')}
                  onChange={(e) => {
                    const newPointOfSale = e.target.checked
                      ? [...(businessDetails.business.pointOfSale || []), 'marketplace']
                      : businessDetails.business.pointOfSale?.filter(pos => pos !== 'marketplace');
                    setBusinessDetails(prev => ({
                      ...prev,
                      business: { ...prev.business, pointOfSale: newPointOfSale }
                    }));
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Online marketplaces (Etsy, eBay, etc.)</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDetails.business.pointOfSale?.includes('storefront')}
                  onChange={(e) => {
                    const newPointOfSale = e.target.checked
                      ? [...(businessDetails.business.pointOfSale || []), 'storefront']
                      : businessDetails.business.pointOfSale?.filter(pos => pos !== 'storefront');
                    setBusinessDetails(prev => ({
                      ...prev,
                      business: { ...prev.business, pointOfSale: newPointOfSale }
                    }));
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">At a storefront or retail space</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDetails.business.pointOfSale?.includes('mobile')}
                  onChange={(e) => {
                    const newPointOfSale = e.target.checked
                      ? [...(businessDetails.business.pointOfSale || []), 'mobile']
                      : businessDetails.business.pointOfSale?.filter(pos => pos !== 'mobile');
                    setBusinessDetails(prev => ({
                      ...prev,
                      business: { ...prev.business, pointOfSale: newPointOfSale }
                    }));
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Mobile business, I sell at pop-ups or markets</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDetails.business.pointOfSale?.includes('phone')}
                  onChange={(e) => {
                    const newPointOfSale = e.target.checked
                      ? [...(businessDetails.business.pointOfSale || []), 'phone']
                      : businessDetails.business.pointOfSale?.filter(pos => pos !== 'phone');
                    setBusinessDetails(prev => ({
                      ...prev,
                      business: { ...prev.business, pointOfSale: newPointOfSale }
                    }));
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Over the phone</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDetails.business.pointOfSale?.includes('other')}
                  onChange={(e) => {
                    const newPointOfSale = e.target.checked
                      ? [...(businessDetails.business.pointOfSale || []), 'other']
                      : businessDetails.business.pointOfSale?.filter(pos => pos !== 'other');
                    setBusinessDetails(prev => ({
                      ...prev,
                      business: { ...prev.business, pointOfSale: newPointOfSale }
                    }));
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Other</div>
                </div>
              </label>
            </div>

            <div className="absolute bottom-6 right-6">
              <SaveButton
                onClick={handlePointOfSaleConfirmed}
                label={canvasContext ? "Save" : "Confirm"}
                disabled={false}
              />
            </div>
            
            {isTyping && <LoadingOverlay />}
          </div>
        );

      default:
        return (
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-8">Your Business Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Business Name</h3>
                  <p className="text-sm text-gray-500">{businessDetails.business.name}</p>
                </div>
                <button 
                  onClick={handleBusinessNameEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit business name"
                >
                  <EditIcon />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-1">Website URL</h3>
                <p className="text-sm text-gray-500">{businessDetails.business.domain}</p>
              </div>
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Industry</h3>
                  <p className="text-sm text-gray-500">{businessDetails.business.categories[0] || 'Not set'}</p>
                </div>
                <button 
                  onClick={handleIndustryEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit industry"
                >
                  <EditIcon />
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Products and Services</h3>
                  <div className="space-y-1">
                    {businessDetails.business.services?.map((service, index) => (
                      <p key={index} className="text-sm text-gray-500">{service}</p>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleServicesEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit services"
                >
                  <EditIcon />
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Market</h3>
                  <p className="text-sm text-gray-500">
                    {businessDetails.business.market?.type === 'local' 
                      ? `Local Business - ${businessDetails.business.market.location}`
                      : businessDetails.business.market?.type === 'regional'
                      ? 'Regional Business'
                      : businessDetails.business.market?.type === 'national'
                      ? 'National Business'
                      : 'International Business'}
                  </p>
                </div>
                <button 
                  onClick={handleMarketEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit market"
                >
                  <EditIcon />
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Point of Sale</h3>
                  <div className="space-y-1">
                    {businessDetails.business.pointOfSale?.includes('storefront') && (
                      <p className="text-sm text-gray-500">At a storefront or retail space</p>
                    )}
                    {businessDetails.business.pointOfSale?.includes('mobile') && (
                      <p className="text-sm text-gray-500">Mobile business, pop-ups or markets</p>
                    )}
                    {businessDetails.business.pointOfSale?.includes('website') && (
                      <p className="text-sm text-gray-500">Website</p>
                    )}
                    {businessDetails.business.pointOfSale?.includes('marketplace') && (
                      <p className="text-sm text-gray-500">Online marketplaces</p>
                    )}
                    {businessDetails.business.pointOfSale?.includes('phone') && (
                      <p className="text-sm text-gray-500">Over the phone</p>
                    )}
                    {businessDetails.business.pointOfSale?.includes('other') && (
                      <p className="text-sm text-gray-500">Other</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handlePointOfSaleEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit point of sale"
                >
                  <EditIcon />
                </button>
              </div>
            </div>

            <div className="absolute bottom-6 right-6">
              <SaveButton
                onClick={handlePointOfSaleConfirmed}
                label={canvasContext ? "Save" : "Confirm"}
                disabled={false}
              />
            </div>
            
            {isTyping && <LoadingOverlay />}
          </div>
        );
    }
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
        <div className={`split-container ${showCanvas ? 'with-canvas' : ''}`}>
          <div className="chat-section">
            <MessageList messages={messages} />
            {isTyping && <TypingIndicator />}
            <InputBar onSendMessage={handleSendMessage} />
          </div>
          {showCanvas && (
            <div className="canvas-section">
              {renderCanvasContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 