/**
 * Canvas Editor - Main WYSIWYG Editor Component
 * Combines all canvas components into a complete editing interface
 */

import React from 'react';
import { CanvasContainer } from './CanvasContainer';
import { ElementTemplates } from './components/ElementTemplates';
import { StylePanel } from './components/StylePanel';
import { CanvasError } from './types/CanvasTypes';
import { useCanvasStore } from './store/CanvasStore';

interface CanvasEditorProps {
  className?: string;
  onSave?: (canvasData: any) => void;
  onError?: (error: CanvasError) => void;
  initialData?: any;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  className = '',
  onSave,
  onError,
  initialData
}) => {
  const handleElementSelect = (elementId: string | null) => {
    // Optional callback for external components
  };

  const handleElementHover = (elementId: string | null) => {
    // Optional callback for external components
  };

  const handleCanvasError = (error: CanvasError) => {
    console.error('Canvas Editor Error:', error);
    onError?.(error);
  };

  const { importCanvasData } = useCanvasStore();

  // Load initial data if provided
  React.useEffect(() => {
    if (initialData) {
      importCanvasData(initialData);
    }
  }, [initialData, importCanvasData]);

  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Left Sidebar - Element Templates */}
      <div className="w-64 flex-shrink-0">
        <ElementTemplates />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 min-w-0">
        <CanvasContainer
          onElementSelect={handleElementSelect}
          onElementHover={handleElementHover}
          onCanvasError={handleCanvasError}
        />
      </div>

      {/* Right Sidebar - Style Panel */}
      <div className="w-80 flex-shrink-0">
        <StylePanel />
      </div>
    </div>
  );
};