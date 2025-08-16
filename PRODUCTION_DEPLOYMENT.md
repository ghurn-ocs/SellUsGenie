# 🧞‍♂️ SellUsGenie - Production Deployment Guide

## Replit Static Hosting Configuration

This project is configured for **production static hosting** on Replit, not development servers.

### 🚀 Production Setup

**Configuration:**
- **Deployment Target**: Static hosting
- **Build Command**: `npm run build:quick` 
- **Public Directory**: `dist/`
- **Environment**: Production (`NODE_ENV=production`)

### 📁 File Structure After Build

```
dist/
├── index.html           # Main app entry point
├── assets/
│   ├── index-[hash].css # Compiled styles
│   └── index-[hash].js  # Compiled JavaScript
└── images/              # Static assets
    └── genies/          # Genie mascot images
```

### ⚡ Deployment Process

1. **Import from GitHub** → `https://github.com/ghurn-ocs/SellUsGenie`
2. **Auto-build** → Replit runs `npm install && npm run build:quick`
3. **Static hosting** → Serves files from `dist/` directory
4. **Production ready** → Optimized, minified assets

### 🔧 Environment Variables (Required)

Set these in Replit's **Secrets** tab:

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe Payments (Required)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key

# OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id
```

### 🌐 Domain Configuration

**Default URL**: `https://your-repl-name.your-username.repl.co`

**Custom Domain** (Replit Pro):
1. Go to Repl settings
2. Add custom domain
3. Update Supabase site URL settings
4. Update Stripe webhook URLs

### 📊 Performance Optimizations

- **Vite bundling** - Tree-shaking and code splitting
- **Asset compression** - Gzip compression enabled
- **Static CDN** - Replit's global CDN delivery
- **Fast builds** - TypeScript checking skipped for speed

### 🛠️ Troubleshooting

**Build Fails?**
```bash
# Check build locally
npm run build:quick

# Check for TypeScript errors
npm run build
```

**Environment Variables Missing?**
- Check Replit Secrets tab
- Restart deployment after adding variables

**Assets Not Loading?**
- Verify `dist/` directory exists after build
- Check asset paths in browser console

### 🔄 Development Workflow

```bash
# Local development
npm run dev              # Development server

# Production build
npm run build:quick      # Fast production build
npm run build:production # Full production build with checks

# Test production build locally
npm run serve           # Serve dist/ files
```

### 📈 Monitoring

**Replit Analytics:**
- View deployment logs
- Monitor traffic and usage
- Check build status

**Application Monitoring:**
- Supabase dashboard for database metrics
- Stripe dashboard for payment processing
- Browser dev tools for frontend performance

---

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] Supabase database setup
- [ ] Stripe payment configuration
- [ ] Domain configured (optional)
- [ ] Build process verified
- [ ] Static assets loading correctly

🧞‍♂️ **Your SellUsGenie store is production-ready!**