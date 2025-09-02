import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../../firebase';
import { confirmPasswordReset } from 'firebase/auth';
import Navbar from '../../components/Navbar';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the oobCode from URL parameters (Firebase password reset code)
  const oobCode = searchParams.get('oobCode');
  
  useEffect(() => {
    if (!oobCode) {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Confirm password reset with Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/expired-action-code':
          setError('Password reset link has expired. Please request a new one.');
          break;
        case 'auth/invalid-action-code':
          setError('Invalid password reset link. Please request a new one.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This password reset link is invalid or has expired.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Return to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Password Reset Successful!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been updated successfully. You will be redirected to the login page.
                </p>
                <div className="animate-pulse text-sm text-gray-500">
                  Redirecting to login...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Reset Your Password
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="block w-full rounded-xl shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm border-gray-300 dark:border-gray-600"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full rounded-xl shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm border-gray-300 dark:border-gray-600"
                  placeholder="Confirm your new password"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
