import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { supabase } from '../../supabase'
import Navbar from '../../components/Navbar'
// import VerificationSystem from '../../components/VerificationSystem'

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  referral_code: yup.string().optional(),
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

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers()
      
      if (checkError) {
        console.error('Error checking existing users:', checkError)
      } else {
        const userExists = existingUser.users.some(user => user.email === data.email)
        if (userExists) {
          setError('An account with this email already exists. Please try logging in instead.')
          setIsLoading(false)
          return
        }
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            user_type: 'investor'
          },
          emailRedirectTo: `${window.location.origin}/verify`
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please try logging in instead.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (authData.user) {
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: data.name
          })

        if (profileError) {
          console.warn('Profile creation warning:', profileError)
        }

        // Set referral code if provided
        if (data.referral_code) {
          try {
            const token = authData.session?.access_token;
            if (token) {
              await fetch('/api/referral/set-referral', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  referral_code: data.referral_code
                })
              });
            }
          } catch (referralError) {
            console.warn('Referral code setting warning:', referralError);
          }
        }

        // Store user info in localStorage (but not authenticated yet)
        localStorage.setItem('userType', 'investor')
        localStorage.setItem('userId', authData.user.id)
        localStorage.setItem('userEmail', authData.user.email)
        localStorage.setItem('userName', data.name)

        // Show verification message
        alert('Account created successfully! Please check your email and verify your account before logging in.')
        
        // Increment user count for landing page counter
        if (window.incrementSubxUserCount) {
          window.incrementSubxUserCount();
        }
        
        // Navigate to login page
        navigate('/login')
      }
    } catch (error) {
      setError('Failed to create account: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Google signup removed for now

  const handleVerificationComplete = () => {
    // Set authentication status after verification
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userType', 'investor')
    
    // Handle email - use from temp storage or current user
    const userEmail = localStorage.getItem('tempUserEmail') || (currentUser?.email) || ''
    localStorage.setItem('userEmail', userEmail)
    localStorage.setItem('userName', localStorage.getItem('tempUserName') || 'User')
    
          // Store Supabase ID for proper user data isolation
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

  // Verification system temporarily disabled
  // if (showVerification) {
  //   return (
  //     <VerificationSystem
  //       user={currentUser}
  //       onVerificationComplete={handleVerificationComplete}
  //       onBack={handleBackToSignup}
  //     />
  //   );
  // }

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
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                  errors.name 
                    ? 'border-red-500 dark:border-red-400' 
                    : register('name').value && register('name').value.length >= 2
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                  errors.email 
                    ? 'border-red-500 dark:border-red-400' 
                    : register('email').value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(register('email').value)
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>



            {/* Password field - required for all signup methods */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                    errors.password 
                      ? 'border-red-500 dark:border-red-400' 
                      : register('password').value && register('password').value.length >= 6
                      ? 'border-green-500 dark:border-green-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
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

            {/* Referral Code field - optional */}
            <div>
              <label htmlFor="referral_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Referral Code <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                {...register('referral_code')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Enter referral code (e.g., SUBX-AB12CD)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Have a friend's referral code? Enter it here to earn rewards when they make their first purchase.
              </p>
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

          {/* Google signup removed for now */}

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
    </div>
  )
} 