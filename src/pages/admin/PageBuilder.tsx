/**
 * Page Builder
 * Main page builder interface for creating and editing pages
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
import type { PageDocument, User, PageRepository, DragItem, DropResult } from '../../pageBuilder/types';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import { Canvas } from '../../pageBuilder/editor/Canvas';
import { WidgetLibrary } from '../../pageBuilder/editor/WidgetLibrary';
import { PropertiesPanel } from '../../pageBuilder/editor/PropertiesPanel';
import { TopBar } from '../../pageBuilder/editor/TopBar';
import { registerAllWidgets, widgetRegistry } from '../../pageBuilder/widgets/registry';
import type { WidgetBase } from '../../pageBuilder/types';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';

// Import widgets to register them
import '../../pageBuilder/widgets/text/index';
import '../../pageBuilder/widgets/button/index';
import '../../pageBuilder/widgets/image/index';
import '../../pageBuilder/widgets/hero/index';
import '../../pageBuilder/widgets/spacer/index';
import '../../pageBuilder/widgets/gallery/index';
import '../../pageBuilder/widgets/form/index';
import '../../pageBuilder/widgets/carousel/index';

// Default empty page template
const createEmptyPage = (name: string = 'New Page'): PageDocument => ({
  id: `page_${Date.now()}`,
  name,
  version: 1,
  sections: [
    {
      id: 'section_1',
      title: 'Hero Section',
      rows: [
        {
          id: 'row_1',
          widgets: []
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
});

interface PageBuilderProps {
  pageId?: string;
  isFullScreen?: boolean;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ 
  pageId, 
  isFullScreen = false 
}) => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  
  // Initialize with empty page - will be replaced when loading real data
  const [document, setDocument] = useState<PageDocument>(createEmptyPage());
  const [repository, setRepository] = useState<SupabasePageRepository | null>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Drag and drop state
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Register all widgets on component mount
  useEffect(() => {
    registerAllWidgets();
  }, []);

  // Initialize repository when user and store are available
  useEffect(() => {
    if (user && currentStore) {
      const pageBuilderUser: User = {
        id: user.id,
        email: user.email || '',
        role: 'owner', // TODO: Implement proper role management
        storeId: currentStore.id,
      };
      setRepository(new SupabasePageRepository(pageBuilderUser, currentStore.id));
    } else {
      setRepository(null);
    }
  }, [user, currentStore]);

  // Load page if pageId is provided
  useEffect(() => {
    if (pageId && repository) {
      loadPage(pageId);
    }
  }, [pageId, repository]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && !autoSaveInterval) {
      const interval = setInterval(() => {
        saveDraft();
      }, 5000); // Auto-save every 5 seconds
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
  }, [isDirty, autoSaveInterval]);

  const loadPage = async (id: string) => {
    if (!repository) return;
    
    try {
      console.log('Loading page:', id, 'for store:', currentStore?.id);
      const page = await repository.getPage(id);
      
      if (page) {
        setDocument(page);
        setIsDirty(false);
        setLastSaved(page.updatedAt);
      } else {
        // Create new page if not found
        const newPage = await repository.createPage(pageId ? `Page ${pageId}` : 'New Page');
        setDocument(newPage);
        setIsDirty(false);
        setLastSaved(newPage.updatedAt);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      // Fallback to empty page on error
      const fallbackPage = createEmptyPage(pageId ? `Page ${pageId}` : 'New Page');
      fallbackPage.id = id;
      setDocument(fallbackPage);
    }
  };

  const saveDraft = async () => {
    if (!repository) return;
    
    try {
      console.log('Saving draft for store:', currentStore?.id, 'document:', document);
      await repository.saveDraft(document);
      setIsDirty(false);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const publishPage = async () => {
    if (!repository) return;
    
    try {
      console.log('Publishing page for store:', currentStore?.id, 'document:', document);
      await repository.publish(document.id);
      setIsDirty(false);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Error publishing page:', error);
    }
  };

  const handleDocumentChange = useCallback((newDocument: PageDocument) => {
    setDocument(newDocument);
    setIsDirty(true);
  }, []);

  const handleWidgetSelect = useCallback((widgetId: string | null) => {
    setSelectedWidgetId(widgetId);
    if (widgetId) {
      setSelectedSectionId(null);
      setSelectedRowId(null);
    }
  }, []);

  const handleSectionSelect = useCallback((sectionId: string | null) => {
    setSelectedSectionId(sectionId);
    if (sectionId) {
      setSelectedWidgetId(null);
      setSelectedRowId(null);
    }
  }, []);

  const handleRowSelect = useCallback((rowId: string | null) => {
    setSelectedRowId(rowId);
    if (rowId) {
      setSelectedWidgetId(null);
      setSelectedSectionId(null);
    }
  }, []);

  const handleSave = async () => {
    await saveDraft();
  };

  const handlePublish = async () => {
    await publishPage();
  };

  const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(mode);
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragItem;
    setActiveDragItem(dragData);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDragItem(null);
      return;
    }

    const dragData = active.data.current as DragItem;
    const overId = over.id as string;

    console.log('Drag end:', { dragData, overId });

    // Handle dropping a new widget
    if (dragData?.type === 'new-widget' && dragData.widgetType) {
      try {
        // Determine drop target
        let sectionId: string | null = null;
        let rowId: string | null = null;

        if (overId.startsWith('section-')) {
          sectionId = overId;
          // Find first row in this section
          const sectionIdOnly = sectionId.replace('section-', '');
          const section = document.sections.find(s => s.id === sectionIdOnly);
          if (section && section.rows.length > 0) {
            rowId = `row-${section.rows[0].id}`;
          }
        } else if (overId.startsWith('row-')) {
          rowId = overId;
          // Find parent section
          const row = document.sections
            .flatMap(s => s.rows.map(r => ({ ...r, sectionId: s.id })))
            .find(r => `row-${r.id}` === rowId);
          if (row) {
            sectionId = `section-${row.sectionId}`;
          }
        }

        console.log('Drop targets:', { sectionId, rowId });

        if (sectionId && rowId) {
          // Check if widget type exists in registry
          if (!widgetRegistry.has(dragData.widgetType)) {
            console.error(`Widget type "${dragData.widgetType}" not found in registry`);
            setActiveDragItem(null);
            return;
          }

          // Create new widget
          const newWidget = widgetRegistry.createWidget(dragData.widgetType, `widget_${Date.now()}`);
          console.log('Created widget:', newWidget);
          
          // Update document
          const newDocument = { ...document };
          const targetSectionId = sectionId.replace('section-', '');
          const targetRowId = rowId.replace('row-', '');
          
          newDocument.sections = newDocument.sections.map(section => {
            if (section.id === targetSectionId) {
              return {
                ...section,
                rows: section.rows.map(row => {
                  if (row.id === targetRowId) {
                    return {
                      ...row,
                      widgets: [...row.widgets, newWidget]
                    };
                  }
                  return row;
                })
              };
            }
            return section;
          });
          
          console.log('Updated document:', newDocument);
          handleDocumentChange(newDocument);
          setSelectedWidgetId(newWidget.id);
        }
      } catch (error) {
        console.error('Error handling drag end:', error);
      }
    }

    setActiveDragItem(null);
  }, [document, handleDocumentChange]);

  // If full screen mode, render the complete page builder interface
  if (isFullScreen) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-screen flex flex-col bg-gray-100">
          {/* Top Bar */}
          <TopBar
            document={document}
            onSave={handleSave}
            onPublish={handlePublish}
            isDirty={isDirty}
            lastSaved={lastSaved}
            previewMode={previewMode}
            onPreviewModeChange={handlePreviewModeChange}
          />

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Widget Library */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <WidgetLibrary />
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
              <Canvas
                document={document}
                onDocumentChange={handleDocumentChange}
                selectedWidgetId={selectedWidgetId}
                onWidgetSelect={handleWidgetSelect}
                selectedSectionId={selectedSectionId}
                onSectionSelect={handleSectionSelect}
                selectedRowId={selectedRowId}
                onRowSelect={handleRowSelect}
                isPreviewMode={false}
                disableDndContext={true}
              />
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
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
            </div>
          </div>
        </div>
      </DndContext>
    );
  }

  // Integrated mode for admin dashboard
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col bg-gray-50">
        {/* Compact Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Page Builder</h2>
              <span className="text-sm text-gray-500">{document.name}</span>
              {isDirty && (
                <span className="text-sm text-orange-600">• Unsaved changes</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  isDirty
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Save
              </button>
              <button
                onClick={handlePublish}
                className="px-3 py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700"
              >
                Publish
              </button>
              <button
                onClick={() => window.open('/admin/page-builder', '_blank')}
                className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700"
              >
                Full Screen
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Widget Library */}
          <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto">
            <WidgetLibrary />
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <Canvas
              document={document}
              onDocumentChange={handleDocumentChange}
              selectedWidgetId={selectedWidgetId}
              onWidgetSelect={handleWidgetSelect}
              selectedSectionId={selectedSectionId}
              onSectionSelect={handleSectionSelect}
              selectedRowId={selectedRowId}
              onRowSelect={handleRowSelect}
              isPreviewMode={false}
              disableDndContext={true}
            />
          </div>

          {/* Properties Panel */}
          <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
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
          </div>
        </div>
      </div>
    </DndContext>
  );
};
