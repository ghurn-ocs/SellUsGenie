/**
 * Widget Library
 * Displays available widgets for drag-and-drop into the canvas
 */

import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { widgetRegistry, WIDGET_CATEGORIES } from '../widgets/registry';
import type { DragItem, WidgetType } from '../types';
import { 
  Search, 
  Type, 
  Image, 
  MousePointer, 
  ShoppingCart,
  Minus,
  ChevronDown,
  ChevronRight,
  Layout,
  Star,
  Package,
  Heart,
  Grid,
  Navigation,
  Mail
} from 'lucide-react';

// Map icon strings to Lucide React components
const ICON_MAP = {
  Type,
  Image,
  MousePointer,
  ShoppingCart,
  Layout,
  Star,
  Package,
  Heart,
  Grid,
  Navigation,
  Mail,
  Minus
} as const;

// Function to get icon component from string
const getIconComponent = (iconName: string) => {
  const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP];
  return IconComponent || Type; // Default to Type icon if not found
};

interface DraggableWidgetProps {
  widgetType: WidgetType;
  name: string;
  description: string;
  icon: string;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  widgetType, 
  name, 
  description, 
  icon 
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-widget-${widgetType}`,
    data: {
      type: 'new-widget' as const,
      widgetType,
    } as DragItem,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = getIconComponent(icon);

  // Debug: log when isDragging changes
  React.useEffect(() => {
    if (isDragging) {
      console.log(`🔄 Widget ${widgetType} is dragging`);
    } else {
      console.log(`✅ Widget ${widgetType} drag finished`);
    }
  }, [isDragging, widgetType]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 border border-gray-200 rounded-lg bg-white cursor-move hover:bg-blue-50 hover:border-blue-300 transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <IconComponent className="text-blue-600 w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
      </div>
    </div>
  );
};

export const WidgetLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(WIDGET_CATEGORIES.map(cat => cat.id))
  );
  const [availableWidgets, setAvailableWidgets] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load available widgets on mount and refresh when widgets are dropped
  useEffect(() => {
    const loadWidgets = () => {
      const widgets = widgetRegistry.getUserWidgets();
      setAvailableWidgets(widgets);
    };

    loadWidgets();

    // Listen for widget drop events to refresh the library
    const handleWidgetDropped = () => {
      loadWidgets();
      setRefreshKey(prev => prev + 1); // Force re-render of draggable components
    };

    window.addEventListener('widget-dropped', handleWidgetDropped);
    
    return () => {
      window.removeEventListener('widget-dropped', handleWidgetDropped);
    };
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const widgetsByCategory = WIDGET_CATEGORIES.map(category => ({
    ...category,
    widgets: filteredWidgets.filter(widget => widget.category === category.id)
  }));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Widget Library</h2>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-2">
          Available widgets: {availableWidgets.length}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Widget Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {widgetsByCategory.map((category) => {
          if (category.widgets.length === 0) return null;

          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                  <span>{category.name}</span>
                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {category.widgets.length}
                  </span>
                </div>
              </button>

              {/* Category Description */}
              {isExpanded && (
                <p className="text-xs text-gray-500 px-2 mb-2">
                  {category.description}
                </p>
              )}

              {/* Widgets */}
              {isExpanded && (
                <div className="space-y-2 pl-4">
                  {category.widgets.map((widget) => (
                    <DraggableWidget
                      key={`${widget.type}-${refreshKey}`}
                      widgetType={widget.type}
                      name={widget.name}
                      description={widget.description}
                      icon={widget.icon}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* No results */}
        {filteredWidgets.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <p>No widgets found matching "{searchTerm}"</p>
          </div>
        )}

        {/* No widgets */}
        {availableWidgets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No widgets available</p>
            <p className="text-xs mt-2">Check console for debug info</p>
          </div>
        )}
        
        {/* Bottom padding for better scroll visibility (1 inch minimum) */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};
