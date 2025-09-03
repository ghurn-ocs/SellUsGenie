#!/usr/bin/env node

/**
 * Script to recreate About Us page for glenn@omnicybersolutions.com
 * Run with: node scripts/recreate-about-page.js
 */

import { recreateAboutUsPageByEmail } from '../src/utils/recreateAboutUsPage.ts';

async function main() {
  const userEmail = 'glenn@omnicybersolutions.com';
  
  console.log('🚀 Starting About Us page recreation...');
  console.log(`📧 Target user: ${userEmail}`);
  
  try {
    const result = await recreateAboutUsPageByEmail(userEmail);
    
    if (result.success) {
      console.log('✅ SUCCESS:', result.message);
      if (result.pageId) {
        console.log('📄 New Page ID:', result.pageId);
      }
    } else {
      console.log('❌ FAILED:', result.message);
    }
    
  } catch (error) {
    console.error('💥 Script Error:', error);
  }
}

main().catch(console.error);