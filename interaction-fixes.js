// Fallback interaction script for chat components
document.addEventListener('DOMContentLoaded', function() {
  // Fix send button icons immediately
  fixSendButtonIcons();
  
  // Check if React is already handling the chat (wait a few seconds first)
  setTimeout(() => {
    // If React is working, the astro-island will have no "ssr" attribute
    const astroIslands = document.querySelectorAll('astro-island');
    let reactIsWorking = false;
    
    astroIslands.forEach(island => {
      if (!island.hasAttribute('ssr')) {
        reactIsWorking = true;
      }
    });
    
    // Only apply our fallback if React is not working
    if (!reactIsWorking) {
      applyFallbackChatBehavior();
    }
    
    // Fix icons again after React might have changed them
    fixSendButtonIcons();
  }, 2000); // Wait 2 seconds to see if React hydrates
});

// Function to fix the send button icons
function fixSendButtonIcons() {
  const sendButtons = document.querySelectorAll('.send-button');
  
  sendButtons.forEach(button => {
    // Look for the material icon element
    let iconElement = button.querySelector('.material-symbols-outlined[data-icon="send"]');
    
    // If it exists but is empty, set its text
    if (iconElement) {
      if (!iconElement.textContent.trim()) {
        iconElement.textContent = 'send';
      }
    } 
    // If no icon element exists at all, add our SVG
    else if (!button.querySelector('svg')) {
      // Use our SVG icon as fallback
      button.innerHTML = `
        <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(12.000000, 12.000000) rotate(-35.000000) translate(-12.000000, -12.000000)" fill="currentColor">
            <path d="M3,19 L21,12 L3,5 L3,9.5 L14,12 L3,14.5 L3,19 Z"></path>
          </g>
        </svg>`;
    }
  });
}

function applyFallbackChatBehavior() {
  console.log("Applying fallback chat behavior");
  // Find send buttons
  const sendButtons = document.querySelectorAll('.send-button');
  
  // Initial setup - make sure we have a message list with the welcome message
  const messageListContainers = document.querySelectorAll('.message-list');
  messageListContainers.forEach(container => {
    // Check if the message list is empty or doesn't have message content
    const messageSpace = container.querySelector('.space-y-4');
    
    if (!messageSpace || !messageSpace.querySelector('.message-bubble')) {
      // Create or ensure the message space exists
      let messageSpaceElement = messageSpace;
      if (!messageSpaceElement) {
        messageSpaceElement = document.createElement('div');
        messageSpaceElement.className = 'space-y-4';
        container.appendChild(messageSpaceElement);
      }
      
      // Add a welcome message from the bot
      const botMessageBubble = document.createElement('div');
      botMessageBubble.className = 'message-bubble bot';
      botMessageBubble.textContent = "Hi! I'm Airo, your personal assistant. How can I help you today?";
      
      // Create wrapper
      const botWrapper = document.createElement('div');
      botWrapper.className = 'chat-bubble-wrapper';
      botWrapper.appendChild(botMessageBubble);
      
      // Add to message list
      messageSpaceElement.appendChild(botWrapper);
    }
  });
  
  // Add click listeners to all send buttons
  sendButtons.forEach(button => {
    // Enable button if there's text in the input
    const input = button.closest('.input-container')?.querySelector('.message-input');
    if (input && input.value.trim()) {
      button.removeAttribute('disabled');
    } else if (button.hasAttribute('disabled')) {
      // Leave it disabled if it was initially set that way
    } else {
      // Otherwise set it to disabled by default
      button.setAttribute('disabled', '');
    }
    
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Find the input field
      const input = button.closest('.input-container').querySelector('.message-input');
      
      if (input && input.value.trim()) {
        // Create and append a user message
        const messageList = document.querySelector('.message-list .space-y-4');
        
        if (messageList) {
          // Create user message bubble
          const messageBubble = document.createElement('div');
          messageBubble.className = 'message-bubble user';
          messageBubble.textContent = input.value;
          
          // Create wrapper
          const wrapper = document.createElement('div');
          wrapper.className = 'chat-bubble-wrapper';
          wrapper.appendChild(messageBubble);
          
          // Add to message list
          messageList.appendChild(wrapper);
          
          // Clear input
          input.value = '';
          
          // Disable send button
          button.setAttribute('disabled', '');
          
          // Scroll to bottom
          const messageListContainer = document.querySelector('.message-list');
          if (messageListContainer) {
            messageListContainer.scrollTop = messageListContainer.scrollHeight;
          }
          
          // Show a response after a short delay
          setTimeout(() => {
            // Create bot message bubble
            const botMessageBubble = document.createElement('div');
            botMessageBubble.className = 'message-bubble bot';
            botMessageBubble.textContent = "I'm sorry, but I'm having trouble connecting to my backend services right now. Please try again later.";
            
            // Create wrapper
            const botWrapper = document.createElement('div');
            botWrapper.className = 'chat-bubble-wrapper';
            botWrapper.appendChild(botMessageBubble);
            
            // Add to message list
            messageList.appendChild(botWrapper);
            
            // Scroll to bottom again
            if (messageListContainer) {
              messageListContainer.scrollTop = messageListContainer.scrollHeight;
            }
          }, 1000);
        }
      }
    });
  });
  
  // Make Enter key work in input fields
  const inputs = document.querySelectorAll('.message-input');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const button = input.closest('.input-container').querySelector('.send-button');
        if (button && !button.hasAttribute('disabled')) {
          button.click();
        }
      }
    });
    
    // Enable send button when text is entered
    input.addEventListener('input', function() {
      const button = input.closest('.input-container').querySelector('.send-button');
      if (button) {
        if (input.value.trim()) {
          button.removeAttribute('disabled');
        } else {
          button.setAttribute('disabled', '');
        }
      }
    });
  });
} 