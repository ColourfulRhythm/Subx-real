#!/bin/bash

echo "🚀 Deploying Subx Backend to Railway..."

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Your backend is now live on Railway!"
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Railway dashboard"
echo "   2. Update the frontend API URL"
echo "   3. Deploy the updated frontend" 