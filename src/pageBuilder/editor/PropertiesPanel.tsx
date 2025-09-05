/**
 * Properties Panel - Redesigned with Expandable Sections
 * Shows editing options for page, selected widgets, sections, and rows
 */

import React, { useState } from 'react';
import type { PageDocument, WidgetBase } from '../types';
import { widgetRegistry } from '../widgets/registry';
import { PageColorSettings } from '../components/PageColorSettings';
import { ExpandableSection } from '../components/ExpandableSection';
import { useFooterColumnHeaders } from '../../hooks/useFooterColumnConfig';
import { 
  Settings, 
  Layout, 
  Eye, 
  Search,
  Type,
  MousePointer,
  Palette,
  Globe,
  FileText,
  Layers,
  Square,
  Grid,
  Link
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
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['general', 'widget'])
  );

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

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
  const { columnHeaders } = useFooterColumnHeaders();

  const updateDocument = (updates: Partial<PageDocument>) => {
    onDocumentChange({
      ...document,
      ...updates,
    });
  };

  const renderGeneralSection = () => (
    <ExpandableSection
      title="General"
      description="Basic page information and URL"
      icon={Globe}
      isOpen={openSections.has('general')}
      onToggle={() => toggleSection('general')}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Name
        </label>
        <input
          type="text"
          value={document.name || document.title || ''}
          onChange={(e) => updateDocument({ name: e.target.value, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter page name"
        />
        <p className="text-xs text-gray-500 mt-1">
          Internal name for organizing your pages
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page URL Slug
        </label>
        <div className="relative">
          <input
            type="text"
            value={document.slug || ''}
            onChange={(e) => {
              let slug = e.target.value;
              
              // Special handling for home page
              if (slug === '' || slug === '/') {
                slug = '/';
              } else {
                // For non-home pages, ensure slug starts with /
                if (!slug.startsWith('/')) {
                  slug = '/' + slug;
                }
                
                // Sanitize the slug (but preserve the leading /)
                slug = slug.toLowerCase()
                  .replace(/[^a-z0-9\/-]/g, '-')
                  .replace(/--+/g, '-')
                  .replace(/-$/, ''); // Remove trailing dash only
              }
              
              updateDocument({ slug });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="/page-url-slug (use / for home page)"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          The URL path for this page. Use "/" for home page, "/about" for about page, etc.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={document.status || 'draft'}
          onChange={(e) => updateDocument({ status: e.target.value as 'draft' | 'published' | 'archived' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Navigation Placement
        </label>
        <select
          value={document.navigationPlacement || 'both'}
          onChange={(e) => updateDocument({ navigationPlacement: e.target.value as 'header' | 'footer' | 'both' | 'none' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="both">Both (Header & Footer)</option>
          <option value="header">Header Only</option>
          <option value="footer">Footer Only</option>
          <option value="none">None</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Controls where this page appears in site navigation menus
        </p>
      </div>

      {/* Footer Column Selection - Only show if page appears in footer */}
      {(document.navigationPlacement === 'footer' || document.navigationPlacement === 'both') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Footer Column
          </label>
          <select
            value={document.footerColumn || 2}
            onChange={(e) => updateDocument({ footerColumn: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>Column 1: {columnHeaders[1]}</option>
            <option value={2}>Column 2: {columnHeaders[2]}</option>
            <option value={3}>Column 3: {columnHeaders[3]}</option>
            <option value={4}>Column 4: {columnHeaders[4]}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose which footer column this page link should appear in
          </p>
        </div>
      )}
    </ExpandableSection>
  );

  const renderColorSection = () => (
    <ExpandableSection
      title="Colors & Theme"
      description="Page color scheme and theme settings"
      icon={Palette}
      isOpen={openSections.has('colors')}
      onToggle={() => toggleSection('colors')}
    >
      <PageColorSettings
        document={document}
        onDocumentChange={onDocumentChange}
      />
    </ExpandableSection>
  );

  const renderWidgetProperties = () => {
    if (!selectedWidget || !widgetConfig) {
      return (
        <ExpandableSection
          title="Widget Properties"
          description="Select a widget to edit"
          icon={Type}
          isOpen={openSections.has('widget')}
          onToggle={() => toggleSection('widget')}
        >
          <div className="text-center text-gray-500">
            <Type className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Select a widget to edit its properties</p>
          </div>
        </ExpandableSection>
      );
    }

    const WidgetEditor = widgetConfig.Editor;
    return (
      <ExpandableSection
        title="Widget Properties"
        description={`Editing ${widgetConfig.name}`}
        icon={Type}
        isOpen={openSections.has('widget')}
        onToggle={() => toggleSection('widget')}
      >
        <WidgetEditor
          widget={selectedWidget}
          onChange={(updates) => onWidgetUpdate(selectedWidget.id, updates)}
          onDelete={() => {
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
            const newWidget = {
              ...selectedWidget,
              id: `widget_${Date.now()}`
            };
            const newDocument = { ...document };
            newDocument.sections = newDocument.sections.map(section => ({
              ...section,
              rows: section.rows.map(row => {
                const hasWidget = row.widgets.some(w => w.id === selectedWidget.id);
                return hasWidget
                  ? { ...row, widgets: [...row.widgets, newWidget] }
                  : row;
              })
            }));
            onDocumentChange(newDocument);
          }}
        />
      </ExpandableSection>
    );
  };

  const renderSectionProperties = () => {
    if (!selectedSection) {
      return null;
    }

    return (
      <ExpandableSection
        title="Section Properties"
        description="Configure section settings"
        icon={Layout}
        isOpen={openSections.has('section')}
        onToggle={() => toggleSection('section')}
      >
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
            <option value="py-12 px-4">Vertical Extra Large</option>
          </select>
        </div>
      </ExpandableSection>
    );
  };

  const renderRowProperties = () => {
    if (!selectedRow) {
      return null;
    }

    return (
      <ExpandableSection
        title="Row Properties"
        description="Configure row layout"
        icon={Grid}
        isOpen={openSections.has('row')}
        onToggle={() => toggleSection('row')}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Row Alignment
          </label>
          <select
            value={selectedRow.alignment || 'left'}
            onChange={(e) => {
              const newDocument = { ...document };
              newDocument.sections = newDocument.sections.map(section => ({
                ...section,
                rows: section.rows.map(row =>
                  row.id === selectedRow.id
                    ? { ...row, alignment: e.target.value }
                    : row
                )
              }));
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gap Between Items
          </label>
          <select
            value={selectedRow.gap || 'gap-4'}
            onChange={(e) => {
              const newDocument = { ...document };
              newDocument.sections = newDocument.sections.map(section => ({
                ...section,
                rows: section.rows.map(row =>
                  row.id === selectedRow.id
                    ? { ...row, gap: e.target.value }
                    : row
                )
              }));
              onDocumentChange(newDocument);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="gap-0">None</option>
            <option value="gap-2">Small</option>
            <option value="gap-4">Medium</option>
            <option value="gap-6">Large</option>
            <option value="gap-8">Extra Large</option>
          </select>
        </div>
      </ExpandableSection>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Properties</span>
          </h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Configure page and element properties
        </p>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderGeneralSection()}
        {renderColorSection()}
        {renderWidgetProperties()}
        {selectedSection && renderSectionProperties()}
        {selectedRow && renderRowProperties()}
        
        {/* Bottom padding for better scroll visibility (1 inch minimum) */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};