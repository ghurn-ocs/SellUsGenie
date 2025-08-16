/**
 * Button Widget Editor
 * Form interface for editing button widget properties
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WidgetEditorProps } from '../../types';
import { buttonSchema, ButtonProps } from './index';
import { 
  MousePointer,
  ExternalLink,
  Link,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ButtonEditor: React.FC<WidgetEditorProps> = ({ 
  widget, 
  onChange, 
  onDelete, 
  onDuplicate 
}) => {
  const props = widget.props as ButtonProps;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ButtonProps>({
    resolver: zodResolver(buttonSchema),
    defaultValues: props
  });

  const watchedLabel = watch('label');
  const watchedVariant = watch('variant');
  const watchedSize = watch('size');
  const watchedFullWidth = watch('fullWidth');

  const handleChange = (field: keyof ButtonProps, value: any) => {
    setValue(field, value);
    const updatedProps = { ...props, [field]: value };
    onChange({ props: updatedProps });
  };

  const variantOptions = [
    { value: 'primary', label: 'Primary', className: 'bg-primary-600 text-white hover:bg-primary-700' },
    { value: 'secondary', label: 'Secondary', className: 'bg-gray-600 text-white hover:bg-gray-700' },
    { value: 'outline', label: 'Outline', className: 'border border-gray-300 text-gray-700 hover:bg-gray-50' },
    { value: 'ghost', label: 'Ghost', className: 'text-gray-700 hover:bg-gray-100' },
    { value: 'link', label: 'Link', className: 'text-primary-600 hover:text-primary-700 underline' }
  ];

  const sizeOptions = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' }
  ];

  const getButtonClasses = () => {
    const variant = variantOptions.find(v => v.value === watchedVariant);
    const sizeClass = watchedSize === 'sm' ? 'px-3 py-1.5 text-sm' : 
                     watchedSize === 'lg' ? 'px-6 py-3 text-lg' : 
                     'px-4 py-2 text-base';
    const widthClass = watchedFullWidth ? 'w-full' : '';
    
    return `inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variant?.className} ${sizeClass} ${widthClass}`;
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MousePointer className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Button Widget</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onDuplicate}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Duplicate widget"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete widget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Button Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Text
        </label>
        <input
          type="text"
          {...register('label')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter button text..."
          onChange={(e) => handleChange('label', e.target.value)}
        />
        {errors.label && (
          <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
        )}
      </div>

      {/* Link URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link URL (optional)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="url"
            {...register('href')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com"
            onChange={(e) => handleChange('href', e.target.value)}
          />
          <button
            type="button"
            onClick={() => handleChange('openInNewTab', !props.openInNewTab)}
            className={`p-2 rounded border ${
              props.openInNewTab
                ? 'bg-primary-100 border-primary-500 text-primary-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Button Variant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {variantOptions.map((variant) => (
            <button
              key={variant.value}
              type="button"
              onClick={() => handleChange('variant', variant.value)}
              className={`p-3 rounded-lg border text-left ${
                watchedVariant === variant.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${variant.className}`}>
                {variant.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Button Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Size
        </label>
        <select
          {...register('size')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onChange={(e) => handleChange('size', e.target.value)}
        >
          {sizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Full Width Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Full Width
        </label>
        <button
          type="button"
          onClick={() => handleChange('fullWidth', !watchedFullWidth)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            watchedFullWidth ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              watchedFullWidth ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Icon Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon (optional)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            {...register('icon')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Icon name (e.g., arrow-right)"
            onChange={(e) => handleChange('icon', e.target.value)}
          />
          <select
            {...register('iconPosition')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onChange={(e) => handleChange('iconPosition', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {/* Disabled State */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Disabled
        </label>
        <button
          type="button"
          onClick={() => handleChange('disabled', !props.disabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            props.disabled ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              props.disabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Custom Action */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Action (optional)
        </label>
        <input
          type="text"
          {...register('onClick')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Custom JavaScript action"
          onChange={(e) => handleChange('onClick', e.target.value)}
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <button
            type="button"
            className={getButtonClasses()}
            disabled={props.disabled}
          >
            {props.icon && props.iconPosition === 'left' && (
              <span className="mr-2">🔗</span>
            )}
            {watchedLabel || 'Button Preview'}
            {props.icon && props.iconPosition === 'right' && (
              <span className="ml-2">🔗</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

