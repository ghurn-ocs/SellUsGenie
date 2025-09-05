/**
 * Header Configuration Page
 * Standalone form page for configuring header settings
 */

import React, { useState, useEffect } from 'react';
import { Save, Palette, Type, Settings, Link2, ShoppingCart, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { supabase } from '../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HeaderLayoutView, type HeaderLayoutProps } from '../pageBuilder/widgets/header-layout/HeaderLayoutView';
import type { Widget } from '../pageBuilder/types';

interface HeaderSettings {
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
  navLinkBorderColor: string;
  navLinkTextColor: string;
  navLinkHoverColor: string;
  
  // e) Shopping Cart
  cartDisplay: 'icon' | 'button';
  
  // f) Horizontal Spacing
  horizontalSpacing: 'thin' | 'standard' | 'expanded';
}

const defaultSettings: HeaderSettings = {
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  displayStoreLogo: true,
  showStoreName: true,
  showStoreTagline: false,
  buttonStyle: 'rounded',
  buttonBorder: true,
  buttonBorderColor: '#3b82f6',
  buttonBodyFill: false,
  buttonBodyColor: '#3b82f6',
  navLinkBorder: false,
  navLinkBorderStyle: 'rounded',
  navLinkBorderTransparent: true,
  navLinkBorderColor: '#3b82f6',
  navLinkTextColor: '#1f2937',
  navLinkHoverColor: '#3b82f6',
  cartDisplay: 'icon',
  horizontalSpacing: 'standard'
};

export const HeaderConfiguration: React.FC = () => {
  const { currentStore } = useStore();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<HeaderSettings>(defaultSettings);
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    const loadHeaderSettings = async () => {
      if (!currentStore) return;

      try {
        // Load header settings from store_settings table
        const { data: settingsData, error } = await supabase
          .from('store_settings')
          .select('setting_value')
          .eq('store_id', currentStore.id)
          .eq('setting_key', 'header_configuration')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading header settings:', error);
        } else if (settingsData?.setting_value) {
          // Merge loaded settings with defaults
          setSettings(prev => ({ ...prev, ...settingsData.setting_value }));
        }

        // Load pages for navigation preview
        const { data: pagesData, error: pagesError } = await supabase
          .from('page_documents')
          .select('id, name, slug, navigation_placement')
          .eq('store_id', currentStore.id)
          .eq('status', 'published');

        if (pagesError) {
          console.error('Error loading pages:', pagesError);
          // Fallback to mock data
          setPages([
            { id: '1', name: 'Home', slug: 'home', navigationPlacement: 'both' },
            { id: '2', name: 'Products', slug: 'products', navigationPlacement: 'header' },
            { id: '3', name: 'About Us', slug: 'about', navigationPlacement: 'both' },
            { id: '4', name: 'Contact', slug: 'contact', navigationPlacement: 'both' }
          ]);
        } else {
          // Map database fields from snake_case to camelCase
          const mappedPages = (pagesData || []).map(page => ({
            ...page,
            navigationPlacement: page.navigation_placement
          }));
          setPages(mappedPages);
        }
      } catch (error) {
        console.error('Error in loadHeaderSettings:', error);
      }
    };

    loadHeaderSettings();
  }, [currentStore]);

  const updateSettings = (updates: Partial<HeaderSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const saveHeaderSettings = useMutation({
    mutationFn: async (headerSettings: HeaderSettings) => {
      if (!currentStore) throw new Error('No store selected');
      console.log('Attempting to save header settings:', headerSettings);
      console.log('Store ID:', currentStore.id);
      
      // Use upsert to insert or update the header configuration
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          store_id: currentStore.id,
          setting_key: 'header_configuration',
          setting_value: headerSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'store_id,setting_key'
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Header settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
    onError: (error) => {
      console.error('Error saving header settings:', error);
    }
  });

  const handleSave = () => {
    saveHeaderSettings.mutate(settings);
  };


  // Get navigation pages for header preview
  const getNavigationPages = () => {
    return pages.filter(page => {
      const placement = page.navigationPlacement || 'both';
      const pageName = page.name.toLowerCase();
      
      // Exclude Header and Footer system pages from navigation
      const isSystemPage = pageName.includes('header') || pageName.includes('footer');
      if (isSystemPage) return false;
      
      // Only include pages with header or both placement
      return placement === 'header' || placement === 'both';
    });
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Header Configuration</h1>
            <p className="text-gray-400 mt-1">
              Configure your site's header appearance and behavior
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saveHeaderSettings.isPending}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saveHeaderSettings.isPending ? 'Saving...' : 'Save Changes'}</span>
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
          <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
            <HeaderLayoutView
              widget={{
                id: 'header-preview',
                type: 'header-layout',
                props: {
                  layout: 'logo-left',
                  height: settings.horizontalSpacing === 'thin' ? 'compact' : 
                          settings.horizontalSpacing === 'expanded' ? 'tall' : 'standard',
                  logo: {
                    type: (settings.displayStoreLogo && settings.showStoreName) ? 'both' :
                          settings.displayStoreLogo ? 'image' :
                          settings.showStoreName ? 'text' : 'image', // Default to showing at least image or text
                    text: settings.showStoreName ? undefined : null, // undefined = use currentStore, null = hide
                    imageUrl: settings.displayStoreLogo ? undefined : null, // undefined = use currentStore, null = hide  
                    imageAlt: 'Store Logo',
                    position: 'left',
                    size: 'medium',
                    link: '/',
                    showTagline: settings.showStoreTagline
                  },
                  navigation: {
                    enabled: getNavigationPages().length > 0,
                    position: 'center',
                    style: 'horizontal',
                    links: getNavigationPages().slice(0, 4).map(page => ({
                      id: page.id || page.slug,
                      label: page.name,
                      href: `/${page.slug}`,
                      type: 'internal' as const,
                      isActive: false
                    })),
                    autoDetectPages: false,
                    borderEnabled: settings.navLinkBorder,
                    borderStyle: settings.navLinkBorderStyle,
                    borderColor: settings.navLinkBorderColor,
                    borderTransparent: settings.navLinkBorderTransparent
                  },
                  cart: {
                    enabled: true,
                    position: 'right',
                    style: settings.cartDisplay === 'button' ? 'icon-text' : 'icon',
                    showCount: true,
                    behavior: 'sidebar'
                  },
                  styling: {
                    backgroundColor: settings.backgroundColor,
                    textColor: settings.textColor,
                    linkColor: settings.navLinkTextColor,
                    linkHoverColor: settings.navLinkHoverColor,
                    borderBottom: false,
                    sticky: false,
                    shadow: 'none'
                  },
                  responsive: {
                    mobile: {
                      showLogo: settings.displayStoreLogo,
                      showNavigation: true,
                      navigationStyle: 'hamburger',
                      showCart: true
                    },
                    tablet: {
                      showLogo: settings.displayStoreLogo,
                      showNavigation: true,
                      showCart: true
                    }
                  }
                },
                position: { x: 0, y: 0 },
                size: { width: '100%', height: 'auto' },
                styles: {}
              }}
            />
          </div>
        </div>

        {/* Configuration Notice */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Navigation Configuration</h4>
              <p className="text-xs text-blue-200">
                What appears in the header navigation is configured in each page's <strong>"Properties"</strong> section. 
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Border Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.navLinkBorderColor}
                        onChange={(e) => updateSettings({ navLinkBorderColor: e.target.value })}
                        className="w-12 h-8 rounded border border-gray-600 bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.navLinkBorderColor}
                        onChange={(e) => updateSettings({ navLinkBorderColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
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

        {/* Success/Error Messages */}
        {(saveHeaderSettings.isSuccess || saveHeaderSettings.isError) && (
          <div className="mt-8">
            {saveHeaderSettings.isSuccess && (
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Header settings saved successfully!</span>
                </div>
              </div>
            )}

            {saveHeaderSettings.isError && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed to save changes. Please try again.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};