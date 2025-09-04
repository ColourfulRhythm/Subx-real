#!/bin/bash

# Subx Deployment Script
# This script enforces npm run build before deployment

echo "🚀 Starting Subx deployment process..."
echo "📍 Site URL: https://subxhq.com"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Pre-deployment checks passed"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Run build (MANDATORY)
echo "🔨 Running production build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Please fix build errors before deploying."
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

# Step 3: Verify dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build"
    exit 1
fi

echo "📁 Build output verified:"
ls -la dist/ | head -10
echo ""

# Step 4: Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --project subx-825e9
if [ $? -ne 0 ]; then
    echo "❌ Error: Firebase deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Site URL: https://subxhq.com"
echo "🔗 Firebase Console: https://console.firebase.google.com/project/subx-825e9/overview"
echo ""
echo "✅ All systems operational!"
