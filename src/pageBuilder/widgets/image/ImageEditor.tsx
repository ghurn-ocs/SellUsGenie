/**
 * Image Widget Editor
 * Form for editing image widget properties
 */

import React, { useCallback } from 'react';
import type { WidgetEditorProps } from '../../types';
import type { ImageProps } from './index';

export const ImageEditor: React.FC<WidgetEditorProps> = ({ widget, onChange, onDelete, onDuplicate }) => {
  const props = widget.props as ImageProps;

  const updateProps = useCallback((updates: Partial<ImageProps>) => {
    onChange({
      props: { ...props, ...updates }
    });
  }, [props, onChange]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Image Settings</h3>
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={props.src}
            onChange={(e) => updateProps({ src: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alt Text
          </label>
          <input
            type="text"
            value={props.alt}
            onChange={(e) => updateProps({ alt: e.target.value })}
            placeholder="Describe the image for accessibility"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              value={props.width || ''}
              onChange={(e) => updateProps({ width: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Auto"
              min="1"
              max="1200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              value={props.height || ''}
              onChange={(e) => updateProps({ height: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Auto"
              min="1"
              max="1200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Object Fit
          </label>
          <select
            value={props.objectFit}
            onChange={(e) => updateProps({ objectFit: e.target.value as ImageProps['objectFit'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
            <option value="none">None</option>
            <option value="scale-down">Scale Down</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Border Radius: {props.borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={props.borderRadius}
            onChange={(e) => updateProps({ borderRadius: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shadow
          </label>
          <select
            value={props.shadow}
            onChange={(e) => updateProps({ shadow: e.target.value as ImageProps['shadow'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caption
          </label>
          <textarea
            value={props.caption || ''}
            onChange={(e) => updateProps({ caption: e.target.value })}
            placeholder="Optional image caption"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="url"
            value={props.link || ''}
            onChange={(e) => updateProps({ link: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
