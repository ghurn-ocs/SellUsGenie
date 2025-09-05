# Comprehensive API Keys Review - SellUsGenie Codebase

## 🔍 Summary
**All API keys are currently obtained from environment variables (`import.meta.env`) - NO keys are retrieved from Supabase database storage.**

---

## 📋 Current API Key Usage by Service

### 🔐 **Authentication Services**

#### **Google OAuth**
- **Current Source**: Supabase OAuth configuration (server-side)
- **Usage Pattern**: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- **Files**: 
  - `src/contexts/AuthContext.tsx:55` - Main OAuth implementation
  - Multiple components: LandingPage, FeaturesPage, CheckoutAuthSelection, Navigation
- **Key Location**: Configured in Supabase Dashboard OAuth settings, NOT in code
- **Environment Variable**: None used in code (handled by Supabase)

#### **Apple OAuth**  
- **Current Source**: Supabase OAuth configuration (server-side)
- **Usage Pattern**: `supabase.auth.signInWithOAuth({ provider: 'apple' })`
- **Files**: Same as Google OAuth
- **Key Location**: Configured in Supabase Dashboard OAuth settings, NOT in code
- **Environment Variable**: None used in code (handled by Supabase)

### 💰 **Payment Services**

#### **Stripe**
- **Current Source**: `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY`
- **Files**:
  - `src/lib/stripe.ts:4` - Main Stripe initialization
  - `src/types/subscription.ts:75,105,137` - Price ID references
  - Multiple store-level configurations in StripeSettings component
- **Environment Variables Used**:
  - `VITE_STRIPE_PUBLISHABLE_KEY` - Frontend client usage
  - `VITE_STRIPE_STARTER_PRICE_ID` - Subscription pricing
  - `VITE_STRIPE_PROFESSIONAL_PRICE_ID` - Subscription pricing  
  - `VITE_STRIPE_ENTERPRISE_PRICE_ID` - Subscription pricing
- **Database Storage**: Store-level Stripe keys stored in `stripe_configurations` table and `stores` table

### 🗺️ **Google Maps Services**

#### **Google Maps API**
- **Current Source**: `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`
- **Files**:
  - `src/lib/googleMaps.ts:1` - Export constant
  - `src/utils/googleMapsLoader.ts:72` - Main loader with fallback
  - `src/components/DeliveryAreaDisplay.tsx:38,47` - Direct usage
  - `src/hooks/useGoogleMapsConfig.ts:53` - Hook with database fallback (NEW)
- **Fallback Pattern**: Database → Environment (implemented in useGoogleMapsConfig)
- **Usage**: Delivery area mapping, store location features

### 🤖 **AI Services**

#### **Google AI/Gemini API**  
- **Current Source**: `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` (REUSING Maps key)
- **Files**:
  - `src/services/aiPolicyGenerator.ts:32` - Policy generation service
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`
- **Issue**: Currently reusing Google Maps API key for AI services (should be separate)

### 🔧 **Infrastructure Services**

#### **Supabase**
- **Current Source**: Environment variables
- **Files**:
  - `src/lib/supabase-client-manager.ts:14,15` - Client manager
  - `src/lib/supabase-public.ts:10,11` - Public client
  - Numerous script files
- **Environment Variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

---

## 📊 Key Sources Analysis

### **Environment Variables Only (32 files)**
- **Supabase**: 18+ files using `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Google Maps**: 4 files using `VITE_GOOGLE_MAPS_API_KEY`
- **Stripe**: 4 files using `VITE_STRIPE_PUBLISHABLE_KEY` and price IDs
- **Google AI**: 1 file reusing `VITE_GOOGLE_MAPS_API_KEY` (incorrect)

### **OAuth (Supabase Managed)**
- **Google & Apple**: Configured in Supabase Dashboard, no environment variables in code
- **Client IDs**: `VITE_GOOGLE_CLIENT_ID`, `VITE_APPLE_CLIENT_ID` in .env but NOT used in code

### **Database Storage (Partial)**
- **Store-level Stripe**: Some per-store Stripe configurations in database
- **System-level**: NO system API keys stored in database yet

---

## 🚨 Critical Findings

### **Missing System Key Storage**
1. **No system-level API keys** are stored in Supabase database
2. **All keys depend on environment variables** - security risk
3. **No database fallback** implemented (except new useGoogleMapsConfig)

### **Key Management Issues**
1. **Google AI reusing Maps key** - should be separate service
2. **OAuth Client IDs in .env but unused** - configured in Supabase instead
3. **Mixed patterns** - some store-level DB storage, no system-level

### **Security Concerns**
1. **Production keys in environment** - not database secured
2. **No key rotation capability** without redeployment
3. **No runtime key management** - all static configuration

---

## 🛠️ Recommended Migration Strategy

### **Phase 1: System Key Storage** 
```sql
-- Store SellUsGenie platform keys in database
INSERT INTO store_settings (store_id, setting_key, setting_value) VALUES
(NULL, 'system_google_maps_key', '{"key": "AIzaSyBwEqllmtwJEmjvYdazL9PX6yqlkfPEwSk"}'),
(NULL, 'system_google_ai_key', '{"key": "AIzaSy_SEPARATE_AI_KEY"}'),
(NULL, 'system_stripe_publishable_key', '{"key": "pk_live_..."}');
```

### **Phase 2: Code Updates**
```typescript
// Update all services to use database-first pattern
const useSystemKeys = () => {
  return useQuery({
    queryKey: ['system-keys'],
    queryFn: async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('setting_key, setting_value')
        .is('store_id', null)
      return data
    }
  })
}
```

### **Phase 3: Environment Fallback**
- Maintain environment variable fallback during migration
- Gradually migrate services to database-first approach
- Remove environment dependencies after verification

---

## 📁 Files Requiring Updates

### **High Priority (System Keys)**
- `src/lib/stripe.ts` - Stripe configuration
- `src/services/aiPolicyGenerator.ts` - Google AI service  
- `src/utils/googleMapsLoader.ts` - Maps service (partially done)

### **Medium Priority (OAuth)**
- OAuth already properly managed by Supabase
- No code changes needed for Google/Apple auth

### **Low Priority (Infrastructure)**
- Supabase keys should remain in environment (infrastructure level)
- Consider server-side key management for service role key

---

## ✅ Next Steps

1. **Run system key discovery** queries to confirm current database state
2. **Insert platform API keys** into `store_settings` with `store_id = NULL`
3. **Update services** to use database-first key retrieval pattern
4. **Test fallback behavior** to ensure no service interruption
5. **Remove environment dependencies** once database migration is verified

**Current Status**: All keys are environment-based. Database storage is ready but not implemented.