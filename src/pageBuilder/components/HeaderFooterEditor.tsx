/**
 * Simplified Header/Footer Editor
 * Simple customization options without complex widget system
 */

import React, { useState } from 'react';
import { Upload, Palette, Link2, Type, Save, ShoppingCart, Tag, Settings, Info } from 'lucide-react';

interface HeaderFooterSettings {
  // a) Page Colors
  backgroundColor: string;
  textColor: string;
  
  // b) Logo (always on left)
  displayStoreLogo: boolean;
  showStoreName: boolean;
  showStoreTagline: boolean;
  
  // c) Button Style
  buttonStyle: 'rounded' | 'square' | 'round';
  buttonBorder: boolean;
  buttonBorderColor: string;
  buttonBodyFill: boolean;
  buttonBodyColor: string;
  
  // d) Navigation Link Style
  navLinkBorder: boolean;
  navLinkBorderStyle: 'rounded' | 'square';
  navLinkBorderTransparent: boolean;
  navLinkTextColor: string;
  navLinkHoverColor: string;
  
  // e) Shopping Cart
  cartDisplay: 'icon' | 'button';
  
  // f) Horizontal Spacing
  horizontalSpacing: 'thin' | 'standard' | 'expanded';
  
  // Footer specific (keep for backward compatibility)
  footerText?: string;
  showSocialLinks?: boolean;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

interface HeaderFooterEditorProps {
  type: 'header' | 'footer';
  settings: HeaderFooterSettings;
  onSettingsChange: (settings: HeaderFooterSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  storeLogoUrl?: string; // New: Centralized store logo URL
  pages?: Array<{ // Add pages prop for navigation preview
    id: string;
    name: string;
    slug?: string;
    navigationPlacement?: 'header' | 'footer' | 'both' | 'none';
    status?: 'draft' | 'published' | 'archived';
  }>;
}

export const HeaderFooterEditor: React.FC<HeaderFooterEditorProps> = ({
  type,
  settings,
  onSettingsChange,
  onSave,
  isSaving,
  storeLogoUrl,
  pages = []
}) => {
  const updateSettings = (updates: Partial<HeaderFooterSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  // Get navigation pages for preview
  const getNavigationPages = () => {
    return pages.filter(page => {
      if (page.status === 'archived') return false;
      const placement = page.navigationPlacement || 'both';
      return placement === type || placement === 'both';
    }).map(page => ({
      name: page.name,
      slug: page.slug || page.name.toLowerCase().replace(/\s+/g, '-'),
      url: `/${page.slug || page.name.toLowerCase().replace(/\s+/g, '-')}`
    }));
  };

  // Helper functions for styling
  const getBorderRadius = (style: 'rounded' | 'square' | 'round') => {
    switch (style) {
      case 'round': return 'rounded-full';
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-md';
      default: return 'rounded-md';
    }
  };

  const getSpacingClasses = (spacing: 'thin' | 'standard' | 'expanded') => {
    switch (spacing) {
      case 'thin': return 'py-2 px-4';
      case 'expanded': return 'py-6 px-8';
      case 'standard': 
      default: return 'py-4 px-6';
    }
  };


  // Footer editor uses same interface as header editor
  const editorTitle = type === 'header' ? 'Header Settings' : 'Footer Settings';
  const editorDescription = type === 'header' 
    ? "Customize your site's header with simple, focused options"
    : "Customize your site's footer with simple, focused options";

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{editorTitle}</h1>
          <p className="text-gray-400 mt-1">
            {editorDescription}
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Live Preview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Live Preview</h2>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            Updates automatically
          </span>
        </div>
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
          {type === 'header' ? (
            <div 
              className={`w-full rounded flex items-center justify-between ${getSpacingClasses(settings.horizontalSpacing)}`}
              style={{ 
                backgroundColor: settings.backgroundColor,
                color: settings.textColor 
              }}
            >
              {/* Left side - Logo and Store Info */}
              <div className="flex items-center space-x-3">
                {settings.displayStoreLogo && storeLogoUrl && (
                  <img src={storeLogoUrl} alt="Store Logo" className="h-8 w-auto" />
                )}
                <div className="flex flex-col">
                  {settings.showStoreName && (
                    <span className="font-semibold">Store Name</span>
                  )}
                  {settings.showStoreTagline && (
                    <span className="text-sm opacity-80">Store tagline here</span>
                  )}
                </div>
              </div>

              {/* Center - Navigation Links */}
              <nav className="flex items-center space-x-4">
                {getNavigationPages().length > 0 ? (
                  getNavigationPages().slice(0, 4).map((page) => {
                    const borderRadius = getBorderRadius(settings.navLinkBorderStyle);
                    const linkClasses = `px-3 py-2 transition-all duration-200 ${borderRadius} ${
                      settings.navLinkBorder ? 'border' : ''
                    }`;
                    const linkStyle: React.CSSProperties = {
                      color: settings.navLinkTextColor,
                      borderColor: settings.navLinkBorder ? settings.navLinkTextColor : 'transparent',
                      backgroundColor: settings.navLinkBorderTransparent ? 'transparent' : undefined
                    };

                    return (
                      <a 
                        key={page.slug}
                        href="#" 
                        className={linkClasses}
                        style={linkStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = settings.navLinkHoverColor;
                          if (settings.navLinkBorder && !settings.navLinkBorderTransparent) {
                            e.currentTarget.style.backgroundColor = settings.navLinkTextColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = settings.navLinkTextColor;
                          if (settings.navLinkBorder && !settings.navLinkBorderTransparent) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title={`Navigate to ${page.name}`}
                      >
                        {page.name}
                      </a>
                    );
                  })
                ) : (
                  <span className="text-sm opacity-60 italic">
                    No navigation pages configured
                  </span>
                )}
              </nav>

              {/* Right side - Shopping Cart */}
              <div className="flex items-center">
                {settings.cartDisplay === 'icon' ? (
                  <ShoppingCart className="w-6 h-6" style={{ color: settings.textColor }} />
                ) : (
                  <button
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-200 ${getBorderRadius(settings.buttonStyle)} ${
                      settings.buttonBorder ? 'border' : ''
                    }`}
                    style={{
                      borderColor: settings.buttonBorder ? settings.buttonBorderColor : 'transparent',
                      backgroundColor: settings.buttonBodyFill ? settings.buttonBodyColor : 'transparent',
                      color: settings.textColor
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Cart</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Footer Preview */
            <div 
              className={`w-full rounded ${getSpacingClasses(settings.horizontalSpacing)}`}
              style={{ 
                backgroundColor: settings.backgroundColor,
                color: settings.textColor 
              }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                {/* Left side - Logo and Store Info */}
                <div className="flex items-center space-x-3">
                  {settings.displayStoreLogo && storeLogoUrl && (
                    <img src={storeLogoUrl} alt="Store Logo" className="h-8 w-auto" />
                  )}
                  <div className="flex flex-col">
                    {settings.showStoreName && (
                      <span className="font-semibold">Store Name</span>
                    )}
                    {settings.showStoreTagline && (
                      <span className="text-sm opacity-80">Store tagline here</span>
                    )}
                  </div>
                </div>

                {/* Center - Footer Navigation Links */}
                <nav className="flex flex-wrap items-center gap-4">
                  {getNavigationPages().length > 0 ? (
                    getNavigationPages().slice(0, 5).map((page) => {
                      const borderRadius = getBorderRadius(settings.navLinkBorderStyle);
                      const linkClasses = `px-2 py-1 text-sm transition-all duration-200 ${borderRadius} ${
                        settings.navLinkBorder ? 'border' : ''
                      }`;
                      const linkStyle: React.CSSProperties = {
                        color: settings.navLinkTextColor,
                        borderColor: settings.navLinkBorder ? settings.navLinkTextColor : 'transparent',
                        backgroundColor: settings.navLinkBorderTransparent ? 'transparent' : undefined
                      };

                      return (
                        <a 
                          key={page.slug}
                          href="#" 
                          className={linkClasses}
                          style={linkStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = settings.navLinkHoverColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = settings.navLinkTextColor;
                          }}
                          title={`Navigate to ${page.name}`}
                        >
                          {page.name}
                        </a>
                      );
                    })
                  ) : (
                    <span className="text-sm opacity-60 italic">
                      No footer navigation pages configured
                    </span>
                  )}
                </nav>

                {/* Right side - Copyright & Year */}
                <div className="text-sm opacity-80">
                  © {new Date().getFullYear()} Store Name. All rights reserved.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Notice */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-1">Navigation Configuration</h4>
            <p className="text-xs text-blue-200">
              What appears in the {type} navigation is configured in each page's <strong>"Properties"</strong> section. 
              Set the <strong>"Navigation Placement"</strong> to control where pages appear (Header, Footer, Both, or None).
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* a) Page Colors */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Page Colors</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Background</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Text</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* b) Logo */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Type className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Logo (always on left)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                id="displayStoreLogo"
                type="checkbox"
                checked={settings.displayStoreLogo}
                onChange={(e) => updateSettings({ displayStoreLogo: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="displayStoreLogo" className="text-sm font-medium text-gray-300">
                Display Store Logo (yes/no)
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                id="showStoreName"
                type="checkbox"
                checked={settings.showStoreName}
                onChange={(e) => updateSettings({ showStoreName: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="showStoreName" className="text-sm font-medium text-gray-300">
                Show Store Name (yes/no) → To right of Logo
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                id="showStoreTagline"
                type="checkbox"
                checked={settings.showStoreTagline}
                onChange={(e) => updateSettings({ showStoreTagline: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="showStoreTagline" className="text-sm font-medium text-gray-300">
                Show Store Tagline (yes/no) → Underneath Store Logo and Name
              </label>
            </div>
          </div>
        </div>

        {/* c) Button Style */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Button Style</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
              <select
                value={settings.buttonStyle}
                onChange={(e) => updateSettings({ buttonStyle: e.target.value as 'rounded' | 'square' | 'round' })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="rounded">Rounded Edge</option>
                <option value="square">Square</option>
                <option value="round">Round</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <input
                id="buttonBorder"
                type="checkbox"
                checked={settings.buttonBorder}
                onChange={(e) => updateSettings({ buttonBorder: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="buttonBorder" className="text-sm font-medium text-gray-300">
                Border (yes/no)
              </label>
            </div>
            {settings.buttonBorder && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Border Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.buttonBorderColor}
                    onChange={(e) => updateSettings({ buttonBorderColor: e.target.value })}
                    className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.buttonBorderColor}
                    onChange={(e) => updateSettings({ buttonBorderColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <input
                id="buttonBodyFill"
                type="checkbox"
                checked={settings.buttonBodyFill}
                onChange={(e) => updateSettings({ buttonBodyFill: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="buttonBodyFill" className="text-sm font-medium text-gray-300">
                Body Fill Color (yes/no)
              </label>
            </div>
            {settings.buttonBodyFill && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Body Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.buttonBodyColor}
                    onChange={(e) => updateSettings({ buttonBodyColor: e.target.value })}
                    className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.buttonBodyColor}
                    onChange={(e) => updateSettings({ buttonBodyColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* d) Navigation Link Style */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Link2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Navigation Link Style</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                id="navLinkBorder"
                type="checkbox"
                checked={settings.navLinkBorder}
                onChange={(e) => updateSettings({ navLinkBorder: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="navLinkBorder" className="text-sm font-medium text-gray-300">
                Border (yes/no)
              </label>
            </div>
            {settings.navLinkBorder && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Border Style</label>
                  <select
                    value={settings.navLinkBorderStyle}
                    onChange={(e) => updateSettings({ navLinkBorderStyle: e.target.value as 'rounded' | 'square' })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="rounded">Rounded Edge</option>
                    <option value="square">Square Edge</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    id="navLinkBorderTransparent"
                    type="checkbox"
                    checked={settings.navLinkBorderTransparent}
                    onChange={(e) => updateSettings({ navLinkBorderTransparent: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="navLinkBorderTransparent" className="text-sm font-medium text-gray-300">
                    Border Background Transparent (yes/no)
                  </label>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.navLinkTextColor}
                  onChange={(e) => updateSettings({ navLinkTextColor: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.navLinkTextColor}
                  onChange={(e) => updateSettings({ navLinkTextColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hover Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.navLinkHoverColor}
                  onChange={(e) => updateSettings({ navLinkHoverColor: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.navLinkHoverColor}
                  onChange={(e) => updateSettings({ navLinkHoverColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* e) Shopping Cart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Shopping Cart</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display as</label>
              <select
                value={settings.cartDisplay}
                onChange={(e) => updateSettings({ cartDisplay: e.target.value as 'icon' | 'button' })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="icon">Icon</option>
                <option value="button">Button</option>
              </select>
            </div>
          </div>
        </div>

        {/* f) Horizontal Spacing */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Horizontal Spacing</h3>
          </div>
          <div className="space-y-3">
            {(['thin', 'standard', 'expanded'] as const).map((spacing) => (
              <label key={spacing} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="horizontalSpacing"
                  value={spacing}
                  checked={settings.horizontalSpacing === spacing}
                  onChange={(e) => updateSettings({ horizontalSpacing: e.target.value as 'thin' | 'standard' | 'expanded' })}
                  className="w-4 h-4 text-purple-600 border-gray-600 bg-gray-700"
                />
                <span className="text-sm font-medium text-gray-300 capitalize">
                  {spacing}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};