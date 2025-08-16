/**
 * Image Widget View
 * Renders the image widget on canvas and public pages
 */

import React from 'react';
import type { WidgetViewProps } from '../../types';
import type { ImageProps } from './index';

export const ImageView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const props = widget.props as ImageProps;
  const {
    src,
    alt,
    width,
    height,
    objectFit,
    borderRadius,
    shadow,
    caption,
    link,
  } = props;

  // Shadow classes mapping
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Create image element
  const imageElement = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`w-full h-auto object-${objectFit} ${shadowClasses[shadow]}`}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
      onError={(e) => {
        // Fallback for broken images
        const target = e.target as HTMLImageElement;
        target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
      }}
    />
  );

  // Wrap in link if provided
  const content = link ? (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {imageElement}
    </a>
  ) : (
    imageElement
  );

  return (
    <div className="image-widget">
      {content}
      {caption && (
        <p className="text-sm text-gray-600 mt-2 text-center">{caption}</p>
      )}
    </div>
  );
};

