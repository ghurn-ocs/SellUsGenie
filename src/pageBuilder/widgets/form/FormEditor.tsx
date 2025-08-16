/**
 * Form Editor Component
 */

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Settings, Eye, Code, Move, Copy } from 'lucide-react';
import type { WidgetEditorProps } from '../../types';
import type { FormProps, FormField } from './index';

export const FormEditor: React.FC<WidgetEditorProps> = ({ widget, onChange, onDelete, onDuplicate }) => {
  const props = widget.props as FormProps;
  const [activeTab, setActiveTab] = useState<'fields' | 'styling' | 'actions' | 'advanced'>('fields');
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const updateProps = useCallback((updates: Partial<FormProps>) => {
    onChange({
      props: { ...props, ...updates }
    });
  }, [props, onChange]);

  const addField = useCallback(() => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
      width: 'full',
    };
    
    updateProps({
      fields: [...props.fields, newField]
    });
  }, [props.fields, updateProps]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = props.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    updateProps({ fields: updatedFields });
  }, [props.fields, updateProps]);

  const removeField = useCallback((fieldId: string) => {
    const updatedFields = props.fields.filter(field => field.id !== fieldId);
    updateProps({ fields: updatedFields });
  }, [props.fields, updateProps]);

  const duplicateField = useCallback((field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
    };
    
    const fieldIndex = props.fields.findIndex(f => f.id === field.id);
    const newFields = [...props.fields];
    newFields.splice(fieldIndex + 1, 0, duplicatedField);
    
    updateProps({ fields: newFields });
  }, [props.fields, updateProps]);

  const moveField = useCallback((fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = props.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;
    
    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= props.fields.length) return;
    
    const newFields = [...props.fields];
    [newFields[fieldIndex], newFields[newIndex]] = [newFields[newIndex], newFields[fieldIndex]];
    
    updateProps({ fields: newFields });
  }, [props.fields, updateProps]);

  const renderFieldEditor = (field: FormField) => (
    <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{field.label || 'Untitled Field'}</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => moveField(field.id, 'up')}
            disabled={props.fields[0].id === field.id}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            onClick={() => moveField(field.id, 'down')}
            disabled={props.fields[props.fields.length - 1].id === field.id}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            onClick={() => duplicateField(field)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeField(field.id)}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
          <select
            value={field.type}
            onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="number">Number</option>
            <option value="url">URL</option>
            <option value="password">Password</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="date">Date</option>
            <option value="file">File</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <select
            value={field.width || 'full'}
            onChange={(e) => updateField(field.id, { width: e.target.value as FormField['width'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="full">Full Width</option>
            <option value="half">Half Width</option>
            <option value="third">One Third</option>
            <option value="quarter">One Quarter</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Value"
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = { ...option, value: e.target.value };
                      updateField(field.id, { options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[index] = { ...option, label: e.target.value };
                      updateField(field.id, { options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options?.filter((_, i) => i !== index) || [];
                      updateField(field.id, { options: newOptions });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(field.options || []), { value: '', label: '' }];
                  updateField(field.id, { options: newOptions });
                }}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-600"
              >
                Add Option
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
          <input
            type="text"
            value={field.helpText || ''}
            onChange={(e) => updateField(field.id, { helpText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Form Fields</h3>
        <button
          onClick={addField}
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Field</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
          <input
            type="text"
            value={props.title || ''}
            onChange={(e) => updateProps({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={props.description || ''}
            onChange={(e) => updateProps({ description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {props.fields.map(renderFieldEditor)}
      </div>
    </div>
  );

  const renderStylingTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
        <select
          value={props.styling.layout}
          onChange={(e) => updateProps({ 
            styling: { ...props.styling, layout: e.target.value as FormProps['styling']['layout'] }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="stacked">Stacked</option>
          <option value="inline">Inline</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Field Style</label>
        <select
          value={props.styling.fieldStyle}
          onChange={(e) => updateProps({ 
            styling: { ...props.styling, fieldStyle: e.target.value as FormProps['styling']['fieldStyle'] }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="outlined">Outlined</option>
          <option value="filled">Filled</option>
          <option value="underlined">Underlined</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
        <select
          value={props.styling.spacing}
          onChange={(e) => updateProps({ 
            styling: { ...props.styling, spacing: e.target.value as FormProps['styling']['spacing'] }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="loose">Loose</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.styling.showLabels}
            onChange={(e) => updateProps({ 
              styling: { ...props.styling, showLabels: e.target.checked }
            })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Show labels</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.styling.showPlaceholders}
            onChange={(e) => updateProps({ 
              styling: { ...props.styling, showPlaceholders: e.target.checked }
            })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Show placeholders</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.styling.showRequiredIndicator}
            onChange={(e) => updateProps({ 
              styling: { ...props.styling, showRequiredIndicator: e.target.checked }
            })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Show required indicator</span>
        </label>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Submit Button</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={props.submitButton.text}
              onChange={(e) => updateProps({ 
                submitButton: { ...props.submitButton, text: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                value={props.submitButton.style}
                onChange={(e) => updateProps({ 
                  submitButton: { ...props.submitButton, style: e.target.value as FormProps['submitButton']['style'] }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                value={props.submitButton.size}
                onChange={(e) => updateProps({ 
                  submitButton: { ...props.submitButton, size: e.target.value as FormProps['submitButton']['size'] }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.submitButton.fullWidth}
              onChange={(e) => updateProps({ 
                submitButton: { ...props.submitButton, fullWidth: e.target.checked }
              })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Full width</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Action on Submit</label>
        <select
          value={props.actions.onSubmit}
          onChange={(e) => updateProps({ 
            actions: { ...props.actions, onSubmit: e.target.value as FormProps['actions']['onSubmit'] }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="email">Send Email</option>
          <option value="webhook">Webhook</option>
          <option value="redirect">Redirect</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {props.actions.onSubmit === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email To</label>
          <input
            type="email"
            value={props.actions.emailTo || ''}
            onChange={(e) => updateProps({ 
              actions: { ...props.actions, emailTo: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {props.actions.onSubmit === 'webhook' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input
            type="url"
            value={props.actions.webhookUrl || ''}
            onChange={(e) => updateProps({ 
              actions: { ...props.actions, webhookUrl: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {props.actions.onSubmit === 'redirect' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
          <input
            type="url"
            value={props.actions.redirectUrl || ''}
            onChange={(e) => updateProps({ 
              actions: { ...props.actions, redirectUrl: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
        <textarea
          value={props.actions.successMessage || ''}
          onChange={(e) => updateProps({ 
            actions: { ...props.actions, successMessage: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Error Message</label>
        <textarea
          value={props.actions.errorMessage || ''}
          onChange={(e) => updateProps({ 
            actions: { ...props.actions, errorMessage: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Validation</h4>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.validation.validateOnBlur}
            onChange={(e) => updateProps({ 
              validation: { ...props.validation, validateOnBlur: e.target.checked }
            })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Validate on blur</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.validation.validateOnChange}
            onChange={(e) => updateProps({ 
              validation: { ...props.validation, validateOnChange: e.target.checked }
            })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Validate on change</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.validation.showErrorsInline}
            onChange={(e) => updateProps({ 
              validation: { ...props.validation, showErrorsInline: e.target.checked }
            })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Show errors inline</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Form Settings</h3>
        <div className="flex space-x-2">
          <button
            onClick={onDuplicate}
            className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Duplicate
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'fields', label: 'Fields' },
          { id: 'styling', label: 'Style' },
          { id: 'actions', label: 'Actions' },
          { id: 'advanced', label: 'Advanced' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'fields' && renderFieldsTab()}
        {activeTab === 'styling' && renderStylingTab()}
        {activeTab === 'actions' && renderActionsTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>
    </div>
  );
};