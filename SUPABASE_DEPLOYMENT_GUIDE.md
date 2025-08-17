# 🚀 Supabase Migration & Deployment Guide

## Overview
This guide covers the complete migration from Firebase to Supabase for the Subx application, including authentication, database, storage, and Edge Functions.

## 🗄️ Database Schema Deployment

### 1. Deploy Core Schema
```bash
# Navigate to Supabase project
cd supabase

# Deploy the core schema
supabase db push --file migrations/0001_supabase_core_schema.sql
```

### 2. Verify Schema
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'properties', 'ownership_units', 'transactions', 'documents', 'forum_topics', 'forum_replies');

-- Check existing data
SELECT * FROM public.properties;
SELECT * FROM public.users;
SELECT * FROM public.ownership_units;
```

## 🔧 Edge Functions Deployment

### 1. Deploy Functions
```bash
# Deploy all Edge Functions
supabase functions deploy create_user_profile
supabase functions deploy purchase-init
supabase functions deploy payment-webhook
supabase functions deploy generate_deed
```

### 2. Set Environment Variables
In Supabase Dashboard > Settings > Edge Functions:

```env
SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

## 🚀 Backend Deployment

### 1. Update Environment Variables
Create `.env` file in backend directory:

```env
SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PORT=5000
```

### 2. Deploy to Railway
```bash
cd backend
railway up
```

## 🌐 Frontend Deployment

### 1. Update Environment Variables
Create `.env` file in root directory:

```env
VITE_SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
```

### 2. Build and Deploy
```bash
npm run build
firebase deploy
```

## 📱 Mobile App Deployment

### 1. Install Dependencies
```bash
cd mobile-app-new
npm install
```

### 2. Test Locally
```bash
npm start
```

## 🔍 Testing Checklist

### Authentication
- [ ] User signup creates profile in `public.users`
- [ ] User login works with Supabase JWT
- [ ] Password reset functionality works

### Properties & Investments
- [ ] Properties list loads from Supabase
- [ ] Available sqm updates dynamically
- [ ] Investment creation works
- [ ] Payment verification works
- [ ] Ownership units created after payment

### Documents
- [ ] Receipt generation works
- [ ] Certificate generation works
- [ ] Document storage in Supabase Storage
- [ ] Signed URLs work correctly

### Forum
- [ ] Forum categories load
- [ ] Topics can be created
- [ ] Replies can be posted
- [ ] Real user data displayed

### Data Integrity
- [ ] Christopher Onuoha (7 sqm) shows in Plot 77
- [ ] Kingkwa Enang Oyama (35 sqm) shows in Plot 77
- [ ] Iwuozor Chika (7 sqm) shows in Plot 77
- [ ] Available spots counter works (10,000 - registered users)

## 🚨 Common Issues & Fixes

### 1. "User already exists" Error
- Check if user profile exists in `public.users`
- Verify `create_user_profile` Edge Function is working
- Check Supabase auth triggers

### 2. Payment Verification Fails
- Verify Paystack webhook URL is correct
- Check `PAYSTACK_SECRET_KEY` in Edge Function env vars
- Verify webhook signature verification

### 3. Documents Not Generating
- Check `generate_deed` Edge Function deployment
- Verify Supabase Storage bucket exists
- Check RLS policies for storage access

### 4. Forum Data Not Loading
- Verify forum tables exist
- Check RLS policies for forum access
- Verify Edge Function permissions

## 📊 Monitoring

### 1. Supabase Dashboard
- Monitor Edge Function logs
- Check database performance
- Review storage usage

### 2. Railway Dashboard
- Monitor backend logs
- Check API response times
- Verify environment variables

### 3. Application Logs
- Check browser console for errors
- Monitor API calls in Network tab
- Verify authentication state

## 🔄 Rollback Plan

If issues arise:

1. **Database**: Restore from Supabase backup
2. **Functions**: Redeploy previous versions
3. **Backend**: Switch back to MongoDB backend
4. **Frontend**: Revert to Firebase configuration

## 📞 Support

For technical issues:
1. Check Supabase logs first
2. Verify environment variables
3. Test Edge Functions individually
4. Check RLS policies
5. Verify database schema

## 🎯 Success Criteria

- [ ] All existing users can log in
- [ ] Property listings show correct available sqm
- [ ] Investment creation works end-to-end
- [ ] Document generation works
- [ ] Forum is fully functional
- [ ] No mock data visible
- [ ] Profile dates are accurate
- [ ] Available spots counter works
- [ ] Co-owners show real data

