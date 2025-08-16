/**
 * Button Widget View
 * Renders button in the page builder canvas and public pages
 */

import React from 'react';
import { WidgetViewProps } from '../../types';
import { ButtonProps } from './index';

export const ButtonView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const props = widget.props as ButtonProps;

  // Apply theme overrides if provided
  const getThemeColor = (colorClass: string) => {
    if (!theme) return colorClass;
    
    // Map Tailwind color classes to theme tokens
    const colorMap: Record<string, string> = {
      'bg-primary-600': theme['--color-primary'] || colorClass,
      'text-primary-600': theme['--color-primary'] || colorClass,
      'hover:bg-primary-700': theme['--color-primary-dark'] || colorClass,
      'hover:text-primary-700': theme['--color-primary-dark'] || colorClass,
    };
    
    return colorMap[colorClass] || colorClass;
  };

  // Build button classes based on variant and size
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: `${getThemeColor('bg-primary-600')} text-white ${getThemeColor('hover:bg-primary-700')} focus:ring-primary-500`,
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      link: `${getThemeColor('text-primary-600')} ${getThemeColor('hover:text-primary-700')} underline focus:ring-primary-500`
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const widthClass = props.fullWidth ? 'w-full' : '';
    const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

    return [
      baseClasses,
      variantClasses[props.variant],
      sizeClasses[props.size],
      widthClass,
      disabledClass
    ].filter(Boolean).join(' ');
  };

  // Handle button click
  const handleClick = (e: React.MouseEvent) => {
    if (props.disabled) {
      e.preventDefault();
      return;
    }

    // Handle custom action if provided
    if (props.onClick) {
      try {
        // In a real implementation, you'd want to sandbox this
        // For now, we'll just log it
        console.log('Custom button action:', props.onClick);
      } catch (error) {
        console.error('Error executing custom button action:', error);
      }
    }
  };

  // Render button content
  const renderButtonContent = () => {
    const icon = props.icon ? (
      <span className={props.iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
        {props.icon}
      </span>
    ) : null;

    return (
      <>
        {props.iconPosition === 'left' && icon}
        {props.label}
        {props.iconPosition === 'right' && icon}
      </>
    );
  };

  // Handle visibility based on breakpoints
  const visibilityClasses = [];
  if (widget.visibility) {
    if (widget.visibility.sm === false) visibilityClasses.push('hidden sm:block');
    if (widget.visibility.md === false) visibilityClasses.push('sm:hidden md:block');
    if (widget.visibility.lg === false) visibilityClasses.push('md:hidden lg:block');
  }

  // Render as link or button
  if (props.href) {
    return (
      <div className={visibilityClasses.join(' ')}>
        <a
          href={props.href}
          target={props.openInNewTab ? '_blank' : undefined}
          rel={props.openInNewTab ? 'noopener noreferrer' : undefined}
          className={getButtonClasses()}
          onClick={handleClick}
          aria-disabled={props.disabled}
        >
          {renderButtonContent()}
        </a>
      </div>
    );
  }

  return (
    <div className={visibilityClasses.join(' ')}>
      <button
        type="button"
        className={getButtonClasses()}
        onClick={handleClick}
        disabled={props.disabled}
        aria-disabled={props.disabled}
      >
        {renderButtonContent()}
      </button>
    </div>
  );
};

