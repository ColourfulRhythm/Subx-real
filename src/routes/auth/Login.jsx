import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../firebase'
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import Navbar from '../../components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const { login, resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [userType] = useState('investor') // Always investor (sub-owner)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [showEmailResend, setShowEmailResend] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  // Form validation
  const isFormValid = email.trim() !== '' && password.trim() !== ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use Firebase authentication instead of Supabase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user) {
        // Check if email is verified
        if (!user.emailVerified) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.')
          setShowEmailResend(true)
          setIsLoading(false)
          return
        }

        // Store user info in localStorage for backward compatibility
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userType', 'investor') // Default to investor
        localStorage.setItem('userId', user.uid)
        localStorage.setItem('userEmail', user.email)
        
        console.log('User logged in with Firebase:', user.email)
        
        // Navigate to dashboard
        navigate('/dashboard/investor')
      }
    } catch (error) {
      console.error('Firebase login error:', error)
      setError('Invalid credentials. Please check your email and password.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setResetMessage('')
    setIsResetting(true)

    try {
      await resetPassword(resetEmail)
      setResetMessage('Password reset email sent! Check your inbox.')
      setResetEmail('')
      setTimeout(() => {
        setShowPasswordReset(false)
        setResetMessage('')
      }, 3000)
    } catch (error) {
      setResetMessage('Failed to send reset email: ' + error.message)
    } finally {
      setIsResetting(false)
    }
  }

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset)
    setResetEmail(email) // Pre-fill with current email
    setResetMessage('')
  }

  const handleResendEmail = async () => {
    setIsResendingEmail(true)
    setResendMessage('')

    try {
      // Get the current user to resend verification email
      const currentUser = auth.currentUser
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser)
        setResendMessage('Verification email sent! Check your inbox and spam folder.')
      } else {
        setResendMessage('No unverified user found. Please try logging in again.')
      }
    } catch (error) {
      setResendMessage(`Error: ${error.message}`)
    } finally {
      setIsResendingEmail(false)
    }
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
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            {showPasswordReset ? 'Reset Password' : 'Login'}
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (showPasswordReset) {
                setShowPasswordReset(false)
                setResetMessage('')
              } else {
                navigate('/')
              }
            }}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPasswordReset ? 'Back to Login' : 'Cancel'}
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10"
        >
          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{error}</p>
              {showEmailResend && (
                <div className="mt-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={isResendingEmail}
                    className="text-sm text-indigo-600 hover:text-indigo-500 underline disabled:opacity-50"
                  >
                    {isResendingEmail ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Resend Message */}
          {resendMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 border rounded-lg ${
                resendMessage.includes('sent') 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              <p className="text-sm">{resendMessage}</p>
            </motion.div>
          )}

          {/* Reset Message */}
          {resetMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 border rounded-lg ${
                resetMessage.includes('sent') 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              {resetMessage.includes('sent') ? (
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">📧 Check Your Email</h3>
                  <p className="text-sm text-green-700 mb-2">
                    We've sent a password reset link to <strong>{resetEmail}</strong>
                  </p>
                  <div className="text-sm text-green-600">
                    <p className="font-medium mb-1">Can't find the email?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Check your <strong>spam/junk folder</strong></li>
                      <li>Look for emails from "Subx" or "noreply@subxhq.com"</li>
                      <li>Wait a few minutes for delivery</li>
                      <li>Contact support at <a href="mailto:support@subxhq.com" className="underline">support@subxhq.com</a> if you still don't receive it</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{resetMessage}</p>
              )}
            </motion.div>
          )}

          {/* Password Reset Form */}
          {showPasswordReset ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="block w-full rounded-xl shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm border-gray-300 dark:border-gray-600"
                      placeholder="Enter your email"
                    />
                  </motion.div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isResetting || !resetEmail.trim()}
                  whileHover={resetEmail.trim() ? { scale: 1.02 } : {}}
                  whileTap={resetEmail.trim() ? { scale: 0.98 } : {}}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
                    resetEmail.trim() 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isResetting ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <>
              {/* Login for Sub-owners */}
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Login to your Sub-owner account
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full rounded-xl shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        email.trim() !== '' 
                          ? 'border-green-500 dark:border-green-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your email"
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <motion.div whileHover={{ scale: 1.02 }} className="mt-1">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`block w-full rounded-xl shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        password.trim() !== '' 
                          ? 'border-green-500 dark:border-green-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your password"
                    />
                  </motion.div>
                  
                  {/* Forgot Password Link */}
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={togglePasswordReset}
                      className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  whileHover={isFormValid ? { scale: 1.02 } : {}}
                  whileTap={isFormValid ? { scale: 0.98 } : {}}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white rounded-xl shadow-sm text-sm font-medium ${
                    isFormValid 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/signup/investor')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Sign up as Sub-owner
                  </button>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
      </div>
    </div>
  )
} 