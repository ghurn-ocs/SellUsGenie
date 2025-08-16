#!/bin/bash

echo "Starting SellUsGenie..."

# Install dependencies
npm install

# Build the project
npm run build:quick

# Serve the built files
npx serve -s dist -p 3000