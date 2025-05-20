// Ensure Material Icons are loaded correctly
(function ensureMaterialIcons() {
  // Check if Material Icons font is loaded
  function checkFontLoaded(fontFamily) {
    // Create a span with the font
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    span.style.fontSize = '24px';
    span.style.visibility = 'hidden';
    span.textContent = 'send';
    
    // Add it to the body
    document.body.appendChild(span);
    
    // Check if the width is different from a fallback font
    const fallbackSpan = document.createElement('span');
    fallbackSpan.style.fontFamily = 'sans-serif';
    fallbackSpan.style.fontSize = '24px';
    fallbackSpan.style.visibility = 'hidden';
    fallbackSpan.textContent = 'send';
    document.body.appendChild(fallbackSpan);
    
    // Compare dimensions
    const isFontLoaded = span.offsetWidth !== fallbackSpan.offsetWidth;
    
    // Clean up
    document.body.removeChild(span);
    document.body.removeChild(fallbackSpan);
    
    return isFontLoaded;
  }
  
  // Load Material Icons font dynamically if needed
  function loadMaterialIcons() {
    if (!checkFontLoaded('Material Symbols Outlined')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
      document.head.appendChild(link);
      
      console.log("Material Icons font loaded dynamically");
    }
  }
  
  // Set all send icons content
  function fixSendIcons() {
    const sendIcons = document.querySelectorAll('.material-symbols-outlined[data-icon="send"]');
    sendIcons.forEach(icon => {
      if (!icon.textContent || icon.textContent.trim() === '') {
        icon.textContent = 'send';
      }
    });
  }
  
  // Load font
  loadMaterialIcons();
  
  // Fix icons
  fixSendIcons();
  
  // Check again after a short delay (font might still be loading)
  setTimeout(fixSendIcons, 1000);
})(); 