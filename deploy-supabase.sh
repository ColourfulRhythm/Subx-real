#!/bin/bash

echo "🚀 Starting Supabase Migration Deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Set Supabase project URL
SUPABASE_URL="https://hclguhbswctxfahhzrrr.supabase.co"
echo "📍 Using Supabase project: $SUPABASE_URL"

# Deploy database schema
echo "🗄️ Deploying database schema..."
supabase db push --file supabase/migrations/0001_supabase_core_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema deployed successfully"
else
    echo "❌ Failed to deploy database schema"
    exit 1
fi

# Deploy Edge Functions
echo "🔧 Deploying Edge Functions..."

echo "Deploying create_user_profile..."
supabase functions deploy create_user_profile

echo "Deploying purchase-init..."
supabase functions deploy purchase-init

echo "Deploying payment-webhook..."
supabase functions deploy payment-webhook

echo "Deploying generate_deed..."
supabase functions deploy generate_deed

echo "✅ All Edge Functions deployed"

# Create storage bucket for documents
echo "📁 Creating storage bucket..."
supabase storage create documents

# Set storage policies
echo "🔒 Setting storage policies..."
supabase db push --file supabase/storage-policies.sql

echo "🎉 Supabase deployment completed!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Supabase Dashboard > Settings > Edge Functions:"
echo "   - SUPABASE_URL: $SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY: [your_service_role_key]"
echo "   - PAYSTACK_SECRET_KEY: [your_paystack_secret_key]"
echo ""
echo "2. Update your backend environment variables"
echo "3. Deploy the new Supabase backend"
echo "4. Test the application"
echo ""
echo "For detailed instructions, see SUPABASE_DEPLOYMENT_GUIDE.md"

