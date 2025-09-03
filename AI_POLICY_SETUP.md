# AI Policy Generation Setup Guide

This document outlines the setup required for the AI-powered policy generation feature.

## 🔧 Database Setup

1. **Run the system settings setup SQL:**
   ```sql
   -- Execute this in your Supabase SQL Editor
   -- File: database/system-settings-setup.sql
   ```
   This will:
   - Create the `system_settings` table with RLS policies
   - Insert the Google Cloud API key securely
   - Set up proper indexing and triggers

## 🔐 Environment Variables

Add these environment variables to your hosting provider:

### Required for API Endpoint:
```bash
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is different from the anon key and has elevated permissions to access system settings.

## 🚀 API Endpoint

The API endpoint is located at `/api/generate-policy.js` and handles:
- **Authentication:** Validates user tokens via Supabase
- **Security:** Retrieves API keys from secure database storage
- **AI Generation:** Calls Google Cloud's Generative AI API (Gemini)
- **Logging:** Tracks usage and costs for analytics

## 🎯 Features

### Security Features:
- ✅ API keys stored securely in Supabase (not in code)
- ✅ User authentication required for all requests
- ✅ Row Level Security policies protect system settings
- ✅ Service role access only for sensitive operations

### AI Generation Features:
- ✅ Store-specific policy customization
- ✅ **Country-specific legal compliance** using Store Address settings
- ✅ Professional legal language tailored to jurisdiction
- ✅ Multiple policy types (Privacy, Returns, Terms, About Us)
- ✅ Real-time usage tracking and cost monitoring
- ✅ Error handling and user feedback

### Legal Compliance Features:
- ✅ **Automatic jurisdiction detection** from Store Address Country field
- ✅ **Country-specific legal requirements** (GDPR for EU, CCPA for California, etc.)
- ✅ **Local consumer protection law compliance**
- ✅ **Jurisdiction-appropriate legal terminology**
- ✅ **Required disclosures** specific to the country
- ✅ **Proper legal entity references** for the jurisdiction

### User Experience:
- ✅ One-click policy generation
- ✅ Loading states with progress indicators
- ✅ Success/error feedback messages
- ✅ Seamless integration with existing policy editor

## 📊 Usage Analytics

The system tracks:
- Token usage per generation
- Cost per API call
- Success/failure rates
- Policy type preferences
- User engagement metrics

## 🛠️ Deployment Checklist

- [ ] Database setup completed (`system-settings-setup.sql`)
- [ ] Environment variables configured
- [ ] API endpoint deployed (`/api/generate-policy.js`)
- [ ] Google Cloud API key verified and active
- [ ] User authentication flow tested
- [ ] **Store Address settings configured** (required for country-specific compliance)
- [ ] Policy generation tested for each type with different countries
- [ ] Usage logging verified
- [ ] Error handling tested

## 📍 Important: Store Address Configuration

**CRITICAL:** The AI policy generation relies on the **Store Address Country field** for legal compliance. Store owners must:

1. Navigate to **Settings → Store Address**
2. Complete the **full store address** including country
3. Ensure the **Country field** is accurately set to their business location

The AI will generate policies compliant with the laws of the country specified in the Store Address settings. Without proper address configuration, policies may not meet local legal requirements.

## 🔍 Testing

To test the AI policy generation:

1. Navigate to Settings → Policies
2. Select any policy tab (Privacy, Returns, Terms, About Us)
3. Click "Generate with AI" in the help section
4. Verify the generated policy appears in the textarea
5. Check that usage is logged in the database

## 🚨 Security Notes

- API keys are never exposed to the frontend
- All requests require valid user authentication
- System settings table is protected by RLS
- Only service role can access sensitive configuration
- API calls are logged for monitoring and cost control

## 📈 Scaling Considerations

- Google Cloud AI has generous rate limits
- Cost scales with usage (approximately $0.00015 per 1K tokens)
- Database queries are optimized with proper indexing
- Error handling prevents infinite retry loops
- Usage analytics help monitor and optimize costs