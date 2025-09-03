/**
 * Professional Grid Guides & Ruler System
 * World-class page builder rulers with proper page sizing logic
 */

import React, { useState, useEffect, useRef } from 'react';

interface GridGuidesProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  contentHeight?: number;
  pageWidth?: number;
  onPageBoundaryChange?: (height: number) => void;
}

export const GridGuides: React.FC<GridGuidesProps> = ({ 
  containerRef, 
  contentHeight = 1200, 
  pageWidth = 1024,
  onPageBoundaryChange 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(1200);
  const [canvasWidth, setCanvasWidth] = useState(pageWidth);

  // Standard page heights (in pixels) - mimicking document sizes
  const STANDARD_PAGE_HEIGHT = 1200; // Like A4 or Letter size converted to web pixels
  const RULER_WIDTH = 48; // Increased for better visibility
  const RULER_HEIGHT = 48;

  // Update canvas dimensions when content changes
  useEffect(() => {
    const newHeight = Math.max(STANDARD_PAGE_HEIGHT, contentHeight + 200);
    setCanvasHeight(newHeight);
    
    if (onPageBoundaryChange && newHeight > STANDARD_PAGE_HEIGHT) {
      onPageBoundaryChange(newHeight);
    }
  }, [contentHeight, onPageBoundaryChange]);

  // Handle scroll synchronization
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef?.current) {
        setScrollTop(containerRef.current.scrollTop);
        setScrollLeft(containerRef.current.scrollLeft);
      }
    };

    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [containerRef]);

  // Generate ruler markings for horizontal ruler
  const generateHorizontalMarkings = () => {
    const markings = [];
    const totalWidth = canvasWidth;
    const majorTicks = 10; // Number of major divisions (0%, 10%, 20%, etc.)
    
    for (let i = 0; i <= majorTicks; i++) {
      const percentage = (i / majorTicks) * 100;
      const position = (i / majorTicks) * 100;
      
      markings.push({
        key: `major-${i}`,
        position: `${position}%`,
        label: `${Math.round(percentage)}%`,
        isMajor: true,
        height: i === 0 || i === majorTicks || i === majorTicks/2 ? 'h-4' : 'h-3'
      });
    }
    
    // Add minor ticks
    for (let i = 0; i < majorTicks; i++) {
      for (let j = 1; j < 5; j++) {
        const position = ((i + j/5) / majorTicks) * 100;
        if (position < 100) {
          markings.push({
            key: `minor-${i}-${j}`,
            position: `${position}%`,
            label: '',
            isMajor: false,
            height: 'h-1.5'
          });
        }
      }
    }
    
    return markings;
  };

  // Generate ruler markings for vertical ruler
  const generateVerticalMarkings = () => {
    const markings = [];
    const standardPagePercent = (STANDARD_PAGE_HEIGHT / canvasHeight) * 100;
    const totalHeight = canvasHeight;
    
    // Major markings at key intervals
    const intervals = [0, 25, 50, 75, 100]; // Percentages of standard page
    
    intervals.forEach(percent => {
      const actualPercent = (percent / 100) * standardPagePercent;
      const pixelPosition = (actualPercent / 100) * totalHeight;
      
      markings.push({
        key: `page-${percent}`,
        position: pixelPosition,
        label: `${percent}%`,
        isMajor: true,
        isPageBoundary: percent === 100,
        width: percent === 0 || percent === 100 || percent === 50 ? 'w-4' : 'w-3'
      });
    });
    
    // Additional markings for content beyond standard page
    if (canvasHeight > STANDARD_PAGE_HEIGHT) {
      const beyondPageHeight = canvasHeight - STANDARD_PAGE_HEIGHT;
      const additionalSections = Math.ceil(beyondPageHeight / (STANDARD_PAGE_HEIGHT / 4));
      
      for (let i = 1; i <= additionalSections; i++) {
        const position = STANDARD_PAGE_HEIGHT + (i * (STANDARD_PAGE_HEIGHT / 4));
        if (position < canvasHeight) {
          const percentOfTotal = (position / canvasHeight) * 100;
          markings.push({
            key: `extended-${i}`,
            position: position,
            label: `+${Math.round(((position - STANDARD_PAGE_HEIGHT) / STANDARD_PAGE_HEIGHT) * 100)}%`,
            isMajor: false,
            isExtended: true,
            width: 'w-2'
          });
        }
      }
    }
    
    return markings;
  };

  const horizontalMarkings = generateHorizontalMarkings();
  const verticalMarkings = generateVerticalMarkings();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Professional Top Ruler - Fixed Position */}
      <div 
        className="fixed top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 z-50 shadow-sm"
        style={{ 
          transform: `translateY(0px)`,
          left: `${RULER_WIDTH}px`
        }}
      >
        <div className="relative h-full flex items-end px-4">
          {/* Page width indicator */}
          <div className="absolute top-1 left-4 right-4 flex justify-between items-center text-[10px] font-medium text-slate-400">
            <span>0px</span>
            <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">
              {pageWidth}px WIDTH
            </span>
            <span>{pageWidth}px</span>
          </div>
          
          {/* Horizontal ruler markings */}
          <div className="absolute bottom-0 left-4 right-4 h-8 flex items-end">
            {horizontalMarkings.map(marking => (
              <div
                key={marking.key}
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: marking.position, transform: 'translateX(-50%)' }}
              >
                <div className={`bg-slate-300 w-px ${marking.height} mb-0.5 ${
                  marking.isMajor ? 'bg-slate-400' : 'bg-slate-300'
                }`} />
                {marking.label && (
                  <span className="text-[10px] font-medium text-slate-500 leading-none">
                    {marking.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Left Ruler - Fixed Position */}
      <div 
        className="fixed top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-white border-r border-slate-200 z-50 shadow-sm"
        style={{ 
          transform: `translateX(0px)`,
          top: `${RULER_HEIGHT}px`
        }}
      >
        <div className="relative w-full h-full flex flex-col items-end pr-1 pt-8">
          {/* Standard page boundary indicator */}
          <div 
            className="absolute right-1 w-8 border-t-2 border-orange-400 bg-orange-50 z-10"
            style={{ 
              top: `${(STANDARD_PAGE_HEIGHT / canvasHeight) * 100}%`,
              transform: 'translateY(-1px)'
            }}
          >
            <div className="absolute -right-16 -top-2 text-[9px] font-semibold text-orange-600 bg-orange-100 px-1 py-0.5 rounded whitespace-nowrap">
              PAGE END
            </div>
          </div>
          
          {/* Vertical ruler markings */}
          <div className="absolute right-0 top-8 bottom-8 w-8 flex flex-col justify-between">
            {verticalMarkings.map(marking => (
              <div
                key={marking.key}
                className="absolute right-0 flex items-center"
                style={{ 
                  top: `${(marking.position / canvasHeight) * 100}%`,
                  transform: 'translateY(-50%)'
                }}
              >
                <div className="flex items-center">
                  <span className={`text-[9px] font-medium leading-none mr-1 ${
                    marking.isPageBoundary ? 'text-orange-600 font-bold' : 
                    marking.isExtended ? 'text-purple-600' : 'text-slate-500'
                  }`}>
                    {marking.label}
                  </span>
                  <div className={`bg-slate-300 h-px ${marking.width} ${
                    marking.isPageBoundary ? 'bg-orange-400' :
                    marking.isExtended ? 'bg-purple-300' :
                    marking.isMajor ? 'bg-slate-400' : 'bg-slate-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ruler Corner - Fixed Position */}
      <div className="fixed top-0 left-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 border-r border-b border-slate-200 z-50 flex items-center justify-center shadow-sm">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-70"></div>
      </div>

      {/* Page Size Legend - Fixed Position */}
      <div className="fixed bottom-4 left-16 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-40 text-xs">
        <div className="font-semibold text-slate-700 mb-2">Page Size Guide</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-px bg-slate-400"></div>
            <span className="text-slate-600">Standard Page (100%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-px bg-orange-400"></div>
            <span className="text-orange-600">Page Boundary</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-px bg-purple-400"></div>
            <span className="text-purple-600">Extended Content</span>
          </div>
        </div>
      </div>

      {/* Subtle Grid Overlay - Only shows on hover */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ 
          marginTop: `${RULER_HEIGHT}px`,
          marginLeft: `${RULER_WIDTH}px`
        }}
      >
        <div className="w-full h-full grid grid-cols-12 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="border-l border-blue-400 border-dashed h-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
