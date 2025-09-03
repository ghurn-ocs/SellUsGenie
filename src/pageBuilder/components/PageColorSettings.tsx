/**
 * Page Color Settings Component
 * Allows users to select and customize color palettes for their pages
 */

import React, { useState } from 'react';
import { Palette, Paintbrush, Eye, RotateCcw, Save } from 'lucide-react';
import type { PageDocument, ColorPalette, ColorPaletteApplyOptions } from '../types';
import { ColorPaletteSelector } from './ColorPaletteSelector';
import { predefinedColorPalettes, getPaletteById, DEFAULT_PALETTE_ID } from '../data/colorPalettes';
import { applyColorPaletteToRoot, generateCSSVariables } from '../utils/colorPaletteUtils';

interface PageColorSettingsProps {
  document: PageDocument;
  onDocumentChange: (doc: PageDocument) => void;
  className?: string;
}

interface CustomColorEditor {
  isOpen: boolean;
  category: keyof ColorPalette['colors'] | null;
}

const COLOR_CATEGORIES = [
  {
    id: 'backgrounds' as const,
    name: 'Backgrounds',
    colors: [
      { key: 'background' as const, label: 'Main Background', description: 'Primary page background' },
      { key: 'backgroundSecondary' as const, label: 'Secondary Background', description: 'Card and section backgrounds' },
      { key: 'backgroundAccent' as const, label: 'Accent Background', description: 'Highlighted areas' },
    ]
  },
  {
    id: 'text' as const,
    name: 'Text Colors',
    colors: [
      { key: 'textPrimary' as const, label: 'Primary Text', description: 'Main content text' },
      { key: 'textSecondary' as const, label: 'Secondary Text', description: 'Supporting text' },
      { key: 'textMuted' as const, label: 'Muted Text', description: 'Captions and labels' },
      { key: 'textInverse' as const, label: 'Inverse Text', description: 'Text on dark backgrounds' },
    ]
  },
  {
    id: 'buttons' as const,
    name: 'Buttons',
    colors: [
      { key: 'buttonPrimary' as const, label: 'Primary Button', description: 'Main action buttons' },
      { key: 'buttonPrimaryHover' as const, label: 'Primary Button Hover', description: 'Primary button hover state' },
      { key: 'buttonSecondary' as const, label: 'Secondary Button', description: 'Secondary action buttons' },
      { key: 'buttonSecondaryHover' as const, label: 'Secondary Button Hover', description: 'Secondary button hover state' },
    ]
  },
  {
    id: 'branding' as const,
    name: 'Brand Colors',
    colors: [
      { key: 'primary' as const, label: 'Primary Brand', description: 'Main brand color' },
      { key: 'primaryHover' as const, label: 'Primary Hover', description: 'Primary color hover state' },
      { key: 'secondary' as const, label: 'Secondary Brand', description: 'Secondary brand color' },
      { key: 'secondaryHover' as const, label: 'Secondary Hover', description: 'Secondary color hover state' },
      { key: 'accent' as const, label: 'Accent Color', description: 'Accent and highlight color' },
      { key: 'accentHover' as const, label: 'Accent Hover', description: 'Accent color hover state' },
    ]
  },
  {
    id: 'ui' as const,
    name: 'UI Elements',
    colors: [
      { key: 'border' as const, label: 'Borders', description: 'Default border color' },
      { key: 'borderHover' as const, label: 'Border Hover', description: 'Interactive border color' },
      { key: 'shadow' as const, label: 'Shadows', description: 'Shadow color for depth' },
    ]
  },
  {
    id: 'headerFooter' as const,
    name: 'Header & Footer',
    colors: [
      { key: 'headerBackground' as const, label: 'Header Background', description: 'Website header background' },
      { key: 'headerText' as const, label: 'Header Text', description: 'Header text and navigation' },
      { key: 'footerBackground' as const, label: 'Footer Background', description: 'Website footer background' },
      { key: 'footerText' as const, label: 'Footer Text', description: 'Footer text and links' },
    ]
  }
];

export const PageColorSettings: React.FC<PageColorSettingsProps> = ({
  document,
  onDocumentChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'custom'>('palette');
  const [showPaletteSelector, setShowPaletteSelector] = useState(false);
  const [customColorEditor, setCustomColorEditor] = useState<CustomColorEditor>({
    isOpen: false,
    category: null
  });

  // Get current palette from theme_overrides
  const themeOverrides = document.themeOverrides || {};
  const colorPaletteData = themeOverrides.colorPalette || {};
  const currentPaletteId = colorPaletteData.paletteId || DEFAULT_PALETTE_ID;
  const currentPalette = getPaletteById(currentPaletteId);
  const customColors = colorPaletteData.customColors || {};
  const applyOptions = colorPaletteData.applyOptions || {
    backgrounds: true,
    buttons: true,
    text: true,
    borders: true,
    headerFooter: true,
    customElements: []
  };

  // Get effective colors (palette + custom overrides)
  const effectiveColors = currentPalette ? {
    ...currentPalette.colors,
    ...customColors
  } : {} as ColorPalette['colors'];

  const handlePaletteChange = (palette: ColorPalette) => {
    const newDocument = {
      ...document,
      themeOverrides: {
        ...themeOverrides,
        colorPalette: {
          ...colorPaletteData,
          paletteId: palette.id,
          customColors: {}, // Reset custom colors when changing palette
          applyOptions
        }
      }
    };
    onDocumentChange(newDocument);
    
    // Apply to preview immediately
    applyColorPaletteToRoot(palette);
    setShowPaletteSelector(false);
  };

  const handleCustomColorChange = (colorKey: keyof ColorPalette['colors'], color: string) => {
    const newCustomColors = {
      ...customColors,
      [colorKey]: color
    };

    const newDocument = {
      ...document,
      themeOverrides: {
        ...themeOverrides,
        colorPalette: {
          ...colorPaletteData,
          paletteId: currentPaletteId,
          customColors: newCustomColors,
          applyOptions
        }
      }
    };
    onDocumentChange(newDocument);

    // Apply to preview immediately if we have a current palette
    if (currentPalette) {
      const effectivePalette = {
        ...currentPalette,
        colors: { ...currentPalette.colors, ...newCustomColors }
      };
      applyColorPaletteToRoot(effectivePalette);
    }
  };

  const handleApplyOptionsChange = (options: ColorPaletteApplyOptions) => {
    const newDocument = {
      ...document,
      themeOverrides: {
        ...themeOverrides,
        colorPalette: {
          ...colorPaletteData,
          paletteId: currentPaletteId,
          customColors,
          applyOptions: options
        }
      }
    };
    onDocumentChange(newDocument);
  };

  const resetToOriginalPalette = () => {
    if (currentPalette) {
      const newDocument = {
        ...document,
        themeOverrides: {
          ...themeOverrides,
          colorPalette: {
            ...colorPaletteData,
            paletteId: currentPaletteId,
            customColors: {}, // Clear all custom colors
            applyOptions
          }
        }
      };
      onDocumentChange(newDocument);
      applyColorPaletteToRoot(currentPalette);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Page Colors</h3>
        </div>
        {Object.keys(customColors).length > 0 && (
          <button
            onClick={resetToOriginalPalette}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="Reset to original palette"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Current Palette Display */}
      {currentPalette && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{currentPalette.name}</h4>
              <p className="text-sm text-gray-600">{currentPalette.description}</p>
              {Object.keys(customColors).length > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                  {Object.keys(customColors).length} custom color{Object.keys(customColors).length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPaletteSelector(!showPaletteSelector)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change Palette
            </button>
          </div>

          {/* Color Preview */}
          <div className="flex space-x-1">
            {[
              effectiveColors.primary,
              effectiveColors.secondary,
              effectiveColors.accent,
              effectiveColors.background,
              effectiveColors.textPrimary
            ].filter(Boolean).map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Palette Selector */}
      {showPaletteSelector && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <ColorPaletteSelector
            currentPalette={currentPalette}
            onPaletteChange={handlePaletteChange}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('palette')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'palette'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Quick Palette
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'custom'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Individual Colors
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'palette' && (
        <div className="space-y-4">
          {/* Apply Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Apply To:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                backgrounds: 'Backgrounds',
                text: 'Text Colors',
                buttons: 'Buttons',
                borders: 'Borders',
                headerFooter: 'Header & Footer'
              } as const).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={applyOptions[key] ?? true}
                    onChange={(e) => handleApplyOptionsChange({
                      ...applyOptions,
                      [key]: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Palette Grid */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Change:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {predefinedColorPalettes.slice(0, 12).map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => handlePaletteChange(palette)}
                  className={`p-3 border rounded-lg transition-all hover:shadow-md ${
                    currentPaletteId === palette.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex space-x-1 mb-2">
                    {[palette.colors.primary, palette.colors.secondary, palette.colors.accent].map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate">{palette.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{palette.category}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-6">
          {COLOR_CATEGORIES.map((category) => (
            <div key={category.id}>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Paintbrush className="w-4 h-4" />
                <span>{category.name}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.colors.map((colorInfo) => {
                  const currentColor = effectiveColors[colorInfo.key] || '#000000';
                  const isCustomized = colorInfo.key in customColors;
                  
                  return (
                    <div
                      key={colorInfo.key}
                      className={`p-3 border rounded-lg transition-all ${
                        isCustomized ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: currentColor }}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{colorInfo.label}</p>
                              {isCustomized && (
                                <span className="text-xs text-purple-600">Modified</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{colorInfo.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleCustomColorChange(colorInfo.key, e.target.value)}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          {isCustomized && (
                            <button
                              onClick={() => {
                                const newCustomColors = { ...customColors };
                                delete newCustomColors[colorInfo.key];
                                const newDocument = {
                                  ...document,
                                  themeOverrides: {
                                    ...themeOverrides,
                                    colorPalette: {
                                      ...colorPaletteData,
                                      paletteId: currentPaletteId,
                                      customColors: newCustomColors,
                                      applyOptions
                                    }
                                  }
                                };
                                onDocumentChange(newDocument);
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Reset to palette default"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {currentColor.toUpperCase()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};