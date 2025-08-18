/**
 * Breakpoint Controls Component
 * Allows switching between different device viewports with responsive design support
 */

import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useCanvasStore } from '../store/CanvasStore';
import { Breakpoint } from '../types/CanvasTypes';

interface BreakpointControlsProps {
  className?: string;
}

interface BreakpointConfig {
  key: Breakpoint;
  name: string;
  icon: React.ComponentType<any>;
  width: string;
  description: string;
}

const breakpointConfigs: BreakpointConfig[] = [
  {
    key: 'mobile',
    name: 'Mobile',
    icon: Smartphone,
    width: '375px',
    description: 'Mobile devices (375px and below)'
  },
  {
    key: 'tablet',
    name: 'Tablet',
    icon: Tablet,
    width: '768px',
    description: 'Tablet devices (768px and below)'
  },
  {
    key: 'desktop',
    name: 'Desktop',
    icon: Monitor,
    width: '1200px+',
    description: 'Desktop devices (1200px and above)'
  }
];

export const BreakpointControls: React.FC<BreakpointControlsProps> = ({
  className = ''
}) => {
  const { activeBreakpoint, setActiveBreakpoint, viewport, updateViewport } = useCanvasStore();

  const handleBreakpointChange = (breakpoint: Breakpoint) => {
    setActiveBreakpoint(breakpoint);
    
    // Update viewport width based on breakpoint
    const newWidth = breakpoint === 'mobile' ? 375 
                   : breakpoint === 'tablet' ? 768 
                   : 1200;
    
    updateViewport({ width: newWidth });
  };

  const handleScaleChange = (scale: number) => {
    updateViewport({ scale: Math.max(0.25, Math.min(2, scale)) });
  };

  return (
    <div className={`bg-white border-b border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Breakpoint selector */}
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-700 mr-3">Device:</span>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {breakpointConfigs.map((config) => {
              const Icon = config.icon;
              const isActive = activeBreakpoint === config.key;
              
              return (
                <button
                  key={config.key}
                  onClick={() => handleBreakpointChange(config.key)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                  title={config.description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.name}</span>
                  <span className="text-xs opacity-75 hidden md:inline">
                    {config.width}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewport controls */}
        <div className="flex items-center space-x-4">
          {/* Scale control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Scale:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleScaleChange(viewport.scale - 0.1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Zoom out"
              >
                <span className="text-sm font-medium">-</span>
              </button>
              
              <div className="w-16 text-center">
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(viewport.scale * 100)}%
                </span>
              </div>
              
              <button
                onClick={() => handleScaleChange(viewport.scale + 0.1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Zoom in"
              >
                <span className="text-sm font-medium">+</span>
              </button>
              
              <button
                onClick={() => handleScaleChange(1)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Reset scale"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Viewport dimensions */}
          <div className="text-sm text-gray-500">
            {viewport.width} × {viewport.height}
          </div>
        </div>
      </div>
      
      {/* Responsive design indicator */}
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            <strong>Current breakpoint:</strong> {activeBreakpoint.charAt(0).toUpperCase() + activeBreakpoint.slice(1)}
          </span>
          <span>
            Style changes will apply to <strong>{activeBreakpoint}</strong> viewport and smaller
          </span>
        </div>
      </div>
    </div>
  );
};