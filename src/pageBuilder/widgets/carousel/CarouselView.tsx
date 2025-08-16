/**
 * Carousel View Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import type { WidgetViewProps } from '../../types';
import type { CarouselProps } from './index';

export const CarouselView: React.FC<WidgetViewProps> = ({ widget }) => {
  const props = widget.props as CarouselProps;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(props.autoplay);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && !isPaused && props.slides.length > 1) {
      interval = setInterval(() => {
        setCurrentSlide(prev => 
          props.infinite ? (prev + 1) % props.slides.length : Math.min(prev + 1, props.slides.length - 1)
        );
      }, props.autoplaySpeed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, props.autoplaySpeed, props.infinite, props.slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    if (props.infinite) {
      setCurrentSlide(prev => (prev + 1) % props.slides.length);
    } else if (currentSlide < props.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, props.infinite, props.slides.length]);

  const prevSlide = useCallback(() => {
    if (props.infinite) {
      setCurrentSlide(prev => (prev - 1 + props.slides.length) % props.slides.length);
    } else if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide, props.infinite, props.slides.length]);

  const handleMouseEnter = () => {
    if (props.pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (props.pauseOnHover) {
      setIsPaused(false);
    }
  };

  const getAspectRatioClass = () => {
    switch (props.aspectRatio) {
      case '16/9': return 'aspect-video';
      case '4/3': return 'aspect-[4/3]';
      case '3/2': return 'aspect-[3/2]';
      case 'square': return 'aspect-square';
      case 'custom': 
        if (props.customAspectRatio) {
          return '';
        }
        return 'aspect-video';
      default: return '';
    }
  };

  const getCustomAspectRatio = () => {
    if (props.aspectRatio === 'custom' && props.customAspectRatio) {
      const { width, height } = props.customAspectRatio;
      return { paddingBottom: `${(height / width) * 100}%` };
    }
    return {};
  };

  if (props.slides.length === 0) {
    return (
      <div className="carousel-widget bg-gray-100 rounded-lg flex items-center justify-center h-64">
        <p className="text-gray-500">No slides added</p>
      </div>
    );
  }

  const currentSlideData = props.slides[currentSlide];

  return (
    <div 
      className="carousel-widget relative overflow-hidden rounded-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main slide container */}
      <div 
        className={`relative ${getAspectRatioClass()}`}
        style={getCustomAspectRatio()}
      >
        {/* Slide content */}
        <div className="absolute inset-0">
          {currentSlideData.type === 'image' && currentSlideData.media && (
            <img
              src={currentSlideData.media.src}
              alt={currentSlideData.media.alt || ''}
              className="w-full h-full object-cover"
            />
          )}
          
          {currentSlideData.type === 'video' && currentSlideData.media && (
            <video
              src={currentSlideData.media.src}
              poster={currentSlideData.media.poster}
              className="w-full h-full object-cover"
              controls
            />
          )}

          {currentSlideData.type === 'content' && (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white p-8">
              <div className="text-center max-w-2xl">
                {currentSlideData.content?.title && (
                  <h2 className="text-4xl font-bold mb-4">{currentSlideData.content.title}</h2>
                )}
                {currentSlideData.content?.subtitle && (
                  <p className="text-xl mb-6 opacity-90">{currentSlideData.content.subtitle}</p>
                )}
                {currentSlideData.content?.description && (
                  <p className="text-lg mb-8 opacity-80">{currentSlideData.content.description}</p>
                )}
                {currentSlideData.content?.button && (
                  <a
                    href={currentSlideData.content.button.url}
                    className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentSlideData.content.button.style === 'primary' 
                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                        : currentSlideData.content.button.style === 'secondary'
                        ? 'bg-primary-700 text-white hover:bg-primary-800'
                        : 'border-2 border-white text-white hover:bg-white hover:text-primary-600'
                    }`}
                  >
                    {currentSlideData.content.button.text}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Overlay */}
          {currentSlideData.overlay?.enabled && (
            <div 
              className={`absolute inset-0 flex items-center justify-center ${
                currentSlideData.overlay.position === 'center' ? 'items-center justify-center' :
                currentSlideData.overlay.position === 'top' ? 'items-start justify-center pt-8' :
                currentSlideData.overlay.position === 'bottom' ? 'items-end justify-center pb-8' :
                currentSlideData.overlay.position === 'left' ? 'items-center justify-start pl-8' :
                currentSlideData.overlay.position === 'right' ? 'items-center justify-end pr-8' :
                currentSlideData.overlay.position === 'top-left' ? 'items-start justify-start pt-8 pl-8' :
                currentSlideData.overlay.position === 'top-right' ? 'items-start justify-end pt-8 pr-8' :
                currentSlideData.overlay.position === 'bottom-left' ? 'items-end justify-start pb-8 pl-8' :
                currentSlideData.overlay.position === 'bottom-right' ? 'items-end justify-end pb-8 pr-8' :
                'items-center justify-center'
              }`}
              style={{
                backgroundColor: `${currentSlideData.overlay.color}${Math.round(currentSlideData.overlay.opacity * 255).toString(16).padStart(2, '0')}`
              }}
            >
              {currentSlideData.content && (
                <div className="text-white text-center max-w-2xl p-8">
                  {currentSlideData.content.title && (
                    <h2 className="text-4xl font-bold mb-4">{currentSlideData.content.title}</h2>
                  )}
                  {currentSlideData.content.subtitle && (
                    <p className="text-xl mb-6 opacity-90">{currentSlideData.content.subtitle}</p>
                  )}
                  {currentSlideData.content.description && (
                    <p className="text-lg mb-8 opacity-80">{currentSlideData.content.description}</p>
                  )}
                  {currentSlideData.content.button && (
                    <a
                      href={currentSlideData.content.button.url}
                      className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                        currentSlideData.content.button.style === 'primary' 
                          ? 'bg-white text-primary-600 hover:bg-gray-100'
                          : currentSlideData.content.button.style === 'secondary'
                          ? 'bg-primary-700 text-white hover:bg-primary-800'
                          : 'border-2 border-white text-white hover:bg-white hover:text-primary-600'
                      }`}
                    >
                      {currentSlideData.content.button.text}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {props.showArrows && props.slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                props.navigation.arrowStyle === 'minimal' ? 'bg-transparent' :
                props.navigation.arrowStyle === 'rounded' ? 'bg-black bg-opacity-50 hover:bg-opacity-75' :
                props.navigation.arrowStyle === 'square' ? 'bg-black bg-opacity-50 rounded-none hover:bg-opacity-75' :
                'bg-black bg-opacity-50 hover:bg-opacity-75'
              }`}
              style={{ 
                color: props.navigation.arrowColor,
                fontSize: props.navigation.arrowSize === 'sm' ? '16px' : props.navigation.arrowSize === 'lg' ? '24px' : '20px'
              }}
              disabled={!props.infinite && currentSlide === 0}
            >
              <ChevronLeft className={`w-${props.navigation.arrowSize === 'sm' ? '4' : props.navigation.arrowSize === 'lg' ? '8' : '6'} h-${props.navigation.arrowSize === 'sm' ? '4' : props.navigation.arrowSize === 'lg' ? '8' : '6'}`} />
            </button>
            
            <button
              onClick={nextSlide}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                props.navigation.arrowStyle === 'minimal' ? 'bg-transparent' :
                props.navigation.arrowStyle === 'rounded' ? 'bg-black bg-opacity-50 hover:bg-opacity-75' :
                props.navigation.arrowStyle === 'square' ? 'bg-black bg-opacity-50 rounded-none hover:bg-opacity-75' :
                'bg-black bg-opacity-50 hover:bg-opacity-75'
              }`}
              style={{ 
                color: props.navigation.arrowColor,
                fontSize: props.navigation.arrowSize === 'sm' ? '16px' : props.navigation.arrowSize === 'lg' ? '24px' : '20px'
              }}
              disabled={!props.infinite && currentSlide === props.slides.length - 1}
            >
              <ChevronRight className={`w-${props.navigation.arrowSize === 'sm' ? '4' : props.navigation.arrowSize === 'lg' ? '8' : '6'} h-${props.navigation.arrowSize === 'sm' ? '4' : props.navigation.arrowSize === 'lg' ? '8' : '6'}`} />
            </button>
          </>
        )}

        {/* Play/pause button */}
        {props.autoplay && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {props.showProgress && props.slides.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / props.slides.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Dots indicator */}
      {props.showDots && props.slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {props.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                props.navigation.dotStyle === 'line' ? 
                  `h-1 ${index === currentSlide ? 'w-8' : 'w-4'}` :
                props.navigation.dotStyle === 'square' ? 
                  `w-3 h-3 rounded-none` :
                `w-3 h-3 rounded-full`
              }`}
              style={{
                backgroundColor: index === currentSlide ? props.navigation.dotActiveColor : props.navigation.dotColor,
                width: props.navigation.dotSize === 'sm' ? '8px' : props.navigation.dotSize === 'lg' ? '16px' : '12px',
                height: props.navigation.dotSize === 'sm' ? '8px' : props.navigation.dotSize === 'lg' ? '16px' : '12px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};