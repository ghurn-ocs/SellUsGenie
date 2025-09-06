# Database Schema Documentation

**Version:** 2.0  
**Last Updated:** January 2025  
**Database Type:** PostgreSQL (Supabase)  
**Status:** Production Schema  

---

## 📋 Overview

This directory contains complete documentation for the SellUsGenie database schema, including all tables, relationships, indexes, and Row Level Security (RLS) policies that enable secure multi-tenant operations.

## 📁 Schema Documentation Structure

- **[Complete Schema](./complete-schema.md)** - Full database schema with all tables and relationships
- **[Core Tables](./core-tables.md)** - Essential tables for multi-tenant operations
- **[E-commerce Tables](./ecommerce-tables.md)** - Product catalog, orders, and customer data
- **[Page Builder Schema](./page-builder-schema.md)** - Visual page builder content storage
- **[Analytics Schema](./analytics-schema.md)** - Business intelligence and reporting tables
- **[RLS Policies](./rls-policies.md)** - Row Level Security policy definitions
- **[Indexes and Performance](./indexes-performance.md)** - Database optimization and indexes
- **[Migration Scripts](./migrations/README.md)** - Database migration history and scripts

## 🏗️ Schema Architecture Overview

### Multi-Tenant Hierarchy
```
┌─────────────────┐
│   auth.users    │ ← Supabase Auth (External)
└─────────────────┘
         │ 1:1
         ▼
┌─────────────────┐
│  store_owners   │ ← Top Level Tenant
└─────────────────┘
         │ 1:Many
         ▼
┌─────────────────┐
│     stores      │ ← Individual Store Instances
└─────────────────┘
         │ 1:Many (All related tables)
         ▼
┌─────────────────────────────────────────────────┐
│  categories  │  products  │  customers  │ ... │
└─────────────────────────────────────────────────┘
```

### Data Isolation Strategy
- **Row Level Security (RLS)**: Every table enforces tenant isolation at the database level
- **Store-Level Isolation**: All business data is isolated by `store_id`
- **Owner-Level Access**: Store owners can access all their stores' data
- **Customer-Level Privacy**: Customers can only access their own data within a store

## 📊 Core Schema Statistics

| Category | Tables | Total Columns | Key Relationships |
|----------|---------|---------------|-------------------|
| **Authentication & Users** | 2 | 18 | 1:1, 1:Many |
| **Multi-Tenant Core** | 3 | 45 | 1:Many hierarchical |
| **E-commerce Engine** | 8 | 120+ | Complex many-to-many |
| **Page Builder** | 4 | 35 | Document storage |
| **Analytics** | 6 | 40+ | Time-series data |
| **Integrations** | 5 | 30 | External service configs |
| **System Tables** | 3 | 15 | Configuration & logs |
| **TOTAL** | **31** | **300+** | **50+ relationships** |

## 🔑 Key Schema Features

### 1. Multi-Tenant Security
- **Complete Data Isolation**: RLS policies prevent cross-tenant data access
- **Performance Optimized**: Indexes designed for tenant-aware queries
- **Audit Trail**: All sensitive operations logged with user context

### 2. E-commerce Optimized
- **Flexible Product Model**: Support for variants, categories, and complex pricing
- **Order Processing**: Complete order lifecycle with payment integration
- **Inventory Management**: Real-time stock tracking and low-stock alerts
- **Customer Management**: Comprehensive customer profiles and history

### 3. Page Builder Integration
- **Document Storage**: JSON-based page content with full revision history
- **Widget System**: Extensible widget registry with typed properties
- **Performance**: Optimized for fast page rendering and editing

### 4. Analytics Ready
- **Business Intelligence**: Pre-built tables for common business metrics
- **Time-Series Data**: Optimized for analytics queries and reporting
- **Real-time Insights**: Support for live dashboard updates

## 🛡️ Security Implementation

### Row Level Security (RLS) Policies

#### Standard Policy Pattern
```sql
-- Tenant isolation pattern used across all business tables
CREATE POLICY tenant_isolation ON [table_name] 
FOR ALL USING (
    store_id IN (
        SELECT id FROM stores 
        WHERE store_owner_id = auth.uid()
    )
);
```

#### Customer Privacy Pattern
```sql
-- Customer data access pattern
CREATE POLICY customer_data_access ON customers
FOR ALL USING (
    -- Store owners can access all customer data in their stores
    store_id IN (
        SELECT id FROM stores 
        WHERE store_owner_id = auth.uid()
    )
    OR
    -- Customers can access their own data
    auth.uid() = user_id
);
```

### Security Features
- **JWT Token Integration**: All policies use Supabase auth context
- **Principle of Least Privilege**: Users can only access necessary data
- **Automatic Policy Enforcement**: Database-level security, not application-level
- **Audit Logging**: Sensitive operations tracked with user attribution

## 📈 Performance Optimizations

### Strategic Indexing
- **Tenant-Aware Indexes**: All queries optimized for multi-tenant access patterns
- **Composite Indexes**: Multi-column indexes for common query patterns
- **Partial Indexes**: Conditional indexes for specific use cases

### Query Performance
- **Average Query Time**: < 50ms for standard operations
- **Bulk Operations**: Optimized for large data imports/exports
- **Real-time Queries**: Sub-10ms response for dashboard widgets

## 🔄 Migration Strategy

### Database Versioning
- **Schema Migrations**: All changes tracked in version control
- **Rollback Support**: Every migration has a corresponding rollback script
- **Testing**: All migrations tested against production data samples

### Deployment Process
1. **Staging Testing**: Migrations tested in staging environment
2. **Backup Creation**: Full database backup before production migration
3. **Migration Execution**: Automated migration with monitoring
4. **Validation**: Post-migration data integrity checks
5. **Rollback Plan**: Immediate rollback capability if issues detected

## 📋 Schema Validation Rules

### Data Integrity
- **Foreign Key Constraints**: All relationships properly enforced
- **Check Constraints**: Business rule validation at database level
- **Not Null Constraints**: Required fields enforced consistently
- **Unique Constraints**: Prevent duplicate data where appropriate

### Business Logic Validation
- **Email Format Validation**: Proper email format enforcement
- **Price Validation**: Non-negative pricing constraints
- **Inventory Validation**: Logical stock level constraints
- **Date Validation**: Proper date range and sequence validation

## 🔗 Integration Points

### External Service Integration
- **Stripe**: Payment and subscription data synchronization
- **Google Maps**: Delivery area geographic data storage
- **Analytics Services**: Event and conversion data tracking
- **Email Services**: Template and delivery configuration

### API Integration
- **REST API**: Full CRUD operations through Supabase API
- **Real-time Subscriptions**: Live data updates via WebSocket
- **Batch Operations**: Bulk import/export functionality
- **Search Integration**: Full-text search capabilities

---

## 📚 Quick Reference Links

- **[View Complete Schema](./complete-schema.md)** - Full table definitions
- **[RLS Policy Reference](./rls-policies.md)** - Security policy details  
- **[Migration Guide](./migrations/README.md)** - Database change management
- **[Performance Tuning](./indexes-performance.md)** - Optimization strategies

---

## 🆘 Support & Maintenance

### Schema Change Process
1. **RFC Creation**: Propose schema changes via RFC process
2. **Impact Analysis**: Assess impact on existing data and applications
3. **Migration Planning**: Create migration and rollback scripts
4. **Testing**: Comprehensive testing in staging environment
5. **Production Deployment**: Coordinated deployment with monitoring

### Emergency Procedures
- **Schema Rollback**: Emergency rollback procedures documented
- **Data Recovery**: Point-in-time recovery capabilities
- **Performance Issues**: Query optimization troubleshooting guide
- **Security Incidents**: Data breach response procedures

---

*For questions about the database schema, please contact the database team or refer to the technical documentation.*