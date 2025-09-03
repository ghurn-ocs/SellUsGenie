/**
 * Product Listing Widget Editor - Enhanced with Expandable Sections
 * Configuration interface for the product listing widget
 */

import React, { useState } from 'react';
import { WidgetEditorProps } from '../../types';
import { ProductListingProps } from './index';
import { ExpandableSection } from '../../components/ExpandableSection';
import { 
  FileText, 
  Monitor,
  Sparkles,
  BookOpen,
  ArrowUpDown,
  Tag,
  Search,
  Palette
} from 'lucide-react';

export const ProductListingEditor: React.FC<WidgetEditorProps<ProductListingProps>> = ({
  props,
  onChange
}) => {
  // State for managing which sections are open
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['basic', 'features']) // Open most important sections by default
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

  // Provide default values for all props to prevent crashes
  const safeProps = {
    title: 'Our Products',
    subtitle: 'Discover our amazing product collection',
    showSearch: true,
    showCategoryFilter: true,
    showFavorites: true,
    showAddToCart: true,
    productsPerRow: 3,
    showPagination: true,
    productsPerPage: 12,
    displayMode: 'grid' as const,
    sortOptions: ['name', 'price-low-high', 'price-high-low', 'newest', 'popular'],
    defaultSort: 'name',
    showQuickView: true,
    enableImageZoom: true,
    categoryFilter: 'all' as const,
    specificCategories: [],
    priceFilter: true,
    stockFilter: true,
    customCSS: '',
    ...props
  };

  const updateProp = (key: keyof ProductListingProps, value: any) => {
    onChange({ ...safeProps, [key]: value });
  };

  return (
    <div className="space-y-0">
      {/* Basic Settings */}
      <ExpandableSection
        title="Basic Settings"
        description="Title, layout, and display options"
        icon={FileText}
        isOpen={openSections.has('basic')}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={safeProps.title}
              onChange={(e) => updateProp('title', e.target.value)}
              placeholder="Our Products"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              value={safeProps.subtitle}
              onChange={(e) => updateProp('subtitle', e.target.value)}
              placeholder="Discover our amazing product collection"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional descriptive text shown below the title
            </p>
          </div>
        </div>
      </ExpandableSection>

      {/* Display Options */}
      <ExpandableSection
        title="Display Options"
        description="Layout and visual presentation"
        icon={Monitor}
        isOpen={openSections.has('display')}
        onToggle={() => toggleSection('display')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Products Per Row
            </label>
            <select
              value={safeProps.productsPerRow}
              onChange={(e) => updateProp('productsPerRow', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
              <option value={5}>5 Columns</option>
              <option value={6}>6 Columns</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Display Mode
            </label>
            <select
              value={safeProps.displayMode}
              onChange={(e) => updateProp('displayMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>
      </ExpandableSection>

      {/* Features */}
      <ExpandableSection
        title="Features"
        description="Interactive elements and functionality"
        icon={Sparkles}
        isOpen={openSections.has('features')}
        onToggle={() => toggleSection('features')}
      >
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.showSearch}
              onChange={(e) => updateProp('showSearch', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Search Bar</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.showCategoryFilter}
              onChange={(e) => updateProp('showCategoryFilter', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Category Filter</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.showFavorites}
              onChange={(e) => updateProp('showFavorites', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Favorites Button</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.showAddToCart}
              onChange={(e) => updateProp('showAddToCart', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Add to Cart Button</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.showQuickView}
              onChange={(e) => updateProp('showQuickView', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Quick View Button</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.enableImageZoom}
              onChange={(e) => updateProp('enableImageZoom', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Image Zoom on Hover</span>
          </label>
        </div>
      </ExpandableSection>

      {/* Pagination */}
      <ExpandableSection
        title="Pagination"
        description="Page navigation and products per page"
        icon={BookOpen}
        isOpen={openSections.has('pagination')}
        onToggle={() => toggleSection('pagination')}
      >
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.showPagination}
              onChange={(e) => updateProp('showPagination', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Pagination</span>
          </label>

          {safeProps.showPagination && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products Per Page
              </label>
              <select
                value={safeProps.productsPerPage}
                onChange={(e) => updateProp('productsPerPage', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={6}>6 Products</option>
                <option value={12}>12 Products</option>
                <option value={24}>24 Products</option>
                <option value={36}>36 Products</option>
                <option value={48}>48 Products</option>
              </select>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Sorting */}
      <ExpandableSection
        title="Sorting"
        description="Sort options and default order"
        icon={ArrowUpDown}
        isOpen={openSections.has('sorting')}
        onToggle={() => toggleSection('sorting')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sort Options
            </label>
            <div className="space-y-2">
              {[
                { value: 'name', label: 'Name A-Z' },
                { value: 'price-low-high', label: 'Price: Low to High' },
                { value: 'price-high-low', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest First' },
                { value: 'popular', label: 'Most Popular' },
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={safeProps.sortOptions.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateProp('sortOptions', [...safeProps.sortOptions, option.value]);
                      } else {
                        updateProp('sortOptions', safeProps.sortOptions.filter(s => s !== option.value));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Sort
            </label>
            <select
              value={safeProps.defaultSort}
              onChange={(e) => updateProp('defaultSort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {safeProps.sortOptions.map(option => {
                const labels = {
                  'name': 'Name A-Z',
                  'price-low-high': 'Price: Low to High',
                  'price-high-low': 'Price: High to Low',
                  'newest': 'Newest First',
                  'popular': 'Most Popular',
                };
                return (
                  <option key={option} value={option}>
                    {labels[option as keyof typeof labels] || option}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </ExpandableSection>

      {/* Category Filtering */}
      <ExpandableSection
        title="Category Filtering"
        description="Control which product categories to show"
        icon={Tag}
        isOpen={openSections.has('categories')}
        onToggle={() => toggleSection('categories')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Filter Type
            </label>
            <select
              value={safeProps.categoryFilter}
              onChange={(e) => updateProp('categoryFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Show All Categories</option>
              <option value="specific">Show Specific Categories Only</option>
            </select>
          </div>

          {safeProps.categoryFilter === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Categories (one per line)
              </label>
              <textarea
                value={safeProps.specificCategories.join('\n')}
                onChange={(e) => updateProp('specificCategories', 
                  e.target.value.split('\n').filter(cat => cat.trim())
                )}
                placeholder="Electronics&#10;Clothing&#10;Books"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter category names exactly as they appear in your product catalog
              </p>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Advanced Filters */}
      <ExpandableSection
        title="Advanced Filters"
        description="Price range and stock filters"
        icon={Search}
        isOpen={openSections.has('filters')}
        onToggle={() => toggleSection('filters')}
      >
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.priceFilter}
              onChange={(e) => updateProp('priceFilter', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Price Range Filter</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={safeProps.stockFilter}
              onChange={(e) => updateProp('stockFilter', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Stock Filter</span>
          </label>
        </div>
      </ExpandableSection>

      {/* Custom Styling */}
      <ExpandableSection
        title="Custom Styling"
        description="Custom CSS for advanced styling"
        icon={Palette}
        isOpen={openSections.has('styling')}
        onToggle={() => toggleSection('styling')}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom CSS
          </label>
          <textarea
            value={safeProps.customCSS}
            onChange={(e) => updateProp('customCSS', e.target.value)}
            placeholder=".product-card { border-radius: 12px; }"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add custom CSS to style the product listing. Use classes like .product-card, .product-image, etc.
          </p>
        </div>
      </ExpandableSection>
    </div>
  );
};