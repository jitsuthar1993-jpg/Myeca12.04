import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from './OptimizedImage';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  thumbnailClassName?: string;
  lightbox?: boolean;
}

export default function ImageGallery({
  images,
  className,
  thumbnailClassName,
  lightbox = true
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsLightboxOpen(false);
  };

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Main Image Display */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <OptimizedImage
            src={images[selectedIndex].src}
            alt={images[selectedIndex].alt}
            className="w-full h-full object-contain cursor-pointer"
            priority
            onClick={() => lightbox && setIsLightboxOpen(true)}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  selectedIndex === index
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                    : 'border-transparent hover:border-gray-300',
                  thumbnailClassName
                )}
              >
                <OptimizedImage
                  src={image.src}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Caption */}
        {images[selectedIndex].caption && (
          <p className="text-center text-sm text-gray-600">
            {images[selectedIndex].caption}
          </p>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Image */}
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              style={{ transform: `scale(${zoom})` }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <OptimizedImage
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                className="max-w-full max-h-[90vh] object-contain"
                priority
              />
            </motion.div>

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Lightbox Caption */}
            {images[selectedIndex].caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
                {images[selectedIndex].caption}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}