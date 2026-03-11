import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3C/svg%3E',
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver<HTMLImageElement>({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (!isIntersecting || !src) return;

    // Create a new image to preload
    const img = new Image();
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setIsError(true);
      setIsLoading(false);
      onError?.();
    };
    
    img.src = src;
  }, [isIntersecting, src, onLoad, onError]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={ref}
        src={imgSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          isError && 'opacity-50'
        )}
        loading="lazy"
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}