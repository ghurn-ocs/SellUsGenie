# StreamSell - Multi-Tenant E-commerce Platform

Sell Us Genie is a sophisticated, enterprise-grade e-commerce platform featuring multi-tenancy, integrated OAuth authentication, and comprehensive store management capabilities. The platform allows store owners to create and manage multiple stores under a single account with a unified billing system.

## 🚀 Features

### Multi-Tenancy
- **Multiple Stores Per Owner**: Store owners can create and manage unlimited stores
- **Store Selector**: Easy switching between stores via dropdown in admin portal
- **Isolated Data**: Complete data separation between stores for security
- **Unified Billing**: One subscription covers all stores owned by a store owner

### Authentication
- **Google OAuth**: Seamless sign-in with Google accounts
- **Apple OAuth**: Secure authentication with Apple ID
- **Automatic Provisioning**: New users get 14-day free trial automatically

### Store Management
- **Dashboard**: Comprehensive analytics and store overview
- **Product Management**: Add, edit, and manage products
- **Order Processing**: Complete order lifecycle management
- **Customer Management**: Customer profiles and order history
- **Analytics**: Sales and performance insights

### Subscription System
- **14-Day Free Trial**: Automatic trial for new store owners
- **Flexible Plans**: Basic, Pro, and Enterprise tiers
- **Stripe Integration**: Secure payment processing
- **Trial Management**: Automatic expiration and upgrade prompts

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Stripe** for payment processing

### Database
- **Multi-tenant schema** with isolated data per store
- **Row Level Security** policies for data protection
- **Automatic triggers** for audit trails

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Google OAuth credentials
- Apple OAuth credentials

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sellusgenie
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the environment template and configure your variables:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=com.sellusgenie.web

# Application Configuration
VITE_APP_URL=https://sellusgenie.com
VITE_API_URL=https://sellusgenie.com/api
VITE_TRIAL_DAYS=14
```

### 4. Database Setup

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the script

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

### 5. Configure OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)

#### Apple OAuth
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create an App ID
3. Enable Sign In with Apple
4. Create a Service ID
5. Configure redirect URIs in Supabase

### 6. Configure Supabase Authentication
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google and Apple providers
4. Add your OAuth credentials

### 7. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
StreamSell/
├── src/
│   ├── contexts/           # React contexts for state management
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── StoreContext.tsx # Store management context
│   ├── lib/
│   │   └── supabase.ts     # Supabase client and types
│   ├── pages/              # Application pages
│   │   ├── LandingPage.tsx # Company landing page
│   │   ├── StoreOwnerDashboard.tsx # Admin dashboard
│   │   └── AuthCallback.tsx # OAuth callback handler
│   └── App.tsx             # Main application component
├── database/
│   └── schema.sql          # Database schema
├── env.example             # Environment variables template
└── README.md               # This file
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Migrations
When making schema changes:
1. Update `database/schema.sql`
2. Run the migration in Supabase
3. Update TypeScript types in `src/lib/supabase.ts`

### Adding New Features
1. Create feature branch
2. Implement feature with proper TypeScript types
3. Add tests if applicable
4. Update documentation
5. Submit pull request

## 🔒 Security

### Row Level Security (RLS)
All database tables have RLS policies enabled:
- Store owners can only access their own data
- Store data is isolated per store
- Customer data is isolated per store

### Authentication
- OAuth 2.0 with Google and Apple
- JWT tokens managed by Supabase
- Automatic session management
- Secure callback handling

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection
- CSRF protection

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Supabase production URL and keys
- Stripe production keys
- OAuth production credentials
- Production domain URLs

### Hosting
The application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting provider

## 📊 Monitoring

### Analytics
- Supabase Analytics for database performance
- Stripe Dashboard for payment monitoring
- Custom analytics for store performance

### Error Tracking
- Supabase Error Logs
- Browser console errors
- Custom error tracking implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Roadmap

### Phase 1: Core Platform ✅
- [x] Multi-tenant architecture
- [x] OAuth authentication
- [x] Store management
- [x] Basic dashboard

### Phase 2: E-commerce Features 🚧
- [ ] Product management
- [ ] Order processing
- [ ] Customer management
- [ ] Payment integration

### Phase 3: Advanced Features 📋
- [ ] Analytics and reporting
- [ ] Email marketing
- [ ] Inventory management
- [ ] Shipping integration

### Phase 4: Enterprise Features 📋
- [ ] API access
- [ ] Custom domains
- [ ] Advanced analytics
- [ ] White-label options

---

**StreamSell** - Empowering entrepreneurs to build their e-commerce empire, one store at a time.
