/**
 * Canvas Row
 * Renders individual rows in the page builder canvas with 12-column grid
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Row, WidgetBase } from '../types';
import { CanvasWidget } from './CanvasWidget';

interface CanvasRowProps {
  row: Row;
  sectionId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  isPreviewMode: boolean;
  selectedWidgetId: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
  onWidgetUpdate: (widgetId: string, updates: Partial<WidgetBase>) => void;
  onWidgetDelete: (widgetId: string) => void;
  onWidgetDuplicate: (widgetId: string) => void;
  onRowDelete: () => void;
  isDragOver: boolean;
}

export const CanvasRow: React.FC<CanvasRowProps> = ({
  row,
  sectionId,
  isSelected,
  onSelect,
  onDeselect,
  isPreviewMode,
  selectedWidgetId,
  onWidgetSelect,
  onWidgetUpdate,
  onWidgetDelete,
  onWidgetDuplicate,
  onRowDelete,
  isDragOver,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `row-${row.id}`,
  });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver,
  } = useDroppable({
    id: `row-${row.id}`,
  });

  // Combine refs for both sortable and droppable
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get widget column span classes with proper responsive handling
  const getWidgetColSpanClasses = (widget: WidgetBase) => {
    const { colSpan } = widget;
    const classes = [];
    
    // Default to full width if no colSpan specified
    if (!colSpan || Object.keys(colSpan).length === 0) {
      return 'col-span-12';
    }
    
    // Small screens (default)
    if (colSpan.sm !== undefined) {
      classes.push(`col-span-${colSpan.sm}`);
    } else {
      classes.push('col-span-12'); // Default full width on small screens
    }
    
    // Medium screens
    if (colSpan.md !== undefined) {
      classes.push(`md:col-span-${colSpan.md}`);
    } else if (colSpan.sm !== undefined) {
      classes.push(`md:col-span-${colSpan.sm}`); // Use small screen value for medium
    }
    
    // Large screens
    if (colSpan.lg !== undefined) {
      classes.push(`lg:col-span-${colSpan.lg}`);
    } else if (colSpan.md !== undefined) {
      classes.push(`lg:col-span-${colSpan.md}`); // Use medium screen value for large
    } else if (colSpan.sm !== undefined) {
      classes.push(`lg:col-span-${colSpan.sm}`); // Use small screen value for large
    }
    
    return classes.join(' ');
  };

  const isRowDragOver = isDragOver || isOver;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-6 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-600' : ''
      } ${isRowDragOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''} ${
        row.widgets.length === 0 ? 'min-h-[80px] border-2 border-dashed border-gray-300 rounded-lg' : ''
      }`}
      onClick={onSelect}
    >
      {/* Row Header */}
      {!isPreviewMode && (
        <div className="flex items-center justify-between p-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded cursor-move transition-colors"
              title="Drag to reorder row"
            >
              ⋮⋮
            </button>
            <span className="text-xs text-blue-700 font-medium">Row</span>
            <span className="text-xs text-gray-500">({row.widgets.length} widgets)</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement add widget to row functionality
                console.log('Add widget to row clicked - functionality to be implemented');
              }}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              title="Add widget"
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRowDelete();
              }}
              className="p-1 text-blue-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
              title="Delete row"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Row Content with proper grid layout */}
      <div className="grid grid-cols-12 gap-4 p-4 w-full max-w-full overflow-x-hidden">
        {row.widgets.map((widget) => (
          <div
            key={widget.id}
            className={`${getWidgetColSpanClasses(widget)} min-h-[60px] w-full max-w-full overflow-hidden`}
          >
            <CanvasWidget
              widget={widget}
              isSelected={selectedWidgetId === widget.id}
              isPreviewMode={isPreviewMode}
              onSelect={() => onWidgetSelect(widget.id)}
              onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
              onDelete={() => onWidgetDelete(widget.id)}
              onDuplicate={() => onWidgetDuplicate(widget.id)}
            />
          </div>
        ))}

        {/* Empty state with better drop zone */}
        {row.widgets.length === 0 && !isPreviewMode && (
          <div className={`col-span-12 text-center py-12 border-2 border-dashed rounded-lg transition-all duration-200 ${
            isRowDragOver 
              ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105' 
              : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-300'
          }`}>
            <div className="flex flex-col items-center space-y-3">
              <div className="text-3xl">📦</div>
              <p className="font-medium text-lg">
                {isRowDragOver ? 'Drop widget here!' : 'Drag widgets from library'}
              </p>
              <p className="text-sm opacity-70">
                {isRowDragOver ? 'Release to add widget' : 'This row is empty'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay indicator for rows with widgets */}
      {isRowDragOver && row.widgets.length > 0 && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-30 pointer-events-none rounded-lg z-10" />
      )}
    </div>
  );
};
