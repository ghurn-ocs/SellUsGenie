/**
 * Canvas Section
 * Renders individual sections in the page builder canvas
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Section, WidgetBase } from '../types';
import { CanvasRow } from './CanvasRow';

interface CanvasSectionProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  isPreviewMode: boolean;
  selectedWidgetId: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
  selectedRowId: string | null;
  onRowSelect: (rowId: string | null) => void;
  onWidgetUpdate: (widgetId: string, updates: Partial<WidgetBase>) => void;
  onWidgetDelete: (widgetId: string) => void;
  onWidgetDuplicate: (widgetId: string) => void;
  onRowAdd: (sectionId: string) => void;
  onRowDelete: (sectionId: string, rowId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  dragOverSection: string | null;
  dragOverRow: string | null;
}

export const CanvasSection: React.FC<CanvasSectionProps> = ({
  section,
  isSelected,
  onSelect,
  onDeselect,
  isPreviewMode,
  selectedWidgetId,
  onWidgetSelect,
  selectedRowId,
  onRowSelect,
  onWidgetUpdate,
  onWidgetDelete,
  onWidgetDuplicate,
  onRowAdd,
  onRowDelete,
  onSectionDelete,
  dragOverSection,
  dragOverRow,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `section-${section.id}`,
  });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver,
  } = useDroppable({
    id: `section-${section.id}`,
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

  const isDragOver = dragOverSection === `section-${section.id}` || isOver;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-8 transition-colors duration-200 ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      } ${isDragOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
      onClick={onSelect}
    >
      {/* Section Header */}
      {!isPreviewMode && (
        <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-move"
              title="Drag to reorder section"
            >
              ⋮⋮
            </button>
            <h3 className="text-sm font-medium text-gray-700">
              {section.title || `Section ${section.id.slice(-4)}`}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRowAdd(section.id);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
              title="Add row"
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSectionDelete(section.id);
              }}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete section"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Section Content */}
      <div
        className={`${
          section.background?.colorToken ? `bg-${section.background.colorToken}` : ''
        } ${section.padding || 'p-4'}`}
        style={{
          backgroundImage: section.background?.imageUrl ? `url(${section.background.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {section.rows.map((row) => (
          <CanvasRow
            key={row.id}
            row={row}
            sectionId={section.id}
            isSelected={selectedRowId === row.id}
            onSelect={() => onRowSelect(row.id)}
            onDeselect={() => onRowSelect(null)}
            isPreviewMode={isPreviewMode}
            selectedWidgetId={selectedWidgetId}
            onWidgetSelect={onWidgetSelect}
            onWidgetUpdate={onWidgetUpdate}
            onWidgetDelete={onWidgetDelete}
            onWidgetDuplicate={onWidgetDuplicate}
            onRowDelete={() => onRowDelete(section.id, row.id)}
            isDragOver={dragOverRow === `row-${row.id}`}
          />
        ))}

        {/* Empty state */}
        {section.rows.length === 0 && !isPreviewMode && (
          <div className="text-center py-8 text-gray-500">
            <p>No rows in this section. Add a row to get started.</p>
          </div>
        )}
      </div>

      {/* Drag overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50 pointer-events-none" />
      )}
    </div>
  );
};

