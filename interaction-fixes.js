// Basic fallback chat functionality
document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.querySelector('.chat-container');
  if (!chatContainer) return;

  // Try to find the input and send button
  const inputElement = document.querySelector('.input-bar input') || document.querySelector('input[type="text"]');
  const sendButton = document.querySelector('.input-bar button') || document.querySelector('button[type="submit"]');

  if (inputElement && sendButton) {
    // Add event listener to the send button
    sendButton.addEventListener('click', function() {
      const message = inputElement.value.trim();
      if (message) {
        // Add user message to the UI
        addMessage(message, true);
        // Clear input
        inputElement.value = '';
        // Add bot response after a delay
        setTimeout(() => {
          addMessage("I'm processing your request. This is a fallback response.", false);
        }, 1000);
      }
    });

    // Add event listener to the input for Enter key
    inputElement.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendButton.click();
      }
    });
  }

  // Function to add a message to the UI
  function addMessage(text, isUser) {
    const messageList = document.querySelector('.message-list');
    if (!messageList) return;

    const messageElement = document.createElement('div');
    messageElement.className = isUser ? 'message user' : 'message bot';
    messageElement.textContent = text;
    messageList.appendChild(messageElement);
    
    // Scroll to the bottom
    messageList.scrollTop = messageList.scrollHeight;
  }
}); 