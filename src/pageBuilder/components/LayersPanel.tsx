/**
 * Layers Panel
 * Shows the page structure hierarchy and allows for easy element selection and management
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Move,
  MoreVertical,
  Layers
} from 'lucide-react';
import type { PageDocument, Section, Row, WidgetBase } from '../types';
import { widgetRegistry } from '../widgets/registry';

interface LayersPanelProps {
  document: PageDocument;
  selectedWidgetId: string | null;
  selectedSectionId: string | null;
  selectedRowId: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
  onSectionSelect: (sectionId: string | null) => void;
  onRowSelect: (rowId: string | null) => void;
  onDocumentChange: (document: PageDocument) => void;
}

interface LayerTreeItemProps {
  id: string;
  name: string;
  type: 'section' | 'row' | 'widget';
  level: number;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  onClick: () => void;
  onToggleExpanded?: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const LayerTreeItem: React.FC<LayerTreeItemProps> = ({
  id,
  name,
  type,
  level,
  isSelected,
  isVisible,
  isLocked,
  hasChildren,
  isExpanded,
  icon: IconComponent,
  onClick,
  onToggleExpanded,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="group relative">
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded ${
          isSelected ? 'bg-blue-50 border border-blue-200' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={onClick}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded?.();
            }}
            className="mr-1 p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}

        <div className="flex items-center flex-1 min-w-0 space-x-2">
          <div className="flex-shrink-0">
            {IconComponent ? (
              <IconComponent className={`w-4 h-4 ${
                type === 'widget' ? 'text-blue-600' :
                type === 'row' ? 'text-green-600' :
                'text-purple-600'
              }`} size={16} />
            ) : (
              <Layers className={`w-4 h-4 ${
                type === 'widget' ? 'text-blue-600' :
                type === 'row' ? 'text-green-600' :
                'text-purple-600'
              }`} />
            )}
          </div>
          
          <span className={`text-sm truncate ${
            isSelected ? 'font-medium text-blue-900' : 'text-gray-700'
          } ${!isVisible ? 'opacity-50' : ''}`}>
            {name}
          </span>
          
          <span className={`text-xs px-1 py-0.5 rounded ${
            type === 'widget' ? 'bg-blue-100 text-blue-700' :
            type === 'row' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {type}
          </span>
        </div>

        {(showActions || isSelected) && (
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title={isVisible ? 'Hide' : 'Show'}
            >
              {isVisible ? (
                <Eye className="w-3 h-3 text-gray-500" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title={isLocked ? 'Unlock' : 'Lock'}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-gray-500" />
              ) : (
                <Unlock className="w-3 h-3 text-gray-400" />
              )}
            </button>

            <div className="relative">
              <button
                className="p-1 hover:bg-gray-100 rounded"
                title="More actions"
              >
                <MoreVertical className="w-3 h-3 text-gray-500" />
              </button>
              
              {/* Dropdown menu - simplified for now */}
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 hidden group-hover:block">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  document,
  selectedWidgetId,
  selectedSectionId,
  selectedRowId,
  onWidgetSelect,
  onSectionSelect,
  onRowSelect,
  onDocumentChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
  const [layerLocks, setLayerLocks] = useState<Record<string, boolean>>({});

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
      // Also collapse all rows in this section
      const rowsToCollapse = document.sections
        .find(s => s.id === sectionId)?.rows.map(r => r.id) || [];
      const newExpandedRows = new Set(expandedRows);
      rowsToCollapse.forEach(rowId => newExpandedRows.delete(rowId));
      setExpandedRows(newExpandedRows);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleRowExpanded = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleVisibility = (id: string, type: 'section' | 'row' | 'widget') => {
    setLayerVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // In a real implementation, this would update the document's visibility state
  };

  const toggleLock = (id: string, type: 'section' | 'row' | 'widget') => {
    setLayerLocks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    // In a real implementation, this would prevent editing of locked elements
  };

  const handleDuplicate = (id: string, type: 'section' | 'row' | 'widget') => {
    // Implementation for duplicating elements
    console.log(`Duplicate ${type}:`, id);
  };

  const handleDelete = (id: string, type: 'section' | 'row' | 'widget') => {
    // Implementation for deleting elements
    console.log(`Delete ${type}:`, id);
  };

  const getWidgetIcon = (widget: WidgetBase) => {
    const config = widgetRegistry.get(widget.type);
    return config?.icon;
  };

  const isVisible = (id: string) => layerVisibility[id] !== false;
  const isLocked = (id: string) => layerLocks[id] === true;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Layers</h2>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-500 hover:text-gray-700 rounded" title="Expand All">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700 rounded" title="Collapse All">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Navigate and manage page structure
        </p>
      </div>

      {/* Layer Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {document.sections.map((section) => {
            const isSectionExpanded = expandedSections.has(section.id);
            const isSectionSelected = selectedSectionId === section.id;
            
            return (
              <div key={section.id}>
                <LayerTreeItem
                  id={section.id}
                  name={section.title || `Section ${section.id.slice(-4)}`}
                  type="section"
                  level={0}
                  isSelected={isSectionSelected}
                  isVisible={isVisible(section.id)}
                  isLocked={isLocked(section.id)}
                  hasChildren={section.rows.length > 0}
                  isExpanded={isSectionExpanded}
                  onClick={() => onSectionSelect(section.id)}
                  onToggleExpanded={() => toggleSectionExpanded(section.id)}
                  onToggleVisibility={() => toggleVisibility(section.id, 'section')}
                  onToggleLock={() => toggleLock(section.id, 'section')}
                  onDuplicate={() => handleDuplicate(section.id, 'section')}
                  onDelete={() => handleDelete(section.id, 'section')}
                />

                {isSectionExpanded && section.rows.map((row) => {
                  const isRowExpanded = expandedRows.has(row.id);
                  const isRowSelected = selectedRowId === row.id;
                  
                  return (
                    <div key={row.id}>
                      <LayerTreeItem
                        id={row.id}
                        name={`Row ${row.id.slice(-4)} (${row.widgets.length} widgets)`}
                        type="row"
                        level={1}
                        isSelected={isRowSelected}
                        isVisible={isVisible(row.id)}
                        isLocked={isLocked(row.id)}
                        hasChildren={row.widgets.length > 0}
                        isExpanded={isRowExpanded}
                        onClick={() => onRowSelect(row.id)}
                        onToggleExpanded={() => toggleRowExpanded(row.id)}
                        onToggleVisibility={() => toggleVisibility(row.id, 'row')}
                        onToggleLock={() => toggleLock(row.id, 'row')}
                        onDuplicate={() => handleDuplicate(row.id, 'row')}
                        onDelete={() => handleDelete(row.id, 'row')}
                      />

                      {isRowExpanded && row.widgets.map((widget) => {
                        const isWidgetSelected = selectedWidgetId === widget.id;
                        const widgetConfig = widgetRegistry.get(widget.type);
                        
                        return (
                          <LayerTreeItem
                            key={widget.id}
                            id={widget.id}
                            name={widgetConfig?.name || widget.type}
                            type="widget"
                            level={2}
                            isSelected={isWidgetSelected}
                            isVisible={isVisible(widget.id)}
                            isLocked={isLocked(widget.id)}
                            icon={getWidgetIcon(widget)}
                            onClick={() => onWidgetSelect(widget.id)}
                            onToggleVisibility={() => toggleVisibility(widget.id, 'widget')}
                            onToggleLock={() => toggleLock(widget.id, 'widget')}
                            onDuplicate={() => handleDuplicate(widget.id, 'widget')}
                            onDelete={() => handleDelete(widget.id, 'widget')}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {document.sections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">No elements on this page</p>
            <p className="text-xs mt-1">Add widgets from the Widget panel to get started</p>
          </div>
        )}
        
        {/* Bottom padding for better scroll visibility (1 inch minimum) */}
        <div className="h-24"></div>
      </div>

      {/* Layer Actions */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {document.sections.length} sections, {' '}
            {document.sections.reduce((total, section) => 
              total + section.rows.reduce((rowTotal, row) => rowTotal + row.widgets.length, 0), 0
            )} widgets
          </span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>Visible</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};