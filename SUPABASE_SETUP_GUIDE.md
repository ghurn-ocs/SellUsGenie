# StreamSell Supabase Setup Guide

## 🎯 **Overview**

This guide walks you through setting up your Supabase instance for the StreamSell eCommerce platform, including database schema, OAuth providers, and application configuration.

## 📋 **Prerequisites**

- ✅ Supabase project created: `jizobmpcyrzprrwsyedv`
- ✅ Apple Developer Account: `glenn@omnicybersolutions.com`
- ✅ Google Cloud Console access

## 🔧 **Step 1: Database Schema Setup**

### **Execute Database Schema**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `jizobmpcyrzprrwsyedv`
3. **Navigate to SQL Editor** (left sidebar)
4. **Copy the entire content** from `database/setup-database.sql`
5. **Paste into SQL Editor** and click **"Run"**

### **Verify Schema Creation**

After running the script, you should see:
- ✅ 12 tables created
- ✅ Row Level Security (RLS) enabled
- ✅ All indexes created
- ✅ Triggers and functions created

## 🔧 **Step 2: Google OAuth Configuration**

### **Google Cloud Console Setup**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable APIs**:
   - Go to **APIs & Services** → **Library**
   - Search for and enable **"Google+ API"** or **"Google Identity API"**

### **Create OAuth Credentials**

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. **Configure OAuth consent screen**:
   - User Type: External
   - App name: StreamSell
   - User support email: `glenn@omnicybersolutions.com`
   - Developer contact information: `glenn@omnicybersolutions.com`

4. **Create OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: **StreamSell Web Client**
   - Authorized redirect URIs: 
     ```
     https://jizobmpcyrzprrwsyedv.supabase.co/auth/v1/callback
     ```

5. **Copy credentials**:
   - Client ID: `your_google_client_id`
   - Client Secret: `your_google_client_secret`

## 🔧 **Step 3: Apple OAuth Configuration**

### **Apple Developer Console Setup**

1. **Go to Apple Developer Console**: https://developer.apple.com/account/
2. **Sign in with**: `glenn@omnicybersolutions.com`
3. **Team ID**: `BLF9VXW3XC` (Omni Cyber Solutions LLC)

### **Create App ID**

1. **Go to Certificates, Identifiers & Profiles**
2. **Click "Identifiers"** → **"+"** → **"App IDs"**
3. **Configure App ID**:
   - Description: **StreamSell**
   - Bundle ID: `com.omnicybersolutions.streamsell`
   - **Enable "Sign In with Apple"**
   - Click **"Continue"** and **"Register"**

### **Create Services ID**

1. **Click "Identifiers"** → **"+"** → **"Services IDs"**
2. **Configure Services ID**:
   - Description: **StreamSell Web**
   - Identifier: `com.omnicybersolutions.streamsell.web`
   - **Enable "Sign In with Apple"**
   - **Configure Domains and Subdomains**:
     - Domain: `jizobmpcyrzprrwsyedv.supabase.co`
   - **Configure Return URLs**:
     ```
     https://jizobmpcyrzprrwsyedv.supabase.co/auth/v1/callback
     ```
   - Click **"Continue"** and **"Register"**

### **Create Private Key**

1. **Go to "Keys"** → **"+"** → **"Keys"**
2. **Configure Key**:
   - Key Name: **StreamSell Sign In with Apple**
   - **Enable "Sign In with Apple"**
   - Click **"Configure"** and select your Services ID
   - Click **"Continue"** and **"Register"**
3. **Download the key file** (`.p8` format)
4. **Note the Key ID** (displayed after creation)

### **Apple Configuration Summary**

- **Team ID**: `BLF9VXW3XC`
- **Services ID**: `com.omnicybersolutions.streamsell.web`
- **Key ID**: `your_key_id`
- **Private Key**: Downloaded `.p8` file content

## 🔧 **Step 4: Configure Supabase Authentication**

### **Configure OAuth Providers**

1. **Go to Supabase Dashboard** → **Authentication** → **Providers**

### **Google Provider**

1. **Enable Google provider**
2. **Configure settings**:
   - **Client ID**: `your_google_client_id`
   - **Client Secret**: `your_google_client_secret`
   - **Redirect URL**: `https://jizobmpcyrzprrwsyedv.supabase.co/auth/v1/callback`

### **Apple Provider**

1. **Enable Apple provider**
2. **Configure settings**:
   - **Services ID**: `com.omnicybersolutions.streamsell.web`
   - **Team ID**: `BLF9VXW3XC`
   - **Key ID**: `your_key_id`
   - **Private Key**: Content of your `.p8` file
   - **Redirect URL**: `https://jizobmpcyrzprrwsyedv.supabase.co/auth/v1/callback`

## 🔧 **Step 5: Environment Configuration**

### **Create .env File**

Create a `.env` file in your project root with the following content:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://jizobmpcyrzprrwsyedv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem9ibXBjeXJ6cHJyd3N5ZWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDUwMTIsImV4cCI6MjA3MDgyMTAxMn0.djDUoarBdbRZQ2oBCNMxjCR8wC160g5AC6W9T_z6Igc

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_TRIAL_DAYS=14

# OAuth Configuration (replace with your actual values)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=com.omnicybersolutions.streamsell.web

# Stripe Configuration (for future payment integration)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### **Update Application Configuration**

The application is already configured to use these environment variables. The Supabase client will automatically use the credentials from your `.env` file.

## 🔧 **Step 6: Test the Setup**

### **Run the Application**

```bash
npm run dev
```

### **Test OAuth Flow**

1. **Go to**: `http://localhost:5173`
2. **Click "Sign up with Google"** or **"Sign up with Apple"**
3. **Complete the OAuth flow**
4. **Verify user creation** in Supabase Dashboard → **Authentication** → **Users**

### **Verify Database Integration**

1. **Check Supabase Dashboard** → **Table Editor**
2. **Verify tables created**:
   - `store_owners`
   - `stores`
   - `products`
   - `customers`
   - `orders`
   - etc.

## 🔧 **Step 7: Security Configuration**

### **Row Level Security (RLS)**

The database schema includes comprehensive RLS policies that ensure:
- ✅ Store owners can only access their own data
- ✅ Customers can only access their own data
- ✅ Public access is limited to active stores and products
- ✅ Multi-tenant data isolation

### **Authentication Policies**

- ✅ OAuth providers configured with proper redirect URLs
- ✅ Secure token handling
- ✅ Automatic user provisioning

## 🔧 **Step 8: Production Deployment**

### **Update Environment Variables**

For production deployment, update the following:

1. **VITE_APP_URL**: Your production domain
2. **Redirect URLs**: Update OAuth provider redirect URLs
3. **Domain verification**: Verify domains in Apple Developer Console

### **SSL Configuration**

Ensure your production domain has SSL certificates for secure OAuth flows.

## 🚨 **Troubleshooting**

### **Common Issues**

#### **OAuth Redirect Errors**
- Verify redirect URLs match exactly
- Check domain verification in Apple Developer Console
- Ensure HTTPS is used in production

#### **Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure proper permissions

#### **Authentication Failures**
- Verify OAuth provider configuration
- Check client IDs and secrets
- Ensure proper callback URLs

### **Debug Steps**

1. **Check browser console** for errors
2. **Verify Supabase logs** in Dashboard
3. **Test OAuth flow** step by step
4. **Check environment variables** are loaded correctly

## 📞 **Support**

If you encounter issues:

1. **Check Supabase documentation**: https://supabase.com/docs
2. **Verify OAuth provider documentation**
3. **Review application logs** for specific error messages
4. **Test with minimal configuration** first

## ✅ **Verification Checklist**

- [ ] Database schema executed successfully
- [ ] Google OAuth configured and tested
- [ ] Apple OAuth configured and tested
- [ ] Environment variables set correctly
- [ ] Application starts without errors
- [ ] OAuth flow completes successfully
- [ ] User data created in database
- [ ] RLS policies working correctly
- [ ] Multi-tenant isolation verified

---

## **Next Steps**

Once the setup is complete:

1. **Test the complete user flow**
2. **Create sample stores and products**
3. **Test multi-tenant functionality**
4. **Configure payment integration** (Stripe)
5. **Set up monitoring and analytics**
6. **Deploy to production**

The StreamSell platform is now ready for development and testing!
