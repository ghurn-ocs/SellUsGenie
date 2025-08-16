/**
 * Canvas Widget
 * Renders individual widgets in the page builder canvas
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WidgetBase, DragItem } from '../types';
import { widgetRegistry } from '../widgets/registry';

interface CanvasWidgetProps {
  widget: WidgetBase;
  isSelected: boolean;
  isPreviewMode: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<WidgetBase>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const CanvasWidget: React.FC<CanvasWidgetProps> = ({
  widget,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `widget-${widget.id}`,
    data: {
      type: 'widget' as const,
      widget,
    } as DragItem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widgetConfig = widgetRegistry.get(widget.type);
  const WidgetView = widgetConfig?.View;

  if (!WidgetView) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
        Unknown widget type: {widget.type}
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this widget?')) {
      onDelete();
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        isSelected && !isPreviewMode ? 'ring-2 ring-blue-600' : ''
      } ${isDragging ? 'opacity-50' : ''} ${
        !isPreviewMode ? 'hover:ring-1 hover:ring-blue-300' : ''
      }`}
      onClick={onSelect}
    >
      {/* Widget Header (Editor Mode Only) */}
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-10 left-0 right-0 flex items-center justify-between bg-blue-600 text-white text-xs px-3 py-2 rounded-t shadow-lg z-20">
          <div className="flex items-center space-x-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-move hover:bg-blue-700 p-1 rounded transition-colors"
              title="Drag widget"
            >
              ⋮⋮
            </button>
            <span className="font-medium">{widgetConfig?.name || widget.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDuplicate}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
              title="Duplicate widget"
            >
              📋
            </button>
            <button
              onClick={handleDelete}
              className="hover:bg-orange-500 p-1 rounded transition-colors"
              title="Delete widget"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Quick Delete Button (Hover State) */}
      {!isPreviewMode && !isSelected && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleDelete}
            className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-orange-600 shadow-lg"
            title="Delete widget"
          >
            ×
          </button>
        </div>
      )}

      {/* Widget Content */}
      <div className={`${!isPreviewMode && isSelected ? 'pt-2' : ''} bg-white rounded border border-gray-200 shadow-sm`}>
        <WidgetView widget={widget} theme={undefined} />
      </div>

      {/* Resize Handles (Editor Mode Only) */}
      {!isPreviewMode && isSelected && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-600 cursor-nw-resize rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 cursor-ne-resize rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-blue-600 cursor-sw-resize rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 cursor-se-resize rounded-br" />
        </>
      )}

      {/* Column Span Indicator */}
      {!isPreviewMode && isSelected && (
        <div className="absolute -bottom-8 left-0 right-0 text-xs text-gray-600 text-center bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
          <span className="font-medium text-blue-600">Spans:</span>
          {widget.colSpan.sm && ` sm:${widget.colSpan.sm}`}
          {widget.colSpan.md && ` md:${widget.colSpan.md}`}
          {widget.colSpan.lg && ` lg:${widget.colSpan.lg}`}
        </div>
      )}
    </div>
  );
};
