/**
 * Comprehensive Style Panel
 * Webflow-like styling interface for visual CSS editing
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Palette, 
  Type, 
  Square, 
  Layout, 
  RotateCcw,
  Link,
  Unlink,
  ChevronDown,
  ChevronRight,
  Move
} from 'lucide-react';
import { useEditorStore, type CSSProperties } from '../store/EditorStore';
import type { Breakpoint } from '../types';

interface StylePanelProps {
  className?: string;
}

interface StyleSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'color' | 'select';
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface SpacingInputProps {
  label: string;
  values: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  onChange: (values: { top: string; right: string; bottom: string; left: string }) => void;
  isLinked: boolean;
  onLinkToggle: () => void;
}

// Reusable Input Component
const StyleInput: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options,
  placeholder,
  min,
  max,
  step,
  unit
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <label className="text-xs font-medium text-gray-600 min-w-[60px]">{label}</label>
      <div className="flex items-center space-x-1 flex-1">
        {type === 'select' ? (
          <select
            value={value}
            onChange={handleChange}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === 'color' ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="color"
              value={value as string}
              onChange={handleChange}
              className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
        {unit && (
          <span className="text-xs text-gray-500 min-w-[20px]">{unit}</span>
        )}
      </div>
    </div>
  );
};

// Spacing Input Component (for margin/padding)
const SpacingInput: React.FC<SpacingInputProps> = ({
  label,
  values,
  onChange,
  isLinked,
  onLinkToggle
}) => {
  const handleSingleChange = (side: keyof typeof values, value: string) => {
    if (isLinked) {
      onChange({
        top: value,
        right: value,
        bottom: value,
        left: value
      });
    } else {
      onChange({
        ...values,
        [side]: value
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <button
          onClick={onLinkToggle}
          className={`p-1 rounded ${isLinked ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {isLinked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
        </button>
      </div>
      
      {isLinked ? (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={values.top}
            onChange={(e) => handleSingleChange('top', e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="All"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            value={values.top}
            onChange={(e) => handleSingleChange('top', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Top"
          />
          <input
            type="number"
            value={values.right}
            onChange={(e) => handleSingleChange('right', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Right"
          />
          <input
            type="number"
            value={values.bottom}
            onChange={(e) => handleSingleChange('bottom', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Bottom"
          />
          <input
            type="number"
            value={values.left}
            onChange={(e) => handleSingleChange('left', e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Left"
          />
        </div>
      )}
    </div>
  );
};

// Collapsible Style Section
const StyleSection: React.FC<StyleSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">{title}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
    {isOpen && (
      <div className="p-3 pt-0 space-y-3 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// Main Style Panel Component
const StylePanel: React.FC<StylePanelProps> = ({ className }) => {
  const {
    selectedElementId,
    document,
    currentBreakpoint,
    updateElementStyles,
  } = useEditorStore();

  const [openSections, setOpenSections] = useState({
    layout: true,
    spacing: false,
    typography: false,
    colors: false,
    borders: false,
    effects: false,
    background: false,
    transforms: false,
  });

  const [spacingLinked, setSpacingLinked] = useState({
    margin: true,
    padding: true,
  });

  // Get selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId || !document) return null;
    
    for (const section of document.sections) {
      for (const row of section.rows) {
        const widget = row.widgets.find(w => w.id === selectedElementId);
        if (widget) return widget as any;
      }
    }
    return null;
  }, [selectedElementId, document]);

  // Get current styles for selected element
  const currentStyles = useMemo(() => {
    if (!selectedElement) return {};
    
    const baseStyles = selectedElement.styles?.base || {};
    const responsiveStyles = selectedElement.styles?.responsive?.[currentBreakpoint] || {};
    
    return { ...baseStyles, ...responsiveStyles };
  }, [selectedElement, currentBreakpoint]);

  // Update styles helper
  const updateStyles = useCallback((newStyles: Partial<CSSProperties>) => {
    if (selectedElementId) {
      updateElementStyles(selectedElementId, newStyles, currentBreakpoint);
    }
  }, [selectedElementId, currentBreakpoint, updateElementStyles]);

  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // If no element is selected
  if (!selectedElement) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Square className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-medium mb-1">No Element Selected</h3>
          <p className="text-xs">Select an element on the canvas to edit its styles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Styles</h2>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentBreakpoint.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          Editing: <span className="font-medium">{selectedElement.tagName}</span>
          {selectedElement.classList.length > 0 && (
            <span className="text-blue-600 ml-1">
              .{selectedElement.classList.join('.')}
            </span>
          )}
        </div>
      </div>

      {/* Style Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Layout Section */}
        <StyleSection
          title="Layout"
          icon={Layout}
          isOpen={openSections.layout}
          onToggle={() => toggleSection('layout')}
        >
          <StyleInput
            label="Display"
            value={currentStyles.display || 'block'}
            onChange={(value) => updateStyles({ display: value as any })}
            type="select"
            options={['block', 'inline', 'inline-block', 'flex', 'grid', 'none']}
          />
          
          <StyleInput
            label="Position"
            value={currentStyles.position || 'static'}
            onChange={(value) => updateStyles({ position: value as any })}
            type="select"
            options={['static', 'relative', 'absolute', 'fixed', 'sticky']}
          />

          {currentStyles.display === 'flex' && (
            <>
              <StyleInput
                label="Direction"
                value={currentStyles.flexDirection || 'row'}
                onChange={(value) => updateStyles({ flexDirection: value as any })}
                type="select"
                options={['row', 'column', 'row-reverse', 'column-reverse']}
              />
              
              <StyleInput
                label="Justify"
                value={currentStyles.justifyContent || 'flex-start'}
                onChange={(value) => updateStyles({ justifyContent: value as any })}
                type="select"
                options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']}
              />
              
              <StyleInput
                label="Align"
                value={currentStyles.alignItems || 'stretch'}
                onChange={(value) => updateStyles({ alignItems: value as any })}
                type="select"
                options={['flex-start', 'center', 'flex-end', 'stretch', 'baseline']}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <StyleInput
              label="Width"
              value={currentStyles.width || ''}
              onChange={(value) => updateStyles({ width: value.toString() })}
              placeholder="auto"
            />
            <StyleInput
              label="Height"
              value={currentStyles.height || ''}
              onChange={(value) => updateStyles({ height: value.toString() })}
              placeholder="auto"
            />
          </div>
        </StyleSection>

        {/* Spacing Section */}
        <StyleSection
          title="Spacing"
          icon={Move}
          isOpen={openSections.spacing}
          onToggle={() => toggleSection('spacing')}
        >
          <SpacingInput
            label="Margin"
            values={{
              top: currentStyles.marginTop?.toString() || '0',
              right: currentStyles.marginRight?.toString() || '0',
              bottom: currentStyles.marginBottom?.toString() || '0',
              left: currentStyles.marginLeft?.toString() || '0',
            }}
            onChange={(values) => updateStyles({
              marginTop: values.top + 'px',
              marginRight: values.right + 'px',
              marginBottom: values.bottom + 'px',
              marginLeft: values.left + 'px',
            })}
            isLinked={spacingLinked.margin}
            onLinkToggle={() => setSpacingLinked(prev => ({ ...prev, margin: !prev.margin }))}
          />

          <SpacingInput
            label="Padding"
            values={{
              top: currentStyles.paddingTop?.toString() || '0',
              right: currentStyles.paddingRight?.toString() || '0',
              bottom: currentStyles.paddingBottom?.toString() || '0',
              left: currentStyles.paddingLeft?.toString() || '0',
            }}
            onChange={(values) => updateStyles({
              paddingTop: values.top + 'px',
              paddingRight: values.right + 'px',
              paddingBottom: values.bottom + 'px',
              paddingLeft: values.left + 'px',
            })}
            isLinked={spacingLinked.padding}
            onLinkToggle={() => setSpacingLinked(prev => ({ ...prev, padding: !prev.padding }))}
          />
        </StyleSection>

        {/* Typography Section */}
        <StyleSection
          title="Typography"
          icon={Type}
          isOpen={openSections.typography}
          onToggle={() => toggleSection('typography')}
        >
          <StyleInput
            label="Font Family"
            value={currentStyles.fontFamily || 'inherit'}
            onChange={(value) => updateStyles({ fontFamily: value.toString() })}
            type="select"
            options={['inherit', 'Inter', 'Roboto', 'Poppins', 'Arial', 'Helvetica', 'Times New Roman']}
          />

          <div className="grid grid-cols-2 gap-2">
            <StyleInput
              label="Size"
              value={parseInt(currentStyles.fontSize?.toString() || '16')}
              onChange={(value) => updateStyles({ fontSize: value + 'px' })}
              type="number"
              min={8}
              max={72}
              unit="px"
            />
            <StyleInput
              label="Weight"
              value={currentStyles.fontWeight || 400}
              onChange={(value) => updateStyles({ fontWeight: value })}
              type="select"
              options={['300', '400', '500', '600', '700', '800']}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StyleInput
              label="Line Height"
              value={currentStyles.lineHeight || '1.5'}
              onChange={(value) => updateStyles({ lineHeight: value.toString() })}
              type="number"
              step={0.1}
              min={0.5}
              max={3}
            />
            <StyleInput
              label="Letter Spacing"
              value={parseInt(currentStyles.letterSpacing?.toString() || '0')}
              onChange={(value) => updateStyles({ letterSpacing: value + 'px' })}
              type="number"
              step={0.1}
              unit="px"
            />
          </div>

          <StyleInput
            label="Text Align"
            value={currentStyles.textAlign || 'left'}
            onChange={(value) => updateStyles({ textAlign: value as any })}
            type="select"
            options={['left', 'center', 'right', 'justify']}
          />

          <StyleInput
            label="Color"
            value={currentStyles.color || '#000000'}
            onChange={(value) => updateStyles({ color: value.toString() })}
            type="color"
          />
        </StyleSection>

        {/* Colors & Background Section */}
        <StyleSection
          title="Colors & Background"
          icon={Palette}
          isOpen={openSections.colors}
          onToggle={() => toggleSection('colors')}
        >
          <StyleInput
            label="Background"
            value={currentStyles.backgroundColor || 'transparent'}
            onChange={(value) => updateStyles({ backgroundColor: value.toString() })}
            type="color"
          />

          <StyleInput
            label="Background Image"
            value={currentStyles.backgroundImage || ''}
            onChange={(value) => updateStyles({ backgroundImage: value ? `url(${value})` : '' })}
            placeholder="Image URL"
          />

          {currentStyles.backgroundImage && (
            <>
              <StyleInput
                label="Size"
                value={currentStyles.backgroundSize || 'cover'}
                onChange={(value) => updateStyles({ backgroundSize: value.toString() })}
                type="select"
                options={['cover', 'contain', 'auto']}
              />
              
              <StyleInput
                label="Position"
                value={currentStyles.backgroundPosition || 'center'}
                onChange={(value) => updateStyles({ backgroundPosition: value.toString() })}
                type="select"
                options={['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right']}
              />
            </>
          )}
        </StyleSection>

        {/* Borders Section */}
        <StyleSection
          title="Borders"
          icon={Square}
          isOpen={openSections.borders}
          onToggle={() => toggleSection('borders')}
        >
          <div className="grid grid-cols-3 gap-2">
            <StyleInput
              label="Width"
              value={parseInt(currentStyles.borderWidth?.toString() || '0')}
              onChange={(value) => updateStyles({ borderWidth: value + 'px' })}
              type="number"
              min={0}
              max={20}
              unit="px"
            />
            <StyleInput
              label="Style"
              value={currentStyles.borderStyle || 'solid'}
              onChange={(value) => updateStyles({ borderStyle: value as any })}
              type="select"
              options={['solid', 'dashed', 'dotted', 'none']}
            />
            <StyleInput
              label="Color"
              value={currentStyles.borderColor || '#000000'}
              onChange={(value) => updateStyles({ borderColor: value.toString() })}
              type="color"
            />
          </div>

          <StyleInput
            label="Radius"
            value={parseInt(currentStyles.borderRadius?.toString() || '0')}
            onChange={(value) => updateStyles({ borderRadius: value + 'px' })}
            type="number"
            min={0}
            max={50}
            unit="px"
          />
        </StyleSection>

        {/* Effects Section */}
        <StyleSection
          title="Effects"
          icon={Shadow}
          isOpen={openSections.effects}
          onToggle={() => toggleSection('effects')}
        >
          <StyleInput
            label="Opacity"
            value={currentStyles.opacity || 1}
            onChange={(value) => updateStyles({ opacity: parseFloat(value.toString()) })}
            type="number"
            min={0}
            max={1}
            step={0.1}
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Box Shadow</label>
            <input
              type="text"
              value={currentStyles.boxShadow || ''}
              onChange={(e) => updateStyles({ boxShadow: e.target.value })}
              placeholder="0 4px 6px rgba(0, 0, 0, 0.1)"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <StyleInput
            label="Z-Index"
            value={currentStyles.zIndex || 'auto'}
            onChange={(value) => updateStyles({ zIndex: parseInt(value.toString()) || 0 })}
            type="number"
          />
        </StyleSection>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Element ID: {selectedElement.id}</span>
          <button
            onClick={() => {
              // Reset all styles
              if (selectedElementId) {
                updateElementStyles(selectedElementId, {}, currentBreakpoint);
              }
            }}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylePanel;