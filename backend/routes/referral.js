import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get user's referral stats
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_referral_stats', { p_user_id: req.user.id });

    if (error) {
      console.error('Error fetching referral stats:', error);
      return res.status(500).json({ error: 'Failed to fetch referral stats' });
    }

    res.json({ success: true, stats: data });
  } catch (error) {
    console.error('Error in referral stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's referral history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_referral_history', { p_user_id: req.user.id });

    if (error) {
      console.error('Error fetching referral history:', error);
      return res.status(500).json({ error: 'Failed to fetch referral history' });
    }

    res.json({ success: true, history: data });
  } catch (error) {
    console.error('Error in referral history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's wallet transactions
router.get('/wallet/transactions', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_wallet_transactions', { p_user_id: req.user.id });

    if (error) {
      console.error('Error fetching wallet transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch wallet transactions' });
    }

    res.json({ success: true, transactions: data });
  } catch (error) {
    console.error('Error in wallet transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set user referral code (during signup)
router.post('/set-referral', authenticateUser, async (req, res) => {
  try {
    const { referral_code } = req.body;

    if (!referral_code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const { data, error } = await supabase
      .rpc('set_user_referral', { 
        p_user_id: req.user.id, 
        p_referral_code: referral_code 
      });

    if (error) {
      console.error('Error setting referral:', error);
      return res.status(500).json({ error: 'Failed to set referral' });
    }

    if (!data) {
      return res.status(400).json({ error: 'Invalid referral code or already referred' });
    }

    res.json({ success: true, message: 'Referral set successfully' });
  } catch (error) {
    console.error('Error in set referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate referral code
router.post('/validate-code', async (req, res) => {
  try {
    const { referral_code } = req.body;

    if (!referral_code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const { data, error } = await supabase
      .rpc('validate_referral_code', { p_code: referral_code });

    if (error) {
      console.error('Error validating referral code:', error);
      return res.status(500).json({ error: 'Failed to validate referral code' });
    }

    if (!data) {
      return res.json({ success: false, message: 'Invalid referral code' });
    }

    // Get referrer details
    const { data: referrerData, error: referrerError } = await supabase
      .from('user_profiles')
      .select('full_name, referral_code')
      .eq('id', data)
      .single();

    if (referrerError) {
      console.error('Error fetching referrer details:', referrerError);
      return res.status(500).json({ error: 'Failed to fetch referrer details' });
    }

    res.json({ 
      success: true, 
      valid: true, 
      referrer: referrerData 
    });
  } catch (error) {
    console.error('Error in validate referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get referral leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const { data, error } = await supabase
      .rpc('get_referral_leaderboard', { p_limit: limit });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    res.json({ success: true, leaderboard: data });
  } catch (error) {
    console.error('Error in leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process wallet withdrawal
router.post('/wallet/withdraw', authenticateUser, async (req, res) => {
  try {
    const { amount, paystack_recipient_code } = req.body;

    if (!amount || !paystack_recipient_code) {
      return res.status(400).json({ error: 'Amount and recipient code are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const { data, error } = await supabase
      .rpc('process_wallet_withdrawal', { 
        p_user_id: req.user.id, 
        p_amount: amount,
        p_paystack_recipient_code: paystack_recipient_code
      });

    if (error) {
      console.error('Error processing withdrawal:', error);
      return res.status(500).json({ error: 'Failed to process withdrawal' });
    }

    if (!data.success) {
      return res.status(400).json({ error: data.error });
    }

    // Here you would integrate with Paystack Transfer API
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: 'Withdrawal processed successfully',
      withdrawal: data
    });
  } catch (error) {
    console.error('Error in wallet withdrawal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply wallet balance to purchase
router.post('/wallet/apply', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const { data, error } = await supabase
      .rpc('apply_wallet_balance', { 
        p_user_id: req.user.id, 
        p_amount: amount
      });

    if (error) {
      console.error('Error applying wallet balance:', error);
      return res.status(500).json({ error: 'Failed to apply wallet balance' });
    }

    if (!data) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    res.json({ 
      success: true, 
      message: 'Wallet balance applied successfully',
      amount_applied: amount
    });
  } catch (error) {
    console.error('Error in apply wallet balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's current wallet balance
router.get('/wallet/balance', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching wallet balance:', error);
      return res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }

    res.json({ 
      success: true, 
      wallet_balance: data.wallet_balance || 0
    });
  } catch (error) {
    console.error('Error in wallet balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process referral reward (called by Paystack webhook)
router.post('/process-reward', async (req, res) => {
  try {
    const { referred_user_id, purchase_id, purchase_amount } = req.body;

    if (!referred_user_id || !purchase_id || !purchase_amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const { data, error } = await supabase
      .rpc('process_referral_reward', { 
        p_referred_user_id: referred_user_id,
        p_purchase_id: purchase_id,
        p_purchase_amount: purchase_amount
      });

    if (error) {
      console.error('Error processing referral reward:', error);
      return res.status(500).json({ error: 'Failed to process referral reward' });
    }

    res.json({ 
      success: true, 
      reward_processed: data,
      message: data ? 'Referral reward processed successfully' : 'No referral found for this user'
    });
  } catch (error) {
    console.error('Error in process referral reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's referral code
router.get('/code', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('referral_code')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching referral code:', error);
      return res.status(500).json({ error: 'Failed to fetch referral code' });
    }

    res.json({ 
      success: true, 
      referral_code: data.referral_code
    });
  } catch (error) {
    console.error('Error in referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as referralRouter };
