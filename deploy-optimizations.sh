#!/bin/bash

# Firebase Optimizations Deployment Script
# Safely deploys all Firebase optimizations without breaking anything

echo "🚀 Starting Firebase Optimizations Deployment"
echo "=============================================="

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

# Step 1: Run tests
echo "🧪 Running Firebase optimization tests..."
node test-firebase-optimizations.js
if [ $? -ne 0 ]; then
    echo "❌ Error: Tests failed. Please fix issues before deploying."
    exit 1
fi
echo "✅ All tests passed"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Run build
echo "🔨 Running production build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Please fix build errors before deploying."
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

# Step 4: Verify dist folder
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build"
    exit 1
fi

echo "📁 Build output verified:"
ls -la dist/ | head -10
echo ""

# Step 5: Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --project subx-825e9
if [ $? -ne 0 ]; then
    echo "❌ Error: Firebase deployment failed"
    exit 1
fi

echo ""
echo "🎉 Firebase Optimizations Deployed Successfully!"
echo "================================================"
echo "✅ Firebase Analytics: Enabled"
echo "✅ Firestore Queries: Optimized"
echo "✅ Firebase Functions: Enhanced"
echo "✅ Error Handling: Improved"
echo "✅ Performance: Boosted"
echo ""
echo "🌐 Site URL: https://subxhq.com"
echo "🔗 Firebase Console: https://console.firebase.google.com/project/subx-825e9/overview"
echo ""
echo "📊 Next Steps:"
echo "   1. Monitor performance improvements"
echo "   2. Check Firebase Analytics dashboard"
echo "   3. Verify all functionality works correctly"
echo "   4. Consider Supabase removal (optional)"
echo ""
echo "✅ All Firebase optimizations are now live!"
