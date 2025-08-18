# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SellUsGenie is a multi-tenant e-commerce platform built with React, TypeScript, and Supabase. It allows store owners to create and manage multiple stores under a single account with unified billing. The platform features OAuth authentication (Google/Apple), comprehensive store management, and an advanced page builder system.

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

## Page Builder System

The platform includes a sophisticated visual page builder:
- **Drag & Drop Interface**: Widgets can be dragged between rows and sections
- **Responsive Design**: Breakpoint-specific styling (sm/md/lg)
- **Widget System**: Extensible widget registry with Editor/View components
- **Version Control**: Page versioning with history and restore capabilities
- **SEO Features**: Built-in meta tags, structured data, and optimization

### Adding New Widgets
1. Create widget files in `src/pageBuilder/widgets/[widget-name]/`
2. Implement `WidgetEditor` and `WidgetView` components
3. Define Zod schema for props validation
4. Register in `src/pageBuilder/widgets/registry.ts`

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

## Development Guidelines

- Follow existing TypeScript patterns and interfaces
- Use existing hooks and contexts for data operations
- Maintain multi-tenant data isolation
- Test changes with the automated test suite
- Ensure responsive design with Tailwind classes
- Follow accessibility best practices with Radix UI