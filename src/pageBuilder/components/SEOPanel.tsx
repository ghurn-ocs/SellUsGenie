/**
 * SEO Panel - Redesigned with Expandable Sections
 * Comprehensive SEO optimization controls with organized sections
 */

import React, { useState, useCallback } from 'react';
import { 
  Search, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Share2, 
  Code,
  Globe,
  Link,
  FileText,
  Settings,
  Zap,
  Shield,
  Image,
  Hash,
  Bot,
  Eye
} from 'lucide-react';
import type { PageDocument } from '../types';
import { ExpandableSection } from './ExpandableSection';

interface SEOPanelProps {
  document: PageDocument;
  onDocumentChange: (doc: PageDocument) => void;
}

export const SEOPanel: React.FC<SEOPanelProps> = ({ document, onDocumentChange }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['analysis', 'basic'])
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

  const renderAnalysisSection = () => (
    <ExpandableSection
      title="SEO Analysis"
      description="Real-time SEO health check and recommendations"
      icon={BarChart3}
      isOpen={openSections.has('analysis')}
      onToggle={() => toggleSection('analysis')}
    >
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-2">
          {issues.map((issue, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{issue}</span>
            </div>
          ))}
          
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-600 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
          
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center space-x-2 text-blue-600 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{rec}</span>
            </div>
          ))}
          
          {issues.length === 0 && warnings.length === 0 && recommendations.length === 0 && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>SEO looks good!</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">SEO Score</span>
            <span className="font-medium text-gray-900">
              {Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10))}%
            </span>
          </div>
        </div>
      </div>
    </ExpandableSection>
  );

  const renderBasicSEOSection = () => (
    <ExpandableSection
      title="Basic SEO"
      description="Essential meta tags for search engines"
      icon={Search}
      isOpen={openSections.has('basic')}
      onToggle={() => toggleSection('basic')}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
          <span className="text-gray-500 ml-1">
            ({document.seo?.metaTitle?.length || 0}/60)
          </span>
        </label>
        <input
          type="text"
          value={document.seo?.metaTitle || ''}
          onChange={(e) => updateSEO({ metaTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="keyword1, keyword2, keyword3"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate keywords with commas (less important for modern SEO)
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/page"
        />
        <p className="text-xs text-gray-500 mt-1">
          Helps prevent duplicate content issues
        </p>
      </div>
    </ExpandableSection>
  );

  const renderSocialMediaSection = () => (
    <ExpandableSection
      title="Social Media"
      description="Open Graph and Twitter Card settings"
      icon={Share2}
      isOpen={openSections.has('social')}
      onToggle={() => toggleSection('social')}
    >
      {/* Open Graph Settings */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Open Graph (Facebook/LinkedIn)</h4>
        <div className="space-y-4 pl-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OG Title
            </label>
            <input
              type="text"
              value={document.seo?.openGraphTitle || ''}
              onChange={(e) => updateSEO({ openGraphTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Title for social sharing (defaults to meta title)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OG Description
            </label>
            <textarea
              value={document.seo?.openGraphDescription || ''}
              onChange={(e) => updateSEO({ openGraphDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Description for social sharing (defaults to meta description)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OG Image URL
            </label>
            <input
              type="url"
              value={document.seo?.openGraphImage || ''}
              onChange={(e) => updateSEO({ openGraphImage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 1200x630px for best display
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OG Type
            </label>
            <select
              value={document.seo?.openGraphType || 'website'}
              onChange={(e) => updateSEO({ openGraphType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="website">Website</option>
              <option value="article">Article</option>
              <option value="product">Product</option>
              <option value="profile">Profile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Twitter Card Settings */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Twitter Card</h4>
        <div className="space-y-4 pl-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Type
            </label>
            <select
              value={document.seo?.twitterCardType || 'summary'}
              onChange={(e) => updateSEO({ twitterCardType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/twitter-image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Site @handle
            </label>
            <input
              type="text"
              value={document.seo?.twitterSite || ''}
              onChange={(e) => updateSEO({ twitterSite: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@yourcompany"
            />
          </div>
        </div>
      </div>
    </ExpandableSection>
  );

  const renderTechnicalSEOSection = () => (
    <ExpandableSection
      title="Technical SEO"
      description="Advanced SEO settings and robots meta tags"
      icon={Settings}
      isOpen={openSections.has('technical')}
      onToggle={() => toggleSection('technical')}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Robots Meta Tags
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={document.seo?.noindex || false}
              onChange={(e) => updateSEO({ noindex: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">NoIndex (hide from search results)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={document.seo?.nofollow || false}
              onChange={(e) => updateSEO({ nofollow: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">NoFollow (don't follow links)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={document.seo?.noarchive || false}
              onChange={(e) => updateSEO({ noarchive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">NoArchive (don't cache page)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={document.seo?.nosnippet || false}
              onChange={(e) => updateSEO({ nosnippet: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">NoSnippet (don't show snippet)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority (Sitemap)
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={document.seo?.priority || 0.5}
          onChange={(e) => updateSEO({ priority: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          0.0 to 1.0 (higher = more important)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Change Frequency
        </label>
        <select
          value={document.seo?.changeFrequency || 'monthly'}
          onChange={(e) => updateSEO({ changeFrequency: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="always">Always</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="never">Never</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language/Region
        </label>
        <input
          type="text"
          value={document.seo?.language || ''}
          onChange={(e) => updateSEO({ language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="en-US"
        />
      </div>
    </ExpandableSection>
  );

  const renderStructuredDataSection = () => (
    <ExpandableSection
      title="Structured Data"
      description="JSON-LD schema markup for rich snippets"
      icon={Code}
      isOpen={openSections.has('structured')}
      onToggle={() => toggleSection('structured')}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schema Type
        </label>
        <select
          value={document.seo?.schemaType || 'WebPage'}
          onChange={(e) => updateSEO({ schemaType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="WebPage">Web Page</option>
          <option value="Article">Article</option>
          <option value="Product">Product</option>
          <option value="LocalBusiness">Local Business</option>
          <option value="Organization">Organization</option>
          <option value="Person">Person</option>
          <option value="Event">Event</option>
          <option value="FAQPage">FAQ Page</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom JSON-LD
        </label>
        <textarea
          value={document.seo?.structuredData || ''}
          onChange={(e) => updateSEO({ structuredData: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={8}
          placeholder='{"@context": "https://schema.org", "@type": "WebPage"}'
        />
        <p className="text-xs text-gray-500 mt-1">
          Advanced: Provide custom JSON-LD structured data
        </p>
      </div>
    </ExpandableSection>
  );

  const renderAnalyticsSection = () => (
    <ExpandableSection
      title="Analytics & Tracking"
      description="Configure analytics and tracking codes"
      icon={BarChart3}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="GA-XXXXXXXXX or G-XXXXXXXXXX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Tag Manager ID
        </label>
        <input
          type="text"
          value={document.analytics?.gtmId || ''}
          onChange={(e) => updateAnalytics({ gtmId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="GTM-XXXXXXX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facebook Pixel ID
        </label>
        <input
          type="text"
          value={document.analytics?.fbPixelId || ''}
          onChange={(e) => updateAnalytics({ fbPixelId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="XXXXXXXXXXXXXXXX"
        />
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Tracking Options</h4>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={document.analytics?.heatmap || false}
            onChange={(e) => updateAnalytics({ heatmap: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Enable heatmap tracking</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={document.analytics?.scrollTracking || false}
            onChange={(e) => updateAnalytics({ scrollTracking: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Track scroll depth</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={document.analytics?.outboundLinks || false}
            onChange={(e) => updateAnalytics({ outboundLinks: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Track outbound links</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={document.analytics?.fileDownloads || false}
            onChange={(e) => updateAnalytics({ fileDownloads: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Track file downloads</span>
        </label>
      </div>
    </ExpandableSection>
  );

  const renderVerificationSection = () => (
    <ExpandableSection
      title="Site Verification"
      description="Verify site ownership for search engines and tools"
      icon={Shield}
      isOpen={openSections.has('verification')}
      onToggle={() => toggleSection('verification')}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Search Console
        </label>
        <input
          type="text"
          value={document.seo?.googleVerification || ''}
          onChange={(e) => updateSEO({ googleVerification: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Verification code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bing Webmaster Tools
        </label>
        <input
          type="text"
          value={document.seo?.bingVerification || ''}
          onChange={(e) => updateSEO({ bingVerification: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Verification code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pinterest
        </label>
        <input
          type="text"
          value={document.seo?.pinterestVerification || ''}
          onChange={(e) => updateSEO({ pinterestVerification: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Verification code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yandex
        </label>
        <input
          type="text"
          value={document.seo?.yandexVerification || ''}
          onChange={(e) => updateSEO({ yandexVerification: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Verification code"
        />
      </div>
    </ExpandableSection>
  );

  const renderCustomCodeSection = () => (
    <ExpandableSection
      title="Custom Code"
      description="Add custom meta tags and scripts"
      icon={Code}
      isOpen={openSections.has('customCode')}
      onToggle={() => toggleSection('customCode')}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Head Tags
        </label>
        <textarea
          value={document.customCode?.head || ''}
          onChange={(e) => updateCustomCode({ head: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="<!-- Add custom meta tags, scripts, etc. -->"
        />
        <p className="text-xs text-gray-500 mt-1">
          Code to be inserted in the &lt;head&gt; section
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Body Scripts
        </label>
        <textarea
          value={document.customCode?.bodyStart || ''}
          onChange={(e) => updateCustomCode({ bodyStart: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={6}
          placeholder="<!-- Scripts to run at body start -->"
        />
        <p className="text-xs text-gray-500 mt-1">
          Code to be inserted at the beginning of &lt;body&gt;
        </p>
      </div>
    </ExpandableSection>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>SEO</span>
          </h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive search engine optimization
        </p>
      </div>

      {/* SEO Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderAnalysisSection()}
        {renderBasicSEOSection()}
        {renderSocialMediaSection()}
        {renderTechnicalSEOSection()}
        {renderStructuredDataSection()}
        {renderAnalyticsSection()}
        {renderVerificationSection()}
        {renderCustomCodeSection()}
        
        {/* Bottom padding for better scroll visibility (1 inch minimum) */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};