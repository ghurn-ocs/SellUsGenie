/**
 * Enhanced Page Builder
 * World-class page builder with advanced features
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  Monitor, Tablet, Smartphone, Eye, EyeOff, Save, Share, 
  Undo, Redo, Settings, Layers, Layout, Code, Zap,
  Clock, Users, Globe, BarChart3, FileText, Download
} from 'lucide-react';
import type { PageDocument, User, PageRepository, Breakpoint, DragItem } from '../types';
import { InMemoryPageRepository } from '../data/PageRepository';
import { Canvas } from './Canvas';
import { WidgetLibrary } from './WidgetLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { ResponsiveEditor } from '../components/ResponsiveEditor';
import { LayersPanel } from '../components/LayersPanel';
import { SEOPanel } from '../components/SEOPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { TemplateMarketplace } from '../templates/TemplateMarketplace';
import type { WidgetBase } from '../types';
import { widgetRegistry } from '../widgets/registry';

// Import all widgets
import '../widgets/text/index';
import '../widgets/button/index';
import '../widgets/image/index';
import '../widgets/hero/index';
import '../widgets/spacer/index';
import '../widgets/gallery/index';
import '../widgets/form/index';
import '../widgets/carousel/index';
import '../widgets/navigation/index';
import '../widgets/cart/index';
import '../widgets/featured-products/index';
import '../widgets/product-listing/index';
import '../widgets/subscribe/index';
// Import new header/footer layout widgets
import '../widgets/header-layout/index';
import '../widgets/footer-layout/index';

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
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  
  // Editor state
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [undoStack, setUndoStack] = useState<PageDocument[]>([]);
  const [redoStack, setRedoStack] = useState<PageDocument[]>([]);
  
  // Auto-save
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Drag and drop state
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for better responsiveness
      },
    })
  );

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

  // Drag and drop handlers
  const handleDragStart = (event: any) => {
    const { active } = event;
    console.log('🚀 DRAG START:', { id: active.id, data: active.data.current });
    setActiveDragItem(active.data.current);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    console.log('👆 DRAG OVER:', { over_id: over?.id, over_data: over?.data?.current });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    console.log('🎯 EnhancedPageBuilder handleDragEnd DETAILED:', { 
      active_id: active?.id, 
      over_id: over?.id,
      active_data: active?.data?.current,
      over_data: over?.data?.current,
      event: event
    });
    
    if (!over) {
      console.log('❌ No drop target found - widget will return to sidebar');
      setActiveDragItem(null);
      return;
    }
    
    if (!document) {
      console.log('❌ No document found');
      setActiveDragItem(null);
      return;
    }

    const dragItem = active.data.current as DragItem;
    const dropTarget = over.data.current;

    console.log('Drag item:', dragItem);
    console.log('Drop target:', dropTarget);

    // Handle dropping a new widget from the widget library
    if (dragItem?.type === 'new-widget' && dragItem.widgetType) {
      console.log('Creating new widget:', dragItem.widgetType);
      
      // Use the widget registry to create a properly configured widget
      const widgetId = `widget_${Date.now()}`;
      
      if (!widgetRegistry.has(dragItem.widgetType)) {
        console.error('❌ Widget type not found in registry:', dragItem.widgetType);
        return;
      }
      
      const newWidget = widgetRegistry.createWidget(dragItem.widgetType, widgetId);

      const newDocument = { ...document };
      
      // Handle different drop scenarios
      if (dropTarget?.type === 'canvas' || over.id === 'canvas-drop-zone') {
        console.log('✅ CANVAS DROP DETECTED - Creating widget on canvas');
        console.log('📊 Current document sections:', newDocument.sections.length);
        
        // If canvas is empty, create first section and row
        if (newDocument.sections.length === 0) {
          const newRow = {
            id: `row_${Date.now()}`,
            widgets: [newWidget]
          };

          const newSection = {
            id: `section_${Date.now()}`,
            title: 'New Section',
            rows: [newRow],
            background: {},
            padding: 'p-4'
          };

          newDocument.sections = [newSection];
        } else {
          // Add to the first row of the first section
          if (newDocument.sections[0].rows.length === 0) {
            newDocument.sections[0].rows.push({
              id: `row_${Date.now()}`,
              widgets: [newWidget]
            });
          } else {
            newDocument.sections[0].rows[0].widgets.push(newWidget);
          }
        }
        
        console.log('🎉 SUCCESS: Added widget to canvas, new sections:', newDocument.sections.length);
        console.log('🎉 New widget created:', newWidget);
        handleDocumentChange(newDocument);
        setSelectedWidgetId(newWidget.id);
        console.log('🎉 Widget drop completed successfully!');
      } else if (dropTarget?.type === 'section') {
        console.log('Dropping on section:', dropTarget.id);
        
        const section = newDocument.sections.find(s => s.id === dropTarget.id);
        if (section) {
          if (section.rows.length === 0) {
            section.rows.push({
              id: `row_${Date.now()}`,
              widgets: [newWidget]
            });
          } else {
            section.rows[0].widgets.push(newWidget);
          }
          
          handleDocumentChange(newDocument);
          setSelectedWidgetId(newWidget.id);
        }
      } else if (dropTarget?.type === 'row') {
        console.log('Dropping on row:', dropTarget.id);
        
        newDocument.sections = newDocument.sections.map(section => ({
          ...section,
          rows: section.rows.map(row => 
            row.id === dropTarget.id 
              ? { ...row, widgets: [...row.widgets, newWidget] }
              : row
          )
        }));
        
        handleDocumentChange(newDocument);
        setSelectedWidgetId(newWidget.id);
      } else {
        console.log('Unknown drop target, creating new section');
        
        // Create new section and row for unknown drop targets
        const newRow = {
          id: `row_${Date.now()}`,
          widgets: [newWidget]
        };

        const newSection = {
          id: `section_${Date.now()}`,
          title: '',
          rows: [newRow]
        };

        const newDocument = {
          ...document,
          sections: [...document.sections, newSection]
        };

        handleDocumentChange(newDocument);
        setSelectedWidgetId(newWidget.id);
      }
    }

    setActiveDragItem(null);
    
    // Force widget library to refresh after successful drop
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('widget-dropped'));
    }, 100);
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
          {/* Sidebar toggle */}
          <button
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            title={isLeftPanelCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            <Layout className="w-4 h-4" />
          </button>
          
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
    <div className="w-72 lg:w-80 xl:w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 max-w-[300px] min-w-[280px]">
      {/* Panel tabs */}
      <div className="border-b border-gray-200 p-3">
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
      <div className={`flex-1 ${activeDragItem ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {leftPanelMode === 'widgets' && <WidgetLibrary />}
        {leftPanelMode === 'properties' && (
          <PropertiesPanel
            document={document || { 
              id: pageId, 
              title: 'New Page', 
              slug: '/', 
              sections: [],
              settings: { seoTitle: '', seoDescription: '', customCSS: '' },
              version: 1,
              status: 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            selectedWidgetId={selectedWidgetId}
            selectedSectionId={selectedSectionId}
            selectedRowId={selectedRowId}
            onDocumentChange={handleDocumentChange}
            onWidgetUpdate={(widgetId: string, updates: Partial<WidgetBase>) => {
              const newDocument = { ...document };
              if (document) {
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
              }
            }}
          />
        )}
        {leftPanelMode === 'responsive' && (
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Responsive</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-500">
                    Current: {currentBreakpoint.toUpperCase()}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Design for different screen sizes
              </p>
            </div>

            {/* Breakpoint Selector */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Breakpoints</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'sm', label: 'Mobile', icon: '📱', size: '< 640px' },
                  { key: 'md', label: 'Tablet', icon: '📟', size: '640px+' },
                  { key: 'lg', label: 'Desktop', icon: '💻', size: '1024px+' },
                  { key: 'xl', label: 'Large', icon: '🖥️', size: '1280px+' }
                ].map(({ key, label, icon, size }) => (
                  <button
                    key={key}
                    onClick={() => handleBreakpointChange(key as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentBreakpoint === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">{icon}</div>
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-xs text-gray-500">{size}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content based on selection */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedWidgetId && document ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Widget Responsive Settings</h3>
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
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Responsive Design</h3>
                    <p className="text-xs text-gray-500 mb-4">Select an element to customize responsive behavior</p>
                    
                    {/* Quick responsive tips */}
                    <div className="text-left space-y-3 max-w-sm mx-auto">
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="text-blue-500">📱</span>
                        <div>
                          <div className="font-medium text-gray-700">Mobile First</div>
                          <div className="text-gray-500">Design starts with mobile layout</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="text-green-500">📏</span>
                        <div>
                          <div className="font-medium text-gray-700">Breakpoints</div>
                          <div className="text-gray-500">Switch between screen sizes above</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="text-purple-500">🎯</span>
                        <div>
                          <div className="font-medium text-gray-700">Element-Specific</div>
                          <div className="text-gray-500">Select widgets to customize per breakpoint</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page-level responsive settings */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Page Layout</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Container Width
                        </label>
                        <select className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          <option value="full">Full Width</option>
                          <option value="container">Container (1200px)</option>
                          <option value="narrow">Narrow (800px)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Sidebar Behavior
                        </label>
                        <select className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          <option value="stack">Stack on Mobile</option>
                          <option value="hide">Hide on Mobile</option>
                          <option value="collapse">Collapsible</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {leftPanelMode === 'layers' && (
          <LayersPanel
            document={document || { 
              id: pageId, 
              title: 'New Page', 
              slug: '/', 
              sections: [],
              settings: { seoTitle: '', seoDescription: '', customCSS: '' },
              version: 1
            }}
            selectedWidgetId={selectedWidgetId}
            selectedSectionId={selectedSectionId}
            selectedRowId={selectedRowId}
            onWidgetSelect={setSelectedWidgetId}
            onSectionSelect={setSelectedSectionId}
            onRowSelect={setSelectedRowId}
            onDocumentChange={handleDocumentChange}
          />
        )}
        {leftPanelMode === 'seo' && (
          <SEOPanel
            document={document || { 
              id: pageId, 
              title: 'New Page', 
              slug: '/', 
              sections: [],
              settings: { seoTitle: '', seoDescription: '', customCSS: '' },
              version: 1
            }}
            onDocumentChange={handleDocumentChange}
          />
        )}
        {leftPanelMode === 'settings' && (
          <SettingsPanel
            document={document || { 
              id: pageId, 
              title: 'New Page', 
              slug: '/', 
              sections: [],
              settings: { seoTitle: '', seoDescription: '', customCSS: '' },
              version: 1
            }}
            onDocumentChange={handleDocumentChange}
          />
        )}
      </div>
    </div>
  );

  const renderMainContent = () => {
    const defaultDocument = {
      id: pageId,
      title: 'New Page',
      slug: '/',
      sections: [],
      settings: { seoTitle: '', seoDescription: '', customCSS: '' },
      version: 1,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return (
      <div className="flex-1 relative overflow-auto bg-gray-100">
        {viewMode === 'preview' && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
              Preview Mode - Press Ctrl+P to exit
            </div>
          </div>
        )}
        
        <Canvas
          document={document || defaultDocument}
          onDocumentChange={handleDocumentChange}
          selectedWidgetId={selectedWidgetId}
          onWidgetSelect={setSelectedWidgetId}
          selectedSectionId={selectedSectionId}
          onSectionSelect={setSelectedSectionId}
          selectedRowId={selectedRowId}
          onRowSelect={setSelectedRowId}
          isPreviewMode={viewMode === 'preview'}
          disableDndContext={true}
        />
      </div>
    );
  };

  const renderFloatingActions = () => (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg border border-gray-200 p-2">
        {/* Sidebar toggle when collapsed */}
        {isLeftPanelCollapsed && viewMode !== 'preview' && (
          <>
            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
              title="Show Sidebar"
            >
              <Layers className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
          </>
        )}
        
        <button
          onClick={() => setShowTemplateMarketplace(true)}
          className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title="Browse Templates"
        >
          <Layout className="w-5 h-5" />
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {renderTopBar()}
        
        <div className="flex-1 flex overflow-hidden">
          {viewMode !== 'preview' && !isLeftPanelCollapsed && renderLeftPanel()}
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
      
      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeDragItem ? (
          <div className="opacity-75 transform rotate-2 shadow-2xl">
            {activeDragItem.type === 'new-widget' ? (
              <div className="bg-white border-2 border-dashed border-primary-500 rounded-lg p-4 shadow-lg">
                <div className="text-primary-600 font-medium">
                  Adding {activeDragItem.widgetType} Widget
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};