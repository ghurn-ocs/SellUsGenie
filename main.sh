#!/bin/bash

# SellUsGenie Replit Startup Script
echo "🧞‍♂️ Starting SellUsGenie..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build:quick

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo "🚀 Starting server on port 3000..."
  
  # Serve the built files
  npx serve -s dist -p 3000
else
  echo "❌ Build failed!"
  exit 1
fi