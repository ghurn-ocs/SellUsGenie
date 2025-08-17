# GoDaddy Deployment Guide for SellUsGenie

## 🚀 Deployment Steps

### 1. Build Process (Completed)
The production build has been created in the `dist/` directory with:
- Optimized assets with relative paths
- .htaccess file for React Router support
- Code splitting for better performance
- Gzip compression configuration

### 2. Upload to GoDaddy cPanel

#### Access cPanel
1. Log into your GoDaddy account
2. Navigate to "Web Hosting" section
3. Click "Admin cPanel" button

#### Upload Files
1. Open **File Manager** in cPanel
2. Navigate to `public_html` directory
3. **IMPORTANT**: Upload the CONTENTS of the `dist/` folder, not the folder itself
4. Upload these files/folders:
   - `index.html`
   - `assets/` folder (with all JS/CSS files)
   - `images/` folder (with genie images)
   - `vite.svg`
   - `.htaccess` (for routing support)

### 3. Environment Variables Setup

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

### 4. Domain Configuration

#### Update Environment for Your Domain
1. Create a `.env` file with your actual domain:
   ```
   VITE_APP_URL=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com/api
   ```
2. Rebuild: `npm run build:production`
3. Re-upload the new `dist/` contents

#### OAuth Redirect URLs
Update your OAuth providers with your new domain:
- **Google OAuth**: Add `https://yourdomain.com/auth/callback`
- **Apple OAuth**: Add `https://yourdomain.com/auth/callback`

### 5. Supabase Configuration

Update Supabase settings:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your domain to "Allowed Origins"
3. Update redirect URLs to match your domain

### 6. Stripe Configuration

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