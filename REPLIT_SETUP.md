# 🧞‍♂️ SellUsGenie - Replit Deployment Setup

## Quick Setup for Replit Hosting

### 1. Import from GitHub
1. Go to [Replit](https://replit.com)
2. Click "Create Repl" → "Import from GitHub"
3. Enter: `https://github.com/ghurn-ocs/SellUsGenie`
4. Replit will automatically detect the configuration

### 2. Automatic Configuration
The following files configure Replit automatically:
- **`.replit`** - Deployment and port configuration
- **`replit.nix`** - Dependencies (Node.js, npm, serve)
- **`build-production.js`** - Production build script

### 3. Environment Variables
Set these in Replit's "Secrets" tab:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration  
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id
```

### 4. GitHub Auto-Deploy

**Option A: Replit GitHub Integration**
1. In Replit, go to "Version Control" tab
2. Connect your GitHub account
3. Link to `ghurn-ocs/SellUsGenie` repository
4. Enable "Auto-pull from GitHub"

**Option B: GitHub Actions (Already Configured)**
- Pushes to `main` branch trigger build verification
- Build artifacts ready for Replit deployment
- See `.github/workflows/deploy-replit.yml`

### 5. Commands

```bash
# Development
npm run dev

# Production Build
npm run build:quick        # Fast build (skips TypeScript)
npm run build:production   # Production build script

# Serve Built Files
npm run serve              # Serve dist/ on port 3000
```

### 6. Deployment Process

1. **Push to GitHub**: `git push origin main`
2. **GitHub Actions**: Automatically builds and verifies
3. **Replit**: Auto-pulls changes and rebuilds
4. **Live Site**: Updates automatically

### 7. Manual Deployment

If auto-deploy fails, run manually in Replit:

```bash
npm run build:quick
npm run serve
```

### 8. Custom Domain (Optional)

In Replit:
1. Go to your Repl settings
2. Find "Custom Domain" section  
3. Add your domain (requires Replit Pro)

### 9. Troubleshooting

**Build Fails?**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build:quick
```

**Port Issues?**
- Replit uses port 3000 by default
- Check `.replit` file for port configuration

**Environment Variables Missing?**
- Check Replit "Secrets" tab
- Verify all required vars are set

---

## 🚀 Ready to Deploy!

Your SellUsGenie store is configured for seamless GitHub → Replit deployment. 

**Next Steps:**
1. Set up environment variables in Replit
2. Push changes to GitHub main branch
3. Watch auto-deployment work! 🧞‍♂️