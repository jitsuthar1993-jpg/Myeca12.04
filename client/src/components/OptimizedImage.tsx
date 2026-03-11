import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Advanced format detection
const supportsWebP = (() => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('webp') > -1;
})();

const supportsAVIF = (() => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('avif') > -1;
})();

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  enableCDN?: boolean;
  blurDataURL?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty' | 'dominantColor';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  priority = false,
  sizes = '100vw',
  quality = 85,
  format = 'auto',
  fallbackSrc,
  onLoad,
  onError,
  enableCDN = true,
  blurDataURL,
  objectFit = 'cover',
  placeholder = 'empty',
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Advanced CDN URL optimization with format detection
  const getOptimizedUrl = (originalSrc: string, options: {
    width?: number;
    height?: number;
    quality: number;
    format: string;
  }) => {
    // Return original src if CDN is disabled or src is external
    if (!enableCDN || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Determine best format based on browser support
    let optimizedFormat = format;
    if (format === 'auto') {
      if (supportsAVIF) {
        optimizedFormat = 'avif';
      } else if (supportsWebP) {
        optimizedFormat = 'webp';
      } else {
        optimizedFormat = 'jpg';
      }
    }

    // Build CDN optimization parameters
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    params.set('q', options.quality.toString());
    params.set('f', optimizedFormat);
    params.set('fit', 'crop');

    // Use image transformation CDN (example: Cloudinary, ImageKit, or custom)
    // For now, we'll simulate CDN optimization
    return `${originalSrc}?${params.toString()}`;
  };

  // Enhanced srcSet generation with multiple formats and responsive breakpoints
  const generateSrcSet = useMemo(() => {
    const widths = [320, 480, 640, 768, 1024, 1280, 1536, 1920, 2560];
    const srcSets: string[] = [];

    // Generate srcSet for different formats
    const formats = ['avif', 'webp', 'jpg'];
    formats.forEach(fmt => {
      if (fmt === 'avif' && !supportsAVIF) return;
      if (fmt === 'webp' && !supportsWebP) return;

      const srcSet = widths.map(w => 
        `${getOptimizedUrl(src, { width: w, quality, format: fmt })} ${w}w`
      ).join(', ');
      
      if (srcSet) {
        srcSets.push(fmt === 'jpg' ? srcSet : `${srcSet} ${fmt}`);
      }
    });

    return srcSets.join(', ');
  }, [src, quality, format, width, height]);

  useEffect(() => {
    if (priority) {
      // Preload critical images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageSrc;
      if (sizes) link.setAttribute('imagesrcset', generateSrcSet(imageSrc));
      if (sizes) link.setAttribute('imagesizes', sizes);
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) {
          link.remove();
        }
      };
    }
  }, [imageSrc, priority, sizes]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Advanced loading placeholder */}
      {isLoading && placeholder !== 'empty' && (
        <div className="absolute inset-0">
          {placeholder === 'blur' && blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover blur-sm scale-110"
              aria-hidden="true"
            />
          )}
          {placeholder === 'dominantColor' && (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          {!blurDataURL && placeholder === 'blur' && (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}
        </div>
      )}
      
      {/* Loading skeleton with shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gray-100" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      )}
      
      {/* Error fallback with retry button */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 text-gray-400 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm text-gray-500 mb-2">Image failed to load</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                setImageSrc(src);
              }}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Actual image with advanced attributes */}
      <img
        ref={imgRef}
        src={getOptimizedUrl(imageSrc, { width, height, quality, format })}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        sizes={sizes}
        srcSet={generateSrcSet}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          'w-full h-full transition-all duration-500 ease-in-out',
          `object-${objectFit}`,
          isLoading && 'opacity-0 scale-105',
          !isLoading && !hasError && 'opacity-100 scale-100',
          hasError && 'opacity-0'
        )}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        crossOrigin="anonymous"
      />
      
      {/* Advanced blur-up effect */}
      {!priority && isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 transition-opacity duration-700"
          style={{
            opacity: isLoading ? 1 : 0,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Add shimmer animation styles
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
`;

// Inject shimmer styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}

export default OptimizedImage;

// Lazy-loaded image component for below-the-fold content
export const LazyImage: React.FC<Omit<OptimizedImageProps, 'loading'>> = (props) => {
  return <OptimizedImage {...props} loading="lazy" placeholder="blur" />;
};

// Critical image component for above-the-fold content
export const CriticalImage: React.FC<Omit<OptimizedImageProps, 'loading' | 'priority'>> = (props) => {
  return <OptimizedImage {...props} loading="eager" priority={true} placeholder="empty" />;
};

// Progressive image component with blur-up effect
export const ProgressiveImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} placeholder="blur" quality={90} />;
};

// Avatar image component with specific optimizations
export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'objectFit' | 'sizes'>> = (props) => {
  return (
    <OptimizedImage 
      {...props} 
      objectFit="cover" 
      sizes="80px"
      className={cn("rounded-full", props.className)}
    />
  );
};
