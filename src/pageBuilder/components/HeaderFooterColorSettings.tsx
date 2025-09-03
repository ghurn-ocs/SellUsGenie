import React, { useState } from 'react';
import { Navigation, Palette, Eye, RotateCcw } from 'lucide-react';
import type { ColorPalette, PageDocument } from '../types';

interface NavigationColorSettings {
  headerBackground?: string;
  headerText?: string;
  headerBorder?: string;
  footerBackground?: string;
  footerText?: string;
  footerBorder?: string;
  useCustomColors?: boolean;
}

interface HeaderFooterColorSettingsProps {
  document: PageDocument;
  onDocumentChange: (document: PageDocument) => void;
  colorPalette?: ColorPalette;
}

export const HeaderFooterColorSettings: React.FC<HeaderFooterColorSettingsProps> = ({
  document,
  onDocumentChange,
  colorPalette
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Get current navigation colors from document or use defaults
  const currentColors: NavigationColorSettings = {
    headerBackground: document.globalStyles?.colors?.['header-bg'] || colorPalette?.colors.headerBackground,
    headerText: document.globalStyles?.colors?.['header-text'] || colorPalette?.colors.headerText,
    headerBorder: document.globalStyles?.colors?.['header-border'] || colorPalette?.colors.border,
    footerBackground: document.globalStyles?.colors?.['footer-bg'] || colorPalette?.colors.footerBackground,
    footerText: document.globalStyles?.colors?.['footer-text'] || colorPalette?.colors.footerText,
    footerBorder: document.globalStyles?.colors?.['footer-border'] || colorPalette?.colors.border,
    useCustomColors: document.globalStyles?.colors?.['use-custom-navigation'] === 'true'
  };

  const updateNavigationColors = (updates: Partial<NavigationColorSettings>) => {
    const newGlobalStyles = {
      ...document.globalStyles,
      colors: {
        ...document.globalStyles?.colors,
        'header-bg': updates.headerBackground || currentColors.headerBackground,
        'header-text': updates.headerText || currentColors.headerText,
        'header-border': updates.headerBorder || currentColors.headerBorder,
        'footer-bg': updates.footerBackground || currentColors.footerBackground,
        'footer-text': updates.footerText || currentColors.footerText,
        'footer-border': updates.footerBorder || currentColors.footerBorder,
        'use-custom-navigation': updates.useCustomColors ? 'true' : 'false'
      }
    };

    onDocumentChange({
      ...document,
      globalStyles: newGlobalStyles,
      updatedAt: new Date().toISOString()
    });

    // Apply the navigation colors to the document
    if (typeof window !== 'undefined' && window.document) {
      const root = window.document.documentElement;
      if (updates.headerBackground) root.style.setProperty('--nav-header-bg', updates.headerBackground);
      if (updates.headerText) root.style.setProperty('--nav-header-text', updates.headerText);
      if (updates.headerBorder) root.style.setProperty('--nav-header-border', updates.headerBorder);
      if (updates.footerBackground) root.style.setProperty('--nav-footer-bg', updates.footerBackground);
      if (updates.footerText) root.style.setProperty('--nav-footer-text', updates.footerText);
      if (updates.footerBorder) root.style.setProperty('--nav-footer-border', updates.footerBorder);
    }
  };

  const resetToDefaults = () => {
    if (colorPalette) {
      updateNavigationColors({
        headerBackground: colorPalette.colors.headerBackground,
        headerText: colorPalette.colors.headerText,
        headerBorder: colorPalette.colors.border,
        footerBackground: colorPalette.colors.footerBackground,
        footerText: colorPalette.colors.footerText,
        footerBorder: colorPalette.colors.border,
        useCustomColors: false
      });
    }
  };

  const ColorInput = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string; 
    value?: string; 
    onChange: (value: string) => void; 
    description?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  const PreviewBox = ({ 
    title, 
    backgroundColor, 
    textColor, 
    borderColor 
  }: { 
    title: string; 
    backgroundColor?: string; 
    textColor?: string; 
    borderColor?: string;
  }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div 
        className="p-3 border rounded-lg"
        style={{ 
          backgroundColor: backgroundColor || '#ffffff',
          color: textColor || '#000000',
          borderColor: borderColor || '#e5e7eb'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm">Sample Navigation</div>
          <div className="flex space-x-4 text-sm">
            <span>Home</span>
            <span>About</span>
            <span>Products</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Header & Footer Colors</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            title="Reset to palette defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Use Custom Colors Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Custom Navigation Colors</h4>
          <p className="text-sm text-gray-500">
            Override the color palette for header and footer navigation
          </p>
        </div>
        <button
          onClick={() => updateNavigationColors({ useCustomColors: !currentColors.useCustomColors })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            currentColors.useCustomColors ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            currentColors.useCustomColors ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">Preview</h4>
          <div className="space-y-3">
            <PreviewBox 
              title="Header"
              backgroundColor={currentColors.headerBackground}
              textColor={currentColors.headerText}
              borderColor={currentColors.headerBorder}
            />
            <PreviewBox 
              title="Footer"
              backgroundColor={currentColors.footerBackground}
              textColor={currentColors.footerText}
              borderColor={currentColors.footerBorder}
            />
          </div>
        </div>
      )}

      {/* Header Settings */}
      {currentColors.useCustomColors && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <span>Header Navigation</span>
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <ColorInput
              label="Background Color"
              value={currentColors.headerBackground}
              onChange={(value) => updateNavigationColors({ headerBackground: value })}
              description="The background color for the header navigation"
            />
            
            <ColorInput
              label="Text Color"
              value={currentColors.headerText}
              onChange={(value) => updateNavigationColors({ headerText: value })}
              description="The text color for navigation links in the header"
            />
            
            <ColorInput
              label="Border Color"
              value={currentColors.headerBorder}
              onChange={(value) => updateNavigationColors({ headerBorder: value })}
              description="The border color for the header navigation"
            />
          </div>
        </div>
      )}

      {/* Footer Settings */}
      {currentColors.useCustomColors && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <span>Footer Navigation</span>
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <ColorInput
              label="Background Color"
              value={currentColors.footerBackground}
              onChange={(value) => updateNavigationColors({ footerBackground: value })}
              description="The background color for the footer navigation"
            />
            
            <ColorInput
              label="Text Color"
              value={currentColors.footerText}
              onChange={(value) => updateNavigationColors({ footerText: value })}
              description="The text color for navigation links in the footer"
            />
            
            <ColorInput
              label="Border Color"
              value={currentColors.footerBorder}
              onChange={(value) => updateNavigationColors({ footerBorder: value })}
              description="The border color for the footer navigation"
            />
          </div>
        </div>
      )}

      {/* Current Palette Info */}
      {colorPalette && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Palette className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Current Color Palette</h4>
              <p className="text-sm text-blue-700 mb-2">{colorPalette.name}</p>
              <div className="text-xs text-blue-600">
                Header: {colorPalette.colors.headerBackground} / {colorPalette.colors.headerText}<br />
                Footer: {colorPalette.colors.footerBackground} / {colorPalette.colors.footerText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};