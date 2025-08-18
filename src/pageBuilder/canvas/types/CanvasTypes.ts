/**
 * Canvas Data Model - Hierarchical JSON structure for WYSIWYG editor
 * Part of the no-code web builder canvas component
 */

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface CSSProperties {
  // Layout
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;
  
  // Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  
  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
  
  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  
  // Border
  border?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderRadius?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  
  // Shadow & Effects
  boxShadow?: string;
  textShadow?: string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Transform
  transform?: string;
  transformOrigin?: string;
  
  // Transition & Animation
  transition?: string;
  animation?: string;
  
  // Z-index
  zIndex?: number;
  
  // Cursor
  cursor?: 'default' | 'pointer' | 'text' | 'not-allowed' | 'grab' | 'grabbing';
}

export interface ResponsiveStyles {
  desktop: CSSProperties;
  tablet?: Partial<CSSProperties>;
  mobile?: Partial<CSSProperties>;
}

export interface CanvasElement {
  id: string;
  tag: string;
  parentId?: string;
  children: string[]; // Array of child element IDs
  textContent?: string;
  attributes: Record<string, string>;
  styles: ResponsiveStyles;
  isLocked?: boolean;
  isVisible?: boolean;
  className?: string;
  order?: number; // For ordering within parent
}

export interface CanvasState {
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
  history: {
    past: CanvasState[];
    present: CanvasState;
    future: CanvasState[];
  };
  viewport: {
    width: number;
    height: number;
    scale: number;
  };
}

export interface DragIndicator {
  targetId: string;
  position: 'before' | 'after' | 'inside';
  rect: DOMRect;
}

export interface BreadcrumbItem {
  id: string;
  tag: string;
  name: string;
}

// Message types for iframe communication
export interface CanvasMessage {
  type: 
    | 'IFRAME_READY'
    | 'CLICK_ELEMENT' 
    | 'DOUBLE_CLICK_ELEMENT' 
    | 'HOVER_ELEMENT'
    | 'DRAG_START' 
    | 'UPDATE_DRAG_TARGET'
    | 'DRAG_END' 
    | 'UPDATE_TEXT_CONTENT'
    | 'DROP_TEMPLATE_ELEMENT'
    | 'RENDER_ELEMENTS' 
    | 'UPDATE_SELECTION' 
    | 'UPDATE_HOVER' 
    | 'UPDATE_VIEWPORT';
  payload: any;
  timestamp?: number;
}

export interface ElementTemplate {
  id: string;
  name: string;
  tag: string;
  defaultStyles: ResponsiveStyles;
  defaultAttributes: Record<string, string>;
  defaultTextContent?: string;
  category: string;
  icon?: string;
}

// Error types
export class CanvasError extends Error {
  constructor(
    message: string,
    public code: string,
    public elementId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'CanvasError';
  }
}

export interface CanvasErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}