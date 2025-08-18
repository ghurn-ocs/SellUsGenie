/**
 * Simple Page Builder
 * A functional page builder with working drag and drop
 */

import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { generateId } from '../../lib/utils';

interface SimplePageBuilderProps {
  pageId?: string;
}

interface Widget {
  id: string;
  type: 'text' | 'button' | 'image' | 'productGrid';
  content: string;
  styles: Record<string, string>;
}

interface DragItem {
  type: string;
  widgetType: 'text' | 'button' | 'image' | 'productGrid';
}

interface DroppableAreaProps {
  onDrop: (item: DragItem) => void;
  widgets: Widget[];
  onSelectWidget: (id: string) => void;
  selectedWidget: string | null;
}

interface DraggableElementProps {
  type: 'text' | 'button' | 'image' | 'productGrid';
  label: string;
  description: string;
}

interface WidgetRendererProps {
  widget: Widget;
  isSelected: boolean;
  onClick: () => void;
}

// Draggable Element Component
const DraggableElement: React.FC<DraggableElementProps> = ({ type, label, description }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'WIDGET',
    item: { type: 'WIDGET', widgetType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={`p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
};

// Widget Renderer Component
const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, isSelected, onClick }) => {
  const baseClasses = "p-4 border rounded-md cursor-pointer transition-all";
  const selectedClasses = isSelected 
    ? "border-blue-500 bg-blue-50 shadow-sm" 
    : "border-gray-200 hover:border-gray-300";

  const renderContent = () => {
    switch (widget.type) {
      case 'text':
        return (
          <div className="text-gray-900">
            {widget.content || 'Click to edit text'}
          </div>
        );
      case 'button':
        return (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {widget.content || 'Button Text'}
          </button>
        );
      case 'image':
        return (
          <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
            <span className="text-gray-500">Image Placeholder</span>
          </div>
        );
      case 'productGrid':
        return (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-md">
                <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                <div className="text-sm font-medium">Product {i}</div>
                <div className="text-xs text-gray-500">$99.00</div>
              </div>
            ))}
          </div>
        );
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onClick}>
      {renderContent()}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Selected
        </div>
      )}
    </div>
  );
};

// Droppable Area Component
const DroppableArea: React.FC<DroppableAreaProps> = ({ onDrop, widgets, onSelectWidget, selectedWidget }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'WIDGET',
    drop: (item: DragItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`min-h-96 p-6 border-2 border-dashed rounded-lg transition-all ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {widgets.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop elements here to start building
          </h3>
          <p className="text-sm text-gray-500">
            Drag elements from the left panel to create your page
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {widgets.map((widget) => (
            <div key={widget.id} className="relative">
              <WidgetRenderer
                widget={widget}
                isSelected={selectedWidget === widget.id}
                onClick={() => onSelectWidget(widget.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SimplePageBuilder: React.FC<SimplePageBuilderProps> = ({ pageId }) => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleDrop = useCallback((item: DragItem) => {
    const newWidget: Widget = {
      id: generateId('widget'),
      type: item.widgetType,
      content: getDefaultContent(item.widgetType),
      styles: {},
    };
    setWidgets(prev => [...prev, newWidget]);
    setHasUnsavedChanges(true);
  }, []);

  const handleSelectWidget = useCallback((id: string) => {
    setSelectedWidget(id);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      console.log('Saving page...', { pageId, widgets, storeId: currentStore?.id });
      // Here you would save to your backend
      setHasUnsavedChanges(false);
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page');
    }
  }, [pageId, widgets, currentStore]);

  const handlePublish = useCallback(async () => {
    try {
      console.log('Publishing page...', { pageId, widgets, storeId: currentStore?.id });
      // Here you would publish to your backend
      alert('Page published successfully!');
    } catch (error) {
      console.error('Error publishing page:', error);
      alert('Failed to publish page');
    }
  }, [pageId, widgets, currentStore]);

  const getDefaultContent = (type: Widget['type']): string => {
    switch (type) {
      case 'text': return 'Your text content here...';
      case 'button': return 'Click Me';
      case 'image': return '';
      case 'productGrid': return '';
      default: return '';
    }
  };

  const selectedWidgetData = selectedWidget ? widgets.find(w => w.id === selectedWidget) : null;

  // Show loading state while auth/store is loading
  if (!user || !currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Visual Page Builder
                </h1>
                {pageId && (
                  <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    Page: {pageId}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {widgets.length} element{widgets.length !== 1 ? 's' : ''}
                </span>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button 
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-screen">
          {/* Left Panel - Elements */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Elements</h2>
              <div className="space-y-2">
                <DraggableElement
                  type="text"
                  label="Text Block"
                  description="Add text content"
                />
                <DraggableElement
                  type="button"
                  label="Button"
                  description="Call-to-action button"
                />
                <DraggableElement
                  type="image"
                  label="Image"
                  description="Upload or select image"
                />
                <DraggableElement
                  type="productGrid"
                  label="Product Grid"
                  description="Display products"
                />
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 bg-gray-50 overflow-auto">
            <div className="p-8">
              <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-8">
                  <DroppableArea
                    onDrop={handleDrop}
                    widgets={widgets}
                    onSelectWidget={handleSelectWidget}
                    selectedWidget={selectedWidget}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Properties</h2>
              {selectedWidgetData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Element Type
                    </label>
                    <div className="px-3 py-2 bg-gray-100 text-sm rounded-md">
                      {selectedWidgetData.type}
                    </div>
                  </div>
                  {selectedWidgetData.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={selectedWidgetData.content}
                        onChange={(e) => {
                          const updatedWidgets = widgets.map(w => 
                            w.id === selectedWidget 
                              ? { ...w, content: e.target.value }
                              : w
                          );
                          setWidgets(updatedWidgets);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  )}
                  {selectedWidgetData.type === 'button' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={selectedWidgetData.content}
                        onChange={(e) => {
                          const updatedWidgets = widgets.map(w => 
                            w.id === selectedWidget 
                              ? { ...w, content: e.target.value }
                              : w
                          );
                          setWidgets(updatedWidgets);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <button 
                      onClick={() => {
                        setWidgets(prev => prev.filter(w => w.id !== selectedWidget));
                        setSelectedWidget(null);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete Element
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Select an element to edit its properties
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default SimplePageBuilder;