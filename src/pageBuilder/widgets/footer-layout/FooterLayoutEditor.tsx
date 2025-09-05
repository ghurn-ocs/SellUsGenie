/**
 * Footer Layout Widget Editor
 * Allows users to customize footer column headers and other footer settings
 */

import React, { useState } from 'react';
import type { WidgetEditorProps } from '../../types';
import type { FooterLayoutProps } from './FooterLayoutView';
import { useFooterColumnConfig, useUpdateFooterColumnConfig } from '../../../hooks/useFooterColumnConfig';
import { Settings, Edit3, Save, X } from 'lucide-react';

export const FooterLayoutEditor: React.FC<WidgetEditorProps> = ({ 
  widget, 
  updateWidget 
}) => {
  const props = widget.props as FooterLayoutProps;
  const { data: columnConfig, isLoading } = useFooterColumnConfig();
  const updateColumnConfig = useUpdateFooterColumnConfig();
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartEdit = (columnNumber: 1 | 2 | 3 | 4, currentTitle: string) => {
    setEditingColumn(columnNumber);
    setTempValue(currentTitle);
  };

  const handleSaveEdit = async (columnNumber: 1 | 2 | 3 | 4) => {
    try {
      await updateColumnConfig.mutateAsync({
        column_number: columnNumber,
        column_title: tempValue.trim() || getDefaultColumnTitle(columnNumber),
        is_enabled: true
      });
      setEditingColumn(null);
      setTempValue('');
    } catch (error) {
      console.error('Failed to update column title:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
    setTempValue('');
  };

  const getDefaultColumnTitle = (columnNumber: number): string => {
    const defaults = { 1: 'Company', 2: 'General', 3: 'Support', 4: 'Legal' };
    return defaults[columnNumber as 1 | 2 | 3 | 4] || 'Column';
  };

  const getCurrentColumnTitle = (columnNumber: 1 | 2 | 3 | 4): string => {
    const config = columnConfig?.find(c => c.column_number === columnNumber);
    return config?.column_title || getDefaultColumnTitle(columnNumber);
  };

  const toggleColumnSystem = (enabled: boolean) => {
    updateWidget({
      ...widget,
      props: {
        ...props,
        navigation: {
          ...props.navigation,
          useColumnSystem: enabled
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading footer configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Footer System Toggle */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Footer Navigation System</h3>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="footerSystem"
              checked={!props.navigation?.useColumnSystem}
              onChange={() => toggleColumnSystem(false)}
              className="text-blue-600"
            />
            <div>
              <div className="font-medium">Classic Navigation</div>
              <div className="text-sm text-gray-500">Use predefined navigation columns</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="footerSystem"
              checked={props.navigation?.useColumnSystem || false}
              onChange={() => toggleColumnSystem(true)}
              className="text-blue-600"
            />
            <div>
              <div className="font-medium">4-Column System</div>
              <div className="text-sm text-gray-500">Dynamic page assignment with customizable headers</div>
            </div>
          </label>
        </div>
      </div>

      {/* Column Headers Editor - Only show when using column system */}
      {props.navigation?.useColumnSystem && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Edit3 className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Footer Columns Configuration</h3>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map((columnNumber) => {
              const typedColumnNumber = columnNumber as 1 | 2 | 3 | 4;
              const currentTitle = getCurrentColumnTitle(typedColumnNumber);
              const isEditing = editingColumn === columnNumber;
              
              return (
                <div key={columnNumber} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Fixed Column Number */}
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 font-bold text-sm rounded-full">
                    #{columnNumber}
                  </div>
                  
                  {/* Editable Column Name */}
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(typedColumnNumber);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter column name"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{currentTitle}</span>
                        <button
                          onClick={() => handleStartEdit(typedColumnNumber, currentTitle)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit column name"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Save/Cancel Actions */}
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveEdit(typedColumnNumber)}
                        disabled={updateColumnConfig.isPending}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Save changes"
                      >
                        {updateColumnConfig.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        title="Cancel editing"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Column 1: Company info (logo, name, tagline) - handled automatically</li>
              <li>• Columns 2-4: Pages are assigned based on their Footer Column setting</li>
              <li>• Edit page Footer Column in the Visual Page Builder properties panel</li>
              <li>• Column headers you set here will appear in the dropdown when editing pages</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};