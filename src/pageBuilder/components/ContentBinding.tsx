/**
 * Content Binding Component
 * Dynamic content binding system for connecting CMS data to page elements
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Link2, 
  Unlink2, 
  Database, 
  Search, 
  Filter, 
  Eye, 
  Code, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Check, 
  RefreshCw,
  AlertCircle,
  Info,
  Type,
  Image as ImageIcon,
  Calendar,
  Hash
} from 'lucide-react';
import { useEditorStore, type CMSCollection, type CMSField, type EnhancedElement } from '../store/EditorStore';

interface ContentBindingProps {
  className?: string;
}

interface BindingRule {
  id: string;
  elementId: string;
  elementProperty: 'textContent' | 'innerHTML' | 'src' | 'alt' | 'href' | 'style';
  collectionId: string;
  fieldId: string;
  filter?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: any;
  };
  transform?: {
    type: 'format' | 'truncate' | 'uppercase' | 'lowercase' | 'date';
    options?: any;
  };
  fallback?: string;
}

interface BindingSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface FieldSelectorProps {
  collections: CMSCollection[];
  selectedCollectionId?: string;
  selectedFieldId?: string;
  onCollectionChange: (collectionId: string) => void;
  onFieldChange: (fieldId: string) => void;
}

interface BindingEditorProps {
  binding: Partial<BindingRule>;
  onSave: (binding: BindingRule) => void;
  onCancel: () => void;
  element: EnhancedElement;
}

// Property options based on element type
const getElementProperties = (tagName: string): Array<{ value: string; label: string; description: string }> => {
  const commonProps = [
    { value: 'textContent', label: 'Text Content', description: 'Inner text of the element' },
    { value: 'innerHTML', label: 'HTML Content', description: 'Full HTML content' },
  ];

  switch (tagName.toLowerCase()) {
    case 'img':
      return [
        { value: 'src', label: 'Image Source', description: 'Image URL' },
        { value: 'alt', label: 'Alt Text', description: 'Alternative text for accessibility' },
        ...commonProps,
      ];
    case 'a':
      return [
        { value: 'href', label: 'Link URL', description: 'Destination URL' },
        ...commonProps,
      ];
    case 'video':
      return [
        { value: 'src', label: 'Video Source', description: 'Video URL' },
        ...commonProps,
      ];
    default:
      return commonProps;
  }
};

// Transform functions
const TRANSFORM_TYPES = [
  { value: 'format', label: 'Format', description: 'Apply custom formatting' },
  { value: 'truncate', label: 'Truncate', description: 'Limit text length' },
  { value: 'uppercase', label: 'Uppercase', description: 'Convert to uppercase' },
  { value: 'lowercase', label: 'Lowercase', description: 'Convert to lowercase' },
  { value: 'date', label: 'Date Format', description: 'Format date values' },
];

// Filter operators
const FILTER_OPERATORS = [
  { value: 'equals', label: 'Equals', description: 'Exact match' },
  { value: 'contains', label: 'Contains', description: 'Partial match' },
  { value: 'greater', label: 'Greater than', description: 'For numbers and dates' },
  { value: 'less', label: 'Less than', description: 'For numbers and dates' },
];

// Binding Section Component
const BindingSection: React.FC<BindingSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
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
      <div className="p-3 pt-0 space-y-3 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// Field Selector Component
const FieldSelector: React.FC<FieldSelectorProps> = ({
  collections,
  selectedCollectionId,
  selectedFieldId,
  onCollectionChange,
  onFieldChange
}) => {
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Collection</label>
        <select
          value={selectedCollectionId || ''}
          onChange={(e) => onCollectionChange(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select collection...</option>
          {collections.map(collection => (
            <option key={collection.id} value={collection.id}>
              {collection.name} ({collection.items.length} items)
            </option>
          ))}
        </select>
      </div>

      {selectedCollection && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
          <select
            value={selectedFieldId || ''}
            onChange={(e) => onFieldChange(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select field...</option>
            {selectedCollection.fields.map(field => (
              <option key={field.id} value={field.id}>
                {field.name} ({field.type})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

// Binding Editor Component
const BindingEditor: React.FC<BindingEditorProps> = ({ binding, onSave, onCancel, element }) => {
  const [editingBinding, setEditingBinding] = useState<Partial<BindingRule>>(binding);
  const { collections } = useEditorStore();

  const elementProperties = useMemo(() => getElementProperties(element.tagName), [element.tagName]);
  const selectedCollection = collections.find(c => c.id === editingBinding.collectionId);
  const selectedField = selectedCollection?.fields.find(f => f.id === editingBinding.fieldId);

  const handleSave = () => {
    if (editingBinding.collectionId && editingBinding.fieldId && editingBinding.elementProperty) {
      const savedBinding: BindingRule = {
        id: editingBinding.id || `binding_${Date.now()}`,
        elementId: element.id,
        elementProperty: editingBinding.elementProperty,
        collectionId: editingBinding.collectionId,
        fieldId: editingBinding.fieldId,
        filter: editingBinding.filter,
        transform: editingBinding.transform,
        fallback: editingBinding.fallback || '',
      };
      onSave(savedBinding);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Bind Content</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Element Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Element Property</label>
            <select
              value={editingBinding.elementProperty || ''}
              onChange={(e) => setEditingBinding({ ...editingBinding, elementProperty: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select property...</option>
              {elementProperties.map(prop => (
                <option key={prop.value} value={prop.value}>
                  {prop.label} - {prop.description}
                </option>
              ))}
            </select>
          </div>

          {/* Collection and Field */}
          <FieldSelector
            collections={collections}
            selectedCollectionId={editingBinding.collectionId}
            selectedFieldId={editingBinding.fieldId}
            onCollectionChange={(collectionId) => setEditingBinding({ ...editingBinding, collectionId })}
            onFieldChange={(fieldId) => setEditingBinding({ ...editingBinding, fieldId })}
          />

          {/* Preview */}
          {selectedCollection && selectedField && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Binding Preview</span>
              </div>
              <div className="text-xs text-blue-700">
                <div>Collection: <strong>{selectedCollection.name}</strong></div>
                <div>Field: <strong>{selectedField.name}</strong> ({selectedField.type})</div>
                <div>Property: <strong>{editingBinding.elementProperty}</strong></div>
              </div>
            </div>
          )}

          {/* Filter (Optional) */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={!!editingBinding.filter}
                onChange={(e) => setEditingBinding({
                  ...editingBinding,
                  filter: e.target.checked ? { field: '', operator: 'equals', value: '' } : undefined
                })}
                className="rounded border-gray-300"
              />
              <span>Add Filter</span>
            </label>
            
            {editingBinding.filter && selectedCollection && (
              <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Field</label>
                    <select
                      value={editingBinding.filter.field}
                      onChange={(e) => setEditingBinding({
                        ...editingBinding,
                        filter: { ...editingBinding.filter!, field: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">Select field...</option>
                      {selectedCollection.fields.map(field => (
                        <option key={field.id} value={field.slug}>{field.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Operator</label>
                    <select
                      value={editingBinding.filter.operator}
                      onChange={(e) => setEditingBinding({
                        ...editingBinding,
                        filter: { ...editingBinding.filter!, operator: e.target.value as any }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      {FILTER_OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    value={editingBinding.filter.value}
                    onChange={(e) => setEditingBinding({
                      ...editingBinding,
                      filter: { ...editingBinding.filter!, value: e.target.value }
                    })}
                    placeholder="Filter value"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Transform (Optional) */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={!!editingBinding.transform}
                onChange={(e) => setEditingBinding({
                  ...editingBinding,
                  transform: e.target.checked ? { type: 'format' } : undefined
                })}
                className="rounded border-gray-300"
              />
              <span>Add Transform</span>
            </label>
            
            {editingBinding.transform && (
              <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Transform Type</label>
                  <select
                    value={editingBinding.transform.type}
                    onChange={(e) => setEditingBinding({
                      ...editingBinding,
                      transform: { ...editingBinding.transform!, type: e.target.value as any }
                    })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    {TRANSFORM_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                {editingBinding.transform.type === 'truncate' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Length</label>
                    <input
                      type="number"
                      value={editingBinding.transform.options?.maxLength || 100}
                      onChange={(e) => setEditingBinding({
                        ...editingBinding,
                        transform: {
                          ...editingBinding.transform!,
                          options: { maxLength: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fallback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fallback Text</label>
            <input
              type="text"
              value={editingBinding.fallback || ''}
              onChange={(e) => setEditingBinding({ ...editingBinding, fallback: e.target.value })}
              placeholder="Text to show if data is missing"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editingBinding.collectionId || !editingBinding.fieldId || !editingBinding.elementProperty}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Create Binding
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Content Binding Component
const ContentBinding: React.FC<ContentBindingProps> = ({ className }) => {
  const {
    selectedElementId,
    document,
    collections,
    updateElement,
  } = useEditorStore();

  const [openSections, setOpenSections] = useState({
    current: true,
    available: false,
    templates: false,
  });

  const [showBindingEditor, setShowBindingEditor] = useState(false);
  const [editingBinding, setEditingBinding] = useState<Partial<BindingRule> | null>(null);

  // Get selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId || !document) return null;
    
    for (const section of document.sections) {
      for (const row of section.rows) {
        const widget = row.widgets.find(w => w.id === selectedElementId);
        if (widget) return widget as EnhancedElement;
      }
    }
    return null;
  }, [selectedElementId, document]);

  // Get current bindings for selected element
  const currentBindings = useMemo(() => {
    // This would come from the element's data bindings
    // For now, returning empty array as example
    return [];
  }, [selectedElement]);

  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Create new binding
  const handleCreateBinding = useCallback(() => {
    if (selectedElement) {
      setEditingBinding({});
      setShowBindingEditor(true);
    }
  }, [selectedElement]);

  // Save binding
  const handleSaveBinding = useCallback((binding: BindingRule) => {
    if (selectedElement) {
      // Update element with binding information
      const updates = {
        dataBindings: {
          ...selectedElement.dataBindings,
          [binding.elementProperty]: binding,
        }
      };
      
      updateElement(selectedElement.id, updates);
      setShowBindingEditor(false);
      setEditingBinding(null);
    }
  }, [selectedElement, updateElement]);

  // Remove binding
  const handleRemoveBinding = useCallback((property: string) => {
    if (selectedElement) {
      const bindings = { ...selectedElement.dataBindings };
      delete bindings[property];
      
      updateElement(selectedElement.id, { dataBindings: bindings });
    }
  }, [selectedElement, updateElement]);

  if (!selectedElement) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-medium mb-1">No Element Selected</h3>
          <p className="text-xs">Select an element to bind dynamic content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Content Binding</h2>
          <button
            onClick={handleCreateBinding}
            disabled={collections.length === 0}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50"
          >
            <Link2 className="w-3 h-3 mr-1 inline" />
            Bind
          </button>
        </div>
        <div className="text-xs text-gray-600">
          Element: <span className="font-medium">{selectedElement.tagName}</span>
          {selectedElement.classList.length > 0 && (
            <span className="text-blue-600 ml-1">
              .{selectedElement.classList.join('.')}
            </span>
          )}
        </div>
      </div>

      {/* Binding Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Current Bindings */}
        <BindingSection
          title="Current Bindings"
          icon={Link2}
          isOpen={openSections.current}
          onToggle={() => toggleSection('current')}
        >
          {currentBindings.length > 0 ? (
            <div className="space-y-2">
              {currentBindings.map((binding: any, index) => (
                <div key={index} className="p-2 border border-gray-200 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{binding.elementProperty}</div>
                      <div className="text-xs text-gray-500">
                        {collections.find(c => c.id === binding.collectionId)?.name} → 
                        {collections.find(c => c.id === binding.collectionId)?.fields.find(f => f.id === binding.fieldId)?.name}
                      </div>
                      {binding.filter && (
                        <div className="text-xs text-blue-600">Filtered</div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingBinding(binding);
                          setShowBindingEditor(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveBinding(binding.elementProperty)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Unlink2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Unlink2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No bindings yet</p>
              <p className="text-xs text-gray-400">Click 'Bind' to connect CMS data</p>
            </div>
          )}
        </BindingSection>

        {/* Available Collections */}
        <BindingSection
          title="Available Collections"
          icon={Database}
          isOpen={openSections.available}
          onToggle={() => toggleSection('available')}
        >
          {collections.length > 0 ? (
            <div className="space-y-2">
              {collections.map(collection => (
                <div key={collection.id} className="p-2 border border-gray-200 rounded">
                  <div className="text-sm font-medium text-gray-800">{collection.name}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {collection.fields.length} fields • {collection.items.length} items
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {collection.fields.slice(0, 3).map(field => (
                      <span key={field.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {field.name}
                      </span>
                    ))}
                    {collection.fields.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                        +{collection.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No collections yet</p>
              <p className="text-xs text-gray-400">Create collections in the CMS panel</p>
            </div>
          )}
        </BindingSection>

        {/* Binding Templates */}
        <BindingSection
          title="Quick Templates"
          icon={RefreshCw}
          isOpen={openSections.templates}
          onToggle={() => toggleSection('templates')}
        >
          <div className="space-y-2">
            <button
              onClick={() => {
                // Quick template for text content
                setEditingBinding({ elementProperty: 'textContent' });
                setShowBindingEditor(true);
              }}
              className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-sm font-medium text-gray-800">Text Content</div>
              <div className="text-xs text-gray-500">Bind text from CMS field</div>
            </button>
            
            {selectedElement.tagName.toLowerCase() === 'img' && (
              <button
                onClick={() => {
                  setEditingBinding({ elementProperty: 'src' });
                  setShowBindingEditor(true);
                }}
                className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="text-sm font-medium text-gray-800">Image Source</div>
                <div className="text-xs text-gray-500">Bind image URL from CMS</div>
              </button>
            )}
            
            {selectedElement.tagName.toLowerCase() === 'a' && (
              <button
                onClick={() => {
                  setEditingBinding({ elementProperty: 'href' });
                  setShowBindingEditor(true);
                }}
                className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="text-sm font-medium text-gray-800">Link URL</div>
                <div className="text-xs text-gray-500">Bind link destination from CMS</div>
              </button>
            )}
          </div>
        </BindingSection>
      </div>

      {/* Binding Editor Modal */}
      {showBindingEditor && editingBinding && (
        <BindingEditor
          binding={editingBinding}
          onSave={handleSaveBinding}
          onCancel={() => {
            setShowBindingEditor(false);
            setEditingBinding(null);
          }}
          element={selectedElement}
        />
      )}

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Content Binding Tips:</p>
          <ul className="space-y-1">
            <li>• Connect CMS data to element properties</li>
            <li>• Use filters to show specific content</li>
            <li>• Add transforms for formatting</li>
            <li>• Set fallbacks for missing data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentBinding;