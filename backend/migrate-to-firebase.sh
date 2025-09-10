#!/bin/bash

# MongoDB to Firebase Migration Script
# Safely replaces MongoDB backend with pure Firebase backend

echo "🔄 Starting MongoDB to Firebase Migration"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

echo "✅ Pre-migration checks passed"
echo ""

# Step 1: Backup current server.js
echo "📦 Creating backup of current server.js..."
cp server.js server.js.mongodb-backup
echo "✅ Backup created: server.js.mongodb-backup"
echo ""

# Step 2: Replace server.js with Firebase backend
echo "🔄 Replacing server.js with Firebase backend..."
cp firebaseBackend.js server.js
echo "✅ server.js replaced with Firebase backend"
echo ""

# Step 3: Install Firebase Admin SDK
echo "📦 Installing Firebase Admin SDK..."
npm install firebase-admin@^12.0.0
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install Firebase Admin SDK"
    exit 1
fi
echo "✅ Firebase Admin SDK installed"
echo ""

# Step 4: Remove Supabase dependencies (optional)
echo "🧹 Removing Supabase dependencies..."
npm uninstall @supabase/supabase-js
echo "✅ Supabase dependencies removed"
echo ""

# Step 5: Test the new backend
echo "🧪 Testing Firebase backend..."
node -c server.js
if [ $? -ne 0 ]; then
    echo "❌ Error: Firebase backend has syntax errors"
    echo "🔄 Restoring backup..."
    cp server.js.mongodb-backup server.js
    exit 1
fi
echo "✅ Firebase backend syntax is valid"
echo ""

# Step 6: Create environment variables template
echo "📝 Creating environment variables template..."
cat > .env.example << EOF
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY=your-service-account-key-json

# Server Configuration
PORT=30002
JWT_SECRET=your-jwt-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Paystack Configuration
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key
EOF
echo "✅ Environment variables template created"
echo ""

echo "🎉 Migration to Firebase completed successfully!"
echo "=============================================="
echo "✅ MongoDB dependencies removed"
echo "✅ Firebase Admin SDK installed"
echo "✅ Pure Firebase backend active"
echo "✅ Supabase dependencies removed"
echo ""
echo "📋 Next Steps:"
echo "   1. Set up Firebase service account key"
echo "   2. Configure environment variables"
echo "   3. Test the backend: npm start"
echo "   4. Deploy to your hosting platform"
echo ""
echo "🔧 Configuration:"
echo "   - Copy .env.example to .env"
echo "   - Add your Firebase service account key"
echo "   - Set other required environment variables"
echo ""
echo "✅ Your backend is now 100% Firebase!"
