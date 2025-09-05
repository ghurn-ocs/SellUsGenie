/**
 * Footer Configuration Page
 * Standalone form page for configuring footer settings
 */

import React, { useState, useEffect } from 'react';
import { Save, Palette, Type, Link2, Info, Settings, Edit3 } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { supabase } from '../lib/supabase';
import { useFooterColumnConfig, useUpdateFooterColumnConfig } from '../hooks/useFooterColumnConfig';

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
  const { currentStore } = useStore();
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  
  // Footer column configuration
  const { data: columnConfig, isLoading: columnConfigLoading } = useFooterColumnConfig();
  const updateColumnConfig = useUpdateFooterColumnConfig();
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [tempColumnValue, setTempColumnValue] = useState<string>('');
  const [selectedColumnCount, setSelectedColumnCount] = useState<number>(4);

  useEffect(() => {
    const loadFooterSettings = async () => {
      if (!currentStore) return;

      try {
        // Load footer settings from store_settings table
        const { data: settingsData, error } = await supabase
          .from('store_settings')
          .select('setting_value')
          .eq('store_id', currentStore.id)
          .eq('setting_key', 'footer_configuration')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading footer settings:', error);
        } else if (settingsData?.setting_value) {
          // Merge loaded settings with defaults
          setSettings(prev => ({ ...prev, ...settingsData.setting_value }));
        }

        // Load pages for navigation preview
        const { data: pagesData, error: pagesError } = await supabase
          .from('page_documents')
          .select('id, name, slug, navigation_placement, footer_column')
          .eq('store_id', currentStore.id)
          .eq('status', 'published');

        if (pagesError) {
          console.error('Error loading pages:', pagesError);
          // Fallback to mock data
          setPages([
            { id: '1', name: 'Home', slug: 'home', navigationPlacement: 'both' },
            { id: '2', name: 'About Us', slug: 'about', navigationPlacement: 'both' },
            { id: '3', name: 'Privacy Policy', slug: 'privacy', navigationPlacement: 'footer' },
            { id: '4', name: 'Terms of Service', slug: 'terms', navigationPlacement: 'footer' },
            { id: '5', name: 'Contact', slug: 'contact', navigationPlacement: 'both' }
          ]);
        } else {
          // Map database fields to expected format
          const mappedPages = (pagesData || []).map(page => ({
            ...page,
            navigationPlacement: page.navigation_placement,
            footerColumn: page.footer_column
          }));
          setPages(mappedPages);
        }

        // Load footer column count setting
        const { data: columnCountData, error: columnCountError } = await supabase
          .from('store_settings')
          .select('setting_value')
          .eq('store_id', currentStore.id)
          .eq('setting_key', 'footer_column_count')
          .single();

        if (!columnCountError && columnCountData?.setting_value) {
          setSelectedColumnCount(columnCountData.setting_value);
        }
      } catch (error) {
        console.error('Error in loadFooterSettings:', error);
      }
    };

    loadFooterSettings();
  }, [currentStore]);

  const updateSettings = (updates: Partial<FooterSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!currentStore) {
      console.error('No current store selected');
      return;
    }

    setIsSaving(true);
    try {
      // Use upsert to insert or update the footer configuration
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          store_id: currentStore.id,
          setting_key: 'footer_configuration',
          setting_value: settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'store_id,setting_key'
        });

      if (error) {
        throw error;
      }

      console.log('Footer settings saved successfully:', settings);
    } catch (error) {
      console.error('Failed to save footer settings:', error);
      // You could add toast notifications here for better UX
    } finally {
      setIsSaving(false);
    }
  };


  // Get navigation pages for footer preview
  const getFooterPages = () => {
    return pages.filter(page => {
      const placement = page.navigationPlacement || 'both';
      const pageName = page.name.toLowerCase();
      
      // Exclude Header and Footer system pages from navigation
      const isSystemPage = pageName.includes('header') || pageName.includes('footer');
      if (isSystemPage) return false;
      
      // Only include pages with footer or both placement
      return placement === 'footer' || placement === 'both';
    });
  };

  // Group footer pages into General and Legal categories
  const getGroupedFooterPages = () => {
    const footerPages = getFooterPages();
    const legalKeywords = ['privacy', 'terms', 'legal', 'cookie', 'policy', 'disclaimer', 'returns', 'refund'];
    
    const general: typeof footerPages = [];
    const legal: typeof footerPages = [];
    
    footerPages.forEach(page => {
      const pageName = page.name.toLowerCase();
      const isLegal = legalKeywords.some(keyword => pageName.includes(keyword));
      
      if (isLegal) {
        legal.push(page);
      } else {
        general.push(page);
      }
    });
    
    return { general, legal };
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

  // Footer column helpers
  const getDefaultColumnTitle = (columnNumber: number): string => {
    const defaults = { 1: 'Company', 2: 'General', 3: 'Support', 4: 'Legal' };
    return defaults[columnNumber as 1 | 2 | 3 | 4] || 'Column';
  };

  const getCurrentColumnTitle = (columnNumber: 1 | 2 | 3 | 4): string => {
    const config = columnConfig?.find(c => c.column_number === columnNumber);
    return config?.column_title || getDefaultColumnTitle(columnNumber);
  };

  const handleStartEditColumn = (columnNumber: 1 | 2 | 3 | 4, currentTitle: string) => {
    setEditingColumn(columnNumber);
    setTempColumnValue(currentTitle);
  };

  const handleSaveColumnEdit = async (columnNumber: 1 | 2 | 3 | 4) => {
    try {
      await updateColumnConfig.mutateAsync({
        column_number: columnNumber,
        column_title: tempColumnValue.trim() || getDefaultColumnTitle(columnNumber),
        is_enabled: true
      });
      setEditingColumn(null);
      setTempColumnValue('');
    } catch (error) {
      console.error('Failed to update column title:', error);
    }
  };

  const handleCancelColumnEdit = () => {
    setEditingColumn(null);
    setTempColumnValue('');
  };

  const saveColumnCountSetting = async (count: number) => {
    if (!currentStore) return;
    
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          store_id: currentStore.id,
          setting_key: 'footer_column_count',
          setting_value: count,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'store_id,setting_key'
        });

      if (error) {
        console.error('Failed to save column count setting:', error);
      }
    } catch (error) {
      console.error('Error saving column count setting:', error);
    }
  };

  // Get pages grouped by footer column
  const getColumnGroupedPages = () => {
    const footerPages = getFooterPages();
    const grouped = {
      1: footerPages.filter(p => p.footerColumn === 1),
      2: footerPages.filter(p => p.footerColumn === 2),
      3: footerPages.filter(p => p.footerColumn === 3),
      4: footerPages.filter(p => p.footerColumn === 4)
    };
    
    // Handle unassigned pages (default to column 2 - General)
    const unassigned = footerPages.filter(p => !p.footerColumn);
    grouped[2].push(...unassigned);
    
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Footer Configuration</h1>
            <p className="text-gray-400 mt-1">
              Configure your site's footer appearance and behavior
            </p>
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
              <div className={`grid gap-6 ${
                selectedColumnCount === 1 ? 'grid-cols-1' :
                selectedColumnCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                selectedColumnCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              }`}>
                {/* Left Column - Logo, Store Name, and Tagline aligned top-left */}
                <div className="flex items-start space-x-3">
                  {settings.displayStoreLogo && currentStore?.store_logo_url && (
                    <img src={currentStore.store_logo_url} alt="Store Logo" className="h-8 w-auto flex-shrink-0" />
                  )}
                  <div className="flex flex-col">
                    {settings.showStoreName && (
                      <span className="font-semibold text-lg leading-tight">{currentStore?.store_name || 'Store Name'}</span>
                    )}
                    {settings.showStoreTagline && (
                      <span className="text-sm opacity-80 leading-tight">
                        {(currentStore as any)?.description || 'Store tagline here'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Column System - Only show enabled columns */}
                {[2, 3, 4].filter(columnNumber => columnNumber <= selectedColumnCount).map((columnNumber) => {
                  const typedColumnNumber = columnNumber as 2 | 3 | 4;
                  const columnPages = getColumnGroupedPages()[typedColumnNumber];
                  const columnTitle = getCurrentColumnTitle(typedColumnNumber);
                  
                  return (
                    <div key={columnNumber}>
                      {(columnPages?.length > 0 || columnNumber === 2) && ( // Always show column 2 even if empty
                        <>
                          <h4 className="font-semibold text-sm uppercase tracking-wide mb-3" style={{ color: settings.textColor }}>
                            {columnTitle}
                          </h4>
                          <nav className="space-y-2">
                            {columnPages?.length > 0 ? columnPages.map((page) => {
                              const borderRadius = getBorderRadius(settings.navLinkBorderStyle);
                              const linkClasses = `block px-0 py-1 transition-all duration-200 text-sm ${borderRadius} ${
                                settings.navLinkBorder ? 'border' : ''
                              }`;
                              const linkStyle: React.CSSProperties = {
                                color: settings.navLinkTextColor,
                                borderColor: settings.navLinkBorder ? settings.navLinkTextColor : 'transparent',
                                backgroundColor: settings.navLinkBorderTransparent ? 'transparent' : undefined
                              };

                              return (
                                <a 
                                  key={page.id}
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
                            }) : (
                              <p className="text-sm opacity-60">No pages assigned to this column</p>
                            )}
                          </nav>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Copyright section */}
              <div className="border-t border-opacity-20 pt-4 mt-8 text-center text-sm opacity-80" style={{ borderColor: settings.textColor }}>
                © {new Date().getFullYear()} {currentStore?.store_name || 'Your Store'}. All rights reserved.
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

        {/* Footer Columns Configuration */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Footer Columns Configuration</h3>
            </div>
            
            {/* Column Count Selector */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-300">Columns to Display:</label>
              <select
                value={selectedColumnCount}
                onChange={(e) => {
                  const newCount = Number(e.target.value);
                  setSelectedColumnCount(newCount);
                  saveColumnCountSetting(newCount);
                }}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={1}>1 Column</option>
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>
          
          {columnConfigLoading ? (
            <div className="animate-pulse text-gray-400">Loading footer configuration...</div>
          ) : (
            <div className="space-y-4">
              {/* Column 1: Company Details (Always enabled) */}
              <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-800 font-bold text-sm rounded-full flex-shrink-0">
                  #1
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-white text-lg">Company Details</span>
                  <p className="text-sm text-gray-400 mt-1">Logo, name, and tagline - automatically positioned</p>
                </div>
                <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                  Active
                </div>
              </div>

              {/* Columns 2, 3, 4: User-configurable with enable/disable based on selection */}
              {[2, 3, 4].map((columnNumber) => {
                const typedColumnNumber = columnNumber as 2 | 3 | 4;
                const currentTitle = getCurrentColumnTitle(typedColumnNumber);
                const isEditing = editingColumn === columnNumber;
                const isEnabled = columnNumber <= selectedColumnCount;
                
                return (
                  <div 
                    key={columnNumber} 
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                      isEnabled 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-800/50 border-gray-700 opacity-60'
                    }`}
                  >
                    {/* Fixed Column Number */}
                    <div className={`flex items-center justify-center w-10 h-10 font-bold text-sm rounded-full flex-shrink-0 ${
                      isEnabled 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-500 text-gray-300'
                    }`}>
                      #{columnNumber}
                    </div>
                    
                    {/* Editable Column Name */}
                    <div className="flex-1">
                      {isEnabled ? (
                        <>
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempColumnValue}
                              onChange={(e) => setTempColumnValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveColumnEdit(typedColumnNumber);
                                } else if (e.key === 'Escape') {
                                  handleCancelColumnEdit();
                                }
                              }}
                              className="w-full px-3 py-2 text-sm bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter column name"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-white text-lg">{currentTitle}</span>
                              <button
                                onClick={() => handleStartEditColumn(typedColumnNumber, currentTitle)}
                                className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-gray-600 rounded-md transition-colors"
                                title="Edit column name"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div>
                          <span className="font-semibold text-gray-400 text-lg">{currentTitle}</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Not used in footer design - only {selectedColumnCount} column{selectedColumnCount !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                      isEnabled 
                        ? 'text-green-400 bg-green-900/30' 
                        : 'text-gray-500 bg-gray-700/30'
                    }`}>
                      {isEnabled ? 'Active' : 'Disabled'}
                    </div>
                    
                    {/* Save/Cancel Actions */}
                    {isEditing && isEnabled && (
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleSaveColumnEdit(typedColumnNumber)}
                          disabled={updateColumnConfig.isPending}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Save changes"
                        >
                          {updateColumnConfig.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelColumnEdit}
                          className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          title="Cancel editing"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
                <p className="text-xs text-blue-200">
                  <strong>How to assign pages to columns:</strong> Edit any page in the Visual Page Builder, 
                  set "Navigation Placement" to "Footer" or "Both", then select the desired column from the "Footer Column" dropdown.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};