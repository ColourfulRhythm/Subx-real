# 🚀 Supabase Deployment Guide

## Overview
This guide will help you deploy the entire Subx application to Supabase, including the database, backend API, and frontend.

## Prerequisites
- Supabase account
- Supabase CLI installed
- Vercel account (for frontend)

## Step 1: Deploy Database Schema

### 1.1 Run the Referral System Schema
```sql
-- Copy and paste the contents of referral_system_schema.sql into Supabase SQL Editor
-- This creates all tables, functions, and views for the referral system
```

### 1.2 Fix the Database Function
```sql
-- Run the fix_referral_stats_function.sql to resolve the nested aggregate error
DROP FUNCTION IF EXISTS get_user_referral_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
  v_referral_code VARCHAR(12);
  v_wallet_balance DECIMAL(12,2);
  v_total_referrals INTEGER;
  v_total_earned DECIMAL(12,2);
BEGIN
  -- Get basic user info
  SELECT 
    up.referral_code,
    up.wallet_balance
  INTO v_referral_code, v_wallet_balance
  FROM user_profiles up
  WHERE up.id = p_user_id;
  
  -- Get referral counts and earnings
  SELECT 
    COUNT(rr.id),
    COALESCE(SUM(rr.amount), 0)
  INTO v_total_referrals, v_total_earned
  FROM referral_rewards rr
  WHERE rr.referrer_id = p_user_id 
  AND rr.status = 'paid';
  
  -- Build the final stats object
  v_stats := jsonb_build_object(
    'referral_code', COALESCE(v_referral_code, ''),
    'total_referrals', COALESCE(v_total_referrals, 0),
    'total_earned', COALESCE(v_total_earned, 0),
    'wallet_balance', COALESCE(v_wallet_balance, 0),
    'referred_users', '[]'::jsonb
  );
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;
```

## Step 2: Deploy Supabase Edge Functions

### 2.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 2.2 Login to Supabase
```bash
supabase login
```

### 2.3 Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.4 Deploy Edge Functions
```bash
# Deploy referral-stats function
supabase functions deploy referral-stats

# Deploy referral-leaderboard function
supabase functions deploy referral-leaderboard
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Environment Variables
Create a `.env.production` file:
```env
VITE_SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SITE_URL=https://your-domain.vercel.app
```

### 3.2 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Step 4: Configure Supabase Settings

### 4.1 Update Site URL
1. Go to Supabase Dashboard
2. Navigate to Authentication → Settings
3. Update Site URL to your Vercel domain
4. Add redirect URLs for your domain

### 4.2 Configure RLS Policies
Ensure Row Level Security is properly configured for all tables.

## Step 5: Test the Deployment

### 5.1 Test Database Functions
```sql
-- Test referral stats function
SELECT get_user_referral_stats('user-uuid-here');

-- Test leaderboard function
SELECT * FROM get_referral_leaderboard(10);
```

### 5.2 Test Edge Functions
```bash
# Test referral-stats function
curl -X POST 'https://your-project.supabase.co/functions/v1/referral-stats' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'

# Test referral-leaderboard function
curl 'https://your-project.supabase.co/functions/v1/referral-leaderboard?limit=10'
```

### 5.3 Test Frontend
1. Visit your Vercel deployment
2. Sign up/sign in
3. Navigate to Invite & Earn
4. Test referral code generation and sharing

## Step 6: Monitor and Maintain

### 6.1 Monitor Function Logs
```bash
# View function logs
supabase functions logs referral-stats
supabase functions logs referral-leaderboard
```

### 6.2 Database Monitoring
- Monitor query performance in Supabase Dashboard
- Check for any RLS policy issues
- Monitor authentication logs

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure Edge Functions have proper CORS headers
2. **Authentication Errors**: Check JWT token and RLS policies
3. **Function Timeouts**: Optimize database queries
4. **Database Errors**: Check function syntax and permissions

### Debug Commands:
```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs

# Test function locally
supabase functions serve
```

## Production Checklist

- [ ] Database schema deployed
- [ ] Edge functions deployed
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Authentication settings updated
- [ ] RLS policies configured
- [ ] Referral system tested
- [ ] Mobile responsiveness verified
- [ ] Share functionality working
- [ ] Error handling implemented

## Support

If you encounter issues:
1. Check Supabase function logs
2. Verify database permissions
3. Test functions locally first
4. Check Vercel deployment logs

---

**Your Subx application is now fully deployed on Supabase!** 🎉
