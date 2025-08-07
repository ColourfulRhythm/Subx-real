import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { auth } from '../../firebase'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth'
import VerificationSystem from '../../components/VerificationSystem'

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  terms: yup.bool().oneOf([true], 'You must agree to the terms'),
})

export default function InvestorSignup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const navigate = useNavigate()
  const provider = new GoogleAuthProvider()

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    try {
      // Create user with Firebase Auth for email signup
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user
      
      // Store user data for verification
      setCurrentUser(user)
      setShowVerification(true)
      
      // Store form data for later use
      localStorage.setItem('tempUserName', data.name)
      localStorage.setItem('tempUserType', 'investor')
      localStorage.setItem('tempUserEmail', data.email)
      localStorage.setItem('tempUserPassword', data.password)
      localStorage.setItem('tempSignupMethod', 'email')
      
      console.log('User created, showing verification system')
      
      // Send verification email immediately
      try {
        await sendEmailVerification(user)
        console.log('Verification email sent successfully')
      } catch (error) {
        console.error('Failed to send verification email:', error)
        // Don't block the flow, just log the error - user can resend from verification page
        setError(`Account created successfully, but failed to send verification email: ${error.message}. You can resend it from the verification page.`)
      }
      
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Store user data for verification
      setCurrentUser(user)
      setShowVerification(true)
      
      // Store form data for later use
      localStorage.setItem('tempUserName', user.displayName || user.email)
      localStorage.setItem('tempUserType', 'investor')
      
    } catch (error) {
      console.error('Google signup error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationComplete = () => {
    // Set authentication status after verification
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userType', 'investor')
    
    // Handle email - use from temp storage or current user
    const userEmail = localStorage.getItem('tempUserEmail') || (currentUser?.email) || ''
    localStorage.setItem('userEmail', userEmail)
    localStorage.setItem('userName', localStorage.getItem('tempUserName') || 'User')
    
    // Store Firebase UID for proper user data isolation
    if (currentUser?.uid) {
      localStorage.setItem('userId', currentUser.uid)
    }
    // Increment user count
    if (window.incrementSubxUserCount) {
      window.incrementSubxUserCount();
    }
    
    // Clean up temp data
    localStorage.removeItem('tempUserName')
    localStorage.removeItem('tempUserType')
    localStorage.removeItem('tempUserEmail')
    localStorage.removeItem('tempUserPassword')
    
    // Show success message
    alert('Verification complete! Welcome to Subx!')
    
    // Navigate to dashboard
    navigate('/dashboard/investor')
  }

  const handleBackToSignup = () => {
    setShowVerification(false)
    setCurrentUser(null)
    // Clean up the created user if they go back
    if (currentUser) {
      currentUser.delete()
    }
  }

  if (showVerification) {
    return (
      <VerificationSystem
        user={currentUser}
        onVerificationComplete={handleVerificationComplete}
        onBack={handleBackToSignup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
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
            Create Sub-owner Profile
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>



            {/* Password field - required for all signup methods */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center">
              <input
                {...register('terms')}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign up with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 