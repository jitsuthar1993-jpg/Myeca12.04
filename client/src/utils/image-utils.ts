// Image optimization utilities

export interface ImageSizeConfig {
  width: number;
  quality?: number;
}

export const imageSizes = {
  thumbnail: { width: 150, quality: 70 },
  small: { width: 300, quality: 75 },
  medium: { width: 600, quality: 80 },
  large: { width: 1200, quality: 85 },
  xlarge: { width: 1920, quality: 90 }
} as const;

// Generate srcset for responsive images
export function generateSrcSet(
  baseUrl: string,
  sizes: Array<keyof typeof imageSizes> = ['small', 'medium', 'large']
): string {
  return sizes
    .map(size => {
      const config = imageSizes[size];
      return `${baseUrl}?w=${config.width}&q=${config.quality} ${config.width}w`;
    })
    .join(', ');
}

// Generate sizes attribute for responsive images
export function generateSizes(breakpoints: { [key: string]: string }): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => {
      if (breakpoint === 'default') {
        return size;
      }
      return `(max-width: ${breakpoint}) ${size}`;
    })
    .join(', ');
}

// Convert image URL to use CDN with optimization params
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  } = {}
): string {
  // If already optimized or is SVG, return as is
  if (url.includes('?') || url.endsWith('.svg')) {
    return url;
  }

  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('fm', options.format);
  if (options.fit) params.append('fit', options.fit);

  return `${url}?${params.toString()}`;
}

// Preload critical images
export function preloadImage(url: string, options?: {
  as?: 'image';
  type?: string;
  media?: string;
}): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options?.as || 'image';
  link.href = url;
  
  if (options?.type) {
    link.type = options.type;
  }
  
  if (options?.media) {
    link.media = options.media;
  }

  // Set crossorigin for CORS
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}

// Generate blur data URL for placeholder
export async function generateBlurDataURL(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create tiny version (10x10 or proportional)
      const aspectRatio = img.width / img.height;
      canvas.width = 10;
      canvas.height = Math.round(10 / aspectRatio);
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.1);
      resolve(dataURL);
    };
    
    img.onerror = () => {
      // Return transparent pixel if error
      resolve('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    };
    
    img.src = imageSrc;
  });
}

// Check if browser supports modern image formats
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
};

export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Simple feature detection for AVIF
  return CSS.supports('(backdrop-filter: blur(1px))'); // Proxy for modern browser
};

// Image loading priority based on viewport
export function getImagePriority(element: HTMLElement): 'high' | 'low' {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // High priority if in viewport or just below
  if (rect.top < viewportHeight * 1.5) {
    return 'high';
  }
  
  return 'low';
}