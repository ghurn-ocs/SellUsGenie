#!/bin/bash

echo "🧞‍♂️ Building SellUsGenie for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building production assets..."
npm run build:quick

# Verify build
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "✅ Production build completed successfully!"
  echo "📁 Static files ready in dist/ directory"
  ls -la dist/
else
  echo "❌ Build failed - dist directory not found"
  exit 1
fi