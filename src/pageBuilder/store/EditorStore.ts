/**
 * Zustand Store for Page Builder State Management
 * Centralized state management for the entire page builder application
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  PageDocument, 
  WidgetBase, 
  Section, 
  Row, 
  Breakpoint, 
  StyleSettings,
  AnimationSettings,
  ResponsiveSettings 
} from '../types';

// Enhanced CSS Properties Interface
export interface CSSProperties {
  // Layout
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
  
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

// Enhanced Element Interface
export interface EnhancedElement extends WidgetBase {
  tagName: string;
  attributes: Record<string, string>;
  innerHTML?: string;
  textContent?: string;
  classList: string[];
  styles: {
    base: CSSProperties;
    hover?: CSSProperties;
    active?: CSSProperties;
    focus?: CSSProperties;
    responsive: {
      sm?: CSSProperties;
      md?: CSSProperties;
      lg?: CSSProperties;
    };
  };
  animations: {
    entrance?: AnimationSettings;
    hover?: AnimationSettings;
    scroll?: AnimationSettings;
    exit?: AnimationSettings;
  };
  interactions: {
    onClick?: string; // JavaScript code
    onHover?: string;
    onScroll?: string;
    onLoad?: string;
  };
  seo: {
    alt?: string;
    title?: string;
    ariaLabel?: string;
    role?: string;
  };
}

// CMS Collection Interface
export interface CMSCollection {
  id: string;
  name: string;
  slug: string;
  fields: CMSField[];
  items: CMSItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CMSField {
  id: string;
  name: string;
  slug: string;
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[]; // for select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CMSItem {
  id: string;
  collectionId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

// Enhanced Editor State
export interface EditorState {
  // Document
  document: PageDocument | null;
  isDirty: boolean;
  lastSaved: string | null;
  
  // Selection
  selectedElementId: string | null;
  selectedSectionId: string | null;
  selectedRowId: string | null;
  hoveredElementId: string | null;
  
  // View
  currentBreakpoint: Breakpoint;
  viewMode: 'design' | 'preview' | 'code';
  panelMode: 'elements' | 'styles' | 'interactions' | 'cms' | 'settings';
  showGrid: boolean;
  showRulers: boolean;
  showBoundingBoxes: boolean;
  
  // Canvas
  canvasScale: number;
  canvasOffset: { x: number; y: number };
  isDragging: boolean;
  dragData: any;
  
  // History
  undoStack: PageDocument[];
  redoStack: PageDocument[];
  
  // CMS
  collections: CMSCollection[];
  activeCollection: string | null;
  
  // Code Export
  generatedHTML: string;
  generatedCSS: string;
  
  // Assets
  uploadedImages: Array<{ id: string; url: string; alt: string; size: number }>;
  fonts: Array<{ family: string; weights: number[]; source: 'google' | 'custom' }>;
}

export interface EditorActions {
  // Document Actions
  loadDocument: (doc: PageDocument) => void;
  updateDocument: (updates: Partial<PageDocument>) => void;
  saveDocument: () => Promise<void>;
  publishDocument: () => Promise<void>;
  
  // Element Actions
  selectElement: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<EnhancedElement>) => void;
  addElement: (element: EnhancedElement, targetId?: string, position?: number) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, targetId: string, position: number) => void;
  
  // Style Actions
  updateElementStyles: (id: string, styles: Partial<CSSProperties>, breakpoint?: Breakpoint, state?: 'base' | 'hover' | 'active' | 'focus') => void;
  updateElementClass: (id: string, className: string, add: boolean) => void;
  
  // View Actions
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setViewMode: (mode: 'design' | 'preview' | 'code') => void;
  setPanelMode: (mode: 'elements' | 'styles' | 'interactions' | 'cms' | 'settings') => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleBoundingBoxes: () => void;
  
  // Canvas Actions
  setCanvasScale: (scale: number) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  resetCanvas: () => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // CMS Actions
  createCollection: (collection: Omit<CMSCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCollection: (id: string, updates: Partial<CMSCollection>) => void;
  deleteCollection: (id: string) => void;
  addCollectionItem: (collectionId: string, data: Record<string, any>) => void;
  updateCollectionItem: (collectionId: string, itemId: string, data: Record<string, any>) => void;
  deleteCollectionItem: (collectionId: string, itemId: string) => void;
  
  // Code Export Actions
  generateCode: () => void;
  exportHTML: () => string;
  exportCSS: () => string;
  
  // Asset Actions
  uploadImage: (file: File) => Promise<{ id: string; url: string }>;
  deleteImage: (id: string) => void;
  addFont: (font: { family: string; weights: number[]; source: 'google' | 'custom' }) => void;
}

// Create the store
export const useEditorStore = create<EditorState & EditorActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial State
      document: null,
      isDirty: false,
      lastSaved: null,
      
      selectedElementId: null,
      selectedSectionId: null,
      selectedRowId: null,
      hoveredElementId: null,
      
      currentBreakpoint: 'lg',
      viewMode: 'design',
      panelMode: 'elements',
      showGrid: false,
      showRulers: false,
      showBoundingBoxes: false,
      
      canvasScale: 1,
      canvasOffset: { x: 0, y: 0 },
      isDragging: false,
      dragData: null,
      
      undoStack: [],
      redoStack: [],
      
      collections: [],
      activeCollection: null,
      
      generatedHTML: '',
      generatedCSS: '',
      
      uploadedImages: [],
      fonts: [
        { family: 'Inter', weights: [400, 500, 600, 700], source: 'google' },
        { family: 'Roboto', weights: [300, 400, 500, 700], source: 'google' },
        { family: 'Poppins', weights: [400, 500, 600, 700], source: 'google' },
      ],
      
      // Actions
      loadDocument: (doc) => set((state) => {
        state.document = doc;
        state.isDirty = false;
        state.lastSaved = doc.updatedAt;
        state.undoStack = [];
        state.redoStack = [];
      }),
      
      updateDocument: (updates) => set((state) => {
        if (state.document) {
          // Save current state to undo stack
          state.undoStack.push(JSON.parse(JSON.stringify(state.document)));
          if (state.undoStack.length > 50) {
            state.undoStack.shift();
          }
          state.redoStack = [];
          
          // Apply updates
          Object.assign(state.document, updates);
          state.document.updatedAt = new Date().toISOString();
          state.isDirty = true;
        }
      }),
      
      saveDocument: async () => {
        const state = get();
        if (state.document) {
          try {
            // Save to localStorage for now (in production, save to Supabase)
            const storageKey = `page_builder_${state.document.id}`;
            const documentToSave = {
              ...state.document,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(documentToSave));
            
            console.log('Document saved:', documentToSave);
            set((draft) => {
              draft.isDirty = false;
              draft.lastSaved = new Date().toISOString();
              if (draft.document) {
                draft.document.updatedAt = new Date().toISOString();
              }
            });
            
            // TODO: Replace with actual Supabase save
            // const { error } = await supabase
            //   .from('pages')
            //   .upsert({
            //     id: state.document.id,
            //     store_id: currentStore.id,
            //     name: state.document.name,
            //     content: state.document,
            //     status: state.document.status,
            //     updated_at: new Date().toISOString()
            //   });
            
          } catch (error) {
            console.error('Error saving document:', error);
            throw error;
          }
        }
      },
      
      publishDocument: async () => {
        const state = get();
        if (state.document) {
          try {
            // Update document status
            const publishedDocument = {
              ...state.document,
              status: 'published' as const,
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Save to localStorage
            const storageKey = `page_builder_${state.document.id}`;
            localStorage.setItem(storageKey, JSON.stringify(publishedDocument));
            
            console.log('Document published:', publishedDocument);
            set((draft) => {
              if (draft.document) {
                draft.document.status = 'published';
                draft.document.publishedAt = new Date().toISOString();
                draft.document.updatedAt = new Date().toISOString();
                draft.isDirty = false;
                draft.lastSaved = new Date().toISOString();
              }
            });
            
            // TODO: Replace with actual Supabase publish
            // const { error } = await supabase
            //   .from('pages')
            //   .update({
            //     status: 'published',
            //     published_at: new Date().toISOString(),
            //     updated_at: new Date().toISOString()
            //   })
            //   .eq('id', state.document.id);
            
          } catch (error) {
            console.error('Error publishing document:', error);
            throw error;
          }
        }
      },
      
      selectElement: (id) => set((state) => {
        state.selectedElementId = id;
      }),
      
      updateElement: (id, updates) => set((state) => {
        if (!state.document) return;
        
        // Find and update the element
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const widget = row.widgets.find(w => w.id === id);
            if (widget) {
              Object.assign(widget, updates);
              state.isDirty = true;
              return;
            }
          }
        }
      }),
      
      updateElementStyles: (id, styles, breakpoint = 'lg', state_type = 'base') => set((state) => {
        if (!state.document) return;
        
        // Find and update the element styles
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const widget = row.widgets.find(w => w.id === id) as EnhancedElement;
            if (widget) {
              if (!widget.styles) {
                widget.styles = { base: {}, responsive: {} };
              }
              
              if (state_type === 'base') {
                if (breakpoint === 'lg') {
                  Object.assign(widget.styles.base, styles);
                } else {
                  if (!widget.styles.responsive[breakpoint]) {
                    widget.styles.responsive[breakpoint] = {};
                  }
                  Object.assign(widget.styles.responsive[breakpoint], styles);
                }
              } else {
                if (!widget.styles[state_type]) {
                  widget.styles[state_type] = {};
                }
                Object.assign(widget.styles[state_type], styles);
              }
              
              state.isDirty = true;
              return;
            }
          }
        }
      }),
      
      setBreakpoint: (breakpoint) => set((state) => {
        state.currentBreakpoint = breakpoint;
      }),
      
      setViewMode: (mode) => set((state) => {
        state.viewMode = mode;
      }),
      
      setPanelMode: (mode) => set((state) => {
        state.panelMode = mode;
      }),
      
      toggleGrid: () => set((state) => {
        state.showGrid = !state.showGrid;
      }),
      
      toggleRulers: () => set((state) => {
        state.showRulers = !state.showRulers;
      }),
      
      toggleBoundingBoxes: () => set((state) => {
        state.showBoundingBoxes = !state.showBoundingBoxes;
      }),
      
      setCanvasScale: (scale) => set((state) => {
        state.canvasScale = Math.max(0.1, Math.min(3, scale));
      }),
      
      setCanvasOffset: (offset) => set((state) => {
        state.canvasOffset = offset;
      }),
      
      resetCanvas: () => set((state) => {
        state.canvasScale = 1;
        state.canvasOffset = { x: 0, y: 0 };
      }),
      
      undo: () => set((state) => {
        if (state.undoStack.length > 0 && state.document) {
          state.redoStack.push(JSON.parse(JSON.stringify(state.document)));
          state.document = state.undoStack.pop()!;
          state.isDirty = true;
        }
      }),
      
      redo: () => set((state) => {
        if (state.redoStack.length > 0 && state.document) {
          state.undoStack.push(JSON.parse(JSON.stringify(state.document)));
          state.document = state.redoStack.pop()!;
          state.isDirty = true;
        }
      }),
      
      clearHistory: () => set((state) => {
        state.undoStack = [];
        state.redoStack = [];
      }),
      
      createCollection: (collection) => set((state) => {
        const newCollection: CMSCollection = {
          ...collection,
          id: `collection_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.collections.push(newCollection);
      }),
      
      updateCollection: (id, updates) => set((state) => {
        const collection = state.collections.find(c => c.id === id);
        if (collection) {
          Object.assign(collection, updates);
          collection.updatedAt = new Date().toISOString();
        }
      }),
      
      deleteCollection: (id) => set((state) => {
        state.collections = state.collections.filter(c => c.id !== id);
      }),
      
      addCollectionItem: (collectionId, data) => set((state) => {
        const collection = state.collections.find(c => c.id === collectionId);
        if (collection) {
          const newItem: CMSItem = {
            id: `item_${Date.now()}`,
            collectionId,
            data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: false,
          };
          collection.items.push(newItem);
        }
      }),
      
      updateCollectionItem: (collectionId, itemId, data) => set((state) => {
        const collection = state.collections.find(c => c.id === collectionId);
        if (collection) {
          const item = collection.items.find(i => i.id === itemId);
          if (item) {
            item.data = { ...item.data, ...data };
            item.updatedAt = new Date().toISOString();
          }
        }
      }),
      
      deleteCollectionItem: (collectionId, itemId) => set((state) => {
        const collection = state.collections.find(c => c.id === collectionId);
        if (collection) {
          collection.items = collection.items.filter(i => i.id !== itemId);
        }
      }),
      
      generateCode: () => set((state) => {
        // Generate HTML and CSS code
        const { html, css } = generatePageCode(state.document, state.collections);
        state.generatedHTML = html;
        state.generatedCSS = css;
      }),
      
      exportHTML: () => {
        const state = get();
        return state.generatedHTML;
      },
      
      exportCSS: () => {
        const state = get();
        return state.generatedCSS;
      },
      
      uploadImage: async (file) => {
        // Here you would upload to your storage service
        const url = URL.createObjectURL(file);
        const image = {
          id: `img_${Date.now()}`,
          url,
          alt: file.name,
          size: file.size,
        };
        
        set((state) => {
          state.uploadedImages.push(image);
        });
        
        return { id: image.id, url: image.url };
      },
      
      deleteImage: (id) => set((state) => {
        state.uploadedImages = state.uploadedImages.filter(img => img.id !== id);
      }),
      
      addFont: (font) => set((state) => {
        const exists = state.fonts.find(f => f.family === font.family);
        if (!exists) {
          state.fonts.push(font);
        }
      }),
      
      // Element manipulation actions
      addElement: (element, targetId, position) => set((state) => {
        if (!state.document) return;
        
        // Create a new element based on the provided element
        const newElement = {
          ...element,
          id: element.id || `element_${Date.now()}`,
        } as any;
        
        // Add to the first row of the first section if no target specified
        if (!targetId && state.document.sections.length > 0) {
          const firstSection = state.document.sections[0];
          if (firstSection.rows.length > 0) {
            const targetRow = firstSection.rows[0];
            if (typeof position === 'number') {
              targetRow.widgets.splice(position, 0, newElement);
            } else {
              targetRow.widgets.push(newElement);
            }
          }
        }
        
        state.isDirty = true;
      }),
      
      removeElement: (id) => set((state) => {
        if (!state.document) return;
        
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const index = row.widgets.findIndex(w => w.id === id);
            if (index !== -1) {
              row.widgets.splice(index, 1);
              state.isDirty = true;
              if (state.selectedElementId === id) {
                state.selectedElementId = null;
              }
              return;
            }
          }
        }
      }),
      
      duplicateElement: (id) => set((state) => {
        if (!state.document) return;
        
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const index = row.widgets.findIndex(w => w.id === id);
            if (index !== -1) {
              const originalElement = row.widgets[index];
              const duplicatedElement = {
                ...JSON.parse(JSON.stringify(originalElement)),
                id: `element_${Date.now()}`
              };
              row.widgets.splice(index + 1, 0, duplicatedElement);
              state.isDirty = true;
              return;
            }
          }
        }
      }),
      
      moveElement: (id, targetId, position) => set((state) => {
        if (!state.document) return;
        
        // Find and remove the element
        let elementToMove: any = null;
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const index = row.widgets.findIndex(w => w.id === id);
            if (index !== -1) {
              elementToMove = row.widgets.splice(index, 1)[0];
              break;
            }
          }
          if (elementToMove) break;
        }
        
        if (!elementToMove) return;
        
        // Find target and insert
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            if (row.id === targetId) {
              row.widgets.splice(position, 0, elementToMove);
              state.isDirty = true;
              return;
            }
          }
        }
      }),
      
      updateElementClass: (id, className, add) => set((state) => {
        if (!state.document) return;
        
        for (const section of state.document.sections) {
          for (const row of section.rows) {
            const widget = row.widgets.find(w => w.id === id) as EnhancedElement;
            if (widget) {
              if (!widget.classList) {
                widget.classList = [];
              }
              
              if (add) {
                if (!widget.classList.includes(className)) {
                  widget.classList.push(className);
                }
              } else {
                widget.classList = widget.classList.filter(cls => cls !== className);
              }
              
              state.isDirty = true;
              return;
            }
          }
        }
      }),
    }))
  )
);

// Helper function to generate page code
function generatePageCode(document: PageDocument | null, collections: CMSCollection[]) {
  if (!document) return { html: '', css: '' };
  
  // This would contain the complex logic to generate semantic HTML and optimized CSS
  // For now, returning basic structure
  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.seo?.metaTitle || document.name}</title>
    <meta name="description" content="${document.seo?.metaDescription || ''}">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Generated content would go here -->
</body>
</html>`,
    css: `/* Generated CSS styles would go here */`
  };
}