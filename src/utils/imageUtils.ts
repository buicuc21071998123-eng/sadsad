/**
 * Utility functions for image compression using HTML5 Canvas
 */

/**
 * Compresses an image File or Data URL to a maximum width/height and returns Base64 data URL
 */
export const compressImage = (
  fileOrUrl: File | string,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions keeping aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot create canvas 2D context'));
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = (err) => reject(err);

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrUrl);
    }
  });
};

/**
 * Compresses an image specifically for Teacher Avatar (max 500x500, quality 0.88)
 */
export const compressTeacherAvatar = (
  fileOrUrl: File | string,
  maxWidth = 500,
  maxHeight = 500,
  quality = 0.88
): Promise<string> => {
  return compressImage(fileOrUrl, maxWidth, maxHeight, quality);
};

/**
 * Compresses a banner image for class header / hero banner (max 1200x450, quality 0.85)
 */
export const compressBannerImage = (
  fileOrUrl: File | string,
  maxWidth = 1200,
  maxHeight = 450,
  quality = 0.85
): Promise<string> => {
  return compressImage(fileOrUrl, maxWidth, maxHeight, quality);
};

/**
 * Returns the default cute teacher avatar SVG data URL
 */
export const DEFAULT_TEACHER_AVATAR = 
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80';

/**
 * Generates a unique 5-digit numeric string (e.g., "48291") not present in existing codes
 */
export const generateUnique5DigitCode = (existingCodes: Set<string> | string[]): string => {
  const codeSet = Array.isArray(existingCodes) ? new Set(existingCodes) : existingCodes;
  let code = '';
  let attempts = 0;

  do {
    // Generate 5-digit number between 10000 and 99999
    const num = Math.floor(10000 + Math.random() * 90000);
    code = num.toString();
    attempts++;
  } while (codeSet.has(code) && attempts < 10000);

  return code;
};

/**
 * Returns the avatar URL for a student: custom uploaded Base64 image or Dicebear Notionists SVG fallback
 */
export const getStudentAvatarUrl = (student: { avatarUrl?: string; avatarSeed?: string; name: string; gender?: string }): string => {
  if (student.avatarUrl && student.avatarUrl.startsWith('data:image/')) {
    return student.avatarUrl;
  }
  const seed = encodeURIComponent(student.avatarSeed || student.name || 'Student');
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0,fef08a,fed7aa,bbf7d0,bfdbfe,fbcfe8`;
};
