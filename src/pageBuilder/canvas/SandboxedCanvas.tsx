/**
 * Sandboxed Canvas Component - WYSIWYG editor with iframe isolation
 * Prevents parent application styles from affecting user designs
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useCanvasStore } from './store/CanvasStore';
import { CanvasMessage, CanvasElement, Breakpoint, CanvasError } from './types/CanvasTypes';

interface SandboxedCanvasProps {
  className?: string;
  onElementSelect?: (elementId: string | null) => void;
  onElementHover?: (elementId: string | null) => void;
  onError?: (error: CanvasError) => void;
}

export const SandboxedCanvas: React.FC<SandboxedCanvasProps> = ({
  className,
  onElementSelect,
  onElementHover,
  onError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  
  const {
    elements,
    rootId,
    selectedElementId,
    hoveredElementId,
    activeBreakpoint,
    dragState,
    viewport,
    selectElement,
    hoverElement,
    startDrag,
    updateDragTarget,
    endDrag,
    updateElementTextContent,
    reportError
  } = useCanvasStore();

  // Generate iframe content with sandboxed styles
  const iframeContent = useMemo(() => {
    const breakpointWidths = {
      mobile: '375px',
      tablet: '768px',
      desktop: '100%'
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Canvas</title>
        <style>
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            height: 100%;
            font-family: Inter, system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Canvas-specific styles */
          .canvas-container {
            width: ${breakpointWidths[activeBreakpoint]};
            max-width: 100%;
            margin: 0 auto;
            min-height: 100vh;
            position: relative;
            transform: scale(${viewport.scale});
            transform-origin: top center;
          }
          
          /* Element selection styles */
          .canvas-element {
            position: relative;
            transition: all 0.15s ease;
          }
          
          .canvas-element:hover {
            outline: 2px solid rgba(59, 130, 246, 0.5);
            outline-offset: -2px;
          }
          
          .canvas-element.selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: -2px;
          }
          
          .canvas-element.dragging {
            opacity: 0.7;
            cursor: grabbing;
          }
          
          /* Drag indicators */
          .drop-indicator {
            position: absolute;
            background: #3b82f6;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.15s ease;
          }
          
          .drop-indicator.horizontal {
            height: 2px;
            left: 0;
            right: 0;
          }
          
          .drop-indicator.vertical {
            width: 2px;
            top: 0;
            bottom: 0;
          }
          
          /* Text editing */
          .canvas-element[contenteditable="true"] {
            outline: 2px solid #10b981 !important;
            outline-offset: -2px;
          }
          
          /* Responsive helper */
          @media (max-width: 768px) {
            .canvas-container {
              width: 100%;
            }
          }
          
          /* Accessibility */
          .canvas-element:focus-visible {
            outline: 2px solid #f59e0b;
            outline-offset: 2px;
          }
          
          /* Animation for new elements */
          @keyframes elementAdded {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .element-added {
            animation: elementAdded 0.3s ease;
          }
        </style>
      </head>
      <body>
        <div class="canvas-container" id="canvas-root">
          <!-- Elements will be rendered here -->
        </div>
        
        <script>
          // Canvas interaction handlers
          let draggedElement = null;
          let dropIndicator = null;
          let isTextEditing = false;
          
          // Message communication with parent
          function sendMessage(type, payload) {
            window.parent.postMessage({
              type,
              payload,
              timestamp: Date.now()
            }, '*');
          }
          
          // Create drop indicator
          function createDropIndicator() {
            if (dropIndicator) {
              dropIndicator.remove();
            }
            dropIndicator = document.createElement('div');
            dropIndicator.className = 'drop-indicator';
            document.body.appendChild(dropIndicator);
            return dropIndicator;
          }
          
          // Position drop indicator
          function positionDropIndicator(targetElement, position) {
            if (!dropIndicator) return;
            
            const rect = targetElement.getBoundingClientRect();
            const container = document.getElementById('canvas-root');
            const containerRect = container.getBoundingClientRect();
            
            dropIndicator.style.display = 'block';
            
            if (position === 'before') {
              dropIndicator.className = 'drop-indicator horizontal';
              dropIndicator.style.top = (rect.top - containerRect.top - 1) + 'px';
              dropIndicator.style.left = (rect.left - containerRect.left) + 'px';
              dropIndicator.style.width = rect.width + 'px';
            } else if (position === 'after') {
              dropIndicator.className = 'drop-indicator horizontal';
              dropIndicator.style.top = (rect.bottom - containerRect.top - 1) + 'px';
              dropIndicator.style.left = (rect.left - containerRect.left) + 'px';
              dropIndicator.style.width = rect.width + 'px';
            } else if (position === 'inside') {
              dropIndicator.className = 'drop-indicator';
              dropIndicator.style.top = (rect.top - containerRect.top) + 'px';
              dropIndicator.style.left = (rect.left - containerRect.left) + 'px';
              dropIndicator.style.width = rect.width + 'px';
              dropIndicator.style.height = rect.height + 'px';
              dropIndicator.style.background = 'rgba(59, 130, 246, 0.1)';
              dropIndicator.style.border = '2px dashed #3b82f6';
            }
          }
          
          // Hide drop indicator
          function hideDropIndicator() {
            if (dropIndicator) {
              dropIndicator.style.display = 'none';
            }
          }
          
          // Element click handler
          function handleElementClick(event) {
            if (isTextEditing) return;
            
            event.stopPropagation();
            const elementId = event.target.getAttribute('data-element-id');
            if (elementId) {
              sendMessage('CLICK_ELEMENT', { elementId });
            }
          }
          
          // Element double-click handler for text editing
          function handleElementDoubleClick(event) {
            event.stopPropagation();
            const element = event.target;
            const elementId = element.getAttribute('data-element-id');
            
            if (elementId && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'].includes(element.tagName.toLowerCase())) {
              isTextEditing = true;
              element.contentEditable = 'true';
              element.focus();
              
              // Select all text
              const range = document.createRange();
              range.selectNodeContents(element);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              
              sendMessage('DOUBLE_CLICK_ELEMENT', { elementId });
            }
          }
          
          // Text editing handlers
          function handleTextBlur(event) {
            if (!isTextEditing) return;
            
            const element = event.target;
            const elementId = element.getAttribute('data-element-id');
            
            element.contentEditable = 'false';
            isTextEditing = false;
            
            sendMessage('UPDATE_TEXT_CONTENT', {
              elementId,
              textContent: element.textContent
            });
          }
          
          function handleTextKeyDown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.target.blur();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              event.target.blur();
            }
          }
          
          // Mouse hover handlers
          function handleElementMouseEnter(event) {
            if (isTextEditing) return;
            
            const elementId = event.target.getAttribute('data-element-id');
            if (elementId) {
              sendMessage('HOVER_ELEMENT', { elementId });
            }
          }
          
          function handleElementMouseLeave(event) {
            if (isTextEditing) return;
            sendMessage('HOVER_ELEMENT', { elementId: null });
          }
          
          // Drag and drop handlers
          function handleDragStart(event) {
            const elementId = event.target.getAttribute('data-element-id');
            if (elementId && elementId !== 'root-body') {
              draggedElement = event.target;
              event.target.classList.add('dragging');
              sendMessage('DRAG_START', { elementId });
              createDropIndicator();
            }
          }
          
          function handleDragOver(event) {
            event.preventDefault();
            if (!draggedElement) return;
            
            const target = event.target.closest('.canvas-element');
            if (target && target !== draggedElement) {
              const rect = target.getBoundingClientRect();
              const y = event.clientY - rect.top;
              const height = rect.height;
              
              let position;
              if (y < height * 0.25) {
                position = 'before';
              } else if (y > height * 0.75) {
                position = 'after';
              } else {
                position = 'inside';
              }
              
              positionDropIndicator(target, position);
              
              const targetId = target.getAttribute('data-element-id');
              sendMessage('UPDATE_DRAG_TARGET', { targetId, position });
            }
          }
          
          function handleDragEnd(event) {
            if (draggedElement) {
              draggedElement.classList.remove('dragging');
              draggedElement = null;
            }
            hideDropIndicator();
            sendMessage('DRAG_END', {});
          }
          
          function handleDrop(event) {
            event.preventDefault();
            handleDragEnd(event);
          }
          
          // Canvas click handler (for deselection)
          function handleCanvasClick(event) {
            if (event.target === document.getElementById('canvas-root')) {
              sendMessage('CLICK_ELEMENT', { elementId: null });
            }
          }

          // External drop handler for template elements
          function handleCanvasDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            
            // Show drop zones for external elements
            const canvasRoot = document.getElementById('canvas-root');
            if (canvasRoot && !draggedElement) {
              // Add visual indicator for canvas drop zone
              canvasRoot.style.outline = '2px dashed #3b82f6';
              canvasRoot.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            }
          }

          function handleCanvasDragLeave(event) {
            const canvasRoot = document.getElementById('canvas-root');
            if (canvasRoot && !draggedElement) {
              canvasRoot.style.outline = '';
              canvasRoot.style.backgroundColor = '';
            }
          }

          function handleCanvasDrop(event) {
            event.preventDefault();
            
            const canvasRoot = document.getElementById('canvas-root');
            if (canvasRoot) {
              canvasRoot.style.outline = '';
              canvasRoot.style.backgroundColor = '';
            }

            try {
              const data = event.dataTransfer.getData('application/json');
              if (data) {
                const dropData = JSON.parse(data);
                if (dropData.type === 'TEMPLATE_ELEMENT') {
                  // Calculate drop position
                  const rect = canvasRoot.getBoundingClientRect();
                  const x = event.clientX - rect.left;
                  const y = event.clientY - rect.top;
                  
                  sendMessage('DROP_TEMPLATE_ELEMENT', {
                    template: dropData.template,
                    position: { x, y }
                  });
                }
              }
            } catch (error) {
              console.error('Error handling canvas drop:', error);
            }
          }
          
          // Initialize event listeners
          document.addEventListener('click', handleCanvasClick);
          document.addEventListener('dragover', handleDragOver);
          document.addEventListener('drop', handleDrop);
          
          // Canvas-level drop listeners for external elements
          const canvasRoot = document.getElementById('canvas-root');
          if (canvasRoot) {
            canvasRoot.addEventListener('dragover', handleCanvasDragOver);
            canvasRoot.addEventListener('dragleave', handleCanvasDragLeave);
            canvasRoot.addEventListener('drop', handleCanvasDrop);
          }
          
          // Notify parent that iframe is ready
          sendMessage('IFRAME_READY', {});
          
          // Handle messages from parent
          window.addEventListener('message', function(event) {
            if (event.source !== window.parent) return;
            
            const { type, payload } = event.data;
            
            switch (type) {
              case 'RENDER_ELEMENTS':
                renderElements(payload.elements, payload.rootId);
                break;
              case 'UPDATE_SELECTION':
                updateSelection(payload.selectedElementId);
                break;
              case 'UPDATE_HOVER':
                updateHover(payload.hoveredElementId);
                break;
              case 'UPDATE_VIEWPORT':
                updateViewport(payload.viewport);
                break;
            }
          });
          
          // Render elements function
          function renderElements(elements, rootId) {
            const container = document.getElementById('canvas-root');
            if (!container) return;
            
            function renderElement(elementId, parentElement) {
              const element = elements[elementId];
              if (!element) return null;
              
              const domElement = document.createElement(element.tag);
              domElement.setAttribute('data-element-id', elementId);
              domElement.className = 'canvas-element' + (element.className ? ' ' + element.className : '');
              
              // Set text content
              if (element.textContent) {
                domElement.textContent = element.textContent;
              }
              
              // Set attributes
              Object.entries(element.attributes || {}).forEach(([key, value]) => {
                domElement.setAttribute(key, value);
              });
              
              // Apply styles
              const styles = element.styles.desktop || {};
              Object.entries(styles).forEach(([property, value]) => {
                if (value !== undefined && value !== null) {
                  domElement.style[property] = value;
                }
              });
              
              // Make draggable (except root)
              if (elementId !== rootId) {
                domElement.draggable = true;
                domElement.addEventListener('dragstart', handleDragStart);
                domElement.addEventListener('dragend', handleDragEnd);
              }
              
              // Add event listeners
              domElement.addEventListener('click', handleElementClick);
              domElement.addEventListener('dblclick', handleElementDoubleClick);
              domElement.addEventListener('mouseenter', handleElementMouseEnter);
              domElement.addEventListener('mouseleave', handleElementMouseLeave);
              domElement.addEventListener('blur', handleTextBlur);
              domElement.addEventListener('keydown', handleTextKeyDown);
              
              // Render children
              if (element.children && element.children.length > 0) {
                element.children.forEach(childId => {
                  const childElement = renderElement(childId, domElement);
                  if (childElement) {
                    domElement.appendChild(childElement);
                  }
                });
              }
              
              return domElement;
            }
            
            // Clear and re-render
            container.innerHTML = '';
            const rootElement = renderElement(rootId, container);
            if (rootElement && rootElement !== container) {
              container.appendChild(rootElement);
            } else if (elements[rootId] && elements[rootId].children) {
              // If root is body, render its children directly
              elements[rootId].children.forEach(childId => {
                const childElement = renderElement(childId, container);
                if (childElement) {
                  container.appendChild(childElement);
                }
              });
            }
          }
          
          // Update selection
          function updateSelection(selectedElementId) {
            document.querySelectorAll('.canvas-element.selected').forEach(el => {
              el.classList.remove('selected');
            });
            
            if (selectedElementId) {
              const element = document.querySelector('[data-element-id="' + selectedElementId + '"]');
              if (element) {
                element.classList.add('selected');
              }
            }
          }
          
          // Update hover
          function updateHover(hoveredElementId) {
            // Hover styles are handled by CSS :hover
          }
          
          // Update viewport
          function updateViewport(viewport) {
            const container = document.getElementById('canvas-root');
            if (container) {
              container.style.transform = 'scale(' + viewport.scale + ')';
            }
          }
        </script>
      </body>
      </html>
    `;
  }, [activeBreakpoint, viewport.scale]);

  // Handle messages from iframe
  const handleMessage = useCallback((event: MessageEvent<CanvasMessage>) => {
    if (event.source !== iframeRef.current?.contentWindow) return;

    const { type, payload } = event.data;

    try {
      switch (type) {
        case 'IFRAME_READY':
          setIsIframeReady(true);
          break;
          
        case 'CLICK_ELEMENT':
          selectElement(payload.elementId);
          onElementSelect?.(payload.elementId);
          break;
          
        case 'DOUBLE_CLICK_ELEMENT':
          // Handle text editing mode
          break;
          
        case 'HOVER_ELEMENT':
          hoverElement(payload.elementId);
          onElementHover?.(payload.elementId);
          break;
          
        case 'DRAG_START':
          startDrag(payload.elementId);
          break;
          
        case 'UPDATE_DRAG_TARGET':
          updateDragTarget(payload.targetId, payload.position);
          break;
          
        case 'DRAG_END':
          endDrag();
          break;
          
        case 'UPDATE_TEXT_CONTENT':
          updateElementTextContent(payload.elementId, payload.textContent);
          break;
          
        case 'DROP_TEMPLATE_ELEMENT':
          // Handle template element drops by creating new element
          if (payload.template) {
            useCanvasStore.getState().createElement(payload.template.elementData);
          }
          break;
          
        default:
          console.warn('Unknown message type:', type);
      }
    } catch (error) {
      const canvasError = new CanvasError(
        `Error handling iframe message: ${type}`,
        'IFRAME_MESSAGE_ERROR',
        payload?.elementId,
        error as Error
      );
      reportError(canvasError);
      onError?.(canvasError);
    }
  }, [selectElement, hoverElement, startDrag, updateDragTarget, endDrag, updateElementTextContent, reportError, onElementSelect, onElementHover, onError]);

  // Send messages to iframe
  const sendMessageToIframe = useCallback((type: string, payload: any) => {
    if (iframeRef.current?.contentWindow && isIframeReady) {
      iframeRef.current.contentWindow.postMessage({ type, payload }, '*');
    }
  }, [isIframeReady]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Update iframe when elements change
  useEffect(() => {
    if (isIframeReady) {
      sendMessageToIframe('RENDER_ELEMENTS', { elements, rootId });
    }
  }, [elements, rootId, isIframeReady, sendMessageToIframe]);

  // Update selection in iframe
  useEffect(() => {
    if (isIframeReady) {
      sendMessageToIframe('UPDATE_SELECTION', { selectedElementId });
    }
  }, [selectedElementId, isIframeReady, sendMessageToIframe]);

  // Update hover in iframe
  useEffect(() => {
    if (isIframeReady) {
      sendMessageToIframe('UPDATE_HOVER', { hoveredElementId });
    }
  }, [hoveredElementId, isIframeReady, sendMessageToIframe]);

  // Update viewport in iframe
  useEffect(() => {
    if (isIframeReady) {
      sendMessageToIframe('UPDATE_VIEWPORT', { viewport });
    }
  }, [viewport, isIframeReady, sendMessageToIframe]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentDocument) {
      // Write the HTML content
      iframe.contentDocument.open();
      iframe.contentDocument.write(iframeContent);
      iframe.contentDocument.close();
    }
  }, [iframeContent]);

  return (
    <div className={`relative w-full h-full bg-gray-100 ${className}`}>
      {/* Loading overlay */}
      {!isIframeReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading canvas...</p>
          </div>
        </div>
      )}
      
      {/* Sandboxed iframe */}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleIframeLoad}
        title="Canvas Editor"
        style={{
          opacity: isIframeReady ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
};