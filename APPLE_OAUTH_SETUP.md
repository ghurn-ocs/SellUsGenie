# Apple OAuth Setup Guide for Sell Us Genie

## 🎯 **Your Apple Developer Details**
- **Email**: glenn@omnicybersolutions.com
- **Organization**: Omni Cyber Solutions LLC
- **Team ID**: BLF9VXW3XC

## 📋 **Step-by-Step Apple OAuth Configuration**

### **Step 1: Access Apple Developer Console**
1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Sign in with: **glenn@omnicybersolutions.com**
3. Navigate to **Certificates, Identifiers & Profiles**

### **Step 2: Create App ID**
1. Click **Identifiers** in the left sidebar
2. Click the **+** button to create a new identifier
3. Select **App IDs** and click **Continue**
4. Select **App** and click **Continue**
5. Fill in the form:
   - **Description**: `Sell Us Genie Web Application`
   - **Bundle ID**: `com.sellusgenie.web`
   - **Capabilities**: Check **Sign In with Apple**
6. Click **Continue** and then **Register**

### **Step 3: Create Services ID**
1. In **Identifiers**, click the **+** button again
2. Select **Services IDs** and click **Continue**
3. Fill in the form:
   - **Description**: `Sell Us Genie Web Authentication`
   - **Identifier**: `com.sellusgenie.web.auth`
4. Click **Continue** and then **Register**

### **Step 4: Configure Sign In with Apple**
1. Click on the Services ID you just created: `com.sellusgenie.web.auth`
2. Check the box for **Sign In with Apple**
3. Click **Configure** next to Sign In with Apple
4. Fill in the configuration:
   - **Primary App ID**: Select `com.sellusgenie.web`
   - **Domains and Subdomains**: Add `sellusgenie.com`
   - **Return URLs**: Add `https://sellusgenie.com/auth/callback`
5. Click **Save** and then **Continue**

### **Step 5: Create Web Authentication Configuration**
1. In **Certificates, Identifiers & Profiles**, click **Keys** in the left sidebar
2. Click the **+** button to create a new key
3. Fill in the form:
   - **Key Name**: `Sell Us Genie Web Auth Key`
   - **Key Type**: Select **Sign in with Apple**
4. Click **Configure** next to Sign in with Apple
5. Select the **Primary App ID**: `com.sellusgenie.web`
6. Click **Save** and then **Continue**
7. Click **Register**
8. **IMPORTANT**: Download the key file (`.p8`) and note the **Key ID**

### **Step 6: Get Your Team ID**
- Your **Team ID** is: `BLF9VXW3XC`
- This is already visible in the top right of the Apple Developer Console

## 🔧 **Supabase Configuration**

### **Step 7: Configure Supabase Apple Provider**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jizobmpcyrzprrwsyedv`
3. Navigate to **Authentication** → **Providers**
4. Find **Apple** and click **Edit**
5. Fill in the configuration:
   - **Enable Apple Provider**: ✅ Check this box
   - **Client ID**: `com.sellusgenie.web.auth`
   - **Team ID**: `BLF9VXW3XC`
   - **Key ID**: `659C8SPQA7`
   - **JWT Secret Key**: [Content of the .p8 file from Step 5]
6. Click **Save**

## 📝 **Required Information Summary**

You'll need these values for Supabase configuration:

| Field | Value |
|-------|-------|
| **Client ID** | `com.sellusgenie.web.auth` |
| **Team ID** | `BLF9VXW3XC` |
| **Key ID** | `659C8SPQA7` |
| **JWT Secret Key** | [Content of the .p8 file downloaded in Step 5] |

## 🚨 **Important Notes**

1. **Keep the .p8 file secure** - it's your private key
2. **The Key ID is case-sensitive** - copy it exactly as shown
3. **The JWT Secret Key should include the entire content** of the .p8 file, including the header and footer
4. **Domains must match exactly** - `sellusgenie.com`
5. **Return URL must be exact** - `https://sellusgenie.com/auth/callback`

## ✅ **Verification Steps**

After configuration:
1. Test the Apple Sign In button in your Sell Us Genie application
2. Verify the redirect works properly
3. Check that user accounts are created in Supabase
4. Confirm the authentication flow completes successfully

## 🆘 **Troubleshooting**

- **"Invalid client" error**: Double-check the Client ID spelling
- **"Invalid redirect URI"**: Verify the return URL in Apple Developer Console
- **"Invalid team ID"**: Ensure Team ID is correct: `BLF9VXW3XC`
- **"Invalid key"**: Make sure the entire .p8 file content is copied to the JWT Secret Key field in Supabase
