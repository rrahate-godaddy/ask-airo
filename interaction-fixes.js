// Fallback interaction script for chat components
document.addEventListener('DOMContentLoaded', function() {
  // Find send buttons
  const sendButtons = document.querySelectorAll('.send-button');
  
  // Initial setup - make sure we have a message list with the welcome message
  const messageListContainers = document.querySelectorAll('.message-list');
  messageListContainers.forEach(container => {
    // Check if the message list is empty or doesn't have message content
    const messageSpace = container.querySelector('.space-y-4');
    
    if (!messageSpace || !messageSpace.children.length) {
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
}); 