/**
 * Gallery View Component
 */

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Filter } from 'lucide-react';
import type { WidgetViewProps } from '../../types';
import type { GalleryProps, GalleryImage } from './index';

export const GalleryView: React.FC<WidgetViewProps> = ({ widget }) => {
  const props = widget.props as GalleryProps;
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Filter images based on selected tag
  const filteredImages = selectedFilter === 'all' 
    ? props.images 
    : props.images.filter(img => img.title?.includes(selectedFilter));

  const openLightbox = useCallback((image: GalleryImage, index: number) => {
    if (props.enableLightbox) {
      setSelectedImage(image);
      setCurrentIndex(index);
      setIsLightboxOpen(true);
    }
  }, [props.enableLightbox]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
  }, []);

  const nextImage = useCallback(() => {
    const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex]);
  }, [currentIndex, filteredImages]);

  const prevImage = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    setCurrentIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex]);
  }, [currentIndex, filteredImages]);

  const getAspectRatioClass = () => {
    switch (props.aspectRatio) {
      case 'square': return 'aspect-square';
      case '16/9': return 'aspect-video';
      case '4/3': return 'aspect-[4/3]';
      case '3/2': return 'aspect-[3/2]';
      default: return '';
    }
  };

  const getGridColumns = () => {
    return `grid-cols-${props.columns.sm} md:grid-cols-${props.columns.md} lg:grid-cols-${props.columns.lg}`;
  };

  const renderGridGallery = () => (
    <div className={`grid ${getGridColumns()} gap-${Math.floor(props.spacing / 4)}`}>
      {filteredImages.map((image, index) => (
        <div
          key={image.id}
          className={`relative group cursor-pointer overflow-hidden rounded-lg ${getAspectRatioClass()}`}
          onClick={() => openLightbox(image, index)}
        >
          <img
            src={props.lazyLoad ? image.thumbnail || image.src : image.src}
            alt={image.alt}
            loading={props.lazyLoad ? 'lazy' : 'eager'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {props.showCaptions && (image.title || image.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {image.title && (
                <h3 className="text-white font-semibold text-sm">{image.title}</h3>
              )}
              {image.description && (
                <p className="text-white text-xs opacity-90">{image.description}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMasonryGallery = () => (
    <div className={`columns-${props.columns.sm} md:columns-${props.columns.md} lg:columns-${props.columns.lg} gap-${Math.floor(props.spacing / 4)}`}>
      {filteredImages.map((image, index) => (
        <div
          key={image.id}
          className="break-inside-avoid mb-4 relative group cursor-pointer overflow-hidden rounded-lg"
          onClick={() => openLightbox(image, index)}
        >
          <img
            src={props.lazyLoad ? image.thumbnail || image.src : image.src}
            alt={image.alt}
            loading={props.lazyLoad ? 'lazy' : 'eager'}
            className="w-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {props.showCaptions && (image.title || image.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {image.title && (
                <h3 className="text-white font-semibold text-sm">{image.title}</h3>
              )}
              {image.description && (
                <p className="text-white text-xs opacity-90">{image.description}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCarouselGallery = () => (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div className="flex transition-transform duration-300 ease-in-out">
          {filteredImages.map((image, index) => (
            <div key={image.id} className="w-full flex-shrink-0">
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover ${getAspectRatioClass()}`}
              />
              {props.showCaptions && (image.title || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  {image.title && (
                    <h3 className="text-white font-semibold">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-white text-sm opacity-90">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {props.showArrows && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            onClick={prevImage}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            onClick={nextImage}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {props.showDots && (
        <div className="flex justify-center mt-4 space-x-2">
          {filteredImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderLightbox = () => (
    isLightboxOpen && selectedImage && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-full">
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-w-full max-h-full object-contain"
          />
          
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            onClick={prevImage}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            onClick={nextImage}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {(selectedImage.title || selectedImage.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-6">
              {selectedImage.title && (
                <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
              )}
              {selectedImage.description && (
                <p className="text-sm opacity-90 mt-1">{selectedImage.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  );

  return (
    <div className="gallery-widget">
      {/* Filter Bar */}
      {props.enableFilter && props.filterTags && props.filterTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          {props.filterTags.map((tag) => (
            <button
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === tag 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Content */}
      {props.layout === 'grid' && renderGridGallery()}
      {props.layout === 'masonry' && renderMasonryGallery()}
      {props.layout === 'carousel' && renderCarouselGallery()}

      {/* Lightbox */}
      {renderLightbox()}
    </div>
  );
};