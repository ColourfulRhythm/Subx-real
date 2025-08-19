# SQL Scripts for Subx Database

## 🗂️ Essential SQL Scripts

### 1. `working_cleanup_script.sql` ⭐ **MAIN SCRIPT**
**Purpose:** Clean up the database and remove all sample/dummy data
**What it does:**
- Removes sample projects (Kobape Gardens, Victoria Island)
- Updates existing projects to correct data
- Adds missing real plots (79, 81, 84, 87)
- Shows current database state
- **Run this FIRST** to clean up your database

### 2. `check_tolulope_investment.sql` ⭐ **USER LINKING SCRIPT**
**Purpose:** Check and fix Tolulope's investment if they've already signed up
**What it does:**
- Checks if Tolulope exists in the system
- Automatically creates investment if missing
- Links existing users to their investments
- Shows final verification
- **Run this SECOND** after cleanup

## 🚀 How to Use

### Step 1: Clean Up Database
```sql
-- In Supabase SQL Editor, run:
working_cleanup_script.sql
```

### Step 2: Link Existing Users
```sql
-- In Supabase SQL Editor, run:
check_tolulope_investment.sql
```

## 📊 Expected Results

After running both scripts:
- ✅ **Sample data removed** - No more dummy projects
- ✅ **Real plots only** - Plot 77, 79, 81, 84, 87
- ✅ **Real investments** - Christopher, Kingkwa, Iwuozor, Tolulope
- ✅ **Clean database** - Ready for production
- ✅ **Dynamic system** - New users automatically linked

## 🏠 Plot 77 Co-ownership (After Scripts)

- **Christopher Onuoha**: 7 sqm (1.4%)
- **Kingkwa Enang Oyama**: 35 sqm (7.0%)
- **Iwuozor Chika**: 7 sqm (1.4%)
- **Tolulope Olugbode**: 1 sqm (0.2%)
- **Total Purchased**: 50 sqm
- **Available**: 450 sqm

## 🔧 What Was Cleaned Up

**Removed Files:**
- ❌ `better_cleanup_script.sql` - Had foreign key errors
- ❌ `corrected_schema.sql` - Had constraint issues
- ❌ `cleanup_sample_data.sql` - Had foreign key errors
- ❌ `add_user_investment.sql` - Redundant
- ❌ `test_user_investments.sql` - Testing only
- ❌ `link_unverified_users.sql` - Had foreign key errors
- ❌ `populate_unverified_users.sql` - Had foreign key errors
- ❌ And 20+ other problematic SQL files

**Kept Files:**
- ✅ `working_cleanup_script.sql` - Works perfectly
- ✅ `check_tolulope_investment.sql` - Works perfectly
- ✅ All documentation and guides

## 🎯 Result

**Clean, working database with:**
- Real users only
- Real investments only
- Real plots only
- No foreign key errors
- No dummy data
- Ready for production

**Run the two scripts in order and you're all set!** 🚀
