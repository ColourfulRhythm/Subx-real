import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export default function ReferralWallet({ user }) {
  const [referralBalance, setReferralBalance] = useState(0);
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSqm, setSelectedSqm] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchReferralData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchReferralData = async (userId) => {
    try {
      setLoading(true);
      
      // Check if user exists and has an ID
      if (!userId) {
        console.log('User ID not available for referral data fetch');
        setLoading(false);
        return;
      }
      
      // Get referral rewards from Firestore
      const referralsRef = collection(db, 'referrals');
      const referralsQuery = query(referralsRef, where('referrer_id', '==', userId));
      const referralsSnapshot = await getDocs(referralsQuery);
      
      if (!referralsSnapshot.empty) {
        const referrals = referralsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate total balance from completed referrals
        const completedReferrals = referrals.filter(ref => ref.status === 'completed');
        const totalBalance = completedReferrals.reduce((sum, ref) => sum + (ref.commission || 0), 0);
        
        setReferralBalance(totalBalance);
        setReferralHistory(completedReferrals);
      } else {
        setReferralBalance(0);
        setReferralHistory([]);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setReferralBalance(0);
      setReferralHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuySqm = async () => {
    try {
      const userId = currentUser?.uid;
      
      // Safety check for user
      if (!userId) {
        alert('User information not available');
        return;
      }
      
      const sqmCost = selectedSqm * 5000; // ₦5,000 per sqm
      
      if (sqmCost > referralBalance) {
        alert('Insufficient referral balance for this purchase');
        return;
      }
      
      // Create purchase record in Firestore
      const purchaseRef = collection(db, 'referral_purchases');
      await addDoc(purchaseRef, {
        user_id: userId,
        sqm_amount: selectedSqm,
        cost: sqmCost,
        purchase_date: new Date(),
        status: 'completed'
      });
      
      // Update user's referral balance
      const newBalance = referralBalance - sqmCost;
      setReferralBalance(newBalance);
      
      // Update user profile in Firestore
      const userProfilesRef = collection(db, 'user_profiles');
      const profileQuery = query(userProfilesRef, where('user_id', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const profileDoc = doc(db, 'user_profiles', profileSnapshot.docs[0].id);
        await updateDoc(profileDoc, {
          wallet_balance: newBalance,
          updated_at: new Date()
        });
      }
      
      setShowBuyModal(false);
      alert(`Successfully purchased ${selectedSqm} sqm for ₦${sqmCost.toLocaleString()}`);
      
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Failed to process purchase. Please try again.');
    }
  };

  // Early return if user is not available
  if (!currentUser && !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  const handleWithdraw = async () => {
    try {
      const userId = currentUser?.uid;
      
      if (!userId) {
        alert('User information not available');
        return;
      }
      
      if (withdrawAmount <= 0 || withdrawAmount > referralBalance) {
        alert('Invalid withdrawal amount');
        return;
      }
      
      // Create withdrawal record in Firestore
      const withdrawalsRef = collection(db, 'referral_withdrawals');
      await addDoc(withdrawalsRef, {
        user_id: userId,
        amount: withdrawAmount,
        withdrawal_date: new Date(),
        status: 'pending'
      });
      
      // Update user's referral balance
      const newBalance = referralBalance - withdrawAmount;
      setReferralBalance(newBalance);
      
      // Update user profile in Firestore
      const userProfilesRef = collection(db, 'user_profiles');
      const profileQuery = query(userProfilesRef, where('user_id', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const profileDoc = doc(db, 'user_profiles', profileSnapshot.docs[0].id);
        await updateDoc(profileDoc, {
          wallet_balance: newBalance,
          updated_at: new Date()
        });
      }
      
      setShowWithdrawModal(false);
      setWithdrawAmount(0);
      alert(`Withdrawal request submitted for ₦${withdrawAmount.toLocaleString()}`);
      
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal. Please try again.');
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
