# 🔐 **ENVIRONMENT VARIABLES CHECKLIST - VERCEL DEPLOYMENT**

## ✅ **COPY & PASTE THESE INTO VERCEL:**

### **1. SUPABASE CONFIGURATION**
```bash
SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ
VITE_SUPABASE_FUNCTIONS_URL=https://hclguhbswctxfahhzrrr.supabase.co/functions/v1
```

### **2. TELEGRAM BOT CONFIGURATION**
```bash
TELEGRAM_BOT_TOKEN=8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ
TELEGRAM_CHAT_ID=-1002635491419
```

### **3. SITE CONFIGURATION**
```bash
VITE_SITE_URL=https://subxhq.com
```

### **4. PAYMENT CONFIGURATION (ADD YOUR KEYS)**
```bash
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

### **5. EMAIL CONFIGURATION (OPTIONAL)**
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@subxhq.com
```

## 🎯 **VERCEL SETUP STEPS:**

1. **Go to**: [vercel.com](https://vercel.com)
2. **Import**: `ColourfulRhythm/Subx-real` repository
3. **Framework**: Select `Vite`
4. **Environment Variables**: Add all variables above
5. **Deploy**: Click deploy button

## 🗄️ **DATABASE SETUP (BEFORE DEPLOYMENT):**

**Run these SQL scripts in Supabase dashboard:**

1. `supabase_schema.sql` - Main schema
2. `populate_unverified_users.sql` - User data
3. `actual_plots_solution.sql` - Dynamic functions

## ✅ **READY TO DEPLOY!**

**All environment variables are configured and ready!** 🚀
