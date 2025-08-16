/**
 * Grid Guides
 * Visual grid guides for the 12-column layout system
 */

import React from 'react';

export const GridGuides: React.FC = () => {
  return (
    <div className="pointer-events-none">
      {/* Page boundary container */}
      <div className="relative bg-white border-2 border-blue-200 rounded-lg shadow-lg mx-auto max-w-4xl">
        {/* Top ruler */}
        <div className="absolute -top-8 left-0 right-0 h-8 bg-blue-50 border border-blue-300 rounded-t-lg">
          <div className="flex justify-between text-xs text-blue-700 px-4 py-1">
            <span>0</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Left ruler */}
        <div className="absolute top-0 -left-8 w-8 h-full bg-blue-50 border border-blue-300 rounded-l-lg">
          <div className="flex flex-col justify-between text-xs text-blue-700 px-1 h-full py-2">
            <span>0</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Page content area */}
        <div className="p-8 min-h-[800px]">
          {/* Grid overlay */}
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="border-l border-blue-200 border-dashed opacity-40"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
