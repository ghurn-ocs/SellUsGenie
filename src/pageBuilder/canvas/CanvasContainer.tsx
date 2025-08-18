/**
 * Canvas Container - Main WYSIWYG Canvas Component
 * Orchestrates the sandboxed iframe, breakpoint controls, and breadcrumb navigation
 */

import React, { useCallback, useEffect, Component, ReactNode } from 'react';
import { SandboxedCanvas } from './SandboxedCanvas';
import { BreadcrumbNavigation } from './components/BreadcrumbNavigation';
import { BreakpointControls } from './components/BreakpointControls';
import { useCanvasStore, useCanvasHistory } from './store/CanvasStore';
import { CanvasError, CanvasErrorBoundaryState } from './types/CanvasTypes';

interface CanvasContainerProps {
  className?: string;
  onElementSelect?: (elementId: string | null) => void;
  onElementHover?: (elementId: string | null) => void;
  onCanvasError?: (error: CanvasError) => void;
}

// Simple Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
  onError?: (error: Error, errorInfo: any) => void;
  onReset?: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { FallbackComponent } = this.props;
      return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

// Error Fallback Component
const CanvasErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="flex-1 flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg m-4">
    <div className="text-center max-w-md">
      <div className="text-red-600 text-xl font-semibold mb-2">Canvas Error</div>
      <div className="text-red-700 text-sm mb-4">
        {error.message || 'An unexpected error occurred in the canvas'}
      </div>
      <div className="space-x-2">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reset Canvas
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-red-600">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  className = '',
  onElementSelect,
  onElementHover,
  onCanvasError
}) => {
  const { 
    errors, 
    clearErrors, 
    reportError,
    selectedElementId
  } = useCanvasStore();
  
  const { canUndo, canRedo, undo, redo } = useCanvasHistory();

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string | null) => {
    onElementSelect?.(elementId);
  }, [onElementSelect]);

  // Handle element hover
  const handleElementHover = useCallback((elementId: string | null) => {
    onElementHover?.(elementId);
  }, [onElementHover]);

  // Handle canvas errors
  const handleCanvasError = useCallback((error: CanvasError) => {
    console.error('Canvas error:', error);
    onCanvasError?.(error);
  }, [onCanvasError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      try {
        if ((event.ctrlKey || event.metaKey)) {
          switch (event.key.toLowerCase()) {
            case 'z':
              event.preventDefault();
              if (event.shiftKey) {
                if (canRedo) redo();
              } else {
                if (canUndo) undo();
              }
              break;
            case 'y':
              event.preventDefault();
              if (canRedo) redo();
              break;
          }
        }

        // Delete selected element
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (selectedElementId && selectedElementId !== 'root-body') {
            event.preventDefault();
            useCanvasStore.getState().deleteElement(selectedElementId);
          }
        }

        // Escape to deselect
        if (event.key === 'Escape') {
          event.preventDefault();
          useCanvasStore.getState().selectElement(null);
        }
      } catch (error) {
        reportError(new CanvasError(
          'Error handling keyboard shortcut',
          'KEYBOARD_ERROR',
          selectedElementId || undefined,
          error as Error
        ));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, selectedElementId, reportError]);

  // Clear errors on mount
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  // Log errors for debugging
  useEffect(() => {
    if (errors.length > 0) {
      const latestError = errors[errors.length - 1];
      console.error('Canvas Error Log:', latestError);
      handleCanvasError(latestError);
    }
  }, [errors, handleCanvasError]);

  return (
    <ErrorBoundary
      FallbackComponent={CanvasErrorFallback}
      onError={(error, _errorInfo) => {
        const canvasError = new CanvasError(
          'React Error Boundary triggered',
          'REACT_ERROR_BOUNDARY',
          selectedElementId || undefined,
          error
        );
        reportError(canvasError);
      }}
      onReset={() => {
        clearErrors();
        // Reset to initial state if needed
        useCanvasStore.getState().selectElement(null);
      }}
    >
      <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
        {/* Breakpoint Controls */}
        <BreakpointControls />
        
        {/* Main Canvas Area */}
        <div className="flex-1 relative min-h-0">
          <SandboxedCanvas
            onElementSelect={handleElementSelect}
            onElementHover={handleElementHover}
            onError={handleCanvasError}
            className="w-full h-full"
          />
          
          {/* Canvas Overlay - Keyboard shortcuts help */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded pointer-events-none">
              <div className="space-y-1">
                <div><kbd>Ctrl+Z</kbd> Undo</div>
                <div><kbd>Ctrl+Shift+Z</kbd> Redo</div>
                <div><kbd>Del</kbd> Delete</div>
                <div><kbd>Esc</kbd> Deselect</div>
              </div>
            </div>
          )}
          
          {/* Error notifications */}
          {errors.length > 0 && (
            <div className="absolute bottom-4 right-4 max-w-sm">
              {errors.slice(-3).map((error, index) => (
                <div
                  key={`${error.code}-${index}`}
                  className="mb-2 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-800"
                >
                  <div className="font-medium">{error.code}</div>
                  <div className="text-xs mt-1">{error.message}</div>
                  <button
                    onClick={clearErrors}
                    className="text-xs text-red-600 hover:text-red-800 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />
      </div>
    </ErrorBoundary>
  );
};