/**
 * Navigation Settings Component
 * Allows users to configure and preview their site navigation
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Globe, 
  Eye, 
  Settings, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight,
  Home,
  FileText,
  Phone,
  Shield,
  Users,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { NavigationManager, NavigationItem, NavigationConfig } from '../navigation/NavigationManager';

interface NavigationSettingsProps {
  pages: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
  }>;
  onNavigationChange?: (navigation: { header: NavigationItem[], footer: NavigationItem[] }) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'primary': return Home;
    case 'legal': return Shield;
    case 'support': return HelpCircle;
    case 'company': return Users;
    default: return FileText;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'primary': return 'text-blue-400 bg-blue-900/20';
    case 'legal': return 'text-red-400 bg-red-900/20';
    case 'support': return 'text-green-400 bg-green-900/20';
    case 'company': return 'text-purple-400 bg-purple-900/20';
    default: return 'text-gray-400 bg-gray-900/20';
  }
};

export const NavigationSettings: React.FC<NavigationSettingsProps> = ({
  pages,
  onNavigationChange
}) => {
  const [navigationManager] = useState(() => new NavigationManager());
  const [navigation, setNavigation] = useState<{ header: NavigationItem[], footer: NavigationItem[] }>({ header: [], footer: [] });
  const [config, setConfig] = useState<NavigationConfig>({
    header: { maxItems: 7, showDropdowns: true, mobileCollapse: true },
    footer: { columns: 4, showSocialLinks: true, showCopyright: true }
  });
  const [validation, setValidation] = useState<{ isValid: boolean; warnings: string[]; errors: string[] }>({
    isValid: true,
    warnings: [],
    errors: []
  });
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');

  // Generate navigation when pages change
  useEffect(() => {
    const newNavigation = navigationManager.generateNavigation(pages);
    setNavigation(newNavigation);
    
    // Validate navigation
    const allItems = [...newNavigation.header, ...newNavigation.footer];
    const validationResult = navigationManager.validateNavigation(allItems);
    setValidation(validationResult);
    
    // Notify parent component
    onNavigationChange?.(newNavigation);
  }, [pages, navigationManager, onNavigationChange]);

  const updateConfig = (newConfig: Partial<NavigationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    navigationManager.updateConfig(updatedConfig);
    
    // Regenerate navigation with new config
    const newNavigation = navigationManager.generateNavigation(pages);
    setNavigation(newNavigation);
    onNavigationChange?.(newNavigation);
  };

  const renderNavigationPreview = () => (
    <div className="space-y-6">
      {/* Header Navigation Preview */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Menu className="w-4 h-4 text-[#9B51E0]" />
            Header Navigation
          </h3>
          <span className="text-sm text-[#A0A0A0]">
            {navigation.header.length} of {config.header.maxItems} items
          </span>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#A0A0A0] uppercase tracking-wider">Preview</span>
            <Globe className="w-4 h-4 text-[#A0A0A0]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {navigation.header.map((item, index) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${getCategoryColor(item.category)}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.name}</span>
                  {index < navigation.header.length - 1 && (
                    <ChevronRight className="w-3 h-3 opacity-50 ml-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {navigation.header.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded ${getCategoryColor(item.category)}`}>
                  {React.createElement(getCategoryIcon(item.category), { className: "w-3 h-3" })}
                </div>
                <div>
                  <span className="text-white text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-[#A0A0A0] bg-[#1E1E1E] px-2 py-1 rounded">
                      {item.slug}
                    </code>
                    <span className="text-xs text-[#A0A0A0] capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A0A0A0]">Order: {item.order}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Preview */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#9B51E0]" />
            Footer Navigation
          </h3>
          <span className="text-sm text-[#A0A0A0]">
            {navigation.footer.length} items
          </span>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#A0A0A0] uppercase tracking-wider">Preview</span>
          </div>
          <div className={`grid grid-cols-${Math.min(config.footer.columns, 4)} gap-4`}>
            {Array.from({ length: config.footer.columns }).map((_, colIndex) => {
              const startIndex = colIndex * Math.ceil(navigation.footer.length / config.footer.columns);
              const endIndex = startIndex + Math.ceil(navigation.footer.length / config.footer.columns);
              const columnItems = navigation.footer.slice(startIndex, endIndex);
              
              return (
                <div key={colIndex} className="space-y-2">
                  {columnItems.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors">
                        <Icon className="w-3 h-3" />
                        <span>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {navigation.footer.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded ${getCategoryColor(item.category)}`}>
                  {React.createElement(getCategoryIcon(item.category), { className: "w-3 h-3" })}
                </div>
                <div>
                  <span className="text-white text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-[#A0A0A0] bg-[#1E1E1E] px-2 py-1 rounded">
                      {item.slug}
                    </code>
                    <span className="text-xs text-[#A0A0A0] capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNavigationSettings = () => (
    <div className="space-y-6">
      {/* Header Settings */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h3 className="text-white font-medium mb-4">Header Navigation Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[#A0A0A0] text-sm mb-2">Max Items in Header</label>
            <input
              type="number"
              min="3"
              max="10"
              value={config.header.maxItems}
              onChange={(e) => updateConfig({
                header: { ...config.header, maxItems: parseInt(e.target.value) || 7 }
              })}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showDropdowns"
              checked={config.header.showDropdowns}
              onChange={(e) => updateConfig({
                header: { ...config.header, showDropdowns: e.target.checked }
              })}
              className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0]"
            />
            <label htmlFor="showDropdowns" className="text-[#A0A0A0] text-sm">
              Show dropdown menus for categories
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mobileCollapse"
              checked={config.header.mobileCollapse}
              onChange={(e) => updateConfig({
                header: { ...config.header, mobileCollapse: e.target.checked }
              })}
              className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0]"
            />
            <label htmlFor="mobileCollapse" className="text-[#A0A0A0] text-sm">
              Collapse to hamburger menu on mobile
            </label>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h3 className="text-white font-medium mb-4">Footer Navigation Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[#A0A0A0] text-sm mb-2">Footer Columns</label>
            <select
              value={config.footer.columns}
              onChange={(e) => updateConfig({
                footer: { ...config.footer, columns: parseInt(e.target.value) }
              })}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showSocialLinks"
              checked={config.footer.showSocialLinks}
              onChange={(e) => updateConfig({
                footer: { ...config.footer, showSocialLinks: e.target.checked }
              })}
              className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0]"
            />
            <label htmlFor="showSocialLinks" className="text-[#A0A0A0] text-sm">
              Show social media links
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showCopyright"
              checked={config.footer.showCopyright}
              onChange={(e) => updateConfig({
                footer: { ...config.footer, showCopyright: e.target.checked }
              })}
              className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0]"
            />
            <label htmlFor="showCopyright" className="text-[#A0A0A0] text-sm">
              Show copyright notice
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Validation Messages */}
      {!validation.isValid && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <h4 className="text-red-400 font-medium mb-2">Navigation Errors</h4>
          <ul className="text-red-300 text-sm space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <h4 className="text-yellow-400 font-medium mb-2">Navigation Recommendations</h4>
          <ul className="text-yellow-300 text-sm space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-[#1E1E1E] rounded-lg p-1 border border-[#3A3A3A]">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-1 text-sm ${
            activeTab === 'preview'
              ? 'bg-[#9B51E0] text-white'
              : 'text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]'
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-1 text-sm ${
            activeTab === 'settings'
              ? 'bg-[#9B51E0] text-white'
              : 'text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'preview' && renderNavigationPreview()}
      {activeTab === 'settings' && renderNavigationSettings()}

      {/* Quick Tips */}
      <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
        <h4 className="text-white font-medium mb-2 text-sm">Navigation Best Practices</h4>
        <ul className="text-[#A0A0A0] text-xs space-y-1">
          <li>• Home page should always be first in navigation</li>
          <li>• Contact information should be easily accessible</li>
          <li>• Legal pages (Privacy, Terms) belong in the footer</li>
          <li>• Limit header navigation to 7-8 items maximum</li>
          <li>• Group related pages together logically</li>
        </ul>
      </div>
    </div>
  );
};