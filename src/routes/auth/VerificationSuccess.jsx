import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    const handleVerification = () => {
      // Check if user is authenticated with Firebase
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified) {
          // Email is confirmed
          setVerificationStatus('success');
          
          // Set authentication status
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', 'investor');
          localStorage.setItem('userId', user.uid);
          localStorage.setItem('userEmail', user.email);
          
          toast.success('Email verified successfully!');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard/investor');
          }, 3000);
        } else if (user && !user.emailVerified) {
          // User exists but email not verified - show pending
          setVerificationStatus('pending');
        } else {
          // No user - show error
          setVerificationStatus('error');
        }
        
        setIsVerifying(false);
      });
      
      return () => unsubscribe();
    };

    const cleanup = handleVerification();
    return cleanup;
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying your email...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md mx-auto pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {verificationStatus === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified Successfully!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Your email has been verified. You can now access your dashboard and start investing in real estate.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard/investor')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </motion.button>
              
              <p className="text-sm text-gray-500 mt-4">
                Redirecting automatically in a few seconds...
              </p>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h1>
              
              <p className="text-gray-600 mb-6">
                There was an issue verifying your email. Please try again or contact support.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Login
              </motion.button>
            </>
          )}

          {verificationStatus === 'pending' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Pending
              </h1>
              
              <p className="text-gray-600 mb-6">
                Your email verification is still pending. Please check your email and click the verification link.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Back to Login
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
