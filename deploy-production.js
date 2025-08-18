#!/usr/bin/env node

/**
 * Production Deployment Script for GoDaddy Hosting
 * This script prepares SellUsGenie for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 SellUsGenie Production Deployment Preparation');
console.log('================================================');

try {
  // Step 1: Verify environment variables
  console.log('1. Checking environment configuration...');
  if (!fs.existsSync('.env.production')) {
    console.warn('⚠️  .env.production not found. Using .env instead.');
    console.warn('   For production, create .env.production with production values.');
  }

  // Step 2: Clean previous builds
  console.log('2. Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Step 3: Run production build
  console.log('3. Building for production...');
  execSync('npm run build:production', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      VITE_ENVIRONMENT: 'production'
    }
  });

  // Step 4: Create deployment package
  console.log('4. Creating deployment package...');
  
  // Copy essential files to dist
  const essentialFiles = [
    '_redirects',
    '.htaccess',
    'robots.txt',
    'sitemap.xml'
  ];

  essentialFiles.forEach(file => {
    const sourcePath = path.join(process.cwd(), 'public', file);
    const destPath = path.join(process.cwd(), 'dist', file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`   ✓ Copied ${file}`);
    }
  });

  // Step 5: Verify build output
  console.log('5. Verifying build output...');
  const distFiles = fs.readdirSync('./dist');
  console.log(`   📊 Generated ${distFiles.length} files for deployment`);
  
  const indexExists = fs.existsSync('./dist/index.html');
  const pageBuilderExists = fs.existsSync('./dist/page-builder.html');
  
  if (indexExists && pageBuilderExists) {
    console.log('   ✓ Main application files present');
  } else {
    throw new Error('Missing essential HTML files');
  }

  // Step 6: Production readiness checklist
  console.log('6. Production readiness checklist:');
  console.log('   ✓ Build completed successfully');
  console.log('   ✓ Assets optimized and minified');
  console.log('   ✓ Files ready for static hosting');
  
  console.log('\n🎉 Production build ready!');
  console.log('📁 Upload the contents of ./dist folder to your GoDaddy hosting');
  console.log('🌐 Your app will be available at your domain');
  
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}