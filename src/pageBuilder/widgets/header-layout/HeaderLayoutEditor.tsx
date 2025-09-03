/**
 * Header Layout Widget Editor
 * Comprehensive header editing interface for Visual Page Builder
 */

import React, { useState, useEffect } from 'react';
import { Upload, Link2, Layout, Palette, Settings, Eye, ShoppingCart, Navigation, Smartphone, Monitor } from 'lucide-react';
import type { HeaderLayoutProps } from './HeaderLayoutView';
import type { WidgetEditorProps } from '../../types';
import { supabase } from '../../../lib/supabase';
import { useStore } from '../../../contexts/StoreContext';

export const HeaderLayoutEditor: React.FC<WidgetEditorProps> = ({ widget, updateWidget }) => {
  const props = widget.props as HeaderLayoutProps;
  const { currentStore } = useStore();
  const [activeTab, setActiveTab] = useState<'layout' | 'logo' | 'navigation' | 'cart' | 'styling' | 'responsive'>('layout');
  const [availablePages, setAvailablePages] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [logoUploading, setLogoUploading] = useState(false);
  
  // Load available pages for auto-navigation
  useEffect(() => {
    if (currentStore?.id && props.navigation?.autoDetectPages) {
      loadAvailablePages();
    }
  }, [currentStore?.id, props.navigation?.autoDetectPages]);
  
  const loadAvailablePages = async () => {
    if (!currentStore?.id) return;
    
    try {
      const { data: pages, error } = await supabase
        .from('page_builder_documents')
        .select('id, name, slug')
        .eq('store_id', currentStore.id)
        .eq('status', 'published')
        .neq('page_type', 'header')
        .neq('page_type', 'footer');
        
      if (!error && pages) {
        setAvailablePages(pages);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };
  
  const updateProp = (path: string, value: any) => {
    const pathArray = path.split('.');
    let newProps = { ...props };
    let current = newProps as any;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) current[pathArray[i]] = {};
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    updateWidget({ ...widget, props: newProps });
  };
  
  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `store-images/${currentStore?.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data: publicUrl } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);
        
      updateProp('logo.imageUrl', publicUrl.publicUrl);
    } catch (error) {
      console.error('Logo upload failed:', error);
    } finally {
      setLogoUploading(false);
    }
  };
  
  const addNavigationLink = () => {
    const newLink = {
      id: Date.now().toString(),
      label: 'New Page',
      href: '/new-page',
      type: 'internal' as const
    };
    updateProp('navigation.links', [...(props.navigation?.links || []), newLink]);
  };
  
  const updateNavigationLink = (index: number, field: string, value: any) => {
    const links = [...(props.navigation?.links || [])];
    links[index] = { ...links[index], [field]: value };
    updateProp('navigation.links', links);
  };
  
  const removeNavigationLink = (index: number) => {
    const links = [...(props.navigation?.links || [])];
    links.splice(index, 1);
    updateProp('navigation.links', links);
  };
  
  const syncWithAvailablePages = () => {
    const autoLinks = availablePages.map(page => ({
      id: page.id,
      label: page.name,
      href: `/${page.slug}`,
      type: 'internal' as const
    }));
    updateProp('navigation.links', autoLinks);
  };
  
  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'logo', label: 'Logo', icon: Upload },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'styling', label: 'Styling', icon: Palette },
    { id: 'responsive', label: 'Responsive', icon: Smartphone }
  ];
  
  return (
    <div className="widget-editor">
      <div className="widget-editor-header">
        <h3 className="text-lg font-semibold text-gray-900">Header Layout Settings</h3>
        <p className="text-sm text-gray-600">Configure your site header with logo, navigation, and cart</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Header Layout</label>
              <select
                className="widget-editor-input"
                value={props.layout || 'logo-left'}
                onChange={(e) => updateProp('layout', e.target.value)}
              >
                <option value="logo-left">Logo Left, Navigation Right</option>
                <option value="logo-center">Logo Center, Navigation Split</option>
                <option value="logo-right">Logo Right, Navigation Left</option>
                <option value="custom">Custom Layout</option>
              </select>
            </div>
            
            <div>
              <label className="widget-editor-label">Header Height</label>
              <select
                className="widget-editor-input"
                value={props.height || 'standard'}
                onChange={(e) => updateProp('height', e.target.value)}
              >
                <option value="compact">Compact (64px)</option>
                <option value="standard">Standard (80px)</option>
                <option value="tall">Tall (96px)</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Logo Tab */}
        {activeTab === 'logo' && (
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Logo Type</label>
              <select
                className="widget-editor-input"
                value={props.logo?.type || 'text'}
                onChange={(e) => updateProp('logo.type', e.target.value)}
              >
                <option value="text">Text Only</option>
                <option value="image">Image Only</option>
                <option value="both">Image + Text</option>
              </select>
            </div>
            
            {(props.logo?.type === 'text' || props.logo?.type === 'both') && (
              <div>
                <label className="widget-editor-label">Company Name</label>
                <input
                  type="text"
                  className="widget-editor-input"
                  value={props.logo?.text || ''}
                  onChange={(e) => updateProp('logo.text', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
            )}
            
            {(props.logo?.type === 'image' || props.logo?.type === 'both') && (
              <div>
                <label className="widget-editor-label">Logo Image</label>
                <div className="space-y-2">
                  {props.logo?.imageUrl && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={props.logo.imageUrl} 
                        alt="Logo preview" 
                        className="h-12 w-auto object-contain"
                      />
                      <button
                        onClick={() => updateProp('logo.imageUrl', '')}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    className="widget-editor-input"
                    disabled={logoUploading}
                  />
                  {logoUploading && <p className="text-sm text-gray-500">Uploading...</p>}
                </div>
              </div>
            )}
            
            <div>
              <label className="widget-editor-label">Logo Size</label>
              <select
                className="widget-editor-input"
                value={props.logo?.size || 'medium'}
                onChange={(e) => updateProp('logo.size', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="widget-editor-label">Logo Link (optional)</label>
              <input
                type="url"
                className="widget-editor-input"
                value={props.logo?.link || ''}
                onChange={(e) => updateProp('logo.link', e.target.value)}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        )}
        
        {/* Navigation Tab */}
        {activeTab === 'navigation' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="nav-enabled"
                className="widget-editor-checkbox"
                checked={props.navigation?.enabled !== false}
                onChange={(e) => updateProp('navigation.enabled', e.target.checked)}
              />
              <label htmlFor="nav-enabled" className="widget-editor-label">Enable Navigation Menu</label>
            </div>
            
            {props.navigation?.enabled !== false && (
              <>
                <div>
                  <label className="widget-editor-label">Navigation Style</label>
                  <select
                    className="widget-editor-input"
                    value={props.navigation?.style || 'horizontal'}
                    onChange={(e) => updateProp('navigation.style', e.target.value)}
                  >
                    <option value="horizontal">Horizontal Menu</option>
                    <option value="hamburger">Hamburger Menu</option>
                    <option value="dropdown">Dropdown Menu</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto-detect"
                    className="widget-editor-checkbox"
                    checked={props.navigation?.autoDetectPages || false}
                    onChange={(e) => updateProp('navigation.autoDetectPages', e.target.checked)}
                  />
                  <label htmlFor="auto-detect" className="widget-editor-label">
                    Auto-detect Published Pages
                  </label>
                </div>
                
                {props.navigation?.autoDetectPages && availablePages.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      Found {availablePages.length} published pages
                    </p>
                    <button
                      onClick={syncWithAvailablePages}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Sync Navigation
                    </button>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="widget-editor-label">Navigation Links</label>
                    <button
                      onClick={addNavigationLink}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      + Add Link
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(props.navigation?.links || []).map((link, index) => (
                      <div key={link.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateNavigationLink(index, 'label', e.target.value)}
                          placeholder="Link Text"
                          className="widget-editor-input flex-1"
                        />
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => updateNavigationLink(index, 'href', e.target.value)}
                          placeholder="/page-url"
                          className="widget-editor-input flex-1"
                        />
                        <button
                          onClick={() => removeNavigationLink(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="cart-enabled"
                className="widget-editor-checkbox"
                checked={props.cart?.enabled !== false}
                onChange={(e) => updateProp('cart.enabled', e.target.checked)}
              />
              <label htmlFor="cart-enabled" className="widget-editor-label">Enable Shopping Cart</label>
            </div>
            
            {props.cart?.enabled !== false && (
              <>
                <div>
                  <label className="widget-editor-label">Cart Style</label>
                  <select
                    className="widget-editor-input"
                    value={props.cart?.style || 'icon'}
                    onChange={(e) => updateProp('cart.style', e.target.value)}
                  >
                    <option value="icon">Icon Only</option>
                    <option value="icon-text">Icon + Text</option>
                    <option value="button">Button Style</option>
                  </select>
                </div>
                
                <div>
                  <label className="widget-editor-label">Cart Behavior</label>
                  <select
                    className="widget-editor-input"
                    value={props.cart?.behavior || 'sidebar'}
                    onChange={(e) => updateProp('cart.behavior', e.target.value)}
                  >
                    <option value="sidebar">Slide-out Sidebar</option>
                    <option value="dropdown">Dropdown Panel</option>
                    <option value="page">Navigate to Cart Page</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="show-count"
                    className="widget-editor-checkbox"
                    checked={props.cart?.showCount !== false}
                    onChange={(e) => updateProp('cart.showCount', e.target.checked)}
                  />
                  <label htmlFor="show-count" className="widget-editor-label">Show Item Count Badge</label>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Styling Tab */}
        {activeTab === 'styling' && (
          <div className="space-y-4">
            <div>
              <label className="widget-editor-label">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={props.styling?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateProp('styling.backgroundColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={props.styling?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateProp('styling.backgroundColor', e.target.value)}
                  className="widget-editor-input flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div>
              <label className="widget-editor-label">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={props.styling?.textColor || '#000000'}
                  onChange={(e) => updateProp('styling.textColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={props.styling?.textColor || '#000000'}
                  onChange={(e) => updateProp('styling.textColor', e.target.value)}
                  className="widget-editor-input flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <label className="widget-editor-label">Link Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={props.styling?.linkColor || '#0066cc'}
                  onChange={(e) => updateProp('styling.linkColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={props.styling?.linkColor || '#0066cc'}
                  onChange={(e) => updateProp('styling.linkColor', e.target.value)}
                  className="widget-editor-input flex-1"
                  placeholder="#0066cc"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sticky"
                  className="widget-editor-checkbox"
                  checked={props.styling?.sticky || false}
                  onChange={(e) => updateProp('styling.sticky', e.target.checked)}
                />
                <label htmlFor="sticky" className="text-sm">Sticky Header</label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="border"
                  className="widget-editor-checkbox"
                  checked={props.styling?.borderBottom || false}
                  onChange={(e) => updateProp('styling.borderBottom', e.target.checked)}
                />
                <label htmlFor="border" className="text-sm">Bottom Border</label>
              </div>
            </div>
            
            <div>
              <label className="widget-editor-label">Shadow</label>
              <select
                className="widget-editor-input"
                value={props.styling?.shadow || 'none'}
                onChange={(e) => updateProp('styling.shadow', e.target.value)}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Responsive Tab */}
        {activeTab === 'responsive' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mobile-logo"
                    className="widget-editor-checkbox"
                    checked={props.responsive?.mobile?.showLogo !== false}
                    onChange={(e) => updateProp('responsive.mobile.showLogo', e.target.checked)}
                  />
                  <label htmlFor="mobile-logo" className="text-sm">Show Logo</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mobile-cart"
                    className="widget-editor-checkbox"
                    checked={props.responsive?.mobile?.showCart !== false}
                    onChange={(e) => updateProp('responsive.mobile.showCart', e.target.checked)}
                  />
                  <label htmlFor="mobile-cart" className="text-sm">Show Cart</label>
                </div>
              </div>
              
              <div>
                <label className="widget-editor-label">Mobile Navigation</label>
                <select
                  className="widget-editor-input"
                  value={props.responsive?.mobile?.navigationStyle || 'hamburger'}
                  onChange={(e) => updateProp('responsive.mobile.navigationStyle', e.target.value)}
                >
                  <option value="hamburger">Hamburger Menu</option>
                  <option value="hidden">Hidden</option>
                  <option value="simplified">Simplified Menu</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                Tablet Settings
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tablet-logo"
                    className="widget-editor-checkbox"
                    checked={props.responsive?.tablet?.showLogo !== false}
                    onChange={(e) => updateProp('responsive.tablet.showLogo', e.target.checked)}
                  />
                  <label htmlFor="tablet-logo" className="text-sm">Show Logo</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tablet-nav"
                    className="widget-editor-checkbox"
                    checked={props.responsive?.tablet?.showNavigation !== false}
                    onChange={(e) => updateProp('responsive.tablet.showNavigation', e.target.checked)}
                  />
                  <label htmlFor="tablet-nav" className="text-sm">Show Navigation</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tablet-cart"
                    className="widget-editor-checkbox"
                    checked={props.responsive?.tablet?.showCart !== false}
                    onChange={(e) => updateProp('responsive.tablet.showCart', e.target.checked)}
                  />
                  <label htmlFor="tablet-cart" className="text-sm">Show Cart</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Preview Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          Live Preview
        </h4>
        <div className="bg-white rounded border">
          {/* This would render the HeaderLayoutView component in preview mode */}
          <div className="h-20 flex items-center justify-center text-sm text-gray-500">
            Header preview will appear here
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderLayoutEditor;