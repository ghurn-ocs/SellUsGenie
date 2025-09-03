/**
 * Footer Configuration Page
 * Standalone form page for configuring footer settings
 */

import React, { useState, useEffect } from 'react';
import { Save, Palette, Type, Link2, Info, ArrowLeft, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { useStore } from '../contexts/StoreContext';

interface FooterSettings {
  // a) Page Colors
  backgroundColor: string;
  textColor: string;
  
  // b) Logo (always on left)
  displayStoreLogo: boolean;
  showStoreName: boolean;
  showStoreTagline: boolean;
  
  // c) Navigation Link Style
  navLinkBorder: boolean;
  navLinkBorderStyle: 'rounded' | 'square';
  navLinkBorderTransparent: boolean;
  navLinkTextColor: string;
  navLinkHoverColor: string;
  
  // d) Vertical Spacing
  verticalSpacing: 'thin' | 'standard' | 'expanded';
}

const defaultSettings: FooterSettings = {
  backgroundColor: '#1f2937',
  textColor: '#f9fafb',
  displayStoreLogo: true,
  showStoreName: true,
  showStoreTagline: false,
  navLinkBorder: false,
  navLinkBorderStyle: 'rounded',
  navLinkBorderTransparent: true,
  navLinkTextColor: '#f9fafb',
  navLinkHoverColor: '#3b82f6',
  verticalSpacing: 'standard'
};

export const FooterConfiguration: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { currentStore } = useStore();
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    // Load footer settings from store/database
    // TODO: Implement loading from Supabase
    
    // Load pages for navigation preview
    // TODO: Implement loading pages from Supabase
    setPages([
      { id: '1', name: 'Home', slug: 'home', navigationPlacement: 'both' },
      { id: '2', name: 'About Us', slug: 'about', navigationPlacement: 'both' },
      { id: '3', name: 'Privacy Policy', slug: 'privacy', navigationPlacement: 'footer' },
      { id: '4', name: 'Terms of Service', slug: 'terms', navigationPlacement: 'footer' },
      { id: '5', name: 'Contact', slug: 'contact', navigationPlacement: 'both' }
    ]);
  }, []);

  const updateSettings = (updates: Partial<FooterSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to Supabase
      console.log('Saving footer settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Failed to save footer settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setLocation('/admin/page-builder');
  };

  // Get navigation pages for preview
  const getNavigationPages = () => {
    return pages.filter(page => {
      const placement = page.navigationPlacement || 'both';
      return placement === 'footer' || placement === 'both';
    });
  };

  // Helper functions for styling
  const getBorderRadius = (style: 'rounded' | 'square') => {
    switch (style) {
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-md';
      default: return 'rounded-md';
    }
  };

  const getSpacingClasses = (spacing: 'thin' | 'standard' | 'expanded') => {
    switch (spacing) {
      case 'thin': return 'py-4 px-4';
      case 'expanded': return 'py-12 px-8';
      case 'standard': 
      default: return 'py-8 px-6';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Footer Configuration</h1>
              <p className="text-gray-400 mt-1">
                Configure your site's footer appearance and behavior
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
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
            <div 
              className={`w-full rounded ${getSpacingClasses(settings.verticalSpacing)}`}
              style={{ 
                backgroundColor: settings.backgroundColor,
                color: settings.textColor 
              }}
            >
              {/* Top section - Logo and Store Info */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {settings.displayStoreLogo && currentStore?.store_logo_url && (
                    <img src={currentStore.store_logo_url} alt="Store Logo" className="h-6 w-auto" />
                  )}
                  <div className="flex flex-col">
                    {settings.showStoreName && (
                      <span className="font-semibold text-lg">{currentStore?.name || 'Store Name'}</span>
                    )}
                    {settings.showStoreTagline && (
                      <span className="text-sm opacity-80">{currentStore?.tagline || 'Store tagline here'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="border-t border-opacity-20 pt-4" style={{ borderColor: settings.textColor }}>
                <nav className="flex flex-wrap justify-center gap-6">
                  {getNavigationPages().length > 0 ? (
                    getNavigationPages().map((page) => {
                      const borderRadius = getBorderRadius(settings.navLinkBorderStyle);
                      const linkClasses = `px-3 py-2 transition-all duration-200 ${borderRadius} ${
                        settings.navLinkBorder ? 'border' : ''
                      } underline`;
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
                      No footer navigation pages configured
                    </span>
                  )}
                </nav>
              </div>

              {/* Copyright section */}
              <div className="border-t border-opacity-20 pt-4 mt-4 text-center text-sm opacity-80" style={{ borderColor: settings.textColor }}>
                © {new Date().getFullYear()} {currentStore?.name || 'Your Store'}. All rights reserved.
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Notice */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Navigation Configuration</h4>
              <p className="text-xs text-blue-200">
                What appears in the footer navigation is configured in each page's <strong>"Properties"</strong> section. 
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

          {/* c) Navigation Link Style */}
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

          {/* d) Vertical Spacing */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Vertical Spacing</h3>
            </div>
            <div className="space-y-3">
              {(['thin', 'standard', 'expanded'] as const).map((spacing) => (
                <label key={spacing} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="verticalSpacing"
                    value={spacing}
                    checked={settings.verticalSpacing === spacing}
                    onChange={(e) => updateSettings({ verticalSpacing: e.target.value as 'thin' | 'standard' | 'expanded' })}
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
    </div>
  );
};