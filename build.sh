#!/bin/bash

echo "🧞‍♂️ Building SellUsGenie for static deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for production
echo "🔨 Building production bundle..."
npm run build:quick

# Verify build
if [ -f "dist/index.html" ]; then
  echo "✅ Static build completed successfully!"
  echo "📁 Files ready for static hosting:"
  ls -la dist/
  
  # Check that assets exist
  if [ -d "dist/assets" ]; then
    echo "✅ Assets directory found"
    ls -la dist/assets/
  else
    echo "⚠️  No assets directory found"
  fi
  
else
  echo "❌ Build failed - index.html not found"
  exit 1
fi

echo "🚀 Ready for static deployment!"