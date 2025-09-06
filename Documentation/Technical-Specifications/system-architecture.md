# System Architecture

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Current Implementation  

---

## 🏗️ Architecture Overview

SellUsGenie is built as a modern, scalable multi-tenant e-commerce platform using a serverless-first architecture with strong data isolation and security principles.

## 🎯 Core Architecture Principles

### 1. Multi-Tenancy First
- **Data Isolation**: Complete separation using PostgreSQL Row Level Security (RLS)
- **Resource Sharing**: Efficient resource utilization while maintaining security
- **Scalability**: Architecture supports unlimited stores per owner and unlimited owners

### 2. Security by Design
- **Zero Trust Model**: Every data access requires authentication and authorization
- **Row Level Security**: Database-level enforcement of tenant isolation
- **OAuth Integration**: Secure authentication with major providers (Google, Apple)
- **API Security**: Rate limiting, input validation, and secure API design

### 3. Performance Optimized
- **Edge Computing**: Supabase Edge Functions for low latency
- **CDN Distribution**: Static assets served via global CDN
- **Database Optimization**: Proper indexing and query optimization
- **Client-Side Caching**: TanStack Query for efficient data caching

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
├─────────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript Frontend                                │
│  ├── Admin Dashboard (Store Management)                        │
│  ├── Visual Page Builder (Drag & Drop)                         │
│  ├── Customer Storefront (Public Pages)                        │
│  └── Authentication (OAuth Integration)                        │
│                                                                 │
│  State Management: TanStack Query + React Context              │
│  UI Framework: Tailwind CSS + Radix UI                         │
│  Routing: Wouter (Lightweight)                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                           │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions (Serverless)                          │
│  ├── Authentication Service                                    │
│  ├── Store Management APIs                                     │
│  ├── E-commerce APIs (Products, Orders, Cart)                 │
│  ├── Analytics & Reporting                                     │
│  ├── Page Builder APIs                                         │
│  └── Integration APIs (Stripe, Google Maps, etc.)             │
│                                                                 │
│  Security: JWT tokens, Rate limiting, Input validation         │
│  Monitoring: Real-time logging and metrics                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA TIER                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Supabase)                                │
│  ├── Multi-Tenant Schema with RLS Policies                     │
│  ├── Store Owners & Stores Tables                              │
│  ├── E-commerce Tables (Products, Orders, Customers)           │
│  ├── Page Builder Content Storage                              │
│  ├── Analytics & Metrics Tables                                │
│  └── System Configuration Tables                               │
│                                                                 │
│  Features: Real-time subscriptions, Automatic backups          │
│  Security: Row Level Security, Encrypted at rest               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  ├── Stripe (Payments & Subscriptions)                         │
│  ├── Google Maps (Delivery Areas)                              │
│  ├── Google Analytics (Website Analytics)                      │
│  ├── Meta Pixel (Marketing Analytics)                          │
│  ├── OAuth Providers (Google, Apple)                           │
│  └── Email Services (Transactional emails)                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Frontend Stack
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Wouter**: Lightweight routing library
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation

### Backend Stack
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Primary database with full-text search
- **Supabase Edge Functions**: Serverless compute
- **Supabase Auth**: Authentication and authorization
- **Supabase Storage**: File and image storage
- **Supabase Real-time**: Live data subscriptions

### External Services
- **Stripe**: Payment processing and subscription management
- **Google Maps**: Geolocation and delivery area mapping
- **Google Analytics**: Website traffic analysis
- **Meta Pixel**: Marketing and conversion tracking
- **Resend/SendGrid**: Transactional email delivery

## 🗄️ Database Architecture

### Multi-Tenant Data Model
```
store_owners (Top Level)
├── stores (1:Many)
    ├── categories (1:Many)
    ├── products (1:Many)
    ├── customers (1:Many)
    ├── orders (1:Many)
    ├── pages (1:Many - Page Builder)
    └── analytics (1:Many)
```

### Row Level Security (RLS) Implementation
- **Tenant Isolation**: Every table includes `store_id` or `store_owner_id`
- **Policy Enforcement**: Database-level policies prevent cross-tenant data access
- **Authentication**: Supabase JWT tokens carry user context
- **Authorization**: Policies check token claims for data access

### Key RLS Policy Pattern
```sql
CREATE POLICY tenant_isolation ON table_name 
FOR ALL USING (
    store_id IN (
        SELECT id FROM stores 
        WHERE store_owner_id = auth.uid()
    )
);
```

## 🔄 Data Flow Architecture

### 1. Authentication Flow
1. User initiates OAuth login (Google/Apple)
2. OAuth provider validates and returns authorization code
3. Supabase exchanges code for JWT token
4. Client stores JWT for API authentication
5. All subsequent API calls include JWT in Authorization header

### 2. API Request Flow
1. Client makes API request with JWT token
2. Supabase validates JWT and extracts user claims
3. Database queries automatically enforce RLS policies
4. Response filtered to only include user's accessible data
5. Client receives tenant-isolated data

### 3. Real-time Subscription Flow
1. Client subscribes to Supabase real-time channel
2. Database changes trigger real-time events
3. RLS policies filter events based on user permissions
4. Only authorized updates reach the client
5. UI automatically updates with new data

## 🏗️ Component Architecture

### Page Builder System
```
┌─────────────────────────────────────────┐
│           Page Builder Core             │
├─────────────────────────────────────────┤
│  WidgetRegistry (Component Management)  │
│  ├── Widget Types (Text, Image, etc.)  │
│  ├── Layout System (Sections, Rows)    │
│  ├── Responsive Grid (12-column)       │
│  └── Theme Engine (Colors, Typography) │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Editor Interface                │
├─────────────────────────────────────────┤
│  ├── Drag & Drop Canvas                │
│  ├── Widget Library Panel              │
│  ├── Properties Panel                  │
│  ├── Device Preview (Mobile/Desktop)   │
│  └── Publish/Save Controls             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Storefront Renderer              │
├─────────────────────────────────────────┤
│  ├── Page Document Parser              │
│  ├── Widget View Components            │
│  ├── Responsive Layout Engine          │
│  ├── SEO Meta Tag Generation           │
│  └── Performance Optimization          │
└─────────────────────────────────────────┘
```

### E-commerce Engine
```
┌─────────────────────────────────────────┐
│          Store Management               │
├─────────────────────────────────────────┤
│  ├── Store Configuration               │
│  ├── Domain Management                 │
│  ├── Payment Settings                  │
│  └── Analytics Configuration           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Product Catalog                  │
├─────────────────────────────────────────┤
│  ├── Product Management                │
│  ├── Category Organization             │
│  ├── Inventory Tracking               │
│  ├── Image Management                  │
│  └── Pricing & Variants               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Order Processing                │
├─────────────────────────────────────────┤
│  ├── Shopping Cart                     │
│  ├── Checkout Flow                     │
│  ├── Payment Processing                │
│  ├── Order Management                  │
│  └── Customer Communication            │
└─────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Production Environment
- **CDN**: Global content delivery network
- **Edge Functions**: Deployed to multiple regions
- **Database**: Primary with read replicas
- **Storage**: Distributed file storage with CDN
- **Monitoring**: Real-time performance and error tracking

### Development Pipeline
1. **Development**: Local environment with Supabase CLI
2. **Staging**: Preview deployments for testing
3. **Production**: Blue-green deployment strategy
4. **Monitoring**: Comprehensive logging and alerting

## 📊 Performance Characteristics

### Target Performance Metrics
- **Page Load Time**: < 2 seconds initial load
- **API Response Time**: < 200ms average
- **Database Query Time**: < 50ms average
- **CDN Cache Hit Rate**: > 95%
- **Uptime**: > 99.9%

### Scalability Targets
- **Concurrent Users**: 10,000+ per region
- **Stores per Owner**: Unlimited
- **Products per Store**: 100,000+
- **Orders per Day**: 1,000,000+
- **API Requests**: 1,000 per second per region

## 🔒 Security Architecture

### Authentication & Authorization
- **OAuth 2.0**: Industry standard authentication
- **JWT Tokens**: Stateless authentication tokens
- **Role-Based Access**: Different permission levels
- **Multi-Factor Auth**: Optional additional security

### Data Protection
- **Encryption at Rest**: Database and file storage encrypted
- **Encryption in Transit**: All API communications over HTTPS
- **Row Level Security**: Database-enforced tenant isolation
- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: API abuse prevention

### Compliance
- **GDPR**: European data protection compliance
- **PCI DSS**: Payment card industry standards (via Stripe)
- **SOC 2**: Security audit compliance
- **Privacy by Design**: Data minimization principles

---

## 🔗 Related Documentation

- [API Specifications](./api-specifications.md)
- [Database Schema](../Database-Schema/README.md)
- [Security Specifications](./security-specifications.md)
- [Performance Specifications](./performance-specifications.md)

---

*For questions about the system architecture, please refer to the development team or system architects.*