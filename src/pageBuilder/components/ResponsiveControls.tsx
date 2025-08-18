/**
 * Responsive Controls Component
 * Advanced responsive design controls with breakpoint management and device preview
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Maximize, 
  Minimize,
  Settings,
  Ruler,
  Grid,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useEditorStore, type CSSProperties } from '../store/EditorStore';
import type { Breakpoint } from '../types';

interface ResponsiveControlsProps {
  className?: string;
}

interface BreakpointConfig {
  key: Breakpoint;
  name: string;
  icon: React.ComponentType<any>;
  width: number;
  height: number;
  description: string;
}

interface ResponsiveSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Breakpoint configurations
const BREAKPOINTS: BreakpointConfig[] = [
  {
    key: 'sm',
    name: 'Mobile',
    icon: Smartphone,
    width: 375,
    height: 667,
    description: 'Mobile phones (375px and up)'
  },
  {
    key: 'md',
    name: 'Tablet',
    icon: Tablet,
    width: 768,
    height: 1024,
    description: 'Tablets (768px and up)'
  },
  {
    key: 'lg',
    name: 'Desktop',
    icon: Monitor,
    width: 1200,
    height: 800,
    description: 'Desktop computers (1200px and up)'
  }
];

// Common device presets
const DEVICE_PRESETS = [
  { name: 'iPhone 12 Pro', width: 390, height: 844, category: 'mobile' },
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile' },
  { name: 'Samsung Galaxy S21', width: 384, height: 854, category: 'mobile' },
  { name: 'iPad Air', width: 820, height: 1180, category: 'tablet' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet' },
  { name: 'MacBook Air', width: 1440, height: 900, category: 'desktop' },
  { name: 'Desktop 1920', width: 1920, height: 1080, category: 'desktop' },
];

// Responsive utility functions
const getBreakpointStyles = (element: any, breakpoint: Breakpoint) => {
  return element?.styles?.responsive?.[breakpoint] || {};
};

const hasBreakpointStyles = (element: any, breakpoint: Breakpoint) => {
  const styles = getBreakpointStyles(element, breakpoint);
  return Object.keys(styles).length > 0;
};

// Responsive Section Component
const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
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

// Breakpoint Status Indicator
interface BreakpointStatusProps {
  breakpoint: BreakpointConfig;
  isActive: boolean;
  hasCustomStyles: boolean;
  onClick: () => void;
}

const BreakpointStatus: React.FC<BreakpointStatusProps> = ({ 
  breakpoint, 
  isActive, 
  hasCustomStyles, 
  onClick 
}) => {
  const Icon = breakpoint.icon;
  
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-lg border-2 transition-all ${
        isActive 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col items-center space-y-2">
        <Icon className="w-6 h-6" />
        <div className="text-xs font-medium">{breakpoint.name}</div>
        <div className="text-xs text-gray-500">{breakpoint.width}px</div>
        
        {hasCustomStyles && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
    </button>
  );
};

// Canvas Size Controls
interface CanvasSizeControlsProps {
  width: number;
  height: number;
  onSizeChange: (width: number, height: number) => void;
  onPresetSelect: (preset: typeof DEVICE_PRESETS[0]) => void;
}

const CanvasSizeControls: React.FC<CanvasSizeControlsProps> = ({
  width,
  height,
  onSizeChange,
  onPresetSelect
}) => {
  const [customWidth, setCustomWidth] = useState(width.toString());
  const [customHeight, setCustomHeight] = useState(height.toString());
  const [showPresets, setShowPresets] = useState(false);

  const handleApplyCustomSize = () => {
    const w = parseInt(customWidth) || width;
    const h = parseInt(customHeight) || height;
    onSizeChange(w, h);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Canvas Size</span>
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          {showPresets ? 'Hide' : 'Show'} Presets
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Width</label>
          <input
            type="number"
            value={customWidth}
            onChange={(e) => setCustomWidth(e.target.value)}
            onBlur={handleApplyCustomSize}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Height</label>
          <input
            type="number"
            value={customHeight}
            onChange={(e) => setCustomHeight(e.target.value)}
            onBlur={handleApplyCustomSize}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {showPresets && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">Device Presets</div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {DEVICE_PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => onPresetSelect(preset)}
                className="w-full text-left p-2 text-xs hover:bg-gray-50 rounded border border-gray-100"
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-gray-500">{preset.width} × {preset.height}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Style Inheritance Display
interface StyleInheritanceProps {
  element: any;
  currentBreakpoint: Breakpoint;
}

const StyleInheritance: React.FC<StyleInheritanceProps> = ({ element, currentBreakpoint }) => {
  const baseStyles = element?.styles?.base || {};
  const responsiveStyles = element?.styles?.responsive || {};
  
  const getInheritedStyles = () => {
    const inherited: { [key: string]: any } = { ...baseStyles };
    
    // Apply smaller breakpoint styles in order
    if (currentBreakpoint === 'md' || currentBreakpoint === 'lg') {
      Object.assign(inherited, responsiveStyles.sm || {});
    }
    if (currentBreakpoint === 'lg') {
      Object.assign(inherited, responsiveStyles.md || {});
    }
    
    return inherited;
  };

  const currentStyles = responsiveStyles[currentBreakpoint] || {};
  const inheritedStyles = getInheritedStyles();
  const overriddenProperties = Object.keys(currentStyles);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-600">Style Inheritance</div>
      
      <div className="text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span>Base styles:</span>
          <span className="text-gray-500">{Object.keys(baseStyles).length} properties</span>
        </div>
        
        {BREAKPOINTS.filter(bp => bp.key !== 'lg').map(bp => {
          const bpStyles = responsiveStyles[bp.key] || {};
          const isActive = bp.key === currentBreakpoint;
          const isInherited = ['md', 'lg'].includes(currentBreakpoint) && bp.key === 'sm' ||
                            currentBreakpoint === 'lg' && bp.key === 'md';
          
          return (
            <div key={bp.key} className={`flex items-center justify-between ${
              isActive ? 'text-blue-600 font-medium' : 
              isInherited ? 'text-green-600' : 
              'text-gray-400'
            }`}>
              <span>{bp.name} ({bp.key}):</span>
              <span>{Object.keys(bpStyles).length} properties</span>
              {isInherited && <span className="text-xs">(inherited)</span>}
            </div>
          );
        })}
        
        {overriddenProperties.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-blue-600 font-medium mb-1">
              Overridden in {currentBreakpoint}:
            </div>
            <div className="text-xs text-gray-600">
              {overriddenProperties.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Responsive Controls Component
const ResponsiveControls: React.FC<ResponsiveControlsProps> = ({ className }) => {
  const {
    selectedElementId,
    document,
    currentBreakpoint,
    setBreakpoint,
    canvasScale,
    setCanvasScale,
    showGrid,
    toggleGrid,
    showRulers,
    toggleRulers,
  } = useEditorStore();

  const [openSections, setOpenSections] = useState({
    breakpoints: true,
    canvas: false,
    inheritance: false,
    tools: false,
  });

  // Get selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId || !document) return null;
    
    for (const section of document.sections) {
      for (const row of section.rows) {
        const widget = row.widgets.find(w => w.id === selectedElementId);
        if (widget) return widget;
      }
    }
    return null;
  }, [selectedElementId, document]);

  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle breakpoint change
  const handleBreakpointChange = useCallback((breakpoint: Breakpoint) => {
    setBreakpoint(breakpoint);
  }, [setBreakpoint]);

  // Handle canvas size change
  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    // This would update canvas dimensions
    console.log('Canvas size change:', width, height);
  }, []);

  // Handle device preset selection
  const handleDevicePresetSelect = useCallback((preset: typeof DEVICE_PRESETS[0]) => {
    handleCanvasSizeChange(preset.width, preset.height);
    
    // Auto-select appropriate breakpoint
    if (preset.width < 768) {
      setBreakpoint('sm');
    } else if (preset.width < 1200) {
      setBreakpoint('md');
    } else {
      setBreakpoint('lg');
    }
  }, [handleCanvasSizeChange, setBreakpoint]);

  // Get current canvas dimensions based on breakpoint
  const currentCanvasDimensions = useMemo(() => {
    const bp = BREAKPOINTS.find(b => b.key === currentBreakpoint);
    return bp ? { width: bp.width, height: bp.height } : { width: 1200, height: 800 };
  }, [currentBreakpoint]);

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Responsive</h2>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentBreakpoint.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          Design for all screen sizes and devices
        </div>
      </div>

      {/* Controls Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Breakpoints Section */}
        <ResponsiveSection
          title="Breakpoints"
          icon={Monitor}
          isOpen={openSections.breakpoints}
          onToggle={() => toggleSection('breakpoints')}
        >
          <div className="grid grid-cols-3 gap-2">
            {BREAKPOINTS.map((breakpoint) => (
              <BreakpointStatus
                key={breakpoint.key}
                breakpoint={breakpoint}
                isActive={currentBreakpoint === breakpoint.key}
                hasCustomStyles={selectedElement ? hasBreakpointStyles(selectedElement, breakpoint.key) : false}
                onClick={() => handleBreakpointChange(breakpoint.key)}
              />
            ))}
          </div>
          
          <div className="text-xs text-gray-600 mt-3">
            <div className="font-medium mb-1">Current: {
              BREAKPOINTS.find(bp => bp.key === currentBreakpoint)?.description
            }</div>
            <div>Click breakpoints to switch between screen sizes</div>
          </div>
        </ResponsiveSection>

        {/* Canvas Controls */}
        <ResponsiveSection
          title="Canvas Controls"
          icon={Maximize}
          isOpen={openSections.canvas}
          onToggle={() => toggleSection('canvas')}
        >
          <CanvasSizeControls
            width={currentCanvasDimensions.width}
            height={currentCanvasDimensions.height}
            onSizeChange={handleCanvasSizeChange}
            onPresetSelect={handleDevicePresetSelect}
          />
          
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Zoom</span>
              <span className="text-xs text-gray-500">{Math.round(canvasScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={canvasScale}
              onChange={(e) => setCanvasScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </ResponsiveSection>

        {/* Style Inheritance */}
        {selectedElement && (
          <ResponsiveSection
            title="Style Inheritance"
            icon={Layers}
            isOpen={openSections.inheritance}
            onToggle={() => toggleSection('inheritance')}
          >
            <StyleInheritance
              element={selectedElement}
              currentBreakpoint={currentBreakpoint}
            />
          </ResponsiveSection>
        )}

        {/* Design Tools */}
        <ResponsiveSection
          title="Design Tools"
          icon={Settings}
          isOpen={openSections.tools}
          onToggle={() => toggleSection('tools')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Grid className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Grid Overlay</span>
              </div>
              <button
                onClick={toggleGrid}
                className={`w-10 h-6 rounded-full transition-colors ${
                  showGrid ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  showGrid ? 'translate-x-5' : 'translate-x-1'
                } mt-1`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Rulers</span>
              </div>
              <button
                onClick={toggleRulers}
                className={`w-10 h-6 rounded-full transition-colors ${
                  showRulers ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  showRulers ? 'translate-x-5' : 'translate-x-1'
                } mt-1`} />
              </button>
            </div>
          </div>
        </ResponsiveSection>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Responsive Design Tips:</p>
          <ul className="space-y-1">
            <li>• Start with mobile-first design</li>
            <li>• Use relative units (%, em, rem)</li>
            <li>• Test on multiple devices</li>
            <li>• Green dots show custom styles</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveControls;