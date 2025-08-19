# Subx Referral System Implementation

## 🎯 Overview

The Subx referral system is a comprehensive solution that allows users to earn passive income by referring friends to the platform. Users earn 5% of their referred friends' first property purchase, creating a self-propelling network effect.

## 🏗️ Architecture

### Database Schema

#### 1. User Profile Updates
- `referral_code VARCHAR(12) UNIQUE` - Auto-generated unique referral code
- `referred_by UUID` - Foreign key to the user who referred them
- `wallet_balance DECIMAL(12,2) DEFAULT 0.00` - User's referral earnings

#### 2. Referral Rewards Table
```sql
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  purchase_id UUID NOT NULL REFERENCES investments(id),
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Audit Log Table
```sql
CREATE TABLE referral_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Functions

1. **`generate_referral_code()`** - Creates unique codes like "SUBX-AB12CD"
2. **`process_referral_reward()`** - Handles 5% reward calculation and distribution
3. **`apply_wallet_balance()`** - Manages wallet balance for purchases
4. **`get_user_referral_stats()`** - Returns comprehensive user referral statistics
5. **`get_referral_leaderboard()`** - Shows top referrers

## 🚀 Features

### For Users
- **Unique Referral Codes** - Auto-generated on signup
- **5% Earnings** - From referred friends' first purchase
- **Wallet System** - Store and use referral earnings
- **Referral History** - Track all referrals and earnings
- **Leaderboard** - Compete with other referrers

### For Admins
- **Complete Audit Trail** - All referral activities logged
- **Real-time Statistics** - Dashboard with referral metrics
- **Manual Override** - Ability to adjust rewards if needed

## 📱 Frontend Implementation

### 1. Invite & Earn Page (`/invite-earn`)
- **Referral Code Display** - Shows user's unique code
- **Copy & Share** - Easy sharing functionality
- **Statistics Dashboard** - Total referrals, earnings, wallet balance
- **Referral History** - List of referred users and their purchases
- **Leaderboard** - Top referrers in the system

### 2. Signup Integration
- **Referral Code Field** - Optional field during signup
- **Code Validation** - Real-time validation of referral codes
- **Automatic Linking** - Links new users to referrers

### 3. Dashboard Integration
- **Navigation Tab** - "Invite & Earn" tab in user dashboard
- **Quick Stats** - Referral statistics in overview
- **Wallet Integration** - Use wallet balance for purchases

## 🔧 Backend Implementation

### API Endpoints

#### Referral Management
- `GET /api/referral/stats` - Get user's referral statistics
- `GET /api/referral/history` - Get referral history
- `POST /api/referral/set-referral` - Set referral during signup
- `POST /api/referral/validate-code` - Validate referral code

#### Wallet Management
- `GET /api/referral/wallet/balance` - Get current wallet balance
- `POST /api/referral/wallet/withdraw` - Process withdrawal
- `POST /api/referral/wallet/apply` - Apply wallet to purchase
- `GET /api/referral/wallet/transactions` - Get transaction history

#### Leaderboard
- `GET /api/referral/leaderboard` - Get top referrers

### Paystack Integration

#### Webhook Handler
```javascript
app.post('/api/webhook/paystack', async (req, res) => {
  // Processes successful payments
  // Automatically calculates and distributes referral rewards
  // Updates wallet balances
});
```

#### Reward Processing
- **Automatic Trigger** - On successful Paystack payment
- **5% Calculation** - Based on purchase amount
- **Idempotent** - Prevents double-crediting
- **Audit Logging** - All transactions logged

## 🗄️ Database Functions

### Core Functions
1. **`generate_referral_code()`** - Creates unique referral codes
2. **`process_referral_reward()`** - Handles reward distribution
3. **`apply_wallet_balance()`** - Manages wallet transactions
4. **`validate_referral_code()`** - Validates referral codes
5. **`set_user_referral()`** - Links users to referrers

### Statistics Functions
1. **`get_user_referral_stats()`** - Comprehensive user stats
2. **`get_referral_leaderboard()`** - Top referrers list
3. **`get_user_referral_history()`** - Detailed referral history
4. **`get_user_wallet_transactions()`** - Wallet transaction history

### Views
1. **`top_referrers`** - Real-time leaderboard view

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their own referral data
- Referrers can only see their own rewards
- Audit logs are user-specific

### Webhook Security
- Signature verification (implemented but commented)
- Idempotent processing
- Error handling and logging

### Data Validation
- Referral code format validation
- Amount validation for wallet operations
- User existence verification

## 📊 Analytics & Monitoring

### Audit Trail
- All referral activities logged
- Wallet transactions tracked
- User actions recorded

### Performance Metrics
- Referral conversion rates
- Average earnings per referrer
- Top performing referral codes

## 🚀 Deployment Steps

### 1. Database Setup
```sql
-- Run the referral system schema
\i referral_system_schema.sql
```

### 2. Backend Deployment
- Add referral routes to server
- Configure Paystack webhook URL
- Set up environment variables

### 3. Frontend Deployment
- Add InviteEarn component
- Update navigation
- Add referral code field to signup

### 4. Testing
```sql
-- Run the test script
\i test_referral_system.sql
```

## 🔧 Configuration

### Environment Variables
```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Webhook URL
WEBHOOK_URL=https://your-domain.com/api/webhook/paystack
```

### Paystack Webhook Setup
1. Go to Paystack Dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://your-domain.com/api/webhook/paystack`
4. Select events: `charge.success`

## 📈 Business Impact

### User Growth
- **Viral Coefficient** - Each user brings 0.05 new users (5% conversion)
- **Network Effect** - Self-propelling growth mechanism
- **User Retention** - Referrers more likely to stay engaged

### Revenue Impact
- **5% Commission** - From referred users' purchases
- **Recurring Revenue** - From ongoing user activity
- **LTV Increase** - Higher lifetime value for referred users

### Marketing Benefits
- **Organic Growth** - Users become brand ambassadors
- **Cost Reduction** - Lower customer acquisition costs
- **Trust Building** - Peer-to-peer recommendations

## 🛠️ Maintenance

### Regular Tasks
1. **Monitor Webhook Logs** - Ensure payments are processed
2. **Audit Referral Claims** - Verify legitimate referrals
3. **Update Leaderboard** - Keep competition engaging
4. **Backup Audit Logs** - Preserve transaction history

### Troubleshooting
1. **Webhook Failures** - Check Paystack webhook status
2. **Reward Issues** - Verify database functions
3. **Wallet Problems** - Check transaction logs
4. **Code Generation** - Ensure uniqueness constraints

## 🎯 Future Enhancements

### Planned Features
1. **Multi-level Referrals** - Tiered commission structure
2. **Referral Challenges** - Time-limited bonus campaigns
3. **Social Integration** - Direct social media sharing
4. **Analytics Dashboard** - Advanced referral insights
5. **Mobile App** - Native referral experience

### Technical Improvements
1. **Real-time Updates** - WebSocket integration
2. **Advanced Analytics** - Machine learning insights
3. **API Rate Limiting** - Prevent abuse
4. **Caching Layer** - Improve performance

## 📞 Support

For technical support or questions about the referral system:
- Check the audit logs for transaction issues
- Verify webhook configuration in Paystack
- Test database functions with the test script
- Review the API documentation for endpoint details

---

**The Subx referral system is designed to create a sustainable, self-propelling growth mechanism that benefits both users and the platform. By incentivizing referrals with real monetary rewards, we create a community of engaged users who actively promote the platform.**
