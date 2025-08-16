/**
 * Properties Panel
 * Shows editing options for selected widgets, sections, and rows
 */

import React from 'react';
import type { PageDocument, WidgetBase } from '../types';
import { widgetRegistry } from '../widgets/registry';
import { 
  Settings, 
  Layout, 
  Eye, 
  Search,
  Type,
  MousePointer
} from 'lucide-react';

interface PropertiesPanelProps {
  document: PageDocument;
  selectedWidgetId: string | null;
  selectedSectionId: string | null;
  selectedRowId: string | null;
  onDocumentChange: (doc: PageDocument) => void;
  onWidgetUpdate: (widgetId: string, updates: Partial<WidgetBase>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  document,
  selectedWidgetId,
  selectedSectionId,
  selectedRowId,
  onDocumentChange,
  onWidgetUpdate,
}) => {
  // Find selected elements
  const selectedWidget = selectedWidgetId 
    ? document.sections
        .flatMap(s => s.rows)
        .flatMap(r => r.widgets)
        .find(w => w.id === selectedWidgetId)
    : null;

  const selectedSection = selectedSectionId
    ? document.sections.find(s => s.id === selectedSectionId)
    : null;

  const selectedRow = selectedRowId
    ? document.sections
        .flatMap(s => s.rows)
        .find(r => r.id === selectedRowId)
    : null;

  const widgetConfig = selectedWidget ? widgetRegistry.get(selectedWidget.type) : null;

  const renderWidgetProperties = () => {
    if (!selectedWidget || !widgetConfig) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Type className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <p>Select a widget to edit its properties</p>
        </div>
      );
    }

    const WidgetEditor = widgetConfig.Editor;
    return (
      <WidgetEditor
        widget={selectedWidget}
        onChange={(updates) => onWidgetUpdate(selectedWidget.id, updates)}
        onDelete={() => {
          // Handle widget deletion
          const newDocument = { ...document };
          newDocument.sections = newDocument.sections.map(section => ({
            ...section,
            rows: section.rows.map(row => ({
              ...row,
              widgets: row.widgets.filter(w => w.id !== selectedWidget.id)
            }))
          }));
          onDocumentChange(newDocument);
        }}
        onDuplicate={() => {
          // Handle widget duplication
          const newWidget = {
            ...selectedWidget,
            id: `widget_${Date.now()}`
          };
          const newDocument = { ...document };
          newDocument.sections = newDocument.sections.map(section => ({
            ...section,
            rows: section.rows.map(row => ({
              ...row,
              widgets: [...row.widgets, newWidget]
            }))
          }));
          onDocumentChange(newDocument);
        }}
      />
    );
  };

  const renderSectionProperties = () => {
    if (!selectedSection) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Layout className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <p>Select a section to edit its properties</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Layout className="w-4 h-4 text-blue-600" />
          <h3 className="font-medium text-gray-900">Section Properties</h3>
        </div>

        {/* Section Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
          </label>
          <input
            type="text"
            value={selectedSection.title || ''}
            onChange={(e) => {
              const newDocument = { ...document };
              newDocument.sections = newDocument.sections.map(section =>
                section.id === selectedSection.id
                  ? { ...section, title: e.target.value }
                  : section
              );
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter section title..."
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <select
            value={selectedSection.background?.colorToken || ''}
            onChange={(e) => {
              const newDocument = { ...document };
              newDocument.sections = newDocument.sections.map(section =>
                section.id === selectedSection.id
                  ? {
                      ...section,
                      background: {
                        ...section.background,
                        colorToken: e.target.value || undefined
                      }
                    }
                  : section
              );
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No background</option>
            <option value="bg-gray-50">Light Gray</option>
            <option value="bg-gray-100">Gray</option>
            <option value="bg-blue-50">Blue Light</option>
            <option value="bg-blue-100">Blue</option>
            <option value="bg-orange-50">Orange Light</option>
            <option value="bg-orange-100">Orange</option>
          </select>
        </div>

        {/* Padding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Padding
          </label>
          <select
            value={selectedSection.padding || 'p-4'}
            onChange={(e) => {
              const newDocument = { ...document };
              newDocument.sections = newDocument.sections.map(section =>
                section.id === selectedSection.id
                  ? { ...section, padding: e.target.value }
                  : section
              );
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="p-2">Small</option>
            <option value="p-4">Medium</option>
            <option value="p-6">Large</option>
            <option value="p-8">Extra Large</option>
            <option value="py-8 px-4">Vertical Large</option>
          </select>
        </div>
      </div>
    );
  };

  const renderRowProperties = () => {
    if (!selectedRow) {
      return (
        <div className="p-4 text-center text-gray-500">
          <MousePointer className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Select a row to edit its properties</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <MousePointer className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Row Properties</h3>
        </div>

        <div className="text-sm text-gray-600">
          <p>Row ID: {selectedRow.id}</p>
          <p>Widgets: {selectedRow.widgets.length}</p>
        </div>

        {/* Add more row-specific properties here */}
      </div>
    );
  };

  const renderPageProperties = () => {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Page Properties</h3>
        </div>

        {/* Page Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Name
          </label>
          <input
            type="text"
            value={document.name}
            onChange={(e) => {
              const newDocument = { ...document, name: e.target.value };
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter page name..."
          />
        </div>

        {/* SEO Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            value={document.seo?.metaTitle || ''}
            onChange={(e) => {
              const newDocument = {
                ...document,
                seo: { ...document.seo, metaTitle: e.target.value }
              };
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter meta title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
          </label>
          <textarea
            value={document.seo?.metaDescription || ''}
            onChange={(e) => {
              const newDocument = {
                ...document,
                seo: { ...document.seo, metaDescription: e.target.value }
              };
              onDocumentChange(newDocument);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter meta description..."
          />
        </div>

        {/* Page Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Status: <span className="font-medium">{document.status}</span></p>
            <p>Version: <span className="font-medium">{document.version}</span></p>
            <p>Created: <span className="font-medium">{new Date(document.createdAt).toLocaleDateString()}</span></p>
            <p>Updated: <span className="font-medium">{new Date(document.updatedAt).toLocaleDateString()}</span></p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedWidgetId && renderWidgetProperties()}
        {selectedSectionId && !selectedWidgetId && renderSectionProperties()}
        {selectedRowId && !selectedWidgetId && !selectedSectionId && renderRowProperties()}
        {!selectedWidgetId && !selectedSectionId && !selectedRowId && renderPageProperties()}
      </div>
    </div>
  );
};
