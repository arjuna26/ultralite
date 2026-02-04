import { useState, useEffect } from 'react';

/**
 * Extracts the dominant background color from an image by sampling corner pixels.
 * Returns a CSS color string (rgb or hex) that can be used as a background.
 * 
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} fallbackColor - CSS color to use if extraction fails (default: white)
 * @returns {string} CSS color string
 */
export function useImageBackgroundColor(imageUrl, fallbackColor = 'rgb(255, 255, 255)') {
  const [backgroundColor, setBackgroundColor] = useState(fallbackColor);

  useEffect(() => {
    if (!imageUrl) {
      setBackgroundColor(fallbackColor);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for cross-origin images

    img.onload = () => {
      try {
        // Create a canvas to read pixel data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Sample corner pixels MORE CAREFULLY to avoid edge pixels
        // Start sampling 10% inward from edges to avoid anti-aliasing artifacts
        const inset = Math.max(10, Math.floor(Math.min(img.width, img.height) * 0.1));
        const cornerSize = Math.min(30, Math.floor(img.width * 0.08), Math.floor(img.height * 0.08));
        
        const corners = [
          { x: inset, y: inset }, // Top-left (inset from edges)
          { x: img.width - cornerSize - inset, y: inset }, // Top-right
          { x: inset, y: img.height - cornerSize - inset }, // Bottom-left
          { x: img.width - cornerSize - inset, y: img.height - cornerSize - inset }, // Bottom-right
        ];
        
        // Collect colors from corner regions
        const colors = [];
        corners.forEach(corner => {
          for (let x = corner.x; x < corner.x + cornerSize && x < img.width; x += 5) {
            for (let y = corner.y; y < corner.y + cornerSize && y < img.height; y += 5) {
              const pixelData = ctx.getImageData(x, y, 1, 1).data;
              const r = pixelData[0];
              const g = pixelData[1];
              const b = pixelData[2];
              const a = pixelData[3];
              
              // Skip fully transparent pixels
              if (a < 10) continue;
              
              // Skip very dark colors (likely edge/shadow artifacts from transparent PNGs)
              const brightness = (r + g + b) / 3;
              if (brightness < 40) continue;
              
              colors.push({ r, g, b });
            }
          }
        });
        
        // If no valid colors found, use white background (common for product images)
        if (colors.length === 0) {
          setBackgroundColor(fallbackColor);
          return;
        }
        
        // Find the most common color (simple mode calculation)
        // Group similar colors together
        const colorGroups = {};
        colors.forEach(color => {
          // Round to nearest 15 to group similar colors (increased from 10 for better grouping)
          const key = `${Math.round(color.r / 15) * 15},${Math.round(color.g / 15) * 15},${Math.round(color.b / 15) * 15}`;
          if (!colorGroups[key]) {
            colorGroups[key] = { count: 0, r: 0, g: 0, b: 0 };
          }
          colorGroups[key].count++;
          colorGroups[key].r += color.r;
          colorGroups[key].g += color.g;
          colorGroups[key].b += color.b;
        });
        
        // Find the group with most pixels
        let maxCount = 0;
        let dominantColor = null;
        Object.values(colorGroups).forEach(group => {
          if (group.count > maxCount) {
            maxCount = group.count;
            dominantColor = {
              r: Math.round(group.r / group.count),
              g: Math.round(group.g / group.count),
              b: Math.round(group.b / group.count),
            };
          }
        });
        
        if (dominantColor) {
          // If the dominant color is very light (brightness > 240), use white for cleaner look
          const brightness = (dominantColor.r + dominantColor.g + dominantColor.b) / 3;
          if (brightness > 240) {
            setBackgroundColor(fallbackColor); // Use white for very light backgrounds
          } else {
            // Convert to RGB string
            const rgb = `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
            setBackgroundColor(rgb);
          }
        } else {
          setBackgroundColor(fallbackColor);
        }
      } catch (error) {
        // CORS or other errors - fallback to white
        console.warn('Failed to extract image background color:', error);
        setBackgroundColor(fallbackColor);
      }
    };

    img.onerror = () => {
      setBackgroundColor(fallbackColor);
    };

    img.src = imageUrl;
  }, [imageUrl, fallbackColor]);

  return backgroundColor;
}