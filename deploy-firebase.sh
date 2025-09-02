#!/bin/bash

echo "🚀 Deploying Firebase configuration..."

# Deploy Firestore security rules
echo "📝 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firebase functions (if any)
echo "⚡ Deploying Firebase functions..."
firebase deploy --only functions

# Deploy Firebase hosting (if configured)
echo "🌐 Deploying Firebase hosting..."
firebase deploy --only hosting

echo "✅ Firebase deployment completed!"
echo "🔒 Security rules are now active"
echo "📊 Database is ready for production use"
