/**
 * Featured Products Editor
 * Configuration interface for the Featured Products widget
 */

import React, { useState } from 'react';
import { Star, Settings, Eye, Palette } from 'lucide-react';
import type { WidgetEditorProps } from '../../types';
import type { FeaturedProductsProps } from './index';

export const FeaturedProductsEditor: React.FC<WidgetEditorProps> = ({ widget, onChange }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'display' | 'carousel' | 'styling'>('content');

  // Provide safe defaults for all properties
  const safeProps: FeaturedProductsProps = {
    title: 'Featured Products',
    subtitle: 'Check out our hand-picked featured products',
    showTitle: true,
    showSubtitle: true,
    maxProducts: 8,
    itemsPerRow: { sm: 1, md: 2, lg: 4 },
    showPrice: true,
    showComparePrice: true,
    showDescription: true,
    showAddToCart: true,
    showRating: false,
    showBadges: true,
    carousel: {
      enabled: true,
      autoplay: false,
      autoplaySpeed: 4000,
      infinite: true,
      showDots: true,
      showArrows: true,
      pauseOnHover: true,
      slidesToScroll: 1,
      spacing: 16,
    },
    styling: {
      backgroundColor: 'bg-white',
      cardBackground: 'bg-white',
      titleColor: 'text-gray-900',
      priceColor: 'text-gray-900',
      buttonStyle: 'primary',
      borderRadius: 'md',
      shadow: 'md',
      aspectRatio: '4/3',
    },
    padding: 'py-16 px-4',
    textAlignment: 'center',
    emptyStateMessage: 'No featured products available at the moment. Check back soon!',
    ...widget.props
  };

  const handleChange = (updates: Partial<FeaturedProductsProps>) => {
    onChange({
      ...widget,
      props: { ...safeProps, ...updates }
    });
  };

  const handleCarouselChange = (carouselUpdates: Partial<FeaturedProductsProps['carousel']>) => {
    handleChange({
      carousel: { ...safeProps.carousel, ...carouselUpdates }
    });
  };

  const handleStylingChange = (stylingUpdates: Partial<FeaturedProductsProps['styling']>) => {
    handleChange({
      styling: { ...safeProps.styling, ...stylingUpdates }
    });
  };

  const handleItemsPerRowChange = (breakpoint: 'sm' | 'md' | 'lg', value: number) => {
    handleChange({
      itemsPerRow: { ...safeProps.itemsPerRow, [breakpoint]: value }
    });
  };

  const tabs = [
    { id: 'content' as const, label: 'Content', icon: Star },
    { id: 'display' as const, label: 'Display', icon: Eye },
    { id: 'carousel' as const, label: 'Carousel', icon: Settings },
    { id: 'styling' as const, label: 'Styling', icon: Palette },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          Featured Products Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure your featured products carousel and display options
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTitle"
                  checked={safeProps.showTitle}
                  onChange={(e) => handleChange({ showTitle: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showTitle" className="text-sm font-medium text-gray-700">Show Title</label>
              </div>
            </div>

            {safeProps.showTitle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={safeProps.title}
                  onChange={(e) => handleChange({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Featured Products"
                />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showSubtitle"
                  checked={safeProps.showSubtitle}
                  onChange={(e) => handleChange({ showSubtitle: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showSubtitle" className="text-sm font-medium text-gray-700">Show Subtitle</label>
              </div>
            </div>

            {safeProps.showSubtitle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <textarea
                  value={safeProps.subtitle}
                  onChange={(e) => handleChange({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Check out our hand-picked featured products"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Products to Display</label>
              <input
                type="number"
                min="1"
                max="50"
                value={safeProps.maxProducts}
                onChange={(e) => handleChange({ maxProducts: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
              <select
                value={safeProps.textAlignment}
                onChange={(e) => handleChange({ textAlignment: e.target.value as 'left' | 'center' | 'right' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empty State Message</label>
              <textarea
                value={safeProps.emptyStateMessage}
                onChange={(e) => handleChange({ emptyStateMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="No featured products available at the moment. Check back soon!"
              />
            </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === 'display' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile (1 col)</label>
                <select
                  value={safeProps.itemsPerRow.sm}
                  onChange={(e) => handleItemsPerRowChange('sm', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2].map(num => (
                    <option key={num} value={num}>{num} item{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tablet</label>
                <select
                  value={safeProps.itemsPerRow.md}
                  onChange={(e) => handleItemsPerRowChange('md', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} item{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desktop</label>
                <select
                  value={safeProps.itemsPerRow.lg}
                  onChange={(e) => handleItemsPerRowChange('lg', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} item{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Product Information</h4>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showPrice"
                  checked={safeProps.showPrice}
                  onChange={(e) => handleChange({ showPrice: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showPrice" className="text-sm font-medium text-gray-700">Show Price</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showComparePrice"
                  checked={safeProps.showComparePrice}
                  onChange={(e) => handleChange({ showComparePrice: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showComparePrice" className="text-sm font-medium text-gray-700">Show Compare Price</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showDescription"
                  checked={safeProps.showDescription}
                  onChange={(e) => handleChange({ showDescription: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showDescription" className="text-sm font-medium text-gray-700">Show Description</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showAddToCart"
                  checked={safeProps.showAddToCart}
                  onChange={(e) => handleChange({ showAddToCart: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showAddToCart" className="text-sm font-medium text-gray-700">Show Add to Cart Button</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showRating"
                  checked={safeProps.showRating}
                  onChange={(e) => handleChange({ showRating: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showRating" className="text-sm font-medium text-gray-700">Show Rating (Future Feature)</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showBadges"
                  checked={safeProps.showBadges}
                  onChange={(e) => handleChange({ showBadges: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showBadges" className="text-sm font-medium text-gray-700">Show Featured Badge</label>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Tab */}
        {activeTab === 'carousel' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="carouselEnabled"
                checked={safeProps.carousel.enabled}
                onChange={(e) => handleCarouselChange({ enabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="carouselEnabled" className="text-sm font-medium text-gray-700">Enable Carousel Mode</label>
            </div>

            {safeProps.carousel.enabled && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={safeProps.carousel.autoplay}
                    onChange={(e) => handleCarouselChange({ autoplay: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoplay" className="text-sm font-medium text-gray-700">Auto-play Carousel</label>
                </div>

                {safeProps.carousel.autoplay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-play Speed (ms)</label>
                    <input
                      type="number"
                      min="2000"
                      max="10000"
                      step="500"
                      value={safeProps.carousel.autoplaySpeed}
                      onChange={(e) => handleCarouselChange({ autoplaySpeed: parseInt(e.target.value) || 4000 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="infinite"
                    checked={safeProps.carousel.infinite}
                    onChange={(e) => handleCarouselChange({ infinite: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="infinite" className="text-sm font-medium text-gray-700">Infinite Loop</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pauseOnHover"
                    checked={safeProps.carousel.pauseOnHover}
                    onChange={(e) => handleCarouselChange({ pauseOnHover: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="pauseOnHover" className="text-sm font-medium text-gray-700">Pause on Hover</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showArrows"
                    checked={safeProps.carousel.showArrows}
                    onChange={(e) => handleCarouselChange({ showArrows: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showArrows" className="text-sm font-medium text-gray-700">Show Navigation Arrows</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDots"
                    checked={safeProps.carousel.showDots}
                    onChange={(e) => handleCarouselChange({ showDots: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showDots" className="text-sm font-medium text-gray-700">Show Dots Indicator</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items to Scroll</label>
                  <select
                    value={safeProps.carousel.slidesToScroll}
                    onChange={(e) => handleCarouselChange({ slidesToScroll: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} item{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spacing Between Items (px)</label>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    value={safeProps.carousel.spacing}
                    onChange={(e) => handleCarouselChange({ spacing: parseInt(e.target.value) || 16 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Styling Tab */}
        {activeTab === 'styling' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Padding</label>
              <select
                value={safeProps.padding}
                onChange={(e) => handleChange({ padding: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="py-8 px-4">Small (8)</option>
                <option value="py-12 px-4">Medium (12)</option>
                <option value="py-16 px-4">Large (16)</option>
                <option value="py-24 px-4">Extra Large (24)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Aspect Ratio</label>
              <select
                value={safeProps.styling.aspectRatio}
                onChange={(e) => handleStylingChange({ aspectRatio: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto</option>
                <option value="square">Square (1:1)</option>
                <option value="4/3">Classic (4:3)</option>
                <option value="16/9">Widescreen (16:9)</option>
                <option value="3/2">Photo (3:2)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
              <select
                value={safeProps.styling.buttonStyle}
                onChange={(e) => handleStylingChange({ buttonStyle: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
              <select
                value={safeProps.styling.borderRadius}
                onChange={(e) => handleStylingChange({ borderRadius: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Full</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Shadow</label>
              <select
                value={safeProps.styling.shadow}
                onChange={(e) => handleStylingChange({ shadow: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Colors</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <select
                  value={safeProps.styling.backgroundColor}
                  onChange={(e) => handleStylingChange({ backgroundColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bg-white">White</option>
                  <option value="bg-gray-50">Light Gray</option>
                  <option value="bg-gray-100">Gray</option>
                  <option value="bg-blue-50">Light Blue</option>
                  <option value="bg-purple-50">Light Purple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Background</label>
                <select
                  value={safeProps.styling.cardBackground}
                  onChange={(e) => handleStylingChange({ cardBackground: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bg-white">White</option>
                  <option value="bg-gray-50">Light Gray</option>
                  <option value="bg-gray-100">Gray</option>
                  <option value="bg-transparent">Transparent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
                <select
                  value={safeProps.styling.titleColor}
                  onChange={(e) => handleStylingChange({ titleColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text-gray-900">Dark Gray</option>
                  <option value="text-black">Black</option>
                  <option value="text-blue-600">Blue</option>
                  <option value="text-purple-600">Purple</option>
                  <option value="text-white">White</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Color</label>
                <select
                  value={safeProps.styling.priceColor}
                  onChange={(e) => handleStylingChange({ priceColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text-gray-900">Dark Gray</option>
                  <option value="text-black">Black</option>
                  <option value="text-blue-600">Blue</option>
                  <option value="text-green-600">Green</option>
                  <option value="text-red-600">Red</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};