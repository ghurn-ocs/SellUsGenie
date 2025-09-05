/**
 * Page Builder Core Types
 * Defines the data model and interfaces for the visual page builder system
 */

export type Breakpoint = 'sm' | 'md' | 'lg';
export type BreakpointSpan = { sm?: number; md?: number; lg?: number }; // 1..12
export type WidgetType = 
  | 'text' 
  | 'button' 
  | 'image' 
  | 'hero' 
  | 'spacer' 
  | 'productGrid' 
  | 'featuredProduct' 
  | 'divider'
  | 'gallery'
  | 'video'
  | 'form'
  | 'testimonial'
  | 'pricing'
  | 'countdown'
  | 'social'
  | 'map'
  | 'accordion'
  | 'tabs'
  | 'carousel'
  | 'newsletter'
  | 'search'
  | 'breadcrumb'
  | 'stats'
  | 'team'
  | 'faq'
  | 'blog'
  | 'reviews'
  | 'cta'
  | 'feature'
  | 'logo'
  | 'chart';

export interface StyleSettings {
  background?: {
    type: 'color' | 'gradient' | 'image' | 'video';
    value: string;
    overlay?: string;
    position?: string;
    size?: string;
  };
  spacing?: {
    padding?: { top?: number; right?: number; bottom?: number; left?: number };
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
  };
  border?: {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
    radius?: number;
  };
  shadow?: {
    x?: number;
    y?: number;
    blur?: number;
    spread?: number;
    color?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface AnimationSettings {
  type?: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'rotateIn';
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  trigger?: 'onLoad' | 'onScroll' | 'onHover' | 'onClick';
}

export interface ResponsiveSettings {
  sm?: StyleSettings;
  md?: StyleSettings;
  lg?: StyleSettings;
}

export interface WidgetBase {
  id: string;
  type: WidgetType;
  version: number;      // for per-widget migrations
  colSpan: BreakpointSpan;
  props: unknown;       // validated by widget-specific Zod schema
  visibility?: { sm?: boolean; md?: boolean; lg?: boolean };
  styles?: ResponsiveSettings;
  animations?: AnimationSettings;
  customCSS?: string;
  conditions?: {
    showWhen?: string; // JavaScript expression
    hideWhen?: string; // JavaScript expression
  };
}

// Generic Widget type with typed props
export type Widget<T = unknown> = Omit<WidgetBase, 'props'> & {
  props: T;
};

export interface Row {
  id: string;
  widgets: WidgetBase[];
}

export interface Section {
  id: string;
  title?: string;
  rows: Row[];
  background?: { 
    colorToken?: string; 
    imageUrl?: string;
    videoUrl?: string;
  };
  padding?: string;
}

export interface PageDocument {
  id: string;
  name: string;
  slug?: string;
  version: number;      // for page-level migrations
  themeOverrides?: Record<string, string>;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published" | "archived" | "scheduled";
  publishedAt?: string;
  scheduledFor?: string;
  // System page properties
  pageType?: string;
  isSystemPage?: boolean;
  systemPageType?: string;
  editingRestrictions?: Record<string, any>;
  navigationPlacement?: 'header' | 'footer' | 'both' | 'none';
  footerColumn?: 1 | 2 | 3 | 4;
  history?: { 
    id: string; 
    createdAt: string; 
    authorId: string; 
    note?: string;
    version: number;
    snapshot?: PageDocument;
  }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    openGraphTitle?: string;
    openGraphDescription?: string;
    openGraphImage?: string;
    twitterCard?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    structuredData?: Record<string, any>;
  };
  analytics?: {
    trackingId?: string;
    events?: { name: string; selector: string; action: string }[];
    heatmap?: boolean;
    scrollTracking?: boolean;
  };
  performance?: {
    lazyLoading?: boolean;
    imageOptimization?: boolean;
    minifyCSS?: boolean;
    minifyJS?: boolean;
  };
  accessibility?: {
    altTextRequired?: boolean;
    contrastChecking?: boolean;
    keyboardNavigation?: boolean;
    screenReaderSupport?: boolean;
  };
  customCode?: {
    headHTML?: string;
    bodyHTML?: string;
    css?: string;
    javascript?: string;
  };
  globalStyles?: {
    fonts?: Array<{ family: string; weights: number[]; source: 'google' | 'custom' | 'system' }>;
    colors?: Record<string, string>;
    spacing?: Record<string, number>;
    breakpoints?: Record<string, number>;
  };
  colorPalette?: {
    paletteId: string;
    customColors?: Partial<ColorPalette['colors']>;
    applyOptions?: ColorPaletteApplyOptions;
  };
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  document: Omit<PageDocument, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'history'>;
}

export interface EditorState {
  selectedWidgetId: string | null;
  selectedSectionId: string | null;
  selectedRowId: string | null;
  isDragging: boolean;
  dragSource: {
    widgetId: string;
    sectionId: string;
    rowId: string;
  } | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  undoStack: PageDocument[];
  redoStack: PageDocument[];
  isDirty: boolean;
  lastSaved: string | null;
  autoSaveInterval: NodeJS.Timeout | null;
}

export interface PageRepository {
  getPage(id: string): Promise<PageDocument | null>;
  saveDraft(doc: PageDocument): Promise<void>;
  publish(id: string): Promise<void>;
  listPages(): Promise<PageDocument[]>;
  createPage(name: string, template?: PageTemplate): Promise<PageDocument>;
  getVersion(id: string, versionId: string): Promise<PageDocument | null>;
  restoreVersion(id: string, versionId: string): Promise<void>;
  deletePage(id: string): Promise<void>;
}

export interface WidgetConfig {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'media' | 'commerce' | 'layout';
  defaultColSpan: BreakpointSpan;
  schema: any; // Zod schema
  defaultProps: unknown;
  Editor: React.ComponentType<WidgetEditorProps>;
  View: React.ComponentType<WidgetViewProps>;
  migrate?: (widget: WidgetBase, targetVersion: number) => WidgetBase;
  systemWidget?: boolean; // If true, widget is not shown in user widget library
}

export interface WidgetEditorProps {
  widget: WidgetBase;
  onChange: (updates: Partial<WidgetBase>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export interface WidgetViewProps {
  widget: WidgetBase;
  theme?: Record<string, string>;
}

export interface DragItem {
  type: 'widget' | 'new-widget';
  widget?: WidgetBase;
  widgetType?: WidgetType;
  sourceSectionId?: string;
  sourceRowId?: string;
}

export interface DropResult {
  sectionId: string;
  rowId: string;
  position: number;
  colSpan?: BreakpointSpan;
}

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  storeId: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'minimal' | 'bold' | 'nature' | 'elegant';
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
    background: string;
    backgroundSecondary: string;
    backgroundAccent: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    border: string;
    borderHover: string;
    shadow: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonSecondary: string;
    buttonSecondaryHover: string;
    headerBackground: string;
    headerText: string;
    footerBackground: string;
    footerText: string;
  };
}

export interface ColorPaletteApplyOptions {
  backgrounds?: boolean;
  buttons?: boolean;
  text?: boolean;
  borders?: boolean;
  headerFooter?: boolean;
  customElements?: string[];
}

export interface PageBuilderConfig {
  user: User;
  storeId: string;
  repository: PageRepository;
  onSave?: (doc: PageDocument) => void;
  onPublish?: (doc: PageDocument) => void;
  onError?: (error: Error) => void;
}
