/**
 * CMS Panel Component
 * Advanced Content Management System for dynamic content collections
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Search, 
  Filter, 
  Sort, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Calendar, 
  Type, 
  Image as ImageIcon, 
  Hash, 
  ToggleLeft, 
  List, 
  ChevronDown, 
  ChevronRight, 
  Save, 
  X,
  FileText,
  Link,
  Settings
} from 'lucide-react';
import { useEditorStore, type CMSCollection, type CMSField, type CMSItem } from '../store/EditorStore';

interface CMSPanelProps {
  className?: string;
}

interface CMSSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

interface FieldEditorProps {
  field: Partial<CMSField>;
  onSave: (field: CMSField) => void;
  onCancel: () => void;
  isEditing: boolean;
}

interface ItemEditorProps {
  collection: CMSCollection;
  item?: CMSItem;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
}

// Field type configurations
const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type, description: 'Single line text' },
  { value: 'textarea', label: 'Textarea', icon: FileText, description: 'Multi-line text' },
  { value: 'richtext', label: 'Rich Text', icon: Edit3, description: 'Formatted text editor' },
  { value: 'image', label: 'Image', icon: ImageIcon, description: 'Image upload' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric value' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'boolean', label: 'Boolean', icon: ToggleLeft, description: 'True/false toggle' },
  { value: 'select', label: 'Select', icon: List, description: 'Dropdown selection' },
  { value: 'multiselect', label: 'Multi-select', icon: List, description: 'Multiple selections' },
];

// CMS Section Component
const CMSSection: React.FC<CMSSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children, actions }) => (
  <div className="border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
      <button onClick={onToggle} className="flex items-center space-x-2 flex-1">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
      </button>
      {actions && <div className="ml-2">{actions}</div>}
    </div>
    {isOpen && (
      <div className="p-3 pt-0 space-y-3 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// Field Editor Component
const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel, isEditing }) => {
  const [editingField, setEditingField] = useState<Partial<CMSField>>(field);

  const handleSave = () => {
    if (editingField.name && editingField.type) {
      const savedField: CMSField = {
        id: editingField.id || `field_${Date.now()}`,
        name: editingField.name,
        slug: editingField.slug || editingField.name.toLowerCase().replace(/\s+/g, '-'),
        type: editingField.type,
        required: editingField.required || false,
        options: editingField.options || [],
        validation: editingField.validation || {},
      };
      onSave(savedField);
    }
  };

  const selectedFieldType = FIELD_TYPES.find(type => type.value === editingField.type);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-800">
          {isEditing ? 'Edit Field' : 'Add New Field'}
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!editingField.name || !editingField.type}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-3 h-3 mr-1 inline" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            <X className="w-3 h-3 mr-1 inline" />
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
          <input
            type="text"
            value={editingField.name || ''}
            onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
            placeholder="e.g., Title, Description"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Field Type</label>
          <select
            value={editingField.type || ''}
            onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select type...</option>
            {FIELD_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedFieldType && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          <strong>{selectedFieldType.label}:</strong> {selectedFieldType.description}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 text-xs">
          <input
            type="checkbox"
            checked={editingField.required || false}
            onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span>Required field</span>
        </label>
      </div>

      {(editingField.type === 'select' || editingField.type === 'multiselect') && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Options (one per line)</label>
          <textarea
            value={editingField.options?.join('\n') || ''}
            onChange={(e) => setEditingField({ 
              ...editingField, 
              options: e.target.value.split('\n').filter(opt => opt.trim()) 
            })}
            placeholder="Option 1\nOption 2\nOption 3"
            rows={3}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};

// Item Editor Component
const ItemEditor: React.FC<ItemEditorProps> = ({ collection, item, onSave, onCancel }) => {
  const [itemData, setItemData] = useState<Record<string, any>>(item?.data || {});

  const handleFieldChange = (fieldSlug: string, value: any) => {
    setItemData(prev => ({ ...prev, [fieldSlug]: value }));
  };

  const handleSave = () => {
    onSave(itemData);
  };

  const renderFieldInput = (field: CMSField) => {
    const value = itemData[field.slug] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.slug, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.slug, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.slug, parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.slug, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.slug, e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.slug, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={value}
              onChange={(e) => handleFieldChange(field.slug, e.target.value)}
              placeholder="Image URL"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {value && (
              <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded border" />
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.slug, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {item ? 'Edit' : 'Add'} {collection.name} Item
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {collection.fields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderFieldInput(field)}
            </div>
          ))}
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {item ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main CMS Panel Component
const CMSPanel: React.FC<CMSPanelProps> = ({ className }) => {
  const {
    collections,
    activeCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
  } = useEditorStore();

  const [openSections, setOpenSections] = useState({
    collections: true,
    fields: false,
    items: false,
  });

  const [editingField, setEditingField] = useState<Partial<CMSField> | null>(null);
  const [editingItem, setEditingItem] = useState<{ collection: CMSCollection; item?: CMSItem } | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get active collection data
  const currentCollection = useMemo(() => {
    return collections.find(c => c.id === activeCollection);
  }, [collections, activeCollection]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!currentCollection || !searchTerm) {
      return currentCollection?.items || [];
    }
    
    return currentCollection.items.filter(item =>
      Object.values(item.data).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [currentCollection, searchTerm]);

  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Create new collection
  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection({
        name: newCollectionName,
        slug: newCollectionName.toLowerCase().replace(/\s+/g, '-'),
        fields: [],
        items: [],
      });
      setNewCollectionName('');
      setShowNewCollection(false);
    }
  };

  // Add field to collection
  const handleAddField = (field: CMSField) => {
    if (currentCollection) {
      updateCollection(currentCollection.id, {
        fields: [...currentCollection.fields, field]
      });
    }
    setEditingField(null);
  };

  // Update field in collection
  const handleUpdateField = (field: CMSField) => {
    if (currentCollection) {
      updateCollection(currentCollection.id, {
        fields: currentCollection.fields.map(f => f.id === field.id ? field : f)
      });
    }
    setEditingField(null);
  };

  // Delete field from collection
  const handleDeleteField = (fieldId: string) => {
    if (currentCollection) {
      updateCollection(currentCollection.id, {
        fields: currentCollection.fields.filter(f => f.id !== fieldId)
      });
    }
  };

  // Add item to collection
  const handleAddItem = (data: Record<string, any>) => {
    if (currentCollection) {
      addCollectionItem(currentCollection.id, data);
    }
    setEditingItem(null);
  };

  // Update item in collection
  const handleUpdateItem = (data: Record<string, any>) => {
    if (currentCollection && editingItem?.item) {
      updateCollectionItem(currentCollection.id, editingItem.item.id, data);
    }
    setEditingItem(null);
  };

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">CMS</h2>
          <button
            onClick={() => setShowNewCollection(true)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
          >
            <Plus className="w-3 h-3 mr-1 inline" />
            New
          </button>
        </div>
        <div className="text-xs text-gray-600">
          Manage dynamic content collections
        </div>
      </div>

      {/* CMS Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Collections Section */}
        <CMSSection
          title="Collections"
          icon={Database}
          isOpen={openSections.collections}
          onToggle={() => toggleSection('collections')}
        >
          {showNewCollection && (
            <div className="p-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCollection()}
                />
                <button
                  onClick={handleCreateCollection}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowNewCollection(false)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {collections.map(collection => (
              <div
                key={collection.id}
                className={`p-2 border border-gray-200 rounded cursor-pointer hover:border-blue-300 ${
                  activeCollection === collection.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  // Set active collection logic would go here
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{collection.name}</div>
                    <div className="text-xs text-gray-500">
                      {collection.fields.length} fields • {collection.items.length} items
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit collection logic
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(collection.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {collections.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No collections yet</p>
                <p className="text-xs text-gray-400">Create your first collection above</p>
              </div>
            )}
          </div>
        </CMSSection>

        {/* Fields Section */}
        {currentCollection && (
          <CMSSection
            title={`${currentCollection.name} Fields`}
            icon={Settings}
            isOpen={openSections.fields}
            onToggle={() => toggleSection('fields')}
            actions={
              <button
                onClick={() => setEditingField({})}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            }
          >
            {editingField && (
              <FieldEditor
                field={editingField}
                onSave={editingField.id ? handleUpdateField : handleAddField}
                onCancel={() => setEditingField(null)}
                isEditing={!!editingField.id}
              />
            )}

            <div className="space-y-2">
              {currentCollection.fields.map(field => {
                const fieldType = FIELD_TYPES.find(type => type.value === field.type);
                const Icon = fieldType?.icon || Type;
                
                return (
                  <div key={field.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{field.name}</div>
                        <div className="text-xs text-gray-500">
                          {fieldType?.label} {field.required && '• Required'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingField(field)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentCollection.fields.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No fields defined</p>
                  <p className="text-xs text-gray-400">Add fields to structure your content</p>
                </div>
              )}
            </div>
          </CMSSection>
        )}

        {/* Items Section */}
        {currentCollection && currentCollection.fields.length > 0 && (
          <CMSSection
            title={`${currentCollection.name} Items`}
            icon={List}
            isOpen={openSections.items}
            onToggle={() => toggleSection('items')}
            actions={
              <button
                onClick={() => setEditingItem({ collection: currentCollection })}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            }
          >
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredItems.map(item => (
                <div key={item.id} className="p-2 border border-gray-200 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {currentCollection.fields.slice(0, 2).map(field => (
                        <div key={field.id} className="text-xs truncate">
                          <span className="font-medium text-gray-600">{field.name}:</span>
                          <span className="ml-1 text-gray-800">
                            {String(item.data[field.slug] || '—')}
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-500 mt-1">
                        {item.published ? 'Published' : 'Draft'} • {new Date(item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => setEditingItem({ collection: currentCollection, item })}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteCollectionItem(currentCollection.id, item.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <List className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">
                    {searchTerm ? 'No items found' : 'No items yet'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {searchTerm ? 'Try a different search' : 'Add your first item above'}
                  </p>
                </div>
              )}
            </div>
          </CMSSection>
        )}
      </div>

      {/* Item Editor Modal */}
      {editingItem && (
        <ItemEditor
          collection={editingItem.collection}
          item={editingItem.item}
          onSave={editingItem.item ? handleUpdateItem : handleAddItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">CMS Guide:</p>
          <ul className="space-y-1">
            <li>• Create collections to organize content</li>
            <li>• Define fields to structure data</li>
            <li>• Add items to populate content</li>
            <li>• Bind content to page elements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CMSPanel;