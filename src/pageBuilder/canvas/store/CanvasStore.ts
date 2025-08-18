/**
 * Fixed Canvas State Management - Simplified and working version
 */

import { create } from 'zustand';
import { 
  CanvasElement, 
  Breakpoint, 
  CSSProperties, 
  CanvasError
} from '../types/CanvasTypes';

interface CanvasState {
  elements: Record<string, CanvasElement>;
  rootId: string;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  activeBreakpoint: Breakpoint;
  dragState: {
    isDragging: boolean;
    draggedElementId: string | null;
    dropTargetId: string | null;
    dropPosition: 'before' | 'after' | 'inside' | null;
  };
  viewport: {
    width: number;
    height: number;
    scale: number;
  };
  errors: CanvasError[];
}

interface CanvasStore extends CanvasState {
  // Element Management
  createElement: (element: Omit<CanvasElement, 'id' | 'children'>, parentId?: string) => string;
  updateElementStyles: (elementId: string, styles: Partial<CSSProperties>, breakpoint?: Breakpoint) => void;
  updateElementTextContent: (elementId: string, textContent: string) => void;
  deleteElement: (elementId: string) => void;
  
  // Selection Management
  selectElement: (elementId: string | null) => void;
  hoverElement: (elementId: string | null) => void;
  
  // Drag and Drop
  startDrag: (elementId: string) => void;
  updateDragTarget: (targetId: string | null, position: 'before' | 'after' | 'inside' | null) => void;
  endDrag: () => void;
  
  // Breakpoint Management
  setActiveBreakpoint: (breakpoint: Breakpoint) => void;
  
  // Viewport Management
  updateViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  
  // Utility Functions
  getElementById: (elementId: string) => CanvasElement | null;
  getComputedStyles: (elementId: string, breakpoint?: Breakpoint) => CSSProperties;
  importCanvasData: (data: any) => void;
  
  // Error Handling
  reportError: (error: CanvasError) => void;
  clearErrors: () => void;
}

// Create initial canvas state
const createInitialState = (): CanvasState => {
  const rootId = 'root-body';
  const initialElement: CanvasElement = {
    id: rootId,
    tag: 'body',
    children: [],
    attributes: {},
    styles: {
      desktop: {
        margin: '0',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#1f2937'
      }
    }
  };

  return {
    elements: { [rootId]: initialElement },
    rootId,
    selectedElementId: null,
    hoveredElementId: null,
    activeBreakpoint: 'desktop',
    dragState: {
      isDragging: false,
      draggedElementId: null,
      dropTargetId: null,
      dropPosition: null
    },
    viewport: {
      width: 1200,
      height: 800,
      scale: 1
    },
    errors: []
  };
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...createInitialState(),

  // Element Management
  createElement: (elementData, parentId = 'root-body') => {
    const newId = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    set((state) => {
      const newElement: CanvasElement = {
        ...elementData,
        id: newId,
        children: [],
        parentId
      };

      const newElements = { ...state.elements };
      newElements[newId] = newElement;

      // Add to parent's children
      if (newElements[parentId]) {
        newElements[parentId] = {
          ...newElements[parentId],
          children: [...newElements[parentId].children, newId]
        };
      }

      return {
        elements: newElements,
        selectedElementId: newId
      };
    });
    
    return newId;
  },

  updateElementStyles: (elementId, styles, breakpoint = 'desktop') => {
    set((state) => {
      const element = state.elements[elementId];
      if (!element) return state;

      const newElements = { ...state.elements };
      const newElement = { ...element };
      const newStyles = { ...newElement.styles };
      
      if (breakpoint === 'desktop') {
        newStyles.desktop = { ...newStyles.desktop, ...styles };
      } else {
        newStyles[breakpoint] = { ...newStyles[breakpoint], ...styles };
      }
      
      newElement.styles = newStyles;
      newElements[elementId] = newElement;

      return { elements: newElements };
    });
  },

  updateElementTextContent: (elementId, textContent) => {
    set((state) => {
      const element = state.elements[elementId];
      if (!element) return state;

      const newElements = { ...state.elements };
      newElements[elementId] = { ...element, textContent };

      return { elements: newElements };
    });
  },

  deleteElement: (elementId) => {
    set((state) => {
      const element = state.elements[elementId];
      if (!element || elementId === state.rootId) return state;

      const newElements = { ...state.elements };

      // Remove from parent's children
      if (element.parentId && newElements[element.parentId]) {
        const parent = { ...newElements[element.parentId] };
        parent.children = parent.children.filter(id => id !== elementId);
        newElements[element.parentId] = parent;
      }

      // Remove element and all children
      const deleteRecursive = (id: string) => {
        const el = newElements[id];
        if (el) {
          el.children.forEach(deleteRecursive);
          delete newElements[id];
        }
      };
      deleteRecursive(elementId);

      return {
        elements: newElements,
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId
      };
    });
  },

  // Selection Management
  selectElement: (elementId) => set({ selectedElementId: elementId }),
  hoverElement: (elementId) => set({ hoveredElementId: elementId }),

  // Drag and Drop
  startDrag: (elementId) => set((state) => ({
    dragState: {
      isDragging: true,
      draggedElementId: elementId,
      dropTargetId: null,
      dropPosition: null
    }
  })),

  updateDragTarget: (targetId, position) => set((state) => ({
    dragState: {
      ...state.dragState,
      dropTargetId: targetId,
      dropPosition: position
    }
  })),

  endDrag: () => set({
    dragState: {
      isDragging: false,
      draggedElementId: null,
      dropTargetId: null,
      dropPosition: null
    }
  }),

  // Breakpoint Management
  setActiveBreakpoint: (breakpoint) => set({ activeBreakpoint: breakpoint }),

  // Viewport Management
  updateViewport: (viewport) => set((state) => ({
    viewport: { ...state.viewport, ...viewport }
  })),

  // Utility Functions
  getElementById: (elementId) => {
    return get().elements[elementId] || null;
  },

  getComputedStyles: (elementId, breakpoint) => {
    const element = get().elements[elementId];
    if (!element) return {};
    
    const bp = breakpoint || get().activeBreakpoint;
    const baseStyles = element.styles.desktop || {};
    const responsiveStyles = element.styles[bp] || {};
    
    return { ...baseStyles, ...responsiveStyles };
  },

  importCanvasData: (data) => {
    if (data && data.version === '1.0' && data.elements && data.rootId) {
      set({
        elements: data.elements,
        rootId: data.rootId,
        selectedElementId: null,
        hoveredElementId: null
      });
    }
  },

  // Error Handling
  reportError: (error) => {
    console.error('Canvas Error:', error);
    set((state) => ({
      errors: [...state.errors.slice(-9), error] // Keep last 10 errors
    }));
  },

  clearErrors: () => set({ errors: [] })
}));

// Selector hooks for optimized re-renders
export const useSelectedElement = () => useCanvasStore(state => 
  state.selectedElementId ? state.elements[state.selectedElementId] : null
);

export const useHoveredElement = () => useCanvasStore(state => 
  state.hoveredElementId ? state.elements[state.hoveredElementId] : null
);

export const useCanvasElements = () => useCanvasStore(state => state.elements);

export const useActiveBreakpoint = () => useCanvasStore(state => state.activeBreakpoint);

export const useDragState = () => useCanvasStore(state => state.dragState);

export const useCanvasHistory = () => useCanvasStore(state => ({
  canUndo: false, // Simplified - no history for now
  canRedo: false,
  undo: () => {},
  redo: () => {}
}));