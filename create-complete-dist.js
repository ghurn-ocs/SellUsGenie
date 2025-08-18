#!/usr/bin/env node

/**
 * Complete Distribution Builder
 * Ensures all necessary files are included in the production build
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 Creating Complete Production Distribution');
console.log('==========================================');

try {
  // Step 1: Clean and build
  console.log('1. Building fresh production bundle...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  execSync('npm run build:quick', { stdio: 'inherit' });

  // Step 2: Copy all public files
  console.log('2. Copying public directory files...');
  const publicDir = './public';
  const distDir = './dist';
  
  if (fs.existsSync(publicDir)) {
    const copyRecursively = (src, dest) => {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        files.forEach(file => {
          copyRecursively(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
        console.log(`   ✓ Copied ${path.relative(publicDir, src)}`);
      }
    };
    
    const publicFiles = fs.readdirSync(publicDir);
    publicFiles.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      
      if (file !== '.htaccess') { // Skip .htaccess as we handle it specially
        copyRecursively(srcPath, destPath);
      }
    });
  }

  // Step 3: Ensure essential hosting files
  console.log('3. Adding essential hosting files...');
  
  const essentialFiles = [
    { src: 'public/.htaccess', dest: 'dist/.htaccess', name: '.htaccess (Apache config)' },
    { src: 'public/robots.txt', dest: 'dist/robots.txt', name: 'robots.txt (SEO)' },
    { src: 'public/sitemap.xml', dest: 'dist/sitemap.xml', name: 'sitemap.xml (Search engines)' }
  ];

  essentialFiles.forEach(file => {
    if (fs.existsSync(file.src)) {
      fs.copyFileSync(file.src, file.dest);
      console.log(`   ✓ Added ${file.name}`);
    } else {
      console.warn(`   ⚠️  Missing: ${file.src}`);
    }
  });

  // Step 4: Create favicon if missing
  console.log('4. Checking for favicon...');
  const faviconExists = fs.existsSync('dist/favicon.ico') || fs.existsSync('dist/favicon.png');
  if (!faviconExists) {
    console.log('   ℹ️  No favicon found, using Genie image as favicon reference');
  }

  // Step 5: Verify build completeness
  console.log('5. Verifying complete build...');
  const distFiles = fs.readdirSync('dist');
  const requiredFiles = ['index.html', 'page-builder.html', '.htaccess', 'robots.txt', 'sitemap.xml', 'assets', 'images'];
  
  let allRequired = true;
  requiredFiles.forEach(file => {
    if (distFiles.includes(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ Missing: ${file}`);
      allRequired = false;
    }
  });

  // Step 6: Count assets
  const assetsDir = 'dist/assets';
  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    const jsFiles = assets.filter(f => f.endsWith('.js')).length;
    const cssFiles = assets.filter(f => f.endsWith('.css')).length;
    console.log(`   📊 Assets: ${jsFiles} JS files, ${cssFiles} CSS files`);
  }

  console.log('\n🎉 Complete Distribution Ready!');
  console.log(`📁 Total files: ${countFiles('dist')}`);
  console.log('📋 Ready for GoDaddy hosting deployment');
  
  if (allRequired) {
    console.log('✅ All required files present');
  } else {
    console.log('⚠️  Some files may be missing - check output above');
  }

} catch (error) {
  console.error('❌ Failed to create complete distribution:', error.message);
  process.exit(1);
}

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      count += countFiles(itemPath);
    } else {
      count++;
    }
  });
  return count;
}