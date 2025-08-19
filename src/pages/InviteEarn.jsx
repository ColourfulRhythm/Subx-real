import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Users, 
  DollarSign, 
  Wallet, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Gift,
  Star
} from 'lucide-react';
import axios from 'axios';

const InviteEarn = () => {
  const [referralStats, setReferralStats] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch referral stats
      const statsResponse = await axios.get('/api/referral/stats', { headers });
      setReferralStats(statsResponse.data.stats);

      // Fetch referral history
      const historyResponse = await axios.get('/api/referral/history', { headers });
      setReferralHistory(historyResponse.data.history);

      // Fetch wallet balance
      const balanceResponse = await axios.get('/api/referral/wallet/balance', { headers });
      setWalletBalance(balanceResponse.data.wallet_balance);

      // Fetch leaderboard
      const leaderboardResponse = await axios.get('/api/referral/leaderboard?limit=10');
      setLeaderboard(leaderboardResponse.data.leaderboard);

    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (referralStats?.referral_code) {
      try {
        await navigator.clipboard.writeText(referralStats.referral_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const shareReferralCode = async () => {
    if (referralStats?.referral_code) {
      const shareText = `Join Subx and start your property investment journey! Use my referral code: ${referralStats.referral_code}`;
      const shareUrl = `https://subxhq.com?ref=${referralStats.referral_code}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join Subx - Property Investment Platform',
            text: shareText,
            url: shareUrl
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        try {
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Invite & Earn
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share Subx with friends and earn 5% of their first purchase. 
            Build your passive income through referrals!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900">
                  {referralStats?.total_referrals || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(referralStats?.total_earned || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Referral Code</h2>
            <p className="text-gray-600">Share this code with friends to earn rewards</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-center">
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Referral Code</p>
              <p className="text-3xl font-bold text-gray-900 tracking-wider">
                {referralStats?.referral_code || 'Loading...'}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={copyReferralCode}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={shareReferralCode}
                className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Code</h3>
              <p className="text-gray-600">Share your unique referral code with friends and family</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-gray-600">Your friends use your code when they create their account</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">You Earn 5%</h3>
              <p className="text-gray-600">Earn 5% of their first property purchase automatically</p>
            </div>
          </div>
        </motion.div>

        {/* Referral History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referral History</h2>
          
          {referralHistory.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No referrals yet. Start sharing your code to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referralHistory.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{referral.referred_user_name}</p>
                      <p className="text-sm text-gray-600">
                        Purchase: {formatCurrency(referral.purchase_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +{formatCurrency(referral.reward_amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Referrers</h2>
          
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {index < 3 ? (
                      <Star className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.total_referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(user.total_earned)}
                  </p>
                  <p className="text-sm text-gray-600">earned</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InviteEarn;
