/**
 * Professional Canvas Settings Panel
 * Configuration controls for the page builder canvas layout
 */

import React, { useState } from 'react';
import { Monitor, Ruler, Grid, Eye, Settings, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface CanvasSettingsProps {
  showRulers: boolean;
  showGrid: boolean;
  showPageBoundaries: boolean;
  canvasWidth: number;
  zoomLevel: number;
  onToggleRulers: (show: boolean) => void;
  onToggleGrid: (show: boolean) => void;
  onTogglePageBoundaries: (show: boolean) => void;
  onCanvasWidthChange: (width: number) => void;
  onZoomChange: (zoom: number) => void;
}

const CANVAS_PRESETS = [
  { name: 'Mobile', width: 375, icon: '📱' },
  { name: 'Tablet', width: 768, icon: '📟' },
  { name: 'Desktop', width: 1024, icon: '💻' },
  { name: 'Wide', width: 1440, icon: '🖥️' },
  { name: 'Ultra Wide', width: 1920, icon: '🖥️' },
];

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

export const CanvasSettings: React.FC<CanvasSettingsProps> = ({
  showRulers,
  showGrid,
  showPageBoundaries,
  canvasWidth,
  zoomLevel,
  onToggleRulers,
  onToggleGrid,
  onTogglePageBoundaries,
  onCanvasWidthChange,
  onZoomChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  return (
    <div className="fixed top-16 right-4 z-40">
      {/* Compact Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg">
        {/* Always visible quick controls */}
        <div className="flex items-center space-x-1 p-2">
          {/* Canvas width selector */}
          <div className="flex items-center space-x-1 bg-slate-50 rounded-lg p-1">
            {CANVAS_PRESETS.map((preset) => (
              <button
                key={preset.width}
                onClick={() => onCanvasWidthChange(preset.width)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  canvasWidth === preset.width
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title={`${preset.name} (${preset.width}px)`}
              >
                <span className="text-sm">{preset.icon}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= ZOOM_LEVELS[0]}
              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <div className="bg-slate-50 px-2 py-1 rounded text-xs font-medium text-slate-700 min-w-[3rem] text-center">
              {zoomLevel}%
            </div>
            
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Settings toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded transition-colors ${
              isExpanded
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Canvas settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded settings panel */}
        {isExpanded && (
          <div className="border-t border-slate-200 p-4 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Canvas Settings</h3>
            
            <div className="space-y-4">
              {/* Rulers toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Rulers</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRulers}
                    onChange={(e) => onToggleRulers(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Grid toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Grid Overlay</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => onToggleGrid(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Page boundaries toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Page Boundaries</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPageBoundaries}
                    onChange={(e) => onTogglePageBoundaries(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Custom width input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Canvas Width
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="320"
                    max="2560"
                    step="1"
                    value={canvasWidth}
                    onChange={(e) => onCanvasWidthChange(parseInt(e.target.value) || 1024)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1024"
                  />
                  <div className="absolute right-3 top-2 text-xs text-slate-500">px</div>
                </div>
              </div>

              {/* Zoom slider */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Zoom Level: {zoomLevel}%
                </label>
                <input
                  type="range"
                  min={ZOOM_LEVELS[0]}
                  max={ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                  step="25"
                  value={zoomLevel}
                  onChange={(e) => onZoomChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{ZOOM_LEVELS[0]}%</span>
                  <span>{ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}%</span>
                </div>
              </div>
            </div>

            {/* Reset button */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  onCanvasWidthChange(1024);
                  onZoomChange(100);
                  onToggleRulers(true);
                  onToggleGrid(false);
                  onTogglePageBoundaries(true);
                }}
                className="w-full px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};