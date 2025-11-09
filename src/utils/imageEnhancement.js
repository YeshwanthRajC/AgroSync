/**
 * Image Enhancement Utilities using OpenCV.js
 * Enhances crop images before sending to Gemini API for better analysis
 */

// Wait for OpenCV to load
export const waitForOpenCV = () => {
  return new Promise((resolve) => {
    if (window.cv && window.cv.Mat) {
      resolve(window.cv);
    } else {
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkInterval);
          resolve(window.cv);
        }
      }, 100);
    }
  });
};

/**
 * Enhance crop image using OpenCV
 * - Increases contrast for better feature detection
 * - Applies sharpening to enhance edges
 * - Adjusts brightness for optimal visibility
 * - Reduces noise while preserving details
 */
export const enhanceImageWithOpenCV = async (imageFile) => {
  try {
    const cv = await waitForOpenCV();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas to draw image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Load image into OpenCV Mat
          let src = cv.imread(canvas);
          let dst = new cv.Mat();
          
          // Step 1: Convert to LAB color space for better processing
          let lab = new cv.Mat();
          cv.cvtColor(src, lab, cv.COLOR_RGBA2RGB);
          cv.cvtColor(lab, lab, cv.COLOR_RGB2Lab);
          
          // Step 2: Split channels
          let labChannels = new cv.MatVector();
          cv.split(lab, labChannels);
          
          // Step 3: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
          let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
          let lChannel = labChannels.get(0);
          clahe.apply(lChannel, lChannel);
          
          // Step 4: Merge channels back
          cv.merge(labChannels, lab);
          
          // Step 5: Convert back to RGB
          cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);
          cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);
          
          // Step 6: Apply sharpening kernel
          let sharpened = new cv.Mat();
          let kernel = cv.matFromArray(3, 3, cv.CV_32F, [
            -1, -1, -1,
            -1,  9, -1,
            -1, -1, -1
          ]);
          cv.filter2D(dst, sharpened, cv.CV_8U, kernel);
          
          // Step 7: Denoise while preserving edges
          let denoised = new cv.Mat();
          cv.fastNlMeansDenoisingColored(sharpened, denoised, 10, 10, 7, 21);
          
          // Step 8: Draw result to canvas
          cv.imshow(canvas, denoised);
          
          // Step 9: Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const enhancedFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now(),
              });
              resolve(enhancedFile);
            } else {
              reject(new Error('Failed to create blob from enhanced image'));
            }
          }, imageFile.type);

          // Cleanup
          src.delete();
          dst.delete();
          lab.delete();
          labChannels.delete();
          lChannel.delete();
          sharpened.delete();
          kernel.delete();
          denoised.delete();
          clahe.delete();
          
        } catch (error) {
          console.error('OpenCV processing error:', error);
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  } catch (error) {
    console.error('Error enhancing image:', error);
    throw error;
  }
};

/**
 * Simple enhancement fallback if OpenCV fails
 */
export const simpleEnhancement = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple contrast and brightness adjustment
      const contrast = 1.2;
      const brightness = 10;
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply contrast and brightness to RGB channels
        data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness));
        data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness));
        data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness));
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const enhancedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now(),
          });
          resolve(enhancedFile);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, imageFile.type);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
};
