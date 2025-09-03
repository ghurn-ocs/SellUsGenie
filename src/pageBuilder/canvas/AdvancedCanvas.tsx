/**
 * Advanced Canvas Component - WYSIWYG Visual Editor
 * Provides real-time rendering with drag-and-drop, selection, and visual editing
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useEditorStore, type EnhancedElement, type CSSProperties } from '../store/EditorStore';
import type { PageDocument, Breakpoint } from '../types';
import { cn } from '../../lib/utils';

interface AdvancedCanvasProps {
  className?: string;
}

interface CanvasElementProps {
  element: EnhancedElement;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
  children?: React.ReactNode;
}

interface GridOverlayProps {
  show: boolean;
  scale: number;
}

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  scale: number;
  offset: number;
}

// Canvas Element Component
const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  children
}) => {
  const { currentBreakpoint, updateElement, addElement } = useEditorStore();
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'element',
    item: { id: element.id, type: 'element' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: ['element', 'new-element'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      
      // Handle new element drops
      if (item.type === 'new-element' && item.elementTemplate) {
        const template = item.elementTemplate;
        const newElement = {
          ...template.defaultProps,
          id: `element_${Date.now()}`,
          type: template.id as any,
          tagName: template.tagName,
          attributes: {},
          innerHTML: '',
          textContent: template.name,
          classList: template.defaultProps.classList || [],
          styles: template.defaultProps.styles || { base: {}, responsive: {} },
          animations: {},
          interactions: {},
          seo: {},
        };
        
        console.log('Adding new element:', newElement);
        addElement(newElement);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  // Combine drag and drop refs
  const dragDropRef = useCallback((node: HTMLDivElement) => {
    drag(drop(node));
    elementRef.current = node;
  }, [drag, drop]);

  // Generate styles based on current breakpoint
  const computedStyles = useMemo(() => {
    const baseStyles = element.styles?.base || {};
    const responsiveStyles = element.styles?.responsive?.[currentBreakpoint] || {};
    const hoverStyles = isHovered ? element.styles?.hover || {} : {};
    
    return {
      ...baseStyles,
      ...responsiveStyles,
      ...hoverStyles,
      opacity: isDragging ? 0.5 : (baseStyles.opacity || 1),
    };
  }, [element.styles, currentBreakpoint, isHovered, isDragging]);

  // Convert CSS properties to React styles
  const reactStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    Object.entries(computedStyles).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert kebab-case to camelCase
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        (styles as any)[camelKey] = value;
      }
    });
    
    return styles;
  }, [computedStyles]);

  // Selection and hover handlers
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseEnter = () => {
    onHover(true);
  };

  const handleMouseLeave = () => {
    onHover(false);
  };

  // Resize handles for selected elements
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner handles */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-nw-resize" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-ne-resize" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-sw-resize" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-se-resize" />
        
        {/* Edge handles */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-n-resize" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-s-resize" />
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-w-resize" />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm pointer-events-auto cursor-e-resize" />
      </div>
    );
  };

  // Render element based on its type
  const renderElementContent = () => {
    const commonProps = {
      className: cn(
        element.classList?.join(' ') || '',
        {
          'ring-2 ring-blue-500': isSelected,
          'ring-1 ring-blue-300': isHovered && !isSelected,
        }
      ),
      style: reactStyles,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };

    switch (element.tagName.toLowerCase()) {
      case 'div':
        return (
          <div 
            {...commonProps} 
            ref={dragDropRef}
            style={{
              ...reactStyles,
              minHeight: '40px',
              border: '1px solid #e5e7eb',
              padding: '8px',
              backgroundColor: reactStyles.backgroundColor || '#f9fafb'
            }}
          >
            {element.innerHTML ? (
              <div dangerouslySetInnerHTML={{ __html: element.innerHTML }} />
            ) : (
              element.textContent || children || 'Div Block'
            )}
            {renderResizeHandles()}
          </div>
        );
        
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const HeadingTag = element.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag {...commonProps} ref={dragDropRef}>
            {element.textContent || 'Heading'}
            {renderResizeHandles()}
          </HeadingTag>
        );
        
      case 'p':
        return (
          <p {...commonProps} ref={dragDropRef}>
            {element.textContent || 'Paragraph text'}
            {renderResizeHandles()}
          </p>
        );
        
      case 'img':
        return (
          <img
            {...commonProps}
            ref={dragDropRef}
            src={element.attributes.src || '/api/placeholder/300/200'}
            alt={element.seo?.alt || element.attributes.alt || ''}
            loading="lazy"
          />
        );
        
      case 'button':
        return (
          <button {...commonProps} ref={dragDropRef} type="button">
            {element.textContent || 'Button'}
            {renderResizeHandles()}
          </button>
        );
        
      case 'a':
        return (
          <a
            {...commonProps}
            ref={dragDropRef}
            href={element.attributes.href || '#'}
            target={element.attributes.target}
          >
            {element.textContent || 'Link'}
            {renderResizeHandles()}
          </a>
        );
        
      default:
        return (
          <div {...commonProps} ref={dragDropRef}>
            {element.textContent || children || `<${element.tagName}>`}
            {renderResizeHandles()}
          </div>
        );
    }
  };

  return renderElementContent();
};

// Grid Overlay Component
const GridOverlay: React.FC<GridOverlayProps> = ({ show, scale }) => {
  if (!show) return null;
  
  const gridSize = 20 * scale;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(to right, #e5e7eb 1px, transparent 1px),
          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    />
  );
};

// Ruler Component
const Ruler: React.FC<RulerProps> = ({ orientation, scale, offset }) => {
  const markings = [];
  const size = 2000;
  const step = 50 * scale;
  
  for (let i = 0; i < size; i += step) {
    const position = i + offset;
    if (position >= -step && position <= (orientation === 'horizontal' ? window.innerWidth : window.innerHeight) + step) {
      markings.push(
        <div
          key={i}
          className="absolute text-xs text-gray-500 flex items-center justify-center"
          style={orientation === 'horizontal' 
            ? { left: position, top: 0, width: '1px', height: '20px', borderLeft: '1px solid #d1d5db' }
            : { top: position, left: 0, height: '1px', width: '20px', borderTop: '1px solid #d1d5db' }
          }
        >
          <span className={orientation === 'horizontal' ? 'absolute -bottom-4' : 'absolute -right-8'}>
            {Math.round(i / scale)}
          </span>
        </div>
      );
    }
  }
  
  return (
    <div className={`absolute ${orientation === 'horizontal' ? 'top-0 left-0 right-0 h-5' : 'left-0 top-0 bottom-0 w-5'} bg-gray-50 border-gray-200 ${orientation === 'horizontal' ? 'border-b' : 'border-r'}`}>
      {markings}
    </div>
  );
};

// Main Canvas Component
const AdvancedCanvas: React.FC<AdvancedCanvasProps> = ({ className }) => {
  const {
    document,
    selectedElementId,
    hoveredElementId,
    currentBreakpoint,
    viewMode,
    canvasScale,
    canvasOffset,
    showGrid,
    showRulers,
    showBoundingBoxes,
    selectElement,
    setCanvasScale,
    setCanvasOffset,
    addElement,
  } = useEditorStore();


  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Main canvas drop functionality
  const [{ isCanvasOver }, canvasDrop] = useDrop({
    accept: ['new-element'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      
      // Handle new element drops
      if (item.type === 'new-element' && item.elementTemplate) {
        const template = item.elementTemplate;
        const newElement = {
          ...template.defaultProps,
          id: `element_${Date.now()}`,
          type: template.id as any,
          tagName: template.tagName,
          attributes: {},
          innerHTML: '',
          textContent: template.name,
          classList: template.defaultProps.classList || [],
          styles: template.defaultProps.styles || { base: {}, responsive: {} },
          animations: {},
          interactions: {},
          seo: {},
        };
        
        console.log('Adding new element to canvas:', newElement);
        addElement(newElement);
      }
    },
    collect: (monitor) => ({
      isCanvasOver: monitor.isOver(),
    }),
  });

  // Keyboard handlers for canvas navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Mouse handlers for panning and zooming
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  }, [isSpacePressed, canvasOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart, setCanvasOffset]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setCanvasScale(canvasScale * delta);
    }
  }, [canvasScale, setCanvasScale]);

  // Click outside to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  // Render breakpoint-specific styles
  const canvasContainerStyles = useMemo(() => {
    const baseWidth = '100%';
    let width = baseWidth;
    
    switch (currentBreakpoint) {
      case 'sm':
        width = '375px';
        break;
      case 'md':
        width = '768px';
        break;
      case 'lg':
        width = '1200px';
        break;
    }
    
    return {
      width,
      minHeight: '600px',
      transform: `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
      transformOrigin: 'top left',
    };
  }, [currentBreakpoint, canvasScale, canvasOffset]);


  // Enhanced element wrapper with improved UX
  const ElementWrapper: React.FC<{
    widget: any;
    index: number;
    rowId: string;
    isFirst: boolean;
    isLast: boolean;
  }> = ({ widget, index, rowId, isFirst, isLast }) => {
    const enhancedElement = widget as EnhancedElement;
    const isSelected = selectedElementId === widget.id;
    const isHovered = hoveredElementId === widget.id;
    const [showActions, setShowActions] = useState(false);
    
    const { removeElement, moveElement } = useEditorStore();

    // Enhanced drop zone before each element
    const [{ isBeforeOver }, beforeDrop] = useDrop({
      accept: ['new-element', 'element'],
      drop: (item: any, monitor) => {
        if (monitor.didDrop()) return;
        
        if (item.type === 'new-element' && item.elementTemplate) {
          const template = item.elementTemplate;
          const newElement = {
            ...template.defaultProps,
            id: `element_${Date.now()}`,
            type: template.id as any,
            tagName: template.tagName,
            attributes: {},
            innerHTML: '',
            textContent: template.name,
            classList: template.defaultProps.classList || [],
            styles: template.defaultProps.styles || { base: {}, responsive: {} },
            animations: {},
            interactions: {},
            seo: {},
          };
          addElement(newElement, rowId, index);
        } else if (item.type === 'element' && item.id !== widget.id) {
          moveElement(item.id, rowId, index);
        }
      },
      collect: (monitor) => ({
        isBeforeOver: monitor.isOver({ shallow: true }),
      }),
    });

    return (
      <div className="relative group" style={{ zIndex: 30 }}>
        {/* Drop zone before element */}
        <div 
          ref={beforeDrop as any}
          className={`h-2 transition-all ${
            isBeforeOver ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400' : 'hover:h-4 hover:bg-gray-100'
          } ${!isFirst ? 'mt-2' : ''}`}
          style={{ zIndex: 35 }}
        >
          {isBeforeOver && (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-blue-600 font-medium">Drop here</span>
            </div>
          )}
        </div>

        {/* Element container with enhanced UX */}
        <div 
          className={`relative transition-all duration-200 ${
            isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 
            isHovered ? 'ring-1 ring-blue-300' : ''
          }`}
          style={{ zIndex: 40 }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Enhanced element controls */}
          {(showActions || isSelected) && (
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-between bg-white border border-gray-200 rounded-t-lg px-2 py-1 shadow-sm z-50" style={{ zIndex: 50 }}>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-600 font-medium">{enhancedElement.tagName}</span>
                <span className="text-xs text-gray-400">#{widget.id.split('_')[1]}</span>
              </div>
              <div className="flex items-center space-x-1">
                {/* Move up */}
                {!isFirst && (
                  <button 
                    onClick={() => moveElement(widget.id, rowId, index - 1)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Move up"
                  >
                    ↑
                  </button>
                )}
                {/* Move down */}
                {!isLast && (
                  <button 
                    onClick={() => moveElement(widget.id, rowId, index + 1)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Move down"
                  >
                    ↓
                  </button>
                )}
                {/* Duplicate */}
                <button 
                  onClick={() => {
                    const duplicatedElement = {
                      ...enhancedElement,
                      id: `element_${Date.now()}`,
                    };
                    addElement(duplicatedElement, rowId, index + 1);
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Duplicate"
                >
                  ⧉
                </button>
                {/* Delete */}
                <button 
                  onClick={() => removeElement(widget.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <CanvasElement
            element={enhancedElement}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={() => selectElement(widget.id)}
            onHover={(hover) => {
              // Update hovered state in store
            }}
          />
        </div>
      </div>
    );
  };

  // Render page sections and elements with enhanced UX
  const renderPageContent = () => {
    if (!document) return null;

    return document.sections.map((section) => (
      <section key={section.id} className="relative">
        {section.rows.map((row) => (
          <div key={row.id} className="space-y-1">
            {/* Enhanced row with better spacing and visual hierarchy */}
            <div className="space-y-1">
              {row.widgets.map((widget, index) => (
                <ElementWrapper
                  key={widget.id}
                  widget={widget}
                  index={index}
                  rowId={row.id}
                  isFirst={index === 0}
                  isLast={index === row.widgets.length - 1}
                />
              ))}
            </div>
            
            {/* Enhanced bottom drop zone */}
            <RowDropZone rowId={row.id} isMainRow={true} />
          </div>
        ))}
      </section>
    ));
  };

  // Enhanced drop zone component with better UX
  const RowDropZone: React.FC<{ rowId: string; isMainRow?: boolean }> = ({ rowId, isMainRow = false }) => {
    const [{ isRowOver }, rowDrop] = useDrop({
      accept: ['new-element', 'element'],
      drop: (item: any, monitor) => {
        if (monitor.didDrop()) return;
        
        if (item.type === 'new-element' && item.elementTemplate) {
          const template = item.elementTemplate;
          const newElement = {
            ...template.defaultProps,
            id: `element_${Date.now()}`,
            type: template.id as any,
            tagName: template.tagName,
            attributes: {},
            innerHTML: '',
            textContent: template.name,
            classList: template.defaultProps.classList || [],
            styles: template.defaultProps.styles || { base: {}, responsive: {} },
            animations: {},
            interactions: {},
            seo: {},
          };
          
          addElement(newElement, rowId);
        } else if (item.type === 'element') {
          // Move existing element to end of this row
          moveElement(item.id, rowId, -1); // -1 means append to end
        }
      },
      collect: (monitor) => ({
        isRowOver: monitor.isOver({ shallow: true }),
      }),
    });

    return (
      <div 
        ref={rowDrop as any}
        className={`transition-all duration-200 flex items-center justify-center rounded-lg ${
          isRowOver 
            ? 'h-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-400 shadow-inner' 
            : isMainRow 
              ? 'h-8 border-2 border-dashed border-transparent hover:border-gray-300 hover:bg-gray-50'
              : 'h-4 hover:h-6 hover:bg-gray-50'
        } ${isMainRow ? 'mt-4' : 'my-2'}`}
        style={{ zIndex: 25 }}
      >
        {isRowOver ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">Drop element here</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        ) : isMainRow ? (
          <span className="text-xs text-gray-400">+ Add element</span>
        ) : null}
      </div>
    );
  };

  if (viewMode === 'preview') {
    return (
      <div className={cn('flex-1 overflow-auto bg-white', className)}>
        <div className="mx-auto" style={canvasContainerStyles}>
          {renderPageContent()}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn('flex-1 relative overflow-hidden bg-gray-200', className)} 
      style={{ 
        zIndex: 1, 
        minHeight: '500px'
      }}
    >
        {/* Rulers */}
        {showRulers && (
          <>
            <Ruler orientation="horizontal" scale={canvasScale} offset={canvasOffset.x} />
            <Ruler orientation="vertical" scale={canvasScale} offset={canvasOffset.y} />
          </>
        )}

        {/* Canvas container */}
        <div
          ref={canvasRef}
          className={cn(
            'absolute inset-0 overflow-auto p-8',
            showRulers && 'top-5 left-5',
            isPanning && 'cursor-grabbing',
            isSpacePressed && !isPanning && 'cursor-grab'
          )}
          style={{ 
            zIndex: 5
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          <GridOverlay show={showGrid} scale={canvasScale} />
          
          {/* Page content */}
          <div
            className="mx-auto bg-white shadow-xl relative border border-gray-300 p-4"
            style={{ 
              ...canvasContainerStyles, 
              zIndex: 10
            }}
          >
            
            {renderPageContent()}
            
            {/* Enhanced main canvas drop zones */}
            {(() => {
              if (!document) return null;
              
              const totalWidgets = document.sections.reduce((acc, section) => 
                acc + section.rows.reduce((rowAcc, row) => rowAcc + row.widgets.length, 0), 0
              );
              
              if (totalWidgets === 0) {
                // Enhanced empty state with better visual design
                return (
                  <div 
                    ref={canvasDrop as any}
                    className={`min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 ${
                      isCanvasOver 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-solid shadow-lg scale-[1.02]' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    style={{ 
                      zIndex: 30, 
                      position: 'relative'
                    }}
                  >
                    <div className="text-center space-y-4">
                      {isCanvasOver ? (
                        <div className="animate-bounce">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl">+</span>
                          </div>
                          <div className="text-xl font-semibold text-blue-700">
                            Release to add element
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-3xl">⊞</span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-semibold text-gray-700">
                              Start Building Your Page
                            </div>
                            <div className="text-gray-500 max-w-md">
                              Drag and drop elements from the left panel to begin creating your page
                            </div>
                          </div>
                          <div className="flex space-x-2 text-xs text-gray-400">
                            <span>✨ Drag to add</span>
                            <span>•</span>
                            <span>🎯 Click to select</span>
                            <span>•</span>
                            <span>⚡ Right-click for options</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              } else {
                // Enhanced bottom drop zone with better visual feedback
                return (
                  <div 
                    ref={canvasDrop as any}
                    className={`mt-6 rounded-lg transition-all duration-300 flex items-center justify-center ${
                      isCanvasOver 
                        ? 'h-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-dashed border-blue-500 shadow-lg' 
                        : 'h-12 border-2 border-dashed border-transparent hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ 
                      zIndex: 30, 
                      position: 'relative'
                    }}
                  >
                    {isCanvasOver ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-lg font-medium text-blue-700">Add element to end</span>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">+ Add more elements</span>
                    )}
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* Canvas controls */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={() => setCanvasScale(Math.max(0.1, canvasScale - 0.1))}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            -
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(canvasScale * 100)}%
          </span>
          <button
            onClick={() => setCanvasScale(Math.min(3, canvasScale + 0.1))}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            +
          </button>
          <button
            onClick={() => {
              setCanvasScale(1);
              setCanvasOffset({ x: 0, y: 0 });
            }}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Reset
          </button>
        </div>

        {/* Breakpoint indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2">
          <span className="text-sm font-medium text-gray-600">
            {currentBreakpoint.toUpperCase()} - {canvasContainerStyles.width}
          </span>
        </div>
      </div>
  );
};

export { AdvancedCanvas };