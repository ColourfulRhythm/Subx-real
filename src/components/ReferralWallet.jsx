import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export default function ReferralWallet({ user }) {
  const [referralBalance, setReferralBalance] = useState(0);
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [withdrawalForm, setWithdrawalForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    referralCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleWithdrawSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!withdrawalForm.bankName || !withdrawalForm.accountNumber || !withdrawalForm.accountName) {
        alert('Please fill in all required fields');
        return;
      }
      
      if (referralBalance < 10000) {
        alert('Minimum withdrawal amount is ₦10,000');
        return;
      }
      
      // Get user's referral code
      const userProfilesRef = collection(db, 'user_profiles');
      const profileQuery = query(userProfilesRef, where('user_id', '==', currentUser.uid));
      const profileSnapshot = await getDocs(profileQuery);
      
      let userReferralCode = '';
      if (!profileSnapshot.empty) {
        const profileData = profileSnapshot.docs[0].data();
        userReferralCode = profileData.referral_code || 'N/A';
      }
      
      // Create withdrawal request record
      const withdrawalRef = collection(db, 'withdrawal_requests');
      await addDoc(withdrawalRef, {
        user_id: currentUser.uid,
        user_email: currentUser.email,
        user_name: currentUser.displayName || currentUser.email,
        amount: referralBalance,
        bank_name: withdrawalForm.bankName,
        account_number: withdrawalForm.accountNumber,
        account_name: withdrawalForm.accountName,
        referral_code: userReferralCode,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Send email notification (this would typically be handled by a backend service)
      const emailData = {
        to: 'subx@focalpointprop.com',
        subject: 'New Withdrawal Request - Subx Referral Program',
        body: `
New Withdrawal Request Details:

User Information:
- Full Name: ${currentUser.displayName || currentUser.email}
- Email: ${currentUser.email}
- Referral Code: ${userReferralCode}

Withdrawal Details:
- Amount: ₦${referralBalance.toLocaleString()}
- Bank: ${withdrawalForm.bankName}
- Account Number: ${withdrawalForm.accountNumber}
- Account Name: ${withdrawalForm.accountName}

Request Date: ${new Date().toLocaleString()}

Please process this withdrawal request.
        `
      };
      
      // Store email for processing (in a real app, this would be sent via backend)
      const emailRef = collection(db, 'withdrawal_emails');
      await addDoc(emailRef, emailData);
      
      setShowWithdrawModal(false);
      alert('Withdrawal request submitted successfully! You will receive your payment within 3-5 business days.');
      
      // Reset form
      setWithdrawalForm({
        bankName: '',
        accountNumber: '',
        accountName: '',
        referralCode: ''
      });
      
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal request. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={referralBalance < 10000}
          className="bg-orange-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          💰 Withdraw Funds
        </button>
      </div>
      
      {/* Minimum withdrawal notice */}
      {referralBalance < 10000 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Minimum withdrawal amount is ₦10,000. You need ₦{(10000 - referralBalance).toLocaleString()} more to withdraw.
            </p>
          </div>
        </div>
      )}

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


      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">💰 Withdraw Referral Balance</h3>
            
            {/* Withdrawal Amount Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Available Balance</div>
              <div className="text-2xl font-bold text-blue-800">₦{referralBalance.toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1">Minimum withdrawal: ₦10,000</div>
            </div>
            
            {/* Bank Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={withdrawalForm.bankName}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, bankName: e.target.value})}
                  placeholder="e.g., Access Bank, GTBank, First Bank"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={withdrawalForm.accountNumber}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, accountNumber: e.target.value})}
                  placeholder="Enter your account number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={withdrawalForm.accountName}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, accountName: e.target.value})}
                  placeholder="Enter the name on the account"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                By submitting this withdrawal request, you agree that:
              </p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>• Withdrawal will be processed within 3-5 business days</li>
                <li>• Bank details must be correct to avoid delays</li>
                <li>• Minimum withdrawal amount is ₦10,000</li>
                <li>• Your referral code will be included in the request</li>
              </ul>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={isSubmitting || referralBalance < 10000}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
