import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';

export default function ReferralWallet({ user }) {
  const [referralBalance, setReferralBalance] = useState(0);
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSqm, setSelectedSqm] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Get referral rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (rewardsError) {
        console.error('Error fetching rewards:', rewardsError);
      } else {
        const totalBalance = rewards?.reduce((sum, reward) => sum + (reward.amount || 0), 0) || 0;
        setReferralBalance(totalBalance);
        setReferralHistory(rewards || []);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuySqm = async () => {
    try {
      const sqmCost = selectedSqm * 5000; // ₦5,000 per sqm
      
      if (sqmCost > referralBalance) {
        alert('Insufficient referral balance for this purchase');
        return;
      }

      // Create investment using referral balance
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: 1, // Default to Plot 77
          sqm_purchased: selectedSqm,
          amount: sqmCost,
          payment_reference: `REF-${Date.now()}`,
          status: 'completed',
          source: 'referral_balance'
        });

      if (investmentError) {
        console.error('Error creating investment:', investmentError);
        alert('Failed to create investment');
        return;
      }

      // Update referral balance
      const { error: balanceError } = await supabase
        .from('referral_rewards')
        .update({ 
          status: 'used_for_purchase',
          used_amount: sqmCost,
          used_at: new Date().toISOString()
        })
        .eq('referrer_id', user.id)
        .eq('status', 'paid');

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
      }

      // Refresh data
      await fetchReferralData();
      setShowBuyModal(false);
      alert(`Successfully purchased ${selectedSqm} sqm using referral balance!`);
      
    } catch (error) {
      console.error('Error buying SQM:', error);
      alert('Failed to purchase SQM');
    }
  };

  const handleWithdraw = async () => {
    try {
      if (withdrawAmount > referralBalance) {
        alert('Insufficient balance for withdrawal');
        return;
      }

      if (withdrawAmount < 1000) {
        alert('Minimum withdrawal amount is ₦1,000');
        return;
      }

      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from('referral_withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (withdrawalError) {
        console.error('Error creating withdrawal:', withdrawalError);
        alert('Failed to create withdrawal request');
        return;
      }

      // Update referral balance
      const { error: balanceError } = await supabase
        .from('referral_rewards')
        .update({ 
          status: 'withdrawal_pending',
          withdrawal_amount: withdrawAmount,
          withdrawal_requested_at: new Date().toISOString()
        })
        .eq('referrer_id', user.id)
        .eq('status', 'paid')
        .limit(1);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
      }

      // Refresh data
      await fetchReferralData();
      setShowWithdrawModal(false);
      alert('Withdrawal request submitted successfully! You will receive payment within 24-48 hours.');
      
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to submit withdrawal request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🎁 Referral Wallet</h2>
        <div className="text-sm text-gray-500">
          Earn 5% on every friend's purchase
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="text-sm opacity-90">Available Balance</div>
        <div className="text-3xl font-bold">₦{referralBalance.toLocaleString()}</div>
        <div className="text-sm opacity-90 mt-2">
          {referralHistory.length} successful referrals
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowBuyModal(true)}
          disabled={referralBalance < 5000}
          className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🏠 Buy SQM
        </button>
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={referralBalance < 1000}
          className="bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          💰 Withdraw
        </button>
      </div>

      {/* Referral History */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h3>
        {referralHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>No referrals yet. Share your code to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referralHistory.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    Referral Reward
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(reward.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    +₦{reward.amount?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reward.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Buy SQM Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">🏠 Buy SQM with Referral Balance</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select SQM Amount
              </label>
              <select
                value={selectedSqm}
                onChange={(e) => setSelectedSqm(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value={1}>1 SQM - ₦5,000</option>
                <option value={2}>2 SQM - ₦10,000</option>
                <option value={5}>5 SQM - ₦25,000</option>
                <option value={10}>10 SQM - ₦50,000</option>
              </select>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                Cost: ₦{(selectedSqm * 5000).toLocaleString()}
              </div>
              <div className="text-sm text-blue-800">
                Balance after: ₦{(referralBalance - (selectedSqm * 5000)).toLocaleString()}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBuySqm}
                disabled={selectedSqm * 5000 > referralBalance}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">💰 Withdraw Referral Balance</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (₦)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                min="1000"
                max={referralBalance}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-800">
                Available: ₦{referralBalance.toLocaleString()}
              </div>
              <div className="text-sm text-orange-800">
                Minimum: ₦1,000
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawAmount < 1000 || withdrawAmount > referralBalance}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                Submit Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
