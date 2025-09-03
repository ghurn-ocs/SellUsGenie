/**
 * Elements Panel - Drag and Drop HTML Elements
 * Webflow-like element library with semantic HTML elements
 */

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Square, 
  Image as ImageIcon, 
  Link, 
  MousePointer,
  List,
  Table,
  Film,
  FileText,
  Layers,
  Grid,
  Navigation,
  Star,
  Calendar,
  Map,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useEditorStore, type EnhancedElement } from '../store/EditorStore';

interface ElementsPanelProps {
  className?: string;
}

interface ElementCategoryProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface DraggableElementProps {
  element: ElementTemplate;
}

interface ElementTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  tagName: string;
  description: string;
  category: 'basic' | 'typography' | 'media' | 'forms' | 'layout' | 'navigation' | 'advanced';
  defaultProps: Partial<EnhancedElement>;
}

// Element templates
const ELEMENT_TEMPLATES: ElementTemplate[] = [
  // Basic Elements
  {
    id: 'div',
    name: 'Div Block',
    icon: Square,
    tagName: 'div',
    description: 'Generic container for layout and styling',
    category: 'basic',
    defaultProps: {
      tagName: 'div',
      classList: ['div-block'],
      styles: {
        base: {
          display: 'block',
          width: '100%',
          minHeight: '20px',
          backgroundColor: 'transparent',
        },
        responsive: {}
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },
  {
    id: 'section',
    name: 'Section',
    icon: Layers,
    tagName: 'section',
    description: 'Semantic section container',
    category: 'layout',
    defaultProps: {
      tagName: 'section',
      classList: ['section'],
      styles: {
        base: {
          display: 'block',
          width: '100%',
          padding: '60px 0',
        },
        responsive: {}
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },
  {
    id: 'container',
    name: 'Container',
    icon: Grid,
    tagName: 'div',
    description: 'Responsive container with max-width',
    category: 'layout',
    defaultProps: {
      tagName: 'div',
      classList: ['container'],
      styles: {
        base: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
        },
        responsive: {}
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },

  // Typography
  {
    id: 'heading-1',
    name: 'Heading 1',
    icon: Type,
    tagName: 'h1',
    description: 'Main page heading',
    category: 'typography',
    defaultProps: {
      tagName: 'h1',
      textContent: 'This is a heading',
      classList: ['heading-1'],
      styles: {
        base: {
          fontSize: '48px',
          fontWeight: 700,
          lineHeight: '1.2',
          marginBottom: '20px',
        },
        responsive: {
          md: { fontSize: '40px' },
          sm: { fontSize: '32px' }
        }
      },
      colSpan: { lg: 12, md: 12, sm: 12 },
      seo: {
        role: 'heading',
        ariaLabel: 'Main heading'
      }
    }
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    icon: Type,
    tagName: 'h2',
    description: 'Section heading',
    category: 'typography',
    defaultProps: {
      tagName: 'h2',
      textContent: 'This is a heading',
      classList: ['heading-2'],
      styles: {
        base: {
          fontSize: '36px',
          fontWeight: 600,
          lineHeight: '1.3',
          marginBottom: '16px',
        },
        responsive: {
          md: { fontSize: '32px' },
          sm: { fontSize: '28px' }
        }
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    icon: FileText,
    tagName: 'p',
    description: 'Text paragraph',
    category: 'typography',
    defaultProps: {
      tagName: 'p',
      textContent: 'This is a paragraph of text. You can edit this text by selecting it.',
      classList: ['paragraph'],
      styles: {
        base: {
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '16px',
        },
        responsive: {}
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },

  // Media
  {
    id: 'image',
    name: 'Image',
    icon: ImageIcon,
    tagName: 'img',
    description: 'Responsive image',
    category: 'media',
    defaultProps: {
      tagName: 'img',
      attributes: {
        src: '/api/placeholder/400/300',
        alt: 'Placeholder image'
      },
      classList: ['image'],
      styles: {
        base: {
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
        },
        responsive: {}
      },
      colSpan: { lg: 6, md: 6, sm: 12 },
      seo: {
        alt: 'Descriptive alt text for the image'
      }
    }
  },
  {
    id: 'video',
    name: 'Video',
    icon: Film,
    tagName: 'video',
    description: 'HTML5 video player',
    category: 'media',
    defaultProps: {
      tagName: 'video',
      attributes: {
        controls: 'true',
        preload: 'metadata'
      },
      classList: ['video'],
      styles: {
        base: {
          width: '100%',
          height: 'auto',
        },
        responsive: {}
      },
      colSpan: { lg: 8, md: 8, sm: 12 }
    }
  },

  // Interactive Elements
  {
    id: 'button',
    name: 'Button',
    icon: MousePointer,
    tagName: 'button',
    description: 'Interactive button',
    category: 'basic',
    defaultProps: {
      tagName: 'button',
      textContent: 'Button',
      attributes: {
        type: 'button'
      },
      classList: ['button'],
      styles: {
        base: {
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 500,
          cursor: 'pointer',
        },
        hover: {
          backgroundColor: '#2563eb',
        },
        responsive: {}
      },
      colSpan: { lg: 3, md: 4, sm: 6 }
    }
  },
  {
    id: 'link',
    name: 'Link',
    icon: Link,
    tagName: 'a',
    description: 'Text link',
    category: 'typography',
    defaultProps: {
      tagName: 'a',
      textContent: 'Link text',
      attributes: {
        href: '#'
      },
      classList: ['link'],
      styles: {
        base: {
          color: '#3b82f6',
          textDecoration: 'underline',
        },
        hover: {
          color: '#2563eb',
        },
        responsive: {}
      },
      colSpan: { lg: 3, md: 4, sm: 6 }
    }
  },

  // Form Elements
  {
    id: 'input-text',
    name: 'Text Input',
    icon: FileText,
    tagName: 'input',
    description: 'Text input field',
    category: 'forms',
    defaultProps: {
      tagName: 'input',
      attributes: {
        type: 'text',
        placeholder: 'Enter text...'
      },
      classList: ['input', 'text-input'],
      styles: {
        base: {
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '16px',
        },
        focus: {
          borderColor: '#3b82f6',
          outline: '2px solid #3b82f620',
        },
        responsive: {}
      },
      colSpan: { lg: 6, md: 8, sm: 12 }
    }
  },
  {
    id: 'textarea',
    name: 'Textarea',
    icon: FileText,
    tagName: 'textarea',
    description: 'Multi-line text input',
    category: 'forms',
    defaultProps: {
      tagName: 'textarea',
      attributes: {
        placeholder: 'Enter your message...',
        rows: '4'
      },
      classList: ['textarea'],
      styles: {
        base: {
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '16px',
          resize: 'vertical',
        },
        responsive: {}
      },
      colSpan: { lg: 8, md: 10, sm: 12 }
    }
  },

  // Layout Elements
  {
    id: 'flex-container',
    name: 'Flex Container',
    icon: Grid,
    tagName: 'div',
    description: 'Flexbox layout container',
    category: 'layout',
    defaultProps: {
      tagName: 'div',
      classList: ['flex-container'],
      styles: {
        base: {
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        },
        responsive: {
          sm: {
            flexDirection: 'column',
          }
        }
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },
  {
    id: 'grid-container',
    name: 'Grid Container',
    icon: Grid,
    tagName: 'div',
    description: 'CSS Grid layout container',
    category: 'layout',
    defaultProps: {
      tagName: 'div',
      classList: ['grid-container'],
      styles: {
        base: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        },
        responsive: {}
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  },

  // Navigation
  {
    id: 'nav',
    name: 'Navigation',
    icon: Navigation,
    tagName: 'nav',
    description: 'Navigation container',
    category: 'navigation',
    defaultProps: {
      tagName: 'nav',
      classList: ['navigation'],
      styles: {
        base: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
        },
        responsive: {}
      },
      colSpan: { lg: 12, md: 12, sm: 12 },
      seo: {
        role: 'navigation',
        ariaLabel: 'Main navigation'
      }
    }
  },
  {
    id: 'list',
    name: 'List',
    icon: List,
    tagName: 'ul',
    description: 'Unordered list',
    category: 'typography',
    defaultProps: {
      tagName: 'ul',
      innerHTML: '<li>List item 1</li><li>List item 2</li><li>List item 3</li>',
      classList: ['list'],
      styles: {
        base: {
          listStyle: 'disc',
          paddingLeft: '20px',
          marginBottom: '16px',
        },
        responsive: {}
      },
      colSpan: { lg: 6, md: 8, sm: 12 }
    }
  },

  // Advanced Elements
  {
    id: 'card',
    name: 'Card',
    icon: Square,
    tagName: 'div',
    description: 'Card container with shadow',
    category: 'advanced',
    defaultProps: {
      tagName: 'div',
      classList: ['card'],
      styles: {
        base: {
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        },
        hover: {
          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
        },
        responsive: {}
      },
      colSpan: { lg: 4, md: 6, sm: 12 }
    }
  },
  {
    id: 'hero-section',
    name: 'Hero Section',
    icon: Star,
    tagName: 'section',
    description: 'Hero banner section',
    category: 'advanced',
    defaultProps: {
      tagName: 'section',
      classList: ['hero-section'],
      styles: {
        base: {
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        },
        responsive: {
          sm: {
            minHeight: '400px',
          }
        }
      },
      colSpan: { lg: 12, md: 12, sm: 12 }
    }
  }
];

// Category mapping
const CATEGORIES = {
  basic: { name: 'Basic', icon: Square },
  typography: { name: 'Typography', icon: Type },
  media: { name: 'Media', icon: ImageIcon },
  forms: { name: 'Forms', icon: FileText },
  layout: { name: 'Layout', icon: Grid },
  navigation: { name: 'Navigation', icon: Navigation },
  advanced: { name: 'Advanced', icon: Star },
};

// Draggable Element Component
const DraggableElement: React.FC<DraggableElementProps> = ({ element }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'new-element',
    item: { 
      type: 'new-element',
      elementTemplate: element 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const Icon = element.icon;

  return (
    <div
      ref={drag}
      className={`flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-grab transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">{element.name}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{element.description}</p>
      </div>
    </div>
  );
};

// Element Category Component
const ElementCategory: React.FC<ElementCategoryProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">{title}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
    {isOpen && (
      <div className="p-3 pt-0 space-y-2 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// Main Elements Panel Component
const ElementsPanel: React.FC<ElementsPanelProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState({
    basic: true,
    typography: false,
    media: false,
    forms: false,
    layout: false,
    navigation: false,
    advanced: false,
  });

  // Filter elements based on search
  const filteredElements = ELEMENT_TEMPLATES.filter(element =>
    element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group elements by category
  const elementsByCategory = filteredElements.reduce((acc, element) => {
    if (!acc[element.category]) {
      acc[element.category] = [];
    }
    acc[element.category].push(element);
    return acc;
  }, {} as Record<string, ElementTemplate[]>);

  // Toggle category open/closed
  const toggleCategory = (category: keyof typeof openCategories) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Elements</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {searchTerm ? (
          // Show filtered results when searching
          <div className="space-y-2">
            {filteredElements.map((element) => (
              <DraggableElement key={element.id} element={element} />
            ))}
            {filteredElements.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No elements found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            )}
          </div>
        ) : (
          // Show categorized elements
          Object.entries(CATEGORIES).map(([categoryKey, categoryInfo]) => {
            const elements = elementsByCategory[categoryKey] || [];
            if (elements.length === 0) return null;

            return (
              <ElementCategory
                key={categoryKey}
                title={categoryInfo.name}
                icon={categoryInfo.icon}
                isOpen={openCategories[categoryKey as keyof typeof openCategories]}
                onToggle={() => toggleCategory(categoryKey as keyof typeof openCategories)}
              >
                {elements.map((element) => (
                  <DraggableElement key={element.id} element={element} />
                ))}
              </ElementCategory>
            );
          })
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="space-y-1">
            <li>• Drag elements to the canvas</li>
            <li>• Click to select and edit</li>
            <li>• Use the Style panel to customize</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { ElementsPanel };