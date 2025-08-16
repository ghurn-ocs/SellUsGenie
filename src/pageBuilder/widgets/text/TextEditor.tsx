/**
 * Text Widget Editor
 * Form interface for editing text widget properties
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WidgetEditorProps } from '../../types';
import { textSchema, TextProps } from './index';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Bold,
  Italic,
  Underline,
  Trash2,
  Copy
} from 'lucide-react';

export const TextEditor: React.FC<WidgetEditorProps> = ({ 
  widget, 
  onChange, 
  onDelete, 
  onDuplicate 
}) => {
  const props = widget.props as TextProps;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<TextProps>({
    resolver: zodResolver(textSchema),
    defaultValues: props
  });

  const watchedContent = watch('content');
  const watchedTextAlign = watch('textAlign');
  const watchedFontSize = watch('fontSize');
  const watchedFontWeight = watch('fontWeight');

  const handleChange = (field: keyof TextProps, value: any) => {
    setValue(field, value);
    const updatedProps = { ...props, [field]: value };
    onChange({ props: updatedProps });
  };

  const textAlignOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
    { value: 'justify', icon: AlignJustify, label: 'Justify' }
  ];

  const fontSizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'base', label: 'Base' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: '2XL' },
    { value: '3xl', label: '3XL' },
    { value: '4xl', label: '4XL' },
    { value: '5xl', label: '5XL' },
    { value: '6xl', label: '6XL' }
  ];

  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semibold' },
    { value: 'bold', label: 'Bold' }
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Text Widget</h3>
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

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          {...register('content')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your text content..."
          onChange={(e) => handleChange('content', e.target.value)}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Alignment
        </label>
        <div className="flex space-x-1">
          {textAlignOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('textAlign', option.value)}
                className={`p-2 rounded border ${
                  watchedTextAlign === option.value
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title={option.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size
        </label>
        <select
          {...register('fontSize')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onChange={(e) => handleChange('fontSize', e.target.value)}
        >
          {fontSizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Weight
        </label>
        <select
          {...register('fontWeight')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onChange={(e) => handleChange('fontWeight', e.target.value)}
        >
          {fontWeightOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <select
          {...register('color')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onChange={(e) => handleChange('color', e.target.value)}
        >
          <option value="text-gray-900">Dark Gray</option>
          <option value="text-gray-700">Medium Gray</option>
          <option value="text-gray-500">Light Gray</option>
          <option value="text-primary-600">Primary</option>
          <option value="text-white">White</option>
          <option value="text-black">Black</option>
        </select>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Height
        </label>
        <select
          {...register('lineHeight')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onChange={(e) => handleChange('lineHeight', e.target.value)}
        >
          <option value="tight">Tight</option>
          <option value="snug">Snug</option>
          <option value="normal">Normal</option>
          <option value="relaxed">Relaxed</option>
          <option value="loose">Loose</option>
        </select>
      </div>

      {/* Max Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Width (optional)
        </label>
        <input
          type="text"
          {...register('maxWidth')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., max-w-2xl, max-w-md"
          onChange={(e) => handleChange('maxWidth', e.target.value)}
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
          <div
            className={`${watchedColor} ${watchedFontSize} ${watchedFontWeight} text-${watchedTextAlign} leading-${props.lineHeight} ${
              props.maxWidth || ''
            }`}
          >
            {watchedContent || 'Preview text will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
};

