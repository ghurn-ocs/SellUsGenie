# Visual Page Builder Architecture Documentation

## Overview

SellUsGenie's Visual Page Builder is a comprehensive drag-and-drop interface that allows store owners to create and customize their storefronts without coding knowledge. The system is built with React, TypeScript, and follows a modular widget-based architecture.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Page Builder System                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Editor UI     │  │ Widget       │  │ Storefront Renderer    │ │
│  │ - Canvas      │  │ Registry     │  │ - VisualPageBuilder-   │ │
│  │ - Panels      │  │ - Types      │  │   StoreFront           │ │
│  │ - Controls    │  │ - Configs    │  │ - PageBuilderRenderer  │ │
│  └───────────────┘  └──────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Widget System                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Content      │  │ Media        │  │ Commerce         │  │ │
│  │  │ - Text       │  │ - Image      │  │ - Product Grid   │  │ │
│  │  │ - Button     │  │ - Gallery    │  │ - Featured       │  │ │
│  │  │ - Form       │  │ - Carousel   │  │ - Cart           │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────┐                       │ │
│  │  │ Layout       │  │ System       │                       │ │
│  │  │ - Spacer     │  │ - Header     │                       │ │
│  │  │ - Divider    │  │ - Footer     │                       │ │
│  │  │ - Navigation │  │              │                       │ │
│  │  └──────────────┘  └──────────────┘                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     Data Layer                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Supabase     │  │ Page         │  │ Multi-Tenant     │  │ │
│  │  │ Database     │  │ Repository   │  │ Security         │  │ │
│  │  │ - Documents  │  │ - CRUD Ops   │  │ - RLS Policies   │  │ │
│  │  │ - History    │  │ - Versioning │  │ - Store          │  │ │
│  │  │ - System     │  │ - Publishing │  │   Isolation      │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Page Document Structure

The foundation of the page builder is the hierarchical document structure:

```typescript
PageDocument
└── sections: Section[]
    └── rows: Row[]
        └── widgets: WidgetBase[]
```

**Key Features:**
- **Sections**: Vertical containers with backgrounds and styling
- **Rows**: 12-column grid system for horizontal layout
- **Widgets**: Individual components with props and configuration
- **Responsive**: Breakpoint-specific styling (sm/md/lg)
- **Versioning**: Complete history tracking with restore capabilities

### 2. Widget System

#### Widget Registry Architecture
```typescript
class WidgetRegistry {
  private widgets = Map<WidgetType, WidgetConfig>
  
  // Core methods
  register(config: WidgetConfig): void
  get(type: WidgetType): WidgetConfig | undefined
  createWidget(type: WidgetType, id: string): Widget
  migrateWidget(widget: Widget, targetVersion: number): Widget
}
```

#### Widget Configuration
```typescript
interface WidgetConfig {
  type: WidgetType
  name: string
  description: string
  icon: string
  category: 'content' | 'media' | 'commerce' | 'layout'
  defaultColSpan: BreakpointSpan
  schema: ZodSchema // Props validation
  defaultProps: unknown
  Editor: React.ComponentType<WidgetEditorProps>
  View: React.ComponentType<WidgetViewProps>
  migrate?: (widget: WidgetBase, targetVersion: number) => WidgetBase
  systemWidget?: boolean // Hidden from user library
}
```

#### Widget Types

**Content Widgets:**
- `text` - Rich text editor with HTML support
- `button` - Configurable call-to-action buttons
- `form` - Contact and lead generation forms
- `hero` - Large promotional banners

**Media Widgets:**
- `image` - Single images with optimization
- `gallery` - Image collections with lightbox
- `carousel` - Rotating content sliders
- `video` - Embedded video content

**Commerce Widgets:**
- `productGrid` - Product listings with filters
- `featuredProduct` - Individual product showcases
- `cart` - Shopping cart integration

**Layout Widgets:**
- `spacer` - Vertical spacing control
- `divider` - Section separators
- `navigation` - Menu and link structures

**System Widgets:**
- `header-layout` - Site-wide header configuration
- `footer-layout` - Site-wide footer configuration

### 3. Editor Interface

#### Canvas Architecture
```
┌─────────────────────────────────────────┐
│ Top Bar (Save, Publish, Preview)        │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────────────────┐ ┌─────────┐ │
│ │Left │ │     Canvas      │ │ Right   │ │
│ │Panel│ │   ┌─────────┐   │ │ Panel   │ │
│ │     │ │   │Section 1│   │ │         │ │
│ │Wid- │ │   │ ┌─────┐ │   │ │ Props   │ │
│ │gets │ │   │ │Row 1│ │   │ │ Style   │ │
│ │     │ │   │ └─────┘ │   │ │ SEO     │ │
│ │Tree │ │   └─────────┘   │ │ ...     │ │
│ │     │ │   ┌─────────┐   │ │         │ │
│ │     │ │   │Section 2│   │ │         │ │
│ │     │ │   └─────────┘   │ │         │ │
│ └─────┘ └─────────────────┘ └─────────┘ │
└─────────────────────────────────────────┘
```

#### Key Editor Components

**Canvas System:**
- `CanvasSection` - Section-level drag/drop and configuration
- `CanvasRow` - Row-level widget management
- `CanvasWidget` - Individual widget rendering and selection
- `GridGuides` - Visual grid system for alignment

**Panel System:**
- `WidgetLibrary` - Draggable widget gallery
- `PropertiesPanel` - Selected element configuration
- `LayersPanel` - Page structure tree view
- `SEOPanel` - Meta tags and optimization
- `SettingsPanel` - Page-level settings

**Control Components:**
- `ResponsiveControls` - Breakpoint switching
- `BreakpointControls` - Device preview modes
- `TopBar` - Primary actions (save, publish, preview)

### 4. Storefront Rendering

#### Rendering Architecture
The storefront uses two distinct rendering approaches:

**System Pages (Header/Footer):**
```typescript
// Direct rendering approach for consistent system elements
const headerWidget = extractHeaderWidget(systemPages.header);
return (
  <header className="storefront-header">
    <HeaderLayoutView widget={headerWidget} />
  </header>
);
```

**Regular Pages:**
```typescript
// Generic rendering through PageBuilderRenderer
return (
  <PageBuilderRenderer
    page={currentPage}
    isSystemPage={false}
    storeData={storeData}
  />
);
```

#### Key Rendering Components

**VisualPageBuilderStoreFront:**
- Main storefront container
- Handles system page loading and rendering
- Manages page routing and content selection
- Integrates store data injection

**PageBuilderRenderer:**
- Generic page content renderer
- Widget resolution through registry
- Responsive layout management
- Error boundary handling

**HeaderLayoutView/FooterLayoutView:**
- Specialized system page renderers
- Direct integration with store data
- Consistent cross-page experience

### 5. Data Management

#### Database Schema
```sql
-- Core page storage
page_documents (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  slug TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  page_type TEXT DEFAULT 'page',
  system_page_type TEXT,
  is_system_page BOOLEAN DEFAULT FALSE,
  -- ... additional fields
)

-- Version history
page_history (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES page_documents(id),
  version INTEGER NOT NULL,
  author_id UUID,
  note TEXT,
  snapshot JSONB NOT NULL
)
```

#### Repository Pattern
```typescript
interface PageRepository {
  getPage(id: string): Promise<PageDocument | null>
  saveDraft(doc: PageDocument): Promise<void>
  publish(id: string): Promise<void>
  listPages(): Promise<PageDocument[]>
  createPage(name: string, template?: PageTemplate): Promise<PageDocument>
  getVersion(id: string, versionId: string): Promise<PageDocument | null>
  restoreVersion(id: string, versionId: string): Promise<void>
  deletePage(id: string): Promise<void>
}
```

#### Multi-Tenant Security
- **Row Level Security (RLS):** All queries automatically filter by store_id
- **Context Isolation:** Separate widget instances per store
- **Data Validation:** Zod schemas prevent malicious content injection
- **Store Boundaries:** Widgets cannot access cross-store data

## Development Workflows

### 1. Adding New Widgets

**Step 1: Create Widget Structure**
```bash
mkdir src/pageBuilder/widgets/my-widget
touch src/pageBuilder/widgets/my-widget/index.ts
touch src/pageBuilder/widgets/my-widget/MyWidgetEditor.tsx
touch src/pageBuilder/widgets/my-widget/MyWidgetView.tsx
```

**Step 2: Define Widget Types**
```typescript
// types.ts
export interface MyWidgetProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}
```

**Step 3: Implement View Component**
```typescript
// MyWidgetView.tsx
import type { Widget } from '../../types';
import type { MyWidgetProps } from './types';

export const MyWidgetView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const { props } = widget as Widget<MyWidgetProps>;
  
  return (
    <div className="my-widget">
      <h2>{props.title}</h2>
      <p>{props.content}</p>
      {props.buttonText && (
        <a href={props.buttonUrl} className="btn">
          {props.buttonText}
        </a>
      )}
    </div>
  );
};
```

**Step 4: Implement Editor Component**
```typescript
// MyWidgetEditor.tsx
export const MyWidgetEditor: React.FC<WidgetEditorProps> = ({ 
  widget, 
  onChange 
}) => {
  const { props } = widget as Widget<MyWidgetProps>;
  
  const updateProps = (newProps: Partial<MyWidgetProps>) => {
    onChange({ props: { ...props, ...newProps } });
  };
  
  return (
    <div className="space-y-4">
      <input 
        value={props.title}
        onChange={(e) => updateProps({ title: e.target.value })}
        placeholder="Widget title"
      />
      {/* Additional form fields */}
    </div>
  );
};
```

**Step 5: Register Widget**
```typescript
// index.ts
import { z } from 'zod';
import { widgetRegistry } from '../registry';
import { MyWidgetEditor } from './MyWidgetEditor';
import { MyWidgetView } from './MyWidgetView';

const myWidgetSchema = z.object({
  title: z.string(),
  content: z.string(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
});

widgetRegistry.register({
  type: 'my-widget',
  name: 'My Widget',
  description: 'Custom widget description',
  icon: 'square',
  category: 'content',
  defaultColSpan: { sm: 12, md: 6, lg: 4 },
  schema: myWidgetSchema,
  defaultProps: {
    title: 'New Widget',
    content: 'Widget content here',
  },
  Editor: MyWidgetEditor,
  View: MyWidgetView,
});
```

### 2. System Page Customization

**Header Layout Widget:**
- Located in `src/pageBuilder/widgets/header-layout/`
- Handles logo, navigation, cart, and contact information
- Automatically integrates with store data (name, logo, etc.)
- Supports responsive behavior and mobile hamburger menus

**Footer Layout Widget:**
- Located in `src/pageBuilder/widgets/footer-layout/`
- Manages company info, contact details, social links, newsletter signup
- Configurable column system (1-4 columns)
- Legal links and copyright information

**Customization Process:**
1. Access via Page Builder → Edit Header/Footer
2. Configure through specialized editor interfaces
3. Changes apply site-wide automatically
4. Preview changes in real-time

### 3. Performance Optimization

**Bundle Splitting:**
- Widget editors loaded on-demand during editing
- Storefront views bundled separately for faster loading
- Code splitting at widget level prevents large initial bundles

**Rendering Optimization:**
- React.memo on widget components
- Selective re-rendering based on props changes
- Virtual scrolling for large page lists

**Database Optimization:**
- Indexed queries on store_id and page status
- JSONB indexing for section content searches
- Connection pooling for concurrent editing sessions

**Image Optimization:**
- Automatic WebP conversion
- Responsive image variants
- Lazy loading with intersection observer

## Testing Strategy

### 1. Unit Testing

**Widget Testing:**
```typescript
// MyWidget.test.tsx
import { render } from '@testing-library/react';
import { MyWidgetView } from './MyWidgetView';

test('renders widget with props', () => {
  const widget = {
    id: '1',
    type: 'my-widget',
    props: { title: 'Test Title', content: 'Test Content' }
  };
  
  const { getByText } = render(<MyWidgetView widget={widget} />);
  expect(getByText('Test Title')).toBeInTheDocument();
});
```

**Registry Testing:**
```typescript
// registry.test.ts
import { widgetRegistry } from './registry';

test('registers widget correctly', () => {
  const config = {
    type: 'test-widget',
    name: 'Test Widget',
    // ... other config
  };
  
  widgetRegistry.register(config);
  expect(widgetRegistry.has('test-widget')).toBe(true);
});
```

### 2. Integration Testing

**Page Builder Integration:**
```typescript
// pageBuilder.integration.test.tsx
test('creates page with widgets', async () => {
  const repository = new SupabasePageRepository('test-store-id');
  const page = await repository.createPage('Test Page');
  
  expect(page.sections).toHaveLength(1);
  expect(page.sections[0].rows).toHaveLength(1);
});
```

**Storefront Rendering:**
```typescript
// storefront.integration.test.tsx
test('renders storefront with header and footer', () => {
  const { getByTestId } = render(
    <VisualPageBuilderStoreFront 
      storeId="test-store"
      storeName="Test Store"
    />
  );
  
  expect(getByTestId('storefront-header')).toBeInTheDocument();
  expect(getByTestId('storefront-footer')).toBeInTheDocument();
});
```

### 3. E2E Testing

**Page Creation Flow:**
```typescript
// e2e/page-creation.spec.ts
test('creates and publishes page', async ({ page }) => {
  await page.goto('/admin/pages');
  await page.click('[data-testid="create-page"]');
  await page.fill('input[name="pageName"]', 'Test Page');
  await page.click('[data-testid="save-page"]');
  await page.click('[data-testid="publish-page"]');
  
  expect(page.locator('[data-status="published"]')).toBeVisible();
});
```

**Widget Interaction:**
```typescript
// e2e/widget-editing.spec.ts
test('adds and configures widget', async ({ page }) => {
  await page.goto('/admin/page-builder/test-page');
  
  // Drag widget to canvas
  await page.dragAndDrop(
    '[data-widget="text"]',
    '[data-drop-zone="section-1"]'
  );
  
  // Configure widget
  await page.click('[data-widget-id="text-1"]');
  await page.fill('[data-field="content"]', 'Hello World');
  await page.click('[data-action="save"]');
  
  expect(page.locator('text=Hello World')).toBeVisible();
});
```

## Troubleshooting Guide

### Common Development Issues

**1. Widget Not Appearing in Library**
```typescript
// Check registration
console.log('Registered widgets:', widgetRegistry.getAll().map(w => w.type));

// Ensure widget is imported
import './widgets/my-widget'; // Must be imported somewhere
```

**2. Props Not Updating in Editor**
```typescript
// Correct onChange usage
const updateProps = (newProps: Partial<WidgetProps>) => {
  onChange({ 
    props: { ...widget.props, ...newProps } 
  });
};

// Don't mutate props directly
// ❌ widget.props.title = newTitle;
// ✅ updateProps({ title: newTitle });
```

**3. Styling Issues**
```typescript
// Ensure Tailwind classes are applied
const getWidgetClasses = (colSpan: BreakpointSpan) => {
  // Use template literals with proper spacing
  return `
    col-span-${colSpan.sm || 12}
    md:col-span-${colSpan.md || colSpan.sm || 12}
    lg:col-span-${colSpan.lg || colSpan.md || colSpan.sm || 12}
  `.trim();
};
```

**4. Type Errors**
```typescript
// Use generic Widget type for proper typing
export const MyWidgetView: React.FC<WidgetViewProps> = ({ widget }) => {
  const { props } = widget as Widget<MyWidgetProps>;
  // Now props is properly typed
};

// Ensure WidgetType union includes your widget
export type WidgetType = 
  | 'text' 
  | 'button' 
  | 'my-widget' // Add your widget type here
  | /* ... other types */;
```

**5. Store Data Not Loading**
```typescript
// Check useStore hook
import { useStore } from '../../../contexts/StoreContext';

export const MyWidgetView: React.FC<WidgetViewProps> = ({ widget }) => {
  const { currentStore } = useStore();
  
  // Provide fallbacks
  const storeName = currentStore?.store_name || props.fallbackName || 'Your Store';
  
  // Debug store loading
  useEffect(() => {
    console.log('Current store:', currentStore);
  }, [currentStore]);
};
```

### Performance Debugging

**1. Slow Rendering**
```typescript
// Use React DevTools Profiler
// Add React.memo to prevent unnecessary re-renders
export const MyWidgetView = React.memo<WidgetViewProps>(({ widget, theme }) => {
  // Component implementation
});

// Check for expensive operations in render
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props);
}, [props.relevantField]); // Don't depend on entire props
```

**2. Memory Leaks**
```typescript
// Clean up subscriptions and timeouts
useEffect(() => {
  const subscription = someObservable.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// Use AbortController for fetch requests
useEffect(() => {
  const abortController = new AbortController();
  
  fetch('/api/data', { signal: abortController.signal })
    .then(handleResponse)
    .catch(handleError);
    
  return () => {
    abortController.abort();
  };
}, []);
```

### Database Issues

**1. RLS Policy Problems**
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'page_documents';

-- Verify store_id is properly set
SELECT store_id, name FROM page_documents WHERE id = 'your-page-id';
```

**2. JSON Schema Validation**
```typescript
// Validate sections structure
const isValidSection = (section: any): section is Section => {
  return section &&
    typeof section.id === 'string' &&
    Array.isArray(section.rows) &&
    section.rows.every(isValidRow);
};

// Debug JSON parsing issues
try {
  const sections = JSON.parse(sectionData);
  console.log('Parsed sections:', sections);
} catch (error) {
  console.error('JSON parsing failed:', error);
  // Handle malformed data
}
```

## Future Architecture Considerations

### Planned Enhancements

1. **Widget Marketplace**: Third-party widget distribution system
2. **Advanced Animations**: Timeline-based animation editor
3. **A/B Testing**: Built-in split testing for page variants
4. **Collaboration**: Real-time collaborative editing
5. **AI Integration**: Smart content generation and optimization suggestions

### Scalability Improvements

1. **Edge Rendering**: CDN-based page caching
2. **Streaming SSR**: Incremental page loading
3. **Worker Threads**: Background page processing
4. **GraphQL Integration**: More efficient data fetching
5. **Micro-frontends**: Independent widget loading

This architecture documentation provides a comprehensive overview of the Visual Page Builder system. For implementation details, refer to the source code and inline documentation.