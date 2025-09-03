/**
 * Subscribe Widget Editor
 * Configuration interface for the subscribe widget
 */

import React from 'react';
import { WidgetEditorProps } from '../../types';
import { SubscribeProps } from './index';

export const SubscribeEditor: React.FC<WidgetEditorProps<SubscribeProps>> = ({
  props,
  onChange
}) => {
  // Provide default values for all props to prevent crashes
  const safeProps: SubscribeProps = {
    title: 'Stay Updated',
    subtitle: 'Subscribe to our newsletter for the latest updates and exclusive offers',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing! We\'ll keep you updated.',
    errorMessage: 'Something went wrong. Please try again.',
    showPrivacyText: true,
    privacyText: 'We respect your privacy and will never share your email address.',
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-900',
    buttonColor: 'bg-primary-600 hover:bg-primary-700',
    buttonTextColor: 'text-white',
    borderRadius: 'md',
    layout: 'horizontal',
    alignment: 'center',
    padding: 'p-6',
    ...props
  };

  const updateProp = (key: keyof SubscribeProps, value: any) => {
    onChange({ ...safeProps, [key]: value });
  };

  return (
    <div className="widget-editor">
      <div className="widget-editor-header">
        <h3 className="text-lg font-semibold text-gray-900">Subscribe Widget Settings</h3>
        <p className="text-sm text-gray-600 mt-1">Configure your newsletter subscription form</p>
      </div>

      <div className="space-y-6">
        {/* Content Settings */}
        <div className="widget-editor-section">
          <h4 className="widget-editor-section-title">Content</h4>
          
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Title</label>
              <input
                type="text"
                value={safeProps.title}
                onChange={(e) => updateProp('title', e.target.value)}
                placeholder="Stay Updated"
                className="widget-editor-input"
              />
            </div>

            <div>
              <label className="widget-editor-label">Subtitle</label>
              <textarea
                value={safeProps.subtitle}
                onChange={(e) => updateProp('subtitle', e.target.value)}
                placeholder="Subscribe to our newsletter..."
                rows={2}
                className="widget-editor-input"
              />
            </div>

            <div>
              <label className="widget-editor-label">Email Placeholder</label>
              <input
                type="text"
                value={safeProps.placeholder}
                onChange={(e) => updateProp('placeholder', e.target.value)}
                placeholder="Enter your email address"
                className="widget-editor-input"
              />
            </div>

            <div>
              <label className="widget-editor-label">Button Text</label>
              <input
                type="text"
                value={safeProps.buttonText}
                onChange={(e) => updateProp('buttonText', e.target.value)}
                placeholder="Subscribe"
                className="widget-editor-input"
              />
            </div>
          </div>
        </div>

        {/* Messages Settings */}
        <div className="widget-editor-section">
          <h4 className="widget-editor-section-title">Messages</h4>
          
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Success Message</label>
              <textarea
                value={safeProps.successMessage}
                onChange={(e) => updateProp('successMessage', e.target.value)}
                placeholder="Thank you for subscribing!"
                rows={2}
                className="widget-editor-input"
              />
            </div>

            <div>
              <label className="widget-editor-label">Error Message</label>
              <textarea
                value={safeProps.errorMessage}
                onChange={(e) => updateProp('errorMessage', e.target.value)}
                placeholder="Something went wrong..."
                rows={2}
                className="widget-editor-input"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="widget-editor-section">
          <h4 className="widget-editor-section-title">Privacy</h4>
          
          <div className="space-y-4">
            <div>
              <label className="widget-editor-checkbox">
                <input
                  type="checkbox"
                  checked={safeProps.showPrivacyText}
                  onChange={(e) => updateProp('showPrivacyText', e.target.checked)}
                />
                <span>Show Privacy Text</span>
              </label>
            </div>

            {safeProps.showPrivacyText && (
              <div>
                <label className="widget-editor-label">Privacy Text</label>
                <textarea
                  value={safeProps.privacyText}
                  onChange={(e) => updateProp('privacyText', e.target.value)}
                  placeholder="We respect your privacy..."
                  rows={2}
                  className="widget-editor-input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Layout Settings */}
        <div className="widget-editor-section">
          <h4 className="widget-editor-section-title">Layout</h4>
          
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Layout Style</label>
              <select
                value={safeProps.layout}
                onChange={(e) => updateProp('layout', e.target.value)}
                className="widget-editor-input"
              >
                <option value="horizontal">Horizontal (Email and button side by side)</option>
                <option value="vertical">Vertical (Email and button stacked)</option>
              </select>
            </div>

            <div>
              <label className="widget-editor-label">Alignment</label>
              <select
                value={safeProps.alignment}
                onChange={(e) => updateProp('alignment', e.target.value)}
                className="widget-editor-input"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="widget-editor-label">Border Radius</label>
              <select
                value={safeProps.borderRadius}
                onChange={(e) => updateProp('borderRadius', e.target.value)}
                className="widget-editor-input"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Rounded</option>
              </select>
            </div>

            <div>
              <label className="widget-editor-label">Padding</label>
              <select
                value={safeProps.padding}
                onChange={(e) => updateProp('padding', e.target.value)}
                className="widget-editor-input"
              >
                <option value="p-2">Small</option>
                <option value="p-4">Medium</option>
                <option value="p-6">Large</option>
                <option value="p-8">Extra Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Style Settings */}
        <div className="widget-editor-section">
          <h4 className="widget-editor-section-title">Styling</h4>
          
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Background Color</label>
              <select
                value={safeProps.backgroundColor}
                onChange={(e) => updateProp('backgroundColor', e.target.value)}
                className="widget-editor-input"
              >
                <option value="bg-transparent">Transparent</option>
                <option value="bg-white">White</option>
                <option value="bg-gray-50">Light Gray</option>
                <option value="bg-gray-100">Gray</option>
                <option value="bg-primary-50">Light Primary</option>
                <option value="bg-primary-100">Primary Light</option>
                <option value="bg-blue-50">Light Blue</option>
                <option value="bg-green-50">Light Green</option>
              </select>
            </div>

            <div>
              <label className="widget-editor-label">Text Color</label>
              <select
                value={safeProps.textColor}
                onChange={(e) => updateProp('textColor', e.target.value)}
                className="widget-editor-input"
              >
                <option value="text-gray-900">Dark Gray</option>
                <option value="text-gray-700">Medium Gray</option>
                <option value="text-black">Black</option>
                <option value="text-white">White</option>
                <option value="text-primary-600">Primary Color</option>
              </select>
            </div>

            <div>
              <label className="widget-editor-label">Button Color</label>
              <select
                value={safeProps.buttonColor}
                onChange={(e) => updateProp('buttonColor', e.target.value)}
                className="widget-editor-input"
              >
                <option value="bg-primary-600 hover:bg-primary-700">Primary</option>
                <option value="bg-blue-600 hover:bg-blue-700">Blue</option>
                <option value="bg-green-600 hover:bg-green-700">Green</option>
                <option value="bg-purple-600 hover:bg-purple-700">Purple</option>
                <option value="bg-red-600 hover:bg-red-700">Red</option>
                <option value="bg-gray-800 hover:bg-gray-900">Dark Gray</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};