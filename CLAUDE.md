# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the SellUsGenie project.

## 🚨 CRITICAL SESSION STARTUP REQUIREMENTS

**MANDATORY**: At the start of EVERY new Claude Code session, you MUST:

1. **Read Planning**: `Project-Orchestration/planning.md` - Current sprint goals, priorities, and project status
2. **Check Tasks**: `Project-Orchestration/tasks.md` - Active tasks, blockers, and completion tracking
3. **Review PRD**: `Project-Orchestration/SellUsGenie-PRD.md` - Full project requirements and context
4. **Task Management**: 
   - Mark completed tasks immediately with ✅ and date
   - Add new discovered tasks during work
   - Update task priorities based on current needs
   - Move completed tasks to "Recently Completed" section

## Project Overview

SellUsGenie is a comprehensive multi-tenant e-commerce platform that enables store owners to create and manage multiple online stores from a single unified dashboard. Built with React, TypeScript, and Supabase, the platform combines enterprise-grade features with user-friendly interfaces to democratize e-commerce for small and medium businesses.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Vite
- `npm run build` - Full TypeScript compilation + Vite build for production
- `npm run build:quick` - Fast production build (skips TypeScript checking)
- `npm run build:production` - Production build script for deployment
- `npm run lint` - Run ESLint code quality checks
- `npm run test` - Run comprehensive automated test suite
- `npm run test:verbose` - Run tests with detailed output

### Testing and Quality
- `npm run test` - Runs automated testing suite that validates TypeScript compilation, component structure, database schema, security policies, and e-commerce functionality
- `node scripts/run-tests.js --verbose` - Run tests with detailed error reporting

### Production and Deployment
- `npm run serve` - Serve production build locally on port 3000
- `npm run start` - Build and serve production version
- `npm run preview` - Preview Vite production build

## Architecture Overview

### Multi-Tenant Data Model
The platform uses a sophisticated multi-tenant architecture:
- **Store Owners**: Top-level users who can own multiple stores
- **Stores**: Individual e-commerce stores with isolated data
- **Row Level Security (RLS)**: Postgres policies ensure complete data isolation
- **Unified Billing**: One subscription covers all stores per store owner

### Key Technologies
- **Frontend**: React 18 + TypeScript, Wouter routing, TanStack Query
- **UI**: Tailwind CSS + Radix UI components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Payments**: Stripe integration with webhooks
- **State Management**: React Context + TanStack Query

### Project Structure
```
src/
├── contexts/          # React contexts (Auth, Store, Cart, Checkout)
├── lib/               # Core utilities (Supabase client, Stripe)
├── components/        # Reusable UI components
│   ├── cart/         # Shopping cart system
│   ├── checkout/     # Checkout flow
│   ├── ui/           # Generic UI components
│   └── settings/     # Admin settings
├── pages/            # Main application pages
├── pageBuilder/      # Visual page builder system
│   ├── editor/       # Page builder UI
│   ├── widgets/      # Draggable widgets
│   └── types.ts      # Page builder type definitions
├── hooks/            # Custom React hooks for data fetching
└── types/            # TypeScript type definitions
```

### Database Schema
Located in `database/schema.sql` - contains complete multi-tenant schema with:
- Store owners and stores tables
- Products, customers, orders with store isolation
- RLS policies for data security
- Subscription management tables
- Page builder content storage

## Visual Page Builder System

SellUsGenie includes a sophisticated visual page builder that enables store owners to create and customize their storefronts without coding knowledge.

### Core Architecture

#### **Page Document Structure**
- **Pages**: Individual documents containing sections, rows, and widgets
- **Sections**: Vertical containers with optional backgrounds and styling
- **Rows**: Horizontal containers using a 12-column grid system
- **Widgets**: Individual components (text, images, buttons, etc.) with configurable properties

#### **Widget System**
- **Widget Registry**: Centralized registry managing all available widgets
- **Editor/View Pattern**: Each widget has separate Editor (configuration) and View (render) components
- **Type Safety**: Complete TypeScript coverage with generic `Widget<T>` types
- **Props Validation**: Zod schemas ensure data integrity

#### **System Pages**
- **Header/Footer**: Special system-level pages using `header-layout` and `footer-layout` widgets
- **Direct Rendering**: System pages bypass PageBuilderRenderer for consistent display
- **Store Integration**: Automatic injection of store data (name, logo, etc.)

### Key Features

#### **Responsive Design**
- **Breakpoints**: Mobile (sm), Tablet (md), Desktop (lg) with individual styling
- **Column Spans**: Configurable widget widths per breakpoint (1-12 columns)
- **Visibility Controls**: Show/hide widgets based on screen size

#### **Content Management**
- **Draft/Published States**: Pages can be saved as drafts or published live
- **Version History**: Complete versioning with restore capabilities
- **SEO Optimization**: Built-in meta tags, structured data, and analytics

#### **Widget Types**
- **Content**: Text, buttons, images, heroes, forms
- **Media**: Galleries, carousels, videos
- **Commerce**: Product listings, featured products, shopping cart
- **Layout**: Spacers, dividers, navigation components
- **System**: Header layouts, footer layouts (not shown in user library)

#### **Styling System**
- **CSS-in-JS**: Style configuration through props, not separate CSS files
- **Color Palettes**: Predefined color schemes with automatic application
- **Custom CSS**: Advanced users can add custom CSS per widget
- **Animations**: Built-in animation system with triggers and easing

### Implementation Guide

#### **Creating New Widgets**
1. **File Structure**:
   ```
   src/pageBuilder/widgets/[widget-name]/
   ├── index.ts          # Widget registration and config
   ├── [Name]Editor.tsx  # Configuration interface
   ├── [Name]View.tsx    # Display component
   └── types.ts          # Widget-specific types (optional)
   ```

2. **Widget Registration**:
   ```typescript
   // src/pageBuilder/widgets/[widget-name]/index.ts
   import { widgetRegistry } from '../registry';
   import { WidgetEditor } from './WidgetEditor';
   import { WidgetView } from './WidgetView';
   
   widgetRegistry.register({
     type: 'widget-name',
     name: 'Widget Display Name',
     description: 'Widget description',
     icon: 'icon-name',
     category: 'content', // content | media | commerce | layout
     defaultColSpan: { sm: 12, md: 6, lg: 4 },
     schema: z.object({ /* Zod validation schema */ }),
     defaultProps: { /* Default properties */ },
     Editor: WidgetEditor,
     View: WidgetView,
     systemWidget: false // Set true to hide from user library
   });
   ```

3. **Editor Component**:
   ```typescript
   // src/pageBuilder/widgets/[widget-name]/WidgetEditor.tsx
   export const WidgetEditor: React.FC<WidgetEditorProps> = ({ 
     widget, 
     onChange, 
     onDelete, 
     onDuplicate 
   }) => {
     const updateProps = (newProps: Partial<WidgetProps>) => {
       onChange({ props: { ...widget.props, ...newProps } });
     };
     
     return (
       <div className="widget-editor">
         {/* Configuration UI */}
       </div>
     );
   };
   ```

4. **View Component**:
   ```typescript
   // src/pageBuilder/widgets/[widget-name]/WidgetView.tsx
   export const WidgetView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
     const { props } = widget as Widget<WidgetProps>;
     
     return (
       <div className="widget-view">
         {/* Rendered widget content */}
       </div>
     );
   };
   ```

#### **Storefront Integration**
- **PageBuilderRenderer**: Generic renderer for regular page content
- **VisualPageBuilderStoreFront**: Main storefront component handling system pages
- **Direct Rendering**: System pages (header/footer) render directly using their View components
- **Store Data Injection**: Automatic replacement of placeholders with actual store data

#### **Database Integration**
- **SupabasePageRepository**: Handles all page CRUD operations
- **Multi-Tenant Security**: RLS policies ensure store data isolation
- **System Page Management**: Special handling for header/footer pages

### Development Patterns

#### **Widget Props Pattern**
```typescript
export interface WidgetProps {
  // Configuration properties
  title?: string;
  content?: string;
  // Styling properties
  backgroundColor?: string;
  textColor?: string;
  // Behavior properties
  clickAction?: 'none' | 'link' | 'modal';
  linkUrl?: string;
}

export const WidgetView: React.FC<WidgetViewProps> = ({ widget }) => {
  const { props } = widget as Widget<WidgetProps>;
  // Use props with type safety
};
```

#### **Store Data Integration**
```typescript
import { useStore } from '../../../contexts/StoreContext';

export const WidgetView: React.FC<WidgetViewProps> = ({ widget }) => {
  const { currentStore } = useStore();
  const { props } = widget as Widget<WidgetProps>;
  
  // Use currentStore data or fallback to props
  const displayName = currentStore?.store_name || props.fallbackName;
};
```

#### **Responsive Styling**
```typescript
const getResponsiveClasses = (colSpan: BreakpointSpan) => {
  return `
    col-span-${colSpan.sm || 12}
    md:col-span-${colSpan.md || colSpan.sm || 12}
    lg:col-span-${colSpan.lg || colSpan.md || colSpan.sm || 12}
  `;
};
```

### Testing Strategy

#### **Widget Testing**
- **Editor Component Tests**: Verify configuration UI works correctly
- **View Component Tests**: Ensure proper rendering with various props
- **Integration Tests**: Test widget within page builder context
- **Responsive Tests**: Verify behavior across all breakpoints

#### **System Integration**
- **Storefront Rendering**: Test header/footer display in actual storefronts
- **Multi-Store Isolation**: Ensure widgets respect store boundaries
- **Performance**: Monitor rendering performance with complex page layouts

### Troubleshooting Guide

#### **Common Issues**
1. **Widget Not Appearing**: Check widget registration in registry
2. **Props Not Updating**: Verify onChange handler implementation in editor
3. **Styling Issues**: Ensure Tailwind classes are properly applied
4. **Type Errors**: Use generic `Widget<T>` type for proper typing
5. **Store Data Not Loading**: Check useStore() hook implementation

#### **Debug Patterns**
```typescript
// Debug widget props
console.log('Widget props:', widget.props);
console.log('Store data:', currentStore);

// Debug rendering
const isValidWidget = widget && widget.type && widget.props;
if (!isValidWidget) {
  console.warn('Invalid widget:', widget);
  return null;
}
```

### Performance Considerations

#### **Optimization Strategies**
- **Lazy Loading**: Only load widget editors when needed
- **Memoization**: Use React.memo for widget components
- **Bundle Splitting**: Separate widget bundles to reduce initial load
- **Image Optimization**: Automatic image optimization for media widgets

#### **Monitoring**
- **Render Times**: Track page builder rendering performance
- **Memory Usage**: Monitor component lifecycle and cleanup
- **Network Requests**: Optimize API calls for page loading

## Authentication Flow

OAuth-based authentication with automatic trial provisioning:
1. Users sign in via Google or Apple OAuth
2. `AuthContext` manages authentication state
3. New users automatically get 14-day trial
4. Store owners can create multiple stores
5. `StoreContext` handles store selection and switching

## Data Fetching Patterns

Uses TanStack Query for server state management:
- Custom hooks in `src/hooks/` for data operations
- Optimistic updates for better UX
- Error handling with retry logic
- Cache invalidation strategies

### Example Hook Pattern
```typescript
export const useProducts = (storeId: string) => {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => fetchProducts(storeId),
    enabled: !!storeId
  })
}
```

## Security Considerations

- All database access goes through Supabase RLS policies
- Store data is completely isolated between tenants
- Environment variables for sensitive configuration
- Stripe webhook signature validation
- Input validation with Zod schemas

## Testing Strategy

The automated test suite (`scripts/run-tests.js`) validates:
- TypeScript compilation and code quality
- Component structure and React patterns
- Database schema and RLS policies
- Multi-tenancy isolation
- E-commerce functionality
- Accessibility compliance
- Security best practices

## Environment Variables

Required environment variables (see `env.example`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_APPLE_CLIENT_ID` - Apple OAuth client ID

## Storage Setup

Before using image upload features, you must set up Supabase storage buckets:

1. Run `database/storage-setup.sql` in your Supabase SQL Editor
2. This creates required buckets: `product-images`, `store-images`
3. Sets up proper RLS policies for secure file access

**Common Issue**: "Bucket not found" error when uploading images
**Solution**: Execute the storage setup script in your Supabase project

See `STORAGE_SETUP.md` for detailed instructions.

## 🎯 PROJECT-SPECIFIC DEVELOPMENT RULES

### Multi-Tenant Architecture (CRITICAL)
- **NEVER** write queries without proper RLS (Row Level Security) policies
- **ALWAYS** include store_id or store_owner_id in data operations
- **VERIFY** data isolation by testing with multiple stores
- **VALIDATE** that users can only access their own store data

### Feature Development Workflow
1. **Check PRD alignment**: Ensure feature matches requirements in SellUsGenie-PRD.md
2. **Update tasks.md**: Add/update relevant tasks before starting work
3. **Follow user stories**: Reference specific user stories from PRD
4. **Test multi-tenant**: Verify feature works across different stores
5. **Document completion**: Update planning.md with progress

### Code Quality Standards
- **TypeScript Strict Mode**: Required for all new code
- **Accessibility First**: WCAG 2.1 AA compliance mandatory
- **Mobile Responsive**: All features must work on mobile devices
- **Performance Budget**: < 3s initial page load, < 200ms API responses
- **Security Review**: All auth-related changes require security validation

### Testing Requirements
- **E2E Tests**: Playwright tests for critical user journeys
- **Multi-Store Testing**: Verify data isolation across tenants
- **Cross-Browser**: Test on Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Verify on iOS and Android viewports

### Page Builder Specific Rules
- **Widget System**: All widgets must be extensible and reusable
- **Responsive Design**: Support mobile, tablet, desktop breakpoints
- **Performance**: Lazy load widgets and optimize rendering
- **Accessibility**: Ensure drag-and-drop works with keyboard navigation

### E-commerce Specific Rules
- **PCI Compliance**: Never store payment data locally (use Stripe)
- **Inventory Accuracy**: Real-time stock level validation required
- **Order Processing**: Implement proper order state management
- **Payment Security**: Validate all payment flows thoroughly

## Development Guidelines

### Core Principles
- Follow existing TypeScript patterns and interfaces
- Use existing hooks and contexts for data operations
- Maintain multi-tenant data isolation at ALL times
- Test changes with the automated test suite
- Ensure responsive design with Tailwind classes
- Follow accessibility best practices with Radix UI
- Prioritize user experience and performance

### Architecture Patterns
- **State Management**: TanStack Query for server state, React Context for UI state
- **Component Structure**: Atomic design principles with reusable components
- **Data Fetching**: Custom hooks with proper error handling and loading states
- **Form Handling**: React Hook Form with Zod validation schemas
- **Real-time Updates**: Supabase subscriptions for live data synchronization

## 📝 PROJECT WORKFLOWS & PROCESSES

### Session Management
- **Start every session** by reading planning.md, tasks.md, and relevant PRD sections
- **Update task status** immediately when completing work
- **Document decisions** that affect project direction or architecture
- **Communicate blockers** by updating tasks.md with blocked status

### Feature Development Lifecycle
1. **Research Phase**: Review PRD user stories and acceptance criteria
2. **Planning Phase**: Break down work into tasks and update tasks.md
3. **Implementation Phase**: Follow coding standards and test continuously
4. **Validation Phase**: Test multi-tenant functionality and performance
5. **Documentation Phase**: Update relevant docs and mark tasks complete

### Quality Assurance Process
- **Before pushing code**: Run `npm run test` and fix any failures
- **Before marking tasks complete**: Verify acceptance criteria met
- **Before major features**: Run E2E tests with `npm run test:e2e`
- **Regular maintenance**: Keep dependencies updated and security patches applied

### Communication Protocol
- **Task Updates**: Use tasks.md for all task status communication
- **Architecture Decisions**: Document in planning.md under "Architecture Decisions"
- **Risk Identification**: Add to planning.md under "Risk Monitoring"
- **Sprint Planning**: Update planning.md with current sprint focus

### Emergency Procedures
- **Production Issues**: Prioritize data integrity and user security
- **Security Vulnerabilities**: Immediate attention, update tasks as CRITICAL
- **Data Loss Risk**: Stop work, assess impact, document in planning.md
- **Performance Degradation**: Profile, identify bottlenecks, create tasks

## 🔧 USER STORY REFERENCE GUIDE

### Current Sprint User Stories (Reference PRD Section 4)
- **STORE-001**: Store creation with custom domain
- **STORE-002**: Quick store switching interface
- **PRODUCT-001**: Product management with images
- **CUSTOMER-001**: Customer shopping experience
- **DELIVERY-001**: Geographic delivery area definition

### Acceptance Criteria Standards
- All user stories must have clear acceptance criteria
- Features must work across all supported browsers
- Multi-tenant data isolation must be verified
- Mobile responsiveness is mandatory
- Accessibility compliance (WCAG 2.1 AA) required

## 🚨 CRITICAL SESSION REMINDERS

**MANDATORY ACTIONS FOR EVERY CLAUDE CODE SESSION:**
1. **Read planning.md first** - Understand current sprint and priorities
2. **Check tasks.md before starting work** - Avoid duplicate effort and understand blockers
3. **Mark completed tasks immediately** - Maintain project visibility and progress tracking
4. **Add new discovered tasks** - Ensure comprehensive task tracking during implementation
5. **Follow PRD user stories** - Ensure all features align with business requirements
6. **Test multi-tenant functionality** - Every feature touching data must be tested across stores
7. **Maintain security-first mindset** - Especially for authentication and data access patterns
8. **Document architectural decisions** - Any changes affecting future development must be documented

## 📋 TASK MANAGEMENT RULES

### Task Creation Standards
- Use consistent naming: `[AREA-###]: Description`
- Include acceptance criteria in task descriptions
- Link to relevant PRD sections when applicable
- Set appropriate priority levels (Critical 🔥, High 🚀, Medium 📋, Future 🎯)

### Task Completion Protocol
1. Mark completed tasks with ✅ and completion date
2. Move to "Recently Completed" section in tasks.md
3. Add any follow-up tasks discovered during implementation
4. Update related documentation if the task affected architecture or processes
5. Run relevant tests before marking task as complete

### Priority Guidelines
- **Critical 🔥**: Blocks other work, affects security, or impacts data integrity
- **High 🚀**: Required for current sprint goals or critical user-facing features  
- **Medium 📋**: Important but can be delayed one sprint if necessary
- **Future 🎯**: Nice-to-have features or longer-term strategic work