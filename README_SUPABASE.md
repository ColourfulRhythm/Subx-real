# Supabase Integration

## Prerequisites
- Supabase project URL: https://hclguhbswctxfahhzrrr.supabase.co
- Anon key (client): set VITE_SUPABASE_ANON_KEY
- Service role key (server/functions): set SUPABASE_SERVICE_ROLE_KEY (never expose to client)
- Paystack secret key: PAYSTACK_SECRET_KEY

## Setup

1. Install Supabase CLI
```
npm i -g supabase
```

2. Login and link project
```
supabase login
supabase link --project-ref hclguhbswctxfahhzrrr
```

3. Apply database schema
```
supabase db push --file supabase/migrations/0001_supabase_core_schema.sql
```

4. Deploy Edge Functions
```
supabase functions deploy create_user_profile
supabase functions deploy purchase-init
supabase functions deploy payment-webhook
```

5. Configure function env vars (in Supabase dashboard -> Edge Functions settings):
- SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0
- PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_SECRET

## Client wiring
- After sign-up/login, call `create_user_profile` with `Authorization: Bearer <access_token>`.
- Use Supabase client for reads; call Edge Functions for sensitive writes (purchase, webhook, deed generation).

## Security
- Do not expose service role key to clients.
- Enable RLS on all sensitive tables (done in schema).
- Prefer private storage for documents; serve via signed URLs.
