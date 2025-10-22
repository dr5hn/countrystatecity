#!/bin/bash

# Vite Integration Test Script
# Tests that @countrystatecity/countries works correctly in server-side Node.js environment
# (This is how it should be used with Vite - in SSR, API routes, or backends)

set -e

echo "==================================="
echo "Vite Integration Test"
echo "==================================="

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run the server-side test
echo ""
echo "🔨 Running server-side test..."
npm test

echo ""
echo "✅ Tests completed successfully!"
echo ""
echo "This demonstrates server-side usage with Vite."
echo "See docs/VITE_DEPLOYMENT.md for complete usage examples."
