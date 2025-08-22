/**
 * Settings Panel
 * Page-level settings and configuration options
 */

import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Palette,
  Code,
  Shield,
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Lock,
  Users,
  Calendar
} from 'lucide-react';
import type { PageDocument } from '../types';

interface SettingsPanelProps {
  document: PageDocument;
  onDocumentChange: (document: PageDocument) => void;
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, 
  description, 
  icon: IconComponent, 
  children, 
  isOpen = true, 
  onToggle 
}) => (
  <div className="border border-gray-200 rounded-lg mb-4">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <IconComponent className="w-5 h-5 text-gray-600" />
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
    
    {isOpen && (
      <div className="border-t border-gray-200 p-4 space-y-4">
        {children}
      </div>
    )}
  </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  document,
  onDocumentChange,
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['general', 'seo', 'performance'])
  );

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const updateDocument = (updates: Partial<PageDocument>) => {
    onDocumentChange({
      ...document,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateSEO = (seoUpdates: Partial<typeof document.seo>) => {
    updateDocument({
      seo: {
        ...document.seo,
        ...seoUpdates,
      },
    });
  };

  const updateAnalytics = (analyticsUpdates: Partial<typeof document.analytics>) => {
    updateDocument({
      analytics: {
        ...document.analytics,
        ...analyticsUpdates,
      },
    });
  };

  const updatePerformance = (performanceUpdates: Partial<typeof document.performance>) => {
    updateDocument({
      performance: {
        ...document.performance,
        ...performanceUpdates,
      },
    });
  };

  const updateAccessibility = (accessibilityUpdates: Partial<typeof document.accessibility>) => {
    updateDocument({
      accessibility: {
        ...document.accessibility,
        ...accessibilityUpdates,
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Page Settings</span>
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Configure page-level settings and properties
        </p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* General Settings */}
        <SettingsSection
          title="General"
          description="Basic page information and metadata"
          icon={Globe}
          isOpen={openSections.has('general')}
          onToggle={() => toggleSection('general')}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Name
            </label>
            <input
              type="text"
              value={document.name}
              onChange={(e) => updateDocument({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter page name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={document.status}
              onChange={(e) => updateDocument({ status: e.target.value as 'draft' | 'published' | 'archived' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Password Protected</span>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
              <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
            </button>
          </div>
        </SettingsSection>

        {/* SEO Settings */}
        <SettingsSection
          title="SEO & Meta"
          description="Search engine optimization settings"
          icon={Eye}
          isOpen={openSections.has('seo')}
          onToggle={() => toggleSection('seo')}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={document.seo?.metaTitle || ''}
              onChange={(e) => updateSEO({ metaTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Page title for search engines"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {document.seo?.metaTitle?.length || 0}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={document.seo?.metaDescription || ''}
              onChange={(e) => updateSEO({ metaDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the page content"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {document.seo?.metaDescription?.length || 0}/160 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={document.seo?.keywords?.join(', ') || ''}
              onChange={(e) => updateSEO({ 
                keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </SettingsSection>

        {/* Analytics */}
        <SettingsSection
          title="Analytics & Tracking"
          description="Configure analytics and tracking codes"
          icon={Zap}
          isOpen={openSections.has('analytics')}
          onToggle={() => toggleSection('analytics')}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics Tracking ID
            </label>
            <input
              type="text"
              value={document.analytics?.trackingId || ''}
              onChange={(e) => updateAnalytics({ trackingId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="GA4-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Heatmap Tracking</span>
              <button 
                onClick={() => updateAnalytics({ heatmap: !document.analytics?.heatmap })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.analytics?.heatmap ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.analytics?.heatmap ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Scroll Tracking</span>
              <button 
                onClick={() => updateAnalytics({ scrollTracking: !document.analytics?.scrollTracking })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.analytics?.scrollTracking ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.analytics?.scrollTracking ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Performance */}
        <SettingsSection
          title="Performance"
          description="Optimize page loading and rendering"
          icon={Zap}
          isOpen={openSections.has('performance')}
          onToggle={() => toggleSection('performance')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Lazy Loading</span>
                <p className="text-xs text-gray-500">Load images and content as needed</p>
              </div>
              <button 
                onClick={() => updatePerformance({ lazyLoading: !document.performance?.lazyLoading })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.performance?.lazyLoading ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.performance?.lazyLoading ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Image Optimization</span>
                <p className="text-xs text-gray-500">Automatically optimize image formats</p>
              </div>
              <button 
                onClick={() => updatePerformance({ imageOptimization: !document.performance?.imageOptimization })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.performance?.imageOptimization ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.performance?.imageOptimization ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Minify CSS</span>
                <p className="text-xs text-gray-500">Compress CSS for faster loading</p>
              </div>
              <button 
                onClick={() => updatePerformance({ minifyCSS: !document.performance?.minifyCSS })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.performance?.minifyCSS ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.performance?.minifyCSS ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Accessibility */}
        <SettingsSection
          title="Accessibility"
          description="Ensure your page is accessible to all users"
          icon={Users}
          isOpen={openSections.has('accessibility')}
          onToggle={() => toggleSection('accessibility')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Alt Text Required</span>
                <p className="text-xs text-gray-500">Require alt text for all images</p>
              </div>
              <button 
                onClick={() => updateAccessibility({ altTextRequired: !document.accessibility?.altTextRequired })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.accessibility?.altTextRequired ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.accessibility?.altTextRequired ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Contrast Checking</span>
                <p className="text-xs text-gray-500">Validate color contrast ratios</p>
              </div>
              <button 
                onClick={() => updateAccessibility({ contrastChecking: !document.accessibility?.contrastChecking })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.accessibility?.contrastChecking ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.accessibility?.contrastChecking ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Keyboard Navigation</span>
                <p className="text-xs text-gray-500">Enable keyboard-only navigation</p>
              </div>
              <button 
                onClick={() => updateAccessibility({ keyboardNavigation: !document.accessibility?.keyboardNavigation })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  document.accessibility?.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  document.accessibility?.keyboardNavigation ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Export/Import */}
        <SettingsSection
          title="Import/Export"
          description="Export page data or import from backup"
          icon={Download}
          isOpen={openSections.has('export')}
          onToggle={() => toggleSection('export')}
        >
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Page Data</span>
            </button>
            
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import Page Data</span>
            </button>
          </div>
        </SettingsSection>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date(document.updatedAt).toLocaleString()}</span>
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3" />
            <span>v{document.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};