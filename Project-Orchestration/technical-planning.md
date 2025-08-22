# SellUsGenie - Technical Planning & Architecture

**Last Updated:** August 2025  
**Current Phase:** Phase 1 - MVP Development (Months 1-4)  
**Technical Lead:** Development Team  
**Architecture Version:** v1.0

---

## 🏗️ Technical Architecture Overview

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│ React 19 + TypeScript + Vite                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │Store Manager│ │Page Builder │ │E-commerce   │ │Analytics    │ │
│ │             │ │             │ │Cart/Checkout│ │Dashboard    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │     UI Components (Tailwind CSS + Radix UI)                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │     State Management (TanStack Query + React Context)      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/WSS
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Layer                           │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │PostgreSQL   │ │Auth Service │ │Real-time    │ │File Storage │ │
│ │+ RLS        │ │OAuth/JWT    │ │Subscriptions│ │Images/Assets│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │              Edge Functions (Serverless)                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │Stripe       │ │Google Maps  │ │Email Service│ │CDN/Analytics│ │
│ │Payments     │ │Delivery Area│ │Notifications│ │Performance  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Architecture Design

#### Data Isolation Strategy
- **Row Level Security (RLS)**: PostgreSQL policies ensure complete data isolation
- **Store Owner Context**: All queries filtered by authenticated user's store ownership
- **Store Switching**: Context switching without data leakage
- **Audit Trail**: Complete logging of multi-tenant operations

#### Database Schema Structure
```sql
-- Core Multi-Tenant Tables
store_owners (id, email, subscription_status, created_at)
stores (id, store_owner_id, name, domain, settings, created_at)
products (id, store_id, name, price, inventory, created_at)
orders (id, store_id, customer_email, total, status, created_at)
customers (id, store_id, email, profile_data, created_at)
delivery_areas (id, store_id, name, coordinates, pricing, created_at)
pages (id, store_id, path, content, published, created_at)

-- Page Builder System
page_widgets (id, page_id, type, props, position, created_at)
widget_templates (id, name, category, schema, preview, created_at)

-- Analytics & Reporting
analytics_events (id, store_id, event_type, properties, timestamp)
```

---

## 🛠️ Technology Stack Decisions

### Frontend Stack

#### **React 19** ✅ **CHOSEN**
**Rationale:**
- Latest React features (Server Components, Concurrent Features)
- Strong TypeScript integration
- Large ecosystem and community support
- Performance optimizations for complex UIs

**Alternatives Considered:**
- Vue 3: Rejected due to smaller ecosystem for e-commerce
- Svelte: Rejected due to limited component libraries
- Angular: Rejected due to complexity overhead

#### **TypeScript** ✅ **CHOSEN**
**Rationale:**
- Type safety critical for multi-tenant architecture
- Better developer experience and code maintainability
- Excellent IDE support and refactoring capabilities
- Industry standard for large applications

#### **Vite** ✅ **CHOSEN**
**Rationale:**
- Extremely fast development server and builds
- Excellent TypeScript and React support
- Modern build tool with ES modules
- Better performance than Webpack for our use case

**Alternatives Considered:**
- Create React App: Rejected due to performance and customization limitations
- Webpack: Rejected due to complexity and slower build times
- Parcel: Rejected due to less mature ecosystem

#### **Tailwind CSS + Radix UI** ✅ **CHOSEN**
**Rationale:**
- Utility-first CSS for rapid development
- Radix UI provides accessible, unstyled components
- Consistent design system capabilities
- Excellent mobile-first responsive design

**Alternatives Considered:**
- Material-UI: Rejected due to design constraints and bundle size
- Chakra UI: Rejected due to less customization flexibility
- Styled Components: Rejected due to runtime overhead

### Backend Stack

#### **Supabase** ✅ **CHOSEN**
**Rationale:**
- PostgreSQL with built-in RLS for multi-tenancy
- Real-time subscriptions for live updates
- Authentication with OAuth providers
- File storage and CDN capabilities
- Serverless functions for custom logic

**Alternatives Considered:**
- Firebase: Rejected due to NoSQL limitations for complex e-commerce queries
- Custom Node.js + PostgreSQL: Rejected due to development time and maintenance overhead
- AWS Amplify: Rejected due to vendor lock-in and complexity

#### **PostgreSQL with RLS** ✅ **CHOSEN**
**Rationale:**
- ACID compliance for financial transactions
- Row Level Security for perfect multi-tenant isolation
- JSON support for flexible product attributes
- Excellent performance for complex queries
- Battle-tested for e-commerce applications

### State Management

#### **TanStack Query + React Context** ✅ **CHOSEN**
**Rationale:**
- TanStack Query handles server state, caching, and synchronization
- React Context for UI state and user preferences
- Eliminates need for complex state management library
- Excellent integration with Supabase real-time features

**Alternatives Considered:**
- Redux Toolkit: Rejected due to complexity for our use case
- Zustand: Rejected due to lack of server state management features
- SWR: Rejected in favor of TanStack Query's more comprehensive features

### Payment Processing

#### **Stripe** ✅ **CHOSEN**
**Rationale:**
- PCI compliance handled automatically
- Excellent developer experience and documentation
- Strong fraud protection and international support
- Webhooks for reliable payment processing
- Support for subscriptions and marketplace features

**Alternatives Considered:**
- PayPal: Rejected due to limited customization options
- Square: Rejected due to less international support
- Custom payment processing: Rejected due to PCI compliance complexity

---

## 🔧 Required Tools and Dependencies

### Core Dependencies
```json
{
  "frontend": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "@tanstack/react-query": "^5.85.3",
    "wouter": "^3.7.1",
    "zod": "^4.0.17",
    "react-hook-form": "^7.62.0"
  },
  "ui": {
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.539.0",
    "@dnd-kit/core": "^6.3.1",
    "recharts": "^3.1.2"
  },
  "backend": {
    "@supabase/supabase-js": "^2.55.0"
  },
  "payments": {
    "@stripe/stripe-js": "^7.8.0",
    "@stripe/react-stripe-js": "^3.9.0"
  }
}
```

### Development Tools
```json
{
  "testing": {
    "@playwright/test": "^1.48.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0"
  },
  "code_quality": {
    "eslint": "^9.33.0",
    "prettier": "^3.4.0",
    "@typescript-eslint/parser": "^8.17.0"
  },
  "build_deployment": {
    "vercel": "latest",
    "netlify-cli": "latest"
  }
}
```

### External Service Requirements

#### **Google Maps API**
- **Purpose**: Delivery area mapping and geocoding
- **Requirements**: 
  - Places API for address autocomplete
  - Drawing API for delivery zones
  - Geocoding API for address validation
- **Cost Estimate**: $200-500/month at scale

#### **Email Service Provider** (Decision Pending)
- **Options**: 
  - Resend (Developer-friendly, good deliverability)
  - SendGrid (Enterprise features, higher cost)
  - Supabase Edge Functions + SMTP (Custom solution)
- **Requirements**: Transactional emails, templates, analytics

#### **CDN for Images** (Decision Pending)
- **Options**:
  - Supabase Storage (Integrated solution)
  - Cloudinary (Advanced image processing)
  - AWS CloudFront + S3 (Cost-effective at scale)
- **Requirements**: Image optimization, responsive images, fast global delivery

#### **Monitoring & Analytics**
- **Application Monitoring**: Sentry for error tracking
- **Performance Monitoring**: Vercel Analytics or New Relic
- **User Analytics**: PostHog or Mixpanel
- **Uptime Monitoring**: UptimeRobot or Pingdom

---

## 🚀 Development Approach

### Agile Methodology
- **Sprint Length**: 2 weeks
- **MVP Timeline**: 4 months (8 sprints)
- **Team Structure**: Full-stack developers with domain expertise
- **Code Reviews**: Required for all changes, focus on security and performance

### Development Phases

#### **Phase 1: Foundation (Month 1)**
- Multi-tenant authentication and authorization
- Database schema with RLS policies
- Basic store creation and management
- Core UI component library

#### **Phase 2: E-commerce Core (Month 2)**
- Product management system
- Shopping cart and checkout flow
- Stripe payment integration
- Order processing and management

#### **Phase 3: Page Builder (Month 3)**
- Drag-and-drop page builder interface
- Widget system architecture
- Template management
- Responsive design tools

#### **Phase 4: Launch Preparation (Month 4)**
- Delivery area management
- Analytics dashboard
- Performance optimization
- Security audit and testing

### Code Organization Principles

#### **Domain-Driven Design**
- Features organized by business domain (stores, products, orders, pages)
- Clear separation between UI components and business logic
- Shared utilities and common patterns

#### **Component Architecture**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (buttons, inputs)
│   ├── forms/           # Form components and validation
│   ├── layouts/         # Page layouts and navigation
│   └── features/        # Feature-specific components
├── contexts/            # React contexts for global state
├── hooks/               # Custom hooks for data fetching
├── lib/                 # Core utilities and configurations
├── pages/               # Page components and routing
├── types/               # TypeScript type definitions
└── utils/               # Helper functions and constants
```

### Testing Strategy

#### **Test Pyramid**
1. **Unit Tests**: Critical business logic and utilities
2. **Integration Tests**: Component interactions and data flows
3. **E2E Tests**: Complete user journeys and multi-tenant scenarios

#### **Testing Tools**
- **Unit/Integration**: Vitest + Testing Library
- **E2E**: Playwright with multi-browser testing
- **Visual Regression**: Chromatic or Percy (future)
- **Performance**: Lighthouse CI in deployment pipeline

#### **Test Coverage Goals**
- **Unit Tests**: 80% coverage for business logic
- **Integration Tests**: All critical user flows
- **E2E Tests**: Core user journeys and edge cases
- **Multi-tenant Tests**: Data isolation verification

---

## 📁 Project Structure

### Repository Organization
```
SellUsGenie/
├── src/                          # Source code
│   ├── components/              # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── cart/               # Shopping cart system
│   │   ├── checkout/           # Checkout flow
│   │   ├── settings/           # Store settings
│   │   └── storefront/         # Customer-facing components
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── StoreContext.tsx    # Store selection state
│   │   └── CartContext.tsx     # Shopping cart state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hooks
│   │   ├── useStores.ts        # Store management hooks
│   │   └── useProducts.ts      # Product data hooks
│   ├── lib/                    # Core utilities
│   │   ├── supabase.ts         # Supabase client
│   │   ├── stripe.ts           # Stripe configuration
│   │   └── validations.ts      # Zod schemas
│   ├── pageBuilder/            # Page builder system
│   │   ├── editor/             # Editor interface
│   │   ├── widgets/            # Widget components
│   │   └── types.ts            # Page builder types
│   ├── pages/                  # Page components
│   │   ├── LandingPage.tsx     # Marketing landing page
│   │   ├── StoreOwnerDashboard.tsx # Main dashboard
│   │   └── StoreFront.tsx      # Customer storefront
│   └── types/                  # TypeScript definitions
├── database/                   # Database files
│   ├── schema.sql             # Database schema
│   ├── seed.sql               # Sample data
│   └── migrations/            # Database migrations
├── tests/                     # Test files
│   ├── e2e/                  # Playwright E2E tests
│   ├── integration/          # Integration tests
│   └── unit/                 # Unit tests
├── docs/                     # Documentation
├── Project-Orchestration/    # Project management
│   ├── SellUsGenie-PRD.md   # Product requirements
│   ├── technical-planning.md # This file
│   ├── tasks.md             # Task management
│   └── planning.md          # Sprint planning
├── public/                   # Static assets
├── scripts/                  # Build and deployment scripts
└── config files             # Configuration files
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useProducts.ts`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase (e.g., `ProductTypes.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Code Style Guidelines
- **TypeScript Strict Mode**: Enabled for all files
- **ESLint Configuration**: Airbnb base with React extensions
- **Prettier Configuration**: 2-space indentation, single quotes
- **Import Organization**: External libraries, internal modules, relative imports
- **Component Structure**: Props interface, component, default export

---

## 🔒 Security Architecture

### Multi-Tenant Security
- **Row Level Security (RLS)**: PostgreSQL policies enforce data isolation
- **JWT Authentication**: Supabase handles token management and validation
- **API Security**: All API calls include authentication and authorization checks
- **Input Validation**: Zod schemas validate all user inputs

### Data Protection
- **Encryption in Transit**: HTTPS/WSS for all communications
- **Encryption at Rest**: Supabase handles database encryption
- **PCI Compliance**: Stripe handles all payment data processing
- **GDPR Compliance**: Data export and deletion capabilities

### Security Testing
- **Authentication Testing**: Verify multi-tenant data isolation
- **Input Validation Testing**: SQL injection and XSS prevention
- **Authorization Testing**: Role-based access control verification
- **Dependency Scanning**: Automated vulnerability scanning

---

## 🚀 Performance Architecture

### Frontend Performance
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Images, components, and non-critical resources
- **Caching Strategy**: TanStack Query for intelligent data caching
- **Bundle Optimization**: Vite's tree shaking and minification

### Backend Performance
- **Database Optimization**: Proper indexing and query optimization
- **Connection Pooling**: Supabase handles connection management
- **Real-time Optimization**: Selective subscriptions and data filtering
- **CDN Strategy**: Static asset delivery optimization

### Performance Monitoring
- **Core Web Vitals**: Lighthouse CI in deployment pipeline
- **Real User Monitoring**: Performance data collection
- **Database Monitoring**: Query performance and optimization
- **Error Tracking**: Sentry integration for performance issues

---

## 📊 Scalability Planning

### Horizontal Scaling Strategies
- **Frontend**: Static hosting with global CDN distribution
- **Backend**: Supabase's auto-scaling infrastructure
- **Database**: Read replicas and connection pooling
- **File Storage**: CDN integration for global asset delivery

### Vertical Scaling Considerations
- **Database**: Supabase Pro tier for increased resources
- **Compute**: Edge functions for serverless scaling
- **Storage**: Automatic scaling with pay-per-use model
- **Bandwidth**: CDN integration for efficient delivery

### Future Architecture Considerations
- **Microservices**: Extract specific domains if complexity grows
- **Event-Driven Architecture**: Implement for complex business workflows
- **API Gateway**: Consider if multiple backend services emerge
- **Message Queues**: For background processing and async workflows

---

## 🎯 Technical Milestones

### Sprint 1-2: Foundation
- [ ] Multi-tenant database schema with RLS
- [ ] Authentication system with OAuth
- [ ] Basic store creation and management
- [ ] Core UI component library

### Sprint 3-4: E-commerce Core
- [ ] Product management system
- [ ] Shopping cart and checkout
- [ ] Stripe payment integration
- [ ] Order processing workflow

### Sprint 5-6: Page Builder
- [ ] Drag-and-drop editor interface
- [ ] Widget system architecture
- [ ] Template management system
- [ ] Responsive design tools

### Sprint 7-8: Launch Preparation
- [ ] Delivery area management
- [ ] Analytics dashboard
- [ ] Performance optimization
- [ ] Security audit and penetration testing

---

## 🔄 Continuous Integration/Deployment

### CI/CD Pipeline
1. **Code Commit**: GitHub/GitLab repository
2. **Automated Testing**: Unit, integration, and E2E tests
3. **Code Quality**: ESLint, Prettier, TypeScript checks
4. **Security Scanning**: Dependency vulnerability checks
5. **Build**: Vite production build
6. **Deploy**: Vercel/Netlify deployment
7. **Post-Deploy**: Smoke tests and monitoring

### Environment Strategy
- **Development**: Local development with Supabase local
- **Staging**: Production-like environment for testing
- **Production**: Live environment with monitoring and alerts

### Release Strategy
- **Feature Flags**: Gradual rollout of new features
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Strategy**: Quick rollback capabilities
- **Database Migrations**: Backward-compatible schema changes

---

## 📝 Technical Documentation

### Documentation Standards
- **Code Documentation**: JSDoc for complex functions
- **API Documentation**: OpenAPI specifications
- **Architecture Documentation**: This file and related docs
- **User Documentation**: Feature guides and tutorials

### Knowledge Management
- **Technical Decisions**: Architecture Decision Records (ADRs)
- **Troubleshooting**: Common issues and solutions
- **Deployment Guide**: Step-by-step deployment instructions
- **Development Setup**: Local development environment guide

---

**Document Approval:**
- Technical Lead: _________________
- DevOps Engineer: _________________
- Security Officer: _________________
- Product Manager: _________________

**Next Review Date:** [Monthly technical architecture review]