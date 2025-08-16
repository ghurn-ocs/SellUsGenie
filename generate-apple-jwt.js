import jwt from 'jsonwebtoken';

// Your Apple credentials
const teamId = 'BLF9VXW3XC';
const keyId = '659C8SPQA7';
const clientId = 'com.sellusgenie.web.auth';

// Your private key (from the .p8 file)
const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQggS/arwhKrTEhD7tq
mgOEOTpNzlCLma+MI1zQh3RYutmgCgYIKoZIzj0DAQehRANCAARJ3c99+oQhQfI7
j3oYUxzlwEfhtAagCmB0yvEydiqEPAzcs+wKfHb5hiE946lUMF7J/KBqNcq6oBVo
vX/ozHXg
-----END PRIVATE KEY-----`;

// Create JWT payload
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: teamId,
  iat: now,
  exp: now + (6 * 30 * 24 * 60 * 60), // 6 months from now
  aud: 'https://appleid.apple.com',
  sub: clientId
};

try {
  // Sign the JWT
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    keyid: keyId
  });

  console.log('✅ Generated JWT Key for Supabase Apple OAuth:');
  console.log('='.repeat(60));
  console.log(token);
  console.log('='.repeat(60));
  console.log('\n📋 Copy this JWT key to the "JWT Secret Key" field in Supabase');
  console.log('\n🔧 Supabase Configuration:');
  console.log('   - Client ID: com.sellusgenie.web.auth');
  console.log('   - Team ID: BLF9VXW3XC');
  console.log('   - Key ID: 659C8SPQA7');
  console.log('   - JWT Secret Key: [The token above]');
  
} catch (error) {
  console.error('❌ Error generating JWT:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure you have installed jsonwebtoken: npm install jsonwebtoken');
  console.log('2. Verify your private key is correct');
  console.log('3. Check that all credentials are properly formatted');
}
