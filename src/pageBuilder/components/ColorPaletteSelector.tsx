/**
 * Color Palette Selector Component
 * Allows users to select and preview color palettes for their pages
 */

import React, { useState } from 'react';
import { Check, Eye, Palette as PaletteIcon, ChevronDown } from 'lucide-react';
import type { ColorPalette } from '../types';
import { predefinedColorPalettes, getPalettesByCategory } from '../data/colorPalettes';

interface ColorPaletteSelectorProps {
  currentPalette?: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  className?: string;
}

interface ColorSwatch {
  color: string;
  label: string;
}

const ColorPreview: React.FC<{ palette: ColorPalette; isSelected: boolean; onClick: () => void }> = ({
  palette,
  isSelected,
  onClick
}) => {
  const swatches: ColorSwatch[] = [
    { color: palette.colors.primary, label: 'Primary' },
    { color: palette.colors.secondary, label: 'Secondary' },
    { color: palette.colors.accent, label: 'Accent' },
    { color: palette.colors.background, label: 'Background' },
    { color: palette.colors.textPrimary, label: 'Text' }
  ];

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Color swatches */}
      <div className="flex space-x-1 mb-2">
        {swatches.map((swatch, index) => (
          <div
            key={index}
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: swatch.color }}
            title={swatch.label}
          />
        ))}
      </div>

      {/* Palette info */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-1">{palette.name}</h4>
        <p className="text-xs text-gray-500 line-clamp-2">{palette.description}</p>
        <div className="mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
            {palette.category}
          </span>
        </div>
      </div>
    </div>
  );
};

const DetailedPaletteView: React.FC<{ palette: ColorPalette; onClose: () => void }> = ({
  palette,
  onClose
}) => {
  const colorGroups = [
    {
      title: 'Brand Colors',
      colors: [
        { key: 'primary', label: 'Primary', value: palette.colors.primary },
        { key: 'primaryHover', label: 'Primary Hover', value: palette.colors.primaryHover },
        { key: 'secondary', label: 'Secondary', value: palette.colors.secondary },
        { key: 'secondaryHover', label: 'Secondary Hover', value: palette.colors.secondaryHover },
        { key: 'accent', label: 'Accent', value: palette.colors.accent },
        { key: 'accentHover', label: 'Accent Hover', value: palette.colors.accentHover }
      ]
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'background', label: 'Background', value: palette.colors.background },
        { key: 'backgroundSecondary', label: 'Background Secondary', value: palette.colors.backgroundSecondary },
        { key: 'backgroundAccent', label: 'Background Accent', value: palette.colors.backgroundAccent }
      ]
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'textPrimary', label: 'Primary Text', value: palette.colors.textPrimary },
        { key: 'textSecondary', label: 'Secondary Text', value: palette.colors.textSecondary },
        { key: 'textMuted', label: 'Muted Text', value: palette.colors.textMuted },
        { key: 'textInverse', label: 'Inverse Text', value: palette.colors.textInverse }
      ]
    },
    {
      title: 'UI Elements',
      colors: [
        { key: 'border', label: 'Border', value: palette.colors.border },
        { key: 'borderHover', label: 'Border Hover', value: palette.colors.borderHover },
        { key: 'shadow', label: 'Shadow', value: palette.colors.shadow }
      ]
    },
    {
      title: 'Buttons',
      colors: [
        { key: 'buttonPrimary', label: 'Primary Button', value: palette.colors.buttonPrimary },
        { key: 'buttonPrimaryHover', label: 'Primary Button Hover', value: palette.colors.buttonPrimaryHover },
        { key: 'buttonSecondary', label: 'Secondary Button', value: palette.colors.buttonSecondary },
        { key: 'buttonSecondaryHover', label: 'Secondary Button Hover', value: palette.colors.buttonSecondaryHover }
      ]
    },
    {
      title: 'Header & Footer',
      colors: [
        { key: 'headerBackground', label: 'Header Background', value: palette.colors.headerBackground },
        { key: 'headerText', label: 'Header Text', value: palette.colors.headerText },
        { key: 'footerBackground', label: 'Footer Background', value: palette.colors.footerBackground },
        { key: 'footerText', label: 'Footer Text', value: palette.colors.footerText }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{palette.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{palette.description}</p>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize mt-2">
                {palette.category}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Color Groups */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
                  {group.title}
                </h4>
                <div className="space-y-2">
                  {group.colors.map((color) => (
                    <div key={color.key} className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{color.label}</div>
                        <div className="text-xs text-gray-500 font-mono">{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  currentPalette,
  onPaletteChange,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailed, setShowDetailed] = useState<ColorPalette | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['all', 'business', 'creative', 'minimal', 'bold', 'nature', 'elegant'];

  const filteredPalettes = predefinedColorPalettes.filter(palette => {
    const matchesCategory = selectedCategory === 'all' || palette.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      palette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      palette.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PaletteIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Color Palettes</h3>
        </div>
        <div className="text-sm text-gray-500">
          {filteredPalettes.length} palettes available
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search palettes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? '☰' : '⊞'}
            </button>
          </div>
        </div>
      </div>

      {/* Current palette display */}
      {currentPalette && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Current Palette</h4>
              <p className="text-sm text-blue-700">{currentPalette.name}</p>
            </div>
            <button
              onClick={() => setShowDetailed(currentPalette)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Palette grid/list */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
      }>
        {filteredPalettes.map((palette) => (
          <ColorPreview
            key={palette.id}
            palette={palette}
            isSelected={currentPalette?.id === palette.id}
            onClick={() => onPaletteChange(palette)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredPalettes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <PaletteIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No palettes found</h4>
          <p className="text-sm">Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Detailed view modal */}
      {showDetailed && (
        <DetailedPaletteView
          palette={showDetailed}
          onClose={() => setShowDetailed(null)}
        />
      )}
    </div>
  );
};