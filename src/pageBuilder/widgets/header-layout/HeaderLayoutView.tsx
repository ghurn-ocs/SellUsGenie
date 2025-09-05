/**
 * Header Layout Widget View
 * Provides comprehensive header layout editing within Visual Page Builder
 */

import React from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import type { Widget } from '../../types';
import { useStore } from '../../../contexts/StoreContext';

export interface HeaderLayoutProps {
  // Layout Configuration
  layout: 'logo-left' | 'logo-center' | 'logo-right' | 'custom';
  height: 'compact' | 'standard' | 'tall';
  
  // Logo Configuration  
  logo: {
    type: 'text' | 'image' | 'both';
    text?: string;
    imageUrl?: string;
    imageAlt?: string;
    position: 'left' | 'center' | 'right';
    size: 'small' | 'medium' | 'large';
    link?: string;
    showTagline?: boolean; // Control tagline display
  };
  
  // Navigation Configuration
  navigation: {
    enabled: boolean;
    position: 'left' | 'center' | 'right';
    style: 'horizontal' | 'hamburger' | 'dropdown';
    links: Array<{
      id: string;
      label: string;
      href: string;
      type: 'internal' | 'external' | 'auto-detect';
      isActive?: boolean;
    }>;
    autoDetectPages: boolean; // Automatically include published pages
    // Navigation Link Styling
    borderEnabled?: boolean;
    borderStyle?: 'rounded' | 'square';
    borderColor?: string;
    borderTransparent?: boolean;
  };
  
  // Shopping Cart Configuration
  cart: {
    enabled: boolean;
    position: 'left' | 'center' | 'right';
    style: 'icon' | 'icon-text' | 'button';
    showCount: boolean;
    behavior: 'sidebar' | 'dropdown' | 'page';
  };
  
  // Styling Configuration
  styling: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    linkHoverColor: string;
    borderBottom: boolean;
    sticky: boolean;
    shadow: 'none' | 'sm' | 'md' | 'lg';
  };
  
  // Responsive Configuration
  responsive: {
    mobile: {
      showLogo: boolean;
      showNavigation: boolean;
      navigationStyle: 'hamburger' | 'hidden' | 'simplified';
      showCart: boolean;
    };
    tablet: {
      showLogo: boolean;
      showNavigation: boolean;
      showCart: boolean;
    };
  };
}

export const HeaderLayoutView: React.FC<{ widget: Widget<HeaderLayoutProps> }> = ({ widget }) => {
  const { props } = widget;
  const { currentStore } = useStore();
  
  const renderLogo = () => {
    if (!props.logo.type) return null;
    
    const logoContent = (
      <div className={`flex items-center ${
        props.logo.size === 'small' ? 'h-8' : 
        props.logo.size === 'large' ? 'h-16' : 'h-12'
      }`}>
        {(props.logo.type === 'image' || props.logo.type === 'both') && 
         props.logo.imageUrl !== null && (currentStore?.store_logo_url || props.logo.imageUrl) && (
          <img 
            src={currentStore?.store_logo_url || props.logo.imageUrl} 
            alt={props.logo.imageAlt || 'Company Logo'}
            className="h-full w-auto object-contain"
          />
        )}
        {(props.logo.type === 'text' || props.logo.type === 'both') && 
         props.logo.text !== null && (currentStore?.store_name || props.logo.text) && (
          <div className={`flex flex-col ${props.logo.type === 'both' ? 'ml-2' : ''}`}>
            <span className={`font-bold ${
              props.logo.size === 'small' ? 'text-lg' : 
              props.logo.size === 'large' ? 'text-3xl' : 'text-xl'
            }`}>
              {currentStore?.store_name || props.logo.text}
            </span>
            {props.logo.showTagline && currentStore?.store_tagline && (
              <span className={`text-sm opacity-75 ${
                props.logo.size === 'small' ? 'text-xs' : 
                props.logo.size === 'large' ? 'text-base' : 'text-sm'
              }`}>
                {currentStore.store_tagline}
              </span>
            )}
          </div>
        )}
      </div>
    );
    
    return props.logo.link ? (
      <a href={props.logo.link} className="block">
        {logoContent}
      </a>
    ) : logoContent;
  };
  
  const renderNavigation = () => {
    if (!props.navigation.enabled) return null;
    
    if (props.navigation.style === 'hamburger') {
      return (
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Menu className="h-6 w-6" />
        </button>
      );
    }
    
    return (
      <nav className="flex items-center space-x-6">
        {props.navigation.links.map((link) => {
          const borderRadius = props.navigation.borderStyle === 'square' ? 'rounded-none' : 'rounded-md';
          const linkClasses = `text-sm font-medium transition-colors px-3 py-2 ${borderRadius} ${
            props.navigation.borderEnabled ? 'border' : ''
          } ${
            link.isActive ? 'text-opacity-100 border-b-2 border-current' : 'text-opacity-70 hover:text-opacity-80'
          }`;
          
          const linkStyle: React.CSSProperties = {
            color: props.styling.linkColor,
            ...(props.navigation.borderEnabled && {
              borderColor: props.navigation.borderColor || props.styling.linkColor,
              backgroundColor: props.navigation.borderTransparent ? 'transparent' : undefined
            })
          };

          return (
            <a
              key={link.id}
              href={link.href}
              className={linkClasses}
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = props.styling.linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = props.styling.linkColor;
              }}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
    );
  };
  
  const renderCart = () => {
    if (!props.cart.enabled) return null;
    
    return (
      <button className={`relative flex items-center space-x-2 transition-colors hover:opacity-80 ${
        props.cart.style === 'button' ? 'px-4 py-2 bg-primary-600 text-white rounded-md' : ''
      }`}>
        <ShoppingCart className="h-5 w-5" />
        {props.cart.style === 'icon-text' && <span className="text-sm">Cart</span>}
        {props.cart.showCount && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        )}
      </button>
    );
  };
  
  const getLayoutClasses = () => {
    const baseClasses = `w-full flex items-center ${
      props.height === 'compact' ? 'h-16' : 
      props.height === 'tall' ? 'h-24' : 'h-20'
    } px-4 md:px-6 lg:px-8`;
    
    switch (props.layout) {
      case 'logo-left':
        return `${baseClasses} justify-between`;
      case 'logo-center':
        return `${baseClasses} justify-center relative`;
      case 'logo-right':
        return `${baseClasses} justify-between flex-row-reverse`;
      default:
        return baseClasses;
    }
  };
  
  const headerStyle = {
    backgroundColor: props.styling.backgroundColor,
    color: props.styling.textColor,
    ...(props.styling.borderBottom && { borderBottom: '1px solid rgba(0,0,0,0.1)' }),
    ...(props.styling.sticky && { position: 'sticky' as const, top: 0, zIndex: 50 }),
    ...(props.styling.shadow !== 'none' && { 
      boxShadow: props.styling.shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
                 props.styling.shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' :
                 '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    })
  };
  
  return (
    <header className="header-layout-widget" style={headerStyle}>
      <div className={getLayoutClasses()}>
        {/* Logo Section */}
        <div className={`flex items-center ${
          props.layout === 'logo-center' ? 'absolute left-1/2 transform -translate-x-1/2' : ''
        }`}>
          {renderLogo()}
        </div>
        
        {/* Navigation Section */}
        {props.layout !== 'logo-center' && (
          <div className={`flex items-center ${
            props.navigation.position === 'center' ? 'flex-1 justify-center' : 
            props.navigation.position === 'right' ? 'ml-auto' : ''
          }`}>
            {renderNavigation()}
          </div>
        )}
        
        {/* Cart Section */}
        <div className={`flex items-center ${
          props.layout === 'logo-center' ? 'absolute right-4' : 
          props.cart.position === 'left' ? 'order-first' : ''
        }`}>
          {renderCart()}
        </div>
        
        {/* Mobile Navigation Toggle (when applicable) */}
        <div className="md:hidden">
          {props.responsive.mobile.navigationStyle === 'hamburger' && (
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* Preview Indicators for Editor */}
      <div className="header-preview-overlay absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-md"></div>
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Header Layout
        </div>
      </div>
    </header>
  );
};

export default HeaderLayoutView;