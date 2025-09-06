#!/usr/bin/env node

/**
 * Test script for Store Owner Stripe webhook configuration
 * This script tests the webhook URL generation and configuration
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Testing Store Owner Stripe Webhook Configuration');
console.log('================================================');

// Test environment variable detection
console.log('\n📋 Environment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VITE_APP_URL:', process.env.VITE_APP_URL || 'not set');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'not set');
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'not set');

// Simulate the webhook URL generation logic
function getWebhookBaseUrl(mockHeaders = {}) {
    let baseUrl;
    
    if (process.env.NODE_ENV === 'production') {
        // Production: Use fixed production domain
        baseUrl = process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://app.sellusgenie.com';
    } else if (process.env.VERCEL_URL) {
        // Development on Vercel
        baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
        // Local development
        baseUrl = mockHeaders.origin || 'http://localhost:5173';
    }
    
    return baseUrl;
}

// Test different scenarios
console.log('\n🔗 Webhook URL Generation Tests:');

// Test 1: Local development
console.log('\n1. Local Development:');
const localUrl = getWebhookBaseUrl({ origin: 'http://localhost:5173' });
console.log('   Base URL:', localUrl);
console.log('   Webhook URL:', `${localUrl}/api/stripe/storefront-webhook?storeId=test-store-123`);

// Test 2: Production
console.log('\n2. Production (simulated):');
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
const prodUrl = getWebhookBaseUrl();
console.log('   Base URL:', prodUrl);
console.log('   Webhook URL:', `${prodUrl}/api/stripe/storefront-webhook?storeId=test-store-123`);
process.env.NODE_ENV = originalNodeEnv;

// Test 3: Vercel deployment
console.log('\n3. Vercel Deployment (simulated):');
const originalVercelUrl = process.env.VERCEL_URL;
process.env.VERCEL_URL = 'sellusgenie-git-main-user123.vercel.app';
const vercelUrl = getWebhookBaseUrl();
console.log('   Base URL:', vercelUrl);
console.log('   Webhook URL:', `${vercelUrl}/api/stripe/storefront-webhook?storeId=test-store-123`);
process.env.VERCEL_URL = originalVercelUrl;

console.log('\n✅ Webhook URL generation test completed!');
console.log('\n📝 Notes:');
console.log('- For production deployment, ensure VITE_APP_URL is set to your production domain');
console.log('- Each store owner gets a unique webhook URL with their storeId');
console.log('- Webhooks are created in the store owner\'s Stripe account, not the main SellUsGenie account');
console.log('- The storefront-webhook.js handler processes payments for individual stores');