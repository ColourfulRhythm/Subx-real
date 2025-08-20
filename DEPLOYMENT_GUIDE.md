# 🚀 Subx Deployment Guide

## 📋 **Prerequisites Completed**
- ✅ Supabase CLI installed (v2.34.3)
- ✅ Vercel CLI installed (v46.0.2)
- ✅ Supabase login completed
- ✅ Frontend running locally

## 🔧 **Step 1: Fix Database Function (CRITICAL)**

**Run this SQL in your Supabase SQL Editor first:**

```sql
-- Fix the database function error
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

## 🌐 **Step 2: Deploy Edge Functions via Supabase Dashboard**

Since CLI linking failed due to database auth, deploy manually:

1. **Go to**: https://supabase.com/dashboard/project/hclguhbswctxfahhzrrr
2. **Navigate to**: Edge Functions
3. **Create Function**: `referral-stats`
   - Copy code from: `supabase/functions/referral-stats/index.ts`
4. **Create Function**: `referral-leaderboard`
   - Copy code from: `supabase/functions/referral-leaderboard/index.ts`

## 🚀 **Step 3: Deploy Frontend to Vercel**

```bash
# Deploy to Vercel
vercel --prod
```

## 🔑 **Step 4: Update Environment Variables**

After Vercel deployment, update these environment variables:

```env
VITE_SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key_here
```

## 🧪 **Step 5: Test Deployment**

1. **Test Referral System**: Navigate to Invite & Earn page
2. **Test Database Functions**: Verify referral stats load
3. **Test Edge Functions**: Check network requests

## 📱 **Current Status**
- ✅ Frontend: Running locally on port 5173
- ✅ Supabase CLI: Ready
- ✅ Vercel CLI: Ready
- ❌ Database Function: Needs fixing
- ❌ Edge Functions: Need deployment
- ❌ Frontend: Needs Vercel deployment

## 🎯 **Next Actions**
1. Fix database function in Supabase SQL Editor
2. Deploy Edge Functions via Dashboard
3. Deploy frontend to Vercel
4. Update environment variables
5. Test complete system
