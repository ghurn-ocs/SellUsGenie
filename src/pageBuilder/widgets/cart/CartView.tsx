/**
 * Cart Widget View
 * Displays shopping cart icon/button in Visual Page Builder pages
 * Configurable appearance and behavior for storefronts
 */

import React from 'react';
import { useLocation } from 'wouter';
import { ShoppingCart, ShoppingBag, Package } from 'lucide-react';
import { WidgetViewProps } from '../../types';
import { CartProps } from './index';
import { useCart } from '../../../contexts/CartContext';

export const CartView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const [location, setLocation] = useLocation();
  
  const props = {
    // Display Style Options
    displayStyle: 'icon', // 'icon' | 'button' | 'text' | 'icon-text'
    buttonText: 'Cart',
    iconStyle: 'shopping-cart', // 'shopping-cart' | 'shopping-bag' | 'package'
    showCount: true,
    
    // Behavior Options  
    behavior: 'side-panel', // 'side-panel' | 'dropdown' | 'page-navigation'
    
    // Styling Options
    size: 'medium', // 'small' | 'medium' | 'large'
    color: 'default', // 'default' | 'primary' | 'secondary' | 'white' | 'dark'
    alignment: 'center', // 'left' | 'center' | 'right'
    
    ...(widget.props as CartProps)
  } as CartProps;

  // Get cart context safely
  let cartContext;
  try {
    cartContext = useCart();
  } catch (error) {
    // Fallback when cart context is not available (e.g., in page builder)
    return (
      <div className={`cart-widget-preview ${getAlignmentClass(props.alignment)}`}>
        <div className="text-gray-500 text-sm mb-2">Cart Widget (Preview)</div>
        {renderCartPreview(props)}
      </div>
    );
  }

  const { itemCount, setIsOpen } = cartContext;

  // Handle cart interaction based on behavior setting
  const handleCartClick = () => {
    switch (props.behavior) {
      case 'side-panel':
        setIsOpen(true);
        break;
      case 'dropdown':
        // TODO: Implement dropdown cart behavior
        setIsOpen(true);
        break;
      case 'page-navigation':
        // Navigate to cart page using client-side routing
        const storeMatch = location.match(/^\/store\/([^\/]+)/);
        if (storeMatch) {
          const storeSlug = storeMatch[1];
          setLocation(`/store/${storeSlug}/cart`);
        } else {
          setLocation('/cart');
        }
        break;
      default:
        setIsOpen(true);
    }
  };

  return (
    <div className={`cart-widget ${getAlignmentClass(props.alignment)}`}>
      {renderCart(props, itemCount, handleCartClick)}
    </div>
  );
};

/**
 * Get alignment CSS class
 */
function getAlignmentClass(alignment: string): string {
  switch (alignment) {
    case 'left': return 'flex justify-start';
    case 'center': return 'flex justify-center';
    case 'right': return 'flex justify-end';
    default: return 'flex justify-center';
  }
}

/**
 * Get icon component based on style
 */
function getCartIcon(iconStyle: string, size: string) {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8'
  }[size] || 'w-6 h-6';

  switch (iconStyle) {
    case 'shopping-bag': return <ShoppingBag className={sizeClass} />;
    case 'package': return <Package className={sizeClass} />;
    case 'shopping-cart':
    default: return <ShoppingCart className={sizeClass} />;
  }
}

/**
 * Get color classes based on color setting
 */
function getColorClasses(color: string): string {
  switch (color) {
    case 'primary': return 'text-primary-600 hover:text-primary-700';
    case 'secondary': return 'text-gray-600 hover:text-gray-700';
    case 'white': return 'text-white hover:text-gray-200';
    case 'dark': return 'text-gray-900 hover:text-gray-700';
    case 'default':
    default: return 'text-gray-600 hover:text-gray-900';
  }
}

/**
 * Get size classes
 */
function getSizeClasses(size: string): string {
  switch (size) {
    case 'small': return 'text-sm px-2 py-1';
    case 'large': return 'text-lg px-4 py-3';
    case 'medium':
    default: return 'text-base px-3 py-2';
  }
}

/**
 * Render cart for preview mode (in page builder)
 */
function renderCartPreview(props: CartProps): React.ReactNode {
  const icon = getCartIcon(props.iconStyle, props.size);
  const colorClasses = getColorClasses(props.color);
  const sizeClasses = getSizeClasses(props.size);

  switch (props.displayStyle) {
    case 'button':
      return (
        <button className={`bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${sizeClasses}`}>
          <div className="flex items-center gap-2">
            {icon}
            <span>{props.buttonText}</span>
            {props.showCount && (
              <span className="bg-white text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                3
              </span>
            )}
          </div>
        </button>
      );
    
    case 'text':
      return (
        <button className={`font-medium transition-colors ${colorClasses} ${sizeClasses}`}>
          {props.buttonText}
          {props.showCount && (
            <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              3
            </span>
          )}
        </button>
      );
    
    case 'icon-text':
      return (
        <button className={`flex items-center gap-2 font-medium transition-colors ${colorClasses} ${sizeClasses}`}>
          {icon}
          <span>{props.buttonText}</span>
          {props.showCount && (
            <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
              3
            </span>
          )}
        </button>
      );
    
    case 'icon':
    default:
      return (
        <button className={`relative transition-colors ${colorClasses} ${sizeClasses}`}>
          {icon}
          {props.showCount && (
            <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
              3
            </span>
          )}
        </button>
      );
  }
}

/**
 * Render cart with actual functionality
 */
function renderCart(props: CartProps, itemCount: number, handleClick: () => void): React.ReactNode {
  const icon = getCartIcon(props.iconStyle, props.size);
  const colorClasses = getColorClasses(props.color);
  const sizeClasses = getSizeClasses(props.size);

  switch (props.displayStyle) {
    case 'button':
      return (
        <button 
          onClick={handleClick}
          className={`bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${sizeClasses}`}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{props.buttonText}</span>
            {props.showCount && itemCount > 0 && (
              <span className="bg-white text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
        </button>
      );
    
    case 'text':
      return (
        <button 
          onClick={handleClick}
          className={`font-medium transition-colors ${colorClasses} ${sizeClasses}`}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          {props.buttonText}
          {props.showCount && itemCount > 0 && (
            <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      );
    
    case 'icon-text':
      return (
        <button 
          onClick={handleClick}
          className={`flex items-center gap-2 font-medium transition-colors ${colorClasses} ${sizeClasses}`}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          {icon}
          <span>{props.buttonText}</span>
          {props.showCount && itemCount > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      );
    
    case 'icon':
    default:
      return (
        <button 
          onClick={handleClick}
          className={`relative transition-colors ${colorClasses} ${sizeClasses}`}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          {icon}
          {props.showCount && itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      );
  }
}