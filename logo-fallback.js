// Logo fallback script
document.addEventListener('DOMContentLoaded', function() {
  // Find all logo images that failed to load
  const logoImages = document.querySelectorAll('img[alt="Airo Logo"]');
  
  logoImages.forEach(img => {
    // Check if the image has already failed to load
    if (img.complete && img.naturalWidth === 0) {
      replaceLogo(img);
    }
    
    // Add error handler for images that fail later
    img.addEventListener('error', function() {
      replaceLogo(img);
    });
  });
  
  function replaceLogo(img) {
    // Create a div to hold the text logo
    const logoDiv = document.createElement('div');
    logoDiv.style.fontFamily = 'Arial, sans-serif';
    logoDiv.style.fontWeight = 'bold';
    logoDiv.style.fontSize = '16px';
    logoDiv.style.color = '#333';
    logoDiv.style.padding = '6px';
    logoDiv.textContent = 'Airo HQ';
    
    // Replace the img with the text logo
    if (img.parentNode) {
      img.parentNode.replaceChild(logoDiv, img);
    }
  }
}); 