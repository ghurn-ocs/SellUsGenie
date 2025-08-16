# Google OAuth Setup Guide for Sell Us Genie

## 🎯 **Overview**
This guide walks you through setting up Google OAuth authentication for your Sell Us Genie application in Supabase.

## 📋 **Step-by-Step Google OAuth Configuration**

### **Step 1: Access Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### **Step 2: Enable Google+ API**
1. In the Google Cloud Console, navigate to **APIs & Services** → **Library**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google Identity"** or **"Google+ API"**
4. Click **"Enable"**

### **Step 3: Create OAuth 2.0 Credentials**
1. Navigate to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. If prompted, configure the OAuth consent screen first:
   - **User Type**: External
   - **App name**: Sell Us Genie
   - **User support email**: glenn@omnicybersolutions.com
   - **Developer contact information**: glenn@omnicybersolutions.com
   - **Authorized domains**: sellusgenie.com

### **Step 4: Configure OAuth 2.0 Client ID**
1. **Application type**: Web application
2. **Name**: Sell Us Genie Web Client
3. **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - `http://localhost:5174` (for development)
   - `http://localhost:5175` (for development)
   - `https://sellusgenie.com` (for production)
4. **Authorized redirect URIs**:
   - `https://jizobmpcyrzprrwsyedv.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)
   - `http://localhost:5174/auth/callback` (for development)
   - `http://localhost:5175/auth/callback` (for development)
5. Click **"Create"**

### **Step 5: Note Your Credentials**
After creation, you'll get:
- **Client ID**: (e.g., `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret**: (e.g., `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

## 🔧 **Supabase Configuration**

### **Step 6: Configure Supabase Google Provider**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jizobmpcyrzprrwsyedv`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Edit**
5. Fill in the configuration:
   - **Enable Google Provider**: ✅ Check this box
   - **Client ID**: [Your Google Client ID from Step 5]
   - **Client Secret**: [Your Google Client Secret from Step 5]
6. Click **Save**

## 📝 **Required Information Summary**

You'll need these values for Supabase configuration:

| Field | Value |
|-------|-------|
| **Client ID** | [Your Google OAuth Client ID] |
| **Client Secret** | [Your Google OAuth Client Secret] |

## 🚨 **Important Notes**

1. **Keep your Client Secret secure** - never expose it in client-side code
2. **Authorized domains must match exactly** - `sellusgenie.com`
3. **Redirect URIs must be exact** - `https://jizobmpcyrzprrwsyedv.supabase.co/auth/v1/callback`
4. **Development URLs** - Include localhost URLs for development testing

## ✅ **Verification Steps**

After configuration:
1. Test the Google Sign In button in your Sell Us Genie application
2. Verify the redirect works properly
3. Check that user accounts are created in Supabase
4. Confirm the authentication flow completes successfully

## 🆘 **Troubleshooting**

- **"Invalid client" error**: Double-check the Client ID spelling
- **"Invalid redirect URI"**: Verify the redirect URI in Google Cloud Console
- **"Unauthorized domain"**: Ensure the domain is added to authorized domains
- **"OAuth consent screen not configured"**: Complete the OAuth consent screen setup

## 🔒 **Security Best Practices**

1. **Use environment variables** for Client ID and Secret
2. **Restrict authorized domains** to only your production domain
3. **Monitor OAuth usage** in Google Cloud Console
4. **Regularly rotate Client Secrets** for security
5. **Use HTTPS only** in production

## 📋 **Environment Variables**

Add these to your `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Note: The Client Secret is only needed in Supabase configuration, not in your frontend environment variables.
