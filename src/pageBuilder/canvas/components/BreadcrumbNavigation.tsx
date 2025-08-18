/**
 * Breadcrumb Navigation Component
 * Shows hierarchical path of selected elements with click-to-select functionality
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useCanvasStore } from '../store/CanvasStore';
import { BreadcrumbItem } from '../types/CanvasTypes';

interface BreadcrumbNavigationProps {
  className?: string;
  maxItems?: number;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className = '',
  maxItems = 6
}) => {
  const { selectedElementId, getElementPath, selectElement } = useCanvasStore();

  const breadcrumbs: BreadcrumbItem[] = selectedElementId 
    ? getElementPath(selectedElementId)
    : [];

  // Truncate breadcrumbs if too long
  const displayBreadcrumbs = breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0],
        { id: 'truncated', tag: '...', name: '...' },
        ...breadcrumbs.slice(-maxItems + 2)
      ]
    : breadcrumbs;

  const handleBreadcrumbClick = (breadcrumb: BreadcrumbItem) => {
    if (breadcrumb.id !== 'truncated') {
      selectElement(breadcrumb.id);
    }
  };

  if (breadcrumbs.length === 0) {
    return (
      <div className={`h-12 bg-gray-50 border-t border-gray-200 flex items-center px-4 ${className}`}>
        <span className="text-sm text-gray-500">No element selected</span>
      </div>
    );
  }

  return (
    <div className={`h-12 bg-white border-t border-gray-200 flex items-center px-4 overflow-hidden ${className}`}>
      <div className="flex items-center space-x-1 min-w-0">
        <span className="text-sm text-gray-500 font-medium mr-2">Path:</span>
        
        {displayBreadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.id}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            
            <button
              onClick={() => handleBreadcrumbClick(breadcrumb)}
              disabled={breadcrumb.id === 'truncated'}
              className={`
                text-sm px-2 py-1 rounded transition-colors truncate max-w-32
                ${breadcrumb.id === 'truncated' 
                  ? 'text-gray-400 cursor-default' 
                  : index === displayBreadcrumbs.length - 1
                    ? 'text-blue-600 font-medium bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              title={breadcrumb.name}
            >
              {breadcrumb.tag === 'body' ? 'Page' : breadcrumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>
      
      {/* Element info */}
      {selectedElementId && (
        <div className="ml-auto flex items-center space-x-2 text-xs text-gray-500">
          <span>ID: {selectedElementId.split('_')[1] || selectedElementId}</span>
        </div>
      )}
    </div>
  );
};