/**
 * Spacer Widget Editor
 * Form for editing spacer widget properties
 */

import React, { useCallback } from 'react';
import type { WidgetEditorProps } from '../../types';
import type { SpacerProps } from './index';

export const SpacerEditor: React.FC<WidgetEditorProps> = ({ widget, onChange, onDelete, onDuplicate }) => {
  const props = widget.props as SpacerProps;

  const updateProps = useCallback((updates: Partial<SpacerProps>) => {
    onChange({
      props: { ...props, ...updates }
    });
  }, [props, onChange]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Spacer Settings</h3>
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
            Height: {props.height}px
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={props.height}
            onChange={(e) => updateProps({ height: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => updateProps({ backgroundColor: e.target.value })}
            className="w-full h-10 border border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.borderTop}
              onChange={(e) => updateProps({ borderTop: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Top Border</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.borderBottom}
              onChange={(e) => updateProps({ borderBottom: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Bottom Border</span>
          </label>
        </div>

        {(props.borderTop || props.borderBottom) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Color
            </label>
            <input
              type="color"
              value={props.borderColor}
              onChange={(e) => updateProps({ borderColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};