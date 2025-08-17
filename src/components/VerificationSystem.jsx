import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const VerificationSystem = ({ user, onVerificationComplete, onBack }) => {
  const [verificationStep, setVerificationStep] = useState('email');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'

  useEffect(() => {
    // Get stored credentials for email verification
    const storedEmail = localStorage.getItem('tempUserEmail');
    const storedPassword = localStorage.getItem('tempUserPassword');
    
    // Always use email verification
    setUserEmail(storedEmail);
    setUserPassword(storedPassword);
    setSignupMethod('email');
    setVerificationStep('email');
    

  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated with Supabase
      const { data: { session } } = await supabase.auth.getSession();
      let currentUser = session?.user;
      
      // Re-authenticate if needed
      if (!currentUser && userEmail && userPassword) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: userPassword
          });
          
          if (error) throw error;
          currentUser = data.user;
          console.log('Re-authenticated user:', currentUser.email);
        } catch (authError) {
          console.error('Re-authentication failed:', authError);
          throw new Error('Please login again to send verification email');
        }
      }
      
      if (!currentUser) {
        throw new Error('No authenticated user found. Please login again.');
      }
      
      // Check if email is already verified
      if (currentUser.email_confirmed_at) {
        toast.success('Email is already verified!');
        setEmailVerified(true);
        return;
      }
      
      // Send verification email using Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: currentUser.email
      });
      
      if (error) throw error;
      
      toast.success('📧 Verification email sent! Check your inbox and spam folder.');
      setResendDisabled(true);
      setCountdown(60);
      
    } catch (error) {
      console.error('Email verification error:', error);
      let errorMessage = 'Failed to send verification email. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      setLoading(true);
      
      // For now, we'll skip phone verification as it requires additional setup
      // You can implement this later with Supabase phone auth if needed
      toast.info('Phone verification not yet implemented. Please use email verification.');
      
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error('Phone verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    if (onVerificationComplete) {
      onVerificationComplete();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Check if user is already verified
  useEffect(() => {
    if (user) {
      // Check if email is verified
      if (user.email_confirmed_at) {
        setEmailVerified(true);
      }
      
      // Check if phone is verified (if applicable)
      if (user.phone_confirmed_at) {
        setPhoneVerified(true);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Verify Account
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Back
            </motion.button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10"
          >
            {/* Email Verification Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Email Verification
              </h3>
              
              {emailVerified ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">✅ Email verified successfully!</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please verify your email address to complete your account setup.
                  </p>
                  
                  <button
                    onClick={handleEmailVerification}
                    disabled={loading || resendDisabled}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : resendDisabled ? `Resend in ${countdown}s` : 'Send Verification Email'}
                  </button>
                </div>
              )}
            </div>

            {/* Phone Verification Section (Optional) */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Phone Verification (Optional)
              </h3>
              
              {phoneVerified ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">✅ Phone verified successfully!</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Phone verification is optional but recommended for account security.
                  </p>
                  
                  <button
                    onClick={handlePhoneVerification}
                    disabled={loading}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Verify Phone Number'}
                  </button>
                </div>
              )}
            </div>

            {/* Continue Button */}
            {emailVerified && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleVerificationComplete}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-semibold"
              >
                Continue to Dashboard
              </motion.button>
            )}

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Having trouble? Check your spam folder or{' '}
                <button
                  onClick={handleEmailVerification}
                  disabled={resendDisabled}
                  className="text-indigo-600 hover:text-indigo-500 underline"
                >
                  resend the verification email
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerificationSystem; 