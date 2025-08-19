# 🚀 **VERCEL DEPLOYMENT GUIDE - SUBX APPLICATION**

## ✅ **PREREQUISITES COMPLETED:**
- ✅ Code pushed to GitHub: `ColourfulRhythm/Subx-real`
- ✅ All functionality implemented and tested
- ✅ Supabase integration complete
- ✅ Telegram bot integration complete

## 🌐 **STEP 1: VERCEL PROJECT SETUP**

### **1.1 Go to Vercel Dashboard**
- Visit: [vercel.com](https://vercel.com)
- Sign in with your GitHub account
- Click **"New Project"**

### **1.2 Connect GitHub Repository**
- Select **"Import Git Repository"**
- Choose: `ColourfulRhythm/Subx-real`
- Click **"Import"**

### **1.3 Configure Project Settings**
- **Project Name**: `subx-real` (or your preferred name)
- **Framework Preset**: `Vite`
- **Root Directory**: `/` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🔐 **STEP 2: ENVIRONMENT VARIABLES SETUP**

### **2.1 Required Environment Variables**

Set these in your Vercel project dashboard under **Settings → Environment Variables**:

#### **Supabase Configuration:**
```bash
SUPABASE_URL=https://hclguhbswctxfahhzrrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ
VITE_SUPABASE_FUNCTIONS_URL=https://hclguhbswctxfahhzrrr.supabase.co/functions/v1
```

#### **Telegram Bot Configuration:**
```bash
TELEGRAM_BOT_TOKEN=8466268446:AAFRwpiD416wgLzhbP0awxUJ73-zcHuCOiQ
TELEGRAM_CHAT_ID=-1002635491419
```

#### **Site Configuration:**
```bash
VITE_SITE_URL=https://subxhq.com
```

#### **Payment Configuration (Add these):**
```bash
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

#### **Email Configuration (Optional - for notifications):**
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@subxhq.com
```

### **2.2 Environment Variable Setup in Vercel**

1. **Go to Project Settings → Environment Variables**
2. **Add each variable:**
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://hclguhbswctxfahhzrrr.supabase.co`
   - **Environment**: `Production` (and `Preview` if you want)
   - Click **"Add"**
3. **Repeat for all variables above**

## 🗄️ **STEP 3: SUPABASE DATABASE SETUP**

### **3.1 Run SQL Scripts in Order**

Go to your Supabase dashboard → SQL Editor and run these scripts **IN THIS EXACT ORDER**:

#### **Script 1: Main Schema (Run First)**
```sql
-- Copy and paste the entire content of supabase_schema.sql
-- This creates all the tables and basic structure
```

#### **Script 2: User Population (Run Second)**
```sql
-- Copy and paste the entire content of populate_unverified_users.sql
-- This creates forum topics and replies (without foreign key violations)
```

#### **Script 3: Dynamic Functions (Run Third)**
```sql
-- Copy and paste the entire content of actual_plots_solution.sql
-- This creates the dynamic co-ownership calculation functions
```

#### **Script 4: Linking Functions (Run Fourth)**
```sql
-- Copy and paste the entire content of link_unverified_users.sql
-- This creates functions to automatically link users when they sign up
```

### **3.2 Verify Database Setup**
After running scripts, you should see:
- ✅ Tables created: `projects`, `investments`, `forum_topics`, `user_profiles`
- ✅ Forum topics and replies created (without user links)
- ✅ Functions created for dynamic co-ownership
- ✅ Automatic linking functions created

### **3.3 How Unverified Users Work**
- **Christopher Onuoha** (chrixonuoha@gmail.com) - 7 sqm in Plot 77
- **Kingkwa Enang Oyama** (kingkwaoyama@gmail.com) - 35 sqm in Plot 77  
- **Iwuozor Chika** (mary.stella82@yahoo.com) - 7 sqm in Plot 77

**When these users sign up:**
1. ✅ **Automatic trigger** will create their profiles
2. ✅ **Investment records** will be linked to their real UUIDs
3. ✅ **Forum activity** will be linked to their accounts
4. ✅ **Co-ownership percentages** will be calculated automatically

## 🚀 **STEP 4: DEPLOY TO VERCEL**

### **4.1 Deploy Project**
1. Click **"Deploy"** in Vercel
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://subx-real.vercel.app`)

### **4.2 Configure Custom Domain (Optional)**
1. Go to **Settings → Domains**
2. Add your custom domain: `subxhq.com`
3. Follow DNS configuration instructions

## 🧪 **STEP 5: TESTING & VERIFICATION**

### **5.1 Test Core Functionality**
- ✅ **Landing Page**: Loads correctly
- ✅ **User Signup/Login**: Works with Supabase
- ✅ **Dashboard**: Shows correct data
- ✅ **Projects Tab**: Displays plots with correct SQM
- ✅ **Forum**: Creates and displays channels
- ✅ **Documents**: Download functionality works

### **5.2 Test Dynamic Features**
- ✅ **Available SQM**: Updates correctly for Plot 77 (451 available)
- ✅ **Forum Topics**: 5 topics created and ready for user linking
- ✅ **Real-time Updates**: Will work when real users buy SQM

### **5.3 Test Unverified User Linking**
1. **Sign up with** `chrixonuoha@gmail.com`
2. **Verify** that Christopher Onuoha's 7 sqm investment appears
3. **Check** that forum topics are linked to the user
4. **Repeat** for other unverified users

## 🔧 **STEP 6: POST-DEPLOYMENT CONFIGURATION**

### **6.1 Update Site URL**
If you're using a custom domain, update:
```bash
VITE_SITE_URL=https://subxhq.com
```

### **6.2 Test Telegram Notifications**
1. Sign up a new user
2. Check if welcome message appears in Telegram group
3. Verify message format and signup link

### **6.3 Monitor Performance**
- Check Vercel analytics
- Monitor Supabase usage
- Verify all API endpoints respond correctly

## 🎯 **EXPECTED RESULTS AFTER DEPLOYMENT:**

### **Frontend Features:**
- ✅ **Projects Tab**: Shows Plot 77 with 451 available SQM
- ✅ **Forum**: Telegram-style interface with 5 topics ready
- ✅ **Documents**: Downloadable receipts and certificates
- ✅ **User Authentication**: Supabase Auth working

### **Backend Features:**
- ✅ **Dynamic SQM Calculation**: Real-time updates
- ✅ **Telegram Integration**: Welcome and purchase notifications
- ✅ **Supabase Integration**: All data stored and retrieved correctly
- ✅ **Automatic User Linking**: Unverified users linked when they sign up

## 🚨 **TROUBLESHOOTING:**

### **Common Issues:**

#### **Build Fails:**
- Check environment variables are set correctly
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

#### **Database Connection Issues:**
- Verify Supabase URL and keys
- Check if SQL scripts were run successfully
- Verify RLS policies are set correctly

#### **Foreign Key Constraint Errors:**
- ✅ **SOLVED**: We now use a different approach that avoids these errors
- ✅ **SOLVED**: Unverified users are linked automatically when they sign up
- ✅ **SOLVED**: Forum topics created without user links initially

#### **Telegram Bot Not Working:**
- Check bot token and chat ID
- Verify bot has permission to send messages
- Check network connectivity

## 🎉 **DEPLOYMENT COMPLETE!**

**Your Subx application is now live with:**
- ✅ **Universal dynamic co-ownership** for all plots
- ✅ **Real-time updates** when users buy SQM
- ✅ **Telegram notifications** for signups and purchases
- ✅ **Supabase backend** with all data
- ✅ **Automatic user linking** for unverified users
- ✅ **Zero interface changes** - all functionality preserved

**The system will automatically work for any new plots you add in the future!** 🏠✨

---

## 📞 **SUPPORT:**

If you encounter any issues during deployment:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connectivity
4. Check Supabase logs

**Ready to deploy! Let's make Subx live!** 🚀
