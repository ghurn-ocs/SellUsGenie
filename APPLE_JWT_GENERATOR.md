# Apple OAuth JWT Key Generator for Supabase

## 🚨 **Issue: Supabase Expects JWT Key, Not Raw Private Key**

Supabase requires a JWT key for Apple OAuth, not the raw `.p8` private key content. Here's how to generate the correct JWT key.

## 🔧 **Method 1: Use Supabase's Built-in JWT Generator**

### **Step 1: Access Supabase JWT Generator**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jizobmpcyrzprrwsyedv`
3. Navigate to **Authentication** → **Providers**
4. Find **Apple** and click **Edit**
5. Look for a **"Generate JWT"** or **"Create JWT Key"** button

### **Step 2: Use the JWT Generator**
If Supabase has a built-in JWT generator:
1. Click **"Generate JWT"** or **"Create JWT Key"**
2. Enter your Apple credentials:
   - **Team ID**: `BLF9VXW3XC`
   - **Key ID**: `659C8SPQA7`
   - **Private Key**: [Your .p8 file content]
3. Click **Generate**
4. Copy the generated JWT key to the **JWT Secret Key** field

## 🔧 **Method 2: Manual JWT Generation (if needed)**

If Supabase doesn't have a built-in generator, you can use this Node.js script:

### **Step 1: Create JWT Generator Script**
Create a file called `generate-apple-jwt.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Your Apple credentials
const teamId = 'BLF9VXW3XC';
const keyId = '659C8SPQA7';
const clientId = 'com.sellmegenie.web.auth';

// Read your private key file
const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg1Ad2qIMa8ivSZM36
Cc0+EqxSaNBiuJWz682736NAwaOgCgYIKoZIzj0DAQehRANCAAQuKNkHEBbfYcn5
WEmokId5dUo7EiaApkKgbWNyATJ1uNcnTuZaq0nB8ycUMlmk6u502uAPZrsDS2fL
uSb9x95B
-----END PRIVATE KEY-----`;

// Create JWT payload
const payload = {
  iss: teamId,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60), // 6 months
  aud: 'https://appleid.apple.com',
  sub: clientId
};

// Sign the JWT
const token = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  keyid: keyId
});

console.log('Generated JWT Key:');
console.log(token);
```

### **Step 2: Install Dependencies and Run**
```bash
npm install jsonwebtoken
node generate-apple-jwt.js
```

## 🔧 **Method 3: Online JWT Generator (Alternative)**

You can also use online JWT generators:

1. Go to [jwt.io](https://jwt.io/)
2. Use the debugger to create a JWT with:
   - **Header**: 
     ```json
     {
       "alg": "ES256",
       "kid": "659C8SPQA7"
     }
     ```
   - **Payload**:
     ```json
     {
       "iss": "BLF9VXW3XC",
       "iat": [current_timestamp],
       "exp": [current_timestamp + 6_months],
       "aud": "https://appleid.apple.com",
       "sub": "com.sellmegenie.web.auth"
     }
     ```
   - **Private Key**: Your .p8 file content

## ✅ **Final Supabase Configuration**

Once you have the JWT key:

1. **Go to Supabase Dashboard** → **Authentication** → **Providers**
2. **Find Apple** and click **Edit**
3. **Fill in the configuration:**
   - ✅ **Enable Apple Provider**: Check this box
   - ✅ **Client ID**: `com.sellmegenie.web.auth`
   - ✅ **Team ID**: `BLF9VXW3XC`
   - ✅ **Key ID**: `659C8SPQA7`
   - ✅ **JWT Secret Key**: [The generated JWT key]
4. **Click Save**

## 🚨 **Important Notes**

- The JWT key is different from the raw private key
- JWT keys are time-limited (typically 6 months)
- You may need to regenerate the JWT key periodically
- Keep your original .p8 file secure - it's used to generate new JWT keys

## 🆘 **Troubleshooting**

If you're still having issues:
1. Check if Supabase has updated their Apple OAuth implementation
2. Contact Supabase support for the latest Apple OAuth configuration
3. Consider using the Supabase CLI for configuration

