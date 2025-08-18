# GoDaddy Deployment Guide for SellUsGenie

## 📋 GitHub Integration Status
✅ **Repository Connected**: This GitHub repository is connected to GoDaddy hosting with **manual deployment control** to prevent accidental deployments.

## 🚀 Deployment Setup

### 1. Key Issue: dist/ Not in GitHub
**Problem**: The `dist/` directory is in `.gitignore` and does NOT get pushed to GitHub.
**Solution**: GoDaddy must build the `dist/` directory on their server after pulling source code.

#### Why This Matters:
- GitHub only contains source code (`src/`, `package.json`, etc.)
- No built files (`dist/`) are stored in version control
- GoDaddy gets source code via git pull, then must build locally

### 2. GitHub-GoDaddy Manual Deployment

Since your GoDaddy hosting requires manual deployment:

#### Current Deployment Process
1. **Push to GitHub**: Commit and push changes to the repository
2. **SSH/Terminal Access**: Connect to GoDaddy server via SSH or cPanel Terminal  
3. **Manual Pull**: Execute `git pull origin main` to fetch latest changes
4. **Build on Server**: Run `npm run build:production` to create `dist/` directory
5. **Serve**: Web server serves the built files from `dist/`

#### Safety Benefits
- **Prevents accidental deployments** from development commits
- **Full control** over when changes go live
- **Review changes** before deployment
- **Rollback capability** by checking out previous commits

#### How to Execute Commands in GoDaddy cPanel

**❌ Problem: GoDaddy cPanel typically does NOT include Terminal access**

**✅ Solution Options:**

**Method 1: SSH Access (If Enabled)**
- GoDaddy shared hosting usually blocks SSH
- VPS/Dedicated servers may have SSH access
- Contact GoDaddy support to enable if available

**Method 2: Git Version Control in cPanel**
1. In cPanel, look for **Git Version Control** or **Git™ Version Control**
2. This allows git pulls but NOT npm commands
3. Limited to version control operations only

**Method 3: Node.js Selector (If Available)**
1. Look for **Node.js Selector** in cPanel
2. May allow setting up Node.js environment
3. Still limited in command execution capabilities

**Method 4: FTP/File Manager Upload (Manual) - RECOMMENDED**
1. Build locally: `npm run build:production`
2. **Test locally** (optional): `npm run serve` to preview production build
3. **Important**: Upload the CONTENTS of `dist/` folder (not the folder itself)
4. Upload to `public_html` directory:
   - `index.html` (from dist/)
   - `assets/` folder (from dist/)
   - `images/` folder (from dist/)
   - `.htaccess` (from dist/)
   - `vite.svg` (from dist/)

**⚠️ Common Mistake**: Don't run `npm run dev` after building - use `npm run serve` to test production files.

**⚠️ Reality Check**: GoDaddy shared hosting has limited Node.js/npm support. You may need to build locally and upload manually.

**Critical**: Since GoDaddy shared hosting may not support npm commands, you likely need to build locally and upload the `dist/` contents manually.

### 3. Repository Structure on GoDaddy

The entire GitHub repository is deployed to GoDaddy hosting:

```
What GitHub Contains (what gets pulled):
├── src/ (source code)
├── public/ (static assets)  
├── package.json
├── vite.config.ts
├── .gitignore (excludes dist/)
└── ... (other source files)
❌ NO dist/ directory in GitHub!

What GoDaddy Has After Build:
├── src/ (from GitHub)
├── public/ (from GitHub)
├── package.json (from GitHub)
├── node_modules/ (from npm install)
├── dist/ (❗ CREATED by npm run build:production)
│   ├── index.html
│   ├── assets/
│   └── .htaccess
```

#### Web Server Configuration
- **Source**: Repository pulled from GitHub
- **Build Required**: `dist/` created by running build on server
- **Document Root**: Points to `dist/` directory (after build)
- **Deployment Flow**: Pull source → Build → Serve

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

#### OAuth Redirect URLs - CRITICAL FOR PRODUCTION
**🚨 This is why Google Auth fails in production!**

**Google OAuth Console (console.developers.google.com):**
1. Go to your Google Cloud Console project
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. In **Authorized JavaScript origins**, add:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com` (if using www)
5. In **Authorized redirect URIs**, add:
   - `https://yourdomain.com/auth/callback`
   - `https://www.yourdomain.com/auth/callback`

**Apple OAuth - You MUST create a Services ID for web domains:**

**❌ App ID Method Won't Work**: App IDs that "Enable as primary App ID" don't allow domain configuration - this is for mobile apps only.

**✅ Correct Method - Create Services ID:**
1. In Apple Developer Console → **Identifiers**
2. **Click the "+" button** to create new identifier
3. **Select "Services IDs"** and click Continue
4. **Register Services ID:**
   - **Description**: SellUsGenie Web Service
   - **Identifier**: com.sellusgenie.web.auth
   - Leave other options unchecked
5. **Click "Continue"** then **"Register"**
6. **Click on your new Services ID** from the list
7. **Check "Sign In with Apple"** to enable it
8. **Click "Configure"** next to Sign In with Apple
9. **In the configuration window:**
   - **Primary App ID**: Select your existing App ID (com.sellusgenie.web)
   - **Website URLs** section:
     - **Domains and Subdomains**: Add `yourdomain.com`
     - **Return URLs**: Add `https://yourdomain.com/auth/callback`
10. **Click "Save"** then **"Continue"** then **"Save"** again

**Critical**: Only Services IDs allow domain configuration. App IDs set as "primary" cannot configure web domains - that's the limitation you encountered!

**Important for Environment Variables**: Use the Services ID (`com.sellusgenie.web.auth`) as your `VITE_APPLE_CLIENT_ID` in production, not the App ID.

**Recommendation**: Keep both configured:
- **App ID** (`com.sellusgenie.web`): For future mobile apps (iOS/Android)
- **Services ID** (`com.sellusgenie.web.auth`): For web authentication
- Both can coexist and share the same Apple Developer account

### 6. Supabase Configuration - CRITICAL FOR AUTH

**🚨 Also required for Google Auth to work!**

**Supabase Dashboard (supabase.com/dashboard):**
1. Go to your project → **Authentication** → **URL Configuration**
2. **Site URL**: Set to `https://yourdomain.com`
3. **Redirect URLs**: Add:
   - `https://yourdomain.com/auth/callback`
   - `https://www.yourdomain.com/auth/callback`
4. **Additional Redirect URLs**: Add any other domains you use

**Important**: Both Google OAuth Console AND Supabase must have the same redirect URLs configured.

### 7. SSL Certificate Configuration - REQUIRED FOR OAUTH

**🚨 SSL is mandatory for Google/Apple OAuth to work!**

**GoDaddy SSL Installation Options:**

**✅ Recommended**: **"Install SSL automatically"** or **"Auto-install SSL"**
- Let GoDaddy handle the technical setup
- Automatically configures server settings
- Updates regularly without manual intervention

**Alternative Options (if auto-install not available):**
- **"Install SSL via cPanel"**: Manual installation through cPanel interface
- **"Manual SSL installation"**: Requires technical server knowledge (not recommended)

**Steps:**
1. In GoDaddy account → **SSL Certificates**
2. Find your domain's SSL certificate
3. Click **"Install"** or **"Set Up"**
4. Select **"Auto-install"** if available
5. Choose your hosting account/domain
6. Click **"Install SSL"**

**Verification:**
- Visit `https://yourdomain.com` (note HTTPS)
- Check for green lock icon in browser
- Ensure no mixed content warnings

### 8. Stripe Configuration

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

### "Still Using Vite Locally" Issue
If the site appears to still be using Vite development mode:

**Check 1: Verify Correct Files Uploaded**
- Ensure you uploaded `dist/index.html` (NOT root `index.html`)
- Root `index.html` contains: `<script type="module" src="/src/main.tsx"></script>`
- Dist `index.html` contains: `<script type="module" crossorigin src="./assets/index-[hash].js"></script>`

**Check 2: Clear Browser Cache**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Open in incognito/private window
- Clear browser cache completely

**Check 3: Verify Upload Location**
- Files must be in `public_html` directory (or domain's document root)
- Check GoDaddy cPanel > File Manager path

**Check 4: Check for Development Files**
- Ensure NO development `index.html` in `public_html`
- Remove any `src/` folder from server
- Only production files should exist

### React Router Issues
- Ensure `.htaccess` file is uploaded to the same directory as `index.html`
- Check that your hosting supports `.htaccess` files

### Asset Loading Issues
- Verify all files from `dist/assets/` are uploaded
- Check file permissions (755 for directories, 644 for files)

### Google Auth / OAuth Issues

**Problem**: "Sign into store" doesn't work, Google Auth fails

**Solutions**:

**1. Check Google OAuth Console**
- Verify `https://yourdomain.com` is in **Authorized JavaScript origins**
- Verify `https://yourdomain.com/auth/callback` is in **Authorized redirect URIs**
- Remove localhost URLs from production if present

**2. Check Supabase Configuration**
- Site URL must match your domain exactly
- Redirect URLs must match Google OAuth settings
- Ensure authentication is enabled

**3. Common Errors & Fixes**:
- `redirect_uri_mismatch`: OAuth redirect URLs don't match
- `unauthorized_client`: Domain not authorized in Google Console
- `access_denied`: User canceled or domain blocked

**4. Testing OAuth**:
- Test in incognito window (clears cache)
- Check browser console for specific error messages
- Verify HTTPS is working (OAuth requires secure connection)

### Apple OAuth Issues

**Problem**: Apple Sign In doesn't work in production

**Solutions**:

**1. Check Apple Developer Console**
- Verify your domain is in **Domains and Subdomains**
- Verify callback URLs are in **Return URLs**
- Ensure "Sign In with Apple" capability is enabled
- Check if you need Services ID vs App ID configuration

**2. Common Apple OAuth Errors**:
- `invalid_request`: Domain not configured in Apple Console
- `invalid_client`: Client ID mismatch or not configured
- `server_error`: Apple's servers having issues (temporary)

**3. Apple OAuth Requirements**:
- Must use HTTPS (no HTTP allowed)
- Domain must exactly match what's configured
- Return URLs must be exact matches (case-sensitive)

**4. Debugging Apple OAuth**:
- Check browser Network tab for failed requests
- Verify client ID matches your configuration
- Test with different browsers to rule out cache issues

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