/**
 * Shared Expandable Section Component
 * Consistent expandable section pattern for all page builder panels
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ExpandableSectionProps {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  description,
  icon: IconComponent,
  children,
  isOpen,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`border border-gray-200 rounded-lg mb-4 ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <IconComponent className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};