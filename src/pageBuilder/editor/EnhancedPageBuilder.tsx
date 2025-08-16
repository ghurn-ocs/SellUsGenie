/**
 * Enhanced Page Builder
 * World-class page builder with advanced features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, Tablet, Smartphone, Eye, EyeOff, Save, Share, 
  Undo, Redo, Settings, Layers, Template, Code, Zap,
  Clock, Users, Globe, BarChart3, FileText, Download
} from 'lucide-react';
import type { PageDocument, User, PageRepository, Breakpoint } from '../types';
import { InMemoryPageRepository } from '../data/PageRepository';
import { Canvas } from './Canvas';
import { WidgetLibrary } from './WidgetLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { ResponsiveEditor } from '../components/ResponsiveEditor';
import { TemplateMarketplace } from '../templates/TemplateMarketplace';
import type { WidgetBase } from '../types';

// Import all widgets
import '../widgets/text/index';
import '../widgets/button/index';
import '../widgets/image/index';
import '../widgets/hero/index';
import '../widgets/spacer/index';
import '../widgets/gallery/index';
import '../widgets/form/index';
import '../widgets/carousel/index';

interface EnhancedPageBuilderProps {
  pageId?: string;
  user: User;
  repository: PageRepository;
  onSave?: (doc: PageDocument) => void;
  onPublish?: (doc: PageDocument) => void;
  onError?: (error: Error) => void;
}

type ViewMode = 'edit' | 'preview' | 'code';
type PanelMode = 'widgets' | 'properties' | 'layers' | 'responsive' | 'seo' | 'settings';

export const EnhancedPageBuilder: React.FC<EnhancedPageBuilderProps> = ({
  pageId,
  user,
  repository,
  onSave,
  onPublish,
  onError,
}) => {
  // Core state
  const [document, setDocument] = useState<PageDocument | null>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');
  const [leftPanelMode, setLeftPanelMode] = useState<PanelMode>('widgets');
  const [rightPanelMode, setRightPanelMode] = useState<PanelMode>('properties');
  const [showTemplateMarketplace, setShowTemplateMarketplace] = useState(false);
  
  // Editor state
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [undoStack, setUndoStack] = useState<PageDocument[]>([]);
  const [redoStack, setRedoStack] = useState<PageDocument[]>([]);
  
  // Auto-save
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Load page on mount
  useEffect(() => {
    if (pageId) {
      loadPage(pageId);
    } else {
      // Create new page
      setDocument({
        id: `page_${Date.now()}`,
        name: 'Untitled Page',
        version: 1,
        sections: [{
          id: `section_${Date.now()}`,
          title: 'Main Section',
          rows: [{
            id: `row_${Date.now()}`,
            widgets: []
          }]
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        seo: {
          metaTitle: 'Untitled Page',
          metaDescription: '',
        },
        analytics: {
          trackingId: '',
          events: [],
          heatmap: false,
          scrollTracking: true,
        },
        performance: {
          lazyLoading: true,
          imageOptimization: true,
          minifyCSS: true,
          minifyJS: true,
        },
        accessibility: {
          altTextRequired: true,
          contrastChecking: true,
          keyboardNavigation: true,
          screenReaderSupport: true,
        },
      });
      setIsLoading(false);
    }
  }, [pageId]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && document && !autoSaveInterval) {
      const interval = setInterval(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds
      setAutoSaveInterval(interval);
    } else if (!isDirty && autoSaveInterval) {
      clearInterval(autoSaveInterval);
      setAutoSaveInterval(null);
    }

    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [isDirty, document, autoSaveInterval]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveDraft();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              handleRedo();
            } else {
              e.preventDefault();
              handleUndo();
            }
            break;
          case 'p':
            e.preventDefault();
            togglePreview();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedWidgetId(null);
        setSelectedSectionId(null);
        setSelectedRowId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPage = async (id: string) => {
    try {
      setIsLoading(true);
      const page = await repository.getPage(id);
      if (page) {
        setDocument(page);
        setIsDirty(false);
        setLastSaved(page.updatedAt);
        setUndoStack([]);
        setRedoStack([]);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!document) return;
    
    try {
      const updatedDoc = {
        ...document,
        updatedAt: new Date().toISOString(),
      };
      
      await repository.saveDraft(updatedDoc);
      setDocument(updatedDoc);
      setIsDirty(false);
      setLastSaved(updatedDoc.updatedAt);
      onSave?.(updatedDoc);
    } catch (error) {
      console.error('Error saving draft:', error);
      onError?.(error as Error);
    }
  };

  const publishPage = async () => {
    if (!document) return;
    
    try {
      await repository.publish(document.id);
      const publishedDoc = {
        ...document,
        status: 'published' as const,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setDocument(publishedDoc);
      setIsDirty(false);
      onPublish?.(publishedDoc);
    } catch (error) {
      console.error('Error publishing page:', error);
      onError?.(error as Error);
    }
  };

  const handleDocumentChange = useCallback((newDocument: PageDocument) => {
    if (!document) return;
    
    // Add current state to undo stack
    setUndoStack(prev => [...prev, document].slice(-50)); // Keep last 50 states
    setRedoStack([]); // Clear redo stack
    
    setDocument(newDocument);
    setIsDirty(true);
  }, [document]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !document) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    setRedoStack(prev => [document, ...prev].slice(0, 50));
    setUndoStack(newUndoStack);
    setDocument(previousState);
    setIsDirty(true);
  }, [undoStack, document]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !document) return;
    
    const nextState = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    
    setUndoStack(prev => [...prev, document].slice(-50));
    setRedoStack(newRedoStack);
    setDocument(nextState);
    setIsDirty(true);
  }, [redoStack, document]);

  const togglePreview = () => {
    setViewMode(prev => prev === 'preview' ? 'edit' : 'preview');
  };

  const handleBreakpointChange = (breakpoint: Breakpoint) => {
    setCurrentBreakpoint(breakpoint);
  };

  const handleTemplateSelect = (template: any) => {
    const newDocument: PageDocument = {
      ...template.document,
      id: document?.id || `page_${Date.now()}`,
      createdAt: document?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    
    handleDocumentChange(newDocument);
    setShowTemplateMarketplace(false);
  };

  const getBreakpointIcon = () => {
    switch (currentBreakpoint) {
      case 'sm': return Smartphone;
      case 'md': return Tablet;
      case 'lg': return Monitor;
      default: return Monitor;
    }
  };

  const renderTopBar = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {document?.name || 'Untitled Page'}
          </h1>
          
          {isDirty && (
            <span className="text-sm text-orange-600 flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Unsaved changes</span>
            </span>
          )}
          
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Breakpoint selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { bp: 'sm' as const, icon: Smartphone, label: 'Mobile' },
              { bp: 'md' as const, icon: Tablet, label: 'Tablet' },
              { bp: 'lg' as const, icon: Monitor, label: 'Desktop' },
            ].map(({ bp, icon: Icon, label }) => (
              <button
                key={bp}
                onClick={() => handleBreakpointChange(bp)}
                className={`p-2 rounded transition-colors ${
                  currentBreakpoint === bp
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <button
            onClick={togglePreview}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'preview'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Toggle Preview (Ctrl+P)"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              {viewMode === 'preview' ? 'Exit Preview' : 'Preview'}
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={saveDraft}
              disabled={!isDirty}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDirty
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Save Draft (Ctrl+S)"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            
            <button
              onClick={publishPage}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              title="Publish Page"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeftPanel = () => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Panel tabs */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'widgets', label: 'Widgets', icon: Zap },
            { id: 'properties', label: 'Properties', icon: Settings },
            { id: 'layers', label: 'Layers', icon: Layers },
            { id: 'responsive', label: 'Responsive', icon: Monitor },
            { id: 'seo', label: 'SEO', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setLeftPanelMode(id as PanelMode)}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                leftPanelMode === id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {leftPanelMode === 'widgets' && <WidgetLibrary />}
        {leftPanelMode === 'properties' && document && (
          <PropertiesPanel
            document={document}
            selectedWidgetId={selectedWidgetId}
            selectedSectionId={selectedSectionId}
            selectedRowId={selectedRowId}
            onDocumentChange={handleDocumentChange}
            onWidgetUpdate={(widgetId: string, updates: Partial<WidgetBase>) => {
              const newDocument = { ...document };
              newDocument.sections = newDocument.sections.map(section => ({
                ...section,
                rows: section.rows.map(row => ({
                  ...row,
                  widgets: row.widgets.map(widget => 
                    widget.id === widgetId ? { ...widget, ...updates } : widget
                  )
                }))
              }));
              handleDocumentChange(newDocument);
            }}
          />
        )}
        {leftPanelMode === 'responsive' && document && selectedWidgetId && (
          <div className="p-4">
            <ResponsiveEditor
              styles={document.sections.flatMap(s => s.rows.flatMap(r => r.widgets)).find(w => w.id === selectedWidgetId)?.styles || {}}
              onStylesChange={(styles) => {
                const widget = document.sections.flatMap(s => s.rows.flatMap(r => r.widgets)).find(w => w.id === selectedWidgetId);
                if (widget) {
                  const newDocument = { ...document };
                  newDocument.sections = newDocument.sections.map(section => ({
                    ...section,
                    rows: section.rows.map(row => ({
                      ...row,
                      widgets: row.widgets.map(w => 
                        w.id === selectedWidgetId ? { ...w, styles } : w
                      )
                    }))
                  }));
                  handleDocumentChange(newDocument);
                }
              }}
              currentBreakpoint={currentBreakpoint}
              onBreakpointChange={handleBreakpointChange}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (!document) return null;

    return (
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'preview' && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
              Preview Mode - Press Ctrl+P to exit
            </div>
          </div>
        )}
        
        <Canvas
          document={document}
          onDocumentChange={handleDocumentChange}
          selectedWidgetId={selectedWidgetId}
          onWidgetSelect={setSelectedWidgetId}
          selectedSectionId={selectedSectionId}
          onSectionSelect={setSelectedSectionId}
          selectedRowId={selectedRowId}
          onRowSelect={setSelectedRowId}
          isPreviewMode={viewMode === 'preview'}
        />
      </div>
    );
  };

  const renderFloatingActions = () => (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg border border-gray-200 p-2">
        <button
          onClick={() => setShowTemplateMarketplace(true)}
          className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title="Browse Templates"
        >
          <Template className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-gray-300" />
        
        <button
          onClick={() => setViewMode('code')}
          className={`p-3 rounded-full transition-colors ${
            viewMode === 'code'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
          }`}
          title="View Code"
        >
          <Code className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => {/* Export functionality */}}
          className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title="Export Page"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {renderTopBar()}
      
      <div className="flex-1 flex overflow-hidden">
        {viewMode !== 'preview' && renderLeftPanel()}
        {renderMainContent()}
      </div>

      {renderFloatingActions()}

      {/* Template Marketplace */}
      {showTemplateMarketplace && (
        <TemplateMarketplace
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateMarketplace(false)}
        />
      )}
    </div>
  );
};