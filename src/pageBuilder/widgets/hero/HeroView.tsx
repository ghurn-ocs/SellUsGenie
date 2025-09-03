/**
 * Hero Widget View
 * Renders hero banners in the page builder canvas and public pages
 */

import React from 'react';
import { WidgetViewProps } from '../../types';
import { HeroProps } from './index';

export const HeroView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  // Provide default values for all props to prevent crashes
  const props = {
    title: 'Welcome to Our Store',
    subtitle: 'Discover amazing products and great deals',
    backgroundType: 'color',
    backgroundColor: '#f3f4f6',
    textColor: '#000000',
    alignment: 'center',
    height: 'medium',
    overlay: false,
    overlayOpacity: 0.3,
    ctaText: 'Shop Now',
    ctaLink: '#',
    ctaVariant: 'primary',
    ...(widget.props as HeroProps)
  } as HeroProps;

  // Height classes
  const heightClasses = {
    small: 'h-64',
    medium: 'h-96',
    large: 'h-screen',
    full: 'h-screen'
  };

  // Background styles
  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: props.backgroundColor
    };

    if (props.backgroundType === 'image' && props.backgroundImage) {
      baseStyle.backgroundImage = `url(${props.backgroundImage})`;
      baseStyle.backgroundSize = 'cover';
      baseStyle.backgroundPosition = 'center';
      baseStyle.backgroundRepeat = 'no-repeat';
    }

    return baseStyle;
  };

  // Text alignment classes
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  // CTA button styles
  const ctaStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white', 
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent'
  };

  return (
    <div 
      className={`relative flex flex-col justify-center px-8 py-16 ${heightClasses[props.height]} ${alignmentClasses[props.alignment]}`}
      style={getBackgroundStyle()}
    >
      {/* Overlay */}
      {props.overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: props.overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Title */}
        <h1 
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ color: props.textColor }}
        >
          {props.title}
        </h1>

        {/* Subtitle */}
        {props.subtitle && (
          <p 
            className="text-xl md:text-2xl mb-8 opacity-90"
            style={{ color: props.textColor }}
          >
            {props.subtitle}
          </p>
        )}

        {/* CTA Button */}
        {props.ctaText && props.ctaLink && (
          <a
            href={props.ctaLink}
            className={`inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${ctaStyles[props.ctaVariant]}`}
          >
            {props.ctaText}
          </a>
        )}
      </div>
    </div>
  );
};