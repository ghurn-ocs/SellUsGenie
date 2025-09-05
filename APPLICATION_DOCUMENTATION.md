# SellUsGenie - Complete Application Documentation

## Overview

**SellUsGenie** is a comprehensive multi-tenant SaaS e-commerce platform designed to empower small and medium businesses to create and manage professional online stores. The application combines enterprise-grade features with user-friendly interfaces, providing store owners with a complete solution for building custom storefronts, managing products and orders, analyzing performance, and nurturing customer relationships.

**Target Audience:**
- **Primary Users**: Small to medium business owners seeking to establish or enhance their online presence
- **Secondary Users**: E-commerce managers, digital marketers, and web designers
- **Developers**: Full-stack developers maintaining and extending the platform

## Functional Description

SellUsGenie delivers a complete e-commerce ecosystem through several integrated modules:

### Core Features

**🎨 Visual Page Builder**
- Drag-and-drop interface for creating custom storefront layouts
- Pre-built widgets (text, images, navigation, product displays)
- Responsive design tools for mobile, tablet, and desktop optimization
- Real-time preview with live editing capabilities
- Template marketplace for quick store setup

**🏪 Dynamic Storefront Rendering**
- Public-facing websites generated from page builder configurations
- SEO-optimized pages with custom meta tags and structured data
- Multi-theme support with customizable color palettes
- Fast loading times with optimized asset delivery

**🛒 Complete E-commerce Flow**
- Product catalog management with categories and variants
- Shopping cart with persistent session storage
- Secure checkout process with multiple payment options
- Order management and fulfillment tracking
- Inventory management with stock alerts

**📊 Analytics & Insights Dashboard**
- Sales performance tracking and reporting
- Customer behavior analytics and conversion funnels
- Traffic analysis with source attribution
- Custom dashboards with KPI monitoring
- Export capabilities for external analysis

**👥 Customer Nurturing System**
- Automated email marketing campaigns
- Customer segmentation and targeting
- Lead management and conversion tracking
- Retention analytics and churn prevention
- Loyalty program integration

**⚙️ Comprehensive Admin Panel**
- Store settings and configuration management
- User access control and permissions
- Payment gateway integrations (Stripe, PayPal)
- Shipping and tax configuration
- Custom domain management

## Technical Architecture

### System Design
SellUsGenie follows a modern **serverless architecture** with a React-based frontend and Supabase backend, ensuring scalability, security, and maintainability.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│   Supabase API   │────│   PostgreSQL    │
│   (TypeScript)  │    │   (Auth + RLS)   │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
    ┌─────────┐              ┌─────────┐              ┌─────────┐
    │  Vite   │              │ Edge    │              │ Storage │
    │ Build   │              │Functions│              │Buckets  │
    └─────────┘              └─────────┘              └─────────┘
```

### Technology Stack

**Frontend Framework**
- **React 18** with TypeScript for type-safe development
- **Vite** as the build tool and development server
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible component primitives

**Backend & Database**
- **Supabase** as Backend-as-a-Service (BaaS)
- **PostgreSQL** with Row Level Security (RLS) for data isolation
- **Supabase Auth** for authentication and user management
- **Supabase Storage** for file and image management

**State Management & Data Fetching**
- **TanStack Query** for server state management
- **React Context API** for client-side state
- **Zustand** for lightweight state management

**Additional Libraries**
- **React Hook Form** with Zod validation for forms
- **React DnD** for drag-and-drop functionality
- **Wouter** for lightweight routing
- **Recharts** for data visualization

### Data Model Architecture

The application uses a sophisticated multi-tenant data model ensuring complete data isolation:

```sql
Store Owners (1) ──→ (N) Stores ──→ (N) Products
                           │
                           ├── (N) Customers
                           ├── (N) Orders  
                           ├── (N) Pages
                           └── (1) Settings
```

**Key Tables:**
- `store_owners` - Top-level user accounts
- `stores` - Individual store instances
- `page_documents` - Visual page builder content
- `products` - Product catalog
- `orders` - Transaction records
- `customers` - Customer data

## Dependencies and Prerequisites

### System Requirements
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- Modern web browser with ES2020 support

### External Services
- **Supabase Account** - Database, authentication, and storage
- **Stripe Account** - Payment processing
- **Google Cloud Platform** - Maps API and OAuth
- **Apple Developer Account** - Apple OAuth (optional)

### Environment Variables
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_APPLE_CLIENT_ID=your_apple_oauth_client_id

# API Keys (stored in Supabase, not environment)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Development
VITE_DEBUG_TEXT_WIDGETS=true
```

### Database Setup
Before first run, execute the database schema and migrations:

1. **Core Schema**: Run `database/schema.sql` in Supabase SQL Editor
2. **Page Builder**: Execute `database/page-builder-schema.sql`
3. **Analytics**: Apply `database/world-class-analytics-schema.sql`
4. **Sample Data**: Run `database/create-sample-storefront-data.sql` for testing

## Project Structure and Key Files

### Core Configuration Files
- **`package.json`** - Dependencies, scripts, and project metadata
- **`vite.config.ts`** - Build configuration and optimization settings
- **`tsconfig.json`** - TypeScript compiler configuration
- **`tailwind.config.js`** - CSS framework configuration

### Application Entry Points
- **`index.html`** - Main application entry for admin dashboard
- **`page-builder.html`** - Dedicated entry for page builder interface
- **`src/main.tsx`** - React application bootstrap

### Key Source Directories

**`src/components/`** - React component library
- **`website/`** - Active storefront rendering components
- **`pageBuilder/`** - Visual page builder admin interface
- **`analytics/`** - Dashboard and reporting components
- **`cart/`** - Shopping cart and checkout flow
- **`settings/`** - Admin configuration panels
- **`ui/`** - Reusable design system components

**`src/pageBuilder/`** - Visual page builder engine
- **`editor/`** - Page builder UI and controls
- **`widgets/`** - Draggable content widgets
- **`types.ts`** - Page builder type definitions

**`src/hooks/`** - Custom React hooks for data fetching
- **`useProducts.ts`** - Product management
- **`useOrders.ts`** - Order processing
- **`useCustomers.ts`** - Customer data
- **`useAnalytics.ts`** - Performance metrics

**`src/lib/`** - Core utility libraries
- **`supabase-client-manager.ts`** - Database connection management
- **`supabase-public.ts`** - Public storefront data fetching
- **`stripe.ts`** - Payment processing integration

**`database/`** - Database schemas and migrations
- **`schema.sql`** - Complete multi-tenant database schema
- **`page-builder-schema.sql`** - Visual page builder tables
- **`add-system-page-columns.sql`** - Schema migration for system pages

### Complete Project Directory Tree

```
SellUsGenie/
├── .claude/                           # Claude Code settings
├── .git/                             # Git repository
├── .github/                          # GitHub workflows
├── api/                              # API endpoints
├── database/                         # Database schemas and migrations
│   ├── add-system-page-columns.sql
│   ├── create-sample-storefront-data.sql
│   ├── fix-testingmy-store-content.sql
│   ├── leads-schema.sql
│   ├── page-builder-schema.sql
│   ├── schema.sql
│   └── world-class-analytics-schema.sql
├── dist/                             # Production build output
├── migrations/                       # Database migrations
├── node_modules/                     # Dependencies
├── playwright-report/                # Test reports
├── Project-Orchestration/            # Project management docs
├── public/                           # Static assets
├── src/                             # Source code
│   ├── archive-safe/                # Archived components
│   ├── components/                  # React components
│   │   ├── analytics/               # Analytics dashboard
│   │   ├── auth/                    # Authentication
│   │   ├── cart/                    # Shopping cart
│   │   ├── checkout/                # Checkout flow
│   │   ├── documentation/           # Help docs
│   │   ├── help/                    # Help system
│   │   ├── nurture/                 # Customer nurturing
│   │   ├── pageBuilder/             # Page builder admin
│   │   ├── public/                  # Public pages
│   │   ├── settings/                # Admin settings
│   │   ├── storefront/              # Legacy storefront
│   │   ├── ui/                      # Reusable UI components
│   │   └── website/                 # Active storefront
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utility libraries
│   ├── pageBuilder/                 # Visual page builder
│   ├── services/                    # Business logic services
│   ├── styles/                      # CSS/styling
│   ├── types/                       # TypeScript definitions
│   └── utils/                       # Helper functions
├── supabase/                        # Supabase configuration
├── test-results/                    # Test output
├── tests/                           # Test files
├── package.json                     # Dependencies
├── vite.config.ts                   # Build configuration
├── tsconfig.json                    # TypeScript config
├── index.html                       # Main app entry
├── page-builder.html               # Page builder entry
├── CLAUDE.md                       # Project instructions
└── README.md                       # Project documentation
```

## Getting Started / How to Run

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/your-org/sellusgenie.git
cd sellusgenie

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

### 2. Database Configuration
1. Create a new Supabase project at https://supabase.com
2. Execute the SQL files in order:
   ```bash
   # In Supabase SQL Editor:
   # 1. Run database/schema.sql
   # 2. Run database/page-builder-schema.sql  
   # 3. Run database/world-class-analytics-schema.sql
   # 4. Run database/create-sample-storefront-data.sql (for testing)
   ```

### 3. Development Server
```bash
# Start development server
npm run dev

# The application will be available at:
# - Main app: http://localhost:5173
# - Page builder: http://localhost:5173/page-builder.html
```

### 4. Building for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run serve

# Quick build (skip TypeScript checking)
npm run build:quick
```

### 5. Testing
```bash
# Run comprehensive test suite
npm run test

# Run tests with verbose output
npm run test:verbose

# Run end-to-end tests with Playwright
npx playwright test
```

### 6. Development Commands
```bash
# Type checking
npm run lint

# Start development with specific port
npm run dev -- --port 3000

# Build for production deployment
npm run build:production
```

## API Endpoints

SellUsGenie leverages Supabase's auto-generated REST API with custom Row Level Security policies. Key endpoints include:

### Store Management
```http
GET /rest/v1/stores?store_owner_id=eq.{id}
POST /rest/v1/stores
PATCH /rest/v1/stores?id=eq.{store_id}
```

### Page Builder
```http
GET /rest/v1/page_documents?store_id=eq.{id}&status=eq.published
POST /rest/v1/page_documents
PATCH /rest/v1/page_documents?id=eq.{page_id}
```

### Product Catalog
```http
GET /rest/v1/products?store_id=eq.{id}&is_active=eq.true
POST /rest/v1/products
PATCH /rest/v1/products?id=eq.{product_id}
```

### Orders & Analytics
```http
GET /rest/v1/orders?store_id=eq.{id}&order=created_at.desc
GET /rest/v1/analytics_events?store_id=eq.{id}
POST /rest/v1/orders
```

### Public Storefront (No Auth Required)
```http
GET /rest/v1/page_documents?store_id=eq.{id}&status=eq.published
GET /rest/v1/products?store_id=eq.{id}&is_active=eq.true
```

All endpoints automatically enforce Row Level Security policies ensuring complete data isolation between stores.

## Future Work and Known Issues

### 🚨 Known Issues

**Critical**
- **Storefront Rendering Bug**: Home pages showing 0 sections despite content being saved correctly by the page builder
- **Database Schema Mismatch**: Missing columns in production affecting page queries

**Medium Priority**
- **Performance**: Large page builder documents cause slow load times
- **Mobile UX**: Drag-and-drop interface needs mobile optimization
- **SEO**: Meta tags not consistently applied across all page types

### 🚀 Planned Features

**Q1 2024**
- **Advanced Analytics**: Customer lifetime value, cohort analysis
- **Marketing Automation**: Email sequences, abandoned cart recovery
- **Multi-language Support**: Internationalization for global markets
- **Advanced SEO Tools**: Schema markup generator, sitemap automation

**Q2 2024**
- **Marketplace Integration**: Third-party app ecosystem
- **Advanced Inventory**: Multi-location, dropshipping support  
- **Customer Portal**: Order history, wishlist, account management
- **Advanced Themes**: Professional template marketplace

**Technical Debt & Improvements**
- **Code Splitting**: Implement proper bundle optimization
- **Error Boundaries**: Add comprehensive error handling
- **Accessibility**: WCAG 2.1 AA compliance across all components
- **Testing Coverage**: Increase unit test coverage to >80%
- **Documentation**: API documentation with OpenAPI specification

### 🔧 Development Priorities
1. **Fix storefront rendering issue** (blocking customer-facing functionality)
2. **Implement proper error boundaries** for better user experience
3. **Optimize build process** for faster development cycles
4. **Enhanced monitoring** for production issue detection

## Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
```bash
# Ensure .env file exists and has correct format
cp .env.example .env
# Restart development server after changes
```

**2. Database Connection Issues**
```bash
# Verify Supabase credentials in .env
# Check project URL and anon key are correct
# Ensure RLS policies are properly configured
```

**3. Build Failures**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run lint
```

**4. Storefront Not Displaying Content**
```bash
# Current known issue - check console for debugging logs
# Ensure database migrations have been run
# Verify page content exists in page_documents table
```

### Development Tips

- Use `npm run dev` for hot reloading during development
- Check browser console for detailed error messages
- Use Supabase dashboard to verify database queries
- Test responsive design with browser dev tools
- Monitor network tab for failed API requests

---

*This documentation reflects the current state of SellUsGenie as of September 2024. For the latest updates and technical specifications, please refer to the project's GitHub repository and internal development documentation.*

## Contributing

### Code Standards
- Follow TypeScript strict mode requirements
- Use Prettier for code formatting
- Follow React hooks patterns
- Maintain component isolation and reusability
- Write descriptive commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation as needed
4. Ensure all tests pass
5. Submit PR with detailed description

### Development Workflow
1. Check existing issues and project board
2. Create feature branch: `feature/description-of-change`
3. Implement with proper error handling
4. Add comprehensive tests
5. Update relevant documentation
6. Submit pull request for review

For questions or support, please refer to the project's GitHub issues or internal development channels.