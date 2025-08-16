/**
 * Text Widget View
 * Renders text content in the page builder canvas and public pages
 */

import React from 'react';
import { WidgetViewProps } from '../../types';
import { TextProps } from './index';

export const TextView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const props = widget.props as TextProps;

  // Apply theme overrides if provided
  const getThemeColor = (colorClass: string) => {
    if (!theme) return colorClass;
    
    // Map Tailwind color classes to theme tokens
    const colorMap: Record<string, string> = {
      'text-primary-600': theme['--color-primary'] || colorClass,
      'text-gray-900': theme['--color-text-primary'] || colorClass,
      'text-gray-700': theme['--color-text-secondary'] || colorClass,
      'text-gray-500': theme['--color-text-tertiary'] || colorClass,
    };
    
    return colorMap[colorClass] || colorClass;
  };

  // Build CSS classes
  const textClasses = [
    getThemeColor(props.color),
    `text-${props.fontSize}`,
    `font-${props.fontWeight}`,
    `text-${props.textAlign}`,
    `leading-${props.lineHeight}`,
    props.maxWidth || '',
  ].filter(Boolean).join(' ');

  // Sanitize content if HTML is not allowed
  const renderContent = () => {
    if (props.allowHtml) {
      // Basic HTML sanitization - only allow safe tags
      const sanitizedContent = props.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
      
      return (
        <div 
          className={textClasses}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      );
    } else {
      // Plain text with line breaks
      const lines = props.content.split('\n');
      return (
        <div className={textClasses}>
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      );
    }
  };

  // Handle visibility based on breakpoints
  const visibilityClasses = [];
  if (widget.visibility) {
    if (widget.visibility.sm === false) visibilityClasses.push('hidden sm:block');
    if (widget.visibility.md === false) visibilityClasses.push('sm:hidden md:block');
    if (widget.visibility.lg === false) visibilityClasses.push('md:hidden lg:block');
  }

  return (
    <div className={`${visibilityClasses.join(' ')}`}>
      {renderContent()}
    </div>
  );
};

