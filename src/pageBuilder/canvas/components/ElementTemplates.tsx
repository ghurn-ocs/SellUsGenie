/**
 * Element Templates - Draggable template components for the canvas
 * Provides a library of pre-configured elements that can be added to the canvas
 */

import React from 'react';
import { Type, Square, Image, RectangleHorizontal, List, Grid3X3, Divide } from 'lucide-react';
import { useCanvasStore } from '../store/CanvasStore';
import { CanvasElement } from '../types/CanvasTypes';

interface ElementTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: 'text' | 'layout' | 'media' | 'form' | 'navigation';
  description: string;
  elementData: Omit<CanvasElement, 'id' | 'children' | 'parentId'>;
}

const elementTemplates: ElementTemplate[] = [
  // Text Elements
  {
    id: 'heading-1',
    name: 'Heading 1',
    icon: Type,
    category: 'text',
    description: 'Large primary heading',
    elementData: {
      tag: 'h1',
      textContent: 'Your Heading Here',
      attributes: {},
      styles: {
        desktop: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }
      }
    }
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    icon: Type,
    category: 'text',
    description: 'Secondary heading',
    elementData: {
      tag: 'h2',
      textContent: 'Section Heading',
      attributes: {},
      styles: {
        desktop: {
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: '0.75rem',
          lineHeight: '1.3'
        }
      }
    }
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    icon: Type,
    category: 'text',
    description: 'Text paragraph',
    elementData: {
      tag: 'p',
      textContent: 'Add your text content here. Double-click to edit.',
      attributes: {},
      styles: {
        desktop: {
          fontSize: '1rem',
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '1rem'
        }
      }
    }
  },

  // Layout Elements
  {
    id: 'container',
    name: 'Container',
    icon: Square,
    category: 'layout',
    description: 'Flexible container',
    elementData: {
      tag: 'div',
      attributes: {},
      styles: {
        desktop: {
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          minHeight: '100px'
        }
      }
    }
  },
  {
    id: 'flex-row',
    name: 'Flex Row',
    icon: Divide,
    category: 'layout',
    description: 'Horizontal flex container',
    elementData: {
      tag: 'div',
      attributes: {},
      styles: {
        desktop: {
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          padding: '1rem',
          minHeight: '80px',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem'
        }
      }
    }
  },
  {
    id: 'grid-2',
    name: '2-Column Grid',
    icon: Grid3X3,
    category: 'layout',
    description: 'Two column grid layout',
    elementData: {
      tag: 'div',
      attributes: {},
      styles: {
        desktop: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          padding: '1rem',
          minHeight: '120px',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem'
        }
      }
    }
  },

  // Media Elements
  {
    id: 'image',
    name: 'Image',
    icon: Image,
    category: 'media',
    description: 'Image element',
    elementData: {
      tag: 'img',
      attributes: {
        src: 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Image+Placeholder',
        alt: 'Placeholder image'
      },
      styles: {
        desktop: {
          width: '100%',
          maxWidth: '400px',
          height: 'auto',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }
      }
    }
  },

  // Interactive Elements
  {
    id: 'button-primary',
    name: 'Primary Button',
    icon: RectangleHorizontal,
    category: 'form',
    description: 'Primary action button',
    elementData: {
      tag: 'button',
      textContent: 'Click Me',
      attributes: {
        type: 'button'
      },
      styles: {
        desktop: {
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }
      }
    }
  },
  {
    id: 'button-secondary',
    name: 'Secondary Button',
    icon: RectangleHorizontal,
    category: 'form',
    description: 'Secondary action button',
    elementData: {
      tag: 'button',
      textContent: 'Secondary',
      attributes: {
        type: 'button'
      },
      styles: {
        desktop: {
          backgroundColor: 'transparent',
          color: '#3b82f6',
          padding: '0.75rem 1.5rem',
          border: '2px solid #3b82f6',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }
      }
    }
  },

  // Navigation Elements
  {
    id: 'nav-list',
    name: 'Navigation List',
    icon: List,
    category: 'navigation',
    description: 'Horizontal navigation list',
    elementData: {
      tag: 'nav',
      attributes: {},
      styles: {
        desktop: {
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }
      }
    }
  }
];

interface ElementTemplatesProps {
  className?: string;
}

export const ElementTemplates: React.FC<ElementTemplatesProps> = ({
  className = ''
}) => {
  const { createElement } = useCanvasStore();

  const handleElementAdd = (template: ElementTemplate) => {
    createElement(template.elementData);
  };

  const handleDragStart = (event: React.DragEvent, template: ElementTemplate) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'TEMPLATE_ELEMENT',
      template
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const categories = Array.from(new Set(elementTemplates.map(t => t.category)));

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Elements</h3>
        <p className="text-sm text-gray-500 mt-1">
          Drag elements onto the canvas or click to add
        </p>
      </div>

      <div className="p-4 space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">
              {category}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {elementTemplates
                .filter(template => template.category === category)
                .map(template => {
                  const Icon = template.icon;
                  
                  return (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, template)}
                      onClick={() => handleElementAdd(template)}
                      className="group flex flex-col items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                      title={template.description}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 transition-colors mb-2">
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <span className="text-xs text-center text-gray-700 group-hover:text-blue-700 font-medium">
                        {template.name}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Usage Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Click to add to canvas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Drag to specific position</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Double-click text to edit</span>
          </div>
        </div>
      </div>
    </div>
  );
};