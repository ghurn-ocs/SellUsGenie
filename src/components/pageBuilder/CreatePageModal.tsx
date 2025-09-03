/**
 * Create Page Modal
 * Handles creation of different page types with appropriate editors
 */

import React, { useState } from 'react';
import { X, FileText, Layout, AlignJustify, Plus } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

export interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePage: (pageData: {
    name: string;
    pageType: 'page' | 'header' | 'footer';
    navigationPlacement: 'header' | 'footer' | 'both' | 'none';
    slug?: string;
  }) => void;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  onClose,
  onCreatePage
}) => {
  const [pageName, setPageName] = useState('');
  const [pageType, setPageType] = useState<'page' | 'header' | 'footer'>('page');
  const [navigationPlacement, setNavigationPlacement] = useState<'header' | 'footer' | 'both' | 'none'>('both');
  const [customSlug, setCustomSlug] = useState('');
  const modal = useModal();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pageName.trim()) {
      await modal.showWarning(
        'Page Name Required',
        'Please enter a name for your new page.'
      );
      return;
    }

    // Auto-generate slug if not provided
    const slug = customSlug.trim() || `/${pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

    onCreatePage({
      name: pageName.trim(),
      pageType,
      navigationPlacement: pageType === 'header' || pageType === 'footer' ? 'none' : navigationPlacement,
      slug: pageType === 'header' || pageType === 'footer' ? null : slug
    });

    // Reset form
    setPageName('');
    setPageType('page');
    setNavigationPlacement('both');
    setCustomSlug('');
    onClose();
  };

  const pageTypes = [
    {
      id: 'page' as const,
      name: 'Regular Page',
      description: 'Standard page with full visual editor',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'header' as const,
      name: 'Header',
      description: 'Site header with navigation and branding',
      icon: Layout,
      color: 'green'
    },
    {
      id: 'footer' as const,
      name: 'Footer', 
      description: 'Site footer with links and company info',
      icon: AlignJustify,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-900' 
        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
      green: isSelected
        ? 'border-green-500 bg-green-50 text-green-900'
        : 'border-gray-200 hover:border-green-300 hover:bg-green-50',
      purple: isSelected
        ? 'border-purple-500 bg-purple-50 text-purple-900'
        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 py-4 border-b bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Page
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Page Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Page Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pageTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = pageType === type.id;
                    
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPageType(type.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${getColorClasses(type.color, isSelected)}`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <p className="text-sm opacity-80">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Page Name */}
              <div>
                <label htmlFor="pageName" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Name *
                </label>
                <input
                  type="text"
                  id="pageName"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter page name..."
                  autoFocus
                />
              </div>

              {/* URL Slug (only for regular pages) */}
              {pageType === 'page' && (
                <div>
                  <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Path (optional)
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      /
                    </span>
                    <input
                      type="text"
                      id="customSlug"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="auto-generated from name"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate from page name
                  </p>
                </div>
              )}

              {/* Navigation Placement (only for regular pages) */}
              {pageType === 'page' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show in Navigation
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'both', label: 'Header & Footer' },
                      { id: 'header', label: 'Header Only' },
                      { id: 'footer', label: 'Footer Only' },
                      { id: 'none', label: 'Hidden' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setNavigationPlacement(option.id as any)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          navigationPlacement === option.id
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Page Info */}
              {pageType !== 'page' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-amber-900">!</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-900">Special Page Editor</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        {pageType === 'header' 
                          ? 'Header pages use a specialized editor for branding, navigation, and layout customization.'
                          : 'Footer pages use a specialized editor for company information, links, and legal content.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Create Page
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};