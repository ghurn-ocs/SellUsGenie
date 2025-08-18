/**
 * Webflow-Like Page Builder
 * Complete visual web builder with all advanced features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Code, 
  Save, 
  Settings, 
  Undo, 
  Redo, 
  Play, 
  Pause,
  Grid,
  Ruler,
  Layers,
  Database,
  Zap,
  Link2,
  Download,
  Menu,
  X
} from 'lucide-react';

// Import all panels and components
import AdvancedCanvas from './canvas/AdvancedCanvas';
import ElementsPanel from './panels/ElementsPanel';
import StylePanel from './panels/StylePanel';
import InteractionsPanel from './panels/InteractionsPanel';
import ResponsiveControls from './components/ResponsiveControls';
import CMSPanel from './panels/CMSPanel';
import ContentBinding from './components/ContentBinding';
import CodeExportPanel from './panels/CodeExportPanel';
import { useEditorStore } from './store/EditorStore';
import type { Breakpoint } from './types';

interface WebflowLikeBuilderProps {
  className?: string;
}

type PanelType = 'elements' | 'styles' | 'interactions' | 'responsive' | 'cms' | 'binding' | 'export';
type ViewMode = 'design' | 'preview' | 'code';

// Panel configurations
const PANEL_CONFIG = {
  elements: { name: 'Elements', icon: Layers, component: ElementsPanel },
  styles: { name: 'Styles', icon: Settings, component: StylePanel },
  interactions: { name: 'Interactions', icon: Zap, component: InteractionsPanel },
  responsive: { name: 'Responsive', icon: Monitor, component: ResponsiveControls },
  cms: { name: 'CMS', icon: Database, component: CMSPanel },
  binding: { name: 'Binding', icon: Link2, component: ContentBinding },
  export: { name: 'Export', icon: Code, component: CodeExportPanel },
};

// Breakpoint configurations
const BREAKPOINTS = [
  { key: 'sm' as Breakpoint, name: 'Mobile', icon: Smartphone, width: '375px' },
  { key: 'md' as Breakpoint, name: 'Tablet', icon: Tablet, width: '768px' },
  { key: 'lg' as Breakpoint, name: 'Desktop', icon: Monitor, width: '1200px' },
];

const WebflowLikeBuilder: React.FC<WebflowLikeBuilderProps> = ({ className }) => {
  const {
    document,
    currentBreakpoint,
    viewMode,
    panelMode,
    showGrid,
    showRulers,
    isDirty,
    canvasScale,
    setBreakpoint,
    setViewMode,
    setPanelMode,
    toggleGrid,
    toggleRulers,
    saveDocument,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useEditorStore();

  const [leftPanel, setLeftPanel] = useState<PanelType>('elements');
  const [rightPanel, setRightPanel] = useState<PanelType>('styles');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    let autoSaveTimeout: NodeJS.Timeout;
    
    if (isDirty && document) {
      autoSaveTimeout = setTimeout(() => {
        setIsAutoSaving(true);
        saveDocument().finally(() => {
          setIsAutoSaving(false);
        });
      }, 30000); // Auto-save after 30 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [isDirty, document, saveDocument]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'p':
            e.preventDefault();
            handleTogglePreview();
            break;
          case 'g':
            e.preventDefault();
            toggleGrid();
            break;
          case 'r':
            e.preventDefault();
            toggleRulers();
            break;
        }
      }

      // Number keys for breakpoints
      if (e.key >= '1' && e.key <= '3') {
        const breakpointIndex = parseInt(e.key) - 1;
        if (BREAKPOINTS[breakpointIndex]) {
          setBreakpoint(BREAKPOINTS[breakpointIndex].key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, toggleGrid, toggleRulers, setBreakpoint]);

  // Event handlers
  const handleSave = useCallback(async () => {
    if (document) {
      setIsAutoSaving(true);
      try {
        await saveDocument();
      } finally {
        setIsAutoSaving(false);
      }
    }
  }, [document, saveDocument]);

  const handlePublish = useCallback(async () => {
    if (document) {
      setIsAutoSaving(true);
      try {
        await saveDocument(); // Save first
        // In a real app, you'd have a separate publish endpoint
        alert('Page published successfully!');
      } finally {
        setIsAutoSaving(false);
      }
    }
  }, [document, saveDocument]);

  const handleTogglePreview = useCallback(() => {
    setViewMode(viewMode === 'preview' ? 'design' : 'preview');
  }, [viewMode, setViewMode]);

  const handleBreakpointChange = useCallback((breakpoint: Breakpoint) => {
    setBreakpoint(breakpoint);
  }, [setBreakpoint]);

  const renderLeftPanel = () => {
    const PanelComponent = PANEL_CONFIG[leftPanel].component;
    return <PanelComponent className="h-full" />;
  };

  const renderRightPanel = () => {
    const PanelComponent = PANEL_CONFIG[rightPanel].component;
    return <PanelComponent className="h-full" />;
  };

  const renderTopToolbar = () => (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-gray-800">Page Builder</span>
        </div>

        {/* Document name */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {document?.name || 'Untitled Page'}
          </span>
          {isDirty && (
            <span className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />
          )}
          {isAutoSaving && (
            <span className="text-xs text-blue-600">Saving...</span>
          )}
        </div>
      </div>

      {/* Center section - Breakpoint controls */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {BREAKPOINTS.map(({ key, name, icon: Icon, width }) => (
          <button
            key={key}
            onClick={() => handleBreakpointChange(key)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentBreakpoint === key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            title={`${name} (${width})`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{name}</span>
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* View controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleGrid}
            className={`p-2 rounded transition-colors ${
              showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Toggle Grid (Ctrl+G)"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={toggleRulers}
            className={`p-2 rounded transition-colors ${
              showRulers ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Toggle Rulers (Ctrl+R)"
          >
            <Ruler className="w-4 h-4" />
          </button>
        </div>

        {/* Preview toggle */}
        <button
          onClick={handleTogglePreview}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'preview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="Toggle Preview (Ctrl+P)"
        >
          <Eye className="w-4 h-4" />
          <span>{viewMode === 'preview' ? 'Exit Preview' : 'Preview'}</span>
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isDirty || isAutoSaving}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDirty && !isAutoSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={isAutoSaving}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Publish page"
        >
          <Download className="w-4 h-4" />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );

  const renderLeftToolbar = () => (
    <div className="w-12 bg-gray-900 flex flex-col items-center py-4 space-y-2">
      {Object.entries(PANEL_CONFIG).map(([key, config]) => (
        <button
          key={key}
          onClick={() => {
            setLeftPanel(key as PanelType);
            setShowLeftPanel(true);
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            leftPanel === key && showLeftPanel
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title={config.name}
        >
          <config.icon className="w-4 h-4" />
        </button>
      ))}
      
      <div className="w-full h-px bg-gray-700 my-2" />
      
      <button
        onClick={() => setShowLeftPanel(!showLeftPanel)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800"
        title={showLeftPanel ? 'Hide Panel' : 'Show Panel'}
      >
        {showLeftPanel ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </div>
  );

  const renderRightToolbar = () => (
    <div className="w-12 bg-gray-900 flex flex-col items-center py-4 space-y-2">
      {Object.entries(PANEL_CONFIG).map(([key, config]) => (
        <button
          key={key}
          onClick={() => {
            setRightPanel(key as PanelType);
            setShowRightPanel(true);
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            rightPanel === key && showRightPanel
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title={config.name}
        >
          <config.icon className="w-4 h-4" />
        </button>
      ))}
      
      <div className="w-full h-px bg-gray-700 my-2" />
      
      <button
        onClick={() => setShowRightPanel(!showRightPanel)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800"
        title={showRightPanel ? 'Hide Panel' : 'Show Panel'}
      >
        {showRightPanel ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
    </div>
  );

  const renderStatusBar = () => (
    <div className="h-8 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
      <div className="flex items-center space-x-4">
        <span>Zoom: {Math.round(canvasScale * 100)}%</span>
        <span>Breakpoint: {currentBreakpoint.toUpperCase()}</span>
        {document && (
          <span>
            Elements: {document.sections.reduce((acc, section) => 
              acc + section.rows.reduce((rowAcc, row) => rowAcc + row.widgets.length, 0), 0
            )}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <span>Ready</span>
      </div>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
        {/* Top toolbar */}
        {renderTopToolbar()}

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar */}
          {renderLeftToolbar()}
          
          {/* Left panel */}
          {showLeftPanel && (
            <div className="w-80 border-r border-gray-200 bg-white">
              {renderLeftPanel()}
            </div>
          )}

          {/* Canvas area */}
          <div className="flex-1 relative" style={{ zIndex: 5 }}>
            <AdvancedCanvas />
            
            {/* Floating canvas info */}
            {viewMode === 'design' && (
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>
                    {BREAKPOINTS.find(bp => bp.key === currentBreakpoint)?.name} 
                    ({BREAKPOINTS.find(bp => bp.key === currentBreakpoint)?.width})
                  </span>
                  <span>•</span>
                  <span>{Math.round(canvasScale * 100)}% zoom</span>
                </div>
              </div>
            )}

            {/* Preview mode overlay */}
            {viewMode === 'preview' && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-20">
                Preview Mode - Press Ctrl+P to exit
              </div>
            )}
          </div>

          {/* Right panel */}
          {showRightPanel && (
            <div className="w-80 border-l border-gray-200 bg-white">
              {renderRightPanel()}
            </div>
          )}

          {/* Right sidebar */}
          {renderRightToolbar()}
        </div>

        {/* Status bar */}
        {renderStatusBar()}
      </div>
    </DndProvider>
  );
};

export default WebflowLikeBuilder;