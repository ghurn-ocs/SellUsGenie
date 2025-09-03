/**
 * Cart Widget Editor
 * Configuration panel for shopping cart widget in Visual Page Builder
 */

import React from 'react';
import { WidgetEditorProps } from '../../types';
import { CartProps } from './index';

export const CartEditor: React.FC<WidgetEditorProps> = ({ widget, updateWidget }) => {
  const props = widget.props as CartProps;

  const updateProp = (key: keyof CartProps, value: any) => {
    updateWidget({
      ...widget,
      props: {
        ...props,
        [key]: value
      }
    });
  };

  return (
    <div className="widget-editor">
      <div className="widget-editor-header">
        <h3 className="text-lg font-semibold text-gray-900">Shopping Cart Settings</h3>
        <p className="text-sm text-gray-600">Configure how the shopping cart appears and behaves on your storefront</p>
      </div>

      <div className="space-y-6">
        {/* Display Style Section */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Display Style
          </label>
          <select
            className="widget-editor-input"
            value={props.displayStyle || 'icon'}
            onChange={(e) => updateProp('displayStyle', e.target.value)}
          >
            <option value="icon">Icon Only</option>
            <option value="button">Button with Background</option>
            <option value="text">Text Only</option>
            <option value="icon-text">Icon + Text</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">How the cart should appear to customers</p>
        </div>

        {/* Button Text (when applicable) */}
        {(props.displayStyle === 'button' || props.displayStyle === 'text' || props.displayStyle === 'icon-text') && (
          <div className="widget-editor-section">
            <label className="widget-editor-label">
              Button Text
            </label>
            <input
              type="text"
              className="widget-editor-input"
              value={props.buttonText || 'Cart'}
              onChange={(e) => updateProp('buttonText', e.target.value)}
              placeholder="Cart"
            />
            <p className="text-xs text-gray-500 mt-1">Text to display with the cart</p>
          </div>
        )}

        {/* Icon Style */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Icon Style
          </label>
          <select
            className="widget-editor-input"
            value={props.iconStyle || 'shopping-cart'}
            onChange={(e) => updateProp('iconStyle', e.target.value)}
          >
            <option value="shopping-cart">Shopping Cart</option>
            <option value="shopping-bag">Shopping Bag</option>
            <option value="package">Package</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Icon to represent the cart</p>
        </div>

        {/* Show Item Count */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Show Item Count
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="widget-editor-checkbox"
              checked={props.showCount !== false}
              onChange={(e) => updateProp('showCount', e.target.checked)}
            />
            <span className="text-sm text-gray-700">Display number of items in cart</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Shows a badge with the number of items</p>
        </div>

        {/* Behavior Section */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Cart Behavior
          </label>
          <select
            className="widget-editor-input"
            value={props.behavior || 'side-panel'}
            onChange={(e) => updateProp('behavior', e.target.value)}
          >
            <option value="side-panel">Side Panel (Slide Out)</option>
            <option value="dropdown">Dropdown Menu</option>
            <option value="page-navigation">Navigate to Cart Page</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">What happens when customers click the cart</p>
        </div>

        {/* Size Section */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Size
          </label>
          <select
            className="widget-editor-input"
            value={props.size || 'medium'}
            onChange={(e) => updateProp('size', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Size of the cart icon and text</p>
        </div>

        {/* Color Section */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Color Theme
          </label>
          <select
            className="widget-editor-input"
            value={props.color || 'default'}
            onChange={(e) => updateProp('color', e.target.value)}
          >
            <option value="default">Default Gray</option>
            <option value="primary">Primary Brand Color</option>
            <option value="secondary">Secondary Color</option>
            <option value="white">White</option>
            <option value="dark">Dark</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Color scheme for the cart widget</p>
        </div>

        {/* Alignment Section */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Alignment
          </label>
          <select
            className="widget-editor-input"
            value={props.alignment || 'center'}
            onChange={(e) => updateProp('alignment', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">How to align the cart within its container</p>
        </div>

        {/* Preview Section */}
        <div className="widget-editor-section">
          <label className="widget-editor-label">
            Preview
          </label>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">How it will appear on your storefront:</div>
            <div className={`${
              props.alignment === 'left' ? 'flex justify-start' : 
              props.alignment === 'right' ? 'flex justify-end' : 
              'flex justify-center'
            }`}>
              <div className="cart-preview">
                {/* This would render the actual CartView component in preview mode */}
                <div className="text-primary-600 text-sm">Cart Preview (Updates Live)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="widget-editor-section">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use "Side Panel" for the best mobile experience</li>
              <li>• "Icon + Text" works great in headers</li>
              <li>• Match your cart color to your brand theme</li>
              <li>• Enable item count to increase customer engagement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};