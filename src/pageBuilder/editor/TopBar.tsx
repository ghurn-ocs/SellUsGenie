/**
 * Top Bar
 * Main navigation and controls for the page builder
 */

import React from 'react';
import type { PageDocument } from '../types';
import { 
  Save, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone,
  Undo,
  Redo,
  Settings,
  Download,
  Upload
} from 'lucide-react';

interface TopBarProps {
  document: PageDocument;
  onSave: () => void;
  onPublish: () => void;
  isDirty: boolean;
  lastSaved: string | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  document,
  onSave,
  onPublish,
  isDirty,
  lastSaved,
  previewMode,
  onPreviewModeChange,
}) => {
  const formatLastSaved = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Pages</span>
            <span>/</span>
            <span className="font-medium text-gray-900">{document.name}</span>
          </div>

          {/* Save Status */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {isDirty ? (
              <span className="text-orange-600">• Unsaved changes</span>
            ) : lastSaved ? (
              <span>Saved {formatLastSaved(lastSaved)}</span>
            ) : (
              <span>Not saved</span>
            )}
          </div>
        </div>

        {/* Center Section - Preview Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 mr-2">Preview:</span>
          
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`p-2 rounded-lg transition-colors ${
              previewMode === 'desktop'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Desktop preview"
          >
            <Monitor className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onPreviewModeChange('tablet')}
            className={`p-2 rounded-lg transition-colors ${
              previewMode === 'tablet'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Tablet preview"
          >
            <Tablet className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`p-2 rounded-lg transition-colors ${
              previewMode === 'mobile'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Mobile preview"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Undo"
            disabled
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Redo"
            disabled
          >
            <Redo className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Save */}
          <button
            onClick={onSave}
            disabled={!isDirty}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Save draft"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save</span>
          </button>

          {/* Publish */}
          <button
            onClick={onPublish}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            title="Publish page"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Publish</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Settings */}
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Page settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
