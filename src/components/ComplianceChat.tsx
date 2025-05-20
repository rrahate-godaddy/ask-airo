import { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputBar from './InputBar';
import TypingIndicator from './TypingIndicator';
import responses from '../data/responses.json';
import '../styles/chat.css';
import LoadingOverlay from './LoadingOverlay';

interface Message {
  text: string;
  isUser: boolean;
  ctaButtons?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

// Add interface to track compliance responses
interface ComplianceResponse {
  question: string;
  answer: string;
  timestamp: Date;
  field?: string;
}

export default function ComplianceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState<'privacy' | 'terms' | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: "Yngwie's Guitars",
    email: "info@yngwiesfrets.com",
    jurisdiction: "Illinois",
    coppaCompliance: false
  });
  const [isCanvasLoading, setIsCanvasLoading] = useState(false);
  const [currentEditField, setCurrentEditField] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPrivacyPolicyGenerated, setIsPrivacyPolicyGenerated] = useState(false);
  const [canvasAnimating, setCanvasAnimating] = useState(false);
  // Array to store all compliance-related responses
  const [complianceResponses, setComplianceResponses] = useState<ComplianceResponse[]>([]);
  // State to toggle compliance data view
  const [showComplianceData, setShowComplianceData] = useState(false);
  
  // Add function to capture compliance responses
  const captureComplianceResponse = (question: string, answer: string, field?: string) => {
    const newResponse: ComplianceResponse = {
      question,
      answer,
      timestamp: new Date(),
      field
    };
    
    const updatedResponses = [...complianceResponses, newResponse];
    setComplianceResponses(updatedResponses);
    
    // Store responses in localStorage for persistence
    try {
      localStorage.setItem('complianceResponses', JSON.stringify(updatedResponses));
    } catch (error) {
      console.error('Error saving compliance responses to localStorage:', error);
    }
    
    // For debugging - log compliance responses
    console.log('Compliance response captured:', newResponse);
    console.log('All compliance responses:', updatedResponses);
  };

  // Load saved compliance responses from localStorage on component mount
  useEffect(() => {
    try {
      const savedResponses = localStorage.getItem('complianceResponses');
      if (savedResponses) {
        // Parse the saved responses, ensuring dates are correctly converted back to Date objects
        const parsedResponses = JSON.parse(savedResponses, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
        setComplianceResponses(parsedResponses);
        console.log('Loaded saved compliance responses:', parsedResponses);
      }
    } catch (error) {
      console.error('Error loading compliance responses from localStorage:', error);
    }
  }, []);

  // Function to generate policy text using saved compliance responses
  const generatePrivacyPolicy = () => {
    // Get the most recent responses for each field
    const getLatestResponse = (field: string) => {
      const fieldResponses = complianceResponses.filter(r => r.field === field);
      if (fieldResponses.length === 0) return null;
      
      return fieldResponses.reduce((latest, current) => {
        return current.timestamp > latest.timestamp ? current : latest;
      });
    };
    
    // Use either the captured response or the default value
    const businessName = getLatestResponse('name')?.answer || businessInfo.name;
    const businessEmail = getLatestResponse('email')?.answer || businessInfo.email;
    const jurisdiction = getLatestResponse('jurisdiction')?.answer || businessInfo.jurisdiction;
    
    // Get COPPA compliance status
    const coppaCompliance = businessInfo.coppaCompliance;
    
    // Record policy generation as a compliance action
    captureComplianceResponse(
      "Privacy Policy generated",
      `Generated for ${businessName} in ${jurisdiction} with COPPA: ${coppaCompliance}`,
      "policy_generation"
    );
    
    console.log(`Generating policy with: Name=${businessName}, Email=${businessEmail}, Jurisdiction=${jurisdiction}, COPPA=${coppaCompliance}`);
    
    return {
      businessName: businessName || "Your Business",
      businessEmail: businessEmail || "contact@yourbusiness.com",
      jurisdiction: jurisdiction || "Your Jurisdiction",
      coppaCompliance,
      generationDate: new Date().toLocaleDateString()
    };
  };

  // Add useEffect to keep canvas state consistent
  useEffect(() => {
    // This ensures that when isPrivacyPolicyGenerated is true, the canvas is visible
    if (isPrivacyPolicyGenerated && !showCanvas) {
      console.log("Privacy policy is generated but canvas is not visible - fixing this");
      setShowCanvas(true);
    }
    
    // This ensures that when the canvas is visible but there's no content to show, we show the default form
    if (showCanvas && !isPrivacyPolicyGenerated && !isCanvasLoading && !currentEditField) {
      console.log("Canvas is visible but has no content to display - ensuring proper state");
      // No need to change state since the default canvas view will be shown
    }
  }, [isPrivacyPolicyGenerated, showCanvas, isCanvasLoading, currentEditField]);

  // Add a specific useEffect to ensure canvas visibility during policy generation
  useEffect(() => {
    if (isPrivacyPolicyGenerated) {
      console.log("Privacy policy generated, ensuring canvas is visible");
      setShowCanvas(true);
    }
  }, [isPrivacyPolicyGenerated]);

  // Show welcome messages on component mount
  useEffect(() => {
    const welcomeMessage = responses.find(r => r.trigger === 'COMPLIANCE_WELCOME')?.reply || '';
    
    if (welcomeMessage) {
      setMessages([{ 
        text: welcomeMessage, 
        isUser: false,
        ctaButtons: [
          {
            label: 'Terms of Service',
            onClick: () => handleTermsButtonClick(),
            variant: 'secondary'
          },
          {
            label: 'Privacy Policy',
            onClick: () => handlePrivacyButtonClick(),
            variant: 'secondary'
          },
          {
            label: 'Why do I need these?',
            onClick: () => handleWhyButtonClick(),
            variant: 'secondary'
          }
        ] 
      }]);
    }
  }, []);

  const handleTermsButtonClick = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Terms of Service", isUser: true, ctaButtons: undefined }]);
    
    // Capture the compliance query for Terms of Service
    captureComplianceResponse(
      "Terms of Service requested",
      "User selected Terms of Service option",
      "terms_request"
    );
    
    setShowSidePanel(true);
    setSidePanelContent('terms');
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "I can help you create a Terms of Service agreement for your business. This document outlines the rules and guidelines for using your website or service.", 
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // After a brief pause, show the form options
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: "Let's gather some information about your business to create customized Terms of Service. Please provide the following details:",
            isUser: false,
            ctaButtons: [
              {
                label: 'Use Existing Info',
                onClick: () => handleUseExistingInfoForTerms(),
                variant: 'primary'
              },
              {
                label: 'Start Fresh',
                onClick: () => handleStartFreshForTerms(),
                variant: 'secondary'
              }
            ]
          }]);
        }, 800);
      }, 1200);
    }, 1000);
  };

  // Add new functions for Terms of Service flow
  const handleUseExistingInfoForTerms = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Use Existing Info", isUser: true, ctaButtons: undefined }]);
    
    // Capture using existing info for terms
    captureComplianceResponse(
      "Use existing business info for Terms of Service",
      "Confirmed",
      "terms_use_existing_info"
    );
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: `I'll create Terms of Service for ${businessInfo.name} based on the information you've already provided.`,
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // Show the form with existing info in the side panel
      updateTermsForm(businessInfo.name, "", "");
      
      // After a brief pause, ask for website URL
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: "What is your website URL? This will be included in the Terms of Service. You can enter it in the form panel, or type your response below.",
            isUser: false,
            ctaButtons: undefined
          }]);
        }, 800);
      }, 1200);
    }, 1000);
  };
  
  const handleStartFreshForTerms = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Start Fresh", isUser: true, ctaButtons: undefined }]);
    
    // Capture starting fresh for terms
    captureComplianceResponse(
      "Start fresh for Terms of Service",
      "Confirmed",
      "terms_start_fresh"
    );
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Let's create Terms of Service from scratch. What is your business name? You can enter it in the form panel, or type your response below.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }, 1000);
  };
  
  // Function to update the terms form in the side panel
  const updateTermsForm = (name: string, website: string, services: string) => {
    const companyNameInput = document.querySelector('.terms-form input[placeholder="Company Name"]') as HTMLInputElement;
    const websiteInput = document.querySelector('.terms-form input[placeholder="Website URL"]') as HTMLInputElement;
    const servicesTextarea = document.querySelector('.terms-form textarea') as HTMLTextAreaElement;
    
    if (companyNameInput) companyNameInput.value = name;
    if (websiteInput) websiteInput.value = website;
    if (servicesTextarea) servicesTextarea.value = services;
  };
  
  const handlePrivacyButtonClick = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Privacy Policy", isUser: true, ctaButtons: undefined }]);
    
    // Capture the privacy policy request
    captureComplianceResponse(
      "Privacy Policy requested",
      "User selected Privacy Policy option",
      "privacy_request"
    );
    
    // Reset privacy policy generation flag
    setIsPrivacyPolicyGenerated(false);
    
    // Set active step to 0 (initial)
    setActiveStep(0);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Send first message
    setTimeout(() => {
      setIsTyping(false);
      // First response about working together
      setMessages(prev => [...prev, { 
        text: "Let's work together on your Privacy Policy.",
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // Show typing indicator immediately after first message
      setIsTyping(true);
        
      // After a brief pause, show the confirmation message with buttons
      // And also show the canvas at the same time
      setTimeout(() => {
        setIsTyping(false);
        // Show canvas now with animation
        setCanvasAnimating(true);
        setShowCanvas(true);
        setIsCanvasLoading(false);
        
        // After animation completes, reset animation flag
        setTimeout(() => {
          setCanvasAnimating(false);
        }, 500); // Match this to your CSS transition duration
        
        setMessages(prev => [...prev, {
          text: "Please confirm if the information shown on the right is correct",
          isUser: false,
          ctaButtons: [
            {
              label: 'Confirm',
              onClick: () => handleInitialConfirm(),
              variant: 'primary'
            },
            {
              label: 'Edit',
              onClick: () => handleInitialEdit(),
              variant: 'secondary'
            }
          ]
        }]);
      }, 1000);
    }, 1000);
  };

  // Handler for editing more information
  const handleEditMoreInfo = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Edit Information", isUser: true, ctaButtons: undefined }]);
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "What information would you like to edit?",
        isUser: false,
        ctaButtons: [
          {
            label: 'Business Info',
            onClick: () => handleEditBusinessInfo(),
            variant: 'secondary'
          },
          {
            label: 'COPPA Compliance',
            onClick: () => askAboutServingChildren(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 800);
  };

  // Handler for editing business info
  const handleEditBusinessInfo = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Business Info", isUser: true, ctaButtons: undefined }]);
    
    // Go back to business info edit step
    handleInitialEdit();
  };

  // Function to update both chat and canvas UI after business info changes
  const updateUIAfterBusinessInfoChange = (field: string, value: string) => {
    // Update businessInfo state
    setBusinessInfo(prev => ({...prev, [field]: value}));
    
    // Capture the response
    captureComplianceResponse(
      `Updated ${field}`,
      value,
      field
    );
    
    // Show confirmation message in chat
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const confirmationMessage = field === 'jurisdiction' 
        ? `Thank you! I've updated your business jurisdiction to "${value}".`
        : `Thank you! I've set your business ${field} to "${value}".`;
      
      setMessages(prev => [...prev, { 
        text: confirmationMessage,
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // Clear current edit field if it's set to this field
      if (currentEditField === field) {
        setCurrentEditField(null);
      }
      
      // Proceed to next step based on the field
      setTimeout(() => {
        if (field === 'name') {
          confirmEmail();
        } else if (field === 'email') {
          askJurisdiction();
        } else if (field === 'jurisdiction') {
          // After jurisdiction is updated, ask about COPPA compliance
          askAboutServingChildren();
        }
      }, 800);
    }, 800);
  };

  const handleInitialConfirm = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user confirmation
    setMessages(prev => [...prev, { text: "Confirm", isUser: true, ctaButtons: undefined }]);
    
    // Capture the confirmation action
    captureComplianceResponse(
      "Privacy policy information confirmed",
      `Name: ${businessInfo.name}, Email: ${businessInfo.email}, Jurisdiction: ${businessInfo.jurisdiction}, COPPA: ${businessInfo.coppaCompliance}`,
      "policy_confirm"
    );
    
    // Reset states in the right order
    setCurrentEditField(null);  // Clear any edit fields
    setIsPrivacyPolicyGenerated(false);  // Reset generation state
    
    // Explicitly ensure canvas is visible
    setShowCanvas(true);
    
    // Now show loading state
    setIsCanvasLoading(true);
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Great! I'm generating your Privacy Policy now...",
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // After a brief delay, show the static policy content
      setTimeout(() => {
        // Update states in the right order
        setIsCanvasLoading(false);
        setIsPrivacyPolicyGenerated(true);
        
        // After policy is displayed in canvas, offer options in chat
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
              text: "Your Privacy Policy is ready! You can view it on the right, and download, copy, or email it using the buttons provided.",
              isUser: false,
              ctaButtons: [
                {
                  label: 'Edit Something Else',
                  onClick: () => handleEditMoreInfo(),
                  variant: 'secondary'
                }
              ]
            }]);
          }, 800);
        }, 500);
      }, 2000);
    }, 500);
  };

  const handleInitialEdit = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user edit request
    setMessages(prev => [...prev, { text: "Edit", isUser: true, ctaButtons: undefined }]);
    
    // Set the active step and current edit field
    setActiveStep(1);
    setCurrentEditField('name');
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: `Is your business name "${businessInfo.name}"?`,
        isUser: false,
        ctaButtons: [
          {
            label: 'Confirm',
            onClick: () => handleBusinessNameConfirmed(),
            variant: 'primary'
          },
          {
            label: 'Edit',
            onClick: () => handleBusinessNameEdit(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 500);
  };

  const handleBusinessNameConfirmed = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user confirmation
    setMessages(prev => [...prev, { text: "Confirm", isUser: true, ctaButtons: undefined }]);
    
    // Move to next step - email confirmation
    confirmEmail();
  };

  const handleBusinessNameEdit = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user edit request
    setMessages(prev => [...prev, { text: "Edit", isUser: true, ctaButtons: undefined }]);
    
    // Set current edit field for canvas display
    setCurrentEditField('name');
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Please update your business name in the form on the right, or type your response below.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }, 500);
  };

  const confirmEmail = () => {
    setActiveStep(2);
    // Set current edit field to 'email' to show the email edit form in the canvas
    setCurrentEditField('email');
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: `Is your business email "${businessInfo.email}"?`,
        isUser: false,
        ctaButtons: [
          {
            label: 'Confirm',
            onClick: () => handleEmailConfirmed(),
            variant: 'primary'
          },
          {
            label: 'Edit',
            onClick: () => handleEmailEdit(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 500);
  };

  const handleEmailConfirmed = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user confirmation
    setMessages(prev => [...prev, { text: "Confirm", isUser: true, ctaButtons: undefined }]);
    
    // Move to next step - jurisdiction question
    askJurisdiction();
  };

  const handleEmailEdit = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user edit request
    setMessages(prev => [...prev, { text: "Edit", isUser: true, ctaButtons: undefined }]);
    
    // Set current edit field for canvas display
    setCurrentEditField('email');
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Please update your business email in the form on the right, or type your response below.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }, 500);
  };

  const askJurisdiction = () => {
    setActiveStep(3);
    // Set current edit field to 'jurisdiction' to show the jurisdiction edit form in the canvas
    setCurrentEditField('jurisdiction');
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: `Confirm that your business's legal jurisdiction is ${businessInfo.jurisdiction}? This is the state where you primarily do business. You can update this in the form on the right, or type your response below.`,
        isUser: false,
        ctaButtons: [
          {
            label: 'Confirm',
            onClick: () => handleJurisdictionConfirmed(),
            variant: 'primary'
          },
          {
            label: 'Edit',
            onClick: () => handleJurisdictionEdit(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 500);
  };
  
  // Add handlers for jurisdiction confirmation/edit
  const handleJurisdictionConfirmed = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user confirmation
    setMessages(prev => [...prev, { text: "Confirm", isUser: true, ctaButtons: undefined }]);
    
    // Capture the confirmation
    captureComplianceResponse(
      "Confirmed jurisdiction",
      businessInfo.jurisdiction,
      "jurisdiction"
    );
    
    // Move to next step - COPPA questions
    askAboutServingChildren();
  };
  
  const handleJurisdictionEdit = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user edit request
    setMessages(prev => [...prev, { text: "Edit", isUser: true, ctaButtons: undefined }]);
    
    // Keep current edit field as 'jurisdiction'
    // Canvas should already be showing the jurisdiction edit form
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Please update your business jurisdiction in the form on the right, or type your response below.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }, 500);
  };

  const handleFieldSave = () => {
    // Remove NSBs and add AI acknowledgment on save
    setMessages(prev => {
      // Filter out any messages with NSBs
      const filteredMessages = prev.map(msg => ({...msg, ctaButtons: undefined}));
      
      // Add the user's input as a message if it's not already the last user message
      const lastMessage = filteredMessages[filteredMessages.length - 1];
      let updatedMessages = filteredMessages;
      
      // Add AI acknowledgment
      let confirmationMessage = '';
      if (currentEditField === 'name') {
        confirmationMessage = `Updated business name to "${businessInfo.name}"`;
      } else if (currentEditField === 'email') {
        confirmationMessage = `Updated business email to "${businessInfo.email}"`;
      } else if (currentEditField === 'jurisdiction') {
        confirmationMessage = `Updated jurisdiction to "${businessInfo.jurisdiction}"`;
      }
      
      updatedMessages.push({
        text: confirmationMessage,
        isUser: false,
        ctaButtons: undefined
      });
      
      return updatedMessages;
    });
    
    // Capture the field update explicitly
    if (currentEditField) {
      let fieldValue = "";
      if (currentEditField === 'name') {
        fieldValue = businessInfo.name;
      } else if (currentEditField === 'email') {
        fieldValue = businessInfo.email;
      } else if (currentEditField === 'jurisdiction') {
        fieldValue = businessInfo.jurisdiction;
      }
      
      captureComplianceResponse(
        `Updated ${currentEditField}`,
        fieldValue,
        currentEditField
      );
    }
    
    // Store the field we just edited
    const justEditedField = currentEditField;
    
    // Clear the current edit field
    setCurrentEditField(null);
    
    // Proceed to next step
    if (justEditedField === 'name') { // Business name step
      confirmEmail();
    } else if (justEditedField === 'email') { // Email step
      askJurisdiction();
    } else if (justEditedField === 'jurisdiction') { // Jurisdiction step
      // Proceed to COPPA question after jurisdiction is filled
      askAboutServingChildren();
    }
  };

  const handleFieldCancel = () => {
    setCurrentEditField(null);
    
    if (activeStep === 1) {
      handleInitialEdit();
    } else if (activeStep === 2) {
      confirmEmail();
    }
  };

  const handleWhyButtonClick = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Why do I need these?", isUser: true, ctaButtons: undefined }]);
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: `<div class="compliance-explanation">
          <p class="font-regular text-gray-800 mb-4">Small businesses should have a Privacy Policy and Terms of Use on their website to build trust, ensure legal compliance, and protect their operations.<br /><br /></p>
          
          <div class="mb-3">
            <p class="font-semibold text-gray-800 mb-1">Privacy Policy</p>
            <p class="text-gray-700">A Privacy Policy informs visitors about how their data is collected, used, and protected—helping the business comply with applicable privacy laws.</p>
          </div>
          
          <div class="mb-3">
            <p class="font-semibold text-gray-800 mb-1">Terms of Use</p>
            <p class="text-gray-700">Terms of Use set the rules for how users can interact with the site, limit the business's liability, and protect intellectual property.</p>
          </div>
          
          <p class="font-regular text-gray-800 mt-4">Together, these documents create a clear legal framework that safeguards both the business and its customers.</p>
        </div>`, 
        isUser: false,
        ctaButtons: [
          {
            label: 'Terms of Service',
            onClick: () => handleTermsButtonClick(),
            variant: 'secondary'
          },
          {
            label: 'Privacy Policy',
            onClick: () => handlePrivacyButtonClick(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 1000);
  };

  const isComplianceQuery = (message: string): { isCompliance: boolean; type: 'privacy' | 'terms' | null } => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('privacy') || lowerMessage.includes('privacy policy')) {
      return { isCompliance: true, type: 'privacy' };
    }
    if (lowerMessage.includes('terms') || lowerMessage.includes('terms of use')) {
      return { isCompliance: true, type: 'terms' };
    }
    return { isCompliance: false, type: null };
  };

  // New helper function to detect and process COPPA-related responses
  const processCoppaResponse = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check if this is a direct yes/no response to COPPA questions
    if (["yes", "y", "yeah", "yep", "correct", "true"].includes(lowerMessage)) {
      // Handle as "Yes" to COPPA compliance
      handleCoppaComplianceResponse(true);
      return true;
    } else if (["no", "n", "nope", "false", "incorrect"].includes(lowerMessage)) {
      // Handle as "No" to COPPA compliance
      handleCoppaComplianceResponse(false);
      return true;
    }
    
    return false;
  };
  
  // Update isTextInputContext to include COPPA-related contexts
  const isTextInputContext = (lastMessage: Message | undefined): boolean => {
    if (!lastMessage) return false;
    
    const text = lastMessage.text.toLowerCase();
    
    // Return true if we're explicitly requesting information
    return (
      // Business info contexts
      text.includes("please update your business name") || 
      text.includes("what is your business name") ||
      text.includes("please update your business email") ||
      text.includes("what is your business email") ||
      text.includes("please update your business jurisdiction") ||
      text.includes("what jurisdiction") ||
      text.includes("where is your business located") ||
      
      // COPPA compliance contexts
      text.includes("does your business primarily serve children") ||
      text.includes("do you need to comply with the children's online privacy protection act") ||
      text.includes("coppa compliance") ||
      
      // Terms of Service contexts
      text.includes("what is your website url") ||
      text.includes("could you please describe the services") ||
      text.includes("what services does your business provide") ||
      text.includes("let's create terms of service from scratch") ||
      
      // Confirmation contexts where input should be taken literally
      text.includes("i've set your business name to") ||
      text.includes("i've updated your business name to") ||
      text.includes("i've set your business email to") ||
      text.includes("i've updated your business email to") ||
      text.includes("i've updated your business jurisdiction to") ||
      text.includes("i've set your business jurisdiction to") ||
      text.includes("thanks! i've set your business name to") ||
      text.includes("thanks! i've added") ||
      text.includes("thank you! i've updated your business") ||
      text.includes("thank you! i've set your business") ||
      text.includes("thank you! i've set your business coppaCompliance to")
    );
  };

  // New function to determine field type from message context
  const getFieldTypeFromContext = (lastMessage: Message | undefined): string | null => {
    if (!lastMessage) return null;
    
    const text = lastMessage.text.toLowerCase();
    
    if (text.includes("business name") || text.includes("company name")) {
      return 'name';
    } else if (text.includes("business email") || text.includes("contact email")) {
      return 'email';
    } else if (text.includes("jurisdiction") || text.includes("where is your business located")) {
      return 'jurisdiction';
    } else if (text.includes("website url") || text.includes("your website")) {
      return 'website';
    } else if (text.includes("services") || text.includes("what does your business provide")) {
      return 'services';
    }
    
    return null;
  };

  const handleCanvasCommand = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'open canvas') {
      setShowCanvas(true);
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Opening the canvas for you.",
          isUser: false,
          ctaButtons: undefined 
        }]);
        setIsTyping(false);
      }, 500);
      return true;
    } else if (lowerMessage === 'close canvas') {
      setShowCanvas(false);
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Closing the canvas for you.",
          isUser: false,
          ctaButtons: undefined
        }]);
        setIsTyping(false);
      }, 500);
      return true;
    }
    return false;
  };

  const findResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    const response = responses.find(r => {
      const regex = new RegExp(r.trigger, 'i');
      return regex.test(lowerMessage);
    });
    return response?.reply || "I'm not sure how to respond to that.";
  };

  const handleEmailConfirmation = (isConfirmed: boolean) => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    
    const response = isConfirmed 
      ? "Great! Your email is confirmed."
      : "Please provide your correct email address.";
    setMessages(prev => [...prev, { text: response, isUser: false, ctaButtons: undefined }]);
  };

  // Add a function to handle "Edit More" for Terms
  const handleEditMoreTerms = () => {
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "What would you like to edit?",
        isUser: false,
        ctaButtons: [
          {
            label: 'Business Name',
            onClick: () => handleEditTermsField('name'),
            variant: 'secondary'
          },
          {
            label: 'Website URL',
            onClick: () => handleEditTermsField('website'),
            variant: 'secondary'
          },
          {
            label: 'Services',
            onClick: () => handleEditTermsField('services'),
            variant: 'secondary'
          }
        ]
      }]);
    }, 800);
  };
     
  // Function to handle editing specific fields in Terms
  const handleEditTermsField = (field: string) => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
       
    // Add user selection as a message
    const fieldLabel = field === 'name' ? 'Business Name' : field === 'website' ? 'Website URL' : 'Services';
    setMessages(prev => [...prev, { text: fieldLabel, isUser: true, ctaButtons: undefined }]);
       
    // Show form if not already visible
    if (!showSidePanel) {
      setShowSidePanel(true);
      setSidePanelContent('terms');
    }
       
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: `Please update the ${fieldLabel.toLowerCase()} in the form panel, or type your response below.`,
        isUser: false,
        ctaButtons: undefined
      }]);
    }, 800);
  };

  // New helper function to find and click edit buttons in the most recent message with buttons
  const findAndClickEditButton = (): boolean => {
    // Get the last bot message with buttons
    const lastBotMessageWithButtons = [...messages].reverse().find(msg => !msg.isUser && msg.ctaButtons && msg.ctaButtons.length > 0);
    
    if (lastBotMessageWithButtons?.ctaButtons) {
      // Look for edit buttons with common edit-related labels
      const editButton = lastBotMessageWithButtons.ctaButtons.find(
        button => {
          const label = button.label.toLowerCase();
          return label === 'edit' || 
                 label.includes('edit') || 
                 label === 'change' || 
                 label.includes('change') || 
                 label === 'modify' || 
                 label.includes('modify') || 
                 label === 'update' || 
                 label.includes('update') ||
                 label === 'edit information' ||
                 label === 'edit more info' ||
                 label === 'edit more';
        }
      );
      
      if (editButton) {
        // Capture the edit action
        captureComplianceResponse(
          "Edit requested via text input",
          "edit",
          "text_edit_command"
        );
        
        // Click the edit button
        editButton.onClick();
        return true;
      }
    }
    
    return false;
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true, ctaButtons: undefined }]);
    
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase().trim();
    
    // Get the last bot message for context
    const lastMessage = [...messages].reverse().find(msg => !msg.isUser);
    
    // Check for edit commands first - prioritize these over other processing
    // If the message is simply "edit", "change", or a similar edit command
    if (["edit", "change", "modify", "update"].includes(lowerMessage) || 
        lowerMessage === "edit information" || 
        lowerMessage === "edit more" || 
        lowerMessage === "edit more info") {
      
      // Try to find and click an edit button in the last message
      if (findAndClickEditButton()) {
        return;
      }
      
      // If we can't find an edit button but we're in an editable context, provide edit options
      if (lastMessage) {
        const textLower = lastMessage.text.toLowerCase();
        
        // Check if current message is about business info
        if (textLower.includes("business name") || textLower.includes("company name")) {
          handleBusinessNameEdit();
          return;
        } else if (textLower.includes("business email") || textLower.includes("email address")) {
          handleEmailEdit();
          return;
        } else if (textLower.includes("jurisdiction") || textLower.includes("where your business")) {
          handleJurisdictionEdit();
          return;
        } else if (textLower.includes("coppa") || textLower.includes("children")) {
          askAboutServingChildren();
          return;
        } else if (textLower.includes("privacy policy") || (textLower.includes("information") && textLower.includes("right"))) {
          handleEditMoreInfo();
          return;
        } else if (textLower.includes("terms of service") || textLower.includes("terms of use")) {
          handleEditMoreTerms();
          return;
        }
      }
    }
    
    // Special check for COPPA-related questions
    if (lastMessage && 
        (lastMessage.text.includes("Does your business primarily serve children") ||
         lastMessage.text.includes("Do you still need to comply with the Children's Online Privacy Protection Act") ||
         lastMessage.text.includes("COPPA"))) {
      
      // Try to process as COPPA response first
      if (processCoppaResponse(message)) {
        return;
      }
    }
    
    // Check if we're responding to a confirmation of setting COPPA
    if (lastMessage && lastMessage.text.includes("I've set your business coppaCompliance to")) {
      // Checking if user is following up with a COPPA-related request
      if (lowerMessage.includes("coppa") || 
          lowerMessage.includes("compliance") || 
          lowerMessage.includes("children")) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: "Would you like to adjust your COPPA compliance setting?",
            isUser: false,
            ctaButtons: [
              {
                label: 'Yes, Serves Children',
                onClick: () => handleCoppaComplianceResponse(true),
                variant: 'secondary'
              },
              {
                label: 'No, Does Not Serve Children',
                onClick: () => handleCoppaComplianceResponse(false),
                variant: 'secondary'
              },
              {
                label: 'Continue with Current Setting',
                onClick: () => proceedAfterCoppa(),
                variant: 'primary'
              }
            ]
          }]);
        }, 800);
        return;
      }
    }
    
    // First check if we're in a text input context where button-matching should be skipped
    if (isTextInputContext(lastMessage)) {
      // Determine what field we're updating based on the context
      const fieldType = getFieldTypeFromContext(lastMessage);
      
      if (fieldType === 'name') {
        updateUIAfterBusinessInfoChange('name', message);
        return;
      } else if (fieldType === 'email') {
        updateUIAfterBusinessInfoChange('email', message);
        return;
      } else if (fieldType === 'jurisdiction') {
        updateUIAfterBusinessInfoChange('jurisdiction', message);
        return;
      } else if (fieldType === 'website' && showSidePanel && sidePanelContent === 'terms') {
        // Handle website URL input for Terms of Service
        captureComplianceResponse(
          "Terms - Website URL",
          message,
          "terms_website_url"
        );
        
        // Update the form with the website URL
        const companyNameInput = document.querySelector('.terms-form input[placeholder="Company Name"]') as HTMLInputElement;
        if (companyNameInput) {
          updateTermsForm(companyNameInput.value || businessInfo.name, message, "");
        } else {
          updateTermsForm(businessInfo.name, message, "");
        }
        
        // Show typing indicator
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: `Thanks! I've added "${message}" as your website URL. Could you please describe the services your business provides?`,
            isUser: false,
            ctaButtons: undefined
          }]);
        }, 800);
        return;
      } else if (fieldType === 'services' && showSidePanel && sidePanelContent === 'terms') {
        // Handle services description input for Terms of Service
        captureComplianceResponse(
          "Terms - Services Description",
          message,
          "terms_services_desc"
        );
        
        // Update the form with the services description
        const companyNameInput = document.querySelector('.terms-form input[placeholder="Company Name"]') as HTMLInputElement;
        const websiteInput = document.querySelector('.terms-form input[placeholder="Website URL"]') as HTMLInputElement;
        
        if (companyNameInput && websiteInput) {
          updateTermsForm(
            companyNameInput.value || businessInfo.name,
            websiteInput.value || "",
            message
          );
        }
        
        // Show typing indicator
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: "Thank you for providing your services description. Would you like to generate your Terms of Service now?",
            isUser: false,
            ctaButtons: [
              {
                label: 'Generate Terms',
                onClick: () => handleGenerateTermsOfService(),
                variant: 'primary'
              },
              {
                label: 'Edit More',
                onClick: () => handleEditMoreTerms(),
                variant: 'secondary'
              }
            ]
          }]);
        }, 800);
        return;
      } else if (lastMessage && lastMessage.text.includes("Let's create Terms of Service from scratch")) {
        // Special case for starting fresh with Terms of Service
        captureComplianceResponse(
          "Terms - Company Name",
          message,
          "terms_company_name"
        );
        
        // Update the form
        updateTermsForm(
          message,
          "",
          ""
        );
        
        // Show typing indicator
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: `Thanks! I've set your business name to "${message}". What is your website URL? You can enter it in the form panel, or type your response below.`,
            isUser: false,
            ctaButtons: undefined
          }]);
        }, 800);
        return;
      } else if (lastMessage && (
          lastMessage.text.includes("I've set your business name to") ||
          lastMessage.text.includes("I've updated your business name to") ||
          lastMessage.text.includes("I've set your business email to") ||
          lastMessage.text.includes("I've updated your business email to") ||
          lastMessage.text.includes("I've updated your business jurisdiction to") ||
          lastMessage.text.includes("I've set your business jurisdiction to") ||
          lastMessage.text.includes("Thanks! I've set your business name to") ||
          lastMessage.text.includes("Thanks! I've added") ||
          lastMessage.text.includes("Thank you! I've set your business coppaCompliance to")
      )) {
        // The user is responding to a confirmation of setting a field
        // Provide options for the next step
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: "Is there anything else you'd like to update with your business information?",
            isUser: false,
            ctaButtons: [
              {
                label: 'Continue',
                onClick: () => handleInitialConfirm(),
                variant: 'primary'
              },
              {
                label: 'Edit More Info',
                onClick: () => handleEditMoreInfo(),
                variant: 'secondary'
              }
            ]
          }]);
        }, 800);
        return;
      }
    }

    // Check if this is a form field response
    if (currentEditField) {
      // User is responding to a specific field edit
      updateUIAfterBusinessInfoChange(currentEditField, message);
      return;
    }
    
    // Process Terms of Service specific responses (keeping this for compatibility)
    if (showSidePanel && sidePanelContent === 'terms') {
      // If asking about website URL
      if (lastMessage?.text.includes("What is your website URL")) {
        // Capture the website URL
        captureComplianceResponse(
          "Terms - Website URL",
          message,
          "terms_website_url"
        );
        
        // Update the form with the website URL
        const companyNameInput = document.querySelector('.terms-form input[placeholder="Company Name"]') as HTMLInputElement;
        if (companyNameInput) {
          updateTermsForm(companyNameInput.value || businessInfo.name, message, "");
        } else {
          updateTermsForm(businessInfo.name, message, "");
        }
        
        // Show typing indicator
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: `Thanks! I've added "${message}" as your website URL. Could you please describe the services your business provides?`,
            isUser: false,
            ctaButtons: undefined
          }]);
        }, 800);
        return;
      }
    }

    // Get the last bot message with buttons (for matching logic)
    const lastBotMessageWithButtons = [...messages].reverse().find(msg => !msg.isUser && msg.ctaButtons && msg.ctaButtons.length > 0);
    
    // Check if we're in a context where button matching should be applied
    // Only match buttons if we're not in a text input context
    if (lastBotMessageWithButtons?.ctaButtons && !isTextInputContext(lastMessage)) {
      const matchingButton = lastBotMessageWithButtons.ctaButtons.find(
        button => button.label.toLowerCase() === lowerMessage
      );
      
      // If no exact match, try a case-insensitive partial match
      if (!matchingButton) {
        const partialMatchButton = lastBotMessageWithButtons.ctaButtons.find(
          button => {
            // Check if the user message is a substantial part of the button label (case insensitive)
            // or if the button label is a substantial part of the user message
            const buttonText = button.label.toLowerCase();
            return buttonText.includes(lowerMessage) || lowerMessage.includes(buttonText);
          }
        );
        
        if (partialMatchButton) {
          // Capture the response when user types something similar to a button label
          captureComplianceResponse(
            lastBotMessageWithButtons.text,
            message,
            "button_response_partial_match"
          );
          partialMatchButton.onClick();
          return;
        }
      } else {
        // Exact match found
        captureComplianceResponse(
          lastBotMessageWithButtons.text,
          message,
          "button_response_exact_match"
        );
        matchingButton.onClick();
        return;
      }
      
      // Special handling for simple yes/no/confirm/edit responses to jurisdictions and other prompts
      if ((lastBotMessageWithButtons.text.includes("Confirm that your business's legal jurisdiction is") || 
           lastBotMessageWithButtons.text.includes("confirm if the information shown") ||
           lastBotMessageWithButtons.text.includes("Does your business primarily serve children")) && 
          !isTextInputContext(lastMessage)) {
        
        // Handle jurisdiction confirmation responses
        if (["yes", "confirm", "correct", "ok", "right", "good", "sure"].includes(lowerMessage)) {
          const confirmButton = lastBotMessageWithButtons.ctaButtons.find(
            button => button.label.toLowerCase() === "confirm" || button.label.toLowerCase() === "yes"
          );
          if (confirmButton) {
            captureComplianceResponse(
              "Confirmed via text input",
              message,
              "text_confirmation"
            );
            confirmButton.onClick();
            return;
          }
        } else if (["no", "edit", "change", "update", "wrong", "incorrect"].includes(lowerMessage)) {
          const editButton = lastBotMessageWithButtons.ctaButtons.find(
            button => button.label.toLowerCase() === "edit" || button.label.toLowerCase() === "no"
          );
          if (editButton) {
            captureComplianceResponse(
              "Edit requested via text input",
              message,
              "text_edit_request"
            );
            editButton.onClick();
            return;
          }
        } else if (lastBotMessageWithButtons.text.includes("jurisdiction") && 
                   lowerMessage !== businessInfo.jurisdiction.toLowerCase()) {
          // User likely provided a new jurisdiction
          updateUIAfterBusinessInfoChange('jurisdiction', message);
          return;
        }
      }
      
      // Handle yes/no responses for other prompts with confirmation buttons
      if (lastBotMessageWithButtons.ctaButtons.some(btn => 
            ["yes", "no", "confirm", "edit", "generate policy", "edit information", 
             "generate terms", "edit more"].includes(btn.label.toLowerCase())
          ) && !isTextInputContext(lastMessage)) {
            
        if (["yes", "confirm", "correct", "ok", "right", "good", "sure", "continue", "proceed"].includes(lowerMessage)) {
          const yesButton = lastBotMessageWithButtons.ctaButtons.find(
            button => ["yes", "confirm", "continue", "generate policy", "generate terms"].includes(button.label.toLowerCase())
          );
          if (yesButton) {
            captureComplianceResponse(
              "Confirmed yes via text input",
              message,
              "text_yes_confirmation"
            );
            yesButton.onClick();
            return;
          }
        } else if (["no", "edit", "change", "update", "wrong", "incorrect", "modify"].includes(lowerMessage)) {
          const noButton = lastBotMessageWithButtons.ctaButtons.find(
            button => ["no", "edit", "edit information", "edit more"].includes(button.label.toLowerCase())
          );
          if (noButton) {
            captureComplianceResponse(
              "Confirmed no via text input",
              message,
              "text_no_confirmation"
            );
            noButton.onClick();
            return;
          }
        } else if (lowerMessage.includes("generate") || lowerMessage.includes("create") || 
                  lowerMessage.includes("make") || lowerMessage.includes("build")) {
          // Handle generation requests
          const generateButton = lastBotMessageWithButtons.ctaButtons.find(
            button => button.label.toLowerCase().includes("generate")
          );
          if (generateButton) {
            captureComplianceResponse(
              "Generate requested via text input",
              message,
              "text_generate_request"
            );
            generateButton.onClick();
            return;
          }
        } else if (lowerMessage.includes("edit") || lowerMessage.includes("change") || 
                  lowerMessage.includes("update") || lowerMessage.includes("modify")) {
          // Handle edit requests
          const editButton = lastBotMessageWithButtons.ctaButtons.find(
            button => button.label.toLowerCase().includes("edit")
          );
          if (editButton) {
            captureComplianceResponse(
              "Edit requested via text input",
              message,
              "text_edit_request"
            );
            editButton.onClick();
            return;
          }
        }
      }
    }
    
    // Check for canvas commands 
    const isCanvasCommand = handleCanvasCommand(message);
    if (isCanvasCommand) {
      return;
    }
    
    // Check if it's a compliance query
    const { isCompliance, type } = isComplianceQuery(message);
    if (isCompliance) {
      // Capture the compliance query
      captureComplianceResponse(
        "Compliance document requested",
        message,
        type || "general_compliance"
      );
      
      if (type === 'privacy') {
        handlePrivacyButtonClick();
      } else if (type === 'terms') {
        handleTermsButtonClick();
      }
      return;
    }

    // For any other message, check if it's potentially compliance-related
    if (message.toLowerCase().includes('compliance') || 
        message.toLowerCase().includes('legal') || 
        message.toLowerCase().includes('regulation') ||
        message.toLowerCase().includes('gdpr') ||
        message.toLowerCase().includes('ccpa') ||
        message.toLowerCase().includes('cookie') ||
        message.toLowerCase().includes('consent')) {
      
      captureComplianceResponse(
        "General compliance query",
        message,
        "other_compliance"
      );
    }

    // Show typing indicator for other messages
    setIsTyping(true);

    // Simulate bot thinking and typing
    setTimeout(() => {
      if (message.toLowerCase().includes('email')) {
        // Example of using CTA buttons for email confirmation
        setMessages(prev => [...prev, {
          text: "Please confirm your email is 'test@test.com'",
          isUser: false,
          ctaButtons: [
            {
              label: 'Yes',
              onClick: () => handleEmailConfirmation(true)
            },
            {
              label: 'No',
              onClick: () => handleEmailConfirmation(false)
            }
          ]
        }]);
      } else {
        const botResponse = findResponse(message);
        setMessages(prev => [...prev, { 
          text: botResponse, 
          isUser: false,
          ctaButtons: undefined
        }]);
      }
      setIsTyping(false);
    }, Math.random() * 300 + 500);
  };

  const renderSidePanel = () => {
    if (!showSidePanel) return null;

    return (
      <div className="side-panel">
        <h2>{sidePanelContent === 'privacy' ? 'Privacy Policy Generator' : 'Terms of Use Generator'}</h2>
        <div className="generator-form">
          {/* Add form fields based on the type */}
          {sidePanelContent === 'privacy' ? (
            <div className="privacy-form">
              <input type="text" placeholder="Company Name" className="form-input" />
              <input type="text" placeholder="Website URL" className="form-input" />
              <textarea placeholder="Data Collection Description" className="form-textarea" />
              <button 
                className="generate-button"
                onClick={() => handleFormPrivacyPolicySubmission()}
              >
                Generate Privacy Policy
              </button>
            </div>
          ) : (
            <div className="terms-form">
              <input 
                type="text" 
                placeholder="Company Name" 
                className="form-input"
                onChange={(e) => captureComplianceResponse("Terms - Company Name", e.target.value, "terms_company_name")}
              />
              <input 
                type="text" 
                placeholder="Website URL" 
                className="form-input"
                onChange={(e) => captureComplianceResponse("Terms - Website URL", e.target.value, "terms_website_url")}
              />
              <textarea 
                placeholder="Services Description" 
                className="form-textarea"
                onChange={(e) => captureComplianceResponse("Terms - Services Description", e.target.value, "terms_services_desc")}
              />
              <button 
                className="generate-button"
                onClick={() => handleGenerateTermsOfService()}
              >
                Generate Terms of Use
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCanvas = () => {
    if (!showCanvas) return null;

    try {
      // Show loading state
      if (isCanvasLoading) {
        return (
          <div className="canvas-section">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Generating Privacy Policy</h2>
              <LoadingOverlay />
            </div>
          </div>
        );
      }

      // Show generated privacy policy
      if (isPrivacyPolicyGenerated) {
        try {
          const coppaStatus = businessInfo.coppaCompliance;
          // Instead of generating a policy, we'll just display static text
          return (
            <div className="canvas-section">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Generated Privacy Policy</h2>
                <div className="overflow-auto bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-medium mb-2">Sample Privacy Policy</h3>
                  <p className="mb-3">Last updated: {new Date().toLocaleDateString()}</p>
                  
                  <p className="mb-3">This is a placeholder text for a privacy policy. The actual generation functionality has been replaced with this static content.</p>
                  
                  <h4 className="text-md font-medium mb-2">Information We Collect</h4>
                  <p className="mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
                  
                  {/* Conditionally include COPPA section based on state */}
                  {coppaStatus && (
                    <>
                      <h4 className="text-md font-medium mb-2">Children's Privacy (COPPA Compliance)</h4>
                      <p className="mb-3">This site is directed to children under 13. In compliance with COPPA, we obtain parental consent before collecting personal information from children under 13.</p>
                    </>
                  )}
                  
                  <h4 className="text-md font-medium mb-2">How We Use Your Information</h4>
                  <p className="mb-3">Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p>
                  
                  <h4 className="text-md font-medium mb-2">Sharing Your Information</h4>
                  <p className="mb-3">Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas sed diam eget risus varius blandit sit amet non magna.</p>
                  
                  <h4 className="text-md font-medium mb-2">Contact Information</h4>
                  <p className="mb-3">For questions about this privacy policy or our data practices, please contact us at: {businessInfo.email}</p>
                  
                  <h4 className="text-md font-medium mb-2">Legal Jurisdiction</h4>
                  <p className="mb-3">This privacy policy is governed by the laws of {businessInfo.jurisdiction}.</p>
                  
                  <p className="mt-6 text-gray-500 text-sm">This is a simplified template. For a complete privacy policy, please consult with a legal professional.</p>
                </div>
                
                <div className="mt-6 mb-0 flex gap-3 justify-end">
                  <button 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors"
                  >
                    Download
                  </button>
                  <button 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors"
                  >
                    Copy
                  </button>
                  <button 
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors"
                  >
                    Email
                  </button>
                </div>
              </div>
            </div>
          );
        } catch (error) {
          console.error("Error rendering privacy policy:", error);
          // If there's an error, fall through to the default view
          setIsPrivacyPolicyGenerated(false);
        }
      }

      // Show edit form for specific field if in edit mode
      if (currentEditField) {
        let fieldLabel = "";
        let fieldValue = "";
        let fieldPlaceholder = "";
        
        if (currentEditField === 'name') {
          fieldLabel = "Business Name";
          fieldValue = businessInfo.name;
          fieldPlaceholder = "Enter your business name";
        } else if (currentEditField === 'email') {
          fieldLabel = "Business Email";
          fieldValue = businessInfo.email;
          fieldPlaceholder = "Enter your business email";
        } else if (currentEditField === 'jurisdiction') {
          fieldLabel = "Jurisdiction";
          fieldValue = businessInfo.jurisdiction;
          fieldPlaceholder = "Illinois";
        } else if (currentEditField === 'coppaCompliance') {
          // Special case for COPPA compliance which is a boolean
          return (
            <div className="canvas-section">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">COPPA Compliance Information</h2>
                
                <div className="space-y-6 overflow-auto">
                  <div>
                    <p className="block text-gray-700 mb-4">
                      The Children's Online Privacy Protection Act (COPPA) applies to websites and services directed to children under 13 years of age, and to general audience websites or online services with actual knowledge that they are collecting, using, or disclosing personal information from children under 13.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded mb-6">
                      <h3 className="text-lg font-medium mb-2">Current Status:</h3>
                      <p className="text-md mb-2">Does your business primarily serve children under 13?</p>
                      <p className="text-sm text-gray-500 mb-4">{businessInfo.coppaCompliance ? 'Yes' : 'No'}</p>
                      
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            handleServesChildrenResponse(true);
                            // Update UI to show selected status immediately
                            setBusinessInfo(prev => ({...prev, coppaCompliance: true}));
                          }}
                          className={`text-left px-4 py-2 rounded border ${businessInfo.coppaCompliance ? 'bg-purple-100 border-purple-500' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                        >
                          Yes, we primarily serve children under 13
                        </button>
                        <button
                          onClick={() => {
                            handleServesChildrenResponse(false);
                            // Update UI to show selected status immediately
                            setBusinessInfo(prev => ({...prev, coppaCompliance: false}));
                          }}
                          className={`text-left px-4 py-2 rounded border ${!businessInfo.coppaCompliance ? 'bg-purple-100 border-purple-500' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                        >
                          No, we do not primarily serve children under 13
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 mb-0 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setCurrentEditField(null);
                      proceedAfterCoppa();
                    }}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="canvas-section">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Edit {fieldLabel}</h2>
              
              <div className="space-y-6 overflow-auto">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">{fieldLabel}</label>
                  <input
                    type={currentEditField === 'email' ? 'email' : 'text'}
                    className="form-input w-full"
                    value={fieldValue}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (currentEditField === 'name') {
                        setBusinessInfo(prev => ({...prev, name: newValue}));
                      } else if (currentEditField === 'email') {
                        setBusinessInfo(prev => ({...prev, email: newValue}));
                      } else if (currentEditField === 'jurisdiction') {
                        setBusinessInfo(prev => ({...prev, jurisdiction: newValue}));
                      }
                    }}
                    placeholder={fieldPlaceholder}
                  />
                </div>
              </div>
              
              <div className="mt-6 mb-0 flex gap-3 justify-end">
                <button
                  onClick={handleFieldCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFieldSave}
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Default: Show the main form as a summary with edit buttons
      return (
        <div className="canvas-section">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-8">Privacy Policy Information</h2>
            
            <div className="space-y-4 overflow-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Business Name</h3>
                  <p className="text-sm text-gray-500">{businessInfo.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentEditField('name');
                    setActiveStep(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit business name"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Business Email</h3>
                  <p className="text-sm text-gray-500">{businessInfo.email}</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentEditField('email');
                    setActiveStep(2);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit business email"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">Jurisdiction</h3>
                  <p className="text-sm text-gray-500">{businessInfo.jurisdiction}</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentEditField('jurisdiction');
                    setActiveStep(3);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit jurisdiction"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-1">COPPA Compliance Needed</h3>
                  <p className="text-sm text-gray-500">{businessInfo.coppaCompliance ? 'Yes' : 'No'}</p>
                </div>
                <button 
                  onClick={() => askAboutServingChildren()}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Edit COPPA compliance"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-6 mb-0 flex justify-end">
              <button
                onClick={handleInitialConfirm}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error in renderCanvas:", error);
      // Fallback view in case of rendering errors
      return (
        <div className="canvas-section">
          <div className="p-6 h-full relative">
            <h2 className="text-xl font-semibold mb-6">Privacy Policy Information</h2>
            <p>There was an error displaying this content. Please try again.</p>
            <button
              onClick={() => {
                setIsPrivacyPolicyGenerated(false);
                setIsCanvasLoading(false);
                setCurrentEditField(null);
              }}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors mt-4"
            >
              Reset View
            </button>
          </div>
        </div>
      );
    }
  };

  // Add utility functions for privacy policy actions
  const downloadPrivacyPolicy = (policyData: any) => {
    try {
      // Create the policy text
      let policyText = `PRIVACY POLICY FOR ${policyData.businessName.toUpperCase()}
Last updated: ${policyData.generationDate}

This Privacy Policy describes how ${policyData.businessName} ("we", "us", or "our") collects, uses, and discloses your personal information when you visit our website or use our services.

INFORMATION WE COLLECT
We collect personal information that you provide directly to us, such as your name, email address, and contact information when you contact us or sign up for our services.`;

      // Add COPPA section if applicable
      if (policyData.coppaCompliance) {
        policyText += `

CHILDREN'S PRIVACY
Our services are directed to children under the age of 13. In compliance with the Children's Online Privacy Protection Act (COPPA), we obtain verifiable parental consent before collecting or using any personal information from children under 13. We collect limited personal information from children necessary for participation in our activities. Parents or guardians can review their child's information, have it deleted, and refuse further collection by contacting us at ${policyData.businessEmail}.`;
      }

      policyText += `

HOW WE USE YOUR INFORMATION
We use your information to provide and improve our services, communicate with you, and comply with our legal obligations.

CONTACT INFORMATION
For questions about this privacy policy or our data practices, please contact us at: ${policyData.businessEmail}

LEGAL JURISDICTION
This privacy policy is governed by the laws of ${policyData.jurisdiction}.

This is a simplified template. For a complete privacy policy, please consult with a legal professional.`;
      
      // Create a Blob object
      const blob = new Blob([policyText], { type: 'text/plain' });
      
      // Create an object URL from the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy_policy_${policyData.businessName.replace(/\s+/g, '_').toLowerCase()}.txt`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Record the download action
      captureComplianceResponse(
        "Privacy Policy downloaded",
        `Downloaded for ${policyData.businessName}`,
        "policy_download"
      );
      
      // Show confirmation in chat
      setMessages(prev => [...prev, { 
        text: "Privacy Policy downloaded successfully.",
        isUser: false,
        ctaButtons: undefined
      }]);
    } catch (error) {
      console.error('Error downloading privacy policy:', error);
      setMessages(prev => [...prev, { 
        text: "There was an error downloading the Privacy Policy. Please try again.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }
  };
  
  const copyPrivacyPolicy = (policyData: any) => {
    try {
      // Create the policy text
      let policyText = `PRIVACY POLICY FOR ${policyData.businessName.toUpperCase()}
Last updated: ${policyData.generationDate}

This Privacy Policy describes how ${policyData.businessName} ("we", "us", or "our") collects, uses, and discloses your personal information when you visit our website or use our services.

INFORMATION WE COLLECT
We collect personal information that you provide directly to us, such as your name, email address, and contact information when you contact us or sign up for our services.`;

      // Add COPPA section if applicable
      if (policyData.coppaCompliance) {
        policyText += `

CHILDREN'S PRIVACY
Our services are directed to children under the age of 13. In compliance with the Children's Online Privacy Protection Act (COPPA), we obtain verifiable parental consent before collecting or using any personal information from children under 13. We collect limited personal information from children necessary for participation in our activities. Parents or guardians can review their child's information, have it deleted, and refuse further collection by contacting us at ${policyData.businessEmail}.`;
      }

      policyText += `

HOW WE USE YOUR INFORMATION
We use your information to provide and improve our services, communicate with you, and comply with our legal obligations.

CONTACT INFORMATION
For questions about this privacy policy or our data practices, please contact us at: ${policyData.businessEmail}

LEGAL JURISDICTION
This privacy policy is governed by the laws of ${policyData.jurisdiction}.

This is a simplified template. For a complete privacy policy, please consult with a legal professional.`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(policyText);
      
      // Record the copy action
      captureComplianceResponse(
        "Privacy Policy copied",
        `Copied for ${policyData.businessName}`,
        "policy_copy"
      );
      
      // Show confirmation in chat
      setMessages(prev => [...prev, { 
        text: "Privacy Policy copied to clipboard.",
        isUser: false,
        ctaButtons: undefined
      }]);
    } catch (error) {
      console.error('Error copying privacy policy:', error);
      setMessages(prev => [...prev, { 
        text: "There was an error copying the Privacy Policy. Please try again.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }
  };
  
  const emailPrivacyPolicy = (policyData: any) => {
    try {
      // Create email subject and body
      const subject = `Privacy Policy for ${policyData.businessName}`;
      
      // Create the policy text
      let body = `PRIVACY POLICY FOR ${policyData.businessName.toUpperCase()}
Last updated: ${policyData.generationDate}

This Privacy Policy describes how ${policyData.businessName} ("we", "us", or "our") collects, uses, and discloses your personal information when you visit our website or use our services.

INFORMATION WE COLLECT
We collect personal information that you provide directly to us, such as your name, email address, and contact information when you contact us or sign up for our services.`;

      // Add COPPA section if applicable
      if (policyData.coppaCompliance) {
        body += `

CHILDREN'S PRIVACY
Our services are directed to children under the age of 13. In compliance with the Children's Online Privacy Protection Act (COPPA), we obtain verifiable parental consent before collecting or using any personal information from children under 13. We collect limited personal information from children necessary for participation in our activities. Parents or guardians can review their child's information, have it deleted, and refuse further collection by contacting us at ${policyData.businessEmail}.`;
      }

      body += `

HOW WE USE YOUR INFORMATION
We use your information to provide and improve our services, communicate with you, and comply with our legal obligations.

CONTACT INFORMATION
For questions about this privacy policy or our data practices, please contact us at: ${policyData.businessEmail}

LEGAL JURISDICTION
This privacy policy is governed by the laws of ${policyData.jurisdiction}.

This is a simplified template. For a complete privacy policy, please consult with a legal professional.`;
      
      // Create mailto URL
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open default email client
      window.location.href = mailtoUrl;
      
      // Record the email action
      captureComplianceResponse(
        "Privacy Policy emailed",
        `Emailed for ${policyData.businessName}`,
        "policy_email"
      );
      
      // Show confirmation in chat
      setMessages(prev => [...prev, { 
        text: "Opening your email client to share the Privacy Policy.",
        isUser: false,
        ctaButtons: undefined
      }]);
    } catch (error) {
      console.error('Error emailing privacy policy:', error);
      setMessages(prev => [...prev, { 
        text: "There was an error emailing the Privacy Policy. Please try again.",
        isUser: false,
        ctaButtons: undefined
      }]);
    }
  };

  // Function to ask about serving children under 13
  const askAboutServingChildren = () => {
    // Set active step to 4 for COPPA questions
    setActiveStep(4);
    
    // Set current edit field to 'coppaCompliance' to show in canvas
    setCurrentEditField('coppaCompliance');
    
    // Ensure canvas is visible
    setShowCanvas(true);
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Does your business primarily serve children under the age of 13?",
        isUser: false,
        ctaButtons: [
          {
            label: 'Yes',
            onClick: () => handleServesChildrenResponse(true),
            variant: 'secondary'
          },
          {
            label: 'No',
            onClick: () => handleServesChildrenResponse(false),
            variant: 'secondary'
          },
          {
            label: 'Why is this important?',
            onClick: () => handleWhyChildrenQuestion(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 800);
  };
  
  // Handler for the "Why is this important?" question
  const handleWhyChildrenQuestion = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Why is this important?", isUser: true, ctaButtons: undefined }]);
    
    // Capture the compliance query
    captureComplianceResponse(
      "Why is COPPA information important",
      "User asked about importance of COPPA",
      "coppa_explanation"
    );
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Businesses that primarily serve children under the age of 13, like daycares or schools, will require additional security language geared toward protecting their privacy, as part of the Children's Online Privacy Protection Act (COPPA).",
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // After a brief pause, ask about COPPA compliance
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            text: "Do you need to comply with the Children's Online Privacy Protection Act?",
            isUser: false,
            ctaButtons: [
              {
                label: 'Yes',
                onClick: () => handleCoppaComplianceResponse(true),
                variant: 'secondary'
              },
              {
                label: 'No',
                onClick: () => handleCoppaComplianceResponse(false),
                variant: 'secondary'
              }
            ]
          }]);
        }, 800);
      }, 1500);
    }, 1000);
  };
  
  // Handler for response to serving children question
  const handleServesChildrenResponse = (servesChildren: boolean) => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user response
    setMessages(prev => [...prev, { text: servesChildren ? "Yes" : "No", isUser: true, ctaButtons: undefined }]);
    
    // Update businessInfo state immediately
    setBusinessInfo(prev => ({...prev, coppaCompliance: servesChildren}));
    
    // Capture the compliance response
    captureComplianceResponse(
      "Does your business primarily serve children under 13?",
      servesChildren ? "Yes" : "No",
      "serves_children"
    );
    
    // Ensure canvas stays visible and shows the COPPA compliance form
    setShowCanvas(true);
    setCurrentEditField('coppaCompliance');
    
    if (servesChildren) {
      // Show typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          text: "Since your business primarily serves children under 13, I'll include appropriate COPPA compliance language in your privacy policy.",
          isUser: false,
          ctaButtons: undefined
        }]);
        
        // After confirmation, proceed to next step or generate
        proceedAfterCoppa();
      }, 1000);
    } else {
      // Ask if they still need COPPA compliance
      // Show typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          text: "Do you still need to comply with the Children's Online Privacy Protection Act?",
          isUser: false,
          ctaButtons: [
            {
              label: 'Yes',
              onClick: () => handleCoppaComplianceResponse(true),
              variant: 'secondary'
            },
            {
              label: 'No',
              onClick: () => handleCoppaComplianceResponse(false),
              variant: 'secondary'
            }
          ]
        }]);
      }, 800);
    }
  };
  
  // Handler for COPPA compliance response
  const handleCoppaComplianceResponse = (needsCoppa: boolean) => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user response
    setMessages(prev => [...prev, { text: needsCoppa ? "Yes" : "No", isUser: true, ctaButtons: undefined }]);
    
    // Update businessInfo state
    setBusinessInfo(prev => ({...prev, coppaCompliance: needsCoppa}));
    
    // Ensure canvas stays visible with the edit field
    setShowCanvas(true);
    setCurrentEditField('coppaCompliance');
    
    // Capture the compliance response
    captureComplianceResponse(
      "COPPA Compliance Needed",
      needsCoppa ? "Yes" : "No",
      "coppa_compliance"
    );
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: needsCoppa 
          ? "I'll include COPPA compliance language in your privacy policy." 
          : "No COPPA compliance language will be included in your privacy policy.",
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // Immediately proceed to next step or generate
      proceedAfterCoppa();
    }, 800);
  };
  
  // Function to proceed to next step or generation after COPPA question
  const proceedAfterCoppa = () => {
    // Clear the current edit field
    setCurrentEditField(null);
    
    // Proceed directly to policy generation
    setTimeout(() => {
      handleGeneratePrivacyPolicy();
    }, 800);
  };
  
  // Handler for generating privacy policy specifically
  const handleGeneratePrivacyPolicy = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Generate Policy", isUser: true, ctaButtons: undefined }]);
    
    // Capture the policy generation with current COPPA state
    captureComplianceResponse(
      "Privacy Policy generated",
      `Business: ${businessInfo.name}, COPPA Compliance: ${businessInfo.coppaCompliance ? 'Yes' : 'No'}`,
      "policy_generation"
    );
    
    // First ensure canvas is visible before showing loading state
    setShowCanvas(true);
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Great! I'm generating your Privacy Policy now...",
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // Show loading state
      setIsCanvasLoading(true);
      setCurrentEditField(null);
      
      // After a brief delay, show the static policy content
      setTimeout(() => {
        // Just set states, no actual policy generation
        setIsCanvasLoading(false);
        setIsPrivacyPolicyGenerated(true);
        
        // Add a follow-up message after the policy is displayed
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
              text: "Your Privacy Policy has been generated successfully! You can view it in the panel on the right.",
              isUser: false,
              ctaButtons: [
                {
                  label: 'Edit Information',
                  onClick: () => handleEditMoreInfo(),
                  variant: 'secondary'
                }
              ]
            }]);
          }, 800);
        }, 500);
      }, 2000);
    }, 800);
  };
  
  // Handler for form submissions in the side panel
  const handleFormPrivacyPolicySubmission = () => {
    const companyNameInput = document.querySelector('.privacy-form input[placeholder="Company Name"]') as HTMLInputElement;
    const websiteInput = document.querySelector('.privacy-form input[placeholder="Website URL"]') as HTMLInputElement;
    const dataCollectionTextarea = document.querySelector('.privacy-form textarea') as HTMLTextAreaElement;
    
    if (companyNameInput && websiteInput) {
      const companyName = companyNameInput.value || businessInfo.name;
      const websiteUrl = websiteInput.value || "your website";
      const dataCollection = dataCollectionTextarea?.value || "personal information provided by users";
      
      // Capture the form submission
      captureComplianceResponse(
        "Privacy Policy form submitted",
        `Company: ${companyName}, Website: ${websiteUrl}`,
        "privacy_form_submission"
      );
      
      // Update business info
      setBusinessInfo(prev => ({...prev, name: companyName}));
      
      // Close the side panel and show canvas with generated policy
      setShowSidePanel(false);
      setSidePanelContent(null);
      setShowCanvas(true);
      
      // Show confirmation in chat
      setMessages(prev => [...prev, { 
        text: `Great! I've generated a Privacy Policy for ${companyName}.`,
        isUser: false,
        ctaButtons: undefined
      }]);
      
      // Show policy generated
      setIsPrivacyPolicyGenerated(true);
    }
  };

  // Add handler for Terms of Service generation
  const handleGenerateTermsOfService = () => {
    // Remove CTAButtons from all previous messages
    setMessages(prev => prev.map(msg => ({...msg, ctaButtons: undefined})));
    // Add user message
    setMessages(prev => [...prev, { text: "Generate Terms", isUser: true, ctaButtons: undefined }]);
    
    // Capture the terms generation request
    captureComplianceResponse(
      "Terms of Service generated",
      "Generated from form data",
      "terms_generation"
    );
    
    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "I've generated your Terms of Service based on the information provided. You can download the document or make further edits.",
        isUser: false,
        ctaButtons: [
          {
            label: 'Download Terms',
            onClick: () => alert('Terms document downloaded'),
            variant: 'primary'
          },
          {
            label: 'Edit More',
            onClick: () => handleEditMoreTerms(),
            variant: 'secondary'
          }
        ]
      }]);
    }, 1000);
  };

  // Function to render the compliance data view - this will now be removed/disabled
  const renderComplianceDataView = () => {
    // No longer used - return null instead
    return null;
  };
  
  // We still keep data capture for backend purposes, but don't show UI for it
  const viewComplianceResponses = () => {
    // This function is now disabled since we removed the button
    console.log("Compliance data viewing is disabled");
  };
  
  const clearComplianceData = () => {
    // This function is now disabled since we removed the button
    console.log("Compliance data clearing is disabled");
  };
  
  const exportComplianceData = () => {
    // This function is now disabled since we removed the button
    console.log("Compliance data export is disabled");
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
        <div className={`split-container ${showSidePanel ? 'with-side-panel' : ''} ${showCanvas ? 'with-canvas' : ''} ${canvasAnimating ? 'canvas-animating' : ''}`}>
          <div className="chat-section">
            <MessageList messages={messages} />
            {isTyping && <TypingIndicator />}
            <InputBar onSendMessage={handleSendMessage} />
          </div>
          {showCanvas && renderCanvas()}
          {renderSidePanel()}
        </div>
      </div>
    </div>
  );
} 