
# 🚀 Supabase Deployment Guide

## Manual Deployment Steps

Since CLI authentication requires database password, here's how to deploy manually:

### 1. Deploy Database Schema

1. Go to: https://supabase.com/dashboard/project/hclguhbswctxfahhzrrr/sql
2. Copy and paste the content from: supabase/migrations/0001_supabase_core_schema.sql
3. Click "Run" to execute the SQL

### 2. Deploy Edge Functions

1. Go to: https://supabase.com/dashboard/project/hclguhbswctxfahhzrrr/functions
2. Deploy each function:

#### create_user_profile
- Source: supabase/functions/create_user_profile/index.ts
- Set environment variables:
  - SUPABASE_URL: https://hclguhbswctxfahhzrrr.supabase.co
  - SUPABASE_SERVICE_ROLE_KEY: [get from dashboard]
  - PAYSTACK_SECRET_KEY: [your paystack secret]

#### purchase-init
- Source: supabase/functions/purchase-init/index.ts
- Same environment variables

#### payment-webhook
- Source: supabase/functions/payment-webhook/index.ts
- Same environment variables

#### generate_deed
- Source: supabase/functions/generate_deed/index.ts
- Same environment variables

### 3. Create Storage Bucket

1. Go to: https://supabase.com/dashboard/project/hclguhbswctxfahhzrrr/storage
2. Create bucket named "documents"
3. Set public access policy

### 4. Deploy Backend

```bash
cd backend
railway up
```

## Environment Variables Needed

### Backend (.env)
```
SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[get from dashboard]
PAYSTACK_SECRET_KEY=[your paystack secret]
PORT=5000
```

### Frontend (.env)
```
VITE_SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
```

## Testing Checklist

- [ ] Database schema deployed
- [ ] Edge functions deployed
- [ ] Storage bucket created
- [ ] Backend deployed
- [ ] Frontend environment variables set
- [ ] User signup works
- [ ] User count API works
- [ ] Property listings load
- [ ] Investment creation works
- [ ] Document generation works

## Current Status

✅ Schema file ready
✅ Edge functions ready
✅ Backend server ready
⏳ Database deployment pending
⏳ Function deployment pending
⏳ Backend deployment pending

## Next Steps

1. Deploy schema manually in Supabase dashboard
2. Deploy edge functions manually
3. Deploy backend to Railway
4. Test all functionality
