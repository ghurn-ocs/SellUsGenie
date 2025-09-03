/**
 * System Page Modal
 * Professional modal for informing users about system page editing restrictions
 */

import React from 'react';
import { X, Settings, Lock, Info, ExternalLink } from 'lucide-react';

interface SystemPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageType: 'about' | 'privacy' | 'terms' | 'returns';
  pageName: string;
}

const MODAL_CONTENT = {
  about: {
    title: 'About Us Page',
    description: 'This page content is managed through your store policies for consistency across your website.',
    icon: Info,
    settingsPath: 'Settings → Policies → About Us',
    benefits: [
      'Consistent messaging across your entire website',
      'Easy updates from a single location',
      'SEO-optimized content structure',
      'Professional formatting applied automatically'
    ]
  },
  privacy: {
    title: 'Privacy Policy Page',
    description: 'Privacy Policy content is managed through Settings to ensure legal compliance and consistency.',
    icon: Lock,
    settingsPath: 'Settings → Policies → Privacy Policy',
    benefits: [
      'Legal compliance with privacy regulations',
      'Consistent policy across all touchpoints',
      'Easy updates without technical knowledge',
      'Professional legal document formatting'
    ]
  },
  terms: {
    title: 'Terms & Conditions Page',
    description: 'Terms & Conditions content is managed through Settings to maintain legal accuracy.',
    icon: Lock,
    settingsPath: 'Settings → Policies → Terms & Conditions',
    benefits: [
      'Legal protection for your business',
      'Consistent terms across your platform',
      'Professional legal document structure',
      'Easy updates when policies change'
    ]
  },
  returns: {
    title: 'Returns Policy Page',
    description: 'Returns Policy content is managed through Settings to ensure consistency and clarity.',
    icon: Lock,
    settingsPath: 'Settings → Policies → Returns Policy',
    benefits: [
      'Clear customer expectations',
      'Consistent policy communication',
      'Easy updates for seasonal changes',
      'Professional policy formatting'
    ]
  }
};

export const SystemPageModal: React.FC<SystemPageModalProps> = ({
  isOpen,
  onClose,
  pageType,
  pageName
}) => {
  const content = MODAL_CONTENT[pageType];
  const IconComponent = content.icon;

  if (!isOpen) return null;

  const handleSettingsNavigation = () => {
    // Close modal and navigate to settings
    onClose();
    // You can add navigation logic here if needed
    window.alert(`Navigate to ${content.settingsPath} to edit this content.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {content.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            {content.description}
          </p>

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Why this approach?
            </h4>
            <ul className="space-y-2">
              {content.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings Path */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Edit Content Location
              </span>
            </div>
            <p className="text-sm text-gray-700">
              To modify this page content, go to{' '}
              <span className="font-mono bg-white px-2 py-1 rounded border text-purple-700">
                {content.settingsPath}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Got it
          </button>
          <button
            onClick={handleSettingsNavigation}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Go to Settings</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};