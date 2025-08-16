/**
 * SEO Panel
 * Advanced SEO optimization controls
 */

import React, { useState, useCallback } from 'react';
import { Search, BarChart3, AlertTriangle, CheckCircle, Share2, Code } from 'lucide-react';
import type { PageDocument } from '../types';

interface SEOPanelProps {
  document: PageDocument;
  onDocumentChange: (doc: PageDocument) => void;
}

export const SEOPanel: React.FC<SEOPanelProps> = ({ document, onDocumentChange }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'analytics' | 'technical'>('general');

  const updateSEO = useCallback((updates: Partial<PageDocument['seo']>) => {
    const newDocument = {
      ...document,
      seo: { ...document.seo, ...updates },
    };
    onDocumentChange(newDocument);
  }, [document, onDocumentChange]);

  const updateAnalytics = useCallback((updates: Partial<PageDocument['analytics']>) => {
    const newDocument = {
      ...document,
      analytics: { ...document.analytics, ...updates },
    };
    onDocumentChange(newDocument);
  }, [document, onDocumentChange]);

  const updateCustomCode = useCallback((updates: Partial<PageDocument['customCode']>) => {
    const newDocument = {
      ...document,
      customCode: { ...document.customCode, ...updates },
    };
    onDocumentChange(newDocument);
  }, [document, onDocumentChange]);

  // SEO Analysis
  const analyzeSEO = () => {
    const issues = [];
    const warnings = [];
    const recommendations = [];

    // Check meta title
    if (!document.seo?.metaTitle) {
      issues.push('Meta title is missing');
    } else {
      if (document.seo.metaTitle.length < 30) {
        warnings.push('Meta title is too short (recommended: 30-60 characters)');
      }
      if (document.seo.metaTitle.length > 60) {
        warnings.push('Meta title is too long (recommended: 30-60 characters)');
      }
    }

    // Check meta description
    if (!document.seo?.metaDescription) {
      issues.push('Meta description is missing');
    } else {
      if (document.seo.metaDescription.length < 120) {
        warnings.push('Meta description is too short (recommended: 120-160 characters)');
      }
      if (document.seo.metaDescription.length > 160) {
        warnings.push('Meta description is too long (recommended: 120-160 characters)');
      }
    }

    // Check Open Graph
    if (!document.seo?.openGraphImage) {
      recommendations.push('Add Open Graph image for better social sharing');
    }

    // Check structured data
    if (!document.seo?.structuredData) {
      recommendations.push('Add structured data (JSON-LD) for rich snippets');
    }

    return { issues, warnings, recommendations };
  };

  const { issues, warnings, recommendations } = analyzeSEO();

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* SEO Analysis */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          SEO Analysis
        </h3>
        
        <div className="space-y-2">
          {issues.map((issue, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{issue}</span>
            </div>
          ))}
          
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{warning}</span>
            </div>
          ))}
          
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center space-x-2 text-blue-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{rec}</span>
            </div>
          ))}
          
          {issues.length === 0 && warnings.length === 0 && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>SEO looks good!</span>
            </div>
          )}
        </div>
      </div>

      {/* Basic SEO */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title
            <span className="text-gray-500 ml-1">
              ({document.seo?.metaTitle?.length || 0}/60)
            </span>
          </label>
          <input
            type="text"
            value={document.seo?.metaTitle || ''}
            onChange={(e) => updateSEO({ metaTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter page title for search engines"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">
            Appears as the clickable headline in search results
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
            <span className="text-gray-500 ml-1">
              ({document.seo?.metaDescription?.length || 0}/160)
            </span>
          </label>
          <textarea
            value={document.seo?.metaDescription || ''}
            onChange={(e) => updateSEO({ metaDescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="Brief description that appears in search results"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            Appears below the title in search results
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords
          </label>
          <input
            type="text"
            value={document.seo?.metaKeywords || ''}
            onChange={(e) => updateSEO({ metaKeywords: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate keywords with commas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canonical URL
          </label>
          <input
            type="url"
            value={document.seo?.canonicalUrl || ''}
            onChange={(e) => updateSEO({ canonicalUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://example.com/page"
          />
          <p className="text-xs text-gray-500 mt-1">
            Helps prevent duplicate content issues
          </p>
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <Share2 className="w-4 h-4 mr-2" />
        Social Media Preview
      </h3>

      {/* Open Graph */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Open Graph (Facebook, LinkedIn)</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={document.seo?.openGraphTitle || ''}
            onChange={(e) => updateSEO({ openGraphTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Title for social sharing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={document.seo?.openGraphDescription || ''}
            onChange={(e) => updateSEO({ openGraphDescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="Description for social sharing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={document.seo?.openGraphImage || ''}
            onChange={(e) => updateSEO({ openGraphImage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Recommended size: 1200x630px
          </p>
        </div>
      </div>

      {/* Twitter Card */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-gray-900">Twitter Card</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Type
          </label>
          <select
            value={document.seo?.twitterCard || 'summary_large_image'}
            onChange={(e) => updateSEO({ twitterCard: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="summary">Summary</option>
            <option value="summary_large_image">Summary with Large Image</option>
            <option value="app">App</option>
            <option value="player">Player</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter Image
          </label>
          <input
            type="url"
            value={document.seo?.twitterImage || ''}
            onChange={(e) => updateSEO({ twitterImage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://example.com/twitter-image.jpg"
          />
        </div>
      </div>

      {/* Social Preview */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
        <div className="space-y-3">
          {/* Facebook Preview */}
          <div className="border border-gray-100 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Facebook/LinkedIn</div>
            {document.seo?.openGraphImage && (
              <div className="w-full h-32 bg-gray-100 rounded mb-2 overflow-hidden">
                <img 
                  src={document.seo.openGraphImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="text-sm font-medium text-blue-600 hover:underline">
              {document.seo?.openGraphTitle || document.seo?.metaTitle || 'Page Title'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {document.seo?.openGraphDescription || document.seo?.metaDescription || 'Page description'}
            </div>
            <div className="text-xs text-gray-400 mt-1">example.com</div>
          </div>

          {/* Twitter Preview */}
          <div className="border border-gray-100 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Twitter</div>
            <div className="border border-gray-200 rounded overflow-hidden">
              {document.seo?.twitterImage && (
                <div className="w-full h-32 bg-gray-100">
                  <img 
                    src={document.seo.twitterImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="text-sm font-medium">
                  {document.seo?.openGraphTitle || document.seo?.metaTitle || 'Page Title'}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {document.seo?.openGraphDescription || document.seo?.metaDescription || 'Page description'}
                </div>
                <div className="text-xs text-gray-400 mt-1">🔗 example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <BarChart3 className="w-4 h-4 mr-2" />
        Analytics & Tracking
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Analytics Tracking ID
          </label>
          <input
            type="text"
            value={document.analytics?.trackingId || ''}
            onChange={(e) => updateAnalytics({ trackingId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="GA-XXXXXXXXX or G-XXXXXXXXXX"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={document.analytics?.heatmap || false}
              onChange={(e) => updateAnalytics({ heatmap: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Enable heatmap tracking</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={document.analytics?.scrollTracking || false}
              onChange={(e) => updateAnalytics({ scrollTracking: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Track scroll depth</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Events
          </label>
          <div className="space-y-2">
            {document.analytics?.events?.map((event, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Event name"
                  value={event.name}
                  onChange={(e) => {
                    const newEvents = [...(document.analytics?.events || [])];
                    newEvents[index] = { ...event, name: e.target.value };
                    updateAnalytics({ events: newEvents });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="CSS selector"
                  value={event.selector}
                  onChange={(e) => {
                    const newEvents = [...(document.analytics?.events || [])];
                    newEvents[index] = { ...event, selector: e.target.value };
                    updateAnalytics({ events: newEvents });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <select
                  value={event.action}
                  onChange={(e) => {
                    const newEvents = [...(document.analytics?.events || [])];
                    newEvents[index] = { ...event, action: e.target.value };
                    updateAnalytics({ events: newEvents });
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="click">Click</option>
                  <option value="view">View</option>
                  <option value="submit">Submit</option>
                </select>
                <button
                  onClick={() => {
                    const newEvents = (document.analytics?.events || []).filter((_, i) => i !== index);
                    updateAnalytics({ events: newEvents });
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            )) || []}
            
            <button
              onClick={() => {
                const newEvents = [...(document.analytics?.events || []), { name: '', selector: '', action: 'click' }];
                updateAnalytics({ events: newEvents });
              }}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm"
            >
              Add Custom Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 flex items-center">
        <Code className="w-4 h-4 mr-2" />
        Technical SEO
      </h3>

      {/* Structured Data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Structured Data (JSON-LD)
        </label>
        <textarea
          value={document.seo?.structuredData ? JSON.stringify(document.seo.structuredData, null, 2) : ''}
          onChange={(e) => {
            try {
              const data = e.target.value ? JSON.parse(e.target.value) : undefined;
              updateSEO({ structuredData: data });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          rows={8}
          placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "Example"}'
        />
        <p className="text-xs text-gray-500 mt-1">
          Add structured data for rich snippets in search results
        </p>
      </div>

      {/* Custom Code */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Custom Code</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Head HTML
          </label>
          <textarea
            value={document.customCode?.headHTML || ''}
            onChange={(e) => updateCustomCode({ headHTML: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
            rows={4}
            placeholder="<!-- Custom HTML for <head> -->"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Body HTML
          </label>
          <textarea
            value={document.customCode?.bodyHTML || ''}
            onChange={(e) => updateCustomCode({ bodyHTML: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
            rows={4}
            placeholder="<!-- Custom HTML for <body> -->"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom CSS
          </label>
          <textarea
            value={document.customCode?.css || ''}
            onChange={(e) => updateCustomCode({ css: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
            rows={4}
            placeholder="/* Custom CSS styles */"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom JavaScript
          </label>
          <textarea
            value={document.customCode?.javascript || ''}
            onChange={(e) => updateCustomCode({ javascript: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
            rows={4}
            placeholder="// Custom JavaScript code"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
        {[
          { id: 'general', label: 'General', icon: Search },
          { id: 'social', label: 'Social', icon: Share2 },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'technical', label: 'Technical', icon: Code },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'social' && renderSocialTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'technical' && renderTechnicalTab()}
      </div>
    </div>
  );
};