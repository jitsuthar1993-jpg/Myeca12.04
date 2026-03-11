import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  fallback = '/placeholder-image.svg',
  className,
  loadingClassName = 'animate-pulse bg-gray-200',
  errorClassName = 'bg-gray-100',
  onLoad,
  onError,
  priority = false,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [targetRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isVisible && !imageSrc && !priority) {
      setImageSrc(src);
    }
  }, [isVisible, src, imageSrc, priority]);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      setImageStatus('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      setImageStatus('error');
      setImageSrc(fallback);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, fallback, onLoad, onError]);

  return (
    <div
      ref={targetRef}
      className={cn(
        'relative overflow-hidden',
        imageStatus === 'loading' && loadingClassName,
        imageStatus === 'error' && errorClassName,
        className
      )}
    >
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      
      {imageSrc && (
        <img
          {...props}
          src={imageSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
}