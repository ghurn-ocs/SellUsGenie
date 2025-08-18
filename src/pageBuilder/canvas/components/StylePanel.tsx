/**
 * Style Panel - Real-time style editing for selected elements
 * Provides comprehensive styling controls with live preview updates
 */

import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Palette, Type, Layout, Move3D } from 'lucide-react';
import { useCanvasStore, useSelectedElement, useActiveBreakpoint } from '../store/CanvasStore';
import { CSSProperties } from '../types/CanvasTypes';

interface StylePanelProps {
  className?: string;
}

interface StyleSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
}

export const StylePanel: React.FC<StylePanelProps> = ({
  className = ''
}) => {
  const selectedElement = useSelectedElement();
  const activeBreakpoint = useActiveBreakpoint();
  const { updateElementStyles, getComputedStyles } = useCanvasStore();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layout: true,
    typography: false,
    spacing: false,
    appearance: false
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleStyleChange = useCallback((property: keyof CSSProperties, value: string) => {
    if (selectedElement) {
      updateElementStyles(selectedElement.id, { [property]: value }, activeBreakpoint);
    }
  }, [selectedElement, updateElementStyles, activeBreakpoint]);

  if (!selectedElement) {
    return (
      <div className={`bg-white border-l border-gray-200 ${className}`}>
        <div className="p-4 text-center">
          <div className="text-gray-400 mb-2">
            <Palette className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">
            Select an element to edit its styles
          </p>
        </div>
      </div>
    );
  }

  const computedStyles = getComputedStyles(selectedElement.id, activeBreakpoint);

  const sections: StyleSection[] = [
    { id: 'layout', title: 'Layout', icon: Layout, isOpen: openSections.layout },
    { id: 'typography', title: 'Typography', icon: Type, isOpen: openSections.typography },
    { id: 'spacing', title: 'Spacing', icon: Move3D, isOpen: openSections.spacing },
    { id: 'appearance', title: 'Appearance', icon: Palette, isOpen: openSections.appearance }
  ];

  const renderInputField = (
    label: string,
    property: keyof CSSProperties,
    type: 'text' | 'number' | 'color' | 'select' = 'text',
    options?: string[]
  ) => {
    const value = computedStyles[property] || '';
    
    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">
          {label}
        </label>
        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => handleStyleChange(property, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Default</option>
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleStyleChange(property, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={type === 'color' ? '#000000' : 'auto'}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border-l border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Styles</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Editing: {selectedElement.tag.toUpperCase()} • {activeBreakpoint}
        </p>
      </div>

      {/* Style Sections */}
      <div className="p-4 space-y-4">
        {/* Layout Section */}
        <div>
          <button
            onClick={() => toggleSection('layout')}
            className="flex items-center justify-between w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <Layout className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Layout</span>
            </div>
            {openSections.layout ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openSections.layout && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {renderInputField('Display', 'display', 'select', [
                'block', 'inline', 'inline-block', 'flex', 'grid', 'none'
              ])}
              {renderInputField('Position', 'position', 'select', [
                'static', 'relative', 'absolute', 'fixed', 'sticky'
              ])}
              {renderInputField('Width', 'width')}
              {renderInputField('Height', 'height')}
              {renderInputField('Max Width', 'maxWidth')}
              {renderInputField('Min Height', 'minHeight')}
            </div>
          )}
        </div>

        {/* Typography Section */}
        <div>
          <button
            onClick={() => toggleSection('typography')}
            className="flex items-center justify-between w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Typography</span>
            </div>
            {openSections.typography ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openSections.typography && (
            <div className="mt-3 space-y-3">
              {renderInputField('Font Size', 'fontSize')}
              {renderInputField('Font Weight', 'fontWeight', 'select', [
                '100', '200', '300', '400', '500', '600', '700', '800', '900',
                'normal', 'bold', 'bolder', 'lighter'
              ])}
              {renderInputField('Line Height', 'lineHeight')}
              {renderInputField('Text Align', 'textAlign', 'select', [
                'left', 'center', 'right', 'justify'
              ])}
              {renderInputField('Color', 'color', 'color')}
              {renderInputField('Text Transform', 'textTransform', 'select', [
                'none', 'uppercase', 'lowercase', 'capitalize'
              ])}
            </div>
          )}
        </div>

        {/* Spacing Section */}
        <div>
          <button
            onClick={() => toggleSection('spacing')}
            className="flex items-center justify-between w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <Move3D className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Spacing</span>
            </div>
            {openSections.spacing ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openSections.spacing && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {renderInputField('Margin', 'margin')}
                {renderInputField('Padding', 'padding')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderInputField('Margin Top', 'marginTop')}
                {renderInputField('Margin Right', 'marginRight')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderInputField('Margin Bottom', 'marginBottom')}
                {renderInputField('Margin Left', 'marginLeft')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderInputField('Padding Top', 'paddingTop')}
                {renderInputField('Padding Right', 'paddingRight')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderInputField('Padding Bottom', 'paddingBottom')}
                {renderInputField('Padding Left', 'paddingLeft')}
              </div>
            </div>
          )}
        </div>

        {/* Appearance Section */}
        <div>
          <button
            onClick={() => toggleSection('appearance')}
            className="flex items-center justify-between w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Appearance</span>
            </div>
            {openSections.appearance ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openSections.appearance && (
            <div className="mt-3 space-y-3">
              {renderInputField('Background Color', 'backgroundColor', 'color')}
              {renderInputField('Border', 'border')}
              {renderInputField('Border Radius', 'borderRadius')}
              {renderInputField('Box Shadow', 'boxShadow')}
              {renderInputField('Opacity', 'opacity', 'number')}
              {renderInputField('Overflow', 'overflow', 'select', [
                'visible', 'hidden', 'scroll', 'auto'
              ])}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Current Breakpoint: {activeBreakpoint}</div>
          <div>Changes apply to {activeBreakpoint} and smaller screens</div>
        </div>
      </div>
    </div>
  );
};