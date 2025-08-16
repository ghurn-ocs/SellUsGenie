/**
 * Page Builder Canvas
 * Main drag-and-drop canvas for the page builder
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageDocument, Section, Row, WidgetBase, DragItem, DropResult } from '../types';
import { widgetRegistry } from '../widgets/registry';
import { CanvasSection } from './CanvasSection';
import { CanvasRow } from './CanvasRow';
import { CanvasWidget } from './CanvasWidget';
import { GridGuides } from './GridGuides';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

interface CanvasProps {
  document: PageDocument;
  onDocumentChange: (doc: PageDocument) => void;
  selectedWidgetId: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string | null) => void;
  selectedRowId: string | null;
  onRowSelect: (rowId: string | null) => void;
  isPreviewMode?: boolean;
  disableDndContext?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({
  document,
  onDocumentChange,
  selectedWidgetId,
  onWidgetSelect,
  selectedSectionId,
  onSectionSelect,
  selectedRowId,
  onRowSelect,
  isPreviewMode = false,
  disableDndContext = false,
}) => {
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverRow, setDragOverRow] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current as DragItem;
    setActiveDragItem(dragData);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const overId = over.id as string;
    
    // Determine if we're over a section or row
    if (overId.startsWith('section-')) {
      setDragOverSection(overId);
      setDragOverRow(null);
    } else if (overId.startsWith('row-')) {
      setDragOverRow(overId);
      setDragOverSection(null);
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDragItem(null);
      setDragOverSection(null);
      setDragOverRow(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const dragData = active.data.current as DragItem;

    console.log('Drag end:', { activeId, overId, dragData });

    // Handle widget reordering within the same row
    if (activeId.startsWith('widget-') && overId.startsWith('widget-')) {
      const activeWidgetId = activeId.replace('widget-', '');
      const overWidgetId = overId.replace('widget-', '');
      
      const newDocument = { ...document };
      let widgetMoved = false;

      // Find and reorder widgets
      newDocument.sections = newDocument.sections.map(section => ({
        ...section,
        rows: section.rows.map(row => {
          const widgetIndex = row.widgets.findIndex(w => w.id === activeWidgetId);
          const overIndex = row.widgets.findIndex(w => w.id === overWidgetId);
          
          if (widgetIndex !== -1 && overIndex !== -1 && widgetIndex !== overIndex) {
            const newWidgets = arrayMove(row.widgets, widgetIndex, overIndex);
            widgetMoved = true;
            return { ...row, widgets: newWidgets };
          }
          return row;
        })
      }));

      if (widgetMoved) {
        onDocumentChange(newDocument);
      }
    }

    // Handle dropping a new widget from the library
    if (dragData?.type === 'new-widget' && dragData.widgetType) {
      let targetSectionId: string | null = null;
      let targetRowId: string | null = null;

      // Determine drop target
      if (overId.startsWith('section-')) {
        targetSectionId = overId.replace('section-', '');
        // Find first row in this section
        const section = document.sections.find(s => s.id === targetSectionId);
        if (section && section.rows.length > 0) {
          targetRowId = section.rows[0].id;
        }
      } else if (overId.startsWith('row-')) {
        targetRowId = overId.replace('row-', '');
        // Find parent section
        for (const section of document.sections) {
          const row = section.rows.find(r => r.id === targetRowId);
          if (row) {
            targetSectionId = section.id;
            break;
          }
        }
      }

      if (targetSectionId && targetRowId) {
        // Create new widget
        const newWidget = widgetRegistry.createWidget(dragData.widgetType, `widget_${Date.now()}`);
        console.log('Created new widget:', newWidget);
        
        // Add widget to the target row
        const newDocument = { ...document };
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
        
        onDocumentChange(newDocument);
        onWidgetSelect(newWidget.id);
      }
    }

    // Handle moving existing widgets between rows
    if (dragData?.type === 'widget' && dragData.widget && (overId.startsWith('section-') || overId.startsWith('row-'))) {
      const widget = dragData.widget;
      let targetSectionId: string | null = null;
      let targetRowId: string | null = null;

      // Determine drop target
      if (overId.startsWith('section-')) {
        targetSectionId = overId.replace('section-', '');
        const section = document.sections.find(s => s.id === targetSectionId);
        if (section && section.rows.length > 0) {
          targetRowId = section.rows[0].id;
        }
      } else if (overId.startsWith('row-')) {
        targetRowId = overId.replace('row-', '');
        for (const section of document.sections) {
          const row = section.rows.find(r => r.id === targetRowId);
          if (row) {
            targetSectionId = section.id;
            break;
          }
        }
      }

      if (targetSectionId && targetRowId) {
        const newDocument = { ...document };
        
        // Remove widget from original location
        newDocument.sections = newDocument.sections.map(section => ({
          ...section,
          rows: section.rows.map(row => ({
            ...row,
            widgets: row.widgets.filter(w => w.id !== widget.id)
          }))
        }));
        
        // Add widget to new location
        newDocument.sections = newDocument.sections.map(section => {
          if (section.id === targetSectionId) {
            return {
              ...section,
              rows: section.rows.map(row => {
                if (row.id === targetRowId) {
                  return {
                    ...row,
                    widgets: [...row.widgets, widget]
                  };
                }
                return row;
              })
            };
          }
          return section;
        });
        
        onDocumentChange(newDocument);
      }
    }

    setActiveDragItem(null);
    setDragOverSection(null);
    setDragOverRow(null);
  }, [document, onDocumentChange, onWidgetSelect]);

  // Handle widget updates
  const handleWidgetUpdate = useCallback((widgetId: string, updates: Partial<WidgetBase>) => {
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
    
    onDocumentChange(newDocument);
  }, [document, onDocumentChange]);

  // Handle widget deletion
  const handleWidgetDelete = useCallback((widgetId: string) => {
    const newDocument = { ...document };
    
    newDocument.sections = newDocument.sections.map(section => ({
      ...section,
      rows: section.rows.map(row => ({
        ...row,
        widgets: row.widgets.filter(widget => widget.id !== widgetId)
      }))
    }));
    
    onDocumentChange(newDocument);
    if (selectedWidgetId === widgetId) {
      onWidgetSelect(null);
    }
  }, [document, onDocumentChange, selectedWidgetId, onWidgetSelect]);

  // Handle widget duplication
  const handleWidgetDuplicate = useCallback((widgetId: string) => {
    const newDocument = { ...document };
    const newWidgetId = `widget_${Date.now()}`;
    
    newDocument.sections = newDocument.sections.map(section => ({
      ...section,
      rows: section.rows.map(row => {
        const widgetIndex = row.widgets.findIndex(w => w.id === widgetId);
        if (widgetIndex !== -1) {
          const originalWidget = row.widgets[widgetIndex];
          const duplicatedWidget = {
            ...originalWidget,
            id: newWidgetId
          };
          
          return {
            ...row,
            widgets: [
              ...row.widgets.slice(0, widgetIndex + 1),
              duplicatedWidget,
              ...row.widgets.slice(widgetIndex + 1)
            ]
          };
        }
        return row;
      })
    }));
    
    onDocumentChange(newDocument);
    onWidgetSelect(newWidgetId);
  }, [document, onDocumentChange, onWidgetSelect]);

  const renderContent = () => (
    <div className="min-h-screen p-8">
      {/* Page content area with grid guides */}
      <div className="relative">
        {/* Grid guides with page boundary */}
        <GridGuides />
        
        {/* Page content positioned inside the grid guides */}
        <div className="absolute top-8 left-8 right-8 bottom-8">
          <SortableContext
            items={document.sections.map(s => `section-${s.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {document.sections.map((section) => (
              <CanvasSection
                key={section.id}
                section={section}
                isSelected={selectedSectionId === section.id}
                onSelect={() => onSectionSelect(section.id)}
                onDeselect={() => onSectionSelect(null)}
                isPreviewMode={isPreviewMode}
                selectedWidgetId={selectedWidgetId}
                onWidgetSelect={onWidgetSelect}
                selectedRowId={selectedRowId}
                onRowSelect={onRowSelect}
                onWidgetUpdate={handleWidgetUpdate}
                onWidgetDelete={handleWidgetDelete}
                onWidgetDuplicate={handleWidgetDuplicate}
                dragOverSection={dragOverSection}
                dragOverRow={dragOverRow}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );

  const renderDragOverlay = () => (
    <DragOverlay>
      {activeDragItem ? (
        <div className="opacity-50">
          {activeDragItem.type === 'new-widget' ? (
            <div className="bg-white border-2 border-dashed border-primary-500 rounded-lg p-4 shadow-lg">
              <div className="text-primary-600 font-medium">
                Add {activeDragItem.widgetType} Widget
              </div>
            </div>
          ) : activeDragItem.widget ? (
            <CanvasWidget
              widget={activeDragItem.widget}
              isSelected={false}
              isPreviewMode={true}
              onSelect={() => {}}
              onUpdate={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
            />
          ) : null}
        </div>
      ) : null}
    </DragOverlay>
  );

  if (disableDndContext) {
    return (
      <div className="flex-1 bg-gray-50 overflow-auto">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {renderContent()}
        {renderDragOverlay()}
      </DndContext>
    </div>
  );
};
