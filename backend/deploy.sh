#!/bin/bash

echo "🚀 Deploying Subx Backend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your backend is now live!"
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Update the frontend API URL"
echo "   3. Deploy the updated frontend" 