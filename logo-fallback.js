// Fallback script for the logo image
document.addEventListener('DOMContentLoaded', function() {
  // Helper function to check if an image is valid (not a 0 byte or HTML file)
  function isValidImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.height > 0);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Function to create SVG fallback
  function createSVGLogo() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "140");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 140 30");
    
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `.text { font-family: Arial, sans-serif; font-weight: bold; }
    .logo-text { fill: #744BC4; }
    .logo-accent { fill: #744BC4; }`;
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "15");
    circle.setAttribute("cy", "15");
    circle.setAttribute("r", "10");
    circle.setAttribute("class", "logo-accent");
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "30");
    text.setAttribute("y", "20");
    text.setAttribute("class", "text logo-text");
    text.setAttribute("font-size", "16");
    text.textContent = "Ask Airo";
    
    svg.appendChild(style);
    svg.appendChild(circle);
    svg.appendChild(text);
    
    return svg;
  }

  // Find all logo images
  const logoImages = document.querySelectorAll('img[src*="AiroHQ/gd-airo-lockup.png"]');
  
  // Check and handle each logo image
  logoImages.forEach(async (img) => {
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
    const pngPath = `${basePath}/images/AiroHQ/gd-airo-lockup.png`;
    const svgPath = `${basePath}/images/gd-airo-lockup.svg`;
    
    // Check if PNG is valid
    const isPngValid = await isValidImage(pngPath);
    if (!isPngValid) {
      // Try SVG fallback
      const isSvgValid = await isValidImage(svgPath);
      if (!isSvgValid) {
        // If both fail, replace with SVG element
        const parent = img.parentNode;
        if (parent) {
          const svgLogo = createSVGLogo();
          parent.replaceChild(svgLogo, img);
        }
      } else {
        // Use SVG if it exists
        img.src = svgPath;
      }
    }
  });
}); 