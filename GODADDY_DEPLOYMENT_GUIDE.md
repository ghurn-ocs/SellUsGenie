# GoDaddy Deployment Guide for SellUsGenie

## 📋 GitHub Integration Status
✅ **Repository Connected**: This GitHub repository is connected to GoDaddy hosting with **manual deployment control** to prevent accidental deployments.

## 🚀 Deployment Setup

### 1. Current Configuration
GoDaddy is serving the **development version** directly from the repository root:
- Serves `index.html` from repository root
- Uses Vite development mode with `/src/main.tsx`
- No build process currently configured on server

### 2. GitHub-GoDaddy Manual Deployment

Since your GoDaddy hosting requires manual deployment:

#### Current Deployment Process
1. **Push to GitHub**: Commit and push changes to the repository
2. **SSH/Terminal Access**: Connect to GoDaddy server via SSH or cPanel Terminal  
3. **Manual Pull**: Execute `git pull origin main` to fetch latest changes
4. **Development Mode**: Files are served directly from source

#### Safety Benefits
- **Prevents accidental deployments** from development commits
- **Full control** over when changes go live
- **Review changes** before deployment
- **Rollback capability** by checking out previous commits

#### Current Server Commands
```bash
# On GoDaddy server (development mode):
git pull origin main
# No build step - serves directly from src/
```

### 3. Repository Structure on GoDaddy

The entire GitHub repository is deployed to GoDaddy hosting:

```
Repository Root (served by GoDaddy)
├── index.html (entry point - served directly)
├── src/ (source code - served via Vite)
│   ├── main.tsx
│   ├── App.tsx
│   └── components/
├── public/ (static assets)
├── package.json
├── vite.config.ts
└── ... (all other repo files)
```

#### Web Server Configuration
- **Document Root**: Repository root directory
- **Entry Point**: `index.html` in root
- **Development Mode**: Vite serves from `/src/main.tsx`
- **No Build Step**: Source files served directly

#### ⚠️ Production Optimization Recommendation
For better performance in production, consider:
1. **Enable build process**: Run `npm run build:production` on server
2. **Configure web server**: Point document root to `dist/` directory
3. **Benefits**: Faster loading, optimized bundles, better caching

### 4. Environment Variables Setup

You'll need to configure these environment variables on GoDaddy:

```
VITE_SUPABASE_URL=https://jizobmpcyrzprrwsyedv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_GOOGLE_CLIENT_ID=544739491036-dbrojngcb2jpte84mff126ced60jd6v7.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=com.sellusgenie.web
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
VITE_TRIAL_DAYS=14
```

**Note**: Since this is a static site, environment variables are baked into the build. Update your domain URL in the environment and rebuild if needed.

### 5. Domain Configuration

#### Update Environment for Your Domain
1. Create a `.env` file with your actual domain:
   ```
   VITE_APP_URL=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com/api
   ```
2. Rebuild: `npm run build:production` 
3. Push changes to GitHub
4. Manually pull and deploy on GoDaddy server

#### OAuth Redirect URLs
Update your OAuth providers with your new domain:
- **Google OAuth**: Add `https://yourdomain.com/auth/callback`
- **Apple OAuth**: Add `https://yourdomain.com/auth/callback`

### 6. Supabase Configuration

Update Supabase settings:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your domain to "Allowed Origins"
3. Update redirect URLs to match your domain

### 7. Stripe Configuration

If using Stripe:
1. Update webhook endpoints to point to your domain
2. Configure allowed domains in Stripe dashboard

## 📁 Files Ready for Upload

All files are in the `dist/` directory:
```
dist/
├── index.html (✅ optimized with relative paths)
├── assets/
│   ├── index-CGl3jlhs.js (main app bundle)
│   ├── vendor-RGnvvjkK.js (React libraries)
│   ├── router-C133T3xY.js (routing)
│   ├── ui-D1Cet8uV.js (UI components)
│   └── index-DIP20LTI.css (styles)
├── images/
│   └── genies/ (genie mascot images)
├── vite.svg
└── .htaccess (✅ routing & performance config)
```

## 🔧 Troubleshooting

### React Router Issues
- Ensure `.htaccess` file is uploaded to the same directory as `index.html`
- Check that your hosting supports `.htaccess` files

### Asset Loading Issues
- Verify all files from `dist/assets/` are uploaded
- Check file permissions (755 for directories, 644 for files)

### CORS Issues
- Update Supabase allowed origins
- Check OAuth redirect URLs
- Verify API endpoints point to correct domain

## 🎯 Next Steps After Upload

1. Test the website at your domain
2. Verify OAuth login works
3. Test Stripe payments (if configured)
4. Check Supabase database connections
5. Monitor for any console errors

## 📞 Support

- GoDaddy cPanel documentation
- React Router documentation for static hosting
- Vite deployment guide