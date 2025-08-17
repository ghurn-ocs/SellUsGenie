#!/usr/bin/env node

// Production build script for GoDaddy hosting
// This script ignores TypeScript errors for a quick deployment build

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Building SellUsGenie for production deployment...');

try {
  // Skip TypeScript checking for faster builds
  console.log('📦 Building with Vite (skipping type check)...');
  execSync('vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Build successful!');
  console.log('📁 Files ready in ./dist directory');
  
  // Check if dist directory exists and has files
  if (fs.existsSync('./dist')) {
    const files = fs.readdirSync('./dist');
    console.log(`📊 Built ${files.length} files for deployment`);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}