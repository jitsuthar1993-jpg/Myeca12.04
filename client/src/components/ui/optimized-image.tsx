import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  className,
  containerClassName,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-slate-100/50 dark:bg-blue-800/40",
        !isLoaded && !error && "animate-pulse",
        containerClassName
      )}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-500 ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-blue-700 text-slate-400">
          <span className="text-xs italic">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
