/**
 * Responsive Design Editor
 * Advanced responsive controls for breakpoint-specific styling
 */

import React, { useState, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, Settings } from 'lucide-react';
import type { StyleSettings, ResponsiveSettings, Breakpoint } from '../types';

interface ResponsiveEditorProps {
  styles: ResponsiveSettings;
  onStylesChange: (styles: ResponsiveSettings) => void;
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  visibility?: { sm?: boolean; md?: boolean; lg?: boolean };
  onVisibilityChange?: (visibility: { sm?: boolean; md?: boolean; lg?: boolean }) => void;
}

const BREAKPOINTS = [
  { id: 'sm' as const, name: 'Mobile', icon: Smartphone, width: '320px+' },
  { id: 'md' as const, name: 'Tablet', icon: Tablet, width: '768px+' },
  { id: 'lg' as const, name: 'Desktop', icon: Monitor, width: '1024px+' },
];

export const ResponsiveEditor: React.FC<ResponsiveEditorProps> = ({
  styles,
  onStylesChange,
  currentBreakpoint,
  onBreakpointChange,
  visibility,
  onVisibilityChange,
}) => {
  const [activeSection, setActiveSection] = useState<'layout' | 'typography' | 'colors' | 'effects'>('layout');

  const currentStyles = styles[currentBreakpoint] || {};

  const updateCurrentStyles = useCallback((updates: Partial<StyleSettings>) => {
    const newStyles = {
      ...styles,
      [currentBreakpoint]: {
        ...currentStyles,
        ...updates,
      },
    };
    onStylesChange(newStyles);
  }, [styles, currentBreakpoint, currentStyles, onStylesChange]);

  const updateSpacing = useCallback((type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const spacing = currentStyles.spacing || {};
    const currentSpacing = spacing[type] || {};
    
    updateCurrentStyles({
      spacing: {
        ...spacing,
        [type]: {
          ...currentSpacing,
          [side]: value,
        },
      },
    });
  }, [currentStyles.spacing, updateCurrentStyles]);

  const updateBorder = useCallback((property: keyof NonNullable<StyleSettings['border']>, value: any) => {
    const border = currentStyles.border || {};
    
    updateCurrentStyles({
      border: {
        ...border,
        [property]: value,
      },
    });
  }, [currentStyles.border, updateCurrentStyles]);

  const updateTypography = useCallback((property: keyof NonNullable<StyleSettings['typography']>, value: any) => {
    const typography = currentStyles.typography || {};
    
    updateCurrentStyles({
      typography: {
        ...typography,
        [property]: value,
      },
    });
  }, [currentStyles.typography, updateCurrentStyles]);

  const updateBackground = useCallback((property: keyof NonNullable<StyleSettings['background']>, value: any) => {
    const background = currentStyles.background || { type: 'color', value: '#ffffff' };
    
    updateCurrentStyles({
      background: {
        ...background,
        [property]: value,
      },
    });
  }, [currentStyles.background, updateCurrentStyles]);

  const updateShadow = useCallback((property: keyof NonNullable<StyleSettings['shadow']>, value: any) => {
    const shadow = currentStyles.shadow || {};
    
    updateCurrentStyles({
      shadow: {
        ...shadow,
        [property]: value,
      },
    });
  }, [currentStyles.shadow, updateCurrentStyles]);

  const renderBreakpointSelector = () => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Device Preview</h3>
      <div className="flex space-x-1">
        {BREAKPOINTS.map(({ id, name, icon: Icon, width }) => (
          <button
            key={id}
            onClick={() => onBreakpointChange(id)}
            className={`flex-1 flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentBreakpoint === id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{name}</span>
            <span className="text-xs opacity-75">{width}</span>
          </button>
        ))}
      </div>
      
      {onVisibilityChange && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Visibility</h4>
          <div className="flex space-x-4">
            {BREAKPOINTS.map(({ id, name, icon: Icon }) => (
              <label key={id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={visibility?.[id] !== false}
                  onChange={(e) => onVisibilityChange({ ...visibility, [id]: e.target.checked })}
                  className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <Icon className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSectionTabs = () => (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
      {[
        { id: 'layout', label: 'Layout', icon: Settings },
        { id: 'typography', label: 'Text', icon: Settings },
        { id: 'colors', label: 'Colors', icon: Settings },
        { id: 'effects', label: 'Effects', icon: Settings },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setActiveSection(id as typeof activeSection)}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeSection === id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderLayoutSection = () => (
    <div className="space-y-4">
      {/* Spacing */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Spacing</h4>
        
        {/* Padding */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-2">Padding</label>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <div key={side} className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 w-8 capitalize">{side}:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentStyles.spacing?.padding?.[side] || 0}
                  onChange={(e) => updateSpacing('padding', side, parseInt(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Margin */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Margin</label>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <div key={side} className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 w-8 capitalize">{side}:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentStyles.spacing?.margin?.[side] || 0}
                  onChange={(e) => updateSpacing('margin', side, parseInt(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Border */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Border</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 w-12">Width:</label>
            <input
              type="number"
              min="0"
              max="20"
              value={currentStyles.border?.width || 0}
              onChange={(e) => updateBorder('width', parseInt(e.target.value) || 0)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 w-12">Style:</label>
            <select
              value={currentStyles.border?.style || 'solid'}
              onChange={(e) => updateBorder('style', e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 w-12">Color:</label>
            <input
              type="color"
              value={currentStyles.border?.color || '#000000'}
              onChange={(e) => updateBorder('color', e.target.value)}
              className="flex-1 h-8 border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-600 w-12">Radius:</label>
            <input
              type="number"
              min="0"
              max="50"
              value={currentStyles.border?.radius || 0}
              onChange={(e) => updateBorder('radius', parseInt(e.target.value) || 0)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTypographySection = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Typography</h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
          <select
            value={currentStyles.typography?.fontFamily || 'inherit'}
            onChange={(e) => updateTypography('fontFamily', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="inherit">Inherit</option>
            <option value="Inter">Inter</option>
            <option value="system-ui">System</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
            <input
              type="number"
              min="8"
              max="72"
              value={currentStyles.typography?.fontSize || 16}
              onChange={(e) => updateTypography('fontSize', parseInt(e.target.value) || 16)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
            <select
              value={currentStyles.typography?.fontWeight || 400}
              onChange={(e) => updateTypography('fontWeight', parseInt(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
          <input
            type="color"
            value={currentStyles.typography?.color || '#000000'}
            onChange={(e) => updateTypography('color', e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
          <select
            value={currentStyles.typography?.align || 'left'}
            onChange={(e) => updateTypography('align', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Line Height</label>
            <input
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={currentStyles.typography?.lineHeight || 1.5}
              onChange={(e) => updateTypography('lineHeight', parseFloat(e.target.value) || 1.5)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Letter Spacing</label>
            <input
              type="number"
              min="-2"
              max="5"
              step="0.1"
              value={currentStyles.typography?.letterSpacing || 0}
              onChange={(e) => updateTypography('letterSpacing', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderColorsSection = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Background</h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={currentStyles.background?.type || 'color'}
            onChange={(e) => updateBackground('type', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="color">Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {currentStyles.background?.type === 'color' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={currentStyles.background?.value || '#ffffff'}
              onChange={(e) => updateBackground('value', e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
        )}

        {currentStyles.background?.type === 'gradient' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gradient</label>
            <input
              type="text"
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              value={currentStyles.background?.value || ''}
              onChange={(e) => updateBackground('value', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        )}

        {currentStyles.background?.type === 'image' && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={currentStyles.background?.value || ''}
                onChange={(e) => updateBackground('value', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
              <select
                value={currentStyles.background?.position || 'center'}
                onChange={(e) => updateBackground('position', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
              <select
                value={currentStyles.background?.size || 'cover'}
                onChange={(e) => updateBackground('size', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Overlay Color</label>
          <input
            type="color"
            value={currentStyles.background?.overlay || '#000000'}
            onChange={(e) => updateBackground('overlay', e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );

  const renderEffectsSection = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Shadow</h4>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X Offset</label>
            <input
              type="number"
              min="-20"
              max="20"
              value={currentStyles.shadow?.x || 0}
              onChange={(e) => updateShadow('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y Offset</label>
            <input
              type="number"
              min="-20"
              max="20"
              value={currentStyles.shadow?.y || 0}
              onChange={(e) => updateShadow('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Blur</label>
            <input
              type="number"
              min="0"
              max="50"
              value={currentStyles.shadow?.blur || 0}
              onChange={(e) => updateShadow('blur', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Spread</label>
            <input
              type="number"
              min="-20"
              max="20"
              value={currentStyles.shadow?.spread || 0}
              onChange={(e) => updateShadow('spread', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Shadow Color</label>
          <input
            type="color"
            value={currentStyles.shadow?.color || '#000000'}
            onChange={(e) => updateShadow('color', e.target.value)}
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="responsive-editor">
      {renderBreakpointSelector()}
      {renderSectionTabs()}
      
      <div className="max-h-80 overflow-y-auto">
        {activeSection === 'layout' && renderLayoutSection()}
        {activeSection === 'typography' && renderTypographySection()}
        {activeSection === 'colors' && renderColorsSection()}
        {activeSection === 'effects' && renderEffectsSection()}
      </div>
    </div>
  );
};